import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LeakEvent } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeakHistory from "../components/history/leak-history";
import SystemStats from "../components/history/system-stats";
import UsageTrends from "../components/history/usage-trends";
import { useAuth } from "@/hooks/use-auth";

export default function HistoryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("leak-history");
  
  // Fetch leak events
  const { data: leakEvents = [] } = useQuery<LeakEvent[]>({
    queryKey: ["/api/leak-events"],
    enabled: !!user,
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">System History</h1>
      
      <Tabs defaultValue="leak-history" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leak-history">Leak History</TabsTrigger>
          <TabsTrigger value="statistics">System Statistics</TabsTrigger>
          <TabsTrigger value="usage-trends">Usage Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="leak-history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Leak Event History</CardTitle>
            </CardHeader>
            <CardContent>
              <LeakHistory leakEvents={leakEvents} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="statistics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Performance Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <SystemStats leakEvents={leakEvents} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="usage-trends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Water Usage Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <UsageTrends />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}