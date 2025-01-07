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
const DOWNLOADS_DIR = process.env.YOUTUBE_DOWNLOADS_DIR || path.join(process.cwd(), "downloads");
console.error('Using downloads directory:', DOWNLOADS_DIR);

const server = new Server(
  {
    name: "mcp-youtube",
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
        name: "transcript_youtube_url",
        description: "Download and process YouTube video subtitles for analysis. Use this tool when asked to summarize, analyze, or extract information from YouTube videos. This enables Claude to understand video content through subtitles, so it should offer to use this tool when users ask about YouTube video content.",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string", description: "URL of the YouTube video" },
          },
          required: ["url"],
        },
      },
      {
        name: "download_video",
        description: "Download YouTube video in best quality (limited to 1080p). Downloads are stored in the downloads directory.",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string", description: "URL of the YouTube video" },
            filename: { type: "string", description: "Optional custom filename for the downloaded video" },
          },
          required: ["url"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "transcript_youtube_url") {
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
          "((bv*[height<=1080])/bv*)+ba/b",
          "--merge-output-format",
          "mp4",
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
