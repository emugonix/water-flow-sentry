import { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { 
  Droplet, 
  HomeIcon, 
  HistoryIcon, 
  SettingsIcon, 
  WrenchIcon, 
  HelpCircleIcon, 
  MenuIcon, 
  BellIcon,
  LogOutIcon
} from "lucide-react";
import { User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useMobile } from "@/hooks/use-mobile";
import { useLocation, Link } from "wouter";
import { queryClient } from "@/lib/queryClient";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User | null;
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const { logoutMutation } = useAuth();
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const currentPath = location.split('/').filter(Boolean)[0];
  
  // Prefetch functions for page data
  const prefetchHistoryData = () => {
    if (currentPath !== 'history') {
      queryClient.prefetchQuery({
        queryKey: ["/api/leak-events"],
      });
    }
  };
  
  const prefetchDashboardData = () => {
    if (currentPath !== '') {
      queryClient.prefetchQuery({
        queryKey: ["/api/sensors"],
      });
      queryClient.prefetchQuery({
        queryKey: ["/api/valve-status/current"],
      });
      queryClient.prefetchQuery({
        queryKey: ["/api/system-settings"],
      });
    }
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const userInitials = user?.name ? getInitials(user.name) : user?.username.substring(0, 2).toUpperCase() || 'U';

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar navigation */}
      <div 
        className={`${
          isMobile 
            ? `fixed inset-0 z-40 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out` 
            : 'flex flex-shrink-0'
        }`}
      >
        {/* Backdrop for mobile */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <div className={`flex flex-col w-64 bg-sidebar text-sidebar-foreground ${isMobile ? 'relative z-50' : ''}`}>
          <div className="flex items-center h-16 px-4 bg-sidebar-primary border-b border-sidebar-border">
            <div className="flex items-center space-x-2">
              <Droplet className="h-6 w-6" />
              <span className="text-lg font-semibold">Water Monitor</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              <Link 
                href="/" 
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${!currentPath ? 'text-sidebar-foreground bg-sidebar-accent' : 'text-gray-300 hover:text-sidebar-foreground hover:bg-sidebar-accent'}`}
                onMouseEnter={prefetchDashboardData}
                onFocus={prefetchDashboardData}
              >
                <HomeIcon className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
              <Link 
                href="/history" 
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${currentPath === 'history' ? 'text-sidebar-foreground bg-sidebar-accent' : 'text-gray-300 hover:text-sidebar-foreground hover:bg-sidebar-accent'}`}
                onMouseEnter={prefetchHistoryData}
                onFocus={prefetchHistoryData}
              >
                <HistoryIcon className="mr-3 h-5 w-5" />
                History
              </Link>
              <a href="#" className="flex items-center px-2 py-2 text-sm font-medium text-gray-300 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md">
                <SettingsIcon className="mr-3 h-5 w-5" />
                Settings
              </a>
              <a href="#" className="flex items-center px-2 py-2 text-sm font-medium text-gray-300 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md">
                <HelpCircleIcon className="mr-3 h-5 w-5" />
                Help & Support
              </a>
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-sidebar-border p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <span className="inline-block h-9 w-9 rounded-full bg-sidebar-primary text-center leading-9">
                    <span className="text-sidebar-foreground font-medium">{userInitials}</span>
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-sidebar-foreground">{user?.name || user?.username || 'User'}</p>
                  <p className="text-xs font-medium text-gray-300">{user?.role || 'User'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          {isMobile && (
            <button 
              type="button" 
              className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <MenuIcon className="h-6 w-6" />
            </button>
          )}
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <div className="max-w-2xl w-full">
                <h1 className="text-2xl font-semibold text-gray-800">
                  {currentPath === 'history' ? 'Water Leakage History' : 'Water Leakage Monitoring Dashboard'}
                </h1>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* Notification bell */}
              <button type="button" className="relative p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" />
                <span id="notification-badge" className="absolute top-0 right-0 inline-block w-3 h-3 bg-destructive rounded-full border-2 border-white"></span>
              </button>

              {/* User profile dropdown */}
              <div className="ml-3 relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                      <span className="sr-only">Open user menu</span>
                      <span className="inline-block h-8 w-8 rounded-full bg-primary text-center leading-8">
                        <span className="text-white font-medium">{userInitials}</span>
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive focus:text-destructive flex items-center"
                      onClick={handleLogout}
                    >
                      <LogOutIcon className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Main dashboard content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
