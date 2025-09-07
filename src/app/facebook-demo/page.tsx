"use client";

import { FacebookIntegrationManager } from "@/components/social/facebook";
import { useAuthStore } from "@/stores/auth-store";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ExternalLink,
  Facebook,
  Heart,
  MessageCircle,
  Settings,
  Share,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";

// ============================================================================
// DEMO FACEBOOK PAGE COMPONENT
// ============================================================================

export default function FacebookIntegrationDemo() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    "integration" | "examples" | "analytics"
  >("integration");

  const demoMangaContent = {
    title: "Epic Battle Scene - Chapter 12",
    description:
      "Our hero faces their greatest challenge yet! The animation and artwork came out incredible. What do you think of this dramatic moment? ⚡️",
    imageUrl: "/images/projects/4.avif", // Using existing project image
    hashtags: "#manga #anime #art #digitalart #comic #story #action #MangaAI",
  };

  const mockAnalytics = {
    totalPosts: 24,
    totalReach: 15420,
    totalEngagement: 2847,
    bestPerformingPost: {
      title: "Character Design Reveal",
      reach: 8924,
      likes: 342,
      comments: 56,
      shares: 23,
    },
  };

  const renderIntegrationTab = () => (
    <div className="space-y-8">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Facebook Integration for MangaAI
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Seamlessly share your AI-generated manga content with your audience on
          Facebook. Our intelligent posting system creates engaging posts that
          drive engagement.
        </p>
      </div>

      {user ? (
        <FacebookIntegrationManager
          userId={user.id}
          className="max-w-4xl mx-auto"
        />
      ) : (
        <div className="max-w-md mx-auto bg-yellow-50 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sign In Required
          </h3>
          <p className="text-gray-600 text-sm">
            Please sign in to access Facebook integration features.
          </p>
        </div>
      )}

      {/* Features Overview */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Why Use Facebook Integration?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI-Enhanced Posts
            </h3>
            <p className="text-gray-600 text-sm">
              Our AI automatically creates engaging captions with hashtags and
              calls-to-action tailored for your manga content.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center"
          >
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Multi-Page Management
            </h3>
            <p className="text-gray-600 text-sm">
              Manage multiple Facebook pages from one interface. Perfect for
              creators with multiple projects or brands.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center"
          >
            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Smart Preview
            </h3>
            <p className="text-gray-600 text-sm">
              See exactly how your post will look on Facebook before publishing.
              Make adjustments to maximize engagement.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );

  const renderExamplesTab = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Post Examples</h2>
        <p className="text-gray-600">
          See how your manga content will look when shared on Facebook
        </p>
      </div>

      <div className="max-w-lg mx-auto">
        {/* Mock Facebook Post */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Post Header */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">MA</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">MangaAI Studio</h4>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span>2 hours ago</span>
                  <span>·</span>
                  <span>🌍</span>
                </div>
              </div>
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Settings className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Post Content */}
          <div className="px-4 pb-3">
            <p className="text-gray-900 text-sm">
              🎨 {demoMangaContent.description}
            </p>
            <p className="text-blue-600 text-sm mt-2">
              {demoMangaContent.hashtags}
            </p>
          </div>

          {/* Post Image */}
          <div className="relative">
            <img
              src={demoMangaContent.imageUrl}
              alt="Manga content"
              className="w-full h-80 object-cover"
            />
          </div>

          {/* Engagement Stats */}
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="flex -space-x-1">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Heart className="w-2.5 h-2.5 text-white fill-current" />
                  </div>
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <Heart className="w-2.5 h-2.5 text-white fill-current" />
                  </div>
                </div>
                <span>234 reactions</span>
              </div>
              <div className="flex items-center gap-4">
                <span>42 comments</span>
                <span>18 shares</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-around px-4 py-3">
            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 text-sm font-medium">
              <Heart className="w-5 h-5" />
              Like
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 text-sm font-medium">
              <MessageCircle className="w-5 h-5" />
              Comment
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 text-sm font-medium">
              <Share className="w-5 h-5" />
              Share
            </button>
          </div>
        </div>

        {/* AI Enhancement Examples */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 text-center">
            AI Enhancement Examples
          </h3>

          <div className="grid gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-2">
                BEFORE (Original)
              </div>
              <p className="text-sm text-gray-700">
                "Check out my new manga panel"
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-xs text-blue-600 mb-2">
                AFTER (AI Enhanced)
              </div>
              <p className="text-sm text-gray-900">
                "🎨 Just dropped this incredible action scene! The intensity in
                this panel tells the whole story - our hero's determination
                shines through every line. What do you think happens next? Drop
                your predictions below! ⚡️ #manga #anime #digitalart
                #storytelling #MangaAI"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Performance Analytics
        </h2>
        <p className="text-gray-600">
          Track how your manga content performs on Facebook
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {mockAnalytics.totalPosts}
          </div>
          <div className="text-sm text-gray-500">Total Posts</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {mockAnalytics.totalReach.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Total Reach</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {mockAnalytics.totalEngagement.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Engagement</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {(
              (mockAnalytics.totalEngagement / mockAnalytics.totalReach) *
              100
            ).toFixed(1)}
            %
          </div>
          <div className="text-sm text-gray-500">Engagement Rate</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Best Performing Post
        </h3>
        <div className="space-y-4">
          <div>
            <div className="font-medium text-gray-900">
              {mockAnalytics.bestPerformingPost.title}
            </div>
            <div className="text-sm text-gray-500">
              Reached {mockAnalytics.bestPerformingPost.reach.toLocaleString()}{" "}
              people
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {mockAnalytics.bestPerformingPost.likes}
              </div>
              <div className="text-xs text-gray-500">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {mockAnalytics.bestPerformingPost.comments}
              </div>
              <div className="text-xs text-gray-500">Comments</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">
                {mockAnalytics.bestPerformingPost.shares}
              </div>
              <div className="text-xs text-gray-500">Shares</div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500 mb-4">
          Coming soon: Detailed analytics, posting schedules, and audience
          insights
        </p>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <ExternalLink className="w-4 h-4" />
          View Full Analytics
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <Facebook className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Facebook Integration
              </h1>
              <p className="text-gray-600">
                Share your manga creations with the world
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            {[
              {
                id: "integration",
                label: "Setup & Integration",
                icon: Settings,
              },
              { id: "examples", label: "Post Examples", icon: Facebook },
              { id: "analytics", label: "Analytics Preview", icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "integration" && renderIntegrationTab()}
        {activeTab === "examples" && renderExamplesTab()}
        {activeTab === "analytics" && renderAnalyticsTab()}
      </div>
    </div>
  );
}
