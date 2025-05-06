import { Sensor, SensorReading } from "@shared/schema";

interface SensorCardProps {
  sensor: Sensor;
  reading: SensorReading | null;
  hasAlert: boolean;
}

export default function SensorCard({ sensor, reading, hasAlert }: SensorCardProps) {
  const flowRate = reading ? parseFloat(reading.flowRate.toString()).toFixed(1) : "0.0";
  
  // Determine if flow rate is abnormal
  const isAbnormal = hasAlert;

  // Determine status text
  const statusText = isAbnormal ? "Abnormal flow detected" : "Normal operation";
  
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">{sensor.location}</h3>
        <span className="flex h-3 w-3">
          <span className={`relative inline-flex rounded-full h-3 w-3 ${isAbnormal ? 'bg-destructive pulse-animation' : 'bg-success'}`}></span>
        </span>
      </div>
      <div className="flex items-baseline space-x-1">
        <span className={`text-2xl font-bold ${isAbnormal ? 'text-destructive' : 'text-gray-900'}`}>
          {flowRate}
        </span>
        <span className="text-sm text-gray-500">L/min</span>
      </div>
      <div className={`text-xs ${isAbnormal ? 'text-destructive' : 'text-gray-500'} mt-1`}>
        {statusText}
      </div>
    </div>
  );
}
