import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getEmbedUrl } from "@/lib/youtube";
import type { Video } from "@shared/schema";

interface VideoPlayerProps {
  video?: Video;
  isAutomationRunning: boolean;
  onVideoEnd: () => void;
}

export default function VideoPlayer({ video, isAutomationRunning, onVideoEnd }: VideoPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [viewingTimer, setViewingTimer] = useState<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteVideoMutation = useMutation({
    mutationFn: (videoId: number) => apiRequest("DELETE", `/api/videos/${videoId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      toast({
        title: "Video removed",
        description: "Video has been removed from your playlist.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove video from playlist.",
        variant: "destructive",
      });
    },
  });

  const recordViewingSession = useMutation({
    mutationFn: (data: { videoId: number; accountId: number; duration: number }) =>
      apiRequest("POST", "/api/viewing-sessions", data),
  });

  useEffect(() => {
    if (isAutomationRunning && video) {
      const timer = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          if (newTime >= 40) {
            // Record viewing session
            recordViewingSession.mutate({
              videoId: video.id,
              accountId: 1, // This should be the current active account
              duration: 40,
            });
            
            // Move to next video
            onVideoEnd();
            return 0;
          }
          return newTime;
        });
      }, 1000);

      setViewingTimer(timer);

      return () => {
        if (timer) {
          clearInterval(timer);
        }
      };
    } else {
      if (viewingTimer) {
        clearInterval(viewingTimer);
        setViewingTimer(null);
      }
      setCurrentTime(0);
    }
  }, [isAutomationRunning, video, onVideoEnd]);

  const handleRemoveVideo = () => {
    if (video) {
      deleteVideoMutation.mutate(video.id);
    }
  };

  if (!video) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <p className="text-gray-500">No video selected</p>
          </div>
          <p className="text-gray-600">Add videos to your playlist to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="aspect-video bg-black relative">
          <iframe
            ref={iframeRef}
            src={getEmbedUrl(video.youtubeId)}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          {isAutomationRunning && (
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm">
              {currentTime}s / 40s
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-lg font-medium youtube-text mb-1">
                {video.title}
              </h2>
              <p className="text-sm text-gray-600">{video.channel}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveVideo}
              disabled={deleteVideoMutation.isPending}
              className="text-gray-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
