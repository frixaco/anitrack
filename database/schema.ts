import { relations } from "drizzle-orm";
import { serial, text, timestamp, integer, pgTable } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const schema = {
  users,
};
