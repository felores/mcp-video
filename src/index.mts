#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import { spawnPromise } from "spawn-rx";
import { rimraf } from "rimraf";
import { cleanSubtitles } from "./vtt2txt.mjs";

// Get downloads directory from env or default to project root
const DOWNLOADS_DIR = process.env.DOWNLOADS_DIR || path.join(process.cwd(), "downloads");
console.error('Using downloads directory:', DOWNLOADS_DIR);

const server = new Server(
  {
    name: "mcp-video",
    version: "0.5.1",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_video_transcript",
        description: "Download and process video subtitles for analysis from various platforms (YouTube, Vimeo, Twitter/X, TikTok, etc.) using yt-dlp. Use this tool when asked to summarize, analyze, or extract information from any video that has subtitles/closed captions. This enables Claude to understand video content through subtitles.",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string", description: "URL of the video from any supported platform (YouTube, Vimeo, Twitter/X, TikTok, etc.)" },
          },
          required: ["url"],
        },
      },
      {
        name: "download_video",
        description: "Download video in best quality (limited to 1080p) from various platforms (YouTube, Vimeo, Twitter/X, TikTok, etc.) using yt-dlp. Downloads are stored in the downloads directory. IMPORTANT: Clients should always provide a sanitized filename using the platform and video ID format to ensure consistent naming and avoid conflicts.",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string", description: "URL of the video from any supported platform (YouTube, Vimeo, Twitter/X, TikTok, etc.)" },
            filename: { 
              type: "string", 
              description: "Sanitized filename using platform-id format. Examples:\n- YouTube: youtube-{video_id} (e.g. 'youtube-MhOTvvmlqLM' from youtube.com/watch?v=MhOTvvmlqLM)\n- Twitter/X: x-{tweet_id} (e.g. 'x-1876565449615217019' from x.com/user/status/1876565449615217019)\n- Vimeo: vimeo-{video_id} (e.g. 'vimeo-123456789' from vimeo.com/123456789)" 
            },
          },
          required: ["url"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_video_transcript") {
    try {
      const { url } = request.params.arguments as { url: string };

      const tempDir = fs.mkdtempSync(`${os.tmpdir()}${path.sep}youtube-`);
      await spawnPromise(
        "yt-dlp",
        [
          "--write-sub",
          "--write-auto-sub",
          "--sub-lang",
          "en",
          "--skip-download",
          "--sub-format",
          "srt",
          url,
        ],
        { cwd: tempDir, detached: true }
      );

      let content = "";
      try {
        fs.readdirSync(tempDir).forEach((file) => {
          const fileContent = fs.readFileSync(path.join(tempDir, file), "utf8");
          const cleanedContent = cleanSubtitles(fileContent);
          content += `${cleanedContent}\n\n`;
        });
      } finally {
        rimraf.sync(tempDir);
      }

      return {
        content: [
          {
            type: "text",
            text: content,
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `Error downloading video: ${err}`,
          },
        ],
        isError: true,
      };
    }
  } else if (request.params.name === "download_video") {
    try {
      const { url, filename } = request.params.arguments as { url: string; filename?: string };
      
      // Create downloads directory if it doesn't exist
      try {
        if (!fs.existsSync(DOWNLOADS_DIR)) {
          fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
        }
        console.error('Downloads directory created/verified at:', DOWNLOADS_DIR);
      } catch (err) {
        console.error('Error creating downloads directory:', err);
        throw err;
      }

      // Get video info first
      const infoResult = await spawnPromise(
        "yt-dlp",
        [
          "--print",
          "%(title)s",
          "--print",
          "%(duration)s",
          "--print",
          "%(resolution)s",
          url,
        ]
      );

      const [title, duration, resolution] = infoResult.split("\n");
      
      // Prepare output template with absolute path
      const outputTemplate = filename ? 
        path.join(DOWNLOADS_DIR, `${filename}.mp4`) : 
        path.join(DOWNLOADS_DIR, "%(title)s.%(ext)s");

      // Download the video
      await spawnPromise(
        "yt-dlp",
        [
          "-f",
          "bv*+ba/b",
          "--progress",
          "--progress-template",
          "download:[download] %(progress._percent_str)s of %(progress._total_bytes_str)s at %(progress._speed_str)s ETA %(progress._eta_str)s",
          "-o",
          outputTemplate,
          url,
        ]
      );

      // Get the final file size
      const finalPath = filename ? 
        path.join(DOWNLOADS_DIR, `${filename}.mp4`) : 
        path.join(DOWNLOADS_DIR, `${title}.mp4`);
      const stats = fs.statSync(finalPath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      return {
        content: [
          {
            type: "text",
            text: `Successfully downloaded video:
Title: ${title}
Duration: ${duration} seconds
Resolution: ${resolution}
File size: ${fileSizeMB} MB
Saved to: ${finalPath}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `Error downloading video: ${err}`,
          },
        ],
        isError: true,
      };
    }
  } else {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

runServer().catch(console.error);
