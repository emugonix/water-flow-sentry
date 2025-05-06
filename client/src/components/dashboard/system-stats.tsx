import { useRef, useEffect } from "react";
import { Chart, ChartConfiguration, registerables } from "chart.js";
import { LeakEvent } from "@shared/schema";

Chart.register(...registerables);

interface SystemStatsProps {
  leakEvents: LeakEvent[];
}

export default function SystemStats({ leakEvents }: SystemStatsProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  // Calculate total water saved (rough estimate)
  const calculateWaterSaved = (): string => {
    if (leakEvents.length === 0) return "0";
    
    // Very simple calculation - just for demonstration
    const averageLeakRate = 5; // L/min
    const averageDetectionTime = 20; // minutes
    const totalLeaks = leakEvents.length;
    
    return Math.round(averageLeakRate * averageDetectionTime * totalLeaks).toString();
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
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Create monthly usage chart
    const chartData = prepareMonthlyData();
    
    const config: ChartConfiguration = {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              display: false
            },
            grid: {
              display: false
            }
          },
          x: {
            grid: {
              display: false
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
  }, [leakEvents]);
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">System Statistics</h2>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">Total Leaks Detected</span>
            <span className="text-sm font-medium text-gray-900">{leakEvents.length}</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">Prevented Water Loss</span>
            <span className="text-sm font-medium text-gray-900">~{calculateWaterSaved()} L</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">System Uptime</span>
            <span className="text-sm font-medium text-gray-900">99.7%</span>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Monthly Usage Trend</h3>
          <div className="h-24">
            <canvas ref={chartRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
}
