import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const characters = sqliteTable("characters", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  firearmSkillSmg: integer("firearm_skill_smg").notNull().default(15),
  firearmSkillMg: integer("firearm_skill_mg").notNull().default(10),
  weaponName: text("weapon_name").notNull().default("Thompson M1928"),
  weaponDamage: text("weapon_damage").notNull().default("1d10+2"),
  weaponMagazine: integer("weapon_magazine").notNull().default(20),
  weaponType: text("weapon_type").notNull().default("smg"), // 'smg' | 'mg'
  weaponMalfunction: integer("weapon_malfunction").notNull().default(96),
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
});

export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof characters.$inferSelect;
