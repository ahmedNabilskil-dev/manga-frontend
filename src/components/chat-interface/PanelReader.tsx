import { MangaProject } from "@/types/entities";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import ImageOnlyPanel from "./panel-management/components/ImageOnlyPanel";

interface PanelReaderProps {
  projectData: MangaProject | null;
}

export const PanelReader: React.FC<PanelReaderProps> = ({ projectData }) => {
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [previewImageSrc, setPreviewImageSrc] = useState<string | undefined>(
    undefined
  );

  React.useEffect(() => {
    setIsLoading(true);
    if (projectData?.chapters?.length && !selectedChapterId) {
      setSelectedChapterId(projectData.chapters[0]._id || "");
      setIsLoading(false);
    }
  }, [projectData]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-sm text-gray-400">Loading panels...</p>
        </div>
      </div>
    );
  }
  if (!projectData) {
    return (
      <div className="p-4 text-center text-red-400">
        Failed to load project data.
      </div>
    );
  }

  const chapters = projectData.chapters || [];
  const selectedChapter = chapters.find((ch) => ch._id === selectedChapterId);

  // Image preview dialog component using React portal
  const ImagePreviewDialog = ({
    src,
    onClose,
  }: {
    src: string | undefined;
    onClose: () => void;
  }) => {
    if (!src) return null;
    return ReactDOM.createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="relative">
          <img
            src={src}
            alt="Preview"
            className="max-w-full max-h-[80vh] rounded-xl shadow-2xl border-4 border-white dark:border-gray-800"
          />
          <button
            onClick={onClose}
            className="absolute top-2 right-2 bg-white/80 dark:bg-gray-900/80 rounded-full p-2 shadow hover:bg-white dark:hover:bg-gray-800"
            title="Close Preview"
          >
            <span className="text-lg font-bold">×</span>
          </button>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <label
          className="block text-blue-400 font-semibold mb-2 text-lg"
          htmlFor="chapter-select"
        >
          Select Chapter
        </label>
        <select
          id="chapter-select"
          value={selectedChapterId}
          onChange={(e) => setSelectedChapterId(e.target.value)}
          className="w-full bg-gray-800 text-white border-2 border-blue-400 focus:border-blue-500 rounded-lg px-4 py-3 transition-all duration-200 shadow focus:shadow-blue-400/20 outline-none"
          style={{ minHeight: "48px" }}
        >
          <option value="" disabled>
            Choose a chapter...
          </option>
          {chapters.map((chapter) => (
            <option key={chapter._id} value={chapter._id}>
              {chapter.title || `Chapter ${chapter.chapterNumber}`}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 overflow-y-auto space-y-0 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-900 rounded-lg p-0 bg-gray-900/60">
        {selectedChapter ? (
          selectedChapter.scenes?.length ? (
            selectedChapter.scenes.map((scene) => (
              <div key={scene._id} className="m-0 p-0 bg-transparent">
                <div className="font-semibold text-blue-300 mb-3 text-xl">
                  {scene.title || `Scene ${scene.order}`}
                </div>
                <div className="flex flex-wrap gap-0">
                  {scene.panels?.length ? (
                    scene.panels.map((panel) => (
                      <div
                        key={panel._id}
                        className="w-full max-w-md m-0 p-0 bg-transparent"
                      >
                        {/* Wrap ImageOnlyPanel with clickable preview logic */}
                        <div
                          onClick={() => setPreviewImageSrc(panel.imgUrl)}
                          style={{ cursor: "pointer" }}
                        >
                          <ImageOnlyPanel panel={panel} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-400 italic">
                      No panels in this scene
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-400 italic p-4 rounded-lg bg-gray-800/60">
              No scenes in this chapter
            </div>
          )
        ) : (
          <div className="text-sm text-gray-400 italic p-4 rounded-lg bg-gray-800/60">
            Select a chapter to view panels
          </div>
        )}
      </div>
      {/* Image preview dialog */}
      <ImagePreviewDialog
        src={previewImageSrc}
        onClose={() => setPreviewImageSrc(undefined)}
      />
    </div>
  );
};
