import React, { useState } from "react";
import VideoPlayer from "@/components/video-player";
import PlaylistSidebar from "@/components/playlist-sidebar";
import AccountManager from "@/components/account-manager";
import AutomationControls from "@/components/automation-controls";
import StatisticsPanel from "@/components/statistics-panel";
import { useQuery } from "@tanstack/react-query";
import { FaYoutube, FaCog } from "react-icons/fa";
import type { Video, Account } from "@shared/schema";

export default function Dashboard() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isAutomationRunning, setIsAutomationRunning] = useState(false);
  const [showAccountManager, setShowAccountManager] = useState(false);

  const { data: videos = [] } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
  });

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const currentVideo = videos[currentVideoIndex];
  const currentAccount = accounts.find(acc => acc.status === "active") || accounts[0];

  const handleVideoSelect = (index: number) => {
    setCurrentVideoIndex(index);
  };

  const handleNextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else {
      setCurrentVideoIndex(0); // Loop back to start
    }
  };

  return (
    <div className="min-h-screen youtube-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FaYoutube className="text-2xl youtube-red" />
                <h1 className="text-xl font-bold youtube-text">Auto Viewer</h1>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${isAutomationRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-sm text-gray-600">
                  {isAutomationRunning ? 'Running' : 'Ready'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <span>{currentAccount?.email || 'No account'}</span>
                <span className="text-gray-400">|</span>
                <span>{accounts.length} accounts</span>
              </div>
              <button 
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                onClick={() => setShowAccountManager(!showAccountManager)}
              >
                <FaCog />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <VideoPlayer 
              video={currentVideo}
              isAutomationRunning={isAutomationRunning}
              onVideoEnd={handleNextVideo}
            />
            <div className="mt-6">
              <AutomationControls
                isRunning={isAutomationRunning}
                onToggle={setIsAutomationRunning}
                currentVideoIndex={currentVideoIndex}
                totalVideos={videos.length}
              />
            </div>
            <div className="mt-6">
              <StatisticsPanel />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <PlaylistSidebar
              videos={videos}
              currentVideoIndex={currentVideoIndex}
              onVideoSelect={handleVideoSelect}
            />
          </div>
        </div>
      </div>

      {/* Account Manager Modal */}
      {showAccountManager && (
        <AccountManager onClose={() => setShowAccountManager(false)} />
      )}
    </div>
  );
}
