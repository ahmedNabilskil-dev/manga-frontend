"use client";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  aiEnhancementService,
  facebookService,
} from "@/services/facebook.service";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Bot,
  Clock,
  Facebook,
  Globe,
  Hash,
  Heart,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Send,
  Share,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AIFacebookPostRequest {
  content: {
    message?: string;
    imageUrl?: string;
    context?: string;
    mangaTitle?: string;
    chapterNumber?: number;
    description?: string;
  };
  aiOptions: {
    tone: "professional" | "casual" | "exciting" | "creative" | "friendly";
    includeHashtags: boolean;
    includeCallToAction: boolean;
    targetAudience: "general" | "manga-fans" | "artists" | "creators";
    postType:
      | "announcement"
      | "behind-scenes"
      | "character-reveal"
      | "chapter-release"
      | "general";
  };
  selectedPageId?: string;
}

interface FacebookPostResult {
  message: string;
  imageUrl?: string;
  hashtags: string[];
  estimatedReach?: number;
  suggestedPostTime?: string;
}

interface AIFacebookPostCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (result: {
    success: boolean;
    postId?: string;
    error?: string;
  }) => void;
  initialContent?: {
    message?: string;
    imageUrl?: string;
    context?: string;
    mangaTitle?: string;
    chapterNumber?: number;
  };
  userId: string;
  className?: string;
}

// ============================================================================
// AI FACEBOOK POST CREATOR COMPONENT
// ============================================================================

