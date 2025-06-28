import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Clock, Users, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Statistics {
  videosWatched: number;
  totalTime: number;
  activeAccounts: number;
  playlistSize: number;
}

export default function StatisticsPanel() {
  const { data: stats } = useQuery<Statistics>({
    queryKey: ["/api/statistics"],
  });

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      icon: Play,
      label: "Videos Watched",
      value: stats.videosWatched,
      color: "youtube-red",
      bgColor: "bg-red-50",
    },
    {
      icon: Clock,
      label: "Total Time",
      value: `${stats.totalTime}h`,
      color: "youtube-blue",
      bgColor: "bg-blue-50",
    },
    {
      icon: Users,
      label: "Active Accounts",
      value: stats.activeAccounts,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: List,
      label: "Playlist Size",
      value: stats.playlistSize,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className={`p-2 ${item.bgColor} rounded-lg`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{item.label}</p>
                <p className="text-lg font-semibold youtube-text">{item.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
