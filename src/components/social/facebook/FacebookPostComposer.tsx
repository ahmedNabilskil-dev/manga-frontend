"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  Facebook,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Sparkles,
  Type,
  Upload,
  X,
} from "lucide-react";
import React, { useCallback, useRef, useState } from "react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface FacebookPostData {
  message: string;
  imageUrl?: string;
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  linkImage?: string;
}

interface FacebookPage {
  pageId: string;
  name: string;
  profilePicture: string;
  category?: string;
}

interface FacebookPostComposerProps {
  selectedPage: FacebookPage | null;
  initialData?: Partial<FacebookPostData>;
  onPreview: (postData: FacebookPostData) => void;
  onAIEnhance?: (message: string) => Promise<string>;
  className?: string;
}

// ============================================================================
// FACEBOOK POST COMPOSER COMPONENT
// ============================================================================

export const FacebookPostComposer: React.FC<FacebookPostComposerProps> = ({
  selectedPage,
  initialData = {},
  onPreview,
  onAIEnhance,
  className,
}) => {
  const [postData, setPostData] = useState<FacebookPostData>({
    message: initialData.message || "",
    imageUrl: initialData.imageUrl || "",
    linkUrl: initialData.linkUrl || "",
    linkTitle: initialData.linkTitle || "",
    linkDescription: initialData.linkDescription || "",
    linkImage: initialData.linkImage || "",
  });

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [imageUploadState, setImageUploadState] = useState<{
    isUploading: boolean;
    progress: number;
    error?: string;
  }>({ isUploading: false, progress: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle message change with auto-resize
  const handleMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setPostData((prev) => ({ ...prev, message: value }));

      // Auto-resize textarea
      const textarea = e.target;
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    },
    []
  );

  // Handle image upload
  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setImageUploadState((prev) => ({
        ...prev,
        error: "Please select an image file",
      }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setImageUploadState((prev) => ({
        ...prev,
        error: "Image must be smaller than 10MB",
      }));
      return;
    }

    setImageUploadState({ isUploading: true, progress: 0 });

    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 20) {
        setImageUploadState((prev) => ({ ...prev, progress }));
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Create image URL (in real app, this would be uploaded to your server)
      const imageUrl = URL.createObjectURL(file);

      setPostData((prev) => ({ ...prev, imageUrl }));
      setImageUploadState({ isUploading: false, progress: 100 });
    } catch (error) {
      setImageUploadState({
        isUploading: false,
        progress: 0,
        error: "Failed to upload image",
      });
    }
  }, []);

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    },
    [handleImageUpload]
  );

  // Handle AI enhancement
  const handleAIEnhance = useCallback(async () => {
    if (!onAIEnhance || !postData.message.trim()) return;

    setIsEnhancing(true);
    try {
      const enhancedMessage = await onAIEnhance(postData.message);
      setPostData((prev) => ({ ...prev, message: enhancedMessage }));

      // Auto-resize textarea after enhancement
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = `${Math.min(
            textareaRef.current.scrollHeight,
            200
          )}px`;
        }
      }, 100);
    } catch (error) {
      console.error("Failed to enhance post:", error);
    } finally {
      setIsEnhancing(false);
    }
  }, [onAIEnhance, postData.message]);

  // Handle preview
  const handlePreview = useCallback(() => {
    if (!selectedPage || !postData.message.trim()) return;
    onPreview(postData);
  }, [selectedPage, postData, onPreview]);

  // Handle remove image
  const handleRemoveImage = useCallback(() => {
    setPostData((prev) => ({ ...prev, imageUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Character count for message
  const characterCount = postData.message.length;
  const maxCharacters = 63206; // Facebook's limit

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-200 shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
            <Facebook className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Create Facebook Post
            </h3>
            {selectedPage ? (
              <p className="text-sm text-gray-600">
                Posting as{" "}
                <span className="font-medium">{selectedPage.name}</span>
              </p>
            ) : (
              <p className="text-sm text-red-600">Select a page to continue</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Message Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Type className="w-4 h-4" />
              Post Message
            </label>
            {onAIEnhance && (
              <motion.button
                onClick={handleAIEnhance}
                disabled={isEnhancing || !postData.message.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 rounded-full hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    AI Enhance
                  </>
                )}
              </motion.button>
            )}
          </div>

          <div className="relative">
            <textarea
              ref={textareaRef}
              value={postData.message}
              onChange={handleMessageChange}
              placeholder="What's on your mind? Share your manga creation with the world..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              rows={4}
              style={{ minHeight: "100px", maxHeight: "200px" }}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-500">
              <span
                className={characterCount > maxCharacters ? "text-red-500" : ""}
              >
                {characterCount.toLocaleString()}
              </span>
              <span className="text-gray-300">
                {" "}
                / {maxCharacters.toLocaleString()}
              </span>
            </div>
          </div>

          {characterCount > maxCharacters && (
            <p className="text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Message exceeds Facebook's character limit
            </p>
          )}
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Image (Optional)
          </label>

          {postData.imageUrl ? (
            <div className="relative inline-block">
              <img
                src={postData.imageUrl}
                alt="Post image"
                className="max-w-xs max-h-48 rounded-lg border border-gray-200 object-cover"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={imageUploadState.isUploading}
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {imageUploadState.isUploading ? (
                  <>
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                    <p className="text-sm text-gray-600">
                      Uploading... {imageUploadState.progress}%
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Click to upload an image
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </>
                )}
              </button>

              {imageUploadState.error && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {imageUploadState.error}
                </p>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Link Preview (Future Enhancement) */}
        {postData.linkUrl && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Link Preview
            </label>
            <div className="border border-gray-200 rounded-lg p-3">
              <input
                type="url"
                value={postData.linkUrl}
                onChange={(e) =>
                  setPostData((prev) => ({ ...prev, linkUrl: e.target.value }))
                }
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {!selectedPage ? (
            <span className="text-red-600">
              Please select a Facebook page first
            </span>
          ) : !postData.message.trim() ? (
            <span>Write a message to preview your post</span>
          ) : (
            <span className="text-green-600 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Ready to preview
            </span>
          )}
        </div>

        <motion.button
          onClick={handlePreview}
          disabled={
            !selectedPage ||
            !postData.message.trim() ||
            characterCount > maxCharacters
          }
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Eye className="w-4 h-4" />
          Preview Post
        </motion.button>
      </div>
    </div>
  );
};

export default FacebookPostComposer;
