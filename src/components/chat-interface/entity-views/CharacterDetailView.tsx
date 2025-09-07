"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  Clock,
  Crown,
  Shirt,
  Sparkles,
  Star,
  Target,
  User,
  Users,
} from "lucide-react";
import { Character } from "../../../types/entities";

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

export default function CharacterDetailView({
  character,
}: {
  character: Character;
}) {
  const config = {
    icon: User,
    gradient: "from-blue-500 via-indigo-500 to-purple-500",
    bgGradient: "from-blue-50/80 via-indigo-50/80 to-purple-50/80",
    darkBgGradient: "from-blue-950/50 via-indigo-950/50 to-purple-950/50",
    accentColor: "blue",
    name: "Character",
  };

  const getRoleColor = (role: string) => {
    const colors = {
      protagonist: "from-green-500 to-emerald-500",
      antagonist: "from-red-500 to-rose-500",
      supporting: "from-blue-500 to-indigo-500",
      minor: "from-gray-500 to-slate-500",
    };
    return colors[role as keyof typeof colors] || colors.minor;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/20">
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
                  {/* Character Avatar */}
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="relative group mx-auto lg:mx-0"
                  >
                    <div className="absolute -inset-4 bg-white/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative w-48 h-48 lg:w-64 lg:h-64 rounded-full overflow-hidden shadow-2xl bg-white/20 border-4 border-white/30 backdrop-blur-sm">
                      {character.imgUrl ? (
                        <img
                          src={character.imgUrl}
                          alt={character.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/30 to-white/10">
                          <User className="w-20 lg:w-32 h-20 lg:h-32 text-white/80" />
                        </div>
                      )}
                    </div>
                    {/* Floating Role Badge */}
                    {character.role && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                      >
                        <Badge
                          className={`bg-gradient-to-r ${getRoleColor(
                            character.role
                          )} text-white shadow-lg`}
                        >
                          <Crown className="w-3 h-3 mr-1" />
                          {character.role}
                        </Badge>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Character Info */}
                  <div className="flex-1 text-white text-center lg:text-left">
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                    >
                      <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                        {character.name}
                      </h1>
                      <p className="text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl">
                        {character.description ||
                          character.personality ||
                          "A mysterious character with an untold story"}
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
                          label: "Age",
                          value: character.age || "Unknown",
                          icon: Clock,
                          color: "from-amber-400 to-orange-600",
                        },
                        {
                          label: "Gender",
                          value: character.gender || "Not specified",
                          icon: User,
                          color: "from-blue-400 to-indigo-600",
                        },
                        {
                          label: "Relations",
                          value: character.relationships?.length || 0,
                          icon: Users,
                          color: "from-pink-400 to-rose-600",
                        },
                        {
                          label: "Outfits",
                          value: character.outfitTemplates?.length || 0,
                          icon: Shirt,
                          color: "from-purple-400 to-violet-600",
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
          {/* Personality & Appearance */}
          {(character.personality ||
            character.appearance ||
            character.personalityStrengths ||
            character.personalityWeaknesses ||
            character.personalityCoreMotivation ||
            character.personalityFears) && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card
                variant="glass"
                className="h-full overflow-hidden border border-purple-200/50 dark:border-purple-700/30"
              >
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
                  <div className="flex items-center text-white">
                    <div className="p-2 bg-white/20 rounded-xl mr-4">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold">Personality & Traits</h3>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {character.personality && (
                    <div className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-950/40 dark:to-pink-950/40 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-700/30">
                      <h4 className="font-bold text-purple-700 dark:text-purple-300 mb-3">
                        Core Personality
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {character.personality}
                      </p>
                    </div>
                  )}

                  {character.appearance && (
                    <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-700/30">
                      <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Physical Appearance
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {character.appearance}
                      </p>
                    </div>
                  )}

                  {character.personalityCoreMotivation && (
                    <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/40 dark:to-teal-950/40 p-6 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/30">
                      <h4 className="font-bold text-emerald-700 dark:text-emerald-300 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Core Motivation
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {character.personalityCoreMotivation}
                      </p>
                    </div>
                  )}

                  {character.personalityFears && (
                    <div className="bg-gradient-to-r from-red-50/80 to-rose-50/80 dark:from-red-950/40 dark:to-rose-950/40 p-6 rounded-2xl border border-red-200/50 dark:border-red-700/30">
                      <h4 className="font-bold text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Core Fears
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {character.personalityFears}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {character.personalityStrengths &&
                      character.personalityStrengths.length > 0 && (
                        <div>
                          <h4 className="font-bold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Strengths
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {character.personalityStrengths.map(
                              (strength, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                                >
                                  {strength}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    {character.personalityWeaknesses &&
                      character.personalityWeaknesses.length > 0 && (
                        <div>
                          <h4 className="font-bold text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Weaknesses
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {character.personalityWeaknesses.map(
                              (weakness, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                                >
                                  {weakness}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Traits */}
                  {character.traits && character.traits.length > 0 && (
                    <div>
                      <h4 className="font-bold text-violet-700 dark:text-violet-300 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Character Traits
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {character.traits.map((trait, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800"
                          >
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Backstory */}
          {character.backstory && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card
                variant="glass"
                className="h-full overflow-hidden border border-indigo-200/50 dark:border-indigo-700/30"
              >
                <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-6">
                  <div className="flex items-center text-white">
                    <div className="p-2 bg-white/20 rounded-xl mr-4">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold">Backstory</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="bg-gradient-to-r from-indigo-50/80 to-blue-50/80 dark:from-indigo-950/40 dark:to-blue-950/40 p-6 rounded-2xl border border-indigo-200/50 dark:border-indigo-700/30">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {character.backstory}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Relationships */}
          {character.relationships && character.relationships.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="lg:col-span-2 xl:col-span-1"
            >
              <Card
                variant="glass"
                className="h-full overflow-hidden border border-rose-200/50 dark:border-rose-700/30"
              >
                <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-6">
                  <div className="flex items-center text-white">
                    <div className="p-2 bg-white/20 rounded-xl mr-4">
                      <Users className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold">Relationships</h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {character.relationships.map((relationship, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-rose-50/80 to-pink-50/80 dark:from-rose-950/40 dark:to-pink-950/40 p-6 rounded-2xl border border-rose-200/50 dark:border-rose-700/30"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge
                          variant="secondary"
                          className="bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                        >
                          {relationship.relationshipType}
                        </Badge>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {relationship.description}
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
