"use client";
import {
  getMangaProjectForPanelPreview,
  type ChapterPreview,
  type MangaPanelPreview,
} from "@/services/data-service";
import { ChevronUp } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Header from "./compoents/header";

interface SimplePanel {
  _id: string;
  imgUrl: string | null;
  renderedImgUrl: string | null;
}

interface SimpleChapter {
  _id: string;
  title: string;
  chapterNumber: number;
  narrative: string;
  synopsis: string;
  mangaProjectId: string;
}

interface MangaWebtoonProps {
  chapters: ChapterPreview[];
  projectId: string;
  projectName?: string;
  initialChapterIndex?: number;
}

const MangaComponent: React.FC<MangaWebtoonProps> = ({
  chapters,
  projectId,
  projectName,
  initialChapterIndex = 0,
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [currentChapterIndex, setCurrentChapterIndex] =
    useState(initialChapterIndex);
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
  const [panels, setPanels] = useState<SimplePanel[]>([]);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Convert ChapterPreview to simple format for compatibility
  const convertedChapters: SimpleChapter[] = chapters.map((chapter, index) => ({
    _id: `chapter-${index}`,
    title: chapter.chapterTitle,
    chapterNumber: index + 1,
    narrative: "",
    synopsis: "",
    mangaProjectId: projectId,
  }));

  // Update panels when chapter changes
  useEffect(() => {
    const currentChapter = chapters[currentChapterIndex];
    if (currentChapter) {
      const convertedPanels: SimplePanel[] = currentChapter.panels.map(
        (panel, index) => ({
          _id: `panel-${currentChapterIndex}-${index}`,
          imgUrl: panel.imgUrl ?? null,
          renderedImgUrl: panel.renderedImgUrl ?? null,
        })
      );
      setPanels(convertedPanels);
      setCurrentPanelIndex(0); // Reset panel index when chapter changes
      scrollToTop(); // Scroll to top when chapter changes
    }
  }, [currentChapterIndex, chapters]);

  // Handle chapter change
  const handleChapterChange = (index: number) => {
    if (index >= 0 && index < chapters.length) {
      setCurrentChapterIndex(index);
    }
  };

  // Handle scroll to show/hide header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show header at the top of the page
      if (currentScrollY < 100) {
        setHeaderVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // Hide header when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY + 50) {
        setHeaderVisible(false);
      } else if (lastScrollY > currentScrollY + 10) {
        setHeaderVisible(true);
      }

      setLastScrollY(currentScrollY);
      setShowScrollTop(currentScrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Hide header in fullscreen mode
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;
      setFullscreen(isFullscreen);
      setHeaderVisible(!isFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Track scroll position and current panel
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const panelElements = Array.from(
          document.querySelectorAll("[data-panel]")
        );

        panelElements.forEach((panel, index) => {
          const rect = panel.getBoundingClientRect();
          if (
            rect.top <= window.innerHeight * 0.3 &&
            rect.bottom >= window.innerHeight * 0.3
          ) {
            setCurrentPanelIndex(index);
          }
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [panels]);

  // Navigation functions
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToPanel = useCallback((index: number) => {
    const panelElements = document.querySelectorAll("[data-panel]");
    if (panelElements[index]) {
      panelElements[index].scrollIntoView({ behavior: "smooth" });
      setCurrentPanelIndex(index);
    }
  }, []);

  const toggleFullscreen = () => {
    if (!fullscreen) {
      document.documentElement.requestFullscreen().catch((e) => console.log(e));
    } else {
      document.exitFullscreen();
    }
    setFullscreen(!fullscreen);
  };

  // Show header temporarily when a control is used
  const showHeaderTemporarily = () => {
    setHeaderVisible(true);
    setTimeout(() => {
      if (window.scrollY > 100 && !document.fullscreenElement) {
        setHeaderVisible(false);
      }
    }, 3000);
  };

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode ? "bg-gray-900" : "bg-gradient-to-b from-gray-100 to-gray-200"
      }`}
      ref={containerRef}
    >
      {!fullscreen && (
        <Header
          chapters={convertedChapters}
          currentChapterIndex={currentChapterIndex}
          currentPanelIndex={currentPanelIndex}
          darkMode={darkMode}
          fullscreen={fullscreen}
          onChapterChange={handleChapterChange}
          onScrollToPanel={scrollToPanel}
          onToggleDarkMode={() => {
            setDarkMode(!darkMode);
            showHeaderTemporarily();
          }}
          onToggleFullscreen={() => {
            toggleFullscreen();
            showHeaderTemporarily();
          }}
          visible={headerVisible}
          projectName={projectName}
        />
      )}

      {/* Main content */}
      <div
        className={`mx-auto transition-all duration-500 pb-24 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white"
        } max-w-2xl shadow-2xl`}
      >
        {/* Vertical Layout with panel images */}
        <div className="space-y-0">
          {panels.map((panel, index) => (
            <div key={panel._id} data-panel className="m-0 p-0">
              {/* Display the rendered image if available, otherwise fall back to imgUrl */}
              {panel.renderedImgUrl || panel.imgUrl ? (
                <img
                  src={panel.renderedImgUrl || panel.imgUrl || ""}
                  alt={`Panel ${index + 1}`}
                  className="w-full h-auto block"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Panel {index + 1} - Image not available
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Buttons */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className={`fixed bottom-24 right-6 p-3 rounded-full shadow-lg z-40 transition-all transform hover:scale-110 ${
            darkMode
              ? "bg-gray-700 text-white hover:bg-gray-600"
              : "bg-white text-gray-800 hover:bg-gray-100"
          }`}
          title="Scroll to Top"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  );
};

const MangaReader = () => {
  const [previewData, setPreviewData] = useState<MangaPanelPreview | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchPanelPreview = async () => {
      try {
        setLoading(true);
        const data = await getMangaProjectForPanelPreview(id as string);
        setPreviewData(data);
      } catch (err) {
        console.error("Failed to fetch panel preview:", err);
        setError("Failed to load manga data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPanelPreview();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading manga...</div>
      </div>
    );
  }

  if (error || !previewData || previewData.chapters.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">{error || "No chapters found"}</div>
      </div>
    );
  }

  return (
    <MangaComponent
      chapters={previewData.chapters}
      projectId={id as string}
      projectName={previewData.projectName}
    />
  );
};

export default MangaReader;
