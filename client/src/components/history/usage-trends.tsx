import { useRef, useEffect, useState } from "react";
import { Chart, ChartConfiguration, registerables } from "chart.js";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

Chart.register(...registerables);

export default function UsageTrends() {
  const [activeTab, setActiveTab] = useState("daily");
  const [timeRange, setTimeRange] = useState("7d");
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  // Generate daily usage data
  const generateDailyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return {
      labels: days,
      datasets: [{
        label: 'Daily Usage (Liters)',
        data: days.map(() => 250 + Math.random() * 150),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      }]
    };
  };
  
  // Generate weekly usage data
  const generateWeeklyData = () => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    
    return {
      labels: weeks,
      datasets: [{
        label: 'Weekly Usage (Liters)',
        data: weeks.map(() => 1500 + Math.random() * 500),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      }]
    };
  };
  
  // Generate monthly usage data
  const generateMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    return {
      labels: months,
      datasets: [{
        label: 'Monthly Usage (kL)',
        data: months.map(() => 7 + Math.random() * 3),
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgb(153, 102, 255)',
        borderWidth: 1,
      }]
    };
  };
  
  // Generate hourly usage data
  const generateHourlyData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    
    return {
      labels: hours,
      datasets: [{
        label: 'Hourly Usage (Liters)',
        data: hours.map((hour) => {
          // Simulate higher usage during morning and evening
          const hourNum = parseInt(hour);
          if (hourNum >= 6 && hourNum <= 9) {
            return 15 + Math.random() * 10; // Morning peak
          } else if (hourNum >= 17 && hourNum <= 22) {
            return 20 + Math.random() * 15; // Evening peak
          } else if (hourNum >= 0 && hourNum <= 5) {
            return Math.random() * 3; // Night (very low)
          } else {
            return 5 + Math.random() * 8; // Regular daytime
          }
        }),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
      }]
    };
  };
  
  // Get average usage for the current time period
  const getAverageUsage = (): string => {
    switch (activeTab) {
      case "hourly": return (10 + Math.random() * 5).toFixed(1);
      case "daily": return (320 + Math.random() * 50).toFixed(0);
      case "weekly": return (1800 + Math.random() * 300).toFixed(0);
      case "monthly": return (7.5 + Math.random() * 1.5).toFixed(1);
      default: return "0";
    }
  };
  
  // Get peak usage for the current time period
  const getPeakUsage = (): string => {
    switch (activeTab) {
      case "hourly": return (25 + Math.random() * 10).toFixed(1);
      case "daily": return (450 + Math.random() * 100).toFixed(0);
      case "weekly": return (2500 + Math.random() * 500).toFixed(0);
      case "monthly": return (9 + Math.random() * 2).toFixed(1);
      default: return "0";
    }
  };
  
  // Get usage units based on active tab
  const getUsageUnits = (): string => {
    switch (activeTab) {
      case "monthly": return "kL";
      default: return "L";
    }
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
    
    switch (activeTab) {
      case "hourly":
        chartData = generateHourlyData();
        break;
      case "daily":
        chartData = generateDailyData();
        break;
      case "weekly":
        chartData = generateWeeklyData();
        break;
      case "monthly":
        chartData = generateMonthlyData();
        break;
      default:
        chartData = generateDailyData();
    }
    
    const config: ChartConfiguration = {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: `Water Usage (${getUsageUnits()})`
            }
          },
          x: {
            title: {
              display: true,
              text: activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
            }
          }
        }
      }
    };
    
    chartInstance.current = new Chart(ctx, config);
    
    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [activeTab]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">
            View and analyze your water usage patterns over different time periods.
          </p>
        </div>
        
        <Select 
          value={timeRange} 
          onValueChange={setTimeRange}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Time Range</SelectLabel>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Average Usage</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {getAverageUsage()} {getUsageUnits()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                per {activeTab.replace(/ly$/, '')}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Peak Usage</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {getPeakUsage()} {getUsageUnits()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                highest recorded
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Efficiency Rating</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">B+</p>
              <p className="text-xs text-gray-500 mt-1">
                compared to similar households
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="daily" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hourly">Hourly</TabsTrigger>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
        
        <div className="h-80 mt-4">
          <canvas ref={chartRef}></canvas>
        </div>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-3">Usage Insights</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-medium text-gray-700">Typical Usage Patterns</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Your water usage tends to peak in the mornings (6-9 AM) and evenings (5-10 PM),
                  which is consistent with typical household patterns. Weekend usage is slightly
                  higher than weekdays.
                </p>
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-gray-700">Unusual Activity</h4>
                <p className="text-xs text-gray-600 mt-1">
                  No significant unusual water usage patterns detected in the selected time period.
                  The system is monitoring for consistent night flow that could indicate leaks.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-3">Conservation Tips</h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex">
                <span className="text-primary mr-2">•</span>
                <span>Consider installing low-flow fixtures to reduce water consumption</span>
              </li>
              <li className="flex">
                <span className="text-primary mr-2">•</span>
                <span>Your evening usage is higher than average - check for running faucets</span>
              </li>
              <li className="flex">
                <span className="text-primary mr-2">•</span>
                <span>Collect cold shower water while waiting for it to warm up</span>
              </li>
              <li className="flex">
                <span className="text-primary mr-2">•</span>
                <span>Run only full loads in dishwashers and washing machines</span>
              </li>
              <li className="flex">
                <span className="text-primary mr-2">•</span>
                <span>Set up smart alerts for abnormal usage patterns</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}