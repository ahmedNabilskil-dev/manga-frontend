import { Panel } from "@/types/entities";
import React, { useEffect, useRef, useState } from "react";

// Pure viewing component for webtoon display
interface PanelViewerProps {
  panel: Panel;
  className?: string;
  containerHeight?: string;
  showDialogs?: boolean; // New prop to control dialog visibility
}

// Main panel viewer component
export const PanelViewer: React.FC<PanelViewerProps> = ({
  panel,
  className = "",
  containerHeight,
  showDialogs = true,
}) => {
  const [imageSize, setImageSize] = useState({
    width: 800,
    height: 600,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Check for webtoon mode
  const isWebtoonMode = className.includes("webtoon");

  // Prioritize rendered image (with dialogs) over plain panel image
  const imageUrl = showDialogs
    ? panel.renderedImgUrl || panel.imgUrl
    : panel.imgUrl;

  // Update image size when image loads or container resizes
  useEffect(() => {
    const updateImageSize = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const currentContainerWidth = container.getBoundingClientRect().width;

      // Mobile optimization - ensure minimum readable size
      const isMobile = currentContainerWidth <= 768;
      const minMobileHeight = isMobile ? 250 : 300;

      if (imageUrl) {
        // Load actual image to get dimensions
        const img = new Image();
        img.onload = () => {
          const naturalWidth = img.naturalWidth;
          const naturalHeight = img.naturalHeight;
          const aspectRatio = naturalWidth / naturalHeight;

          let displayWidth, displayHeight;

          if (isWebtoonMode) {
            // Webtoon: use full container width, calculate height
            displayWidth = currentContainerWidth;
            displayHeight = displayWidth / aspectRatio;

            // Mobile webtoon: ensure minimum height for readability
            if (isMobile && displayHeight < minMobileHeight) {
              displayHeight = minMobileHeight;
              displayWidth = displayHeight * aspectRatio;
              // If width exceeds container, scale down proportionally
              if (displayWidth > currentContainerWidth) {
                displayWidth = currentContainerWidth;
                displayHeight = displayWidth / aspectRatio;
              }
            }
          } else {
            // Normal: use container width and calculate height based on aspect ratio
            displayWidth = currentContainerWidth;
            displayHeight = displayWidth / aspectRatio;

            // Ensure minimum height for readability (mobile-aware)
            if (displayHeight < minMobileHeight) {
              displayHeight = minMobileHeight;
              // Recalculate width to maintain aspect ratio if height was constrained
              displayWidth = displayHeight * aspectRatio;
              // If width exceeds container, use container width and recalculate height
              if (displayWidth > currentContainerWidth) {
                displayWidth = currentContainerWidth;
                displayHeight = displayWidth / aspectRatio;
              }
            }
          }

          setImageSize({
            width: displayWidth,
            height: displayHeight,
          });
        };
        img.onerror = () => {
          // If image fails to load, use fallback dimensions
          const fallbackHeight = isWebtoonMode
            ? Math.max(currentContainerWidth * 0.75, minMobileHeight)
            : Math.max(currentContainerWidth * 0.6, minMobileHeight);

          setImageSize({
            width: currentContainerWidth,
            height: fallbackHeight,
          });
        };
        img.src = imageUrl;
      } else {
        // No image URL - use fallback dimensions and show placeholder
        const fallbackHeight = isWebtoonMode
          ? Math.max(currentContainerWidth * 0.75, minMobileHeight)
          : Math.max(currentContainerWidth * 0.6, minMobileHeight);

        setImageSize({
          width: currentContainerWidth,
          height: fallbackHeight,
        });
      }
    };

    updateImageSize();

    // Observe container size changes
    const resizeObserver = new ResizeObserver(updateImageSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Listen for window resize (orientation changes on mobile)
    const handleWindowResize = () => {
      setTimeout(updateImageSize, 100); // Debounce for better performance
    };

    window.addEventListener("resize", handleWindowResize);
    window.addEventListener("orientationchange", handleWindowResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleWindowResize);
      window.removeEventListener("orientationchange", handleWindowResize);
    };
  }, [
    panel.imgUrl,
    panel.renderedImgUrl,
    containerHeight,
    isWebtoonMode,
    imageUrl,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className} ${
        isWebtoonMode ? "webtoon-panel-container" : ""
      }`}
      style={{
        height: containerHeight || `${imageSize.height}px`,
        minHeight: isWebtoonMode ? "250px" : "250px", // Reduced for mobile
        marginBottom: isWebtoonMode ? "0px" : undefined,
      }}
    >
      {/* Panel Image */}
      <div
        className={`w-full h-full relative ${
          isWebtoonMode ? "webtoon-panel-image" : ""
        }`}
        style={{
          backgroundColor: isWebtoonMode ? "#000000" : "#f5f5f5",
          borderBottom: isWebtoonMode ? "1px solid #333" : undefined,
        }}
      >
        {imageUrl ? (
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
              backgroundRepeat: "no-repeat",
            }}
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url(/images/hero-bg.png)`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
              backgroundRepeat: "no-repeat",
              width: "100%",
              height: "100%",
            }}
          />
        )}
      </div>
    </div>
  );
};

// Webtoon layout component for displaying multiple panels
interface WebtoonLayoutProps {
  panels: Panel[];
}

export const WebtoonLayout: React.FC<WebtoonLayoutProps> = ({ panels }) => {
  return (
    <div className="webtoon-container bg-black min-h-screen">
      {panels.map((panel, index) => (
        <PanelViewer
          key={panel._id || `panel-${index}`}
          panel={panel}
          className="webtoon-panel"
        />
      ))}
    </div>
  );
};

// CSS styles for webtoon mode
const webtoonStyles = `
  .webtoon-container {
    overflow-y: auto;
    overflow-x: hidden;
  }
  
  .webtoon-panel-container {
    border-radius: 0 !important;
    box-shadow: none !important;
    margin-bottom: 0 !important;
    width: 100% !important;
  }
  
  .webtoon-panel-image {
    border-radius: 0 !important;
    width: 100% !important;
  }
  
  .webtoon-panel {
    width: 100% !important;
  }
  
  /* Mobile optimizations */
  @media (max-width: 768px) {
    .webtoon-container {
      padding: 0;
    }
    
    .webtoon-panel-container {
      margin: 0 !important;
      padding: 0 !important;
    }
    
    .webtoon-panel-image {
      border-radius: 0 !important;
    }
  }
  
  /* Very small screens */
  @media (max-width: 480px) {
    .webtoon-container {
      font-size: 14px;
    }
  }
  
  .webtoon-container::-webkit-scrollbar {
    width: 8px;
  }
  
  .webtoon-container::-webkit-scrollbar-track {
    background: #000;
  }
  
  .webtoon-container::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 4px;
  }
  
  .webtoon-container::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
  
  /* Mobile scrollbar - thinner */
  @media (max-width: 768px) {
    .webtoon-container::-webkit-scrollbar {
      width: 4px;
    }
  }
`;

// Inject webtoon styles
if (typeof document !== "undefined") {
  const styleId = "webtoon-styles";
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement("style");
    styleElement.id = styleId;
    styleElement.textContent = webtoonStyles;
    document.head.appendChild(styleElement);
  }
}

export default PanelViewer;
