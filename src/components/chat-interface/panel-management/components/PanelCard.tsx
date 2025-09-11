import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Panel } from "@/types/entities";
import {
  Edit,
  Film,
  MapPin,
  MessageSquare,
  Palette,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { memo, useCallback, useState } from "react";
import { CanvasEditor } from "../CanvasEditor";
import { PanelCardProps } from "../types";
import { PanelViewer } from "./PanelViewer";

const PanelCard = memo<PanelCardProps>(
  ({
    panel,
    index,
    mode,
    colors,
    projectData,
    onEdit,
    onCanvasUpdate,
    onDelete,
    onAddAfter,
    onDialogueConfigChange,
  }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isCanvasEditorOpen, setIsCanvasEditorOpen] = useState(false);

    const handleDialogueConfigChange = useCallback(
      (dialogueId: string, newConfig: any) => {
        if (panel._id) {
          onDialogueConfigChange(panel._id, dialogueId, newConfig);
        }
      },
      [panel._id, onDialogueConfigChange]
    );

    // Handle canvas editor save
    const handleCanvasSave = useCallback(
      async (updatedPanel: Panel, renderedImageBlob?: Blob) => {
        await onCanvasUpdate(updatedPanel, renderedImageBlob);
        setIsCanvasEditorOpen(false);
      },
      [onCanvasUpdate]
    );

    const handleDeleteConfirm = useCallback(async () => {
      if (!panel._id) return;

      setIsDeleting(true);
      try {
        await onDelete(panel._id);
        setDeleteDialogOpen(false);
      } catch (error) {
        console.error("Failed to delete panel:", error);
      } finally {
        setIsDeleting(false);
      }
    }, [panel._id, onDelete]);

    // In preview mode, show only the raw panel content without any decorative wrapper
    if (mode === "preview") {
      return (
        <div className="relative w-full mb-0" style={{ width: "100%" }}>
          <PanelViewer
            key={`panel-${panel._id}-preview`}
            panel={panel}
            className="webtoon-panel w-full"
            showDialogs={true}
          />
        </div>
      );
    }

    // Edit mode - show full panel with controls and details
    return (
      <div className="relative w-full">
        <div
          className={`w-full ${colors.panelBg} backdrop-blur-xl ${colors.border} border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl`}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                <Film className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h3 className={`font-bold ${colors.text} text-base sm:text-lg`}>
                  Panel {index + 1}
                </h3>
                <p className={`${colors.textMuted} text-xs sm:text-sm`}>
                  {panel.characters?.length || 0} characters •{" "}
                  {panel.dialogs?.length || 0} dialogs
                </p>
              </div>
            </div>

            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={() => setIsCanvasEditorOpen(true)}
                className="p-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-colors"
                title="Open Canvas Editor"
              >
                <Palette className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(panel)}
                className="p-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
                title="Edit Panel"
              >
                <Edit className="w-4 h-4 text-gray-300" />
              </button>
              <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <button
                    className="p-2 bg-red-700/50 hover:bg-red-700 rounded-lg transition-colors"
                    title="Delete Panel"
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4 text-red-300" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent
                  className={`${colors.cardBg} ${colors.border} border-2`}
                >
                  <AlertDialogHeader>
                    <AlertDialogTitle
                      className={`${colors.text} text-lg font-bold`}
                    >
                      Delete Panel {index + 1}
                    </AlertDialogTitle>
                    <AlertDialogDescription className={`${colors.textMuted}`}>
                      Are you sure you want to delete this panel? This action
                      cannot be undone. All dialogues and configurations for
                      this panel will be permanently removed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      className={`${colors.panelBg} ${colors.border} border ${colors.text} hover:bg-gray-700`}
                      disabled={isDeleting}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteConfirm}
                      className="bg-red-600 hover:bg-red-700 text-white disabled:bg-red-600/50 disabled:cursor-not-allowed"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Deleting...
                        </div>
                      ) : (
                        "Delete Panel"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Interactive Panel Display */}
          <div className="relative w-full rounded-xl overflow-hidden bg-gray-800">
            <PanelViewer key={`panel-${panel._id}-view`} panel={panel} />
          </div>

          {/* Panel Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 mt-4">
            {/* Characters */}
            <div
              className={`${colors.cardBg} rounded-xl p-3 ${colors.border} border`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className={`font-medium ${colors.text} text-sm`}>
                  Characters
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {panel.characterOutfitIds?.length || 0} character
                {panel.characterOutfitIds?.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Location */}
            <div
              className={`${colors.cardBg} rounded-xl p-3 ${colors.border} border`}
            >
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-green-400" />
                <span className={`font-medium ${colors.text} text-sm`}>
                  Location
                </span>
              </div>
              <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-lg text-xs font-medium">
                {(projectData?.locationTemplates ?? []).find(
                  (l) => l._id === panel.locationId
                )?.name || "Not set"}
              </span>
            </div>

            {/* Dialogs Count */}
            <div
              className={`${colors.cardBg} rounded-xl p-3 ${colors.border} border sm:col-span-2 lg:col-span-1`}
            >
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span className={`font-medium ${colors.text} text-sm`}>
                  Dialogs
                </span>
              </div>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-medium">
                {panel.dialogs?.length || 0} dialog
                {panel.dialogs?.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Description */}
          <div
            className={`${colors.cardBg} rounded-xl p-3 ${colors.border} border`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className={`font-medium ${colors.text} text-sm`}>
                Description
              </span>
            </div>
            <p className={`${colors.textSecondary} text-sm leading-relaxed`}>
              {panel.description || "No description provided"}
            </p>
          </div>
        </div>

        {/* Add Panel Button (Edit Mode Only) */}
        {mode === "edit" && (
          <AddPanelButton
            onAddAfter={() => onAddAfter(panel.order)}
            colors={colors}
          />
        )}

        {/* Enhanced Canvas Panel Editor Dialog */}
        <CanvasEditor
          isOpen={isCanvasEditorOpen}
          panel={panel}
          onClose={() => setIsCanvasEditorOpen(false)}
          onSave={handleCanvasSave}
          colors={colors}
        />
      </div>
    );
  }
);

const AddPanelButton = memo<{
  onAddAfter: () => void;
  colors: any;
}>(({ onAddAfter, colors }) => (
  <div className="flex justify-center my-4">
    <button
      onClick={onAddAfter}
      className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/40 hover:to-blue-600/40 border-2 border-dashed border-purple-500/50 hover:border-purple-400 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm text-sm"
    >
      <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
        <span className="text-white text-xs">+</span>
      </div>
      <span className="font-medium text-purple-300 group-hover:text-purple-200 transition-colors">
        Add Panel After
      </span>
    </button>
  </div>
));

PanelCard.displayName = "PanelCard";
AddPanelButton.displayName = "AddPanelButton";

export default PanelCard;
