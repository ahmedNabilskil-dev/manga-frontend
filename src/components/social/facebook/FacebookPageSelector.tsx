"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ExternalLink,
  Facebook,
  Globe,
  Loader2,
  Lock,
  RefreshCw,
  Users,
} from "lucide-react";
import React, { useState } from "react";

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

interface FacebookPageSelectorProps {
  status: FacebookIntegrationStatus | null;
  selectedPage: FacebookPage | null;
  onPageSelect: (page: FacebookPage) => void;
  onConnect: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
  className?: string;
}

// ============================================================================
// FACEBOOK PAGE SELECTOR COMPONENT
// ============================================================================

export const FacebookPageSelector: React.FC<FacebookPageSelectorProps> = ({
  status,
  selectedPage,
  onPageSelect,
  onConnect,
  onRefresh,
  isLoading = false,
  className,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle refresh with loading state
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Format followers count
  const formatFollowersCount = (count: number | undefined) => {
    if (!count) return "";
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  // If not connected, show connection prompt
  if (!status?.connected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-white rounded-xl border border-gray-200 shadow-sm p-6",
          className
        )}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Facebook className="w-8 h-8 text-blue-600" />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Connect Facebook Pages
          </h3>

          <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto">
            Connect your Facebook account to post AI-generated content directly
            to your pages.
          </p>

          <motion.button
            onClick={onConnect}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Facebook className="w-4 h-4" />
                Connect Facebook
              </>
            )}
          </motion.button>

          <p className="text-xs text-gray-500 mt-4">
            We only request permissions to post on your behalf. Your data stays
            secure.
          </p>
        </div>
      </motion.div>
    );
  }

  // If connected but no pages, show empty state
  if (status.pages.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-white rounded-xl border border-gray-200 shadow-sm p-6",
          className
        )}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Pages Found
          </h3>

          <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto">
            We couldn't find any Facebook pages you can post to. Make sure
            you're an admin of at least one page.
          </p>

          <div className="flex items-center justify-center gap-3">
            <motion.button
              onClick={handleRefresh}
              disabled={isRefreshing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRefreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh
            </motion.button>

            <a
              href="https://www.facebook.com/pages/creation/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Create Page
            </a>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* User Info Header */}
      {status.userInfo && (
        <div className="bg-blue-50 rounded-t-xl border border-gray-200 border-b-0 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={status.userInfo.picture}
                alt={status.userInfo.name}
                className="w-8 h-8 rounded-full border border-white shadow-sm"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {status.userInfo.name}
                </p>
                <p className="text-xs text-gray-600">
                  Connected • {status.pages.length} page
                  {status.pages.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-full hover:bg-white/50 transition-colors disabled:opacity-50"
              title="Refresh pages"
            >
              <RefreshCw
                className={cn(
                  "w-4 h-4 text-gray-600",
                  isRefreshing && "animate-spin"
                )}
              />
            </button>
          </div>
        </div>
      )}

      {/* Page Selector Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full bg-white border border-gray-200 rounded-b-xl px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {selectedPage ? (
            <div className="flex items-center gap-3">
              <img
                src={selectedPage.profilePicture}
                alt={selectedPage.name}
                className="w-8 h-8 rounded-full border border-gray-200"
              />
              <div className="text-left">
                <p className="font-medium text-gray-900 text-sm">
                  {selectedPage.name}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  {selectedPage.category}
                  {selectedPage.followersCount && (
                    <>
                      <span>•</span>
                      <Users className="w-3 h-3" />
                      {formatFollowersCount(selectedPage.followersCount)}
                    </>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <span className="text-gray-500 text-sm">
              Select a Facebook page...
            </span>
          )}

          <motion.div
            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </motion.div>
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isDropdownOpen && (
            <>
              {/* Click outside handler */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />

              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 overflow-hidden"
              >
                <div className="max-h-80 overflow-y-auto">
                  {status.pages.map((page, index) => (
                    <motion.button
                      key={page.pageId}
                      onClick={() => {
                        onPageSelect(page);
                        setIsDropdownOpen(false);
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        transition: { delay: index * 0.05 },
                      }}
                      whileHover={{ backgroundColor: "rgb(249, 250, 251)" }}
                      className="w-full p-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
                    >
                      <img
                        src={page.profilePicture}
                        alt={page.name}
                        className="w-10 h-10 rounded-full border border-gray-200 flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {page.name}
                          </p>
                          {selectedPage?.pageId === page.pageId && (
                            <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          {page.category && (
                            <span className="truncate">{page.category}</span>
                          )}

                          {page.followersCount && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>
                                  {formatFollowersCount(page.followersCount)}
                                </span>
                              </div>
                            </>
                          )}

                          <span>•</span>
                          {page.isPublic ? (
                            <div className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              <span>Public</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              <span>Private</span>
                            </div>
                          )}
                        </div>

                        {!page.canPost && (
                          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Cannot post - insufficient permissions
                          </p>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FacebookPageSelector;
