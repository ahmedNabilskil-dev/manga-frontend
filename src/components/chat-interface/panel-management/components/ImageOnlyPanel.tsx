"use client";
import React, { useEffect, useRef, useState } from "react";

// CSS-in-JS styles for webtoon mode
const webtoonStyles = `
  .webtoon-panel-container {
    border-radius: 0 !important;
    box-shadow: none !important;
  }
  .webtoon-panel-image {
    border-radius: 0 !important;
  }
  .webtoon-panel-container + .webtoon-panel-container {
    margin-top: 0px !important;
  }
  .webtoon-container::-webkit-scrollbar {
    width: 4px;
  }
  .webtoon-container::-webkit-scrollbar-track {
    background: #000;
  }
  .webtoon-container::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 2px;
  }
`;

interface Panel {
  _id?: string;
  order: number;
  imgUrl?: string;
  description: string;
  characterOutfitIds?: string[];
  locationId?: string;
  sceneId: string;
  dialogs?: any[];
  characters?: any[];
}

interface ImageOnlyPanelProps {
  panel: Panel;
  className?: string;
  containerHeight?: string;
}

const ImageOnlyPanel: React.FC<ImageOnlyPanelProps> = ({
  panel,
  className,
  containerHeight,
}) => {
  const [imageSize, setImageSize] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Base reference size for scaling (original image dimensions)
  const BASE_WIDTH = 800;
  const BASE_HEIGHT = 600;

  // Check if this is webtoon mode based on className
  const isWebtoonMode = className?.includes("webtoon-panel");

  // Inject webtoon styles when in webtoon mode
  useEffect(() => {
    if (isWebtoonMode) {
      const styleId = "webtoon-styles";
      let styleElement = document.getElementById(styleId);
      if (!styleElement) {
        styleElement = document.createElement("style");
        styleElement.id = styleId;
        styleElement.textContent = webtoonStyles;
        document.head.appendChild(styleElement);
      }
    }
  }, [isWebtoonMode]);

  // Update image size when image loads or container resizes
  useEffect(() => {
    const updateImageSize = () => {
      if (containerRef.current && panel.imgUrl) {
        const container = containerRef.current;
        const containerWidth = container.getBoundingClientRect().width;
        const tempImage = new window.Image();
        tempImage.onload = () => {
          const naturalWidth = tempImage.naturalWidth;
          const naturalHeight = tempImage.naturalHeight;
          const imageAspect = naturalWidth / naturalHeight;
          let displayWidth, displayHeight;
          if (isWebtoonMode) {
            displayWidth = containerWidth;
            displayHeight = displayWidth / imageAspect;
          } else {
            displayWidth = containerWidth;
            displayHeight = displayWidth / imageAspect;
          }
          setImageSize({ width: displayWidth, height: displayHeight });
        };
        tempImage.src = panel.imgUrl;
      } else {
        const containerWidth =
          containerRef.current?.getBoundingClientRect().width || BASE_WIDTH;
        setImageSize({
          width: containerWidth,
          height: isWebtoonMode
            ? containerWidth * 0.75
            : containerHeight === "fixed"
            ? 300
            : BASE_HEIGHT,
        });
      }
    };
    updateImageSize();
    const resizeObserver = new window.ResizeObserver(updateImageSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [panel.imgUrl, containerHeight, isWebtoonMode]);

  return (
    <div
      key={panel._id}
      ref={containerRef}
      className={`relative w-full overflow-visible group ${className || ""} ${
        isWebtoonMode ? "webtoon-panel-container" : ""
      }`}
      data-panel
      style={{
        height: containerHeight || `${imageSize.height}px`,
        minHeight: containerHeight
          ? undefined
          : isWebtoonMode
          ? "300px"
          : "200px",
        marginBottom: isWebtoonMode ? "0px" : undefined,
      }}
    >
      <div
        className={`w-full bg-cover bg-no-repeat relative flex items-center justify-center ${
          isWebtoonMode ? "webtoon-panel-image" : ""
        }`}
        style={{
          backgroundImage: panel.imgUrl ? `url(${panel.imgUrl})` : "none",
          height: `${imageSize.height}px`,
          width: "100%",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundColor: isWebtoonMode ? "#000000" : "#f5f5f5",
          borderBottom: isWebtoonMode ? "1px solid #333" : undefined,
        }}
      />
    </div>
  );
};

export default ImageOnlyPanel;