export const AIFacebookPostCreator: React.FC<AIFacebookPostCreatorProps> = ({
  isOpen,
  onClose,
  onPost,
  initialContent = {},
  userId,
  className,
}) => {
  const [step, setStep] = useState<
    "options" | "generate" | "preview" | "posting"
  >("options");
  const [aiOptions, setAiOptions] = useState({
    tone: "exciting" as const,
    includeHashtags: true,
    includeCallToAction: true,
    targetAudience: "manga-fans" as const,
    postType: "general" as const,
  });

  const [generatedPost, setGeneratedPost] = useState<FacebookPostResult | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string>("");
  const [facebookPages, setFacebookPages] = useState<any[]>([]);

  const { toast } = useToast();

  // Load Facebook pages on mount
  useEffect(() => {
    if (isOpen) {
      loadFacebookPages();
    }
  }, [isOpen]);

  const loadFacebookPages = async () => {
    try {
      const response = await facebookService.getPages();
      if (response.success && response.data) {
        setFacebookPages(response.data.pages);
        // Auto-select first page if available
        if (response.data.pages.length > 0) {
          setSelectedPageId(response.data.pages[0].pageId);
        }
      }
    } catch (error) {
      console.error("Error loading Facebook pages:", error);
    }
  };

  const generateAIPost = useCallback(async () => {
    setIsGenerating(true);
    setStep("generate");

    try {
      const response = await aiEnhancementService.generateSocialPost({
        platform: "facebook",
        content: {
          message: initialContent.message,
          imageUrl: initialContent.imageUrl,
          context: `${initialContent.context} - ${initialContent.mangaTitle} ${
            initialContent.chapterNumber
              ? `Chapter ${initialContent.chapterNumber}`
              : ""
          }`.trim(),
        },
        options: aiOptions,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to generate post");
      }

      const result: FacebookPostResult = {
        message: response.data.generatedPost.message,
        imageUrl: initialContent.imageUrl,
        hashtags: response.data.generatedPost.hashtags || [],
        estimatedReach: Math.floor(Math.random() * 5000) + 1000, // Mock data
        suggestedPostTime: new Date(
          Date.now() + 2 * 60 * 60 * 1000
        ).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      };

      setGeneratedPost(result);
      setStep("preview");

      toast({
        title: "Post Generated! ✨",
        description:
          "AI has created an engaging Facebook post for your manga content.",
      });
    } catch (error: any) {
      console.error("Error generating AI post:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate Facebook post.",
        variant: "destructive",
      });
      setStep("options");
    } finally {
      setIsGenerating(false);
    }
  }, [initialContent, aiOptions, toast]);

  const publishPost = useCallback(async () => {
    if (!generatedPost || !selectedPageId) return;

    setIsPosting(true);
    setStep("posting");

    try {
      const response = await facebookService.postToPage({
        pageId: selectedPageId,
        message: generatedPost.message,
        imageUrl: generatedPost.imageUrl,
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to post to Facebook");
      }

      toast({
        title: "Posted Successfully! 🎉",
        description: "Your manga content is now live on Facebook!",
      });

      onPost({ success: true, postId: response.data?.postId });

      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error("Error posting to Facebook:", error);
      toast({
        title: "Post Failed",
        description: error.message || "Failed to post to Facebook.",
        variant: "destructive",
      });

      onPost({ success: false, error: error.message });
      setStep("preview");
    } finally {
      setIsPosting(false);
    }
  }, [generatedPost, selectedPageId, onPost, onClose, toast]);

  const handleClose = useCallback(() => {
    setStep("options");
    setGeneratedPost(null);
    setIsGenerating(false);
    setIsPosting(false);
    onClose();
  }, [onClose]);

  // Render AI Options Step
  const renderOptionsStep = () => (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bot className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          AI Facebook Post Creator
        </h3>
        <p className="text-gray-600">
          Let AI create the perfect Facebook post for your manga content
        </p>
      </div>

      {/* Content Preview */}
      {(initialContent.message || initialContent.imageUrl) && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Content to Share
          </h4>

          {initialContent.imageUrl && (
            <img
              src={initialContent.imageUrl}
              alt="Content to share"
              className="w-full max-h-40 object-cover rounded-lg"
            />
          )}

          <div className="space-y-2 text-sm">
            {initialContent.mangaTitle && (
              <div>
                <span className="font-medium text-gray-700">Title:</span>{" "}
                <span className="text-gray-600">
                  {initialContent.mangaTitle}
                </span>
              </div>
            )}

            {initialContent.chapterNumber && (
              <div>
                <span className="font-medium text-gray-700">Chapter:</span>{" "}
                <span className="text-gray-600">
                  {initialContent.chapterNumber}
                </span>
              </div>
            )}

            {initialContent.message && (
              <div>
                <span className="font-medium text-gray-700">Description:</span>
                <p className="text-gray-600 line-clamp-2 mt-1">
                  {initialContent.message}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Customization Options */}
      <div className="space-y-5">
        <h4 className="text-lg font-semibold text-gray-900">
          Customize Your Post
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tone & Style
            </label>
            <select
              value={aiOptions.tone}
              onChange={(e) =>
                setAiOptions((prev) => ({
                  ...prev,
                  tone: e.target.value as any,
                }))
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="exciting">🔥 Exciting & Energetic</option>
              <option value="professional">💼 Professional</option>
              <option value="casual">😊 Casual & Friendly</option>
              <option value="creative">🎨 Creative & Artistic</option>
              <option value="friendly">🤗 Warm & Friendly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience
            </label>
            <select
              value={aiOptions.targetAudience}
              onChange={(e) =>
                setAiOptions((prev) => ({
                  ...prev,
                  targetAudience: e.target.value as any,
                }))
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="manga-fans">📚 Manga & Anime Fans</option>
              <option value="artists">🎨 Digital Artists</option>
              <option value="creators">✨ Content Creators</option>
              <option value="general">🌍 General Audience</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Post Type
          </label>
          <select
            value={aiOptions.postType}
            onChange={(e) =>
              setAiOptions((prev) => ({
                ...prev,
                postType: e.target.value as any,
              }))
            }
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="general">📢 General Update</option>
            <option value="chapter-release">📖 Chapter Release</option>
            <option value="character-reveal">👤 Character Reveal</option>
            <option value="behind-scenes">🎬 Behind the Scenes</option>
            <option value="announcement">🎉 Special Announcement</option>
          </select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Enhancement Options
            </label>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={aiOptions.includeHashtags}
                onChange={(e) =>
                  setAiOptions((prev) => ({
                    ...prev,
                    includeHashtags: e.target.checked,
                  }))
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  Include relevant hashtags
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={aiOptions.includeCallToAction}
                onChange={(e) =>
                  setAiOptions((prev) => ({
                    ...prev,
                    includeCallToAction: e.target.checked,
                  }))
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  Add call-to-action for engagement
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Facebook Page Selection */}
      {facebookPages.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Facebook Page
          </label>
          <select
            value={selectedPageId}
            onChange={(e) => setSelectedPageId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {facebookPages.map((page) => (
              <option key={page.pageId} value={page.pageId}>
                {page.name} {page.category && `(${page.category})`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Generate Button */}
      <motion.button
        onClick={generateAIPost}
        disabled={isGenerating || facebookPages.length === 0}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        <Wand2 className="w-5 h-5" />
        {isGenerating ? "Generating Magic..." : "Generate Facebook Post"}
      </motion.button>

      {facebookPages.length === 0 && (
        <div className="text-center py-4">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Please connect your Facebook pages first to continue.
          </p>
        </div>
      )}
    </div>
  );

  // Render Generation Step
  const renderGenerateStep = () => (
    <div className="p-8 text-center">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <Sparkles className="w-8 h-8 text-white" />
      </motion.div>

      <h3 className="text-xl font-bold text-gray-900 mb-4">
        AI is Creating Your Post...
      </h3>

      <div className="space-y-2 text-sm text-gray-600">
        <p>🎨 Analyzing your manga content</p>
        <p>✨ Crafting the perfect caption</p>
        <p>🔧 Adding engaging hashtags</p>
        <p>🚀 Optimizing for maximum reach</p>
      </div>

      <div className="mt-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );

  // Render Preview Step
  const renderPreviewStep = () => {
    if (!generatedPost) return null;

    const selectedPage = facebookPages.find(
      (page) => page.pageId === selectedPageId
    );

    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Preview Your Post
          </h3>
          <p className="text-gray-600">
            See how your post will look on Facebook
          </p>
        </div>

        {/* Facebook Post Preview */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-md mx-auto">
            {/* Post Header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedPage?.profilePicture || "/api/placeholder/40/40"}
                  alt={selectedPage?.name || "Page"}
                  className="w-10 h-10 rounded-full border border-gray-200"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {selectedPage?.name || "Your Page"}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Now</span>
                    <span>·</span>
                    <Globe className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-3">
              <p className="text-gray-900 text-sm whitespace-pre-wrap leading-relaxed">
                {generatedPost.message}
              </p>
            </div>

            {/* Post Image */}
            {generatedPost.imageUrl && (
              <div className="relative">
                <img
                  src={generatedPost.imageUrl}
                  alt="Post content"
                  className="w-full max-h-60 object-cover"
                />
              </div>
            )}

            {/* Mock Engagement */}
            <div className="border-t border-gray-200">
              <div className="flex items-center justify-around px-4 py-3">
                <button className="flex items-center gap-1.5 text-gray-600 text-sm">
                  <Heart className="w-4 h-4" />
                  Like
                </button>
                <button className="flex items-center gap-1.5 text-gray-600 text-sm">
                  <MessageSquare className="w-4 h-4" />
                  Comment
                </button>
                <button className="flex items-center gap-1.5 text-gray-600 text-sm">
                  <Share className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Post Analytics Preview */}
        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Insights
          </h4>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700 font-medium">
                Estimated Reach:
              </span>
              <div className="text-blue-900 font-semibold">
                {generatedPost.estimatedReach?.toLocaleString()} people
              </div>
            </div>

            <div>
              <span className="text-blue-700 font-medium">
                Best Time to Post:
              </span>
              <div className="text-blue-900 font-semibold">
                {generatedPost.suggestedPostTime}
              </div>
            </div>
          </div>

          {generatedPost.hashtags.length > 0 && (
            <div className="mt-3">
              <span className="text-blue-700 font-medium text-sm">
                Hashtags:
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {generatedPost.hashtags.slice(0, 5).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setStep("options")}
            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            ← Edit Options
          </button>

          <motion.button
            onClick={publishPost}
            disabled={isPosting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-colors font-medium shadow-lg disabled:opacity-50"
          >
            {isPosting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Post to Facebook
              </>
            )}
          </motion.button>
        </div>
      </div>
    );
  };

  // Render Posting Step
  const renderPostingStep = () => (
    <div className="p-8 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <Facebook className="w-8 h-8 text-white" />
      </motion.div>

      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Publishing to Facebook...
      </h3>

      <p className="text-gray-600">
        Your amazing manga content is going live! 🚀
      </p>
    </div>
  );

  return (
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
            className={cn(
              "bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden",
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full flex items-center justify-center">
                  <Facebook className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  AI Facebook Publisher
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              {step === "options" && renderOptionsStep()}
              {step === "generate" && renderGenerateStep()}
              {step === "preview" && renderPreviewStep()}
              {step === "posting" && renderPostingStep()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIFacebookPostCreator;
