import { useState, useEffect } from "react";
import { AlertTriangleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ValveStatus } from "@shared/schema";

interface ValveControlCardProps {
  valveStatus: ValveStatus | undefined;
  onToggle: (isOpen: boolean) => void;
  onEmergencyShutdown: () => void;
}

export default function ValveControlCard({ 
  valveStatus, 
  onToggle, 
  onEmergencyShutdown 
}: ValveControlCardProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  
  useEffect(() => {
    if (valveStatus) {
      setIsOpen(valveStatus.isOpen);
    }
  }, [valveStatus]);
  
  const handleToggle = () => {
    const newStatus = !isOpen;
    setIsOpen(newStatus);
    onToggle(newStatus);
  };
  
  const handleEmergencyShutdown = () => {
    setIsOpen(false);
    onEmergencyShutdown();
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6 col-span-1">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Master Valve Control</h2>
      
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium text-gray-700">Valve Status:</span>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${isOpen ? 'bg-success' : 'bg-destructive'} text-white`}>
          {isOpen ? 'Open' : 'Closed'}
        </span>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-700">Toggle Valve:</span>
        <label className="switch">
          <input 
            type="checkbox" 
            checked={isOpen} 
            onChange={handleToggle}
          />
          <span className="slider"></span>
        </label>
      </div>
      
      <div className="mt-6 flex flex-col">
        <Button 
          variant="destructive" 
          onClick={handleEmergencyShutdown}
          className="inline-flex items-center justify-center"
        >
          <AlertTriangleIcon className="mr-2 h-4 w-4" />
          Emergency Shutdown
        </Button>
        <p className="mt-2 text-xs text-gray-500 text-center">Use only in case of emergency to immediately close the valve</p>
      </div>
    </div>
  );
}
