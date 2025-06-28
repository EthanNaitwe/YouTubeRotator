import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Square } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Settings } from "@shared/schema";

interface AutomationControlsProps {
  isRunning: boolean;
  onToggle: (running: boolean) => void;
  currentVideoIndex: number;
  totalVideos: number;
}

export default function AutomationControls({ 
  isRunning, 
  onToggle, 
  currentVideoIndex, 
  totalVideos 
}: AutomationControlsProps) {
  const queryClient = useQueryClient();

  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (updates: Partial<Settings>) => 
      apiRequest("PATCH", "/api/settings", updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
  });

  const handleStart = () => {
    onToggle(true);
  };

  const handlePause = () => {
    onToggle(false);
  };

  const handleStop = () => {
    onToggle(false);
  };

  const handleSettingChange = (key: keyof Settings, value: any) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  if (!settings) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Main Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Button 
                onClick={handleStart}
                disabled={isRunning || totalVideos === 0}
                className="bg-youtube-red hover:bg-red-600 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Automation
              </Button>
              <Button 
                variant="outline"
                onClick={handlePause}
                disabled={!isRunning}
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button 
                variant="outline"
                onClick={handleStop}
                disabled={!isRunning}
              >
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              {currentVideoIndex + 1} / {totalVideos}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium youtube-text mb-3">Automation Settings</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-gray-600 mb-2 block">
                View Duration: {settings.viewDuration}s
              </Label>
              <Slider
                value={[settings.viewDuration]}
                onValueChange={([value]) => handleSettingChange('viewDuration', value)}
                min={10}
                max={120}
                step={5}
                className="w-full"
              />
            </div>

            <div>
              <Label className="text-sm text-gray-600 mb-1 block">
                Account Switch Interval
              </Label>
              <Select 
                value={settings.accountSwitchInterval.toString()}
                onValueChange={(value) => handleSettingChange('accountSwitchInterval', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Every video</SelectItem>
                  <SelectItem value="3">Every 3 videos</SelectItem>
                  <SelectItem value="5">Every 5 videos</SelectItem>
                  <SelectItem value="10">Every 10 videos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm text-gray-600">Auto-shuffle playlist</Label>
              <Switch
                checked={settings.autoShuffle}
                onCheckedChange={(checked) => handleSettingChange('autoShuffle', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm text-gray-600">Loop playlist</Label>
              <Switch
                checked={settings.loopPlaylist}
                onCheckedChange={(checked) => handleSettingChange('loopPlaylist', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
