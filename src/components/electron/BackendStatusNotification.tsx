"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, RefreshCw, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BackendStatusData {
  title: string;
  body: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: string;
}

interface BackendStatusNotificationProps {
  className?: string;
}

export function BackendStatusNotification({
  className,
}: BackendStatusNotificationProps) {
  const [statusData, setStatusData] = useState<BackendStatusData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if we're in an Electron environment
    if (typeof window !== "undefined" && (window as any).api) {
      const api = (window as any).api;

      // Listen for backend status updates
      api.onBackendStatus((data: BackendStatusData) => {
        console.log("[frontend] Received backend status:", data);
        setStatusData(data);
        setIsVisible(true);

        // Auto-hide success messages after 5 seconds
        if (data.type === "success") {
          setTimeout(() => {
            setIsVisible(false);
          }, 5000);
        }
      });

      // Cleanup listener on unmount
      return () => {
        if (api.removeBackendStatusListener) {
          api.removeBackendStatusListener();
        }
      };
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!statusData || !isVisible) {
    return null;
  }

  const getIcon = () => {
    switch (statusData.type) {
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      case "warning":
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    switch (statusData.type) {
      case "success":
        return "default"; // You may want to add a success variant to your Alert component
      case "warning":
        return "default";
      case "error":
        return "destructive";
      default:
        return "default";
    }
  };

  const getBorderColor = () => {
    switch (statusData.type) {
      case "success":
        return "border-green-500";
      case "warning":
        return "border-yellow-500";
      case "error":
        return "border-red-500";
      default:
        return "border-blue-500";
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md ${className}`}>
      <Alert
        variant={getVariant()}
        className={`border-2 ${getBorderColor()} shadow-lg`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2">
            {getIcon()}
            <div className="space-y-1">
              <AlertTitle className="text-sm font-medium">
                {statusData.title}
              </AlertTitle>
              <AlertDescription className="text-sm">
                {statusData.body}
              </AlertDescription>
              <div className="text-xs text-muted-foreground">
                {new Date(statusData.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 hover:bg-transparent"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </Alert>
    </div>
  );
}
