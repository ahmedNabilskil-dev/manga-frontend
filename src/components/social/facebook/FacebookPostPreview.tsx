"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Facebook,
  Globe,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share,
  ThumbsUp,
  X,
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
}

interface FacebookPostData {
  message: string;
  imageUrl?: string;
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  linkImage?: string;
}

interface FacebookPostPreviewProps {
  page: FacebookPage;
  postData: FacebookPostData;
  onPost: (pageId: string, postData: FacebookPostData) => Promise<void>;
  onCancel: () => void;
  isPosting?: boolean;
  className?: string;
}

// ============================================================================
// FACEBOOK POST PREVIEW COMPONENT
// ============================================================================

export const FacebookPostPreview: React.FC<FacebookPostPreviewProps> = ({
  page,
  postData,
  onPost,
  onCancel,
  isPosting = false,
  className,
}) => {
  const [postStatus, setPostStatus] = useState<
    "preview" | "posting" | "success" | "error"
  >("preview");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Handle post submission
  const handlePost = async () => {
    try {
      setPostStatus("posting");
      await onPost(page.pageId, postData);
      setPostStatus("success");

      // Auto-close after success
      setTimeout(() => {
        onCancel();
      }, 2000);
    } catch (error: any) {
      setPostStatus("error");
      setErrorMessage(error.message || "Failed to post to Facebook");
    }
  };

  // Format timestamp
  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-w-lg w-full",
        className
      )}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Facebook className="w-5 h-5" />
            <h3 className="font-semibold text-sm">Facebook Post Preview</h3>
          </div>
          <button
            onClick={onCancel}
            disabled={postStatus === "posting"}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Messages */}
      <AnimatePresence>
        {postStatus === "posting" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-blue-50 border-b border-blue-200 px-4 py-3"
          >
            <div className="flex items-center gap-2 text-blue-700">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              />
              <span className="text-sm font-medium">
                Posting to Facebook...
              </span>
            </div>
          </motion.div>
        )}

        {postStatus === "success" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-50 border-b border-green-200 px-4 py-3"
          >
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Successfully posted to Facebook!
              </span>
            </div>
          </motion.div>
        )}

        {postStatus === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 border-b border-red-200 px-4 py-3"
          >
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <div>
                <span className="text-sm font-medium">Failed to post</span>
                {errorMessage && (
                  <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Facebook Post Mockup */}
      <div className="p-4 bg-gray-50">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Post Header */}
          <div className="flex items-start justify-between p-4 pb-3">
            <div className="flex items-center gap-3">
              <img
                src={page.profilePicture || "/api/placeholder/40/40"}
                alt={page.name}
                className="w-10 h-10 rounded-full border border-gray-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/api/placeholder/40/40";
                }}
              />
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">
                  {page.name}
                </h4>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span>{formatTime()}</span>
                  <span>·</span>
                  <Globe className="w-3 h-3" />
                </div>
              </div>
            </div>
            <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Post Content */}
          <div className="px-4 pb-3">
            {postData.message && (
              <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
                {postData.message}
              </p>
            )}
          </div>

          {/* Post Image */}
          {postData.imageUrl && (
            <div className="relative">
              <img
                src={postData.imageUrl}
                alt="Post content"
                className="w-full max-h-80 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Link Preview */}
          {postData.linkUrl && (
            <div className="mx-4 mb-3 border border-gray-200 rounded-lg overflow-hidden">
              {postData.linkImage && (
                <img
                  src={postData.linkImage}
                  alt="Link preview"
                  className="w-full h-32 object-cover"
                />
              )}
              <div className="p-3">
                <div className="text-xs text-gray-500 uppercase mb-1">
                  {new URL(postData.linkUrl).hostname}
                </div>
                {postData.linkTitle && (
                  <h5 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                    {postData.linkTitle}
                  </h5>
                )}
                {postData.linkDescription && (
                  <p className="text-gray-600 text-xs line-clamp-2">
                    {postData.linkDescription}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Post Actions */}
          <div className="border-t border-gray-200">
            <div className="flex items-center justify-between px-4 py-2 text-gray-500">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 text-xs hover:text-blue-600 transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  <span>Like</span>
                </button>
                <button className="flex items-center gap-1.5 text-xs hover:text-blue-600 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>Comment</span>
                </button>
                <button className="flex items-center gap-1.5 text-xs hover:text-blue-600 transition-colors">
                  <Share className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 border-t border-gray-200">
        <button
          onClick={onCancel}
          disabled={postStatus === "posting"}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <motion.button
          onClick={handlePost}
          disabled={postStatus === "posting" || postStatus === "success"}
          whileHover={{ scale: postStatus === "posting" ? 1 : 1.02 }}
          whileTap={{ scale: postStatus === "posting" ? 1 : 0.98 }}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {postStatus === "posting" ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              />
              Posting...
            </>
          ) : postStatus === "success" ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Posted!
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Post to Facebook
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default FacebookPostPreview;
