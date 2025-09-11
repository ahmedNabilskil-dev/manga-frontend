"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Chapter,
  Character,
  CharacterOutfitTemplate,
  LocationTemplate,
  MangaProject,
  Panel,
  Scene,
} from "@/types/entities";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Eye,
  FileText,
  Layers,
  MapPin,
  Shirt,
  Sparkles,
  User,
  X,
} from "lucide-react";

// Import the separated entity views
import ChapterDetailView from "./entity-views/ChapterDetailView";
import CharacterDetailView from "./entity-views/CharacterDetailView";
import LocationDetailView from "./entity-views/LocationDetailView";
import OutfitDetailView from "./entity-views/OutfitDetailView";
import PanelDetailView from "./entity-views/PanelDetailView";
import ProjectDetailView from "./entity-views/ProjectDetailView";
import SceneDetailView from "./entity-views/SceneDetailView";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type DetailableEntity =
  | Character
  | Chapter
  | Scene
  | Panel
  | MangaProject
  | CharacterOutfitTemplate
  | LocationTemplate;

export interface EntityDetailPanelProps {
  entity: DetailableEntity | null;
  entityType:
    | "character"
    | "chapter"
    | "scene"
    | "panel"
    | "project"
    | "outfit"
    | "location"
    | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (entity: DetailableEntity) => void;
  onDelete?: (entity: DetailableEntity) => void;
  onDuplicate?: (entity: DetailableEntity) => void;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getEntityConfig = (type: string) => {
  const configs = {
    character: {
      icon: User,
      gradient: "from-blue-500 via-indigo-500 to-purple-500",
      bgGradient: "from-blue-50/80 via-indigo-50/80 to-purple-50/80",
      darkBgGradient: "from-blue-950/50 via-indigo-950/50 to-purple-950/50",
      accentColor: "blue",
      name: "Character",
    },
    chapter: {
      icon: BookOpen,
      gradient: "from-emerald-500 via-green-500 to-teal-500",
      bgGradient: "from-emerald-50/80 via-green-50/80 to-teal-50/80",
      darkBgGradient: "from-emerald-950/50 via-green-950/50 to-teal-950/50",
      accentColor: "emerald",
      name: "Chapter",
    },
    scene: {
      icon: Layers,
      gradient: "from-orange-500 via-amber-500 to-yellow-500",
      bgGradient: "from-orange-50/80 via-amber-50/80 to-yellow-50/80",
      darkBgGradient: "from-orange-950/50 via-amber-950/50 to-yellow-950/50",
      accentColor: "orange",
      name: "Scene",
    },
    panel: {
      icon: Eye,
      gradient: "from-cyan-500 via-sky-500 to-blue-500",
      bgGradient: "from-cyan-50/80 via-sky-50/80 to-blue-50/80",
      darkBgGradient: "from-cyan-950/50 via-sky-950/50 to-blue-950/50",
      accentColor: "cyan",
      name: "Panel",
    },
    project: {
      icon: FileText,
      gradient: "from-violet-500 via-purple-500 to-indigo-500",
      bgGradient: "from-violet-50/80 via-purple-50/80 to-indigo-50/80",
      darkBgGradient: "from-violet-950/50 via-purple-950/50 to-indigo-950/50",
      accentColor: "violet",
      name: "Project",
    },
    outfit: {
      icon: Shirt,
      gradient: "from-pink-500 via-rose-500 to-red-500",
      bgGradient: "from-pink-50/80 via-rose-50/80 to-red-50/80",
      darkBgGradient: "from-pink-950/50 via-rose-950/50 to-red-950/50",
      accentColor: "pink",
      name: "Outfit",
    },
    location: {
      icon: MapPin,
      gradient: "from-lime-500 via-green-500 to-emerald-500",
      bgGradient: "from-lime-50/80 via-green-50/80 to-emerald-50/80",
      darkBgGradient: "from-lime-950/50 via-green-950/50 to-emerald-950/50",
      accentColor: "lime",
      name: "Location",
    },
  };

  return configs[type as keyof typeof configs] || configs.character;
};

const getEntityName = (
  entity: DetailableEntity,
  entityType: string
): string => {
  switch (entityType) {
    case "chapter":
      return (entity as Chapter).title;
    case "character":
      return (entity as Character).name;
    case "scene":
      return (entity as Scene).title || `Scene ${(entity as Scene).order}`;
    case "panel":
      return `Panel ${(entity as Panel).order}`;
    case "project":
      return (entity as MangaProject).title;
    case "outfit":
    case "location":
      return (entity as any).name || "Unnamed";
    default:
      return (entity as any).name || "Unnamed";
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EntityDetailPanel({
  entity,
  entityType,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
}: EntityDetailPanelProps) {
  const { toast } = useToast();

  if (!entity || !entityType || !isOpen) return null;

  const config = getEntityConfig(entityType);
  const entityName = getEntityName(entity, entityType);

  const renderEntityDetail = () => {
    switch (entityType) {
      case "project":
        return <ProjectDetailView project={entity as MangaProject} />;
      case "character":
        return <CharacterDetailView character={entity as Character} />;
      case "chapter":
        return <ChapterDetailView chapter={entity as Chapter} />;
      case "scene":
        return <SceneDetailView scene={entity as Scene} />;
      case "panel":
        return <PanelDetailView panel={entity as Panel} />;
      case "outfit":
        return <OutfitDetailView outfit={entity as CharacterOutfitTemplate} />;
      case "location":
        return <LocationDetailView location={entity as LocationTemplate} />;
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 dark:text-gray-400">
              Unknown entity type
            </p>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 200,
            mass: 0.8,
          }}
          className="fixed inset-0 lg:inset-8 bg-white/95 dark:bg-gray-900/95 lg:rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-gray-700/50 backdrop-blur-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Enhanced Header with Floating Actions */}
          <div className="absolute top-0 left-0 right-0 z-50">
            <div className="relative overflow-hidden">
              <div
                className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-10`}
              />
              <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between p-6">
                  {/* Entity Info */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center space-x-4"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 3 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-xl shadow-${config.accentColor}-500/30 border-2 border-white/20`}
                    >
                      <config.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <div>
                      <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                        {entityName}
                      </h1>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Sparkles className="w-3 h-3" />
                        {config.name} Details
                      </p>
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-2" />
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="group relative h-10 w-10 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="absolute top-6 left-6 z-50 lg:hidden"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-10 w-10 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Content with Enhanced Scrolling */}
          <div className="h-full pt-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {renderEntityDetail()}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
