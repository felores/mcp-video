# Multi-Platform Video MCP Server

A powerful Model Context Protocol (MCP) server that enables AI assistants like Claude to work with video content. This server provides capabilities for downloading video transcripts and videos from various platforms including YouTube, Vimeo, Twitter/X, and TikTok.

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
mcp-installer install @anaisbetts/mcp-youtube
```

### Option 2: Manual Installation (Recommended for Developers)

1. Clone the repository:
   ```bash
   git clone https://github.com/felores/mcp-video.git
   cd mcp-video
   ```

2. Create and activate a new Node.js environment:
   ```bash
   # Create a new directory for the project (if not already done)
   mkdir mcp-video-env
   cd mcp-video-env

   # Initialize a new Node.js project
   npm init -y
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. Start the server:
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