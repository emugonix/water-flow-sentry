import { db } from "@db";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "@db";
import { WebSocket } from "ws";

const PostgresSessionStore = connectPg(session);

// Interface for storage operations
export interface IStorage {
  getUser(id: number): Promise<schema.User>;
  getUserByUsername(username: string): Promise<schema.User | undefined>;
  createUser(user: schema.InsertUser): Promise<schema.User>;
  sessionStore: session.SessionStore;
  addClient(ws: WebSocket): void;
  removeClient(ws: WebSocket): void;
  broadcastMessage(message: any): void;
}

class DatabaseStorage implements IStorage {
  private clients: Set<WebSocket> = new Set();
  public sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'user_sessions'
    });
  }

  async getUser(id: number): Promise<schema.User> {
    const users = await db.select().from(schema.users).where(eq(schema.users.id, id));
    if (users.length === 0) {
      throw new Error(`User with ID ${id} not found`);
    }
    return users[0];
  }

  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return users[0];
  }

  async createUser(user: schema.InsertUser): Promise<schema.User> {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }

  addClient(ws: WebSocket): void {
    this.clients.add(ws);
    console.log(`WebSocket client connected. Total clients: ${this.clients.size}`);
  }

  removeClient(ws: WebSocket): void {
    this.clients.delete(ws);
    console.log(`WebSocket client disconnected. Total clients: ${this.clients.size}`);
  }

  broadcastMessage(message: any): void {
    const messageString = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      }
    });
  }
}

// Export a singleton instance of the storage
export const storage = new DatabaseStorage();
