"use client";

import { Button } from "@/components/ui/button";
import { Panel } from "@/types/entities";
import { motion } from "framer-motion";
import {
  BookOpen,
  Camera,
  Edit,
  Eye,
  Lightbulb,
  MessageSquare,
  MoreVertical,
  Share2,
  Type,
  User,
  Volume2,
  VolumeX,
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

export default function PanelDetailView({ panel }: { panel: Panel }) {
  const config = {
    gradient: "from-cyan-500 via-sky-500 to-blue-500",
    bgGradient: "from-cyan-50/80 via-sky-50/80 to-blue-50/80",
    darkBgGradient: "from-cyan-950/50 via-sky-950/50 to-blue-950/50",
  };

  const getBubbleTypeIcon = (bubbleType: string) => {
    switch (bubbleType) {
      case "thought":
        return <Lightbulb className="w-4 h-4" />;
      case "scream":
        return <Volume2 className="w-4 h-4" />;
      case "whisper":
        return <VolumeX className="w-4 h-4" />;
      case "narration":
        return <Type className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getBubbleTypeColor = (bubbleType: string) => {
    switch (bubbleType) {
      case "thought":
        return "from-purple-500 to-indigo-500";
      case "scream":
        return "from-red-500 to-rose-500";
      case "whisper":
        return "from-gray-500 to-slate-500";
      case "narration":
        return "from-amber-500 to-orange-500";
      default:
        return "from-blue-500 to-cyan-500";
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
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                Panel {panel.order}
              </h1>
              <Badge variant="secondary" className="text-xs">
                {panel.dialogs?.length || 0} dialogues
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
                {/* Panel Image */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative group mx-auto lg:mx-0"
                >
                  <div className="absolute -inset-2 bg-white/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-48 h-64 lg:w-64 lg:h-80 rounded-2xl overflow-hidden shadow-2xl bg-white/20">
                    {panel.imgUrl ? (
                      <img
                        src={panel.imgUrl}
                        alt={`Panel ${panel.order}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-white/70">
                          <Camera className="w-12 h-12 mx-auto mb-4" />
                          <p className="text-sm">No image yet</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Panel Info */}
                <div className="flex-1 text-white text-center lg:text-left">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h1 className="text-3xl lg:text-5xl font-bold mb-4">
                      Panel {panel.order}
                    </h1>
                    <p className="text-lg text-white/90 mb-8 max-w-2xl leading-relaxed">
                      {panel.description}
                    </p>
                  </motion.div>

                  {/* Panel Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        label: "Order",
                        value: panel.order.toString(),
                        icon: <Eye className="w-5 h-5" />,
                      },
                      {
                        label: "Dialogues",
                        value: panel.dialogs?.length || 0,
                        icon: <MessageSquare className="w-5 h-5" />,
                      },
                      {
                        label: "Characters",
                        value: panel.characters?.length || 0,
                        icon: <User className="w-5 h-5" />,
                      },
                      {
                        label: "Image",
                        value: panel.imgUrl ? "Yes" : "No",
                        icon: <Camera className="w-5 h-5" />,
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
                  {panel.description}
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Dialogues */}
          {panel.dialogs && panel.dialogs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2"
            >
              <Card variant="glass" className="h-full">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-t-2xl">
                  <div className="flex items-center text-white">
                    <MessageSquare className="w-6 h-6 mr-3" />
                    <h3 className="text-xl font-bold">Dialogues</h3>
                  </div>
                </div>
                <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                  {panel.dialogs.map((dialog, index) => (
                    <motion.div
                      key={dialog._id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className={`p-4 rounded-2xl bg-gradient-to-r ${getBubbleTypeColor(
                        dialog.bubbleType || "normal"
                      )} bg-opacity-10 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getBubbleTypeIcon(dialog.bubbleType || "normal")}
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Order {dialog.order}
                          </span>
                          {dialog.emotion && (
                            <Badge variant="outline" className="text-xs">
                              {dialog.emotion}
                            </Badge>
                          )}
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-xs capitalize"
                        >
                          {dialog.bubbleType || "normal"}
                        </Badge>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed mb-3">
                        "{dialog.content}"
                      </p>
                      {dialog.speakerId && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <User className="w-3 h-3 inline mr-1" />
                          Speaker: {dialog.speakerId}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Characters in Panel */}
          {panel.characters && panel.characters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="xl:col-span-1"
            >
              <Card variant="glass" className="h-full">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-t-2xl">
                  <div className="flex items-center text-white">
                    <User className="w-6 h-6 mr-3" />
                    <h3 className="text-xl font-bold">Characters</h3>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  {panel.characters.map((character, index) => (
                    <div
                      key={character._id || index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200/50 dark:border-green-700/30"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold">
                        {character.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {character.name}
                        </h4>
                        {character.role && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {character.role}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
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
            Generate
          </Button>
          <Button size="sm" className="flex-1">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}
