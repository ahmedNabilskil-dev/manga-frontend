import { Panel } from "@/types/entities";

/**
 * Utility functions for working with panels
 */

/**
 * Get the appropriate image URL for a panel based on context
 * @param panel - The panel object
 * @param preferRendered - Whether to prefer rendered image over original (default: true)
 * @param forceOriginal - Force use of original image even if rendered exists (default: false)
 * @returns The appropriate image URL
 */
export function getPanelImageUrl(
  panel: Panel,
  preferRendered: boolean = true,
  forceOriginal: boolean = false
): string | undefined {
  if (forceOriginal) {
    return panel.imgUrl;
  }

  if (preferRendered && panel.renderedImgUrl) {
    return panel.renderedImgUrl;
  }

  return panel.imgUrl;
}

/**
 * Check if a panel has both original and rendered images available
 * @param panel - The panel object
 * @returns True if both images are available
 */
export function hasMultipleImageOptions(panel: Panel): boolean {
  return !!(panel.imgUrl && panel.renderedImgUrl);
}

/**
 * Check if a panel should use dynamic bubble rendering
 * @param panel - The panel object
 * @param forceUseDynamic - Force use of dynamic bubbles
 * @returns True if should use dynamic bubble rendering
 */
export function shouldUseDynamicBubbles(
  panel: Panel,
  forceUseDynamic: boolean = false
): boolean {
  if (forceUseDynamic) return true;

  // Use dynamic bubbles if no rendered image is available
  return !panel.renderedImgUrl;
}

/**
 * Get panel display mode information
 * @param panel - The panel object
 * @returns Object with display mode information
 */
export function getPanelDisplayMode(panel: Panel) {
  const hasOriginal = !!panel.imgUrl;
  const hasRendered = !!panel.renderedImgUrl;
  const hasDialogs = !!(panel.dialogs && panel.dialogs.length > 0);

  return {
    hasOriginal,
    hasRendered,
    hasDialogs,
    canUseRendered: hasRendered,
    shouldUseDynamic: !hasRendered && hasDialogs,
    displayMode: hasRendered
      ? "rendered"
      : ((hasDialogs ? "dynamic" : "static") as
          | "rendered"
          | "dynamic"
          | "static"),
  };
}

/**
 * Format panel status text for UI display
 * @param panel - The panel object
 * @returns Formatted status text
 */
export function getPanelStatusText(panel: Panel): string {
  const mode = getPanelDisplayMode(panel);
  const dialogCount = panel.dialogs?.length || 0;

  let status = `Panel ${panel.order} • ${dialogCount} dialogues`;

  switch (mode.displayMode) {
    case "rendered":
      status += " • 🎨 High-quality rendered";
      break;
    case "dynamic":
      status += " • 🔧 Dynamic bubbles";
      break;
    case "static":
      status += " • 📷 Static image";
      break;
  }

  return status;
}
