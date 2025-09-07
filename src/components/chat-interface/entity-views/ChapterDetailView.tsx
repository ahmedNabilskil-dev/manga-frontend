"use client";

import { motion } from "framer-motion";
import { BookOpen, Eye, Sparkles, Star, Target, Users } from "lucide-react";
import { Chapter } from "../../../types/entities";

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

export default function ChapterDetailView({ chapter }: { chapter: Chapter }) {
  const config = {
    icon: BookOpen,
    gradient: "from-emerald-500 via-green-500 to-teal-500",
    bgGradient: "from-emerald-50/80 via-green-50/80 to-teal-50/80",
    darkBgGradient: "from-emerald-950/50 via-green-950/50 to-teal-950/50",
    accentColor: "emerald",
    name: "Chapter",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950/20">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Enhanced Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card
            variant="glass"
            className="overflow-hidden border-2 border-white/20 dark:border-gray-700/30"
          >
            <div className="relative">
              <div className="absolute inset-0">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-90`}
                />
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_1px_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:20px_20px]" />
                </div>
              </div>

              <div className="relative p-8 lg:p-12">
                <div className="flex flex-col lg:flex-row items-start gap-8">
                  {/* Chapter Cover */}
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="relative group mx-auto lg:mx-0"
                  >
                    <div className="absolute -inset-4 bg-white/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative w-48 h-64 lg:w-64 lg:h-80 rounded-3xl overflow-hidden shadow-2xl bg-white/20 border-2 border-white/30 backdrop-blur-sm">
                      {chapter.imgUrl ? (
                        <img
                          src={chapter.imgUrl}
                          alt={`Chapter ${chapter.chapterNumber}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/30 to-white/10">
                          <div className="text-center text-white/80">
                            <BookOpen className="w-16 lg:w-24 h-16 lg:h-24 mx-auto mb-4" />
                            <p className="text-sm font-medium">
                              Chapter {chapter.chapterNumber}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Floating Badge */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="absolute -top-2 -right-2"
                    >
                      <div
                        className={`${
                          chapter.isPublished
                            ? "bg-gradient-to-r from-green-400 to-emerald-500"
                            : "bg-gradient-to-r from-amber-400 to-orange-500"
                        } text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}
                      >
                        {chapter.isPublished ? "PUBLISHED" : "DRAFT"}
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Chapter Info */}
                  <div className="flex-1 text-white text-center lg:text-left">
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                    >
                      <div className="mb-4">
                        <span className="text-2xl lg:text-3xl font-semibold text-white/80">
                          Chapter
                        </span>
                        <span className="text-5xl lg:text-7xl font-bold ml-4">
                          {chapter.chapterNumber}
                        </span>
                      </div>
                      <h1 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight">
                        {chapter.title}
                      </h1>
                      <p className="text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl">
                        {chapter.synopsis ||
                          "An engaging chapter with compelling narrative"}
                      </p>
                    </motion.div>

                    {/* Enhanced Stats Grid */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="grid grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                      {[
                        {
                          label: "Number",
                          value: chapter.chapterNumber,
                          icon: BookOpen,
                          color: "from-emerald-400 to-green-600",
                        },
                        {
                          label: "Characters",
                          value: chapter.keyCharacters?.length || 0,
                          icon: Users,
                          color: "from-blue-400 to-indigo-600",
                        },
                        {
                          label: "Scenes",
                          value: chapter.scenes?.length || 0,
                          icon: Target,
                          color: "from-teal-400 to-cyan-600",
                        },
                        {
                          label: "Views",
                          value: chapter.viewCount || 0,
                          icon: Eye,
                          color: "from-orange-400 to-red-600",
                        },
                      ].map((stat, index) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          whileHover={{ scale: 1.08, y: -5 }}
                          className={`bg-gradient-to-br ${stat.color} backdrop-blur-xl rounded-2xl p-6 text-center border border-white/30 shadow-xl`}
                        >
                          <stat.icon className="w-8 h-8 mx-auto mb-3 text-white" />
                          <div className="text-3xl font-bold text-white mb-1">
                            {stat.value}
                          </div>
                          <div className="text-sm text-white/80 font-medium">
                            {stat.label}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Enhanced Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Synopsis & Purpose */}
          {(chapter.synopsis || chapter.purpose) && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card
                variant="glass"
                className="h-full overflow-hidden border border-emerald-200/50 dark:border-emerald-700/30"
              >
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6">
                  <div className="flex items-center text-white">
                    <div className="p-2 bg-white/20 rounded-xl mr-4">
                      <Eye className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold">Chapter Overview</h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {chapter.synopsis && (
                    <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/40 dark:to-teal-950/40 p-6 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/30">
                      <h4 className="font-bold text-emerald-700 dark:text-emerald-300 mb-3">
                        Synopsis
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {chapter.synopsis}
                      </p>
                    </div>
                  )}
                  {chapter.purpose && (
                    <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-700/30">
                      <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Chapter Purpose
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {chapter.purpose}
                      </p>
                    </div>
                  )}
                  {chapter.tone && (
                    <div className="bg-gradient-to-r from-purple-50/80 to-violet-50/80 dark:from-purple-950/40 dark:to-violet-950/40 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-700/30">
                      <h4 className="font-bold text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Tone
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {chapter.tone}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Narrative */}
          {chapter.narrative && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card
                variant="glass"
                className="h-full overflow-hidden border border-blue-200/50 dark:border-blue-700/30"
              >
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6">
                  <div className="flex items-center text-white">
                    <div className="p-2 bg-white/20 rounded-xl mr-4">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold">Narrative Content</h3>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-700/30 flex-1 overflow-y-auto">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {chapter.narrative}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Character Arcs */}
          {chapter.characterArcs && chapter.characterArcs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card
                variant="glass"
                className="h-full overflow-hidden border border-purple-200/50 dark:border-purple-700/30"
              >
                <div className="bg-gradient-to-r from-purple-500 to-violet-500 p-6">
                  <div className="flex items-center text-white">
                    <div className="p-2 bg-white/20 rounded-xl mr-4">
                      <Star className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold">Character Development</h3>
                  </div>
                </div>
                <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                  {chapter.characterArcs.map((arc, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-purple-50/80 to-violet-50/80 dark:from-purple-950/40 dark:to-violet-950/40 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-700/30"
                    >
                      <div className="mb-3">
                        <Badge
                          variant="secondary"
                          className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                        >
                          Arc #{index + 1}
                        </Badge>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {arc.arcDescription}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
