import { Panel } from "@/types/entities";
import { useCallback, useState } from "react";

/**
 * Hook for managing panel dialogues state and updates
 */
export const usePanelDialogManagement = (initialPanels: Panel[]) => {
  const [panels, setPanels] = useState<Panel[]>(initialPanels);

  const updateDialogueConfig = useCallback(
    (panelId: string, dialogueId: string, updatedDialogue: any) => {
      console.log("updateDialogueConfig called with:", {
        panelId,
        dialogueId,
        updatedDialogue,
      });
      setPanels((prevPanels) => {
        const updatedPanels = prevPanels.map((panel) => {
          if (panel._id !== panelId) return panel;
          return {
            ...panel,
            dialogs: panel.dialogs?.map((dialog) => {
              if ((dialog._id || `dialog-${dialog.order}`) === dialogueId) {
                const updated = {
                  ...dialog,
                  ...updatedDialogue,
                };
                console.log("Updated dialog:", updated);
                return updated;
              }
              return dialog;
            }),
          };
        });
        console.log("Updated panels:", updatedPanels);
        return updatedPanels;
      });
    },
    []
  );

  const getPanelById = useCallback(
    (panelId: string) => panels.find((p) => p._id === panelId),
    [panels]
  );

  return {
    panels,
    setPanels,
    updateDialogueConfig,
    getPanelById,
  };
};
