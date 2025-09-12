import { MangaProject } from "@/types/entities";

export interface PanelContext {
  chapterNumber: number;
  chapterTitle: string;
  sceneOrder: number;
  sceneTitle: string;
  panelOrder: number;
}

/**
 * Find the context information for a panel within a project
 * @param project - The manga project
 * @param panelId - The ID of the panel to find context for
 * @returns PanelContext or null if not found
 */
export function findPanelContext(
  project: MangaProject | null,
  panelId: string
): PanelContext | null {
  if (!project?.chapters || !panelId) {
    return null;
  }

  for (const chapter of project.chapters) {
    if (!chapter.scenes) continue;

    for (const scene of chapter.scenes) {
      if (!scene.panels) continue;

      const panel = scene.panels.find((p) => p._id === panelId);
      if (panel) {
        return {
          chapterNumber: chapter.chapterNumber,
          chapterTitle: chapter.title,
          sceneOrder: scene.order || 0,
          sceneTitle: scene.title || `Scene ${scene.order || 1}`,
          panelOrder: panel.order || 0,
        };
      }
    }
  }

  return null;
}

/**
 * Find the context information for a panel based on scene ID and panel order
 * @param project - The manga project
 * @param sceneId - The ID of the scene
 * @param panelOrder - The order of the panel within the scene
 * @returns PanelContext or null if not found
 */
export function findPanelContextByScene(
  project: MangaProject | null,
  sceneId: string,
  panelOrder: number
): PanelContext | null {
  if (!project?.chapters || !sceneId) {
    return null;
  }

  for (const chapter of project.chapters) {
    if (!chapter.scenes) continue;

    const scene = chapter.scenes.find((s) => s._id === sceneId);
    if (scene) {
      return {
        chapterNumber: chapter.chapterNumber,
        chapterTitle: chapter.title,
        sceneOrder: scene.order || 0,
        sceneTitle: scene.title || `Scene ${scene.order || 1}`,
        panelOrder: panelOrder + 1, // Add 1 for user-friendly numbering
      };
    }
  }

  return null;
}

/**
 * Generate a descriptive message for panel image generation
 * @param context - The panel context
 * @param panelDescription - Optional panel description
 * @returns A formatted message for AI image generation
 */
export function generatePanelImageMessage(context: PanelContext): string {
  const baseMessage = `Please create an image for panel ${context.panelOrder} in Scene ${context.sceneOrder} (${context.sceneTitle}) in chapter ${context.chapterNumber} (${context.chapterTitle})`;

  return baseMessage;
}
