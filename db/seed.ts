import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("Starting seed process...");
    
    // Check if we already have a user
    const existingUsers = await db.select().from(schema.users);
    if (existingUsers.length === 0) {
      console.log("Creating admin user...");
      await db.insert(schema.users).values({
        username: "admin",
        password: "$2a$10$JuVMfnR8PXBxAuJN5hHpSuUjL8V2Iur39bpAijBBdcYOmIr.dBoyW", // "password"
        name: "Administrator",
        role: "admin"
      });
    }

    // Check if we already have sensors
    const existingSensors = await db.select().from(schema.sensors);
    if (existingSensors.length === 0) {
      console.log("Creating sensors...");
      await db.insert(schema.sensors).values([
        {
          name: "Sensor 1",
          location: "Main Inlet",
          maxThreshold: "8.5"
        },
        {
          name: "Sensor 2",
          location: "Kitchen Branch",
          maxThreshold: "4.2"
        },
        {
          name: "Sensor 3",
          location: "Bathroom Branch",
          maxThreshold: "5.8"
        }
      ]);
    }

    // Check if we have system settings
    const existingSettings = await db.select().from(schema.systemSettings);
    if (existingSettings.length === 0) {
      console.log("Creating system settings...");
      await db.insert(schema.systemSettings).values({
        continuousFlowThreshold: 30,
        nightFlowMonitoring: true
      });
    }

    // Check if we have valve status
    const existingValveStatus = await db.select().from(schema.valveStatus);
    if (existingValveStatus.length === 0) {
      console.log("Creating initial valve status...");
      await db.insert(schema.valveStatus).values({
        isOpen: true
      });
    }

    // Create sample leak events if none exist
    const existingLeakEvents = await db.select().from(schema.leakEvents);
    if (existingLeakEvents.length === 0) {
      console.log("Creating sample leak events...");
      
      // Get sensors for reference
      const sensors = await db.select().from(schema.sensors);
      if (sensors.length > 0) {
        const mainInletId = sensors.find(s => s.location === "Main Inlet")?.id || 1;
        const kitchenBranchId = sensors.find(s => s.location === "Kitchen Branch")?.id || 2;
        const bathroomBranchId = sensors.find(s => s.location === "Bathroom Branch")?.id || 3;
        
        // Create historic leak events with resolved status
        const now = new Date();
        
        await db.insert(schema.leakEvents).values([
          {
            sensorId: bathroomBranchId,
            detectedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            resolvedAt: new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000), // 29 days ago
            severity: "medium",
            status: "resolved",
            flowRate: "6.5"
          },
          {
            sensorId: kitchenBranchId,
            detectedAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
            resolvedAt: new Date(now.getTime() - 44 * 24 * 60 * 60 * 1000), // 44 days ago
            severity: "high",
            status: "resolved",
            flowRate: "5.7"
          },
          {
            sensorId: mainInletId,
            detectedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
            resolvedAt: new Date(now.getTime() - 59 * 24 * 60 * 60 * 1000), // 59 days ago
            severity: "medium",
            status: "resolved",
            flowRate: "10.2"
          },
          {
            sensorId: kitchenBranchId,
            detectedAt: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000), // 75 days ago
            resolvedAt: new Date(now.getTime() - 74 * 24 * 60 * 60 * 1000), // 74 days ago
            severity: "medium",
            status: "resolved",
            flowRate: "4.8"
          },
          {
            sensorId: bathroomBranchId,
            detectedAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
            resolvedAt: new Date(now.getTime() - 89 * 24 * 60 * 60 * 1000), // 89 days ago
            severity: "high",
            status: "resolved",
            flowRate: "7.2"
          }
        ]);
      }
    }

    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Error during seed process:", error);
  }
}

seed();
