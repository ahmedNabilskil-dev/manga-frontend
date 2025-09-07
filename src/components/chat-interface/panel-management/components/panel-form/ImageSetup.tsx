import { Character } from "@/types/entities";
import { Image } from "lucide-react";
import { memo, useMemo } from "react";
import { ImageSetupProps } from "../../types";
import InteractivePanel from "../InteractivePanel";
import PanelImageEditChat from "./PanelImageEditChat";

const ImageSetup = memo<ImageSetupProps>(
  ({ panel, entityId, colors, onUpdateDialogConfig, onGenerateImage }) => {
    // Create preview panel for InteractivePanel
    const previewPanel = useMemo(
      () => ({
        ...panel,
        _id: panel.sceneId || "preview",
        characters: [] as Character[], // Will be populated based on characterOutfitIds if needed
      }),
      [panel]
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Image className="w-4 h-4 text-white" />
          </div>
          <h3 className={`text-lg sm:text-xl font-bold ${colors.text}`}>
            Image Setup
          </h3>
        </div>

        {!panel.imgUrl || panel.imgUrl.trim() === "" ? (
          <div className="text-center py-8 sm:py-12 bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-700">
            <Image className="w-8 h-8 sm:w-12 sm:h-12 text-gray-500 mx-auto mb-4" />
            <p className={`${colors.textMuted} text-sm`}>
              Image will be generated here
            </p>
            <button
              onClick={onGenerateImage}
              className="mt-4 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-colors text-sm"
            >
              Generate Image
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
              {/* Chat-based image editing UI */}
              <div className="flex-1 min-w-0 bg-gray-900/60 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-700 flex flex-col h-64 sm:h-80 lg:max-h-[400px] overflow-hidden">
                <PanelImageEditChat
                  key={`panel-chat-${entityId}`}
                  entityType="panel"
                  entityId={entityId}
                />
              </div>

              {/* Interactive panel preview */}
              <div className="flex-1 min-w-0">
                <div className="bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-700 overflow-hidden">
                  <div className="p-2 sm:p-3 bg-gray-900 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium text-sm sm:text-base">
                        Live Preview
                      </h4>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                        <span className="hidden sm:inline">
                          Drag bubbles to position
                        </span>
                        <span className="sm:hidden">Drag to move</span>
                      </span>
                    </div>
                  </div>
                  <div
                    className="relative w-full rounded-xl overflow-hidden bg-gray-800"
                    style={{ minHeight: "200px" }}
                  >
                    <InteractivePanel
                      key={`preview-${entityId}`}
                      panel={previewPanel}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

ImageSetup.displayName = "ImageSetup";

export default ImageSetup;
