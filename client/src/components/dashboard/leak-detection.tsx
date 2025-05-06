import { useState } from "react";
import { 
  CheckCircleIcon,
  AlertTriangleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeakEvent } from "@shared/schema";

interface LeakDetectionProps {
  activeAlert: LeakEvent | null | undefined;
  leakEvents: LeakEvent[];
  onResolve: (leakId: number) => void;
}

export default function LeakDetection({ 
  activeAlert, 
  leakEvents, 
  onResolve 
}: LeakDetectionProps) {
  const [viewingDetails, setViewingDetails] = useState<number | null>(null);
  
  const handleDismissAlert = () => {
    if (activeAlert) {
      onResolve(activeAlert.id);
    }
  };
  
  const handleCloseValve = () => {
    if (activeAlert) {
      onResolve(activeAlert.id);
    }
  };
  
  const handleViewDetails = (id: number) => {
    setViewingDetails(id);
    // Here you would typically show a modal with more details
    // For now, we'll just log to console
    console.log(`Viewing details for leak event ${id}`);
  };
  
  const formatDateTime = (dateStr: string | Date | null) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Sort leak events by date, most recent first
  const sortedEvents = [...leakEvents].sort((a, b) => 
    new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
  );
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Leak Detection</h2>
      
      {/* Active Alert */}
      {activeAlert ? (
        <div className="bg-destructive bg-opacity-10 border border-destructive rounded-lg p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangleIcon className="text-destructive pulse-animation h-5 w-5" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-destructive">Potential Leak Detected!</h3>
              <div className="mt-2 text-sm text-destructive">
                <p>Abnormal flow detected at Sensor {activeAlert.sensorId}. Current flow rate of {activeAlert.flowRate.toString()} L/min exceeds normal threshold.</p>
              </div>
              <div className="mt-4">
                <div className="flex space-x-4">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleCloseValve}
                  >
                    Close Valve
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDismissAlert}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-success bg-opacity-10 border border-success rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="text-success h-5 w-5" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-success">No Leaks Detected</h3>
              <div className="mt-2 text-sm text-success">
                <p>All sensors reporting normal flow rates. System is functioning properly.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Leak History */}
      <h3 className="text-md font-medium text-gray-900 mb-3">Recent Leak History</h3>
      
      <div className="overflow-hidden shadow border-b border-gray-200 sm:rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEvents.slice(0, 5).map((leak) => (
              <TableRow key={leak.id}>
                <TableCell className="whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(leak.detectedAt)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm font-medium text-gray-900">
                  {leak.sensorId === 1 ? "Main Inlet" : 
                   leak.sensorId === 2 ? "Kitchen Branch" : 
                   leak.sensorId === 3 ? "Bathroom Branch" : 
                   `Sensor ${leak.sensorId}`}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${leak.severity === 'high' ? 'bg-destructive bg-opacity-20 text-destructive' : 
                      leak.severity === 'medium' ? 'bg-warning bg-opacity-20 text-warning' : 
                      'bg-success bg-opacity-20 text-success'}`}>
                    {leak.severity.charAt(0).toUpperCase() + leak.severity.slice(1)}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${leak.status === 'pending' ? 'bg-warning bg-opacity-20 text-warning' : 
                      'bg-success bg-opacity-20 text-success'}`}>
                    {leak.status.charAt(0).toUpperCase() + leak.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-gray-500">
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-primary hover:text-primary"
                    onClick={() => handleViewDetails(leak.id)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            
            {sortedEvents.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                  No leak events recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
