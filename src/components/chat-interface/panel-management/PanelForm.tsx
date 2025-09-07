import { Image, Layout, MessageSquare, Save, X, Zap } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";
import CharacterSelector from "./components/panel-form/CharacterSelector";
import DialogManagement from "./components/panel-form/DialogManagement";
import ImageSetup from "./components/panel-form/ImageSetup";
import LocationSelector from "./components/panel-form/LocationSelector";
import PanelDescription from "./components/panel-form/PanelDescription";
import { usePanelForm } from "./hooks";
import { PanelFormProps } from "./types";

const PanelForm = memo<PanelFormProps>(
  ({
    isOpen,
    onClose,
    onSave,
    editingPanel,
    insertAfterIndex,
    projectData,
    colors,
    isSaving,
    selectedSceneId = "",
  }) => {
    const [activeTab, setActiveTab] = useState<"panel" | "dialogs" | "image">(
      "panel"
    );
    const [chatEntityId, setChatEntityId] =
      useState<string>("new-panel-session");

    const {
      panelData,
      updateDescription,
      updateLocation,
      toggleCharacter,
      addDialog,
      updateDialog,
      updateDialogConfig,
      removeDialog,
      resetForm,
      loadPanel,
      updatePanel,
    } = usePanelForm();

    // Update chat entity ID when form opens/changes
    useEffect(() => {
      if (isOpen) {
        if (editingPanel) {
          setChatEntityId(editingPanel._id!);
          loadPanel({
            _id: editingPanel._id,
            order: editingPanel.order || 0,
            sceneId: editingPanel.sceneId || "",
            imgUrl: editingPanel.imgUrl || "",
            characterOutfitIds: editingPanel.characterOutfitIds || [],
            locationId: editingPanel.locationId || "",
            description: editingPanel.description || "",
            dialogs: editingPanel.dialogs || [],
          });
        } else {
          resetForm();
          if (selectedSceneId) {
            updatePanel({ sceneId: selectedSceneId });
          }
        }
      }
    }, [
      isOpen,
      editingPanel,
      selectedSceneId,
      loadPanel,
      resetForm,
      updatePanel,
    ]);

    const handleSave = useCallback(async () => {
      await onSave(panelData);
    }, [onSave, panelData]);

    const handleGenerateImage = useCallback(() => {
      // Simulate image generation - this should update the panel's imgUrl, not dialog
      // For now, we'll just set a placeholder - this should be replaced with actual image generation logic
      setTimeout(() => {
        // This would normally update the panel's imgUrl through a different mechanism
        console.log("Generating image...");
      }, 1000);
    }, []);

    const isFormValid =
      panelData.description.trim() !== "" &&
      panelData.characterOutfitIds.length > 0 &&
      panelData.locationId !== "";

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-2 overflow-y-auto">
        <div
          className={`${colors.cardBg} backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border-2 ${colors.border} max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mt-2 sm:mt-4`}
        >
          {/* Modal Header */}
          <div className="p-3 sm:p-6 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2
                    className={`text-xl sm:text-2xl font-bold ${colors.text} bg-gradient-to-r ${colors.accent} bg-clip-text text-transparent`}
                  >
                    {editingPanel ? "Edit Panel" : "Create New Panel"}
                  </h2>
                  <p className={`${colors.textMuted} text-sm sm:text-base`}>
                    {editingPanel
                      ? "Update your manga panel"
                      : "Design your next manga panel"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`w-8 h-8 sm:w-10 sm:h-10 ${colors.panelBg} hover:bg-red-500/20 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110`}
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-700/50">
            <div className="flex px-3 sm:px-6 overflow-x-auto">
              {(editingPanel
                ? ["panel", "dialogs", "image"]
                : ["panel", "dialogs"]
              ).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`px-3 sm:px-6 py-3 sm:py-4 font-medium border-b-2 transition-all duration-200 capitalize flex-shrink-0 ${
                    activeTab === tab
                      ? tab === "panel"
                        ? "border-yellow-500 text-yellow-300"
                        : tab === "dialogs"
                        ? "border-purple-500 text-purple-300"
                        : "border-blue-500 text-blue-300"
                      : "border-transparent text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {tab === "panel" && <Layout className="w-4 h-4" />}
                    {tab === "dialogs" && <MessageSquare className="w-4 h-4" />}
                    {tab === "image" && <Image className="w-4 h-4" />}
                    <span className="hidden sm:inline">
                      {tab === "panel"
                        ? "Panel Setup"
                        : tab === "dialogs"
                        ? "Dialogs Setup"
                        : "Image Setup"}
                    </span>
                    <span className="sm:hidden capitalize">{tab}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-3 sm:p-6 space-y-6 sm:space-y-8">
            {activeTab === "panel" && (
              <>
                <CharacterSelector
                  characters={projectData?.characters || []}
                  selectedIds={panelData.characterOutfitIds}
                  onToggle={toggleCharacter}
                  colors={colors}
                />
                <LocationSelector
                  locations={projectData?.locationTemplates || []}
                  selectedId={panelData.locationId}
                  onSelect={updateLocation}
                  colors={colors}
                />
                <PanelDescription
                  value={panelData.description}
                  onChange={updateDescription}
                  colors={colors}
                />
              </>
            )}

            {activeTab === "dialogs" && (
              <DialogManagement
                dialogs={panelData.dialogs}
                characters={projectData?.characters || []}
                colors={colors}
                onAddDialog={addDialog}
                onUpdateDialog={updateDialog}
                onRemoveDialog={removeDialog}
              />
            )}

            {activeTab === "image" && (
              <ImageSetup
                panel={panelData}
                entityId={chatEntityId}
                colors={colors}
                onUpdateDialogConfig={updateDialogConfig}
                onGenerateImage={handleGenerateImage}
              />
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-3 sm:p-6 border-t border-gray-700/50 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span
                className={`${colors.textMuted} text-xs sm:text-sm text-center sm:text-left`}
              >
                {editingPanel
                  ? "Editing existing panel"
                  : `Panel will be added after Panel ${insertAfterIndex + 1}`}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={onClose}
                className={`px-4 sm:px-6 py-2 sm:py-3 ${colors.panelBg} ${colors.border} border-2 rounded-xl font-medium ${colors.textSecondary} hover:${colors.text} transition-all duration-200 text-sm order-2 sm:order-1`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!isFormValid || isSaving}
                className="px-4 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm order-1 sm:order-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {editingPanel ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editingPanel ? "Update Panel" : "Create Panel"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PanelForm.displayName = "PanelForm";

export default PanelForm;
