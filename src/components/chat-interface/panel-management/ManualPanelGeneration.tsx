import {
  createPanelWithDialogues,
  deletePanel,
  getProjectWithRelations as getProjectWithDetails,
  updatePanelWithDialogues,
  updatePanelWithRenderedImage,
  type CreatePanelWithDialoguesDto,
  type PanelDialogueDto,
  type UpdatePanelWithDialoguesDto,
} from "@/services/data-service";
import { Chapter, MangaProject, Panel, Scene } from "@/types/entities";
import { BookOpen, ChevronDown, Edit2, Eye, X } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";
import PanelCard from "./components/PanelCard";
import { usePanelDialogManagement } from "./hooks";
import { useColorScheme } from "./hooks/useColorScheme";
import PanelForm from "./PanelForm";
import { ManualPanelGeneratorProps, PanelFormData } from "./types";

const ManualPanelGeneration = memo<ManualPanelGeneratorProps>(
  ({ isOpen = true, onClose = () => {}, projectId = "project1" }) => {
    // State management
    const [projectData, setProjectData] = useState<MangaProject | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedChapter, setSelectedChapter] = useState<string>("");
    const [selectedScene, setSelectedScene] = useState<string>("");
    const [mode, setMode] = useState<"edit" | "preview">("edit");
    const [darkMode] = useState<boolean>(true);

    // Panel form state
    const [showPanelForm, setShowPanelForm] = useState<boolean>(false);
    const [editingPanel, setEditingPanel] = useState<Panel | null>(null);
    const [insertAfterOrder, setInsertAfterOrder] = useState<number>(-1);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // Get colors
    const colors = useColorScheme(darkMode);

    // Panel management
    const {
      panels: managedPanels,
      setPanels: setManagedPanels,
      updateDialogueConfig: updateManagedDialogueConfig,
    } = usePanelDialogManagement([]);

    // Fetch project data
    const fetchProjectData = async (
      selectedChapterId?: string,
      selectedSceneId?: string,
      initialLoading: boolean = true
    ) => {
      if (!isOpen) return;

      setIsLoading(initialLoading);
      try {
        const data = await getProjectWithDetails(projectId);
        if (data) {
          setProjectData(data);
          // Set first chapter as default
          if (data.chapters && data.chapters.length > 0) {
            setSelectedChapter(selectedChapterId || data.chapters[0]._id || "");
            // Set first scene as default when chapter is selected
            if (data.chapters[0].scenes && data.chapters[0].scenes.length > 0) {
              setSelectedScene(
                selectedSceneId || data.chapters[0].scenes[0]._id || ""
              );
            }
          }
        }
      } catch (error) {
        console.error("Failed to load project:", error);
        setProjectData(null);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      fetchProjectData();
    }, [projectId, isOpen]);

    // Update managed panels when chapter or scene changes
    useEffect(() => {
      if (projectData && selectedChapter && selectedScene) {
        const chapter = projectData.chapters?.find(
          (c: Chapter) => c._id === selectedChapter
        );
        if (chapter) {
          const scene = chapter.scenes?.find(
            (s: Scene) => s._id === selectedScene
          );
          if (scene) {
            // Get panels from the selected scene only
            const scenePanels = (scene.panels || []).map((panel: any) => ({
              ...panel,
              sceneId: scene._id,
              description: panel.description ?? "",
              characters:
                panel.characters?.map((char: any) => ({
                  ...char,
                  description: char.description ?? "",
                })) || [],
            }));

            // Sort panels by order
            scenePanels.sort((a, b) => (a.order || 0) - (b.order || 0));

            setManagedPanels(scenePanels);
          } else {
            setManagedPanels([]);
          }
        }
      }
    }, [selectedChapter, selectedScene, projectData, setManagedPanels]);

    // Update selected scene when chapter changes
    useEffect(() => {
      if (projectData && selectedChapter) {
        const chapter = projectData.chapters?.find(
          (c: Chapter) => c._id === selectedChapter
        );
        if (chapter && chapter.scenes && chapter.scenes.length > 0) {
          setSelectedScene(chapter.scenes[0]._id || "");
        } else {
          setSelectedScene("");
        }
      }
    }, [selectedChapter, projectData]);

    // Panel management functions
    const handleAddPanel = useCallback((afterIndex: number) => {
      setInsertAfterOrder(afterIndex);
      setShowPanelForm(true);
      setEditingPanel(null);
    }, []);

    const handleEditPanel = useCallback((panel: Panel) => {
      setEditingPanel(panel);
      setShowPanelForm(true);
      setInsertAfterOrder(-1);
    }, []);

    // Handle canvas editor updates (for dialog editing with optional rendered image)
    const handleCanvasUpdate = useCallback(
      async (updatedPanel: Panel) => {
        if (!updatedPanel._id) return;

        try {
          const dialogues: PanelDialogueDto[] = (
            updatedPanel.dialogs ?? []
          ).map((dialog) => ({
            order: dialog.order,
            content: dialog.content,
            emotion: dialog.emotion,
            speakerId: dialog.speakerId,
            bubbleType: dialog.bubbleType as PanelDialogueDto["bubbleType"],
            config: dialog.config || {},
          }));
          const updateDto: UpdatePanelWithDialoguesDto = {
            panelData: {
              order: updatedPanel.order,
              description: updatedPanel.description,
              imgUrl: updatedPanel.imgUrl,
              characterOutfitIds: updatedPanel.characterOutfitIds,
              locationId: updatedPanel.locationId,
              sceneId: updatedPanel.sceneId,
            },
            dialogues,
          };
          // Use the new function that handles rendered images
          await updatePanelWithRenderedImage(updatedPanel._id, updateDto);

          // Refresh project data to get updated panel info
          await fetchProjectData(selectedChapter, selectedScene, false);
        } catch (error) {
          console.error("Failed to update panel from canvas:", error);
        }
      },
      [selectedChapter, selectedScene]
    );

    const handleDeletePanel = useCallback(
      async (panelId: string): Promise<void> => {
        try {
          await deletePanel(panelId);
          await fetchProjectData(selectedChapter, selectedScene, false);
        } catch (error) {
          console.error("Failed to delete panel:", error);
          throw error; // Re-throw to let PanelCard handle the error
        }
      },
      [selectedChapter, selectedScene]
    );

    const handleSavePanel = useCallback(
      async (panelData: PanelFormData) => {
        setIsSaving(true);
        try {
          // Convert PanelDialogue[] to PanelDialogueDto[]
          const dialogues: PanelDialogueDto[] = panelData.dialogs.map(
            (dialog) => ({
              order: dialog.order,
              content: dialog.content,
              emotion: dialog.emotion,
              speakerId: dialog.speakerId,
              bubbleType: dialog.bubbleType as PanelDialogueDto["bubbleType"],
              config: dialog.config || {},
            })
          );

          if (editingPanel) {
            // Update existing panel with dialogues
            const updateDto: UpdatePanelWithDialoguesDto = {
              panelData: {
                order: panelData.order,
                description: panelData.description,
                imgUrl: panelData.imgUrl,
                characterOutfitIds: panelData.characterOutfitIds,
                locationId: panelData.locationId,
                sceneId: selectedScene,
              },
              dialogues,
            };
            await updatePanelWithDialogues(panelData._id!, updateDto);
          } else {
            // Create new panel with dialogues
            const createDto: CreatePanelWithDialoguesDto = {
              panelData: {
                order: insertAfterOrder + 1,
                description: panelData.description,
                imgUrl: panelData.imgUrl,
                characterOutfitIds: panelData.characterOutfitIds,
                locationId: panelData.locationId,
                sceneId: selectedScene,
              },
              dialogues,
            };
            await createPanelWithDialogues(createDto);
          }
        } catch (error) {
          console.error("Failed to save panel:", error);
        } finally {
          await fetchProjectData(selectedChapter, selectedScene, false);
          setIsSaving(false);
          setShowPanelForm(false);
          setEditingPanel(null);
          setInsertAfterOrder(-1);
        }
      },
      [
        editingPanel,
        insertAfterOrder,
        selectedScene, // Add selectedScene as dependency
        setManagedPanels,
        projectData?.characters,
      ]
    );

    const handleCloseForm = useCallback(() => {
      setShowPanelForm(false);
      setEditingPanel(null);
      setInsertAfterOrder(-1);
    }, []);

    // Loading state
    if (!isOpen) return null;

    if (isLoading) {
      return (
        <div
          className={`fixed inset-0 ${colors.bg} z-50 flex items-center justify-center`}
        >
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-purple-500 border-blue-500/30 rounded-full animate-spin mx-auto mb-4"></div>
            <p className={`${colors.text} text-lg`}>Loading your project...</p>
          </div>
        </div>
      );
    }

    if (!projectData) {
      return (
        <div
          className={`fixed inset-0 ${colors.bg} z-50 flex items-center justify-center`}
        >
          <div className="text-center">
            <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className={`${colors.text} text-lg mb-4`}>
              Failed to load project
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium"
            >
              Close
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`fixed inset-0 ${
          mode === "preview"
            ? darkMode
              ? "bg-black"
              : "bg-gray-900"
            : colors.bg
        } z-40 overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div
          className={`${colors.cardBg} backdrop-blur-xl border-b-2 ${colors.border} shadow-lg`}
        >
          <div className="max-w-7xl mx-auto px-2 py-2 md:px-4 md:py-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-2">
              <div className="flex items-start gap-2 md:items-center md:gap-3">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-lg md:text-xl font-bold ${colors.text}`}>
                    {projectData.title}
                  </h1>
                  <p className={`${colors.textMuted} text-xs md:text-sm`}>
                    Manual Panel Generation
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 md:gap-2">
                {/* Mode Toggle */}
                <div className="flex bg-gray-800 rounded-xl p-0.5">
                  <button
                    onClick={() => setMode("edit")}
                    className={`px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                      mode === "edit"
                        ? "bg-purple-600 text-white shadow-lg"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <Edit2 className="w-3 h-3 md:w-4 md:h-4 mr-1 inline" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => setMode("preview")}
                    className={`px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                      mode === "preview"
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1 inline" />
                    <span className="hidden sm:inline">Preview</span>
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className={`w-8 h-8 md:w-9 md:h-9 ${colors.panelBg} hover:bg-red-500/20 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110`}
                >
                  <X className="w-5 h-5 text-red-400" />
                </button>
              </div>
            </div>

            {/* Chapter and Scene Selection */}
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1">
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  className={`w-full px-3 py-2 ${colors.panelBg} ${colors.border} border rounded-xl ${colors.text} focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 text-sm`}
                >
                  <option value="">Select Chapter</option>
                  {projectData.chapters?.map((chapter: Chapter) => (
                    <option key={chapter._id} value={chapter._id}>
                      {chapter.title} ({chapter.scenes?.length || 0} scenes)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <select
                  value={selectedScene}
                  onChange={(e) => setSelectedScene(e.target.value)}
                  className={`w-full px-3 py-2 ${colors.panelBg} ${colors.border} border rounded-xl ${colors.text} focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 text-sm`}
                  disabled={!selectedChapter}
                >
                  <option value="">Select Scene</option>
                  {selectedChapter &&
                    projectData.chapters
                      ?.find((c: Chapter) => c._id === selectedChapter)
                      ?.scenes?.map((scene: Scene, index: number) => (
                        <option key={scene._id} value={scene._id}>
                          Scene {index + 1}: {scene.title} (
                          {scene.panels?.length || 0} panels)
                        </option>
                      ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          className={`flex-1 overflow-y-auto ${
            mode === "preview" ? "webtoon-container" : ""
          }`}
        >
          <div
            className={`mx-auto py-4 ${
              mode === "preview"
                ? "max-w-3xl px-0"
                : "max-w-4xl px-2 sm:px-3 md:px-6"
            } sm:py-8`}
          >
            {selectedChapter && selectedScene ? (
              <div
                className={
                  mode === "preview" ? "space-y-0" : "space-y-4 sm:space-y-6"
                }
              >
                {managedPanels.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className={`text-xl font-semibold ${colors.text} mb-2`}>
                      No panels in this scene yet
                    </h3>
                    <p className={`${colors.textMuted} mb-6`}>
                      Start creating your first panel to bring your story to
                      life!
                    </p>
                    {mode === "edit" && (
                      <button
                        onClick={() => handleAddPanel(1)}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        Create First Panel
                      </button>
                    )}
                  </div>
                ) : (
                  managedPanels.map((panel, index) => (
                    <PanelCard
                      key={`panel-${panel._id || index}`}
                      panel={panel}
                      index={index}
                      mode={mode}
                      colors={colors}
                      projectData={projectData}
                      onEdit={handleEditPanel}
                      onCanvasUpdate={handleCanvasUpdate}
                      onDelete={handleDeletePanel}
                      onAddAfter={handleAddPanel}
                      onDialogueConfigChange={updateManagedDialogueConfig}
                    />
                  ))
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <ChevronDown className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className={`text-xl font-semibold ${colors.text} mb-2`}>
                  {!selectedChapter ? "Select a Chapter" : "Select a Scene"}
                </h3>
                <p className={`${colors.textMuted}`}>
                  {!selectedChapter
                    ? "Choose a chapter from the dropdown above to start working on panels."
                    : "Choose a scene from the dropdown above to start working on panels for that specific scene."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Panel Form Modal */}
        <PanelForm
          isOpen={showPanelForm}
          onClose={handleCloseForm}
          onSave={handleSavePanel}
          editingPanel={editingPanel}
          insertAfterIndex={insertAfterOrder}
          projectData={projectData}
          colors={colors}
          isSaving={isSaving}
          selectedSceneId={selectedScene}
        />
      </div>
    );
  }
);

ManualPanelGeneration.displayName = "ManualPanelGeneration";

export default ManualPanelGeneration;
