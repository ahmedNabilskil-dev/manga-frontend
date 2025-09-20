"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowLeft, FolderOpen } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackToProjectsButtonProps {
  variant?: "icon" | "full" | "manga-icon";
  size?: "sm" | "md" | "lg";
  className?: string;
  title?: string;
}

export function BackToProjectsButton({
  variant = "full",
  size = "md",
  className,
  title = "Back to Projects",
}: BackToProjectsButtonProps) {
  const router = useRouter();

  const handleNavigateBack = () => {
    router.push("/projects");
  };

  const sizeClasses = {
    sm: "w-8 h-8 p-1.5",
    md: "w-10 h-10 p-2.5",
    lg: "w-12 h-12 p-3",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  if (variant === "icon") {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleNavigateBack}
        className={cn(
          "flex items-center justify-center rounded-lg transition-all duration-200",
          "bg-gray-100/80 hover:bg-gray-200/80 dark:bg-gray-800/80 dark:hover:bg-gray-700/80",
          "text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100",
          "backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50",
          "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/50",
          sizeClasses[size],
          className
        )}
        title={title}
      >
        <FolderOpen className={iconSizes[size]} />
      </motion.button>
    );
  }

  if (variant === "manga-icon") {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleNavigateBack}
        className={cn(
          "flex items-center justify-center rounded-xl transition-all duration-200",
          "bg-gradient-to-br from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20",
          "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300",
          "backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50",
          "hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50",
          sizeClasses[size],
          className
        )}
        title={title}
      >
        <FolderOpen className={iconSizes[size]} />
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleNavigateBack}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
        "bg-gray-100/80 hover:bg-gray-200/80 dark:bg-gray-800/80 dark:hover:bg-gray-700/80",
        "text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100",
        "backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50",
        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/50",
        "font-medium text-sm",
        className
      )}
      title={title}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Projects</span>
    </motion.button>
  );
}
