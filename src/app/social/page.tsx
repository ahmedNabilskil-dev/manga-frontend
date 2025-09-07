"use client";
import CommentFeed from "@/components/social/comment/CommentFeed";
import FollowersFeed from "@/components/social/follow/FollowersFeed";
import FollowingFeed from "@/components/social/follow/FollowingFeed";
import NotificationFeed from "@/components/social/notification/NotificationFeed";
import CreatePostCard from "@/components/social/post/createPostCard";
import SocialFeed from "@/components/social/post/SocialFeed";
import {
  Bell,
  Filter,
  Home,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

const SocialMainPage = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUserId] = useState("demo-user-123");
  const [selectedPostId] = useState("demo-post-456");

  const navigationItems = [
    { id: "home", label: "Home", icon: Home, badge: null },
    { id: "notifications", label: "Notifications", icon: Bell, badge: 3 },
    { id: "followers", label: "Followers", icon: Users, badge: null },
    { id: "following", label: "Following", icon: User, badge: null },
    { id: "comments", label: "Comments", icon: MessageCircle, badge: 7 },
  ];

  const trendingTopics = [
    { tag: "#ReactDev", posts: "2.4K posts" },
    { tag: "#WebDesign", posts: "1.8K posts" },
    { tag: "#JavaScript", posts: "5.2K posts" },
    { tag: "#UIDesign", posts: "932 posts" },
    { tag: "#Frontend", posts: "3.1K posts" },
  ];

  const suggestedUsers = [
    {
      id: "1",
      name: "Alex Chen",
      handle: "@alexchen",
      followers: "2.4K",
      avatar: "AC",
    },
    {
      id: "2",
      name: "Sarah Wilson",
      handle: "@sarahw",
      followers: "1.8K",
      avatar: "SW",
    },
    {
      id: "3",
      name: "Mike Johnson",
      handle: "@mikej",
      followers: "3.2K",
      avatar: "MJ",
    },
  ];

  const renderMainContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-6">
            <CreatePostCard
              onSubmit={(content, visibility) =>
                console.log("Post:", content, visibility)
              }
            />
            <SocialFeed />
          </div>
        );
      case "notifications":
        return <NotificationFeed token="demo-token" />;
      case "followers":
        return <FollowersFeed userId={selectedUserId} />;
      case "following":
        return <FollowingFeed userId={selectedUserId} />;
      case "comments":
        return <CommentFeed postId={selectedPostId} />;
      default:
        return <SocialFeed />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">SocialHub</h1>
                <p className="text-blue-100 text-sm">Connect & Share</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-white hover:bg-white/20 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg">
              ME
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Demo User</h3>
              <p className="text-sm text-gray-500">@demouser</p>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">127</div>
              <div className="text-xs text-gray-500">Posts</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">2.4K</div>
              <div className="text-xs text-gray-500">Followers</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">891</div>
              <div className="text-xs text-gray-500">Following</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <div
                      className={`px-2 py-1 text-xs font-bold rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {item.badge}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Settings */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl font-medium transition-colors">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-30 flex-shrink-0">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="hidden sm:block">
                  <h1 className="text-2xl font-bold text-gray-900 capitalize">
                    {activeTab === "home" ? "Feed" : activeTab}
                  </h1>
                  <p className="text-gray-500 text-sm">
                    {activeTab === "home" && "Discover what's happening now"}
                    {activeTab === "notifications" &&
                      "Stay updated with your activities"}
                    {activeTab === "followers" && "People who follow you"}
                    {activeTab === "following" && "People you're following"}
                    {activeTab === "comments" && "Engage in conversations"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="hidden md:flex relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search posts, users..."
                    className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70"
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>

                {/* Action Buttons */}
                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors relative">
                  <Bell className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </button>

                <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="w-4 h-4" />
                  <span>Create</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area with Flex Layout */}
        <div className="flex flex-1 min-h-0">
          {/* Main Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto">{renderMainContent()}</div>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden xl:block w-80 p-6 space-y-6 overflow-y-auto">
            {/* Trending Topics */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Trending Topics
                  </h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {trendingTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-blue-600">
                        {topic.tag}
                      </div>
                      <div className="text-sm text-gray-500">{topic.posts}</div>
                    </div>
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Users */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Suggested Users
                  </h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {suggestedUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-white">
                      {user.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.handle} • {user.followers}
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg text-white p-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6" />
                <h3 className="font-semibold">Your Activity</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-indigo-100">Posts this week</span>
                  <span className="font-bold">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-100">Likes received</span>
                  <span className="font-bold">245</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-100">Comments made</span>
                  <span className="font-bold">89</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default SocialMainPage;
