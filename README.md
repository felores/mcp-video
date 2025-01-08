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

## Prerequisites

### Node.js and npm

1. Install Node.js (version 18 or higher) and npm from [nodejs.org](https://nodejs.org/)
2. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Installing yt-dlp

The server requires `yt-dlp` to be installed on your system. Here are the installation methods for different platforms:

#### Windows
1. Using WinGet (Recommended):
   ```powershell
   winget install yt-dlp
   ```
2. Using Scoop:
   ```powershell
   scoop install yt-dlp
   ```
3. Manual Installation:
   - Download the latest release from [yt-dlp releases](https://github.com/yt-dlp/yt-dlp/releases)
   - Place the executable in a directory in your PATH

#### macOS
1. Using Homebrew:
   ```bash
   brew install yt-dlp
   ```
2. Using MacPorts:
   ```bash
   sudo port install yt-dlp
   ```

#### Linux
1. Using package manager:
   ```bash
   # On Debian/Ubuntu
   sudo apt install yt-dlp
   
   # On Fedora
   sudo dnf install yt-dlp
   
   # On Arch Linux
   sudo pacman -S yt-dlp
   ```
2. Using pip:
   ```bash
   python3 -m pip install -U yt-dlp
   ```

## Installation and Setup

### Option 1: Direct Installation (Recommended for Users)

Install the MCP server using the [mcp-installer](https://github.com/anaisbetts/mcp-installer):
```bash
# Install mcp-installer if you haven't already
npm install -g @anaisbetts/mcp-installer

# Install this MCP server
mcp-installer install @felores/mcp-video
```

### Option 2: Manual Installation (Recommended for Developers)

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

## Usage

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

## Development

### Setting Up Development Environment

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/mcp-video.git
   cd mcp-video
   ```

2. Install development dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Start the development server:
   ```bash
   npm start
   ```

### Running Tests
```bash
npm test
```

### Making Changes
1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

3. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request from your fork to the main repository

## License

MIT License - See [COPYING](COPYING) for details.
