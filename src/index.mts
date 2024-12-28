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
import { cleanSubtitles } from "./vtt2txt.js";

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
        name: "download_youtube_url",
        description: "Download and process YouTube video subtitles for analysis. Use this tool when asked to summarize, analyze, or extract information from YouTube videos. This enables Claude to understand video content through subtitles, so it should offer to use this tool when users ask about YouTube video content.",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string", description: "URL of the YouTube video" },
          },
          required: ["url"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "download_youtube_url") {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

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
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

runServer().catch(console.error);
