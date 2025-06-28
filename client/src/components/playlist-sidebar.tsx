import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { extractVideoId, fetchVideoInfo } from "@/lib/youtube";
import { cn } from "@/lib/utils";
import type { Video } from "@shared/schema";

interface PlaylistSidebarProps {
  videos: Video[];
  currentVideoIndex: number;
  onVideoSelect: (index: number) => void;
}

export default function PlaylistSidebar({ 
  videos, 
  currentVideoIndex, 
  onVideoSelect 
}: PlaylistSidebarProps) {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addVideoMutation = useMutation({
    mutationFn: async (url: string) => {
      const videoId = extractVideoId(url);
      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }

      const videoInfo = await fetchVideoInfo(videoId);
      if (!videoInfo) {
        throw new Error("Could not fetch video information");
      }

      return apiRequest("POST", "/api/videos", {
        youtubeId: videoInfo.id,
        title: videoInfo.title,
        channel: videoInfo.channel,
        duration: videoInfo.duration,
        thumbnailUrl: videoInfo.thumbnailUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      setYoutubeUrl("");
      toast({
        title: "Video added",
        description: "Video has been added to your playlist.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add video to playlist.",
        variant: "destructive",
      });
    },
  });

  const handleAddVideo = () => {
    if (!youtubeUrl.trim()) return;
    addVideoMutation.mutate(youtubeUrl);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddVideo();
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Video */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Video</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            type="url"
            placeholder="YouTube URL"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={addVideoMutation.isPending}
          />
          <Button
            onClick={handleAddVideo}
            disabled={!youtubeUrl.trim() || addVideoMutation.isPending}
            className="w-full bg-youtube-red hover:bg-red-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {addVideoMutation.isPending ? "Adding..." : "Add to Playlist"}
          </Button>
        </CardContent>
      </Card>

      {/* Playlist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            Playlist
            <span className="text-sm text-gray-500 font-normal">
              {videos.length} videos
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {videos.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              No videos in playlist
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  className={cn(
                    "flex space-x-3 p-2 rounded cursor-pointer transition-colors",
                    index === currentVideoIndex 
                      ? "bg-red-50 border border-red-200" 
                      : "hover:bg-gray-50"
                  )}
                  onClick={() => onVideoSelect(index)}
                >
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-16 h-12 object-cover rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium youtube-text truncate">
                      {video.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {video.channel}
                    </p>
                    <p className="text-xs text-gray-400">
                      {video.duration}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
