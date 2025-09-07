"use client";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Facebook,
  Info,
  RefreshCw,
  Shield,
  TrendingUp,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

import FacebookPageSelector from "./FacebookPageSelector";
import FacebookPostComposer from "./FacebookPostComposer";
import FacebookPostPreview from "./FacebookPostPreview";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface FacebookPage {
  pageId: string;
  name: string;
  profilePicture: string;
  category?: string;
  accessToken?: string;
  canPost?: boolean;
  followersCount?: number;
  isPublic?: boolean;
}

interface FacebookIntegrationStatus {
  connected: boolean;
  userInfo?: {
    name: string;
    email: string;
    picture: string;
  };
  pages: FacebookPage[];
  permissions: string[];
  lastSync?: string;
}

interface FacebookPostData {
  message: string;
  imageUrl?: string;
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  linkImage?: string;
}

interface FacebookIntegrationManagerProps {
  userId: string;
  className?: string;
}

// ============================================================================
// FACEBOOK INTEGRATION MANAGER COMPONENT
// ============================================================================

export const FacebookIntegrationManager: React.FC<
  FacebookIntegrationManagerProps
> = ({ userId, className }) => {
  const [status, setStatus] = useState<FacebookIntegrationStatus | null>(null);
  const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewData, setPreviewData] = useState<{
    isOpen: boolean;
    postData: FacebookPostData | null;
  }>({ isOpen: false, postData: null });

  const { toast } = useToast();

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  // Fetch integration status
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/facebook/status", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Facebook status");
      }

      const data = await response.json();

      setStatus(
        data.data || {
          connected: false,
          pages: [],
          permissions: [],
        }
      );

      // Auto-select first page if available and none selected
      if (data.data?.pages?.length > 0 && !selectedPage) {
        const firstPostablePage = data.data.pages.find(
          (page: FacebookPage) => page.canPost !== false
        );
        if (firstPostablePage) {
          setSelectedPage(firstPostablePage);
        }
      }
    } catch (error) {
      console.error("Error fetching Facebook status:", error);
      toast({
        title: "Connection Error",
        description: "Failed to check Facebook integration status.",
        variant: "destructive",
      });
    }
  }, [selectedPage, toast]);

  // Connect to Facebook
  const handleConnect = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/facebook/login", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get Facebook login URL");
      }

      const data = await response.json();

      if (data.success && data.data.loginUrl) {
        // Open Facebook OAuth in a popup
        const popup = window.open(
          data.data.loginUrl,
          "facebook-oauth",
          "width=600,height=600,scrollbars=yes,resizable=yes"
        );

        // Listen for popup close or message
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            // Refresh status after OAuth
            setTimeout(() => {
              fetchStatus();
              setIsLoading(false);
            }, 1000);
          }
        }, 1000);

        // Listen for postMessage from OAuth callback
        const messageListener = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;

          if (event.data.type === "FACEBOOK_OAUTH_SUCCESS") {
            clearInterval(checkClosed);
            popup?.close();
            window.removeEventListener("message", messageListener);

            toast({
              title: "Connected!",
              description: "Successfully connected to Facebook.",
            });

            fetchStatus();
            setIsLoading(false);
          } else if (event.data.type === "FACEBOOK_OAUTH_ERROR") {
            clearInterval(checkClosed);
            popup?.close();
            window.removeEventListener("message", messageListener);

            toast({
              title: "Connection Failed",
              description: event.data.error || "Failed to connect to Facebook.",
              variant: "destructive",
            });
            setIsLoading(false);
          }
        };

        window.addEventListener("message", messageListener);
      } else {
        throw new Error(data.error || "Failed to get login URL");
      }
    } catch (error: any) {
      console.error("Error connecting to Facebook:", error);
      toast({
        title: "Connection Error",
        description: error.message || "Failed to connect to Facebook.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [toast, fetchStatus]);

  // Post to Facebook
  const handlePost = useCallback(
    async (pageId: string, postData: FacebookPostData) => {
      try {
        const response = await fetch("/api/facebook/post", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            pageId,
            message: postData.message,
            imageUrl: postData.imageUrl,
            linkUrl: postData.linkUrl,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to post to Facebook");
        }

        const result = await response.json();

        toast({
          title: "Posted Successfully!",
          description: "Your post has been published to Facebook.",
        });

        return result;
      } catch (error: any) {
        console.error("Error posting to Facebook:", error);
        toast({
          title: "Post Failed",
          description: error.message || "Failed to post to Facebook.",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast]
  );

  // AI enhance post message
  const handleAIEnhance = useCallback(
    async (message: string): Promise<string> => {
      try {
        const response = await fetch("/api/ai/enhance-social-post", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            message,
            platform: "facebook",
            context: "manga creation",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to enhance post");
        }

        const data = await response.json();
        return data.enhancedMessage || message;
      } catch (error) {
        console.error("Error enhancing post:", error);
        throw error;
      }
    },
    []
  );

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handlePageSelect = useCallback((page: FacebookPage) => {
    setSelectedPage(page);
  }, []);

  const handlePreview = useCallback((postData: FacebookPostData) => {
    setPreviewData({
      isOpen: true,
      postData,
    });
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewData({
      isOpen: false,
      postData: null,
    });
  }, []);

  const handlePostFromPreview = useCallback(
    async (pageId: string, postData: FacebookPostData) => {
      await handlePost(pageId, postData);
    },
    [handlePost]
  );

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Initial load
  useEffect(() => {
    fetchStatus().finally(() => setIsLoading(false));
  }, [fetchStatus]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-12", className)}>
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"
          />
          <p className="text-gray-600">Loading Facebook integration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
            <Facebook className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Facebook Integration
            </h2>
            <p className="text-gray-600">
              Share your manga creations with your audience
            </p>
          </div>
        </div>

        {status?.connected && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Connected</span>
            </div>
            <button
              onClick={fetchStatus}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Page Selector */}
      <FacebookPageSelector
        status={status}
        selectedPage={selectedPage}
        onPageSelect={handlePageSelect}
        onConnect={handleConnect}
        onRefresh={fetchStatus}
        isLoading={isLoading}
      />

      {/* Post Composer */}
      {status?.connected && (
        <FacebookPostComposer
          selectedPage={selectedPage}
          onPreview={handlePreview}
          onAIEnhance={handleAIEnhance}
        />
      )}

      {/* Integration Info */}
      {status?.connected && (
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">
                Integration Active
              </h4>
              <p className="text-sm text-blue-700 mb-2">
                Your AI assistant can now post to your Facebook pages on your
                behalf.
              </p>
              <div className="flex items-center gap-4 text-xs text-blue-600">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>Secure OAuth</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    Last synced:{" "}
                    {status.lastSync
                      ? new Date(status.lastSync).toLocaleDateString()
                      : "Now"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>
                    {status.pages.length} page
                    {status.pages.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Preview Modal */}
      <AnimatePresence>
        {previewData.isOpen && previewData.postData && selectedPage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={handleClosePreview}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg"
            >
              <FacebookPostPreview
                page={selectedPage}
                postData={previewData.postData}
                onPost={handlePostFromPreview}
                onCancel={handleClosePreview}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FacebookIntegrationManager;
