import { 
  CheckCircleIcon, 
  WifiIcon, 
  AlertCircleIcon,
  Gauge
} from "lucide-react";

interface StatusCardProps {
  connectionStatus: 'connected' | 'disconnected';
  sensorsOnline: number;
  sensorsTotal: number;
  hasActiveAlert: boolean;
}

export default function StatusCard({ 
  connectionStatus, 
  sensorsOnline, 
  sensorsTotal,
  hasActiveAlert
}: StatusCardProps) {
  const isAllSensorsOnline = sensorsOnline === sensorsTotal;
  
  const getLastUpdated = () => {
    const now = new Date();
    return `Last update: ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6 col-span-1">
      <h2 className="text-lg font-medium text-gray-900 mb-4">System Status</h2>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {hasActiveAlert ? (
            <AlertCircleIcon className="text-warning mr-2 h-5 w-5" />
          ) : (
            <CheckCircleIcon className="text-success mr-2 h-5 w-5" />
          )}
          <span className="text-sm font-medium text-gray-700">
            {hasActiveAlert ? "Anomaly Detected" : "System Operational"}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          <span>{getLastUpdated()}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <WifiIcon className={`${connectionStatus === 'connected' ? 'text-success' : 'text-destructive'} mr-2 h-5 w-5`} />
          <span className="text-sm font-medium text-gray-700">
            {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className={`text-sm ${connectionStatus === 'connected' ? 'text-success' : 'text-destructive'} font-medium`}>
          {connectionStatus === 'connected' ? 'Online' : 'Offline'}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Gauge className={`${isAllSensorsOnline ? 'text-success' : 'text-warning'} mr-2 h-5 w-5`} />
          <span className="text-sm font-medium text-gray-700">
            {isAllSensorsOnline ? 'All Sensors Active' : 'Some Sensors Offline'}
          </span>
        </div>
        <div className={`text-sm ${isAllSensorsOnline ? 'text-success' : 'text-warning'} font-medium`}>
          {sensorsOnline}/{sensorsTotal} Online
        </div>
      </div>
    </div>
  );
}
