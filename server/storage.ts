import { 
  videos, 
  accounts, 
  viewingSessions, 
  settings,
  type Video, 
  type InsertVideo,
  type Account,
  type InsertAccount,
  type ViewingSession,
  type InsertViewingSession,
  type Settings,
  type InsertSettings
} from "@shared/schema";

export interface IStorage {
  // Videos
  getVideos(): Promise<Video[]>;
  getVideo(id: number): Promise<Video | undefined>;
  getVideoByYoutubeId(youtubeId: string): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  deleteVideo(id: number): Promise<boolean>;

  // Accounts
  getAccounts(): Promise<Account[]>;
  getAccount(id: number): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: number, updates: Partial<Account>): Promise<Account | undefined>;
  deleteAccount(id: number): Promise<boolean>;

  // Viewing Sessions
  getViewingSessions(): Promise<ViewingSession[]>;
  createViewingSession(session: InsertViewingSession): Promise<ViewingSession>;

  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<InsertSettings>): Promise<Settings>;

  // Statistics
  getStatistics(): Promise<{
    videosWatched: number;
    totalTime: number;
    activeAccounts: number;
    playlistSize: number;
  }>;
}

export class MemStorage implements IStorage {
  private videos: Map<number, Video> = new Map();
  private accounts: Map<number, Account> = new Map();
  private viewingSessions: Map<number, ViewingSession> = new Map();
  private settings: Settings = {
    id: 1,
    viewDuration: 40,
    accountSwitchInterval: 3,
    autoShuffle: false,
    loopPlaylist: true,
  };
  private currentVideoId = 1;
  private currentAccountId = 1;
  private currentSessionId = 1;

  async getVideos(): Promise<Video[]> {
    return Array.from(this.videos.values()).sort((a, b) => 
      new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    );
  }

  async getVideo(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async getVideoByYoutubeId(youtubeId: string): Promise<Video | undefined> {
    return Array.from(this.videos.values()).find(v => v.youtubeId === youtubeId);
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const video: Video = {
      ...insertVideo,
      id: this.currentVideoId++,
      addedAt: new Date(),
    };
    this.videos.set(video.id, video);
    return video;
  }

  async deleteVideo(id: number): Promise<boolean> {
    return this.videos.delete(id);
  }

  async getAccounts(): Promise<Account[]> {
    return Array.from(this.accounts.values()).filter(a => a.isActive);
  }

  async getAccount(id: number): Promise<Account | undefined> {
    return this.accounts.get(id);
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const account: Account = {
      ...insertAccount,
      id: this.currentAccountId++,
      lastUsed: null,
      isActive: true,
    };
    this.accounts.set(account.id, account);
    return account;
  }

  async updateAccount(id: number, updates: Partial<Account>): Promise<Account | undefined> {
    const account = this.accounts.get(id);
    if (!account) return undefined;
    
    const updatedAccount = { ...account, ...updates };
    this.accounts.set(id, updatedAccount);
    return updatedAccount;
  }

  async deleteAccount(id: number): Promise<boolean> {
    const account = this.accounts.get(id);
    if (!account) return false;
    
    const updatedAccount = { ...account, isActive: false };
    this.accounts.set(id, updatedAccount);
    return true;
  }

  async getViewingSessions(): Promise<ViewingSession[]> {
    return Array.from(this.viewingSessions.values());
  }

  async createViewingSession(insertSession: InsertViewingSession): Promise<ViewingSession> {
    const session: ViewingSession = {
      ...insertSession,
      id: this.currentSessionId++,
      viewedAt: new Date(),
    };
    this.viewingSessions.set(session.id, session);
    return session;
  }

  async getSettings(): Promise<Settings> {
    return this.settings;
  }

  async updateSettings(updates: Partial<InsertSettings>): Promise<Settings> {
    this.settings = { ...this.settings, ...updates };
    return this.settings;
  }

  async getStatistics(): Promise<{
    videosWatched: number;
    totalTime: number;
    activeAccounts: number;
    playlistSize: number;
  }> {
    const sessions = Array.from(this.viewingSessions.values());
    const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);
    const activeAccounts = Array.from(this.accounts.values()).filter(a => a.isActive).length;
    
    return {
      videosWatched: sessions.length,
      totalTime: Math.round(totalTime / 3600 * 10) / 10, // Hours with 1 decimal
      activeAccounts,
      playlistSize: this.videos.size,
    };
  }
}

export const storage = new MemStorage();
