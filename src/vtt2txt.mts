export function cleanSubtitles(vttContent: string): string {
    // Split into lines
    const lines = vttContent.split('\n');
    const cleanedText = new Set<string>(); // Use Set to remove duplicates

    for (let line of lines) {
        // Skip WebVTT header, timestamps, and empty lines
        if (line.trim() === 'WEBVTT' || line.trim() === '' || /^\d{2}:\d{2}/.test(line)) {
            continue;
        }

        // Remove HTML-style tags and clean the text
        line = line.replace(/<[^>]*>/g, '')
                  .replace(/\[.*?\]/g, '') // Remove square brackets and their contents
                  .trim();
        
        // If we have actual text, add it
        if (line) {
            cleanedText.add(line);
        }
    }

    // Convert Set back to array and join with newlines
    return Array.from(cleanedText).join('\n');
} 