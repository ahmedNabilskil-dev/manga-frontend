"use client";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, Facebook, Sparkles, X } from "lucide-react";
import React, { useCallback, useState } from "react";

import FacebookIntegrationManager from "./FacebookIntegrationManager";
import FacebookPostPreview from "./FacebookPostPreview";
import type { FacebookPage, FacebookPostData } from "./types";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AIFacebookPostingToolProps {
  userId: string;
  initialContent?: {
    message?: string;
    imageUrl?: string;
    context?: string; // AI context about the manga/content
  };
  onPost?: (result: {
    success: boolean;
    postId?: string;
    error?: string;
  }) => void;
  className?: string;
}

interface AIEnhancementOptions {
  tone: "professional" | "casual" | "exciting" | "creative" | "friendly";
  includeHashtags: boolean;
  includeCallToAction: boolean;
  targetAudience: "general" | "manga-fans" | "artists" | "creators";
}

// ============================================================================
// AI FACEBOOK POSTING TOOL COMPONENT
// ============================================================================

export const AIFacebookPostingTool: React.FC<AIFacebookPostingToolProps> = ({
  userId,
  initialContent = {},
  onPost,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "setup" | "compose" | "preview" | "posting"
  >("setup");
  const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null);
  const [postData, setPostData] = useState<FacebookPostData>({
    message: initialContent.message || "",
    imageUrl: initialContent.imageUrl || "",
  });
  const [enhancementOptions, setEnhancementOptions] =
    useState<AIEnhancementOptions>({
      tone: "exciting",
      includeHashtags: true,
      includeCallToAction: true,
      targetAudience: "manga-fans",
    });
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const { toast } = useToast();

  // ============================================================================
  // AI ENHANCEMENT FUNCTIONS
  // ============================================================================

  const generateAIPost = useCallback(async () => {
    if (!initialContent.message && !initialContent.imageUrl) {
      toast({
        title: "No Content",
        description: "Please provide some content to create a post from.",
        variant: "destructive",
      });
      return;
    }

    setIsEnhancing(true);

    try {
      const response = await fetch("/api/ai/generate-social-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          platform: "facebook",
          content: {
            message: initialContent.message,
            imageUrl: initialContent.imageUrl,
            context: initialContent.context,
          },
          options: enhancementOptions,
          userPreferences: {
            tone: enhancementOptions.tone,
            includeHashtags: enhancementOptions.includeHashtags,
            includeCallToAction: enhancementOptions.includeCallToAction,
            targetAudience: enhancementOptions.targetAudience,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate post");
      }

      const data = await response.json();

      setPostData({
        message: data.generatedPost.message,
        imageUrl: initialContent.imageUrl || "",
        linkUrl: data.generatedPost.linkUrl,
        linkTitle: data.generatedPost.linkTitle,
        linkDescription: data.generatedPost.linkDescription,
      });

      setCurrentStep("compose");

      toast({
        title: "Post Generated!",
        description: "AI has created a Facebook post for your content.",
      });
    } catch (error: any) {
      console.error("Error generating AI post:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate social media post.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  }, [initialContent, enhancementOptions, toast]);

  const enhanceExistingPost = useCallback(async () => {
    if (!postData.message.trim()) return;

    setIsEnhancing(true);

    try {
      const response = await fetch("/api/ai/enhance-social-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          platform: "facebook",
          message: postData.message,
          options: enhancementOptions,
          context: initialContent.context,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to enhance post");
      }

      const data = await response.json();

      setPostData((prev) => ({
        ...prev,
        message: data.enhancedMessage,
      }));

      toast({
        title: "Post Enhanced!",
        description: "AI has improved your post content.",
      });
    } catch (error: any) {
      console.error("Error enhancing post:", error);
      toast({
        title: "Enhancement Failed",
        description: error.message || "Failed to enhance the post.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  }, [postData.message, enhancementOptions, initialContent.context, toast]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setCurrentStep("setup");
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setCurrentStep("setup");
    setSelectedPage(null);
    setPostData({
      message: initialContent.message || "",
      imageUrl: initialContent.imageUrl || "",
    });
  }, [initialContent]);

  const handlePageSelect = useCallback((page: FacebookPage) => {
    setSelectedPage(page);
  }, []);

  const handlePreview = useCallback(() => {
    setCurrentStep("preview");
  }, []);

  const handleBackToCompose = useCallback(() => {
    setCurrentStep("compose");
  }, []);

  const handlePost = useCallback(
    async (pageId: string, postData: FacebookPostData) => {
      setIsPosting(true);
      setCurrentStep("posting");

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
          description: "Your content has been shared on Facebook.",
        });

        onPost?.({ success: true, postId: result.data.postId });

        // Auto-close after success
        setTimeout(() => {
          handleClose();
        }, 2000);
      } catch (error: any) {
        console.error("Error posting to Facebook:", error);
        toast({
          title: "Post Failed",
          description: error.message || "Failed to post to Facebook.",
          variant: "destructive",
        });

        onPost?.({ success: false, error: error.message });
        setCurrentStep("preview"); // Go back to preview
      } finally {
        setIsPosting(false);
      }
    },
    [toast, onPost, handleClose]
  );

  // ============================================================================
  // RENDER STEPS
  // ============================================================================

  const renderSetupStep = () => (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          AI Facebook Post Creator
        </h3>
        <p className="text-gray-600 text-sm">
          Let AI create an engaging Facebook post from your manga content
        </p>
      </div>

      {/* Content Preview */}
      {(initialContent.message || initialContent.imageUrl) && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Content to Share:
          </h4>

          {initialContent.imageUrl && (
            <img
              src={initialContent.imageUrl}
              alt="Content to share"
              className="w-full max-h-32 object-cover rounded"
            />
          )}

          {initialContent.message && (
            <p className="text-sm text-gray-600 line-clamp-3">
              {initialContent.message}
            </p>
          )}

          {initialContent.context && (
            <div className="text-xs text-gray-500 bg-white rounded px-2 py-1">
              <strong>AI Context:</strong> {initialContent.context}
            </div>
          )}
        </div>
      )}

      {/* Enhancement Options */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Post Style:</h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-600">Tone</label>
            <select
              value={enhancementOptions.tone}
              onChange={(e) =>
                setEnhancementOptions((prev) => ({
                  ...prev,
                  tone: e.target.value as any,
                }))
              }
              className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="exciting">Exciting</option>
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="creative">Creative</option>
              <option value="friendly">Friendly</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-600">Audience</label>
            <select
              value={enhancementOptions.targetAudience}
              onChange={(e) =>
                setEnhancementOptions((prev) => ({
                  ...prev,
                  targetAudience: e.target.value as any,
                }))
              }
              className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="manga-fans">Manga Fans</option>
              <option value="artists">Artists</option>
              <option value="creators">Creators</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={enhancementOptions.includeHashtags}
              onChange={(e) =>
                setEnhancementOptions((prev) => ({
                  ...prev,
                  includeHashtags: e.target.checked,
                }))
              }
              className="rounded"
            />
            <span className="text-sm text-gray-700">Include hashtags</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={enhancementOptions.includeCallToAction}
              onChange={(e) =>
                setEnhancementOptions((prev) => ({
                  ...prev,
                  includeCallToAction: e.target.checked,
                }))
              }
              className="rounded"
            />
            <span className="text-sm text-gray-700">
              Include call-to-action
            </span>
          </label>
        </div>
      </div>

      {/* Action Button */}
      <motion.button
        onClick={generateAIPost}
        disabled={isEnhancing}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isEnhancing ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
            />
            Generating Post...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate Facebook Post
          </>
        )}
      </motion.button>
    </div>
  );

  const renderComposeStep = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Edit Your Post</h3>
        <button
          onClick={enhanceExistingPost}
          disabled={isEnhancing}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-purple-600 bg-purple-50 rounded-full hover:bg-purple-100 transition-colors disabled:opacity-50"
        >
          {isEnhancing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-3 h-3 border-2 border-current border-t-transparent rounded-full"
            />
          ) : (
            <Sparkles className="w-3 h-3" />
          )}
          {isEnhancing ? "Enhancing..." : "AI Enhance"}
        </button>
      </div>

      {/* Post Message */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Post Message
        </label>
        <textarea
          value={postData.message}
          onChange={(e) =>
            setPostData((prev) => ({ ...prev, message: e.target.value }))
          }
          placeholder="Write your Facebook post message..."
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={6}
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">
            {postData.message.length}/63,206 characters
          </span>
        </div>
      </div>

      {/* Image Preview */}
      {postData.imageUrl && (
        <div>
          <label className="text-sm font-medium text-gray-700">Image</label>
          <div className="mt-1 relative inline-block">
            <img
              src={postData.imageUrl}
              alt="Post image"
              className="max-w-xs max-h-32 rounded border border-gray-200"
            />
            <button
              onClick={() => setPostData((prev) => ({ ...prev, imageUrl: "" }))}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Facebook Page Integration */}
      <div className="border-t pt-6">
        <FacebookIntegrationManager userId={userId} className="space-y-4" />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          onClick={() => setCurrentStep("setup")}
          className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Back
        </button>
        <motion.button
          onClick={handlePreview}
          disabled={!postData.message.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Eye className="w-4 h-4" />
          Preview Post
        </motion.button>
      </div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        onClick={handleOpen}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors shadow-sm",
          className
        )}
      >
        <Facebook className="w-4 h-4" />
        <Sparkles className="w-4 h-4" />
        Post to Facebook
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                    <Facebook className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    AI Facebook Publisher
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                {currentStep === "setup" && renderSetupStep()}
                {currentStep === "compose" && renderComposeStep()}
                {currentStep === "preview" && selectedPage && (
                  <div className="p-6">
                    <FacebookPostPreview
                      page={selectedPage}
                      postData={postData}
                      onPost={handlePost}
                      onCancel={handleBackToCompose}
                      isPosting={isPosting}
                    />
                  </div>
                )}
                {currentStep === "posting" && (
                  <div className="p-12 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
                    />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Posting to Facebook...
                    </h3>
                    <p className="text-gray-600">
                      Your content is being published. Please wait.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIFacebookPostingTool;
