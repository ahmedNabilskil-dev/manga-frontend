"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { Chapter, Character, MangaProject, Scene } from "@/types/entities";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
  Folder,
  FolderOpen,
  Layers,
  MapPin,
  MessageSquare,
  Palette,
} from "lucide-react";
import { useState } from "react";
import { DetailableEntity } from "./entity-detail-panel";
import ImageOnlyPanel from "./panel-management/components/ImageOnlyPanel";

// Types
interface SelectedState {
  id: string;
  type: string;
  name?: string;
}

interface EnhancedProjectStructurePanelProps {
  projectData: MangaProject | null;
  onComponentSelect?: (componentId: string, type: string) => void;
  selectedEntity?: SelectedState | null;
  onAssetSelect?: (asset: any) => void;
  onEntityDetailView?: (entity: DetailableEntity, entityType: string) => void;
  expandedItems?: Set<string>;
  onExpandedItemsChange?: (expanded: Set<string>) => void;
  onEntityChat?: (entity: { id: string; type: string; name?: string }) => void;
  // Mobile-specific props
  isOpen?: boolean;
  onClose?: () => void;
}

export function EnhancedProjectStructurePanel(
  props: EnhancedProjectStructurePanelProps
) {
  const {
    projectData,
    selectedEntity,
    onEntityDetailView,
    isOpen = true,
    onClose,
  } = props;

  const isMobile = useIsMobile();

  const isControlled =
    props.expandedItems !== undefined &&
    props.onExpandedItemsChange !== undefined;
  const [internalExpandedItems, setInternalExpandedItems] = useState<
    Set<string>
  >(new Set(["project", "characters", "chapters"]));
  const expandedItems = isControlled
    ? props.expandedItems!
    : internalExpandedItems;
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    null
  );

  const toggleExpanded = (id: string) => {
    if (isControlled) {
      const newSet = new Set(expandedItems);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      props.onExpandedItemsChange!(newSet);
    } else {
      setInternalExpandedItems((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    }
  };

  const handleExpandOrCollapse = (id: string) => {
    toggleExpanded(id);
  };

  const showEntityDetails = (entity: DetailableEntity, entityType: any) =>
    onEntityDetailView?.(entity, entityType);

  if (!projectData) return null;

  // Tree item component
  const TreeItem = ({
    id,
    icon,
    title,
    subtitle,
    badge,
    children,
    level = 0,
    isSelected = false,
    onSelect,
    onToggle,
    isExpanded = false,
    entity,
    entityType,
    hasChildren = false,
  }: {
    id: string;
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    badge?: string | number;
    children?: React.ReactNode;
    level?: number;
    isSelected?: boolean;
    onSelect?: () => void;
    onToggle?: () => void;
    isExpanded?: boolean;
    entity?: any;
    entityType?: string;
    hasChildren?: boolean;
  }) => (
    <div className="tree-item">
      <div
        className={`flex items-center gap-2 ${
          isMobile ? "p-2" : "p-2"
        } rounded-lg transition-all group relative ${
          isSelected
            ? "bg-blue-500/20 border border-blue-400/30 shadow-lg shadow-blue-500/10"
            : "hover:bg-gray-700/50 border border-transparent active:bg-gray-600/50"
        }`}
        style={{
          paddingLeft: `${
            level * (isMobile ? 16 : 16) + (isMobile ? 12 : 12)
          }px`,
        }}
      >
        {hasChildren && (
          <button
            onClick={onToggle}
            className={`flex items-center justify-center ${
              isMobile ? "w-5 h-5" : "w-5 h-5"
            } rounded hover:bg-gray-600/50 transition-colors touch-manipulation`}
          >
            {isExpanded ? (
              <ChevronDown
                className={`${isMobile ? "w-3 h-3" : "w-3 h-3"} text-blue-400`}
              />
            ) : (
              <ChevronRight
                className={`${isMobile ? "w-3 h-3" : "w-3 h-3"} text-blue-400`}
              />
            )}
          </button>
        )}
        {!hasChildren && (
          <div className={isMobile ? "w-5 h-5" : "w-5 h-5"}></div>
        )}

        <div
          className={`flex items-center justify-center ${
            isMobile ? "w-5 h-5" : "w-5 h-5"
          } text-blue-400`}
        >
          {icon}
        </div>

        <div
          className="flex-1 min-w-0 cursor-pointer touch-manipulation"
          onClick={onSelect}
        >
          <div
            className={`font-medium ${
              isMobile ? "text-sm" : "text-sm"
            } text-white truncate group-hover:text-blue-300 transition-colors`}
          >
            {title}
          </div>
          {subtitle && (
            <div
              className={`${
                isMobile ? "text-xs" : "text-xs"
              } text-gray-400 truncate mt-0.5`}
            >
              {subtitle}
            </div>
          )}
        </div>

        {badge !== undefined && (
          <Badge
            variant="outline"
            className={`${
              isMobile ? "text-sm" : "text-xs"
            } bg-gray-700/50 text-gray-300`}
          >
            {badge}
          </Badge>
        )}

        <div
          className={`flex gap-1 ${
            isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          } transition-opacity`}
        >
          {entity && entityType && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showEntityDetails(entity, entityType);
                }}
                className="p-1.5 hover:bg-gray-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 touch-manipulation"
                style={{
                  minWidth: isMobile ? 36 : 40,
                  minHeight: isMobile ? 36 : 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="View Details"
              >
                <Eye
                  className={`${
                    isMobile ? "w-4 h-4" : "w-4 h-4"
                  } text-gray-400 hover:text-blue-400`}
                />
              </button>
              {["panel", "character", "outfit", "location"].includes(
                entityType
              ) &&
                props.onEntityChat &&
                entity &&
                ((entity.imgUrl && entity.imgUrl !== "") ||
                  (entity.coverImageUrl && entity.coverImageUrl !== "")) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      props.onEntityChat!({
                        id: entity._id || entity.id,
                        type: entityType,
                        name: entity.name || entity.title || undefined,
                      });
                    }}
                    className="p-1.5 hover:bg-blue-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 touch-manipulation"
                    style={{
                      minWidth: isMobile ? 36 : 40,
                      minHeight: isMobile ? 36 : 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title={`Open Chat for ${entityType}`}
                  >
                    <MessageSquare
                      className={`${
                        isMobile ? "w-4 h-4" : "w-4 h-4"
                      } text-blue-400 hover:text-blue-200`}
                    />
                  </button>
                )}
            </>
          )}
        </div>
      </div>

      {isExpanded && children && (
        <div className="overflow-hidden">{children}</div>
      )}
    </div>
  );

  // Render tree content helper
  const renderTreeContent = () => (
    <>
      {/* Chapters section */}
      <TreeItem
        id="chapters"
        icon={
          expandedItems.has("chapters") ? (
            <FolderOpen
              className={`${isMobile ? "w-5 h-5" : "w-4 h-4"} text-yellow-400`}
            />
          ) : (
            <Folder
              className={`${isMobile ? "w-5 h-5" : "w-4 h-4"} text-yellow-400`}
            />
          )
        }
        title="Chapters"
        badge={projectData?.chapters?.length || 0}
        level={1}
        isExpanded={expandedItems.has("chapters")}
        onToggle={() => toggleExpanded("chapters")}
        onSelect={() => handleExpandOrCollapse("chapters")}
        hasChildren={true}
      >
        {projectData?.chapters && projectData.chapters.length > 0 ? (
          projectData.chapters.map((chapter: Chapter) => (
            <TreeItem
              key={chapter._id || ""}
              id={`chapter-${chapter._id}`}
              icon={
                <BookOpen
                  className={`${
                    isMobile ? "w-5 h-5" : "w-4 h-4"
                  } text-yellow-300`}
                />
              }
              title={chapter.title}
              subtitle={`Chapter ${chapter.chapterNumber}`}
              badge={chapter.scenes?.length || 0}
              level={2}
              isExpanded={expandedItems.has(`chapter-${chapter._id}`)}
              onToggle={() => toggleExpanded(`chapter-${chapter._id}`)}
              isSelected={
                selectedEntity?.type === "chapter" &&
                selectedEntity?.id === chapter._id
              }
              onSelect={() => handleExpandOrCollapse(`chapter-${chapter._id}`)}
              entity={chapter}
              entityType="chapter"
              hasChildren={(chapter.scenes?.length || 0) > 0}
            >
              {chapter.scenes && chapter.scenes.length > 0 ? (
                chapter.scenes.map((scene: Scene) => (
                  <TreeItem
                    key={scene._id || ""}
                    id={`scene-${scene._id}`}
                    icon={
                      <FileText
                        className={`${
                          isMobile ? "w-4 h-4" : "w-3.5 h-3.5"
                        } text-green-400`}
                      />
                    }
                    title={scene.title}
                    subtitle={`Scene ${scene.order}`}
                    level={3}
                    isSelected={
                      selectedEntity?.type === "scene" &&
                      selectedEntity?.id === scene._id
                    }
                    onSelect={() =>
                      handleExpandOrCollapse(`scene-${scene._id}`)
                    }
                    entity={scene}
                    entityType="scene"
                    hasChildren={
                      Array.isArray(scene.panels) && scene.panels.length > 0
                    }
                    isExpanded={expandedItems.has(`scene-${scene._id}`)}
                    onToggle={() => toggleExpanded(`scene-${scene._id}`)}
                  >
                    {scene.panels && scene.panels.length > 0 ? (
                      scene.panels.map((panel: any) => (
                        <TreeItem
                          key={panel.id || panel._id || ""}
                          id={`panel-${panel.id || panel._id}`}
                          icon={
                            <Eye
                              className={`${
                                isMobile ? "w-4 h-4" : "w-3.5 h-3.5"
                              } text-blue-300`}
                            />
                          }
                          title={panel.title || panel.name || `Panel`}
                          subtitle={panel.description || undefined}
                          level={4}
                          isSelected={
                            selectedEntity?.type === "panel" &&
                            selectedEntity?.id === (panel._id || panel.id)
                          }
                          onSelect={() => showEntityDetails(panel, "panel")}
                          entity={panel}
                          entityType="panel"
                          hasChildren={false}
                        />
                      ))
                    ) : (
                      <div
                        className={`${
                          isMobile ? "text-sm" : "text-xs"
                        } text-gray-500 p-2 italic`}
                        style={{ paddingLeft: isMobile ? "100px" : "96px" }}
                      >
                        No panels yet
                      </div>
                    )}
                  </TreeItem>
                ))
              ) : (
                <div
                  className={`${
                    isMobile ? "text-sm" : "text-xs"
                  } text-gray-500 p-2 italic`}
                  style={{ paddingLeft: isMobile ? "80px" : "80px" }}
                >
                  No scenes yet
                </div>
              )}
            </TreeItem>
          ))
        ) : (
          <div
            className={`${
              isMobile ? "text-sm" : "text-xs"
            } text-gray-500 p-2 italic`}
            style={{ paddingLeft: isMobile ? "60px" : "60px" }}
          >
            No chapters yet
          </div>
        )}
      </TreeItem>

      {/* Characters section */}
      <TreeItem
        id="characters"
        icon={
          expandedItems.has("characters") ? (
            <FolderOpen
              className={`${isMobile ? "w-5 h-5" : "w-4 h-4"} text-blue-400`}
            />
          ) : (
            <Folder
              className={`${isMobile ? "w-5 h-5" : "w-4 h-4"} text-blue-400`}
            />
          )
        }
        title="Characters"
        badge={projectData?.characters?.length || 0}
        level={1}
        isExpanded={expandedItems.has("characters")}
        onToggle={() => toggleExpanded("characters")}
        onSelect={() => handleExpandOrCollapse("characters")}
        hasChildren={true}
      >
        {projectData?.characters && projectData.characters.length > 0 ? (
          projectData.characters.map((character: Character) => (
            <TreeItem
              key={character._id || ""}
              id={`character-${character._id}`}
              icon={
                <Avatar
                  className={`${
                    isMobile ? "h-6 w-6" : "h-5 w-5"
                  } ring-2 ring-blue-500/30`}
                >
                  <AvatarImage src={character.imgUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white text-xs font-semibold">
                    {character.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              }
              title={character.name}
              subtitle={[
                character.role,
                character.age ? `${character.age} yrs` : null,
              ]
                .filter(Boolean)
                .join(" • ")}
              badge={character.outfitTemplates?.length || 0}
              level={2}
              isExpanded={expandedItems.has(`character-${character._id}`)}
              onToggle={() => toggleExpanded(`character-${character._id}`)}
              isSelected={
                selectedEntity?.type === "character" &&
                selectedEntity?.id === character._id
              }
              onSelect={() =>
                handleExpandOrCollapse(`character-${character._id}`)
              }
              entity={character}
              entityType="character"
              hasChildren={(character.outfitTemplates?.length || 0) > 0}
            >
              {character.outfitTemplates &&
              character.outfitTemplates.length > 0 ? (
                character.outfitTemplates.map((outfit) => (
                  <TreeItem
                    key={outfit._id || ""}
                    id={`outfit-${outfit._id}`}
                    icon={
                      <Palette
                        className={`${
                          isMobile ? "w-4 h-4" : "w-3.5 h-3.5"
                        } text-pink-400`}
                      />
                    }
                    title={outfit.name}
                    level={3}
                    isSelected={
                      selectedEntity?.type === "outfit" &&
                      selectedEntity?.id === outfit._id
                    }
                    onSelect={() => showEntityDetails(outfit, "outfit")}
                    entity={outfit}
                    entityType="outfit"
                    hasChildren={false}
                  />
                ))
              ) : (
                <div
                  className={`${
                    isMobile ? "text-sm" : "text-xs"
                  } text-gray-500 p-2 italic`}
                  style={{ paddingLeft: isMobile ? "80px" : "80px" }}
                >
                  No outfits yet
                </div>
              )}
            </TreeItem>
          ))
        ) : (
          <div
            className={`${
              isMobile ? "text-sm" : "text-xs"
            } text-gray-500 p-2 italic`}
            style={{ paddingLeft: isMobile ? "60px" : "60px" }}
          >
            No characters yet
          </div>
        )}
      </TreeItem>

      {/* Locations section */}
      <TreeItem
        id="locations"
        icon={
          expandedItems.has("locations") ? (
            <FolderOpen
              className={`${isMobile ? "w-5 h-5" : "w-4 h-4"} text-purple-400`}
            />
          ) : (
            <Folder
              className={`${isMobile ? "w-5 h-5" : "w-4 h-4"} text-purple-400`}
            />
          )
        }
        title="Locations"
        badge={projectData?.locationTemplates?.length || 0}
        level={1}
        isExpanded={expandedItems.has("locations")}
        onToggle={() => toggleExpanded("locations")}
        onSelect={() => handleExpandOrCollapse("locations")}
        hasChildren={true}
      >
        {projectData?.locationTemplates &&
        projectData.locationTemplates.length > 0 ? (
          projectData.locationTemplates.map((location) => (
            <TreeItem
              key={location._id || ""}
              id={`location-${location._id}`}
              icon={
                <MapPin
                  className={`${
                    isMobile ? "w-5 h-5" : "w-4 h-4"
                  } text-purple-300`}
                />
              }
              title={location.name}
              subtitle={location.type}
              level={2}
              isSelected={
                selectedEntity?.type === "location" &&
                selectedEntity?.id === location._id
              }
              onSelect={() => showEntityDetails(location, "location")}
              entity={location}
              entityType="location"
              hasChildren={false}
            />
          ))
        ) : (
          <div
            className={`${
              isMobile ? "text-sm" : "text-xs"
            } text-gray-500 p-2 italic`}
            style={{ paddingLeft: isMobile ? "60px" : "60px" }}
          >
            No locations yet
          </div>
        )}
      </TreeItem>
    </>
  );

  // Panel Reader Tab UI
  const renderPanelReader = () => {
    const chapters = projectData.chapters || [];
    const selectedChapter = chapters.find((ch) => ch._id === selectedChapterId);
    return (
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <select
            value={selectedChapterId || ""}
            onChange={(e) => setSelectedChapterId(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
          >
            <option value="" disabled>
              Select Chapter
            </option>
            {chapters.map((chapter) => (
              <option key={chapter._id} value={chapter._id}>
                {chapter.title || `Chapter ${chapter.chapterNumber}`}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4">
          {selectedChapter ? (
            selectedChapter.scenes?.length ? (
              selectedChapter.scenes.map((scene) => (
                <div key={scene._id} className="mb-6">
                  <div className="font-semibold text-white mb-2">
                    {scene.title || `Scene ${scene.order}`}
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {scene.panels?.length ? (
                      scene.panels.map((panel) => (
                        <div key={panel._id} className="w-full max-w-md">
                          <ImageOnlyPanel panel={panel} />
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-gray-400 italic">
                        No panels in this scene
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400 italic">
                No scenes in this chapter
              </div>
            )
          ) : (
            <div className="text-xs text-gray-400 italic">
              Select a chapter to view panels
            </div>
          )}
        </div>
      </div>
    );
  };

  // Mobile modal layout
  if (isMobile) {
    return (
      <>
        {/* Mobile backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={onClose}
          />
        )}

        {/* Mobile left modal */}
        <div
          className={`fixed top-0 left-0 h-full w-[85vw] max-w-sm bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Background effect */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
          </div>

          {/* Mobile header */}
          <div className="relative p-4 border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm flex-shrink-0 z-10">
            <div className="flex items-center justify-between">
              <h2
                className={`font-bold text-white flex items-center gap-2 ${
                  isMobile ? "text-base" : "text-lg"
                }`}
              >
                <Layers
                  className={`text-pink-400 ${
                    isMobile ? "w-4 h-4" : "w-5 h-5"
                  }`}
                />
                Project Structure
              </h2>
            </div>
          </div>

          {/* Mobile content */}
          <ScrollArea className="flex-1 relative z-10 overflow-y-auto h-[calc(100vh-80px)]">
            <div className="p-4 space-y-2">
              <TreeItem
                id="project"
                icon={
                  expandedItems.has("project") ? (
                    <FolderOpen className="w-5 h-5" />
                  ) : (
                    <Folder className="w-5 h-5" />
                  )
                }
                title={projectData.title || "Untitled Project"}
                subtitle={
                  projectData.concept ? projectData.concept : "No description"
                }
                level={0}
                isExpanded={expandedItems.has("project")}
                onToggle={() => toggleExpanded("project")}
                isSelected={
                  selectedEntity?.type === "project" &&
                  selectedEntity?.id === projectData._id
                }
                onSelect={() => handleExpandOrCollapse("project")}
                entity={projectData}
                entityType="project"
                hasChildren={true}
              >
                {renderTreeContent()}
              </TreeItem>
            </div>
          </ScrollArea>
        </div>
      </>
    );
  }

  // Desktop layout (existing)
  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white border-l border-gray-700/50 flex flex-col relative">
      {/* Only show project structure, remove tabs */}
      <div className="flex-1 relative z-10 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        <div className="p-4 space-y-1">
          <TreeItem
            id="project"
            icon={
              expandedItems.has("project") ? (
                <FolderOpen className="w-4 h-4" />
              ) : (
                <Folder className="w-4 h-4" />
              )
            }
            title={projectData.title || "Untitled Project"}
            subtitle={
              projectData.concept ? projectData.concept : "No description"
            }
            level={0}
            isExpanded={expandedItems.has("project")}
            onToggle={() => toggleExpanded("project")}
            isSelected={
              selectedEntity?.type === "project" &&
              selectedEntity?.id === projectData._id
            }
            onSelect={() => handleExpandOrCollapse("project")}
            entity={projectData}
            entityType="project"
            hasChildren={true}
          >
            {renderTreeContent()}
          </TreeItem>
        </div>
      </div>
    </div>
  );
}
