import { Character } from "@/types/entities";
import { Image } from "lucide-react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { ImageSetupProps } from "../../types";
import InteractivePanel from "../InteractivePanel";
import PanelImageEditChat from "./PanelImageEditChat";

const ImageSetup = memo<ImageSetupProps>(
  ({
    panel,
    entityId,
    colors,
    onUpdateDialogConfig,
    onGenerateImage,
    projectData,
    onSendChatMessage,
  }) => {
    const [imageHeight, setImageHeight] = useState<number>(320); // Default height
    const imageContainerRef = useRef<HTMLDivElement>(null);

    // Create preview panel for InteractivePanel
    const previewPanel = useMemo(
      () => ({
        ...panel,
        _id: panel.sceneId || "preview",
        characters: [] as Character[], // Will be populated based on characterOutfitIds if needed
      }),
      [panel]
    );

    // Calculate image height based on the actual image dimensions
    useEffect(() => {
      if (!panel.imgUrl || panel.imgUrl.trim() === "") {
        setImageHeight(320); // Default height when no image
        return;
      }

      const img = document.createElement("img");
      img.onload = () => {
        if (imageContainerRef.current) {
          const containerWidth =
            imageContainerRef.current.getBoundingClientRect().width;
          const aspectRatio = img.naturalWidth / img.naturalHeight;
          const calculatedHeight = containerWidth / aspectRatio;

          // Set minimum and maximum heights for better UX
          const minHeight = 250;
          const maxHeight = 600;
          const finalHeight = Math.min(
            Math.max(calculatedHeight, minHeight),
            maxHeight
          );

          setImageHeight(finalHeight);
        }
      };
      img.onerror = () => {
        setImageHeight(320); // Fallback height
      };
      img.src = panel.imgUrl;
    }, [panel.imgUrl]);

    // Handle container resize
    useEffect(() => {
      const handleResize = () => {
        if (
          panel.imgUrl &&
          panel.imgUrl.trim() !== "" &&
          imageContainerRef.current
        ) {
          const img = document.createElement("img");
          img.onload = () => {
            const containerWidth =
              imageContainerRef.current!.getBoundingClientRect().width;
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            const calculatedHeight = containerWidth / aspectRatio;

            const minHeight = 250;
            const maxHeight = 600;
            const finalHeight = Math.min(
              Math.max(calculatedHeight, minHeight),
              maxHeight
            );

            setImageHeight(finalHeight);
          };
          img.src = panel.imgUrl;
        }
      };

      const resizeObserver = new ResizeObserver(handleResize);
      if (imageContainerRef.current) {
        resizeObserver.observe(imageContainerRef.current);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }, [panel.imgUrl]);

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
            <p className={`${colors.textMuted} text-sm mb-3`}>
              No image generated yet
            </p>
            <p className={`${colors.textMuted} text-xs mb-4`}>
              Click below to send a generation request to the main chat
            </p>
            <button
              onClick={onGenerateImage}
              disabled={!onSendChatMessage}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg transition-colors text-sm disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              <Image className="w-4 h-4" />
              Send to Main Chat for Generation
            </button>
            {!onSendChatMessage && (
              <p className={`${colors.textMuted} text-xs mt-2 text-red-400`}>
                Chat integration not available
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
              {/* Chat-based image editing UI */}
              <div
                className="flex-1 min-w-0 bg-gray-900/60 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-700 flex flex-col overflow-hidden"
                style={{ height: `${imageHeight}px` }}
              >
                <PanelImageEditChat
                  key={`panel-chat-${entityId}`}
                  entityType="panel"
                  entityId={entityId}
                />
              </div>

              {/* Interactive panel preview */}
              <div className="flex-1 min-w-0" ref={imageContainerRef}>
                <div className="bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-700 overflow-hidden">
                  <div className="p-2 sm:p-3 bg-gray-900 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium text-sm sm:text-base">
                        Live Preview
                      </h4>
                    </div>
                  </div>
                  <div
                    className="relative w-full rounded-xl overflow-hidden bg-gray-800"
                    style={{ height: `${imageHeight - 60}px` }} // Subtract header height
                  >
                    <InteractivePanel
                      key={`preview-${entityId}`}
                      panel={previewPanel}
                      containerHeight={`${imageHeight - 60}px`}
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
