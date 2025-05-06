import { ThumbsUpIcon } from "lucide-react";
import { Sensor, SensorReading } from "@shared/schema";

interface FlowMetricsCardProps {
  currentReadings: {
    sensor: Sensor;
    reading: SensorReading | null;
  }[];
  hasActiveAlert: boolean;
}

export default function FlowMetricsCard({ 
  currentReadings, 
  hasActiveAlert 
}: FlowMetricsCardProps) {
  // Calculate average flow rate from current readings
  const calculateAverageFlow = (): string => {
    const validReadings = currentReadings
      .filter(item => item.reading !== null)
      .map(item => parseFloat(item.reading?.flowRate.toString() || "0"));
    
    if (validReadings.length === 0) return "0.0";
    
    const sum = validReadings.reduce((acc, curr) => acc + curr, 0);
    return (sum / validReadings.length).toFixed(1);
  };
  
  // Total daily usage (mock data for now)
  const getDailyUsage = (): string => {
    const baseUsage = 300;
    const variability = Math.random() * 50;
    return Math.round(baseUsage + variability).toString();
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6 col-span-1">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Current Flow Metrics</h2>
      
      {/* Current Flow Rate */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-700">Average Flow Rate:</span>
        <span className="text-lg font-bold text-primary">{calculateAverageFlow()} L/min</span>
      </div>
      
      {/* Pressure Reading */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-700">System Pressure:</span>
        <span className="text-lg font-bold text-primary">3.8 bar</span>
      </div>
      
      {/* Daily Usage */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-700">Today's Usage:</span>
        <span className="text-lg font-bold text-primary">{getDailyUsage()} L</span>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center">
          {hasActiveAlert ? (
            <>
              <span className="material-icons text-warning mr-2">warning</span>
              <span className="text-sm font-medium text-warning">Abnormal flow detected</span>
            </>
          ) : (
            <>
              <ThumbsUpIcon className="text-success mr-2 h-5 w-5" />
              <span className="text-sm font-medium text-gray-700">Flow rates normal</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
