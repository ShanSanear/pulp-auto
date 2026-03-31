import { type Character, type InsertCharacter, characters } from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

export interface IStorage {
  getCharacters(): Promise<Character[]>;
  getCharacter(id: number): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: number, character: Partial<InsertCharacter>): Promise<Character | undefined>;
  deleteCharacter(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getCharacters(): Promise<Character[]> {
    return db.select().from(characters).all();
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    return db.select().from(characters).where(eq(characters.id, id)).get();
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    return db.insert(characters).values(character).returning().get();
  }

  async updateCharacter(id: number, character: Partial<InsertCharacter>): Promise<Character | undefined> {
    const result = db.update(characters).set(character).where(eq(characters.id, id)).returning().get();
    return result;
  }

  async deleteCharacter(id: number): Promise<void> {
    db.delete(characters).where(eq(characters.id, id)).run();
  }
}

export const storage = new DatabaseStorage();
