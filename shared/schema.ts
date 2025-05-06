import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").default("User"),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
});

// Sensors table
export const sensors = pgTable("sensors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  maxThreshold: decimal("max_threshold", { precision: 10, scale: 2 }).notNull().default("10"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSensorSchema = createInsertSchema(sensors);

// Sensor readings table
export const sensorReadings = pgTable("sensor_readings", {
  id: serial("id").primaryKey(),
  sensorId: integer("sensor_id").references(() => sensors.id).notNull(),
  flowRate: decimal("flow_rate", { precision: 10, scale: 2 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertSensorReadingSchema = createInsertSchema(sensorReadings);

// Valve status table
export const valveStatus = pgTable("valve_status", {
  id: serial("id").primaryKey(),
  isOpen: boolean("is_open").notNull().default(true),
  changedBy: integer("changed_by").references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertValveStatusSchema = createInsertSchema(valveStatus);

// Leak events table
export const leakEvents = pgTable("leak_events", {
  id: serial("id").primaryKey(),
  sensorId: integer("sensor_id").references(() => sensors.id).notNull(),
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
  severity: text("severity").notNull().default("medium"), // low, medium, high
  status: text("status").notNull().default("pending"), // pending, resolved
  flowRate: decimal("flow_rate", { precision: 10, scale: 2 }).notNull(),
  data: json("data"),
  resolvedBy: integer("resolved_by").references(() => users.id),
});

export const insertLeakEventSchema = createInsertSchema(leakEvents);

// System settings table
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  continuousFlowThreshold: integer("continuous_flow_threshold").notNull().default(30), // in minutes
  nightFlowMonitoring: boolean("night_flow_monitoring").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: integer("updated_by").references(() => users.id),
});

export const insertSystemSettingsSchema = createInsertSchema(systemSettings);

// Relations
export const sensorsRelations = relations(sensors, ({ many }) => ({
  readings: many(sensorReadings),
  leakEvents: many(leakEvents),
}));

export const sensorReadingsRelations = relations(sensorReadings, ({ one }) => ({
  sensor: one(sensors, { fields: [sensorReadings.sensorId], references: [sensors.id] }),
}));

export const leakEventsRelations = relations(leakEvents, ({ one }) => ({
  sensor: one(sensors, { fields: [leakEvents.sensorId], references: [sensors.id] }),
  resolvedByUser: one(users, { fields: [leakEvents.resolvedBy], references: [users.id] }),
}));

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Sensor = typeof sensors.$inferSelect;
export type InsertSensor = z.infer<typeof insertSensorSchema>;

export type SensorReading = typeof sensorReadings.$inferSelect;
export type InsertSensorReading = z.infer<typeof insertSensorReadingSchema>;

export type ValveStatus = typeof valveStatus.$inferSelect;
export type InsertValveStatus = z.infer<typeof insertValveStatusSchema>;

export type LeakEvent = typeof leakEvents.$inferSelect;
export type InsertLeakEvent = z.infer<typeof insertLeakEventSchema>;

export type SystemSettings = typeof systemSettings.$inferSelect;
export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;
