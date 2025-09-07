"use client";

import { Button } from "@/components/ui/button";
import { CharacterOutfitTemplate } from "@/types/entities";
import { motion } from "framer-motion";
import {
  Calendar,
  Camera,
  Edit,
  MoreVertical,
  Palette,
  Shirt,
  Sparkles,
  Star,
  Tag,
  User,
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

export default function OutfitDetailView({
  outfit,
}: {
  outfit: CharacterOutfitTemplate;
}) {
  const config = {
    gradient: "from-pink-500 via-rose-500 to-red-500",
    bgGradient: "from-pink-50/80 via-rose-50/80 to-red-50/80",
    darkBgGradient: "from-pink-950/50 via-rose-950/50 to-red-950/50",
  };

  const getSeasonIcon = (season: string) => {
    switch (season) {
      case "spring":
        return "🌸";
      case "summer":
        return "☀️";
      case "autumn":
        return "🍂";
      case "winter":
        return "❄️";
      default:
        return "🔄";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      casual: "from-blue-500 to-indigo-500",
      formal: "from-purple-500 to-violet-500",
      school: "from-green-500 to-emerald-500",
      special: "from-amber-500 to-orange-500",
    };
    return colors[category as keyof typeof colors] || colors.casual;
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
              <Shirt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {outfit.name}
              </h1>
              <Badge variant="secondary" className="text-xs">
                {outfit.category}
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
              <div className="relative flex flex-col lg:flex-row items-start gap-8">
                {/* Outfit Image */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative group mx-auto lg:mx-0"
                >
                  <div className="absolute -inset-2 bg-white/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-48 h-64 lg:w-64 lg:h-80 rounded-2xl overflow-hidden shadow-2xl bg-white/20">
                    {outfit.imgUrl ? (
                      <img
                        src={outfit.imgUrl}
                        alt={outfit.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-white/70">
                          <Shirt className="w-12 h-12 mx-auto mb-4" />
                          <p className="text-sm">No image yet</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Outfit Info */}
                <div className="flex-1 text-white text-center lg:text-left">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h1 className="text-3xl lg:text-5xl font-bold mb-4">
                      {outfit.name}
                    </h1>
                    <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-6">
                      <Badge className="bg-white/20 text-white border-white/30">
                        {outfit.category}
                      </Badge>
                      <Badge className="bg-white/20 text-white border-white/30">
                        {outfit.season} {getSeasonIcon(outfit.season)}
                      </Badge>
                      {outfit.isDefault && (
                        <Badge className="bg-amber-500/80 text-white border-amber-400/50">
                          <Star className="w-3 h-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-lg text-white/90 mb-6 max-w-2xl leading-relaxed">
                      {outfit.prompt || "A stylish outfit design."}
                    </p>
                  </motion.div>

                  {/* Outfit Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        label: "Components",
                        value: outfit.components?.length || 0,
                        icon: <Shirt className="w-5 h-5" />,
                      },
                      {
                        label: "Category",
                        value: outfit.category,
                        icon: <Tag className="w-5 h-5" />,
                      },
                      {
                        label: "Season",
                        value: outfit.season,
                        icon: <Calendar className="w-5 h-5" />,
                      },
                      {
                        label: "Default",
                        value: outfit.isDefault ? "Yes" : "No",
                        icon: <Star className="w-5 h-5" />,
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
                        <div className="text-lg font-bold mb-1">
                          {stat.value}
                        </div>
                        <div className="text-sm text-white/80">
                          {stat.label}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Components */}
          {outfit.components && outfit.components.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <Card variant="glass" className="h-full">
                <div
                  className={`bg-gradient-to-r ${config.gradient} p-6 rounded-t-2xl`}
                >
                  <div className="flex items-center text-white">
                    <Shirt className="w-6 h-6 mr-3" />
                    <h3 className="text-xl font-bold">Outfit Components</h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {outfit.components.map((component, index) => (
                    <div
                      key={index}
                      className={`bg-gradient-to-r ${config.bgGradient} dark:${config.darkBgGradient} p-4 rounded-lg border border-pink-200/50 dark:border-pink-700/30`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-pink-800 dark:text-pink-200">
                          {component.name}
                        </h4>
                      </div>
                      {component.description && (
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                          {component.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card variant="glass" className="h-full">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-t-2xl">
                <div className="flex items-center text-white">
                  <Palette className="w-6 h-6 mr-3" />
                  <h3 className="text-xl font-bold">Outfit Details</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: "Prompt", value: outfit.prompt, icon: Sparkles },
                  { label: "Category", value: outfit.category, icon: Tag },
                  { label: "Season", value: outfit.season, icon: Calendar },
                  {
                    label: "Character ID",
                    value: outfit.characterId,
                    icon: User,
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100/50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <div className="flex items-start">
                      <item.icon className="w-4 h-4 mr-3 mt-0.5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {item.label}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm break-words">
                          {item.value || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
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
            <Camera className="w-4 h-4 mr-2" />
            Generate
          </Button>
          <Button size="sm" className="flex-1">
            <Star className="w-4 h-4 mr-2" />
            Favorite
          </Button>
        </div>
      </div>
    </div>
  );
}
