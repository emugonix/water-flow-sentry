import { useState } from "react";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sensor, SystemSettings } from "@shared/schema";

interface ThresholdSettingsProps {
  sensors: Sensor[];
  systemSettings: SystemSettings | undefined;
  onUpdate: (thresholds: any) => void;
}

export default function ThresholdSettings({ 
  sensors, 
  systemSettings, 
  onUpdate 
}: ThresholdSettingsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [thresholds, setThresholds] = useState<{
    sensors: { id: number, maxThreshold: string }[],
    continuousFlow: number,
    nightFlowMonitoring: boolean
  }>({
    sensors: sensors.map(s => ({ id: s.id, maxThreshold: s.maxThreshold.toString() })),
    continuousFlow: systemSettings?.continuousFlowThreshold || 30,
    nightFlowMonitoring: systemSettings?.nightFlowMonitoring || true
  });
  
  // Update local state when props change
  useState(() => {
    setThresholds({
      sensors: sensors.map(s => ({ id: s.id, maxThreshold: s.maxThreshold.toString() })),
      continuousFlow: systemSettings?.continuousFlowThreshold || 30,
      nightFlowMonitoring: systemSettings?.nightFlowMonitoring || true
    });
  });
  
  const handleSensorThresholdChange = (id: number, value: string) => {
    setThresholds(prev => ({
      ...prev,
      sensors: prev.sensors.map(s => 
        s.id === id ? { ...s, maxThreshold: value } : s
      )
    }));
  };
  
  const handleContinuousFlowChange = (value: string) => {
    setThresholds(prev => ({
      ...prev,
      continuousFlow: parseInt(value) || 30
    }));
  };
  
  const handleNightFlowToggle = (checked: boolean) => {
    setThresholds(prev => ({
      ...prev,
      nightFlowMonitoring: checked
    }));
  };
  
  const handleSaveThresholds = () => {
    onUpdate(thresholds);
    setIsDialogOpen(false);
  };
  
  // Get the percentage of threshold usage for the progress bar
  const getThresholdPercentage = (sensorId: number, maxValue: number = 10): number => {
    const sensorThreshold = parseFloat(
      thresholds.sensors.find(s => s.id === sensorId)?.maxThreshold || "0"
    );
    return (sensorThreshold / maxValue) * 100;
  };
  
  // Get sensor name by ID
  const getSensorName = (sensorId: number): string => {
    const sensor = sensors.find(s => s.id === sensorId);
    return sensor ? sensor.location : `Sensor ${sensorId}`;
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Detection Thresholds</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PencilIcon className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Detection Thresholds</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {thresholds.sensors.map(sensor => (
                <div key={sensor.id} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={`threshold-${sensor.id}`} className="text-right col-span-2">
                    {getSensorName(sensor.id)} Max Flow:
                  </Label>
                  <div className="col-span-2 flex items-center">
                    <Input
                      id={`threshold-${sensor.id}`}
                      type="number"
                      step="0.1"
                      min="0"
                      value={sensor.maxThreshold}
                      onChange={(e) => handleSensorThresholdChange(sensor.id, e.target.value)}
                      className="w-20 mr-2"
                    />
                    <span className="text-sm text-gray-500">L/min</span>
                  </div>
                </div>
              ))}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="continuous-flow" className="text-right col-span-2">
                  Continuous Flow Alert:
                </Label>
                <div className="col-span-2 flex items-center">
                  <Input
                    id="continuous-flow"
                    type="number"
                    min="1"
                    value={thresholds.continuousFlow}
                    onChange={(e) => handleContinuousFlowChange(e.target.value)}
                    className="w-20 mr-2"
                  />
                  <span className="text-sm text-gray-500">minutes</span>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="night-flow" className="text-right col-span-2">
                  Night Flow Monitoring:
                </Label>
                <div className="col-span-2">
                  <Switch
                    id="night-flow"
                    checked={thresholds.nightFlowMonitoring}
                    onCheckedChange={handleNightFlowToggle}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSaveThresholds}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-4">
        {/* Display thresholds with progress bars */}
        {thresholds.sensors.map(sensor => (
          <div key={sensor.id}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">
                {getSensorName(sensor.id)} - Maximum Flow
              </span>
              <span className="text-sm font-medium text-gray-900">
                {sensor.maxThreshold} L/min
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary rounded-full h-2" 
                style={{ width: `${getThresholdPercentage(sensor.id)}%` }}
              ></div>
            </div>
          </div>
        ))}
        
        {/* Continuous Flow Duration */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">Continuous Flow Alert</span>
            <span className="text-sm font-medium text-gray-900">{thresholds.continuousFlow} minutes</span>
          </div>
        </div>
        
        {/* Night Flow Monitoring */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">Night Flow Monitoring</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-light text-success-dark">
              {thresholds.nightFlowMonitoring ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
