"use client";

import { Button } from "@/components/ui/button";
import { Scene } from "@/types/entities";
import { motion } from "framer-motion";
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Edit,
  Eye,
  Layers,
  MapPin,
  Moon,
  MoreVertical,
  Share2,
  Shirt,
  Sun,
  Sunrise,
  Sunset,
  Zap,
} from "lucide-react";

// ============================================================================
// COMPONENTS
// ============================================================================

const Badge = ({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}) => {
  const variants = {
    default:
      "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg",
    secondary:
      "bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600",
    outline:
      "border-2 border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-300",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

const Card = ({
  children,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "glass" | "gradient";
}) => {
  const variants = {
    default:
      "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700",
    glass:
      "bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50",
    gradient:
      "bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-900/80 dark:to-gray-800/80 border border-white/30 dark:border-gray-700/50",
  };

  return (
    <div className={`rounded-2xl shadow-xl ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SceneDetailView({ scene }: { scene: Scene }) {
  const config = {
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    bgGradient: "from-orange-50/80 via-amber-50/80 to-yellow-50/80",
    darkBgGradient: "from-orange-950/50 via-amber-950/50 to-yellow-950/50",
  };

  const getTimeOfDayIcon = (timeOfDay: string) => {
    switch (timeOfDay) {
      case "dawn":
        return <Sunrise className="w-5 h-5" />;
      case "morning":
        return <Sun className="w-5 h-5" />;
      case "noon":
        return <Sun className="w-5 h-5" />;
      case "afternoon":
        return <Sun className="w-5 h-5" />;
      case "evening":
        return <Sunset className="w-5 h-5" />;
      case "night":
        return <Moon className="w-5 h-5" />;
      default:
        return <Sun className="w-5 h-5" />;
    }
  };

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case "sunny":
        return <Sun className="w-5 h-5" />;
      case "cloudy":
        return <Cloud className="w-5 h-5" />;
      case "rainy":
        return <CloudRain className="w-5 h-5" />;
      case "stormy":
        return <Zap className="w-5 h-5" />;
      case "snowy":
        return <CloudSnow className="w-5 h-5" />;
      case "foggy":
        return <Cloud className="w-5 h-5" />;
      default:
        return <Cloud className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 lg:hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-r ${config.gradient} flex items-center justify-center`}
            >
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                Scene {scene.order}
              </h1>
              <Badge variant="secondary" className="text-xs">
                {scene.title}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-6 lg:space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="gradient" className="overflow-hidden">
            <div
              className={`relative bg-gradient-to-r ${config.gradient} p-6 lg:p-12`}
            >
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative text-white text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-3xl lg:text-5xl font-bold mb-4">
                    Scene {scene.order}
                  </h1>
                  <h2 className="text-xl lg:text-2xl font-semibold mb-6 text-white/90">
                    {scene.title}
                  </h2>
                  <p className="text-lg text-white/90 mb-8 max-w-2xl leading-relaxed">
                    {scene.synopsis}
                  </p>
                </motion.div>

                {/* Scene Environment Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Time",
                      value: scene.environmentOverrides?.timeOfDay || "Day",
                      icon: getTimeOfDayIcon(
                        scene.environmentOverrides?.timeOfDay || "day"
                      ),
                    },
                    {
                      label: "Weather",
                      value: scene.environmentOverrides?.weather || "Clear",
                      icon: getWeatherIcon(
                        scene.environmentOverrides?.weather || "sunny"
                      ),
                    },
                    {
                      label: "Order",
                      value: scene.order?.toString(),
                      icon: <Layers className="w-5 h-5" />,
                    },
                    {
                      label: "Panels",
                      value: scene.panels?.length || 0,
                      icon: <Eye className="w-5 h-5" />,
                    },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20"
                    >
                      <div className="mb-2">{stat.icon}</div>
                      <div className="text-lg font-bold mb-1">{stat.value}</div>
                      <div className="text-sm text-white/80">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Synopsis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card variant="glass" className="h-full">
              <div
                className={`bg-gradient-to-r ${config.gradient} p-6 rounded-t-2xl`}
              >
                <div className="flex items-center text-white">
                  <Eye className="w-6 h-6 mr-3" />
                  <h3 className="text-xl font-bold">Scene Synopsis</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {scene.synopsis || "No synopsis available for this scene."}
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Environment Settings */}
          {scene.environmentOverrides && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2"
            >
              <Card variant="glass" className="h-full">
                <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6 rounded-t-2xl">
                  <div className="flex items-center text-white">
                    <Cloud className="w-6 h-6 mr-3" />
                    <h3 className="text-xl font-bold">Environment Settings</h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-green-50/50 to-teal-50/50 dark:from-green-950/30 dark:to-teal-950/30 p-4 rounded-lg border border-green-200/50 dark:border-green-700/30">
                      <div className="flex items-center gap-2 mb-2">
                        {getTimeOfDayIcon(
                          scene.environmentOverrides.timeOfDay || "day"
                        )}
                        <h4 className="font-semibold text-green-800 dark:text-green-200">
                          Time of Day
                        </h4>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 capitalize">
                        {scene.environmentOverrides.timeOfDay || "Day"}
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-950/30 dark:to-cyan-950/30 p-4 rounded-lg border border-blue-200/50 dark:border-blue-700/30">
                      <div className="flex items-center gap-2 mb-2">
                        {getWeatherIcon(
                          scene.environmentOverrides.weather || "sunny"
                        )}
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                          Weather
                        </h4>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 capitalize">
                        {scene.environmentOverrides.weather || "Clear"}
                      </p>
                    </div>
                  </div>

                  {/* Additional Environment Info */}
                  {(scene.locationId || scene.characterOutfitIds) && (
                    <div className="space-y-4">
                      {scene.locationId && (
                        <div className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/30 p-4 rounded-lg border border-amber-200/50 dark:border-amber-700/30">
                          <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Location Reference
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-mono text-sm">
                            {scene.locationId}
                          </p>
                        </div>
                      )}

                      {scene.characterOutfitIds &&
                        scene.characterOutfitIds.length > 0 && (
                          <div className="bg-gradient-to-r from-pink-50/50 to-rose-50/50 dark:from-pink-950/30 dark:to-rose-950/30 p-4 rounded-lg border border-pink-200/50 dark:border-pink-700/30">
                            <h4 className="font-semibold text-pink-800 dark:text-pink-200 mb-2 flex items-center gap-2">
                              <Shirt className="w-4 h-4" />
                              Character Outfits (
                              {scene.characterOutfitIds.length})
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {scene.characterOutfitIds.map(
                                (outfitId, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800 text-xs font-mono"
                                  >
                                    {outfitId.slice(-8)}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-4 lg:hidden">
        <div className="flex justify-center space-x-4">
          <Button variant="outline" size="sm" className="flex-1">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button size="sm" className="flex-1">
            <Eye className="w-4 h-4 mr-2" />
            View Panels
          </Button>
        </div>
      </div>
    </div>
  );
}
