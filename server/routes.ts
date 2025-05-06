import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { setupAuth } from "./auth";
import { setupWebSocketHandlers } from "./websocket";
import { storage } from "./storage";
import { eq, and, desc, lt } from "drizzle-orm";
import * as schema from "@shared/schema";
import { db } from "@db";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  setupWebSocketHandlers(wss, storage);
  
  // Setup authentication
  setupAuth(app);

  // ===== API Routes =====
  
  // Get all sensors
  app.get("/api/sensors", async (req, res) => {
    try {
      const sensors = await db.select().from(schema.sensors);
      res.json(sensors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sensors" });
    }
  });
  
  // Get sensor readings with optional time range filter
  app.get("/api/sensor-readings", async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || "1h";
      
      let timeLimit: Date;
      const now = new Date();
      
      switch (timeRange) {
        case "1h":
          timeLimit = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case "6h":
          timeLimit = new Date(now.getTime() - 6 * 60 * 60 * 1000);
          break;
        case "24h":
          timeLimit = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "7d":
          timeLimit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        default:
          timeLimit = new Date(now.getTime() - 60 * 60 * 1000);
      }
      
      const readings = await db.select()
        .from(schema.sensorReadings)
        .where(and(
          lt(schema.sensorReadings.timestamp, now),
          schema.sensorReadings.timestamp >= timeLimit
        ))
        .orderBy(schema.sensorReadings.timestamp);
      
      res.json(readings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sensor readings" });
    }
  });
  
  // Get current valve status
  app.get("/api/valve-status/current", async (req, res) => {
    try {
      const status = await db.select()
        .from(schema.valveStatus)
        .orderBy(desc(schema.valveStatus.timestamp))
        .limit(1);
      
      res.json(status[0] || { isOpen: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch valve status" });
    }
  });
  
  // Update valve status
  app.post("/api/valve-status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const { isOpen } = req.body;
      
      const [newStatus] = await db.insert(schema.valveStatus)
        .values({
          isOpen: isOpen,
          changedBy: req.user?.id
        })
        .returning();
      
      // Notify all connected WebSocket clients about the valve status change
      storage.broadcastMessage({
        type: "valveStatusChanged",
        data: newStatus
      });
      
      res.json(newStatus);
    } catch (error) {
      res.status(500).json({ error: "Failed to update valve status" });
    }
  });
  
  // Get all leak events
  app.get("/api/leak-events", async (req, res) => {
    try {
      const events = await db.select()
        .from(schema.leakEvents)
        .orderBy(desc(schema.leakEvents.detectedAt));
      
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leak events" });
    }
  });
  
  // Get active leak event (if any)
  app.get("/api/leak-events/active", async (req, res) => {
    try {
      const activeEvent = await db.select()
        .from(schema.leakEvents)
        .where(eq(schema.leakEvents.status, "pending"))
        .orderBy(desc(schema.leakEvents.detectedAt))
        .limit(1);
      
      res.json(activeEvent[0] || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active leak event" });
    }
  });
  
  // Resolve a leak event
  app.post("/api/leak-events/:id/resolve", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const leakId = parseInt(req.params.id);
      
      const [updatedEvent] = await db.update(schema.leakEvents)
        .set({
          status: "resolved",
          resolvedAt: new Date(),
          resolvedBy: req.user?.id
        })
        .where(eq(schema.leakEvents.id, leakId))
        .returning();
      
      if (!updatedEvent) {
        return res.status(404).json({ error: "Leak event not found" });
      }
      
      // Notify all connected WebSocket clients about the resolved leak
      storage.broadcastMessage({
        type: "leakResolved",
        data: updatedEvent
      });
      
      res.json(updatedEvent);
    } catch (error) {
      res.status(500).json({ error: "Failed to resolve leak event" });
    }
  });
  
  // Create a new leak event
  app.post("/api/leak-events", async (req, res) => {
    try {
      const { sensorId, flowRate, severity } = req.body;
      
      const [newEvent] = await db.insert(schema.leakEvents)
        .values({
          sensorId: sensorId,
          flowRate: flowRate,
          severity: severity || "medium",
          status: "pending"
        })
        .returning();
      
      // Get the sensor data for the notification
      const sensor = await db.select()
        .from(schema.sensors)
        .where(eq(schema.sensors.id, sensorId))
        .limit(1);
      
      // Notify all connected WebSocket clients about the new leak
      storage.broadcastMessage({
        type: "leakDetected",
        data: {
          ...newEvent,
          location: sensor[0]?.location || `Sensor ${sensorId}`
        }
      });
      
      res.status(201).json(newEvent);
    } catch (error) {
      res.status(500).json({ error: "Failed to create leak event" });
    }
  });
  
  // Get system settings
  app.get("/api/system-settings", async (req, res) => {
    try {
      const settings = await db.select()
        .from(schema.systemSettings)
        .orderBy(desc(schema.systemSettings.updatedAt))
        .limit(1);
      
      res.json(settings[0] || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch system settings" });
    }
  });
  
  // Update system settings
  app.put("/api/system-settings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const { continuousFlowThreshold, nightFlowMonitoring } = req.body;
      
      const [updatedSettings] = await db.insert(schema.systemSettings)
        .values({
          continuousFlowThreshold,
          nightFlowMonitoring,
          updatedBy: req.user?.id
        })
        .returning();
      
      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update system settings" });
    }
  });
  
  // Update sensor thresholds
  app.put("/api/sensors/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const sensorId = parseInt(req.params.id);
      const { maxThreshold } = req.body;
      
      const [updatedSensor] = await db.update(schema.sensors)
        .set({ maxThreshold })
        .where(eq(schema.sensors.id, sensorId))
        .returning();
      
      if (!updatedSensor) {
        return res.status(404).json({ error: "Sensor not found" });
      }
      
      res.json(updatedSensor);
    } catch (error) {
      res.status(500).json({ error: "Failed to update sensor threshold" });
    }
  });
  
  // Add a new sensor reading
  app.post("/api/sensor-readings", async (req, res) => {
    try {
      const { sensorId, flowRate } = req.body;
      
      // Insert the reading
      const [newReading] = await db.insert(schema.sensorReadings)
        .values({
          sensorId,
          flowRate
        })
        .returning();
      
      // Check if the flow rate exceeds the threshold for this sensor
      const [sensor] = await db.select()
        .from(schema.sensors)
        .where(eq(schema.sensors.id, sensorId));
      
      if (sensor && parseFloat(flowRate) > parseFloat(sensor.maxThreshold.toString())) {
        // Create a leak event
        await db.insert(schema.leakEvents)
          .values({
            sensorId,
            flowRate,
            severity: "medium",
            status: "pending"
          });
      }
      
      // Notify all connected WebSocket clients about the new reading
      storage.broadcastMessage({
        type: "sensorReading",
        data: newReading
      });
      
      res.status(201).json(newReading);
    } catch (error) {
      res.status(500).json({ error: "Failed to add sensor reading" });
    }
  });

  return httpServer;
}
