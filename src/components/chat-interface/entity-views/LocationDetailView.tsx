"use client";

import { Button } from "@/components/ui/button";
import { LocationTemplate } from "@/types/entities";
import { motion } from "framer-motion";
import {
  BookOpen,
  Building,
  Calendar,
  Camera,
  Edit,
  Home,
  MapPin,
  MoreVertical,
  Star,
  Sun,
  Tag,
} from "lucide-react";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatDate = (date?: Date | string) => {
  if (!date) return "Not available";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

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

export default function LocationDetailView({
  location,
}: {
  location: LocationTemplate;
}) {
  const config = {
    gradient: "from-lime-500 via-green-500 to-emerald-500",
    bgGradient: "from-lime-50/80 via-green-50/80 to-emerald-50/80",
    darkBgGradient: "from-lime-950/50 via-green-950/50 to-emerald-950/50",
  };

  const getLocationTypeIcon = (type: string) => {
    switch (type) {
      case "indoor":
        return <Home className="w-5 h-5" />;
      case "outdoor":
        return <Sun className="w-5 h-5" />;
      case "urban":
        return <Building className="w-5 h-5" />;
      case "rural":
        return <Sun className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      urban: "from-gray-500 to-slate-500",
      nature: "from-green-500 to-emerald-500",
      fantasy: "from-purple-500 to-violet-500",
      historical: "from-amber-500 to-orange-500",
    };
    return colors[category as keyof typeof colors] || colors.urban;
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
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {location.name}
              </h1>
              <Badge variant="secondary" className="text-xs">
                {location.category}
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
                {/* Location Image */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative group mx-auto lg:mx-0"
                >
                  <div className="absolute -inset-2 bg-white/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-48 h-64 lg:w-64 lg:h-80 rounded-2xl overflow-hidden shadow-2xl bg-white/20">
                    {location.imgUrl ? (
                      <img
                        src={location.imgUrl}
                        alt={location.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-white/70">
                          <MapPin className="w-12 h-12 mx-auto mb-4" />
                          <p className="text-sm">No image yet</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Location Info */}
                <div className="flex-1 text-white text-center lg:text-left">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h1 className="text-3xl lg:text-5xl font-bold mb-4">
                      {location.name}
                    </h1>
                    <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-6">
                      <Badge className="bg-white/20 text-white border-white/30">
                        {location.category}
                      </Badge>
                      <Badge className="bg-white/20 text-white border-white/30">
                        {location.type}
                      </Badge>
                    </div>
                    <p className="text-lg text-white/90 mb-6 max-w-2xl leading-relaxed">
                      {location.description}
                    </p>
                  </motion.div>

                  {/* Location Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        label: "Type",
                        value: location.type,
                        icon: getLocationTypeIcon(location.type),
                      },
                      {
                        label: "Category",
                        value: location.category,
                        icon: <Tag className="w-5 h-5" />,
                      },
                      {
                        label: "Features",
                        value: location.keyFeatures?.length || 0,
                        icon: <Star className="w-5 h-5" />,
                      },
                      {
                        label: "Created",
                        value: formatDate(location.createdAt).split(",")[0],
                        icon: <Calendar className="w-5 h-5" />,
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
          {/* Description */}
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
                  <BookOpen className="w-6 h-6 mr-3" />
                  <h3 className="text-xl font-bold">Description</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {location.description}
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Key Features */}
          {location.keyFeatures && location.keyFeatures.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2"
            >
              <Card variant="glass" className="h-full">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 rounded-t-2xl">
                  <div className="flex items-center text-white">
                    <Star className="w-6 h-6 mr-3" />
                    <h3 className="text-xl font-bold">Key Features</h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {location.keyFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/30 p-4 rounded-lg border border-emerald-200/50 dark:border-emerald-700/30"
                    >
                      <h4 className="font-bold text-emerald-800 dark:text-emerald-200 mb-2">
                        {feature.name}
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Image Prompt */}
          {location.imgPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="lg:col-span-full"
            >
              <Card variant="glass" className="h-full">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 rounded-t-2xl">
                  <div className="flex items-center text-white">
                    <Camera className="w-6 h-6 mr-3" />
                    <h3 className="text-xl font-bold">
                      Image Generation Prompt
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="bg-gradient-to-r from-purple-50/50 to-indigo-50/50 dark:from-purple-950/30 dark:to-indigo-950/30 p-4 rounded-lg border border-purple-200/50 dark:border-purple-700/30">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-mono text-sm">
                      {location.imgPrompt}
                    </p>
                  </div>
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
            <Camera className="w-4 h-4 mr-2" />
            Generate Image
          </Button>
          <Button size="sm" className="flex-1">
            <MapPin className="w-4 h-4 mr-2" />
            Use Location
          </Button>
        </div>
      </div>
    </div>
  );
}
