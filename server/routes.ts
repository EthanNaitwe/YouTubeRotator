import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVideoSchema, insertAccountSchema, insertViewingSessionSchema, insertSettingsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Videos
  app.get("/api/videos", async (req, res) => {
    try {
      const videos = await storage.getVideos();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.post("/api/videos", async (req, res) => {
    try {
      const video = insertVideoSchema.parse(req.body);
      
      // Check if video already exists
      const existing = await storage.getVideoByYoutubeId(video.youtubeId);
      if (existing) {
        return res.status(409).json({ message: "Video already exists in playlist" });
      }

      const newVideo = await storage.createVideo(video);
      res.status(201).json(newVideo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid video data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to add video" });
      }
    }
  });

  app.delete("/api/videos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteVideo(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Video not found" });
      }

      res.json({ message: "Video deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete video" });
    }
  });

  // Accounts
  app.get("/api/accounts", async (req, res) => {
    try {
      const accounts = await storage.getAccounts();
      // Don't send passwords to frontend
      const safeAccounts = accounts.map(({ password, ...account }) => account);
      res.json(safeAccounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  app.post("/api/accounts", async (req, res) => {
    try {
      const account = insertAccountSchema.parse(req.body);
      const newAccount = await storage.createAccount(account);
      
      // Don't send password to frontend
      const { password, ...safeAccount } = newAccount;
      res.status(201).json(safeAccount);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid account data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to add account" });
      }
    }
  });

  app.patch("/api/accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedAccount = await storage.updateAccount(id, updates);
      if (!updatedAccount) {
        return res.status(404).json({ message: "Account not found" });
      }

      // Don't send password to frontend
      const { password, ...safeAccount } = updatedAccount;
      res.json(safeAccount);
    } catch (error) {
      res.status(500).json({ message: "Failed to update account" });
    }
  });

  app.delete("/api/accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAccount(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Account not found" });
      }

      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Viewing Sessions
  app.post("/api/viewing-sessions", async (req, res) => {
    try {
      const session = insertViewingSessionSchema.parse(req.body);
      const newSession = await storage.createViewingSession(session);
      res.status(201).json(newSession);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid session data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to record viewing session" });
      }
    }
  });

  // Settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", async (req, res) => {
    try {
      const updates = req.body;
      const settings = await storage.updateSettings(updates);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Statistics
  app.get("/api/statistics", async (req, res) => {
    try {
      const stats = await storage.getStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
