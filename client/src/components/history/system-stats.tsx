import { useRef, useEffect, useState } from "react";
import { Chart, ChartConfiguration, registerables } from "chart.js";
import { LeakEvent } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

Chart.register(...registerables);

interface SystemStatsProps {
  leakEvents: LeakEvent[];
}

export default function SystemStats({ leakEvents }: SystemStatsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  // Calculate total water saved (rough estimate)
  const calculateWaterSaved = (): string => {
    if (leakEvents.length === 0) return "0";
    
    // Calculation based on leak events
    const averageLeakRate = 5; // L/min
    const averageDetectionTime = 20; // minutes
    const totalLeaks = leakEvents.length;
    
    return Math.round(averageLeakRate * averageDetectionTime * totalLeaks).toString();
  };
  
  // Calculate system efficiency percentage
  const getSystemEfficiency = (): number => {
    const resolvedEvents = leakEvents.filter(event => event.status === "resolved").length;
    return leakEvents.length > 0 
      ? Math.round((resolvedEvents / leakEvents.length) * 100) 
      : 100;
  };
  
  // Group leak events by severity
  const getLeaksBySeverity = () => {
    const result = { high: 0, medium: 0, low: 0 };
    
    leakEvents.forEach(event => {
      if (event.severity === "high") result.high += 1;
      else if (event.severity === "medium") result.medium += 1;
      else result.low += 1;
    });
    
    return result;
  };
  
  // Prepare monthly usage data for the chart
  const prepareMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    // Generate some reasonable usage data
    const baseUsage = 8;
    const usageData = months.map(() => baseUsage + Math.random() * 2.5);
    
    return {
      labels: months,
      datasets: [{
        label: 'Monthly Usage (kL)',
        data: usageData,
        backgroundColor: 'rgba(25, 118, 210, 0.6)',
        borderColor: 'rgb(25, 118, 210)',
        borderWidth: 1
      }]
    };
  };
  
  // Prepare leak events data for pie chart
  const prepareLeakEventsData = () => {
    const severityCounts = getLeaksBySeverity();
    
    return {
      labels: ['High', 'Medium', 'Low'],
      datasets: [{
        data: [severityCounts.high, severityCounts.medium, severityCounts.low],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(75, 192, 192, 0.7)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(75, 192, 192)'
        ],
        borderWidth: 1
      }]
    };
  };
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Create chart based on active tab
    let chartData;
    let chartType: 'bar' | 'pie' = 'bar';
    
    if (activeTab === 'leaks') {
      chartData = prepareLeakEventsData();
      chartType = 'pie';
    } else {
      chartData = prepareMonthlyData();
      chartType = 'bar';
    }
    
    const config: ChartConfiguration = {
      type: chartType,
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: activeTab === 'leaks',
            position: 'top',
          }
        },
        scales: chartType === 'bar' ? {
          y: {
            beginAtZero: true,
            grid: {
              display: false
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        } : undefined
      }
    };
    
    chartInstance.current = new Chart(ctx, config);
    
    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [leakEvents, activeTab]);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Total Leaks Detected</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{leakEvents.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Water Saved</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{calculateWaterSaved()} L</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">System Efficiency</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{getSystemEfficiency()}%</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Usage Overview</TabsTrigger>
          <TabsTrigger value="leaks">Leak Distribution</TabsTrigger>
        </TabsList>
        
        <div className="h-64 mt-4">
          <canvas ref={chartRef}></canvas>
        </div>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-3">System Performance</h3>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Resolved Events</span>
                  <span className="text-sm font-medium text-gray-900">
                    {leakEvents.filter(e => e.status === "resolved").length} / {leakEvents.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary rounded-full h-2" 
                    style={{ width: `${getSystemEfficiency()}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">System Uptime</span>
                  <span className="text-sm font-medium text-gray-900">99.7%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary rounded-full h-2" 
                    style={{ width: "99.7%" }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Sensor Reliability</span>
                  <span className="text-sm font-medium text-gray-900">98.2%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary rounded-full h-2" 
                    style={{ width: "98.2%" }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-3">Historical Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Average Response Time</span>
                <span className="text-sm font-medium text-gray-900">4.2 min</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Peak Flow Rate</span>
                <span className="text-sm font-medium text-gray-900">8.7 L/min</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Average Daily Usage</span>
                <span className="text-sm font-medium text-gray-900">320 L</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Leak-Free Days</span>
                <span className="text-sm font-medium text-gray-900">23</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}