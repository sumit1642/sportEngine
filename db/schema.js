import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/*
Created by AI

// Define the 'demo_users' table
export const demoUsers = pgTable("demo_users", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
// Export types for type-safe queries
export const User = demoUsers.$inferSelect;
export const NewUser = demoUsers.$inferInsert;
*/
