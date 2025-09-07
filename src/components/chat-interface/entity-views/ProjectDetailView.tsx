"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  Crown,
  Eye,
  FileText,
  Globe,
  Heart,
  MapPin,
  Palette,
  Share2,
  Sparkles,
  Tag,
  Target,
  Users,
} from "lucide-react";
import { MangaProject } from "../../../types/entities";

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

export default function ProjectDetailView({
  project,
}: {
  project: MangaProject;
}) {
  const config = {
    icon: FileText,
    gradient: "from-violet-500 via-purple-500 to-indigo-500",
    bgGradient: "from-violet-50/80 via-purple-50/80 to-indigo-50/80",
    darkBgGradient: "from-violet-950/50 via-purple-950/50 to-indigo-950/50",
    accentColor: "violet",
    name: "Project",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-white to-purple-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950/20">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Enhanced Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <Card
            variant="glass"
            className="overflow-hidden border-2 border-white/20 dark:border-gray-700/30"
          >
            <div className="relative">
              {/* Background Pattern */}
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
                  {/* Project Cover */}
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="relative group mx-auto lg:mx-0"
                  >
                    <div className="absolute -inset-4 bg-white/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative w-48 h-64 lg:w-64 lg:h-80 rounded-3xl overflow-hidden shadow-2xl bg-white/20 border-2 border-white/30 backdrop-blur-sm">
                      {project.coverImageUrl ? (
                        <img
                          src={project.coverImageUrl}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/30 to-white/10">
                          <div className="text-center text-white/80">
                            <FileText className="w-16 lg:w-24 h-16 lg:h-24 mx-auto mb-4" />
                            <p className="text-sm font-medium">
                              No Cover Image
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
                      <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        {project.published ? "PUBLISHED" : "DRAFT"}
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Project Info */}
                  <div className="flex-1 text-white text-center lg:text-left">
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                    >
                      <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                        {project.title}
                      </h1>
                      <p className="text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl">
                        {project.description ||
                          "An incredible manga project waiting to unfold its story"}
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
                          label: "Chapters",
                          value: project.chapters?.length || 0,
                          icon: BookOpen,
                          color: "from-blue-400 to-blue-600",
                        },
                        {
                          label: "Characters",
                          value: project.characters?.length || 0,
                          icon: Users,
                          color: "from-green-400 to-green-600",
                        },
                        {
                          label: "Views",
                          value: project.viewCount || 0,
                          icon: Eye,
                          color: "from-purple-400 to-purple-600",
                        },
                        {
                          label: "Likes",
                          value: project.likeCount || 0,
                          icon: Heart,
                          color: "from-red-400 to-red-600",
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
          {/* Project Details */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <Card
              variant="glass"
              className="overflow-hidden border border-violet-200/50 dark:border-violet-700/30"
            >
              <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-6">
                <div className="flex items-center text-white">
                  <div className="p-2 bg-white/20 rounded-xl mr-4">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">Project Details</h3>
                </div>
              </div>
              <div className="p-6 space-y-5">
                {[
                  {
                    label: "Genre",
                    value: project.genre || "Not specified",
                    icon: Sparkles,
                    color: "violet",
                  },
                  {
                    label: "Art Style",
                    value: project.artStyle || "Default",
                    icon: Palette,
                    color: "blue",
                  },
                  {
                    label: "Target Audience",
                    value: project.targetAudience || "General",
                    icon: Target,
                    color: "green",
                  },
                  {
                    label: "Status",
                    value:
                      project.status ||
                      (project.published ? "Published" : "Draft"),
                    icon: Crown,
                    color: project.published ? "emerald" : "amber",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="group flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-gray-800/50 dark:to-gray-700/50 hover:shadow-lg transition-all duration-300 border border-gray-200/50 dark:border-gray-600/30"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2.5 bg-gradient-to-br from-${item.color}-400 to-${item.color}-600 rounded-xl text-white shadow-lg`}
                      >
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:scale-105 transition-transform">
                      {item.value}
                    </span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
          {/* World Building */}
          {project.worldDetails && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="lg:col-span-2"
            >
              <Card
                variant="glass"
                className="overflow-hidden border border-indigo-200/50 dark:border-indigo-700/30"
              >
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6">
                  <div className="flex items-center text-white">
                    <div className="p-2 bg-white/20 rounded-xl mr-4">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold">World Building</h3>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {project.worldDetails.summary && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/40 dark:to-purple-950/40 p-6 rounded-2xl border border-indigo-200/50 dark:border-indigo-700/30"
                    >
                      <h4 className="font-bold text-indigo-800 dark:text-indigo-200 mb-3 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        World Summary
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {project.worldDetails.summary}
                      </p>
                    </motion.div>
                  )}
                  {project.worldDetails.history && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                      className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-950/40 dark:to-pink-950/40 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-700/30"
                    >
                      <h4 className="font-bold text-purple-800 dark:text-purple-200 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Historical Background
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {project.worldDetails.history}
                      </p>
                    </motion.div>
                  )}
                  {project.worldDetails.society && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 }}
                      className="bg-gradient-to-r from-cyan-50/80 to-blue-50/80 dark:from-cyan-950/40 dark:to-blue-950/40 p-6 rounded-2xl border border-cyan-200/50 dark:border-cyan-700/30"
                    >
                      <h4 className="font-bold text-cyan-800 dark:text-cyan-200 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Society & Culture
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {project.worldDetails.society}
                      </p>
                    </motion.div>
                  )}
                  {project.worldDetails.uniqueSystems && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1 }}
                      className="bg-gradient-to-r from-amber-50/80 to-yellow-50/80 dark:from-amber-950/40 dark:to-yellow-950/40 p-6 rounded-2xl border border-amber-200/50 dark:border-amber-700/30"
                    >
                      <h4 className="font-bold text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Unique Systems
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {project.worldDetails.uniqueSystems}
                      </p>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
          {project.plotStructure && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="lg:col-span-full"
            >
              <Card
                variant="glass"
                className="overflow-hidden border border-amber-200/50 dark:border-amber-700/30"
              >
                <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-6">
                  <div className="flex items-center text-white">
                    <div className="p-2 bg-white/20 rounded-xl mr-4">
                      <Target className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold">Plot Structure</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      {
                        label: "Inciting Incident",
                        value: project.plotStructure.incitingIncident,
                        icon: Sparkles,
                        color: "from-amber-400 to-amber-600",
                        bgColor: "from-amber-50/80 to-yellow-50/80",
                        borderColor: "border-amber-200/50",
                        textColor: "text-amber-800 dark:text-amber-200",
                      },
                      {
                        label: "Plot Twist",
                        value: project.plotStructure.plotTwist,
                        icon: Share2,
                        color: "from-orange-400 to-orange-600",
                        bgColor: "from-orange-50/80 to-amber-50/80",
                        borderColor: "border-orange-200/50",
                        textColor: "text-orange-800 dark:text-orange-200",
                      },
                      {
                        label: "Climax",
                        value: project.plotStructure.climax,
                        icon: Crown,
                        color: "from-red-400 to-red-600",
                        bgColor: "from-red-50/80 to-orange-50/80",
                        borderColor: "border-red-200/50",
                        textColor: "text-red-800 dark:text-red-200",
                      },
                      {
                        label: "Resolution",
                        value: project.plotStructure.resolution,
                        icon: Heart,
                        color: "from-emerald-400 to-emerald-600",
                        bgColor: "from-emerald-50/80 to-green-50/80",
                        borderColor: "border-emerald-200/50",
                        textColor: "text-emerald-800 dark:text-emerald-200",
                      },
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        className={`bg-gradient-to-br ${item.bgColor} dark:from-gray-800/50 dark:to-gray-700/50 p-6 rounded-2xl border ${item.borderColor} dark:border-gray-600/30 h-full flex flex-col`}
                      >
                        <div className="flex items-center mb-4">
                          <div
                            className={`p-2 bg-gradient-to-br ${item.color} rounded-xl text-white shadow-lg mr-3`}
                          >
                            <item.icon className="w-4 h-4" />
                          </div>
                          <h4 className={`font-bold ${item.textColor}`}>
                            {item.label}
                          </h4>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed flex-1">
                          {item.value}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="lg:col-span-full"
            >
              <Card
                variant="glass"
                className="overflow-hidden border border-gray-200/50 dark:border-gray-700/30"
              >
                <div className="bg-gradient-to-r from-gray-700 via-gray-600 to-gray-800 p-6">
                  <div className="flex items-center text-white">
                    <div className="p-2 bg-white/20 rounded-xl mr-4">
                      <Tag className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold">Tags & Keywords</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-3">
                    {project.tags.map((tag, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9 + index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        className="group"
                      >
                        <Badge
                          variant="secondary"
                          className="px-4 py-2 text-sm bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 border border-gray-300 dark:border-gray-500 hover:shadow-lg transition-all duration-200 group-hover:from-violet-100 group-hover:to-purple-100 dark:group-hover:from-violet-900/30 dark:group-hover:to-purple-900/30"
                        >
                          #{tag}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
