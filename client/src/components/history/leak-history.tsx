import { useState } from "react";
import { CheckCircleIcon, AlertTriangleIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeakEvent } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface LeakHistoryProps {
  leakEvents: LeakEvent[];
}

export default function LeakHistory({ leakEvents }: LeakHistoryProps) {
  const [viewingDetails, setViewingDetails] = useState<LeakEvent | null>(null);
  
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
  
  const getSensorLocation = (sensorId: number): string => {
    switch (sensorId) {
      case 1: return "Main Inlet";
      case 2: return "Kitchen Branch";
      case 3: return "Bathroom Branch";
      default: return `Sensor ${sensorId}`;
    }
  };
  
  // Sort leak events by date, most recent first
  const sortedEvents = [...leakEvents].sort((a, b) => 
    new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
  );

  const handleViewDetails = (event: LeakEvent) => {
    setViewingDetails(event);
  };
  
  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-gray-500">
          View the complete history of leak events detected by the system, including when they occurred, 
          their severity, and resolution status.
        </p>
      </div>
      
      <div className="overflow-hidden shadow border-b border-gray-200 sm:rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Flow Rate</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEvents.map((leak) => (
              <TableRow key={leak.id}>
                <TableCell className="whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(leak.detectedAt)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm font-medium text-gray-900">
                  {getSensorLocation(leak.sensorId)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-gray-500">
                  {parseFloat(leak.flowRate.toString()).toFixed(1)} L/min
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge 
                    variant={leak.severity === 'high' ? 'destructive' : 
                           (leak.severity === 'medium' ? 'secondary' : 'default')}
                    className={leak.severity === 'high' ? 'bg-red-100 text-red-800' : 
                              (leak.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800')}
                  >
                    {leak.severity.charAt(0).toUpperCase() + leak.severity.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge 
                    variant={leak.status === 'pending' ? 'outline' : 'secondary'}
                  >
                    {leak.status.charAt(0).toUpperCase() + leak.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-gray-500">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="p-0 h-8 text-primary hover:text-primary-dark"
                    onClick={() => handleViewDetails(leak)}
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            
            {sortedEvents.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                  No leak events recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Details Dialog */}
      <Dialog open={!!viewingDetails} onOpenChange={(open) => !open && setViewingDetails(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Leak Event Details</DialogTitle>
          </DialogHeader>
          
          {viewingDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Event ID</p>
                  <p className="text-sm">{viewingDetails.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-sm">{getSensorLocation(viewingDetails.sensorId)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Detected At</p>
                  <p className="text-sm">{formatDateTime(viewingDetails.detectedAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Flow Rate</p>
                  <p className="text-sm">{parseFloat(viewingDetails.flowRate.toString()).toFixed(2)} L/min</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Severity</p>
                  <Badge 
                    variant={viewingDetails.severity === 'high' ? 'destructive' : 
                           (viewingDetails.severity === 'medium' ? 'secondary' : 'default')}
                    className={viewingDetails.severity === 'high' ? 'bg-red-100 text-red-800' : 
                              (viewingDetails.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800')}
                  >
                    {viewingDetails.severity.charAt(0).toUpperCase() + viewingDetails.severity.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge 
                    variant={viewingDetails.status === 'pending' ? 'outline' : 'secondary'}
                  >
                    {viewingDetails.status.charAt(0).toUpperCase() + viewingDetails.status.slice(1)}
                  </Badge>
                </div>
                {viewingDetails.resolvedAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Resolved At</p>
                    <p className="text-sm">{formatDateTime(viewingDetails.resolvedAt)}</p>
                  </div>
                )}
              </div>
              
              <Card className="bg-gray-50">
                <CardContent className="pt-6">
                  <h4 className="text-sm font-medium mb-2">Incident Summary</h4>
                  <p className="text-sm text-gray-600">
                    {viewingDetails.severity === 'high' ? 
                      'Severe leak detected requiring immediate attention. Potential for significant water damage.' :
                      viewingDetails.severity === 'medium' ?
                      'Moderate leak detected above normal threshold levels. Requires prompt attention.' :
                      'Minor flow rate anomaly detected. May indicate a small leak or measurement variation.'
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setViewingDetails(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}