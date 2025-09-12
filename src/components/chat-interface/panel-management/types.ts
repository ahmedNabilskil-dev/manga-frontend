import {
  Character,
  LocationTemplate,
  MangaProject,
  Panel,
  PanelDialogue,
} from "@/types/entities";

export type { PanelDialogue } from "@/types/entities";

export interface ManualPanelGeneratorProps {
  isOpen?: boolean;
  onClose?: () => void;
  project: MangaProject | null;
  reloadProject: () => Promise<void>;
  isLoading: boolean;
}

export interface PanelFormData {
  _id?: string;
  order: number;
  sceneId: string;
  imgUrl: string;
  characterOutfitIds: string[];
  locationId: string;
  description: string;
  dialogs: PanelDialogue[];
}

export interface PanelCardProps {
  panel: Panel;
  index: number;
  mode: "edit" | "preview";
  colors: any;
  projectData: MangaProject | null;
  onEdit: (panel: Panel) => void;
  onCanvasUpdate: (panel: Panel, renderedImageBlob?: Blob) => Promise<void>;
  onDelete: (panelId: string) => void;
  onAddAfter: (index: number) => void;
  onDialogueConfigChange: (
    panelId: string,
    dialogueId: string,
    config: any
  ) => void;
}

export interface PanelFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (panelData: PanelFormData) => Promise<void>;
  editingPanel: Panel | null;
  insertAfterIndex: number;
  projectData: MangaProject | null;
  colors: any;
  isSaving: boolean;
  selectedSceneId?: string;
}

export interface CharacterSelectorProps {
  characters: Character[];
  selectedIds: string[];
  onToggle: (outfitIds: string[]) => void;
  colors: any;
}

export interface LocationSelectorProps {
  locations: LocationTemplate[];
  selectedId: string;
  onSelect: (locationId: string) => void;
  colors: any;
}

export interface DialogManagementProps {
  dialogs: PanelDialogue[];
  characters: Character[];
  colors: any;
  onAddDialog: () => void;
  onUpdateDialog: (
    index: number,
    field: keyof PanelDialogue,
    value: any
  ) => void;
  onRemoveDialog: (index: number) => void;
}

export interface ImageSetupProps {
  panel: PanelFormData;
  entityId: string;
  colors: any;
  onUpdateDialogConfig: (index: number, config: any) => void;
  onGenerateImage: () => void;
}
