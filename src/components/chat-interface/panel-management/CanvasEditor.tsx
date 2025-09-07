import { Panel, PanelDialogue } from "@/types/entities";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Download,
  Edit2,
  Eye,
  Plus,
  Redo,
  RotateCcw,
  Save,
  Settings,
  Trash2,
  Undo,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface CanvasState {
  panel: Panel;
  bubbles: PanelDialogue[];
  selectedBubbleId: string | null;
  zoom: number;
  canvasSize: { width: number; height: number };
  actualCanvasSize: { width: number; height: number };
}

interface CanvasEditorProps {
  isOpen: boolean;
  panel: Panel | null;
  onClose: () => void;
  onSave: (updatedPanel: Panel, renderedImageBlob?: Blob) => Promise<void>;
  colors: any;
  saveRenderedImage?: boolean;
}

// Utility functions
const generateBubbleId = () =>
  `bubble-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const createNewBubble = (
  x: number,
  y: number,
  panelId: string,
  canvasWidth: number = 800,
  canvasHeight: number = 600
): PanelDialogue => {
  const width = 160;
  const height = 100;

  // Ensure the bubble is created within canvas boundaries
  const constrainedX = Math.max(0, Math.min(x, canvasWidth - width));
  const constrainedY = Math.max(0, Math.min(y, canvasHeight - height));

  return {
    _id: generateBubbleId(),
    order: Date.now(),
    content: "New dialogue",
    emotion: "neutral",
    speakerId: "",
    bubbleType: "normal",
    panelId,
    config: {
      x: constrainedX,
      y: constrainedY,
      width,
      height,
      flipX: false,
      flipY: false,
      selected: false,
      fontSize: 12,
      textColor: "#000000",
      fontWeight: "normal",
      backgroundColor: "#ffffff",
      borderColor: "#000000",
      borderWidth: 2,
      borderRadius: 12,
    },
  };
};

// Bubble Types Configuration
const BUBBLE_TYPES = [
  {
    value: "normal",
    label: "Speech",
    color: "#ffffff",
    image: "/images/bubbles/normal-rounded.png",
  },
  {
    value: "thought",
    label: "Thought",
    color: "#f0f0f0",
    image: "/images/bubbles/thought.png",
  },
  {
    value: "scream",
    label: "Scream",
    color: "#ffe6e6",
    image: "/images/bubbles/screem.png",
  },
  {
    value: "whisper",
    label: "Whisper",
    color: "#e6f3ff",
    image: "/images/bubbles/normal-rounded.png",
  },
  {
    value: "narration",
    label: "Narration",
    color: "#fff9e6",
    image: "/images/bubbles/normal-rectangle.png",
  },
] as const;

// Confirmation Dialog Component
interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  colors: any;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  colors,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className={`${colors.panelBg} rounded-2xl shadow-2xl border ${colors.border} max-w-md w-full mx-4`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${colors.text} mb-1`}>
                  {title}
                </h3>
                <p className={`text-sm ${colors.textMuted}`}>{message}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={onCancel}
              className={`flex-1 px-4 py-2.5 ${colors.cardBg} border ${colors.border} rounded-lg ${colors.text} hover:bg-gray-700 transition-colors font-medium`}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Enhanced Dialog Bubble Component
interface BubbleComponentProps {
  bubble: PanelDialogue;
  zoom: number;
  onUpdate: (id: string, updates: Partial<PanelDialogue>) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  editMode: boolean;
  canvasSize: { width: number; height: number };
}

