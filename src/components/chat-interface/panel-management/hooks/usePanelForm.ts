import { useCallback, useState } from "react";
import { PanelDialogue, PanelFormData } from "../types";

const DEFAULT_CONFIG = {
  w: 160,
  h: 100,
  c: { x: 50, y: 50 },
  tail: {
    corners: [{ x: 100, y: 100 }],
    tip: { x: 150, y: 150 },
  },
  shape: "ROUNDED_RECT_BUBBLE_SHAPE",
  type: "SPEECH_TYPE",
  config: {
    fontSize: 16,
    lineHeight: 26,
    textPadding: 14,
    cornerRadius: 12,
  },
};

const createEmptyPanel = (): PanelFormData => ({
  order: 0,
  sceneId: "",
  imgUrl: "",
  characterOutfitIds: [],
  locationId: "",
  description: "",
  dialogs: [],
});

export const usePanelForm = (initialPanel?: PanelFormData) => {
  const [panelData, setPanelData] = useState<PanelFormData>(
    () => initialPanel || createEmptyPanel()
  );

  const updateDescription = useCallback((description: string) => {
    setPanelData((prev) => ({ ...prev, description }));
  }, []);

  const updateLocation = useCallback((locationId: string) => {
    setPanelData((prev) => ({ ...prev, locationId }));
  }, []);

  const toggleCharacter = useCallback((outfitIds: string[]) => {
    setPanelData((prev) => ({
      ...prev,
      characterOutfitIds: outfitIds,
    }));
  }, []);

  const addDialog = useCallback(() => {
    setPanelData((prev) => {
      const newDialog: PanelDialogue = {
        _id: `temp-dialog-${Date.now()}`,
        order: (prev.dialogs?.length || 0) + 1,
        content: "",
        speakerId: "",
        bubbleType: "normal",
        panelId: "",
        config: DEFAULT_CONFIG,
      };
      return { ...prev, dialogs: [...prev.dialogs, newDialog] };
    });
  }, []);

  const updateDialog = useCallback(
    (index: number, field: keyof PanelDialogue, value: any) => {
      setPanelData((prev) => {
        const updatedDialogs = [...prev.dialogs];
        updatedDialogs[index] = { ...updatedDialogs[index], [field]: value };
        return { ...prev, dialogs: updatedDialogs };
      });
    },
    []
  );

  const updateDialogConfig = useCallback((index: number, newConfig: any) => {
    setPanelData((prev) => {
      const updatedDialogs = [...prev.dialogs];
      updatedDialogs[index] = {
        ...updatedDialogs[index],
        config: { ...updatedDialogs[index].config, ...newConfig },
      };
      return { ...prev, dialogs: updatedDialogs };
    });
  }, []);

  const removeDialog = useCallback((index: number) => {
    setPanelData((prev) => ({
      ...prev,
      dialogs: prev.dialogs.filter((_, i) => i !== index),
    }));
  }, []);

  const resetForm = useCallback(() => {
    setPanelData(createEmptyPanel());
  }, []);

  const loadPanel = useCallback((panel: PanelFormData) => {
    setPanelData(panel);
  }, []);

  const updatePanel = useCallback((updates: Partial<PanelFormData>) => {
    setPanelData((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    panelData,
    updateDescription,
    updateLocation,
    toggleCharacter,
    addDialog,
    updateDialog,
    updateDialogConfig,
    removeDialog,
    resetForm,
    loadPanel,
    updatePanel,
  };
};
