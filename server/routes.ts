import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCharacterSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/characters", async (_req, res) => {
    const characters = await storage.getCharacters();
    res.json(characters);
  });

  app.get("/api/characters/:id", async (req, res) => {
    const character = await storage.getCharacter(Number(req.params.id));
    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }
    res.json(character);
  });

  app.post("/api/characters", async (req, res) => {
    const parsed = insertCharacterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid character data", errors: parsed.error.errors });
    }
    const character = await storage.createCharacter(parsed.data);
    res.status(201).json(character);
  });

  app.patch("/api/characters/:id", async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getCharacter(id);
    if (!existing) {
      return res.status(404).json({ message: "Character not found" });
    }
    const character = await storage.updateCharacter(id, req.body);
    res.json(character);
  });

  app.delete("/api/characters/:id", async (req, res) => {
    const id = Number(req.params.id);
    await storage.deleteCharacter(id);
    res.status(204).send();
  });

  return httpServer;
}