const BubbleComponent: React.FC<BubbleComponentProps> = ({
  bubble,
  zoom,
  onUpdate,
  onSelect,
  onDelete,
  isSelected,
  editMode,
  canvasSize,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
    bubbleX: 0,
    bubbleY: 0,
  });
  const [resizeStart, setResizeStart] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });
  const bubbleRef = useRef<HTMLDivElement>(null);

  const getBubbleStyle = () => {
    const config = bubble.config || {};
    const bubbleType =
      BUBBLE_TYPES.find((t) => t.value === bubble.bubbleType) ||
      BUBBLE_TYPES[0];

    // Create transform string for flips
    const transforms = [];
    if (config.flipX) transforms.push("scaleX(-1)");
    if (config.flipY) transforms.push("scaleY(-1)");
    const transform = transforms.length > 0 ? transforms.join(" ") : "none";

    return {
      backgroundImage: `url(${bubbleType.image})`,
      backgroundSize: "100% 100%",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundColor: "transparent",
      border: "none",
      fontSize: `${config.fontSize || 12}px`,
      color: config.textColor || "#000000",
      fontWeight: config.fontWeight || "normal",
      transform, // Apply the flip transforms to the bubble image
    };
  };

  const getTextContainerStyle = () => {
    const config = bubble.config || {};
    const bubbleTypeValue = bubble.bubbleType || "normal";

    // Base text positioning
    let textStyle: any = {};

    switch (bubbleTypeValue) {
      case "normal":
        textStyle = {
          position: "absolute" as const,
          top: "15%",
          left: "10%",
          width: "80%",
          height: "60%",
        };
        break;
      case "thought":
        textStyle = {
          position: "absolute" as const,
          top: "10%",
          left: "17%",
          width: "70%",
          height: "60%",
        };
        break;
      case "scream":
        textStyle = {
          position: "absolute" as const,
          top: "25%",
          left: "15%",
          width: "70%",
          height: "50%",
        };
        break;
      case "narration":
        textStyle = {
          position: "absolute" as const,
          top: "4%",
          left: "5%",
          width: "90%",
          height: "70%",
        };
        break;
      case "whisper":
      default:
        textStyle = {
          position: "absolute" as const,
          top: "15%",
          left: "10%",
          width: "80%",
          height: "60%",
        };
    }

    // Counter-transform the text to keep it readable when bubble is flipped
    const transforms = [];
    if (config.flipX) transforms.push("scaleX(-1)");
    if (config.flipY) transforms.push("scaleY(-1)");
    const counterTransform =
      transforms.length > 0 ? transforms.join(" ") : "none";

    return {
      ...textStyle,
      transform: counterTransform, // Counter the bubble's flip for text
    };
  };

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();

    onSelect(bubble._id!);
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      bubbleX: bubble.config?.x || 0,
      bubbleY: bubble.config?.y || 0,
    });
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: bubble.config?.width || 160,
      height: bubble.config?.height || 100,
    });
  };

  // Global mouse move handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = (e.clientX - dragStart.x) / zoom;
        const deltaY = (e.clientY - dragStart.y) / zoom;

        // Calculate new position
        const newX = dragStart.bubbleX + deltaX;
        const newY = dragStart.bubbleY + deltaY;

        // Canvas dimensions (fixed at 800x600 based on the canvas setup)
        const canvasWidth = canvasSize.width;
        const canvasHeight = canvasSize.height;
        const bubbleWidth = bubble.config?.width || 160;
        const bubbleHeight = bubble.config?.height || 100;

        // Constrain bubble within canvas boundaries on all sides
        const constrainedX = Math.max(
          0,
          Math.min(newX, canvasWidth - bubbleWidth)
        );
        const constrainedY = Math.max(
          0,
          Math.min(newY, canvasHeight - bubbleHeight)
        );

        onUpdate(bubble._id!, {
          config: {
            ...bubble.config,
            x: constrainedX,
            y: constrainedY,
          },
        });
      }

      if (isResizing) {
        const deltaX = (e.clientX - resizeStart.x) / zoom;
        const deltaY = (e.clientY - resizeStart.y) / zoom;

        // Calculate new dimensions
        const newWidth = Math.max(100, resizeStart.width + deltaX);
        const newHeight = Math.max(60, resizeStart.height + deltaY);

        // Canvas dimensions
        const canvasWidth = canvasSize.width;
        const canvasHeight = canvasSize.height;
        const bubbleX = bubble.config?.x || 0;
        const bubbleY = bubble.config?.y || 0;

        // Ensure resized bubble doesn't exceed canvas boundaries
        const maxWidth = canvasWidth - bubbleX;
        const maxHeight = canvasHeight - bubbleY;

        onUpdate(bubble._id!, {
          config: {
            ...bubble.config,
            width: Math.min(newWidth, maxWidth),
            height: Math.min(newHeight, maxHeight),
          },
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [
    isDragging,
    isResizing,
    dragStart,
    resizeStart,
    bubble._id,
    onUpdate,
    zoom,
  ]);

  return (
    <div
      ref={bubbleRef}
      className={`absolute cursor-move select-none bubble-component ${
        isSelected ? "ring-2 ring-blue-500" : ""
      }`}
      style={{
        left: `${bubble.config?.x || 0}px`,
        top: `${bubble.config?.y || 0}px`,
        width: `${bubble.config?.width || 160}px`,
        height: `${bubble.config?.height || 100}px`,
        zIndex: isSelected ? 20 : 10,
        ...getBubbleStyle(),
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        if (!editMode) return;
        onSelect(bubble._id!);
      }}
    >
      {/* Bubble Content - positioned inside the bubble shape */}
      <div
        className="flex items-center justify-center text-center overflow-hidden"
        style={{
          ...getTextContainerStyle(),
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {editMode ? (
          <div
            contentEditable
            className="w-full h-full bg-transparent border-none outline-none resize-none text-center flex items-center justify-center break-words"
            onInput={(e) => {
              const target = e.target as HTMLDivElement;
              onUpdate(bubble._id!, { content: target.textContent || "" });
            }}
            onClick={(e) => e.stopPropagation()}
            onBlur={(e) => {
              const target = e.target as HTMLDivElement;
              onUpdate(bubble._id!, { content: target.textContent || "" });
            }}
            dangerouslySetInnerHTML={{ __html: bubble.content }}
            style={{
              fontSize: "inherit",
              color: "inherit",
              fontWeight: "inherit",
              lineHeight: "1.2",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0",
              margin: "0",
              border: "none",
              boxSizing: "border-box",
              minHeight: "100%",
              wordWrap: "break-word",
              overflowWrap: "break-word",
            }}
          />
        ) : (
          <span
            className="break-words"
            style={{
              display: "block",
              width: "100%",
              textAlign: "center",
              fontSize: "inherit",
              color: "inherit",
              fontWeight: "inherit",
              lineHeight: "inherit",
            }}
          >
            {bubble.content}
          </span>
        )}
      </div>

      {/* Selection handles */}
      {isSelected && editMode && (
        <>
          {/* Corner resize handle */}
          <div
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded cursor-se-resize hover:bg-blue-600"
            onMouseDown={handleResizeStart}
          />

          {/* Delete button */}
          <button
            className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(bubble._id!);
            }}
          >
            <X className="w-3 h-3" />
          </button>
        </>
      )}
    </div>
  );
};

// Properties Panel Component
interface PropertiesPanelProps {
  bubble: PanelDialogue | null;
  onUpdate: (id: string, updates: Partial<PanelDialogue>) => void;
  colors: any;
  canvasSize: { width: number; height: number };
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  bubble,
  onUpdate,
  colors,
  canvasSize,
}) => {
  if (!bubble) {
    return (
      <div
        className={`w-80 ${colors.panelBg} border-l ${colors.border} p-4 flex items-center justify-center`}
      >
        <div className="text-center">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className={`${colors.textMuted} text-sm`}>
            Select a dialogue bubble to edit its properties
          </p>
        </div>
      </div>
    );
  }

  const config = bubble.config || {};

  const updateConfig = (key: string, value: any) => {
    onUpdate(bubble._id!, {
      config: {
        ...config,
        [key]: value,
      },
    });
  };

  const updateBubbleType = (type: string) => {
    onUpdate(bubble._id!, {
      bubbleType: type as any,
    });
  };

  return (
    <div
      className={`w-80 ${colors.panelBg} border-l ${colors.border} flex flex-col max-h-full`}
    >
      <div className="p-4 overflow-y-auto flex-1">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h3 className={`${colors.text} font-medium mb-1`}>Properties</h3>
            <p className={`${colors.textMuted} text-xs`}>
              Selected: Dialogue {bubble.order}
            </p>
          </div>

          {/* Content */}
          <div>
            <label className={`block ${colors.text} text-sm font-medium mb-2`}>
              Content
            </label>
            <textarea
              className={`w-full px-3 py-2 ${colors.cardBg} border ${colors.border} rounded-lg ${colors.text} text-sm resize-none`}
              rows={3}
              value={bubble.content}
              onChange={(e) =>
                onUpdate(bubble._id!, { content: e.target.value })
              }
              placeholder="Enter dialogue text..."
            />
          </div>

          {/* Bubble Type */}
          <div>
            <label className={`block ${colors.text} text-sm font-medium mb-2`}>
              Bubble Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {BUBBLE_TYPES.map((type) => (
                <button
                  key={type.value}
                  className={`px-3 py-2 text-xs rounded-lg border transition-colors flex items-center gap-2 ${
                    bubble.bubbleType === type.value
                      ? "bg-blue-600 text-white border-blue-600"
                      : `${colors.cardBg} ${colors.text} ${colors.border} hover:bg-gray-700`
                  }`}
                  onClick={() => updateBubbleType(type.value)}
                >
                  <div
                    className="w-4 h-4 rounded bg-cover bg-center bg-no-repeat flex-shrink-0"
                    style={{
                      backgroundImage: `url(${type.image})`,
                      backgroundColor: type.color,
                    }}
                  />
                  <span className="truncate">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={`block ${colors.text} text-sm font-medium mb-2`}>
              Bubble Orientation
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                className={`px-3 py-2 text-xs rounded-lg border transition-colors flex items-center gap-2 ${
                  config.flipX
                    ? "bg-blue-600 text-white border-blue-600"
                    : `${colors.cardBg} ${colors.text} ${colors.border} hover:bg-gray-700`
                }`}
                onClick={() => updateConfig("flipX", !config.flipX)}
              >
                <div className="w-4 h-4 border border-current rounded flex items-center justify-center">
                  ↔
                </div>
                <span>Flip H</span>
              </button>
              <button
                className={`px-3 py-2 text-xs rounded-lg border transition-colors flex items-center gap-2 ${
                  config.flipY
                    ? "bg-blue-600 text-white border-blue-600"
                    : `${colors.cardBg} ${colors.text} ${colors.border} hover:bg-gray-700`
                }`}
                onClick={() => updateConfig("flipY", !config.flipY)}
              >
                <div className="w-4 h-4 border border-current rounded flex items-center justify-center">
                  ↕
                </div>
                <span>Flip V</span>
              </button>
            </div>
            <p className={`${colors.textMuted} text-xs mt-1`}>
              Flip the bubble image to point arrows in different directions
            </p>
          </div>
          {/* Position & Size */}
          <div>
            <h4 className={`${colors.text} text-sm font-medium mb-3`}>
              Position & Size
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block ${colors.textMuted} text-xs mb-1`}>
                  X
                </label>
                <input
                  type="number"
                  className={`w-full px-2 py-1 ${colors.cardBg} border ${colors.border} rounded text-sm ${colors.text}`}
                  value={Math.round(config.x || 0)}
                  min={0}
                  max={canvasSize.width - (config.width || 160)}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    const constrainedX = Math.max(
                      0,
                      Math.min(value, canvasSize.width - (config.width || 160))
                    );
                    updateConfig("x", constrainedX);
                  }}
                />
              </div>
              <div>
                <label className={`block ${colors.textMuted} text-xs mb-1`}>
                  Y
                </label>
                <input
                  type="number"
                  className={`w-full px-2 py-1 ${colors.cardBg} border ${colors.border} rounded text-sm ${colors.text}`}
                  value={Math.round(config.y || 0)}
                  min={0}
                  max={canvasSize.height - (config.height || 100)}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    const constrainedY = Math.max(
                      0,
                      Math.min(
                        value,
                        canvasSize.height - (config.height || 100)
                      )
                    );
                    updateConfig("y", constrainedY);
                  }}
                />
              </div>
              <div>
                <label className={`block ${colors.textMuted} text-xs mb-1`}>
                  Width
                </label>
                <input
                  type="number"
                  className={`w-full px-2 py-1 ${colors.cardBg} border ${colors.border} rounded text-sm ${colors.text}`}
                  value={Math.round(config.width || 160)}
                  min={100}
                  max={canvasSize.width - (config.x || 0)}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 100;
                    const maxWidth = canvasSize.width - (config.x || 0);
                    const constrainedWidth = Math.max(
                      100,
                      Math.min(value, maxWidth)
                    );
                    updateConfig("width", constrainedWidth);
                  }}
                />
              </div>
              <div>
                <label className={`block ${colors.textMuted} text-xs mb-1`}>
                  Height
                </label>
                <input
                  type="number"
                  className={`w-full px-2 py-1 ${colors.cardBg} border ${colors.border} rounded text-sm ${colors.text}`}
                  value={Math.round(config.height || 100)}
                  min={60}
                  max={canvasSize.height - (config.y || 0)}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 60;
                    const maxHeight = canvasSize.height - (config.y || 0);
                    const constrainedHeight = Math.max(
                      60,
                      Math.min(value, maxHeight)
                    );
                    updateConfig("height", constrainedHeight);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Text Styling */}
          <div>
            <h4 className={`${colors.text} text-sm font-medium mb-3`}>
              Text Styling
            </h4>
            <div className="space-y-3">
              <div>
                <label className={`block ${colors.textMuted} text-xs mb-1`}>
                  Font Size
                </label>
                <input
                  type="range"
                  min="10"
                  max="32"
                  value={config.fontSize || 12}
                  onChange={(e) =>
                    updateConfig("fontSize", parseInt(e.target.value))
                  }
                  className="w-full"
                />
                <span className={`${colors.textMuted} text-xs`}>
                  {config.fontSize || 12}px
                </span>
              </div>

              <div>
                <label className={`block ${colors.textMuted} text-xs mb-1`}>
                  Font Weight
                </label>
                <select
                  className={`w-full px-2 py-1 ${colors.cardBg} border ${colors.border} rounded text-sm ${colors.text}`}
                  value={config.fontWeight || "normal"}
                  onChange={(e) => updateConfig("fontWeight", e.target.value)}
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="lighter">Light</option>
                </select>
              </div>

              <div>
                <label className={`block ${colors.textMuted} text-xs mb-1`}>
                  Text Color
                </label>
                <input
                  type="color"
                  value={config.textColor || "#000000"}
                  onChange={(e) => updateConfig("textColor", e.target.value)}
                  className="w-full h-8 rounded border"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-600">
            <button
              className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              onClick={() => onUpdate(bubble._id!, { _toDelete: true } as any)}
            >
              <Trash2 className="w-4 h-4 mr-2 inline" />
              Delete Bubble
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
  isOpen,
  panel,
  onClose,
  onSave,
  colors,
}) => {
  // Canvas state
  const [canvasState, setCanvasState] = useState<CanvasState>({
    panel: panel!,
    bubbles: [],
    selectedBubbleId: null,
    zoom: 1,
    canvasSize: { width: 800, height: 600 }, // Base dimensions - must match PanelViewer BASE_WIDTH/HEIGHT
    actualCanvasSize: { width: 800, height: 600 }, // Will be updated with actual image dimensions
  });
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [history, setHistory] = useState<CanvasState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Initialize canvas when panel loads
  useEffect(() => {
    if (isOpen && panel) {
      // Use initial base dimensions - will be updated when image loads
      const canvasWidth = 800;
      const canvasHeight = 600;

      const initialBubbles: PanelDialogue[] = (panel.dialogs || []).map(
        (dialog) => {
          const x = dialog.config?.x || 100;
          const y = dialog.config?.y || 100;
          const width = dialog.config?.width || 160;
          const height = dialog.config?.height || 100;

          // Constrain existing bubbles within canvas bounds
          const constrainedX = Math.max(0, Math.min(x, canvasWidth - width));
          const constrainedY = Math.max(0, Math.min(y, canvasHeight - height));
          const constrainedWidth = Math.max(
            100,
            Math.min(width, canvasWidth - constrainedX)
          );
          const constrainedHeight = Math.max(
            60,
            Math.min(height, canvasHeight - constrainedY)
          );

          return {
            ...dialog,
            config: {
              ...dialog.config,
              x: constrainedX,
              y: constrainedY,
              width: constrainedWidth,
              height: constrainedHeight,
              selected: false,
            },
          };
        }
      );

      const initialState: CanvasState = {
        panel: { ...panel },
        bubbles: initialBubbles,
        selectedBubbleId: null,
        zoom: 1,
        canvasSize: { width: canvasWidth, height: canvasHeight },
        actualCanvasSize: { width: canvasWidth, height: canvasHeight }, // Will be updated when image loads
      };

      setCanvasState(initialState);
      setHistory([initialState]);
      setHistoryIndex(0);
      setHasUnsavedChanges(false);
      setIsPreviewMode(false);
    }
  }, [isOpen, panel]);

  // Update canvas size based on panel image
  useEffect(() => {
    // Use fixed dimensions instead of dynamic sizing
    setCanvasState((prev) => ({
      ...prev,
      canvasSize: { width: 800, height: 600 }, // Fixed base dimensions
      actualCanvasSize: { width: 800, height: 600 }, // Will be updated when image loads
    }));
  }, [panel?.imgUrl]);

  // Handle image load to get actual dimensions
  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      const naturalWidth = imageRef.current.naturalWidth;
      const naturalHeight = imageRef.current.naturalHeight;

      // Use a consistent base width for the editor (you can adjust this)
      const BASE_WIDTH = 800;
      const aspectRatio = naturalWidth / naturalHeight;
      const calculatedHeight = BASE_WIDTH / aspectRatio;

      setCanvasState((prev) => ({
        ...prev,
        canvasSize: { width: BASE_WIDTH, height: calculatedHeight },
        actualCanvasSize: { width: BASE_WIDTH, height: calculatedHeight },
      }));
    }
  }, []);

  // Add to history
  const addToHistory = useCallback(
    (newState: CanvasState) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ ...newState });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setHasUnsavedChanges(true);
    },
    [history, historyIndex]
  );

  // Update bubble
  const updateBubble = useCallback(
    (id: string, updates: Partial<PanelDialogue>) => {
      setCanvasState((prev) => {
        const newState = {
          ...prev,
          bubbles: prev.bubbles.map((bubble) =>
            bubble._id === id ? { ...bubble, ...updates } : bubble
          ),
        };

        // Handle deletion
        if ((updates as any)._toDelete) {
          newState.bubbles = newState.bubbles.filter((b) => b._id !== id);
          newState.selectedBubbleId = null;
        }

        addToHistory(newState);
        return newState;
      });
    },
    [addToHistory]
  );

  // Select bubble
  const selectBubble = useCallback((id: string) => {
    setCanvasState((prev) => ({
      ...prev,
      selectedBubbleId: prev.selectedBubbleId === id ? null : id,
    }));
  }, []);

  // Add new bubble
  const addBubble = useCallback(() => {
    // Generate random position within canvas bounds
    const bubbleWidth = 160;
    const bubbleHeight = 100;
    const canvasWidth = canvasState.actualCanvasSize.width;
    const canvasHeight = canvasState.actualCanvasSize.height;

    const maxX = canvasWidth - bubbleWidth;
    const maxY = canvasHeight - bubbleHeight;

    const x = Math.random() * maxX;
    const y = Math.random() * maxY;

    const newBubble = createNewBubble(
      x,
      y,
      panel?._id || "",
      canvasWidth,
      canvasHeight
    );

    setCanvasState((prev) => {
      const newState = {
        ...prev,
        bubbles: [...prev.bubbles, newBubble],
        selectedBubbleId: newBubble._id || null,
      };
      addToHistory(newState);
      return newState;
    });
  }, [panel?._id, addToHistory, canvasState.actualCanvasSize]); // Canvas click handler
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      // Only deselect if clicking directly on the canvas, not on bubbles
      const target = e.target as HTMLElement;
      const isCanvasClick =
        target === e.currentTarget ||
        target.closest(".bubble-component") === null;

      if (isCanvasClick && !isPreviewMode) {
        setCanvasState((prev) => ({ ...prev, selectedBubbleId: null }));
      }
    },
    [isPreviewMode]
  );

  // Canvas double-click handler to add bubbles
  const handleCanvasDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isPreviewMode || !canvasRef.current) return;

      const target = e.target as HTMLElement;
      const isCanvasClick = target === e.currentTarget;

      if (isCanvasClick) {
        const rect = canvasRef.current.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) / canvasState.zoom;
        const clickY = (e.clientY - rect.top) / canvasState.zoom;

        // Create bubble centered on click position, but ensure it's within bounds
        const bubbleWidth = 160;
        const bubbleHeight = 100;
        const x = clickX - bubbleWidth / 2;
        const y = clickY - bubbleHeight / 2;

        const newBubble = createNewBubble(
          x,
          y,
          panel?._id || "",
          canvasState.actualCanvasSize.width,
          canvasState.actualCanvasSize.height
        );

        setCanvasState((prev) => {
          const newState = {
            ...prev,
            bubbles: [...prev.bubbles, newBubble],
            selectedBubbleId: newBubble._id || null,
          };
          addToHistory(newState);
          return newState;
        });
      }
    },
    [
      isPreviewMode,
      canvasState.zoom,
      canvasState.actualCanvasSize,
      panel?._id,
      addToHistory,
    ]
  );

  // Add wheel event handler for zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Check if Ctrl (Windows/Linux) or Cmd (Mac) is held down
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault(); // Prevent page scroll

        // Determine zoom direction and amount
        const delta = e.deltaY;
        const zoomIncrement = 0.1;

        setCanvasState((prev) => {
          let newZoom = prev.zoom;

          if (delta > 0) {
            // Scroll down = zoom out
            newZoom = Math.max(prev.zoom - zoomIncrement, 0.25);
          } else {
            // Scroll up = zoom in
            newZoom = Math.min(prev.zoom + zoomIncrement, 3);
          }

          return {
            ...prev,
            zoom: newZoom,
          };
        });
      }
    };

    // Add event listener to the container when editor is open
    const container = containerRef.current;
    if (isOpen && container) {
      // Use passive: false to allow preventDefault
      container.addEventListener("wheel", handleWheel, { passive: false });

      return () => {
        container.removeEventListener("wheel", handleWheel);
      };
    }
  }, [isOpen]);

  // Zoom controls
  const handleZoomIn = () =>
    setCanvasState((prev) => ({
      ...prev,
      zoom: Math.min(prev.zoom + 0.25, 3),
    }));

  const handleZoomOut = () =>
    setCanvasState((prev) => ({
      ...prev,
      zoom: Math.max(prev.zoom - 0.25, 0.25),
    }));

  const handleResetZoom = () =>
    setCanvasState((prev) => ({ ...prev, zoom: 1 }));

  // Undo/Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCanvasState(history[newIndex]);
      setHasUnsavedChanges(true);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCanvasState(history[newIndex]);
      setHasUnsavedChanges(true);
    }
  };

  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Export canvas as high-quality image for backend
  const generateHighQualityPanelImage =
    useCallback(async (): Promise<Blob | null> => {
      if (!canvasRef.current || !imageRef.current || !panel) return null;

      try {
        // Create a high-resolution canvas for better quality
        const SCALE_FACTOR = 2; // 2x resolution for crisp images
        const exportCanvas = document.createElement("canvas");
        const ctx = exportCanvas.getContext("2d");
        if (!ctx) return null;

        // Set high-resolution canvas size
        const baseWidth = canvasState.actualCanvasSize.width;
        const baseHeight = canvasState.actualCanvasSize.height;
        const canvasWidth = baseWidth * SCALE_FACTOR;
        const canvasHeight = baseHeight * SCALE_FACTOR;

        exportCanvas.width = canvasWidth;
        exportCanvas.height = canvasHeight;

        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Scale the context to match our scale factor
        ctx.scale(SCALE_FACTOR, SCALE_FACTOR);

        // Draw the panel background image
        const panelImage = document.createElement("img") as HTMLImageElement;
        panelImage.crossOrigin = "anonymous";

        await new Promise((resolve, reject) => {
          panelImage.onload = resolve;
          panelImage.onerror = reject;
          panelImage.src = panel.imgUrl || "/images/hero-bg.png";
        });

        // Draw the panel image at base size (will be scaled by context)
        ctx.drawImage(panelImage, 0, 0, baseWidth, baseHeight);

        // Load bubble images and draw bubbles
        for (const bubble of canvasState.bubbles) {
          const bubbleType =
            BUBBLE_TYPES.find((t) => t.value === bubble.bubbleType) ||
            BUBBLE_TYPES[0];
          const config = bubble.config || {};

          // Load bubble background image
          const bubbleImage = document.createElement("img") as HTMLImageElement;
          bubbleImage.crossOrigin = "anonymous";

          await new Promise((resolve) => {
            bubbleImage.onload = resolve;
            bubbleImage.onerror = () => {
              console.warn(`Failed to load bubble image: ${bubbleType.image}`);
              resolve(null);
            };
            bubbleImage.src = bubbleType.image;
          });

          // Draw bubble background
          if (bubbleImage.complete && bubbleImage.naturalWidth > 0) {
            ctx.save(); // Save current context state

            // Apply transformations for flips
            const centerX = (config.x || 0) + (config.width || 160) / 2;
            const centerY = (config.y || 0) + (config.height || 100) / 2;

            ctx.translate(centerX, centerY);

            if (config.flipX) ctx.scale(-1, 1);
            if (config.flipY) ctx.scale(1, -1);

            ctx.drawImage(
              bubbleImage,
              -(config.width || 160) / 2,
              -(config.height || 100) / 2,
              config.width || 160,
              config.height || 100
            );

            ctx.restore(); // Restore context state
          } else {
            // Fallback: draw a simple colored rectangle if image fails
            ctx.fillStyle = bubbleType.color;
            ctx.fillRect(
              config.x || 0,
              config.y || 0,
              config.width || 160,
              config.height || 100
            );
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 2;
            ctx.strokeRect(
              config.x || 0,
              config.y || 0,
              config.width || 160,
              config.height || 100
            );
          }

          // Draw text content with high quality
          const fontSize = config.fontSize || 12;
          const fontWeight = config.fontWeight || "normal";
          const textColor = config.textColor || "#000000";

          ctx.fillStyle = textColor;
          ctx.font = `${fontWeight} ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Text positioning (same logic as before)
          const getTextArea = () => {
            const bubbleX = config.x || 0;
            const bubbleY = config.y || 0;
            const bubbleWidth = config.width || 160;
            const bubbleHeight = config.height || 100;

            switch (bubble.bubbleType) {
              case "normal":
                return {
                  x: bubbleX + bubbleWidth * 0.5,
                  y: bubbleY + bubbleHeight * 0.45,
                  maxWidth: bubbleWidth * 0.8,
                  maxHeight: bubbleHeight * 0.6,
                };
              case "thought":
                return {
                  x: bubbleX + bubbleWidth * 0.52,
                  y: bubbleY + bubbleHeight * 0.4,
                  maxWidth: bubbleWidth * 0.7,
                  maxHeight: bubbleHeight * 0.6,
                };
              case "scream":
                return {
                  x: bubbleX + bubbleWidth * 0.5,
                  y: bubbleY + bubbleHeight * 0.5,
                  maxWidth: bubbleWidth * 0.7,
                  maxHeight: bubbleHeight * 0.5,
                };
              case "narration":
                return {
                  x: bubbleX + bubbleWidth * 0.5,
                  y: bubbleY + bubbleHeight * 0.37,
                  maxWidth: bubbleWidth * 0.9,
                  maxHeight: bubbleHeight * 0.7,
                };
              default:
                return {
                  x: bubbleX + bubbleWidth * 0.5,
                  y: bubbleY + bubbleHeight * 0.45,
                  maxWidth: bubbleWidth * 0.8,
                  maxHeight: bubbleHeight * 0.6,
                };
            }
          };

          const textArea = getTextArea();

          // Enhanced word wrap function
          const wrapText = (text: string, maxWidth: number) => {
            const words = text.split(" ");
            const lines = [];
            let currentLine = "";

            for (const word of words) {
              const testLine = currentLine + (currentLine ? " " : "") + word;
              const metrics = ctx.measureText(testLine);

              if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
              } else {
                currentLine = testLine;
              }
            }

            if (currentLine) {
              lines.push(currentLine);
            }

            return lines;
          };

          // Draw wrapped text with better quality
          if (bubble.content && bubble.content.trim()) {
            const lines = wrapText(bubble.content, textArea.maxWidth);
            const lineHeight = fontSize * 1.2;
            const totalTextHeight = lines.length * lineHeight;
            const bubbleY = config.y || 0;
            const bubbleHeight = config.height || 100;

            const startY = textArea.y - totalTextHeight / 2 + lineHeight / 2;

            lines.forEach((line, index) => {
              const y = startY + index * lineHeight;
              if (y >= bubbleY && y <= bubbleY + bubbleHeight) {
                ctx.fillText(line, textArea.x, y);
              }
            });
          }
        }

        // Convert canvas to high-quality blob
        return new Promise((resolve) => {
          exportCanvas.toBlob(
            (blob) => resolve(blob),
            "image/png",
            1.0 // Maximum quality
          );
        });
      } catch (error) {
        console.error("Error generating high-quality panel image:", error);
        return null;
      }
    }, [canvasState, panel, canvasRef, imageRef]);

  // Export for download (keeping the original functionality)
  const handleExportImage = useCallback(async () => {
    setExporting(true);
    try {
      const blob = await generateHighQualityPanelImage();
      if (!blob) {
        alert("Failed to export image. Please try again.");
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `panel-${panel?.order || "export"}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting image:", error);
      alert("Failed to export image. Please try again.");
    } finally {
      setExporting(false);
    }
  }, [generateHighQualityPanelImage, panel]);

  // Save changes with high-quality rendered image
  const handleSave = async () => {
    if (!hasUnsavedChanges) return;

    setSaving(true);
    try {
      // Always prepare the panel data with dialogs (for backward compatibility)
      let updatedPanel: Panel = {
        ...canvasState.panel,
        dialogs: canvasState.bubbles.map((bubble) => ({
          order: bubble.order,
          content: bubble.content,
          emotion: bubble.emotion,
          speakerId: bubble.speakerId,
          bubbleType: bubble.bubbleType,
          panelId: bubble.panelId,
          config: bubble.config,
        })),
      };

      await onSave(updatedPanel);

      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Error saving panel:", error);
      alert("Failed to save panel. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Close with confirmation
  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowCloseConfirmation(true);
    } else {
      onClose();
    }
  };

  // Handle confirmation dialog responses
  const handleConfirmClose = () => {
    setShowCloseConfirmation(false);
    onClose();
  };

  const handleCancelClose = () => {
    setShowCloseConfirmation(false);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showCloseConfirmation && e.key === "Escape") {
        handleCancelClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showCloseConfirmation]);

  // Get selected bubble
  const selectedBubble =
    canvasState.bubbles.find((b) => b._id === canvasState.selectedBubbleId) ||
    null;

  if (!isOpen || !panel) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50"
      >
        <div className="w-full h-full flex flex-col">
          {/* Header */}
          <div
            className={`${colors.panelBg} border-b ${colors.border} p-4 flex items-center justify-between`}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Edit2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${colors.text}`}>
                    Canvas Editor
                  </h2>
                  <p className={`${colors.textMuted} text-sm`}>
                    Panel {panel.order} • {canvasState.bubbles.length} dialogues
                    {canvasState.bubbles.length > 0 &&
                      " • High-quality rendering enabled"}
                    {panel.renderedImgUrl && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        🎨 Rendered Available
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {hasUnsavedChanges && (
                <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs font-medium">
                  ● Unsaved Changes
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Export Image Button */}
              <button
                onClick={handleExportImage}
                disabled={exporting}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  exporting
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                }`}
                title="Download high-quality panel image locally"
              >
                {exporting ? (
                  <div className="w-4 h-4 mr-2 inline animate-spin rounded-full border-2 border-gray-300 border-t-white" />
                ) : (
                  <Download className="w-4 h-4 mr-2 inline" />
                )}
                {exporting ? "Exporting..." : "Download"}
              </button>

              {/* Preview Toggle */}
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  isPreviewMode
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <Eye className="w-4 h-4 mr-2 inline" />
                {isPreviewMode ? "Edit" : "Preview"}
              </button>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || saving}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  hasUnsavedChanges && !saving
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Save className="w-4 h-4 mr-2 inline" />
                Save
              </button>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Toolbar */}
          {!isPreviewMode && (
            <div
              className={`${colors.panelBg} border-b ${colors.border} p-3 flex items-center justify-between`}
            >
              <div className="flex items-center gap-4">
                {/* Add Dialogue */}
                <button
                  onClick={addBubble}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                  title="Add new dialogue bubble"
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Add Dialogue
                </button>

                <div className="w-px h-6 bg-gray-600" />

                {/* Tip */}
                <span className={`${colors.textMuted} text-xs`}>
                  💡 Double-click on the canvas to add dialogues quickly
                </span>

                <div className="w-px h-6 bg-gray-600" />

                {/* History Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-700 hover:bg-gray-600 text-gray-300"
                    title="Undo"
                  >
                    <Undo className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                    className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-700 hover:bg-gray-600 text-gray-300"
                    title="Redo"
                  >
                    <Redo className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={handleZoomOut}
                    className="p-1.5 hover:bg-gray-700 rounded text-gray-300 transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-sm text-gray-300 min-w-[60px] text-center">
                    {Math.round(canvasState.zoom * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-1.5 hover:bg-gray-700 rounded text-gray-300 transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleResetZoom}
                    className="p-1.5 hover:bg-gray-700 rounded text-gray-300 transition-colors ml-1"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <span className={`${colors.textMuted} text-sm`}>
                  Selected:{" "}
                  {selectedBubble ? `Dialogue ${selectedBubble.order}` : "None"}
                </span>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex overflow-hidden">
            {/* Canvas Area */}
            <div className="flex-1 bg-gray-900 relative">
              <div
                ref={containerRef}
                className="w-full h-full overflow-auto scroll-smooth"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, #374151 1px, transparent 1px)",
                  backgroundSize: `${20 * canvasState.zoom}px ${
                    20 * canvasState.zoom
                  }px`,
                }}
              >
                <div
                  className="relative"
                  style={{
                    // Create a container that's large enough to hold the scaled content
                    width: `max(100%, ${
                      canvasState.canvasSize.width * canvasState.zoom + 200
                    }px)`,
                    height: `max(100%, ${
                      canvasState.canvasSize.height * canvasState.zoom + 200
                    }px)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "100px", // Extra padding to ensure visibility
                  }}
                >
                  <div
                    ref={canvasRef}
                    className={`relative shadow-2xl overflow-visible bubble-canvas rounded-lg`}
                    style={{
                      transform: `scale(${canvasState.zoom})`,
                      transformOrigin: "center center",
                      width: `${canvasState.canvasSize.width}px`,
                      height: `${canvasState.canvasSize.height}px`,
                    }}
                    onClick={handleCanvasClick}
                    onDoubleClick={handleCanvasDoubleClick}
                  >
                    {/* Your existing image and bubbles content */}
                    <img
                      ref={imageRef}
                      src={panel.imgUrl || "/images/hero-bg.png"}
                      alt="Panel"
                      className="block max-w-none"
                      style={{
                        width: canvasState.canvasSize.width,
                        height: canvasState.canvasSize.height,
                      }}
                      draggable={false}
                      onLoad={handleImageLoad}
                    />

                    {canvasState.bubbles.map((bubble) => (
                      <BubbleComponent
                        key={bubble._id}
                        bubble={bubble}
                        zoom={1}
                        onUpdate={updateBubble}
                        onSelect={selectBubble}
                        onDelete={(id) =>
                          updateBubble(id, { _toDelete: true } as any)
                        }
                        isSelected={bubble._id === canvasState.selectedBubbleId}
                        editMode={!isPreviewMode}
                        canvasSize={canvasState.actualCanvasSize}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Properties Panel */}
            {!isPreviewMode && (
              <PropertiesPanel
                bubble={selectedBubble}
                onUpdate={updateBubble}
                colors={colors}
                canvasSize={canvasState.actualCanvasSize}
              />
            )}
          </div>
        </div>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showCloseConfirmation}
          title="Unsaved Changes"
          message="You have unsaved changes that will be lost. Are you sure you want to close without saving?"
          confirmText="Close Without Saving"
          cancelText="Keep Editing"
          onConfirm={handleConfirmClose}
          onCancel={handleCancelClose}
          colors={colors}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default CanvasEditor;
