import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import StatusCard from "@/components/dashboard/status-card";
import ValveControlCard from "@/components/dashboard/valve-control-card";
import FlowMetricsCard from "@/components/dashboard/flow-metrics-card";
import FlowDataChart from "@/components/dashboard/flow-data-chart";
import LeakDetection from "@/components/dashboard/leak-detection";
import SystemStats from "@/components/dashboard/system-stats";
import ThresholdSettings from "@/components/dashboard/threshold-settings";
import SensorCard from "@/components/dashboard/sensor-card";
import { Sensor, SensorReading, LeakEvent, ValveStatus, SystemSettings } from "@shared/schema";

const TIME_RANGES = {
  "1h": "Last Hour",
  "6h": "Last 6 Hours",
  "24h": "Last 24 Hours",
  "7d": "Last Week"
};

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { status: wsStatus, lastMessage, sendMessage } = useWebSocket();
  const [timeRange, setTimeRange] = useState<string>("1h");
  const [activeAlertId, setActiveAlertId] = useState<number | null>(null);
  
  // Fetch sensors
  const { data: sensors = [] } = useQuery<Sensor[]>({
    queryKey: ["/api/sensors"],
  });
  
  // Fetch current valve status
  const { data: valveStatus, refetch: refetchValveStatus } = useQuery<ValveStatus>({
    queryKey: ["/api/valve-status/current"],
  });
  
  // Fetch leak events
  const { data: leakEvents = [], refetch: refetchLeakEvents } = useQuery<LeakEvent[]>({
    queryKey: ["/api/leak-events"],
  });
  
  // Fetch system settings
  const { data: systemSettings } = useQuery<SystemSettings>({
    queryKey: ["/api/system-settings"],
  });
  
  // Fetch sensor readings based on time range
  const { data: sensorReadings = [], refetch: refetchSensorReadings } = useQuery<SensorReading[]>({
    queryKey: ["/api/sensor-readings", timeRange],
  });
  
  // Fetch the current active leak alert if any
  const { data: activeAlert, refetch: refetchActiveAlert } = useQuery<LeakEvent | null>({
    queryKey: ["/api/leak-events/active"],
  });
  
  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case "sensorReading":
          refetchSensorReadings();
          break;
        case "valveStatusChanged":
          refetchValveStatus();
          break;
        case "leakDetected":
          refetchActiveAlert();
          refetchLeakEvents();
          toast({
            title: "Potential Leak Detected!",
            description: `Abnormal flow detected at ${lastMessage.data.location}`,
            variant: "destructive",
          });
          setActiveAlertId(lastMessage.data.id);
          break;
        case "leakResolved":
          refetchActiveAlert();
          refetchLeakEvents();
          break;
      }
    }
  }, [lastMessage, refetchSensorReadings, refetchValveStatus, refetchActiveAlert, refetchLeakEvents, toast]);
  
  // Handle WebSocket connection status
  useEffect(() => {
    if (wsStatus === "error" || wsStatus === "closed") {
      toast({
        title: "Connection Issues",
        description: "Lost connection to the server. Retrying...",
        variant: "destructive",
      });
    }
  }, [wsStatus, toast]);
  
  const handleToggleValve = (isOpen: boolean) => {
    sendMessage("toggleValve", { isOpen });
  };
  
  const handleEmergencyShutdown = () => {
    sendMessage("emergencyShutdown", {});
    toast({
      title: "Emergency Shutdown",
      description: "Emergency shutdown initiated. Valve closed.",
      variant: "destructive",
    });
  };
  
  const handleResolveLeakEvent = (leakId: number) => {
    sendMessage("resolveLeakEvent", { leakId });
  };
  
  const handleUpdateThresholds = (newThresholds: any) => {
    sendMessage("updateThresholds", newThresholds);
  };
  
  const currentFlowReadings = sensors.map(sensor => {
    const latestReading = sensorReadings
      .filter(reading => reading.sensorId === sensor.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    return {
      sensor,
      reading: latestReading || null
    };
  });
  
  const groupedReadings = sensors.map(sensor => {
    return {
      sensor,
      readings: sensorReadings.filter(reading => reading.sensorId === sensor.id)
    };
  });
  
  return (
    <DashboardLayout user={user}>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* System Status and Valve Control */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <StatusCard 
              connectionStatus={wsStatus === "open" ? "connected" : "disconnected"} 
              sensorsOnline={sensors.length}
              sensorsTotal={sensors.length}
              hasActiveAlert={!!activeAlert}
            />
            
            <ValveControlCard
              valveStatus={valveStatus}
              onToggle={handleToggleValve}
              onEmergencyShutdown={handleEmergencyShutdown}
            />
            
            <FlowMetricsCard
              currentReadings={currentFlowReadings}
              hasActiveAlert={!!activeAlert}
            />
          </div>

          {/* Real-time Flow Data */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Real-time Flow Data</h2>
              <div className="flex space-x-2">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="block pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                >
                  {Object.entries(TIME_RANGES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <FlowDataChart data={groupedReadings} timeRange={timeRange} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {currentFlowReadings.map(({ sensor, reading }) => (
                <SensorCard 
                  key={sensor.id}
                  sensor={sensor}
                  reading={reading}
                  hasAlert={activeAlert?.sensorId === sensor.id}
                />
              ))}
            </div>
          </div>

          {/* Leak Detection & History */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <LeakDetection
                activeAlert={activeAlert}
                leakEvents={leakEvents}
                onResolve={handleResolveLeakEvent}
              />
            </div>
            
            <div className="lg:col-span-5 space-y-6">
              <SystemStats leakEvents={leakEvents} />
              
              <ThresholdSettings
                sensors={sensors}
                systemSettings={systemSettings}
                onUpdate={handleUpdateThresholds}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
