export interface YouTubeVideoInfo {
  id: string;
  title: string;
  channel: string;
  duration: string;
  thumbnailUrl: string;
}

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    /^[a-zA-Z0-9_-]{11}$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }

  return null;
}

export function getEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=1&modestbranding=1&rel=0`;
}

export function getThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export async function fetchVideoInfo(videoId: string): Promise<YouTubeVideoInfo | null> {
  try {
    // In a real implementation, you would use the YouTube Data API
    // For now, we'll extract basic info from the oEmbed endpoint
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch video info');
    }

    const data = await response.json();
    
    return {
      id: videoId,
      title: data.title || 'Unknown Title',
      channel: data.author_name || 'Unknown Channel',
      duration: '0:00', // Duration not available from oEmbed
      thumbnailUrl: getThumbnailUrl(videoId),
    };
  } catch (error) {
    console.error('Error fetching video info:', error);
    return null;
  }
}

export function validateYouTubeUrl(url: string): boolean {
  return extractVideoId(url) !== null;
}
