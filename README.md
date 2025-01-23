# Video MCP Server

A powerful Model Context Protocol (MCP) server that enables AI assistants like Claude to work with video content. This server provides capabilities for downloading video transcripts in plain text and videos from various platforms including YouTube, Vimeo, Twitter/X, and TikTok.

This project is a fork from anaisbetts/mcp-youtube which only outputs the transcript with timestamps. This project outputs the transcript in plain text without timestamps for easy LLM consumption and adds the download tool.

## Features

- Download and process video subtitles/closed captions for AI analysis
- Download videos in high quality (up to 1080p)
- Support for multiple platforms:
  - YouTube
  - Vimeo
  - Twitter/X
  - TikTok
  - And more platforms supported by yt-dlp

## Prerequisites

Before installing the MCP server, make sure you have the following prerequisites:

### 1. yt-dlp (Required)

The server requires [yt-dlp](https://github.com/yt-dlp/yt-dlp) to be installed on your system first. Here are the installation methods for different platforms:

#### Windows
Using WinGet (Recommended):
   ```powershell
   winget install yt-dlp
   ```
#### macOS
Using Homebrew:
   ```bash
   brew install yt-dlp
   ```
#### Linux
Using package manager:
   ```bash
   sudo apt install yt-dlp
   ```

### 2. Node.js and npm

1. Install Node.js (version 18 or higher) and npm from [nodejs.org](https://nodejs.org/)
2. Verify installation:
   ```bash
   node --version
   npm --version
   ```

## Installation and Setup

After installing the prerequisites above, you can install the MCP server using one of these methods:

### Option 1: NPX Installation (Recommended)

Add the following to your `claude_desktop_config.json`:

```bash
{
  "mcpServers": {    
    "video": {
      "command": "npx",
      "args": [
        "@felores/mcp-video"
      ],
      "env": {
        "DOWNLOADS_DIR": "path/to/downloads"
      }
    }
  }
}
```
Replace `path/to/downloads` with the path to your desired downloads directory.

This will automatically install and run the latest version of the server.

### Option 2: Using MCP Installer

Install the [mcp-installer](https://github.com/anaisbetts/mcp-installer), restart Claude, and prompt claude to install the Video MCP Server:
```bash
Install @felores/mcp-video with environment DOWNLOADS_DIR set to path/to/downloads
```
Modify path/to/downloads to your desired downloads directory system path.

### Option 3: Manual Installation (For Developers)

1. Clone the repository:
   ```bash
   git clone https://github.com/felores/mcp-video.git
   cd mcp-video
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Start the server:
   ```bash
   npm start
   ```

Add the following to your `claude_desktop_config.json`:

```bash
{
"mcpServers": {    
   "video": {
      "command": "node",
      "args": ["path/to/mcp-video/lib/index.mjs"],
      "env": {
        "DOWNLOADS_DIR": "path/to/downloads"
      }
    }
  }
}
```
## Usage

## MCP Tools

This server provides two powerful tools that can be used by AI assistants through the Model Context Protocol:

### 1. Video Transcript Tool (`get_video_transcript`)
- Downloads and processes video subtitles/closed captions into plain text format
- Removes timestamps and formatting for easy AI consumption
- Supports auto-generated captions when available
- Works with multiple languages (defaults to English)
- Input: Video URL from any supported platform
- Output: Clean, plain text transcript ready for AI analysis

### 2. Video Download Tool (`download_video`)
- Downloads videos in high quality (limited to 1080p for reasonable file sizes)
- Automatically selects the best quality format
- Merges video and audio streams when necessary
- Saves files to a configurable downloads directory
- Input: 
  - Video URL from any supported platform
  - Optional filename (recommended format: platform-id, e.g., 'youtube-MhOTvvmlqLM')
- Output: 
  - Downloaded video file in MP4 format
  - File information including title, duration, resolution, and file size

Once installed, you can use this server through any MCP-compatible client (like Claude.ai). Here are some example prompts:

1. To analyze a video's content:
   ```
   Summarize the YouTube video https://youtube.com/watch?v=VIDEO_ID
   ```

2. To get specific information:
   ```
   What are the main points discussed in this video: https://youtube.com/watch?v=VIDEO_ID
   ```

The server will automatically:
1. Download the video's subtitles/closed captions
2. Process and clean the text
3. Make it available to the AI assistant for analysis

## Environment Variables

- `DOWNLOADS_DIR`: Specify a custom directory for downloaded videos (default: `./downloads`)

## Reference

### Supported Platforms
- YouTube
- Vimeo
- Twitter/X
- TikTok
- And any platform supported by [yt-dlp](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)

### Dependencies
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Video downloader
- [Model Context Protocol](https://github.com/anaisbetts/mcp) - AI communication protocol

## License

MIT License - See [COPYING](COPYING) for details.
