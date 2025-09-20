"use client";
import { BackToProjectsButton } from "@/components/ui/back-to-projects-button";
import { Chapter } from "@/types/entities";
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Menu,
  Minimize,
  Moon,
  Navigation,
  Settings,
  Sun,
  X,
} from "lucide-react";
import React, { useState } from "react";

interface HeaderProps {
  chapters: Chapter[];
  currentChapterIndex: number;
  currentPanelIndex: number;
  darkMode: boolean;
  fullscreen: boolean;
  onChapterChange: (index: number) => void;
  onScrollToPanel: (index: number) => void;
  onToggleDarkMode: () => void;
  onToggleFullscreen: () => void;
  visible: boolean;
  projectName?: string;
}

const Header: React.FC<HeaderProps> = ({
  chapters,
  currentChapterIndex,
  currentPanelIndex,
  darkMode,
  fullscreen,
  onChapterChange,
  onScrollToPanel,
  onToggleDarkMode,
  onToggleFullscreen,
  visible,
  projectName,
}) => {
  const currentChapter = chapters[currentChapterIndex];
  const panelCount =
    currentChapter?.scenes?.flatMap((s) => s.panels).length || 0;

  const [isChapterDropdownOpen, setIsChapterDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modern color scheme
  const headerBg = darkMode
    ? "bg-gray-900/95 border-gray-800"
    : "bg-white/95 border-gray-200";

  const cardBg = darkMode
    ? "bg-gray-800/80 hover:bg-gray-700/80 border-gray-700/50"
    : "bg-white/80 hover:bg-gray-50/80 border-gray-300/50";

  const primaryText = darkMode ? "text-white" : "text-gray-900";
  const secondaryText = darkMode ? "text-gray-300" : "text-gray-600";
  const mutedText = darkMode ? "text-gray-400" : "text-gray-500";

  const accentColor = darkMode ? "text-blue-400" : "text-blue-600";
  const accentBg = darkMode
    ? "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20"
    : "bg-blue-50 hover:bg-blue-100 border-blue-200";

  return (
    <>
      {/* Main Header */}
      <div
        className={`sticky top-0 z-50 ${headerBg} backdrop-blur-xl border-b shadow-sm transition-transform duration-300 ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Desktop Header */}
        <div className="hidden md:block">
          <div className="max-w-7xl mx-auto px-6 py-4">
            {/* Top Row - Main Navigation */}
            <div className="flex items-center justify-between mb-4">
              {/* Back Button + Logo & Title */}
              <div className="flex items-center gap-3">
                <BackToProjectsButton
                  variant="manga-icon"
                  size="md"
                  title="Back to Projects"
                />
                <div className={`p-2 rounded-xl ${accentBg}`}>
                  <BookOpen className={accentColor} size={20} />
                </div>
                <div>
                  <h1 className={`text-xl font-bold ${primaryText}`}>
                    {currentChapter?.title || "Manga Reader"}
                  </h1>
                  <p className={`text-sm ${mutedText}`}>
                    Chapter {currentChapter?.chapterNumber}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <button
                    onClick={onToggleDarkMode}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      darkMode
                        ? "bg-gray-700 text-yellow-400"
                        : "text-gray-600 hover:bg-white"
                    }`}
                    title={darkMode ? "Light Mode" : "Dark Mode"}
                  >
                    {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                  </button>

                  <button
                    onClick={onToggleFullscreen}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      fullscreen
                        ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                        : "text-gray-600 hover:bg-white dark:text-gray-400 dark:hover:bg-gray-700"
                    }`}
                    title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    {fullscreen ? (
                      <Minimize size={16} />
                    ) : (
                      <Maximize size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Row - Navigation & Progress */}
            <div className="flex items-center justify-between">
              {/* Navigation Controls */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onScrollToPanel(0)}
                    className={`p-2 rounded-lg ${cardBg} border backdrop-blur-sm transition-all duration-200 hover:scale-105`}
                    title="First Panel"
                  >
                    <ChevronLeft className={secondaryText} size={16} />
                  </button>
                  <button
                    onClick={() => onScrollToPanel(panelCount - 1)}
                    className={`p-2 rounded-lg ${cardBg} border backdrop-blur-sm transition-all duration-200 hover:scale-105`}
                    title="Last Panel"
                  >
                    <ChevronRight className={secondaryText} size={16} />
                  </button>
                </div>

                {/* Chapter Selector */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setIsChapterDropdownOpen(!isChapterDropdownOpen)
                    }
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg ${cardBg} border backdrop-blur-sm transition-all duration-200 hover:scale-105`}
                  >
                    <div className="text-left">
                      <div className={`text-sm font-medium ${primaryText}`}>
                        Chapter {currentChapter?.chapterNumber}
                      </div>
                      <div className={`text-xs ${mutedText} truncate max-w-32`}>
                        {currentChapter?.title}
                      </div>
                    </div>
                    <ChevronDown
                      size={14}
                      className={`${mutedText} transition-transform duration-200 ${
                        isChapterDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isChapterDropdownOpen && (
                    <div
                      className={`absolute left-0 mt-2 w-72 ${cardBg} border backdrop-blur-xl rounded-xl shadow-xl z-50 overflow-hidden`}
                    >
                      <div className="p-2 max-h-64 overflow-y-auto">
                        {chapters.map((chapter, index) => (
                          <button
                            key={chapter._id}
                            onClick={() => {
                              onChapterChange(index);
                              setIsChapterDropdownOpen(false);
                            }}
                            className={`w-full text-left p-3 rounded-lg transition-all duration-150 ${
                              index === currentChapterIndex
                                ? `${accentBg} ${accentColor}`
                                : `hover:bg-gray-100 dark:hover:bg-gray-700 ${primaryText}`
                            }`}
                          >
                            <div className="font-medium">
                              Chapter {chapter.chapterNumber}
                            </div>
                            <div className={`text-sm ${mutedText} truncate`}>
                              {chapter.title}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Section */}
              <div className="flex items-center gap-6">
                <div className={`text-sm ${secondaryText} font-medium`}>
                  Panel {currentPanelIndex + 1} of {panelCount}
                </div>

                {panelCount > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 rounded-full"
                        style={{
                          width: `${
                            ((currentPanelIndex + 1) / panelCount) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <span
                      className={`text-sm font-medium ${accentColor} min-w-[3rem]`}
                    >
                      {Math.round(((currentPanelIndex + 1) / panelCount) * 100)}
                      %
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden px-4 py-3">
          {/* Project Name Row */}
          {projectName && (
            <div className="flex justify-center items-center mb-4">
              <div className="relative">
                {/* Simple glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-md rounded-lg"></div>
                {/* Main container */}
                <div
                  className={`relative ${cardBg} backdrop-blur-md px-4 py-2 rounded-lg border shadow-md`}
                >
                  {/* Project name text */}
                  <span
                    className={`text-base font-bold ${primaryText} bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}
                  >
                    {projectName}
                  </span>
                  {/* Small accent dot */}
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BackToProjectsButton
                variant="icon"
                size="sm"
                title="Back to Projects"
              />
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`${cardBg} border p-2 rounded-lg transition-all duration-200 hover:scale-105`}
              >
                <Menu className={primaryText} size={18} />
              </button>
            </div>

            <div className="flex-1 text-center px-3">
              <h1
                className={`text-lg font-bold ${primaryText} flex items-center justify-center gap-2`}
              >
                <BookOpen className={accentColor} size={16} />
                <span className="">{currentChapter?.title || "Manga"}</span>
              </h1>
              <div
                className={`text-xs ${mutedText} flex items-center justify-center gap-2`}
              >
                <span>Ch.{currentChapter?.chapterNumber}</span>
                <span>•</span>
                <span>
                  {currentPanelIndex + 1}/{panelCount}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile progress bar */}
          {panelCount > 0 && (
            <div className="mt-3">
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{
                    width: `${((currentPanelIndex + 1) / panelCount) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div
            className={`fixed inset-y-0 left-0 w-80 ${headerBg} z-50 md:hidden transform transition-all duration-300 shadow-xl border-r`}
          >
            <div className="p-4 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-lg font-bold ${primaryText} flex items-center gap-2`}
                >
                  <Menu size={18} />
                  Menu
                </h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${cardBg} border p-2 rounded-lg transition-all duration-200 hover:scale-105`}
                >
                  <X className={primaryText} size={16} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Navigation */}
                <div>
                  <h3
                    className={`${secondaryText} font-medium mb-3 flex items-center gap-2 text-sm`}
                  >
                    <Navigation size={16} />
                    Navigation
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        onScrollToPanel(0);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`${cardBg} border p-3 rounded-lg text-center transition-all duration-200 hover:scale-105`}
                    >
                      <ChevronLeft
                        className={`${primaryText} mx-auto mb-1`}
                        size={16}
                      />
                      <div className={`${primaryText} text-xs`}>First</div>
                    </button>
                    <button
                      onClick={() => {
                        onScrollToPanel(panelCount - 1);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`${cardBg} border p-3 rounded-lg text-center transition-all duration-200 hover:scale-105`}
                    >
                      <ChevronRight
                        className={`${primaryText} mx-auto mb-1`}
                        size={16}
                      />
                      <div className={`${primaryText} text-xs`}>Last</div>
                    </button>
                  </div>
                </div>

                {/* Chapter Selection */}
                <div>
                  <h3
                    className={`${secondaryText} font-medium mb-3 flex items-center gap-2 text-sm`}
                  >
                    <BookOpen size={16} />
                    Chapters
                  </h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {chapters.map((chapter, index) => (
                      <button
                        key={chapter._id}
                        onClick={() => {
                          onChapterChange(index);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 text-sm ${
                          index === currentChapterIndex
                            ? `${accentBg} ${accentColor}`
                            : `${cardBg} border ${primaryText} hover:bg-gray-100 dark:hover:bg-gray-700`
                        }`}
                      >
                        <div className="font-medium">
                          Chapter {chapter.chapterNumber}
                        </div>
                        <div className={`text-xs ${mutedText} truncate`}>
                          {chapter.title}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Controls */}
                <div>
                  <h3
                    className={`${secondaryText} font-medium mb-3 flex items-center gap-2 text-sm`}
                  >
                    <Settings size={16} />
                    Controls
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        onToggleDarkMode();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`${cardBg} border p-3 rounded-lg text-center transition-all duration-200 hover:scale-105`}
                    >
                      {darkMode ? (
                        <Sun
                          className="text-yellow-500 mx-auto mb-1"
                          size={18}
                        />
                      ) : (
                        <Moon
                          className="text-indigo-500 mx-auto mb-1"
                          size={18}
                        />
                      )}
                      <div className={`${primaryText} text-xs`}>
                        {darkMode ? "Light" : "Dark"}
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onToggleFullscreen();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`${cardBg} border p-3 rounded-lg text-center transition-all duration-200 hover:scale-105`}
                    >
                      {fullscreen ? (
                        <Minimize
                          className="text-orange-500 mx-auto mb-1"
                          size={18}
                        />
                      ) : (
                        <Maximize
                          className="text-orange-500 mx-auto mb-1"
                          size={18}
                        />
                      )}
                      <div className={`${primaryText} text-xs`}>
                        {fullscreen ? "Exit" : "Full"}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
