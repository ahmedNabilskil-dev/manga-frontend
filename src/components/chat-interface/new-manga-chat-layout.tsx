"use client";

import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { chatService } from "@/services/chat.service";
import { useAuthStore } from "@/stores/auth-store";
import { AnimatePresence, motion } from "framer-motion";
import "highlight.js/styles/github.css";
import {
  AlertCircle,
  Bot,
  Camera,
  ChevronDown,
  Copy,
  Edit2,
  Eye,
  Facebook,
  FileText,
  Image,
  Menu,
  Mic,
  Paperclip,
  RotateCcw,
  Send,
  Sliders,
  Sparkles,
  User,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChatMessagePreview } from "./ChatMessagePreview";
import EntityDetailPanel, { DetailableEntity } from "./entity-detail-panel";
import UltimateMarkdownRenderer from "./markdownCompoents";
import { PanelReader } from "./PanelReader";
import { EnhancedProjectStructurePanel } from "./styled-side-panels";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Asset {
  id: string;
  type: "character" | "panel" | "scene" | "other";
  name: string;
  url: string;
  timestamp: string;
  chapterId?: string;
  chapterTitle?: string;
  sceneId?: string;
  sceneTitle?: string;
  panelOrder?: number;
}

interface SidePanelTab {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<{
    projectData: MangaProject | null;
    onComponentSelect?: (componentId: string, type: string) => void;
    selectedEntity?: { id: string; type: string } | null;
    onEntitySelect?: (entity: { id: string; type: string } | null) => void;
    onAssetSelect?: (asset: Asset) => void;
    onEntityDetailView?: (entity: DetailableEntity, entityType: string) => void;
  }>;
}

interface ChatMessage {
  id: string;
  _id?: string; // MongoDB ID from backend
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  type?: "text" | "image" | "component-created" | "component-updated";
  metadata?: {
    componentType?: "character" | "scene" | "chapter" | "panel";
    componentId?: string;
    action?: "created" | "updated" | "deleted" | "error";
    retryMessageId?: string;
  };
  imageUrl?: string;
  imageData?: string;
  url?: string; // for backend file/image url
  mimeType?: string;
  attachments?: {
    type: "image" | "file";
    url: string;
    name: string;
    size?: number;
  }[];
}

// ============================================================================
// EDIT MESSAGE COMPONENT
// ============================================================================

interface EditMessageComponentProps {
  messageId: string;
  originalContent: string;
  isLoading: boolean;
  onSubmit: (messageId: string, newContent: string) => void;
  onCancel: () => void;
}

