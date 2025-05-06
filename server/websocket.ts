import { WebSocketServer, WebSocket } from "ws";
import { IStorage } from "./storage";
import { db } from "@db";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

export function setupWebSocketHandlers(wss: WebSocketServer, storage: IStorage) {
  wss.on("connection", (ws) => {
    storage.addClient(ws);

    // Setup message handling
    ws.on("message", async (message: string) => {
      try {
        const parsedMessage = JSON.parse(message);
        
        // Handle different message types
        switch (parsedMessage.type) {
          case "toggleValve":
            await handleValveToggle(parsedMessage.data);
            break;
          
          case "emergencyShutdown":
            await handleEmergencyShutdown();
            break;
          
          case "resolveLeakEvent":
            await handleResolveLeakEvent(parsedMessage.data);
            break;
          
          case "updateThresholds":
            await handleUpdateThresholds(parsedMessage.data);
            break;
          
          // Can add other message handlers here
          
          default:
            console.log(`Unknown message type: ${parsedMessage.type}`);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    });

    // Handle disconnection
    ws.on("close", () => {
      storage.removeClient(ws);
    });

    // Send initial connection confirmation
    ws.send(JSON.stringify({ type: "connected", data: { timestamp: new Date() } }));
    
    // Start simulated sensor readings
    startSensorSimulation(storage);
  });
}

// Handle valve toggle messages
async function handleValveToggle(data: { isOpen: boolean }) {
  try {
    const [newStatus] = await db.insert(schema.valveStatus)
      .values({
        isOpen: data.isOpen
      })
      .returning();
    
    return newStatus;
  } catch (error) {
    console.error("Error toggling valve:", error);
    throw error;
  }
}

// Handle emergency shutdown
async function handleEmergencyShutdown() {
  try {
    const [newStatus] = await db.insert(schema.valveStatus)
      .values({
        isOpen: false
      })
      .returning();
    
    return newStatus;
  } catch (error) {
    console.error("Error during emergency shutdown:", error);
    throw error;
  }
}

// Handle resolving a leak event
async function handleResolveLeakEvent(data: { leakId: number }) {
  try {
    const [updatedEvent] = await db.update(schema.leakEvents)
      .set({
        status: "resolved",
        resolvedAt: new Date()
      })
      .where(eq(schema.leakEvents.id, data.leakId))
      .returning();
    
    return updatedEvent;
  } catch (error) {
    console.error("Error resolving leak event:", error);
    throw error;
  }
}

// Handle updating system thresholds
async function handleUpdateThresholds(data: { 
  sensors: { id: number, maxThreshold: string }[],
  continuousFlow: number,
  nightFlowMonitoring: boolean
}) {
  try {
    // Update sensor thresholds
    const updatedSensors = [];
    
    for (const sensor of data.sensors) {
      const [updatedSensor] = await db.update(schema.sensors)
        .set({ maxThreshold: sensor.maxThreshold })
        .where(eq(schema.sensors.id, sensor.id))
        .returning();
      
      updatedSensors.push(updatedSensor);
    }
    
    // Update system settings
    const [updatedSettings] = await db.insert(schema.systemSettings)
      .values({
        continuousFlowThreshold: data.continuousFlow,
        nightFlowMonitoring: data.nightFlowMonitoring
      })
      .returning();
    
    return {
      sensors: updatedSensors,
      settings: updatedSettings
    };
  } catch (error) {
    console.error("Error updating thresholds:", error);
    throw error;
  }
}

// Simulate sensor readings for demo purposes
let simulationInterval: NodeJS.Timeout | null = null;

function startSensorSimulation(storage: IStorage) {
  // Only start if not already running
  if (simulationInterval) return;
  
  simulationInterval = setInterval(async () => {
    try {
      // Get all sensors
      const sensors = await db.select().from(schema.sensors);
      
      // Get current valve status
      const valveStatus = await db.select()
        .from(schema.valveStatus)
        .orderBy({ timestamp: "desc" })
        .limit(1);
      
      const isValveOpen = valveStatus[0]?.isOpen ?? true;
      
      // Generate readings for each sensor
      for (const sensor of sensors) {
        // Base flow rate depends on valve status
        let baseFlowRate = isValveOpen ? 
          (sensor.id === 1 ? 4.0 : sensor.id === 2 ? 1.5 : 2.2) : 0.1;
        
        // Add some randomness
        const randomFactor = Math.random() * 0.6 - 0.3; // -0.3 to +0.3
        let flowRate = baseFlowRate + randomFactor;
        
        // Ensure non-negative
        flowRate = Math.max(flowRate, 0);
        
        // Occasionally simulate a leak for demo purposes (1% chance)
        const isLeak = Math.random() < 0.01;
        if (isLeak && isValveOpen) {
          flowRate = parseFloat(sensor.maxThreshold.toString()) + 1 + Math.random();
        }
        
        // Insert the reading
        const [newReading] = await db.insert(schema.sensorReadings)
          .values({
            sensorId: sensor.id,
            flowRate: flowRate.toFixed(2)
          })
          .returning();
        
        // Broadcast the new reading to all connected clients
        storage.broadcastMessage({
          type: "sensorReading",
          data: newReading
        });
        
        // Check for leak condition
        if (flowRate > parseFloat(sensor.maxThreshold.toString())) {
          // Check if there's already an active leak for this sensor
          const activeLeaks = await db.select()
            .from(schema.leakEvents)
            .where(
              eq(schema.leakEvents.sensorId, sensor.id),
              eq(schema.leakEvents.status, "pending")
            );
          
          // Only create a new leak event if there isn't an active one
          if (activeLeaks.length === 0) {
            const [newLeakEvent] = await db.insert(schema.leakEvents)
              .values({
                sensorId: sensor.id,
                flowRate: flowRate.toFixed(2),
                severity: flowRate > parseFloat(sensor.maxThreshold.toString()) * 1.5 ? "high" : "medium",
                status: "pending"
              })
              .returning();
            
            // Broadcast the leak detection
            storage.broadcastMessage({
              type: "leakDetected",
              data: {
                ...newLeakEvent,
                location: sensor.location
              }
            });
          }
        }
      }
    } catch (error) {
      console.error("Error in sensor simulation:", error);
    }
  }, 5000); // Generate readings every 5 seconds
}