const EditMessageComponent = ({
  messageId,
  originalContent,
  isLoading,
  onSubmit,
  onCancel,
}: EditMessageComponentProps) => {
  const [editContent, setEditContent] = useState(originalContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    setEditContent(originalContent);
  }, [originalContent]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Auto-resize textarea
      const textarea = textareaRef.current;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editContent.trim() && !isLoading) {
      onSubmit(messageId, editContent.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
    if (e.key === "Escape") {
      onCancel();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditContent(e.target.value);
    // Auto-resize
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
      {/* Compact header */}
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Editing
        </span>
      </div>

      <form onSubmit={handleSubmit} className="">
        {/* Minimal textarea */}
        <textarea
          ref={textareaRef}
          value={editContent}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full resize-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "text-gray-900 dark:text-gray-100 placeholder-gray-400",
            isMobile ? "p-2 text-sm min-h-[80px]" : "p-3 text-sm min-h-[100px]"
          )}
          placeholder="Edit message..."
          disabled={isLoading}
        />

        {/* Compact action bar */}
        <div className="flex items-center justify-between">
          {/* Keyboard shortcuts - only show on desktop */}
          {!isMobile && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                ⏎
              </kbd>{" "}
              save •{" "}
              <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                esc
              </kbd>{" "}
              cancel
            </div>
          )}

          {/* Mobile: show loading state */}
          {isMobile && isLoading && (
            <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
              <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </div>
          )}

          {/* Desktop: empty space when not loading */}
          {!isMobile && !isLoading && <div></div>}

          {/* Desktop: loading indicator */}
          {!isMobile && isLoading && (
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
              <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className={cn(
                "px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200",
                "border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800",
                "disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              )}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!editContent.trim() || isLoading}
              className={cn(
                "px-3 py-1.5 text-xs font-medium text-white rounded-md transition-colors",
                "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed",
                "flex items-center gap-1"
              )}
            >
              {isLoading ? (
                <>
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  {!isMobile && <span>Save</span>}
                </>
              ) : (
                <>
                  <Send className="w-3 h-3" />
                  {!isMobile && <span>Save</span>}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
// ============================================================================
// SIDE PANEL HEADER COMPONENT
// ============================================================================

interface SidePanelHeaderProps {
  onClose: () => void;
}

const SidePanelHeader = ({ onClose }: SidePanelHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <h2 className="font-bold text-gray-900 dark:text-gray-100 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Manga Studio
          </h2>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClose}
        className="p-1.5 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <X className="w-4 h-4" />
      </motion.button>
    </div>
  );
};

// ============================================================================
// SIDE PANEL TABS COMPONENT
// ============================================================================

interface SidePanelTabsProps {
  tabs: SidePanelTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const SidePanelTabs = ({
  tabs,
  activeTab,
  onTabChange,
}: SidePanelTabsProps) => {
  return (
    <div className="flex border-b border-gray-200 dark:border-gray-700">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex-1 py-3 px-2 text-xs font-medium transition-colors flex flex-col items-center gap-1",
            activeTab === tab.id
              ? "text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          )}
        >
          <tab.icon className="w-4 h-4" />
          <span>{tab.name}</span>
        </button>
      ))}
    </div>
  );
};

// ============================================================================
// SIDE PANEL CONTENT COMPONENT
// ============================================================================

interface SidePanelContentProps {
  activeTab: string;
  tabs: SidePanelTab[];
  projectData: MangaProject | null;
  selectedEntity: { id: string; type: string; name?: string } | null;
  onComponentSelect: (componentId: string, type: string) => void;
  onEntitySelect: (
    entity: { id: string; type: string; name?: string } | null
  ) => void;
  onAssetSelect: (asset: Asset) => void;
  onEntityDetailView: (entity: DetailableEntity, entityType: string) => void;
  onEntityChat?: (entity: { id: string; type: string; name?: string }) => void;
}

const SidePanelContent = ({
  activeTab,
  tabs,
  projectData,
  selectedEntity,
  onComponentSelect,
  onEntitySelect,
  onAssetSelect,
  onEntityDetailView,
  onEntityChat,
}: SidePanelContentProps) => {
  const activeTabData = tabs.find((tab) => tab.id === activeTab);
  if (!activeTabData) return null;

  const commonProps = {
    projectData,
    onComponentSelect,
    selectedEntity,
    onEntitySelect,
    onAssetSelect,
    onEntityDetailView,
    onEntityChat,
  };

  const Component = activeTabData.component;
  return <Component {...commonProps} />;
};

// ============================================================================
// SIDE PANEL COMPONENT
// ============================================================================

interface SidePanelProps {
  isOpen: boolean;
  width: number;
  activeTab: string;
  tabs: SidePanelTab[];
  projectData: MangaProject | null;
  selectedEntity: { id: string; type: string; name?: string } | null;
  onClose: () => void;
  onTabChange: (tabId: string) => void;
  onComponentSelect: (componentId: string, type: string) => void;
  onEntitySelect: (
    entity: { id: string; type: string; name?: string } | null
  ) => void;
  onAssetSelect: (asset: Asset) => void;
  onEntityDetailView: (entity: DetailableEntity, entityType: string) => void;
  onEntityChat?: (entity: { id: string; type: string; name?: string }) => void;
}

const SidePanel = ({
  isOpen,
  width,
  activeTab,
  tabs,
  projectData,
  selectedEntity,
  onClose,
  onTabChange,
  onComponentSelect,
  onEntitySelect,
  onAssetSelect,
  onEntityDetailView,
  onEntityChat,
}: SidePanelProps) => {
  const isMobile = useIsMobile();

  // For mobile, render the EnhancedProjectStructurePanel directly with mobile props
  if (isMobile) {
    return (
      <EnhancedProjectStructurePanel
        projectData={projectData || null}
        selectedEntity={selectedEntity}
        onComponentSelect={onComponentSelect}
        onAssetSelect={onAssetSelect}
        onEntityDetailView={onEntityDetailView}
        onEntityChat={onEntityChat}
        isOpen={isOpen}
        onClose={onClose}
      />
    );
  }

  // Desktop version remains the same
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -width, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -width, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col relative"
          style={{ width }}
        >
          <SidePanelHeader onClose={onClose} />
          <SidePanelTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={onTabChange}
          />
          <div className="flex-1 min-h-0 overflow-hidden">
            <SidePanelContent
              activeTab={activeTab}
              tabs={tabs}
              projectData={projectData}
              selectedEntity={selectedEntity}
              onComponentSelect={onComponentSelect}
              onEntitySelect={onEntitySelect}
              onAssetSelect={onAssetSelect}
              onEntityDetailView={onEntityDetailView}
              onEntityChat={onEntityChat}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// TOP BAR COMPONENT
// ============================================================================

import { getProjectWithRelations } from "@/services/data-service";
import { MangaProject } from "@/types/entities";
import { ReactNode } from "react";
import ManualPanelGeneration from "./panel-management/ManualPanelGeneration";
import SettingsPanel from "./SettingsPanel";
interface TopBarProps {
  sidePanel: { isOpen: boolean };
  selectedEntity: { id: string; type: string; name?: string } | null;
  onSidePanelOpen: () => void;
  onEntityClear: () => void;
  onManualPanelOpen: () => void;
  onClearChat?: () => void;
  children?: ReactNode;
}

const TopBar = ({
  sidePanel,
  selectedEntity,
  onSidePanelOpen,
  onEntityClear,
  onManualPanelOpen,
  onClearChat,
  children,
}: TopBarProps) => {
  const isMobile = useIsMobile();

  return (
    <div
      className={`${
        isMobile ? "h-14" : "h-16"
      } border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between ${
        isMobile ? "px-4" : "px-6"
      } bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm`}
    >
      <div className="flex items-center gap-4">
        {children}
        {!sidePanel.isOpen && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSidePanelOpen}
            className={`${
              isMobile ? "p-3" : "p-2"
            } rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors touch-manipulation`}
            title="Open Project Structure"
          >
            <Menu
              className={`${
                isMobile ? "w-6 h-6" : "w-5 h-5"
              } text-gray-600 dark:text-gray-300`}
            />
          </motion.button>
        )}
        <div>
          <div className="flex items-center gap-2">
            <div
              className={`${
                isMobile ? "w-7 h-7" : "w-6 h-6"
              } bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center`}
            >
              <Bot
                className={`${isMobile ? "w-4 h-4" : "w-4 h-4"} text-white`}
              />
            </div>
            <h1
              className={`${
                isMobile ? "text-base" : "text-lg"
              } font-bold text-gray-900 dark:text-gray-100 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}
            >
              {selectedEntity?.name
                ? selectedEntity.name
                : "AI Manga Assistant"}
            </h1>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {onClearChat && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size={isMobile ? "sm" : "sm"}
              onClick={onClearChat}
              className="border border-red-300/50 hover:border-red-400 bg-white/70 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 text-red-600 hover:text-red-700 transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm touch-manipulation"
            >
              <div className="flex items-center gap-2">
                <RotateCcw className={`${isMobile ? "w-4 h-4" : "w-4 h-4"}`} />
                <span
                  className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}
                >
                  {isMobile ? "Clear" : "Clear Chat"}
                </span>
              </div>
            </Button>
          </motion.div>
        )}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            size={isMobile ? "sm" : "sm"}
            onClick={onManualPanelOpen}
            className="border border-gray-300/50 hover:border-blue-400 bg-white/70 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 text-gray-700 hover:text-blue-700 transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm touch-manipulation"
          >
            <div className="flex items-center gap-2">
              <Wand2 className={`${isMobile ? "w-4 h-4" : "w-4 h-4"}`} />
              <span
                className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}
              >
                {isMobile ? "Panels" : "Panels"}
              </span>
            </div>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

// ============================================================================
// EMPTY MESSAGES STATE COMPONENT (with entity context)
// ============================================================================

const EmptyMessagesState = ({
  entityType,
  entityId,
  selectedEntity,
}: {
  entityType: string;
  entityId: string;
  selectedEntity: { id: string; type: string; name?: string } | null;
}) => {
  const isMobile = useIsMobile();
  // Helper to get entity display name
  let entityName = "";
  if (entityType !== "project" && selectedEntity) {
    // Try to show a nice name, fallback to type + id
    entityName =
      selectedEntity.name || `${selectedEntity.type} #${selectedEntity.id}`;
  }
  return (
    <div className="text-center py-12">
      <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      {entityType === "project" ? (
        <>
          <h3
            className={`font-medium text-gray-900 dark:text-gray-100 mb-2 ${
              isMobile ? "text-base" : "text-lg"
            }`}
          >
            Welcome to Manga AI Studio
          </h3>
          <div className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            <p>
              Start creating your manga by describing what you want to build.
            </p>
            <p className="text-sm">
              💡 <strong>Pro tip:</strong> Click the{" "}
              <Eye className="w-4 h-4 inline text-blue-500" /> eye icons in the
              side panel to view detailed information about any element!
            </p>
          </div>
        </>
      ) : (
        <>
          <h3
            className={`font-medium text-gray-900 dark:text-gray-100 mb-2 ${
              isMobile ? "text-base" : "text-lg"
            }`}
          >
            {entityName} Chat
          </h3>
          <div className="text-gray-600 dark:text-gray-400 max-w-md mx-auto space-y-2">
            <p>
              This is a dedicated chat for{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {entityName}
              </span>
              .<br />
              You can generate images and update this{" "}
              {selectedEntity?.type || "entity"} conversationally!
            </p>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================================
// INITIAL LOADING STATE COMPONENT
// ============================================================================

const InitialLoadingState = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col items-center justify-center h-full py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center space-y-6"
      >
        {/* Animated Logo */}
        <div className="relative">
          <motion.div
            className={cn(
              "bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center relative overflow-hidden",
              isMobile ? "w-20 h-20" : "w-24 h-24"
            )}
            animate={{
              boxShadow: [
                "0 0 20px rgba(59, 130, 246, 0.3)",
                "0 0 40px rgba(147, 51, 234, 0.4)",
                "0 0 20px rgba(59, 130, 246, 0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Bot
              className={cn("text-white", isMobile ? "w-10 h-10" : "w-12 h-12")}
            />

            {/* Rotating ring */}
            <motion.div
              className="absolute inset-0 rounded-3xl border-4 border-yellow-400/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />

            {/* Pulsing dots */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                style={{
                  top: "50%",
                  left: "50%",
                  transformOrigin: isMobile ? "0 -40px" : "0 -48px",
                }}
                animate={{
                  rotate: i * 90,
                  scale: [0.5, 1, 0.5],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2">
          <motion.h3
            className={cn(
              "font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",
              isMobile ? "text-xl" : "text-2xl"
            )}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading Manga Studio
          </motion.h3>

          <motion.p
            className={cn(
              "text-gray-600 dark:text-gray-400",
              isMobile ? "text-sm" : "text-base"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Preparing your creative workspace...
          </motion.p>
        </div>

        {/* Animated Progress Dots */}
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// SIMPLE LOADING SPINNER COMPONENT (for load more button)
// ============================================================================

const SimpleLoadingSpinner = () => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
};

// ============================================================================
// WAITING RESPONSE LOADING COMPONENT (for AI response)
// ============================================================================

const WaitingResponseLoader = () => {
  const isMobile = useIsMobile();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex gap-4 justify-start"
    >
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center relative overflow-hidden flex-shrink-0">
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            background: [
              "conic-gradient(from 0deg, #3b82f6, #8b5cf6, #3b82f6)",
              "conic-gradient(from 120deg, #3b82f6, #8b5cf6, #3b82f6)",
              "conic-gradient(from 240deg, #3b82f6, #8b5cf6, #3b82f6)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <Bot className="w-4 h-4 text-white relative z-10" />
      </div>

      {/* Message Bubble */}
      <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-750 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-600 relative min-w-[120px] max-w-xs">
        {/* Speech bubble tail */}
        <div className="absolute -left-2 top-4 w-0 h-0 border-t-4 border-b-4 border-r-8 border-transparent border-r-white dark:border-r-gray-800" />

        {/* Animated background */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-blue-50/20 to-transparent dark:via-blue-900/20 animate-pulse" />

        {/* Content */}
        <div className="relative z-10 flex items-center gap-2">
          {/* Typing dots */}
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* AI thinking text */}
          <motion.span
            className={cn(
              "text-gray-600 dark:text-gray-400 font-medium",
              isMobile ? "text-xs" : "text-sm"
            )}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            AI is thinking...
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// CHAT MESSAGE COMPONENTS
// ============================================================================

interface ChatMessageProps {
  message: ChatMessage;
  onCopy: (content: string) => void;
  onEdit?: (id: string) => void;
  onRetry?: (id: string) => void;
  onPreviewImage?: (src: string) => void;
  editingMessage?: {
    messageId: string | null;
    originalContent: string;
    isLoading: boolean;
  };
  onSubmitEdit?: (messageId: string, newContent: string) => void;
  onCancelEdit?: () => void;
}

const ChatMessageComponent = ({
  message,
  onCopy,
  onEdit,
  onRetry,
  onPreviewImage,
  editingMessage,
  onSubmitEdit,
  onCancelEdit,
}: ChatMessageProps) => {
  const isEditing = editingMessage?.messageId === (message.id || message._id);
  const isError = message.metadata?.action === "error";

  return (
    <motion.div
      key={message.id || message._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full px-4 py-4 group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-200"
    >
      <div className="max-w-full mx-auto">
        <div
          className={cn(
            "flex flex-col",
            message.role === "user" ? "items-end" : "items-start"
          )}
        >
          {/* Avatar positioned above message */}
          <div className="mb-2">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg",
                message.role === "user"
                  ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                  : isError
                  ? "bg-gradient-to-br from-red-500 to-rose-600"
                  : "bg-gradient-to-br from-violet-500 to-purple-600"
              )}
            >
              {message.role === "user" ? (
                <User className="w-5 h-5 text-white" />
              ) : isError ? (
                <AlertCircle className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>
          </div>

          {/* Message Container */}
          <div className="w-full">
            {/* Message Header */}
            <div
              className={cn(
                "flex items-center gap-2",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {message.role === "user"
                  ? "You"
                  : isError
                  ? "Error"
                  : "Assistant"}
              </span>
              <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* Message Bubble */}
            <div
              className={cn(
                "relative rounded-2xl px-6 shadow-sm backdrop-blur-sm border",
                message.role === "user"
                  ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-200 dark:border-emerald-700 shadow-emerald-200/20 dark:shadow-emerald-900/20"
                  : isError
                  ? "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 text-red-900 dark:text-red-100 border-red-200 dark:border-red-700 shadow-red-200/20 dark:shadow-red-900/20"
                  : "bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 shadow-gray-200/30 dark:shadow-gray-800/30"
              )}
            >
              {/* Show edit component if editing, otherwise show message content */}
              {isEditing && editingMessage && onSubmitEdit && onCancelEdit ? (
                <EditMessageComponent
                  messageId={editingMessage.messageId!}
                  originalContent={editingMessage.originalContent}
                  isLoading={editingMessage.isLoading}
                  onSubmit={onSubmitEdit}
                  onCancel={onCancelEdit}
                />
              ) : (
                <>
                  {/* General file/image preview */}
                  <ChatMessagePreview
                    message={message}
                    onPreviewImage={onPreviewImage}
                  />
                  {message.content && (
                    <div className="break-words text-sm leading-relaxed">
                      <UltimateMarkdownRenderer
                        content={message.content}
                        showToc={false}
                      />
                    </div>
                  )}

                  {/* Retry button for error messages */}
                  {isError && onRetry && message.metadata?.retryMessageId && (
                    <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-700">
                      <motion.button
                        onClick={() =>
                          onRetry(message.metadata!.retryMessageId!)
                        }
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Retry Message
                      </motion.button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Message Actions - Always visible, positioned below the bubble */}
            {!isEditing && (
              <div
                className={cn(
                  "mt-3 flex gap-2",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <motion.button
                  onClick={() => onCopy(message.content)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-3 py-2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm"
                  title="Copy message"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </motion.button>

                {/* Only show edit for user messages */}
                {onEdit && message.role === "user" && (
                  <motion.button
                    onClick={() => onEdit(message.id || message._id || "")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/30 dark:hover:to-teal-900/30 border border-emerald-200 dark:border-emerald-700 rounded-lg text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm"
                    title="Edit message"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </motion.button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// SUGGESTED ACTIONS COMPONENT
// ============================================================================

interface SuggestedActionsProps {
  selectedEntity: { id: string; type: string } | null;
  onActionSelect: (action: string) => void;
}

const SuggestedActions = ({
  selectedEntity,
  onActionSelect,
}: SuggestedActionsProps) => {
  return (
    <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800">
      <div className="flex flex-wrap gap-2">
        {selectedEntity ? (
          <>
            {selectedEntity.type === "character" && (
              <>
                <button
                  onClick={() =>
                    onActionSelect("Generate image for this character")
                  }
                  className="px-3 py-1.5 text-xs bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full border border-purple-200 dark:border-purple-500/30 transition-colors"
                >
                  🎨 Generate Image
                </button>
                <button
                  onClick={() =>
                    onActionSelect(
                      "Modify this character's appearance and personality"
                    )
                  }
                  className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-500/30 transition-colors"
                >
                  ✏️ Edit Character
                </button>
              </>
            )}
            {selectedEntity.type === "chapter" && (
              <>
                <button
                  onClick={() =>
                    onActionSelect("Create new scene for this chapter")
                  }
                  className="px-3 py-1.5 text-xs bg-green-50 hover:bg-green-100 dark:bg-green-500/10 dark:hover:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full border border-green-200 dark:border-green-500/30 transition-colors"
                >
                  ➕ Add Scene
                </button>
                <button
                  onClick={() =>
                    onActionSelect(
                      "Create all remaining scenes for this chapter"
                    )
                  }
                  className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-500/30 transition-colors"
                >
                  📝 Create All Scenes
                </button>
              </>
            )}
            {selectedEntity.type === "scene" && (
              <>
                <button
                  onClick={() =>
                    onActionSelect("Create panels for this scene with dialogs")
                  }
                  className="px-3 py-1.5 text-xs bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-500/10 dark:hover:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full border border-yellow-200 dark:border-yellow-500/30 transition-colors"
                >
                  🎬 Create Panels
                </button>
                <button
                  onClick={() =>
                    onActionSelect(
                      "Generate images for all panels in this scene"
                    )
                  }
                  className="px-3 py-1.5 text-xs bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full border border-purple-200 dark:border-purple-500/30 transition-colors"
                >
                  🖼️ Generate Scene Images
                </button>
              </>
            )}
            {(selectedEntity.type === "outfit" ||
              selectedEntity.type === "location" ||
              selectedEntity.type === "pose" ||
              selectedEntity.type === "effect") && (
              <>
                <button
                  onClick={() =>
                    onActionSelect(
                      `Apply this ${selectedEntity.type} template to characters or scenes`
                    )
                  }
                  className="px-3 py-1.5 text-xs bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-full border border-orange-200 dark:border-orange-500/30 transition-colors"
                >
                  🔧 Apply Template
                </button>
                <button
                  onClick={() =>
                    onActionSelect(
                      `Modify this ${selectedEntity.type} template`
                    )
                  }
                  className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-500/30 transition-colors"
                >
                  ✏️ Edit Template
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() =>
                onActionSelect("Create a new character for this story")
              }
              className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-500/30 transition-colors"
            >
              ✨ Create Character
            </button>
            <button
              onClick={() => onActionSelect("Add a new chapter to the story")}
              className="px-3 py-1.5 text-xs bg-green-50 hover:bg-green-100 dark:bg-green-500/10 dark:hover:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full border border-green-200 dark:border-green-500/30 transition-colors"
            >
              📖 New Chapter
            </button>
            <button
              onClick={() =>
                onActionSelect("Show me the story timeline and structure")
              }
              className="px-3 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 dark:bg-gray-500/10 dark:hover:bg-gray-500/20 text-gray-600 dark:text-gray-400 rounded-full border border-gray-200 dark:border-gray-500/30 transition-colors"
            >
              📊 Story Overview
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// IMAGE UPLOAD PREVIEW COMPONENT
// ============================================================================

interface ImageUploadPreviewProps {
  preview: string;
  onRemove: () => void;
}

const ImageUploadPreview = ({ preview, onRemove }: ImageUploadPreviewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-4 relative inline-block"
    >
      <img
        src={preview}
        alt="Upload preview"
        className="max-w-xs max-h-32 rounded-xl border-2 border-gray-200/50 dark:border-gray-600/50 shadow-lg"
      />
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full p-1.5 hover:from-red-600 hover:to-red-700 shadow-lg"
        title="Remove image"
      >
        <X className="w-3 h-3" />
      </motion.button>
    </motion.div>
  );
};

// ============================================================================
// INPUT AREA COMPONENT
// ============================================================================

interface InputAreaProps {
  input: string;
  isLoading: boolean;
  imageUpload: {
    file: File | null;
    preview: string | null;
    isUploading: boolean;
  };
  availableTools: any[];
  selectedTools: any[];
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onImageUploadClick: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: () => void;
  onToolSelect: (tool: any) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const InputArea = ({
  input,
  isLoading,
  imageUpload,
  availableTools,
  selectedTools,
  onInputChange,
  onKeyDown,
  onSubmit,
  onImageUploadClick,
  onImageUpload,
  onImageRemove,
  onToolSelect,
  textareaRef,
  fileInputRef,
}: InputAreaProps) => {
  const isMobile = useIsMobile();
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  // Define available tools with icons and descriptions
  const toolsConfig = [
    {
      id: "image-upload",
      name: "Upload Image",
      description: "Upload an image from your device",
      icon: Image,
      action: onImageUploadClick,
    },
    {
      id: "facebook-post",
      name: "Share to Facebook",
      description: "Create AI-enhanced Facebook posts",
      icon: Facebook,
      action: () => {
        // This will be handled by the AIFacebookPostingTool component
        console.log("Facebook posting tool");
      },
    },
    {
      id: "camera",
      name: "Take Photo",
      description: "Capture photo with camera",
      icon: Camera,
      action: () => {
        // Future camera implementation
        console.log("Camera feature coming soon");
      },
    },
    {
      id: "attach-file",
      name: "Attach File",
      description: "Attach documents or files",
      icon: Paperclip,
      action: () => {
        // Future file attachment implementation
        console.log("File attachment coming soon");
      },
    },
    {
      id: "voice-note",
      name: "Voice Note",
      description: "Record voice message",
      icon: Mic,
      action: () => {
        // Future voice note implementation
        console.log("Voice note coming soon");
      },
    },
  ];

  return (
    <div
      className={cn(
        "border-t border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm transition-all duration-200",
        isMobile ? "p-3" : "p-6"
      )}
    >
      {imageUpload.preview && (
        <ImageUploadPreview
          preview={imageUpload.preview}
          onRemove={onImageRemove}
        />
      )}

      <div className="relative">
        <form onSubmit={onSubmit} className="flex items-end gap-3">
          {/* Main Input Container */}
          <div className="flex-1 relative">
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={onInputChange}
              onKeyDown={onKeyDown}
              placeholder={
                imageUpload.preview
                  ? "Add a message about this image..."
                  : "Type your message... (Shift+Enter for new line)"
              }
              className={cn(
                "w-full resize-none focus:outline-none bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 border-0 ring-2 ring-gray-200 dark:ring-gray-700 focus:ring-blue-500 dark:focus:ring-blue-400",
                isMobile
                  ? "px-4 py-3 pr-12 rounded-2xl text-base min-h-[44px] max-h-[120px]"
                  : "px-6 py-4 pr-16 rounded-3xl text-sm min-h-[56px] max-h-[140px]"
              )}
              rows={1}
              disabled={isLoading}
              style={{
                boxShadow:
                  "0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
            />

            {/* Tools Dropdown Button */}
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2",
                isMobile ? "right-3" : "right-4"
              )}
            >
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setIsToolsOpen(!isToolsOpen)}
                  className={cn(
                    "flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                    isToolsOpen
                      ? "bg-blue-500 text-white shadow-lg"
                      : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100",
                    isMobile ? "w-8 h-8" : "w-10 h-10"
                  )}
                  disabled={isLoading}
                >
                  <motion.div
                    animate={{ rotate: isToolsOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
                  </motion.div>
                </motion.button>

                {/* Tools Dropdown */}
                <AnimatePresence>
                  {isToolsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        "absolute bottom-full mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl backdrop-blur-sm z-50 overflow-hidden",
                        isMobile ? "right-0 w-64" : "right-0 w-72"
                      )}
                    >
                      <div
                        className={cn(
                          "p-2",
                          isMobile ? "space-y-1" : "space-y-2"
                        )}
                      >
                        <div
                          className={cn(
                            "px-3 py-2 border-b border-gray-100 dark:border-gray-700",
                            isMobile ? "pb-2 mb-1" : "pb-3 mb-2"
                          )}
                        >
                          <h3
                            className={cn(
                              "font-semibold text-gray-900 dark:text-gray-100",
                              isMobile ? "text-sm" : "text-base"
                            )}
                          >
                            AI Tools
                          </h3>
                          <p
                            className={cn(
                              "text-gray-500 dark:text-gray-400",
                              isMobile ? "text-xs" : "text-sm"
                            )}
                          >
                            Choose how to interact with AI
                          </p>
                        </div>

                        {toolsConfig.map((tool) => {
                          const IconComponent = tool.icon;
                          return (
                            <motion.button
                              key={tool.id}
                              type="button"
                              whileHover={{ scale: 1.02, x: 4 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                tool.action();
                                setIsToolsOpen(false);
                              }}
                              className={cn(
                                "w-full flex items-center gap-3 rounded-xl transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                                "bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300",
                                isMobile ? "p-2.5" : "p-3"
                              )}
                            >
                              <div
                                className={cn(
                                  "flex items-center justify-center rounded-lg flex-shrink-0",
                                  "bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50",
                                  isMobile ? "w-8 h-8" : "w-10 h-10"
                                )}
                              >
                                <IconComponent
                                  className={cn(
                                    "text-blue-600 dark:text-blue-400",
                                    isMobile ? "w-4 h-4" : "w-5 h-5"
                                  )}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4
                                  className={cn(
                                    "font-medium text-gray-900 dark:text-gray-100",
                                    isMobile ? "text-sm" : "text-base"
                                  )}
                                >
                                  {tool.name}
                                </h4>
                                <p
                                  className={cn(
                                    "text-gray-500 dark:text-gray-400 truncate",
                                    isMobile ? "text-xs" : "text-sm"
                                  )}
                                >
                                  {tool.description}
                                </p>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={(!input.trim() && !imageUpload.file) || isLoading}
            className={cn(
              "flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
              "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
              "disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700 disabled:cursor-not-allowed",
              "text-white shadow-lg hover:shadow-xl",
              isMobile
                ? "px-4 py-3 rounded-2xl text-sm gap-2 min-w-[80px] h-11"
                : "px-6 py-4 rounded-3xl text-base gap-3 min-w-[100px] h-14"
            )}
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className={isMobile ? "w-4 h-4" : "w-5 h-5"}
                >
                  <Zap className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
                </motion.div>
                {!isMobile && <span>Sending</span>}
              </>
            ) : (
              <>
                <Send className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
                {!isMobile && <span>Send</span>}
              </>
            )}
          </motion.button>
        </form>

        {/* Click outside handler for dropdown */}
        {isToolsOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsToolsOpen(false)}
          />
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onImageUpload}
        className="hidden"
      />
    </div>
  );
};

// ============================================================================
// MAIN CHAT LAYOUT COMPONENT
// ============================================================================

export default function NewMangaChatLayout() {
  // Constants
  const PAGE_SIZE = 30;

  // Hooks
  const params = useParams();
  const projectId = params.id as string;
  const isMobile = useIsMobile();

  const [projectData, setProjectData] = useState<MangaProject | null>(null);
  const loadProject = async () => {
    setIsLoading(true);
    try {
      const data = await getProjectWithRelations(projectId);
      setProjectData(data);
    } catch (error) {
      setProjectData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]);
  // For new schema, derive entityType/entityId from projectId or selectedEntity
  // Assume entityType = 'project' and entityId = projectId for now
  // Chat context state
  const [chatContext, setChatContext] = useState<{
    entityType: string;
    entityId: string;
  }>({
    entityType: "project",
    entityId: projectId,
  });
  const entityType = chatContext.entityType;
  const entityId = chatContext.entityId;

  // Selected entity state (for context display)
  const [selectedEntity, setSelectedEntity] = useState<{
    id: string;
    type: string;
    name?: string;
  } | null>(null);

  // Handle switching chat context to an entity (with context)
  const handleEntityChat = useCallback(
    (entity: { id: string; type: string; name?: string }) => {
      setMessages([]); // Clear messages immediately on context switch
      setChatContext({ entityType: entity.type, entityId: entity.id });
      setSelectedEntity(entity);
    },
    []
  );

  // Handle returning to main project chat
  const handleBackToProjectChat = useCallback(() => {
    setMessages([]); // Clear messages immediately on context switch
    setChatContext({ entityType: "project", entityId: projectId });
    setSelectedEntity(null);
  }, [projectId]);
  const { toast } = useToast();
  const { user } = useAuthStore();

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);

  // ...selectedEntity state moved above...
  const [sidePanel, setSidePanel] = useState({
    isOpen: false, // Will be set correctly in useEffect
    activeTab: "structure",
    width: 420,
  });

  // Set initial side panel state based on mobile detection
  useEffect(() => {
    setSidePanel((prev) => ({
      ...prev,
      isOpen: !isMobile, // Closed by default on mobile, open on desktop
    }));
  }, [isMobile]);
  const [assetDetailPanel, setAssetDetailPanel] = useState<{
    isOpen: boolean;
    asset: Asset | null;
  }>({
    isOpen: false,
    asset: null,
  });
  const [entityDetailPanel, setEntityDetailPanel] = useState<{
    isOpen: boolean;
    entityId: string | null;
    entityType: string | null;
  }>({
    isOpen: false,
    entityId: null,
    entityType: null,
  });
  const [manualPanelDialog, setManualPanelDialog] = useState(false);
  const [imageUpload, setImageUpload] = useState<{
    file: File | null;
    preview: string | null;
    isUploading: boolean;
  }>({
    file: null,
    preview: null,
    isUploading: false,
  });
  const [availableTools, setAvailableTools] = useState<any[]>([]);
  const [selectedTools, setSelectedTools] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  // Edit message state
  const [editingMessage, setEditingMessage] = useState<{
    messageId: string | null;
    originalContent: string;
    isLoading: boolean;
  }>({ messageId: null, originalContent: "", isLoading: false });
  // Pagination state for manual loading
  const [page, setPage] = useState(1); // Start from 1
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  // For scroll restoration after prepending
  const [prependCount, setPrependCount] = useState(0);
  const scrollRestoreRef = useRef<{
    prevScrollHeight: number;
    prevScrollTop: number;
  } | null>(null);

  // Helper to prepend messages (for infinite scroll)
  const prependMessages = useCallback((olderMsgs: ChatMessage[]) => {
    setMessages((prev) => [...olderMsgs, ...prev]);
    setPrependCount((c) => c + 1);
  }, []);

  // Helper to add a message (for new user/assistant messages)
  const addMessage = useCallback((newMsg: ChatMessage) => {
    setMessages((prev) => [...prev, newMsg]);
  }, []);

  // Side panel tabs configuration
  const sidePanelTabs: SidePanelTab[] = [
    {
      id: "structure",
      name: "Structure",
      icon: FileText,
      component: EnhancedProjectStructurePanel,
    },
    {
      id: "panel-reader",
      name: "Panel Reader",
      icon: Eye,
      component: PanelReader,
    },
    {
      id: "settings",
      name: "Settings",
      icon: Sliders,
      component: SettingsPanel,
    },
  ];

  // ...existing code...

  // Message action handlers
  const handleCopyMessage = useCallback(
    (content: string) => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(content);
        toast({
          title: "Copied",
          description: "Message copied to clipboard.",
        });
      }
    },
    [toast]
  );

  // Asset and entity handlers
  const handleAssetSelect = useCallback((asset: Asset) => {
    setAssetDetailPanel({
      isOpen: true,
      asset,
    });
  }, []);

  const handleEntityDetailView = useCallback(
    (entity: DetailableEntity, entityType: string) => {
      // Extract the entity ID based on the entity type
      let entityId: string | null = null;

      if (entity && typeof entity === "object") {
        // Try different possible ID fields
        entityId = (entity as any)._id || (entity as any).id;
      }

      if (!entityId) {
        console.error("Could not extract entity ID from entity:", entity);
        return;
      }

      setEntityDetailPanel({
        isOpen: true,
        entityId,
        entityType,
      });
    },
    []
  );

  const handleEntityDetailClose = useCallback(() => {
    setEntityDetailPanel({
      isOpen: false,
      entityId: null,
      entityType: null,
    });
  }, []);

  const handleEntitySelect = useCallback(
    (entity: { id: string; type: string; name?: string } | null) => {
      setSelectedEntity(entity);
    },
    []
  );

  const handleComponentSelect = useCallback(
    (componentId: string, type: string) => {
      const selectionMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: `🎯 **Selected ${type}:** ${componentId}\n\nI can see you're interested in this ${type}. What would you like to do with it? I can help you:\n- Modify its properties\n- Create variations\n- Use it in a new scene\n- Generate related content\n\nJust let me know what you'd like to do!`,
        timestamp: new Date().toISOString(),
        type: "text",
      };

      addMessage(selectionMessage);
    },
    [addMessage]
  );

  // Input handlers
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);

      const textarea = e.target;
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as any);
      }
    },
    [input, isLoading, projectId, toast, imageUpload, user, addMessage]
  );

  // Image upload handlers
  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageUpload({
          file,
          preview: result,
          isUploading: false,
        });
      };
      reader.readAsDataURL(file);
    },
    [toast]
  );

  const handleImageUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageRemove = useCallback(() => {
    setImageUpload({
      file: null,
      preview: null,
      isUploading: false,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const fetchSessionsAndMessages = useCallback(
    async (initialLoading = true) => {
      try {
        setIsMessagesLoading(initialLoading);
        const response = await chatService.getSessions(entityType, entityId, {
          limit: 1,
        });

        let sessionIdToSet: string | undefined = undefined;
        let messagesToSet: ChatMessage[] = [];
        let hasMoreToSet = false; // Start with false, set to true if we get PAGE_SIZE messages

        if (
          response &&
          response.success &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          const latestSession = response.data[0];
          sessionIdToSet = latestSession._id;

          if (sessionIdToSet) {
            try {
              // Fetch messages in descending order (newest first) and reverse them
              const msgRes = await chatService.getSessionMessages({
                sessionId: sessionIdToSet,
                page: 1,
                limit: PAGE_SIZE,
              });

              if (
                msgRes &&
                msgRes.success &&
                Array.isArray(msgRes.data.messages)
              ) {
                messagesToSet = msgRes.data.messages;

                // If we got exactly PAGE_SIZE messages, there might be more
                hasMoreToSet = msgRes.data.messages.length === PAGE_SIZE;
              }
            } catch (msgErr) {
              console.error("Error fetching messages:", msgErr);
            }
          }
        }

        setSessionId(sessionIdToSet);
        setPage(1);
        setHasMore(hasMoreToSet);

        if (messagesToSet.length > 0) {
          setMessages(messagesToSet);
        }
      } catch (err) {
        console.error("Error fetching sessions and messages:", err);
        setSessionId(undefined);
        setPage(1);
        setHasMore(false);
      } finally {
        setIsMessagesLoading(false);
      }
    },
    [entityType, entityId, PAGE_SIZE]
  );

  // Edit message handler - works for any message
  const handleEditMessage = useCallback(
    (id: string) => {
      const message = messages.find((msg) => (msg.id || msg._id) === id);
      if (message) {
        setEditingMessage({
          messageId: id,
          originalContent: message.content,
          isLoading: false,
        });
      }
    },
    [messages]
  );

  // Handle retry message (same as edit but with same content)
  const handleRetryMessage = useCallback(
    async (id: string) => {
      const message = messages.find((msg) => (msg.id || msg._id) === id);
      if (!message || !sessionId) return;

      setEditingMessage({
        messageId: id,
        originalContent: message.content,
        isLoading: true,
      });

      try {
        const response = await chatService.editMessage({
          sessionId,
          messageId: id,
          message: message.content,
          tools: selectedTools.map((tool) => tool.name),
        });

        if (response.success) {
          // Refetch messages to get updated conversation
          await fetchSessionsAndMessages(false);
          toast({
            title: "Success",
            description: "Message retried successfully.",
          });
        } else {
          throw new Error(response.error || "Failed to retry message");
        }
      } catch (error: any) {
        console.error("Retry message error:", error);
        toast({
          title: "Error",
          description: "Failed to retry message. Please try again.",
          variant: "destructive",
        });
      } finally {
        setEditingMessage({
          messageId: null,
          originalContent: "",
          isLoading: false,
        });
      }
    },
    [messages, sessionId, selectedTools, toast, fetchSessionsAndMessages]
  );

  // Handle submit edit message
  const handleSubmitEditMessage = useCallback(
    async (messageId: string, newContent: string) => {
      if (!newContent.trim() || !sessionId) return;

      // Find the index of the message being edited
      const editingMessageIndex = messages.findIndex(
        (msg) => (msg.id || msg._id) === messageId
      );

      if (editingMessageIndex === -1) return;

      // Remove all messages that come after the edited message
      const messagesUpToEdited = messages.slice(0, editingMessageIndex + 1);
      setMessages(messagesUpToEdited);

      // Set loading state and show loading
      setEditingMessage((prev) => ({ ...prev, isLoading: true }));
      setIsLoading(true);

      try {
        const response = await chatService.editMessage({
          sessionId,
          messageId,
          message: newContent.trim(),
          tools: selectedTools.map((tool) => tool.name),
        });

        if (response.success) {
          // Refetch messages to get updated conversation
          await fetchSessionsAndMessages(false);
          toast({
            title: "Success",
            description: "Message edited successfully.",
          });
        } else {
          throw new Error(response.error || "Failed to edit message");
        }
      } catch (error: any) {
        console.error("Edit message error:", error);
        toast({
          title: "Error",
          description: "Failed to edit message. Please try again.",
          variant: "destructive",
        });

        // On error, restore the original messages
        setMessages(messages);
      } finally {
        setEditingMessage({
          messageId: null,
          originalContent: "",
          isLoading: false,
        });
        setIsLoading(false);
      }
    },
    [messages, sessionId, selectedTools, toast, fetchSessionsAndMessages]
  );

  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    setEditingMessage({
      messageId: null,
      originalContent: "",
      isLoading: false,
    });
  }, []);

  // Add state for clear chat confirmation dialog
  const [showClearChatDialog, setShowClearChatDialog] = useState(false);

  // Clear chat confirmation dialog component
  const ClearChatConfirmationDialog = ({
    open,
    onCancel,
    onConfirm,
    isLoading,
  }: {
    open: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    isLoading: boolean;
  }) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center text-center border border-gray-200 dark:border-gray-700"
        >
          <div className="mb-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-red-700 dark:text-red-300">
            Clear Chat?
          </h2>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            This will permanently delete all messages in this session. This
            action cannot be undone.
          </p>
          <div className="flex gap-4 w-full justify-center">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow hover:from-red-600 hover:to-pink-600 transition"
            >
              {isLoading ? "Clearing..." : "Clear"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  // Update handleClearChat to use dialog
  const handleClearChat = useCallback(async () => {
    if (!sessionId) return;
    setShowClearChatDialog(true);
  }, [sessionId]);

  // Add clear chat confirm logic
  const handleConfirmClearChat = useCallback(async () => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      const response = await chatService.clearChatSession(sessionId);
      if (response.success) {
        setMessages([]);
        toast({
          title: "Success",
          description: "Chat cleared successfully.",
        });
      } else {
        throw new Error(response.error || "Failed to clear chat");
      }
    } catch (error: any) {
      console.error("Clear chat error:", error);
      toast({
        title: "Error",
        description: "Failed to clear chat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowClearChatDialog(false);
    }
  }, [sessionId, toast]);

  // Form submission handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const textToSend = input.trim();
      if ((!textToSend && !imageUpload.file) || isLoading) return;

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: textToSend || "Image uploaded",
        timestamp: new Date().toISOString(),
        type: imageUpload.file ? "image" : "text",
        imageData: imageUpload.preview || undefined,
      };
      addMessage(userMessage);
      setInput("");

      if (imageUpload.file) {
        handleImageRemove();
      }

      setIsLoading(true);

      try {
        if (!user?.id) {
          throw new Error("Please sign in to use AI features");
        }

        if (!user?.credits || user.credits <= 0) {
          throw new Error(
            "Insufficient credits. You need credits to use AI features. Please purchase more credits."
          );
        }
        const response = await chatService.sendMessage({
          entityType,
          entityId,
          message: textToSend,
          imageData: imageUpload.preview || undefined,
          tools: selectedTools.map((tool) => tool.name),
          sessionId: sessionId,
        });

        if (!response.success) {
          throw new Error(response.error || "Failed to process message");
        }
        await loadProject();
        // Instead of adding the AI message directly, refetch all messages
        await fetchSessionsAndMessages(false);

        if (response.data.creditsUsed && response.data.creditsUsed > 0) {
          toast({
            title: "Credits Used",
            description: `${response.data.creditsUsed} credits used. ${response.data.remainingCredits} remaining.`,
          });
        }
      } catch (error: any) {
        console.error("Chat error:", error);

        // Add an error message with retry functionality
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `❌ **Error**: ${
            error.message || "Failed to get AI response"
          }\n\nClick the retry button to try again.`,
          timestamp: new Date().toISOString(),
          type: "text",
          metadata: {
            action: "error",
            retryMessageId: userMessage.id,
          },
        };
        addMessage(errorMessage);

        toast({
          title: "Error",
          description: "Message failed to send. You can retry it.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      input,
      isLoading,
      projectId,
      toast,
      imageUpload,
      user,
      addMessage,
      selectedTools,
      sessionId,
      handleImageRemove,
      entityType,
      entityId,
    ]
  );

  // Effects
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch tools (independent)
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const tools = await chatService.listAvailableTools();

        setAvailableTools(tools);
        setSelectedTools(tools);
      } catch (err) {
        setAvailableTools([]);
        setSelectedTools([]);
      }
    };
    fetchTools();
  }, [projectId]);
  // Fixed initial message fetching
  useEffect(() => {
    if (entityId && entityType) {
      fetchSessionsAndMessages();
    }
  }, [entityId, entityType]);

  // Manual load more handler
  const handleLoadOlderMessages = useCallback(async () => {
    if (!hasMore || isFetchingMore || !sessionId) return;
    setIsFetchingMore(true);
    // Save scroll state for restoration
    const container = messagesContainerRef.current;
    if (container) {
      scrollRestoreRef.current = {
        prevScrollHeight: container.scrollHeight,
        prevScrollTop: container.scrollTop,
      };
    }
    try {
      const nextPage = page + 1;
      const msgRes = await chatService.getSessionMessages({
        sessionId,
        page: nextPage,
        limit: PAGE_SIZE,
      });
      if (
        msgRes &&
        msgRes.success &&
        Array.isArray(msgRes.data?.messages) &&
        msgRes.data.messages.length > 0
      ) {
        const olderMsgs = msgRes.data.messages;
        // Sort older messages by timestamp (oldest first)
        olderMsgs.sort(
          (a: { timestamp: any }, b: { timestamp: any }) =>
            new Date(a.timestamp || 0).getTime() -
            new Date(b.timestamp || 0).getTime()
        );
        prependMessages(olderMsgs);
        setPage(nextPage);
        setHasMore(msgRes.data.messages.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching older messages:", err);
      setHasMore(false);
    } finally {
      setIsFetchingMore(false);
    }
  }, [hasMore, isFetchingMore, sessionId, page, prependMessages]);

  // Fixed scroll restoration with better timing
  React.useLayoutEffect(() => {
    if (prependCount > 0 && scrollRestoreRef.current) {
      const container = messagesContainerRef.current;
      if (!container) {
        scrollRestoreRef.current = null;
        return;
      }

      const { prevScrollHeight, prevScrollTop } = scrollRestoreRef.current;

      const restoreScroll = () => {
        const newScrollTop =
          container.scrollHeight - prevScrollHeight + prevScrollTop;
        container.scrollTop = Math.max(0, newScrollTop);
      };

      // Try immediate restoration first
      requestAnimationFrame(() => {
        restoreScroll();
        scrollRestoreRef.current = null;
      });
    }
  }, [prependCount]);

  // Restore scroll position after prepending messages using MutationObserver
  React.useLayoutEffect(() => {
    if (prependCount > 0 && scrollRestoreRef.current) {
      const container = messagesContainerRef.current;
      if (!container) {
        scrollRestoreRef.current = null;
        return;
      }
      const { prevScrollHeight, prevScrollTop } = scrollRestoreRef.current;
      let restored = false;
      const restoreScroll = () => {
        if (!restored) {
          container.scrollTop =
            container.scrollHeight - prevScrollHeight + prevScrollTop;
          restored = true;
        }
      };
      // Use MutationObserver to wait for DOM update
      const observer = new MutationObserver(() => {
        restoreScroll();
        observer.disconnect();
        scrollRestoreRef.current = null;
      });
      observer.observe(container, { childList: true, subtree: true });
      // Fallback in case MutationObserver doesn't fire
      setTimeout(() => {
        if (!restored) {
          restoreScroll();
          observer.disconnect();
          scrollRestoreRef.current = null;
        }
      }, 100);
    }
  }, [prependCount]);

  // Removed duplicate getSessions and welcome message logic

  // Step 1: Add image preview dialog state
  const [previewImageSrc, setPreviewImageSrc] = useState<string | undefined>(
    undefined
  );

  // Step 1: Add image preview dialog component
  const ImagePreviewDialog = ({
    src,
    onClose,
  }: {
    src: string | undefined;
    onClose: () => void;
  }) => {
    if (!src) return null;
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
        onClick={onClose}
      >
        <div
          className="relative max-w-3xl max-h-[90vh] p-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex flex-col items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={src}
            alt="Preview"
            className="max-w-full max-h-[80vh] rounded-lg border border-gray-200 dark:border-gray-700"
          />
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-screen flex bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 overflow-hidden relative">
      <SidePanel
        isOpen={sidePanel.isOpen}
        width={sidePanel.width}
        activeTab={sidePanel.activeTab}
        tabs={sidePanelTabs}
        projectData={projectData}
        selectedEntity={selectedEntity}
        onClose={() => setSidePanel((prev) => ({ ...prev, isOpen: false }))}
        onTabChange={(tabId) =>
          setSidePanel((prev) => ({ ...prev, activeTab: tabId }))
        }
        onComponentSelect={handleComponentSelect}
        onEntitySelect={handleEntitySelect}
        onAssetSelect={handleAssetSelect}
        onEntityDetailView={handleEntityDetailView}
        // Pass chat context switcher (now expects entity object)
        onEntityChat={handleEntityChat}
      />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <TopBar
          sidePanel={sidePanel}
          selectedEntity={selectedEntity}
          onSidePanelOpen={() =>
            setSidePanel((prev) => ({ ...prev, isOpen: true }))
          }
          onEntityClear={() => handleEntitySelect(null)}
          onManualPanelOpen={() => setManualPanelDialog(true)}
          onClearChat={messages.length > 0 ? handleClearChat : undefined}
        >
          {/* Show back arrow if not in project chat */}
          {chatContext.entityType !== "project" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackToProjectChat}
              className="p-2 rounded-lg hover:bg-blue-100/50 dark:hover:bg-blue-800/50 transition-colors mr-2"
              title="Back to Project Chat"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </motion.button>
          )}
        </TopBar>

        {/* Thin bar below TopBar for image editing chat context */}
        {chatContext.entityType !== "project" && selectedEntity && (
          <div className="w-full bg-gradient-to-r from-pink-200/90 via-yellow-100/90 to-blue-200/90 dark:from-pink-900/80 dark:via-yellow-900/60 dark:to-blue-900/80 text-pink-800 dark:text-yellow-200 text-sm font-bold px-6 py-2 border-b-2 border-pink-400/40 dark:border-pink-700/60 flex items-center gap-3 shadow-md animate-pulse-slow relative z-20">
            <span className="inline-flex items-center gap-2">
              {/* Camera icon */}
              <svg
                width="22"
                height="22"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block align-middle text-pink-600 dark:text-pink-300 drop-shadow-md"
              >
                <rect
                  x="3"
                  y="7"
                  width="18"
                  height="13"
                  rx="3"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle
                  cx="12"
                  cy="13.5"
                  r="3.5"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              <span className="tracking-wide uppercase">
                Image Editing Conversationally
              </span>
              <span className="bg-pink-100 dark:bg-pink-800 text-pink-700 dark:text-pink-200 rounded-full px-2 py-0.5 ml-2 text-xs font-semibold shadow">
                {selectedEntity.name || selectedEntity.type}
              </span>
            </span>
            <span className="ml-4 text-xs font-medium text-pink-700 dark:text-pink-200 italic">
              You can edit the image of{" "}
              <span className="font-semibold">
                {selectedEntity.name || selectedEntity.type}
              </span>{" "}
              conversationally
            </span>
          </div>
        )}

        <div
          className="flex-1 overflow-y-auto p-6 space-y-6"
          ref={messagesContainerRef}
        >
          {isMessagesLoading ? (
            <InitialLoadingState />
          ) : (
            <>
              {/* Load older messages button */}
              {hasMore && (
                <div className="flex justify-center mb-4">
                  <button
                    onClick={handleLoadOlderMessages}
                    disabled={isFetchingMore}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-700 dark:text-blue-200 font-medium shadow hover:from-blue-200 hover:to-purple-200 dark:hover:from-blue-800 dark:hover:to-purple-800 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isFetchingMore && <SimpleLoadingSpinner />}
                    {isFetchingMore ? "Loading..." : "Load older messages"}
                  </button>
                </div>
              )}
              {messages.length === 0 && (
                <EmptyMessagesState
                  entityType={entityType}
                  entityId={entityId}
                  selectedEntity={selectedEntity}
                />
              )}

              {messages.map((message) => (
                <ChatMessageComponent
                  key={message.id}
                  message={message}
                  onCopy={handleCopyMessage}
                  onEdit={handleEditMessage}
                  onRetry={handleRetryMessage}
                  onPreviewImage={setPreviewImageSrc}
                  editingMessage={editingMessage}
                  onSubmitEdit={handleSubmitEditMessage}
                  onCancelEdit={handleCancelEdit}
                />
              ))}

              {/* Show waiting response loader when AI is processing */}
              <AnimatePresence>
                {isLoading && <WaitingResponseLoader />}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {messages.length > 0 && !isLoading && (
          <SuggestedActions
            selectedEntity={selectedEntity}
            onActionSelect={setInput}
          />
        )}

        <InputArea
          input={input}
          isLoading={isLoading}
          imageUpload={imageUpload}
          availableTools={availableTools}
          selectedTools={selectedTools}
          onInputChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onSubmit={handleSubmit}
          onImageUploadClick={handleImageUploadClick}
          onImageUpload={handleImageUpload}
          onImageRemove={handleImageRemove}
          onToolSelect={(tool) => {
            // Handle tool selection if needed
            console.log("Selected tool:", tool);
          }}
          textareaRef={textareaRef}
          fileInputRef={fileInputRef}
        />
      </div>

      <ManualPanelGeneration
        isOpen={manualPanelDialog}
        onClose={() => setManualPanelDialog(false)}
        projectId={projectId}
      />

      <EntityDetailPanel
        entityId={entityDetailPanel.entityId}
        entityType={entityDetailPanel.entityType as any}
        isOpen={entityDetailPanel.isOpen}
        onClose={handleEntityDetailClose}
        onEdit={(entity) => {
          console.log("Edit entity:", entity);
          handleEntityDetailClose();
        }}
        onDelete={(entity) => {
          console.log("Delete entity:", entity);
          handleEntityDetailClose();
        }}
        onDuplicate={(entity) => {
          console.log("Duplicate entity:", entity);
          handleEntityDetailClose();
        }}
      />

      {/* Image Preview Dialog */}
      <ImagePreviewDialog
        src={previewImageSrc}
        onClose={() => setPreviewImageSrc(undefined)}
      />

      {/* Clear Chat Confirmation Dialog */}
      <ClearChatConfirmationDialog
        open={showClearChatDialog}
        onCancel={() => setShowClearChatDialog(false)}
        onConfirm={handleConfirmClearChat}
        isLoading={isLoading}
      />
    </div>
  );
}
