import { MangaStatus } from "@/types/enums";

export interface KeyFeature {
  name: string; // e.g., "Large Oak Desk"
  description: string; // e.g., "The central desk where Kaito does his research."
}

export interface LocationTemplate {
  _id?: string; // MongoDB ObjectId as string
  name: string;
  description: string;
  imgPrompt: string;
  type: string; // e.g., "indoor", "outdoor", "urban", "rural"
  category: string; // e.g., "urban", "nature", "fantasy", "historical"
  keyFeatures?: KeyFeature[];
  imgUrl?: string;
  mangaProjectId: string; // reference as string

  createdAt?: Date; // from timestamps: true
  updatedAt?: Date;
}

export interface MangaProject {
  _id: string;
  title: string;
  description?: string;
  status: MangaStatus;
  initialPrompt?: string;
  genre?: string;
  artStyle?: string;
  coverImageUrl?: string;
  targetAudience?: "children" | "teen" | "young-adult" | "adult";
  worldDetails?: {
    summary: string;
    history: string;
    society: string;
    uniqueSystems: string;
  };
  concept?: string;
  // Locations now directly part of project
  plotStructure?: {
    incitingIncident: string;
    plotTwist: string;
    climax: string;
    resolution: string;
  };
  // locationTemplates already defined above, removed duplicate
  // Key events now directly part of project
  themes?: string[];
  motifs?: string[];
  symbols?: string[];
  tags?: string[];
  creatorId?: string;
  viewCount: number;
  likeCount: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  chapters?: Chapter[];
  characters?: Character[];
  locationTemplates?: LocationTemplate[];
}

export interface OutfitComponent {
  name: string; // e.g., "Jacket"
  description: string; // e.g., "A worn, olive-green flannel jacket."
}

export interface CharacterOutfitTemplate {
  _id?: string; // MongoDB _id as string
  name: string;
  characterId: string; // Instead of Types.ObjectId
  prompt: string;
  components: OutfitComponent[];
  category: "casual" | "formal" | "school" | "special";
  season: "spring" | "summer" | "autumn" | "winter" | "all";
  isDefault: boolean;
  imgUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Character {
  _id: string;
  name: string;
  age?: number;
  gender?: string;
  description?: string;
  appearance?: string;
  personality?: string;
  personalityStrengths?: string[];
  personalityWeaknesses?: string[];
  personalityCoreMotivation?: string;
  personalityFears?: string;
  relationships?: {
    characterId: string;
    relationshipType: string;
    description: string;
  }[];
  role?: "protagonist" | "antagonist" | "supporting" | "minor";
  backstory?: string;
  imgUrl?: string;
  consistencyPrompt?: string;
  traits?: string[];
  mangaProjectId?: string; // Made optional for compatibility
  outfitTemplates?: CharacterOutfitTemplate[];
}

export interface CharacterArc {
  characterId: string;
  arcDescription: string; // e.g., "Moves from denial to active investigation, learning to trust intuition."
}

export interface Chapter {
  scenes?: Scene[];
  _id?: string; // MongoDB ObjectId as string
  chapterNumber: number;
  title: string;
  narrative: string;
  synopsis: string;
  purpose?: string;
  tone?: string;
  keyCharacters?: string[];
  characterArcs?: CharacterArc[];
  narrativeHooks?: string[];
  imgUrl?: string;
  mangaProjectId: string; // reference as string
  isAiGenerated?: boolean;
  isPublished?: boolean;
  viewCount?: number;

  createdAt?: Date; // from timestamps: true
  updatedAt?: Date;
}

export interface EnvironmentOverrides {
  timeOfDay?: "dawn" | "morning" | "noon" | "afternoon" | "evening" | "night";
  weather?: "sunny" | "cloudy" | "rainy" | "stormy" | "snowy" | "foggy";
  mood?:
    | "peaceful"
    | "mysterious"
    | "energetic"
    | "romantic"
    | "tense"
    | "cheerful"
    | "somber";
}

export interface Scene {
  _id?: string; // MongoDB _id as string
  order: number;
  title: string;
  synopsis: string;
  locationId: string;
  characterOutfitIds: string[];
  environmentOverrides?: EnvironmentOverrides;
  chapterId: string; // Instead of Types.ObjectId
  createdAt?: Date;
  updatedAt?: Date;
  panels?: Panel[];
}

export interface Panel {
  _id?: string; // MongoDB _id as string
  order: number;
  imgUrl?: string; // Original panel image without dialogs
  renderedImgUrl?: string; // Panel image WITH dialogs rendered (high-quality)
  description: string;
  characterOutfitIds?: string[]; // e.g., ["Hero", "Villain"]
  locationId?: string; // reference to LocationTemplate
  sceneId: string; // Instead of Types.ObjectId
  createdAt?: Date;
  updatedAt?: Date;
  dialogs?: PanelDialogue[];
  characters?: Character[];
}

export interface PanelDialogue {
  _id?: string; // MongoDB document _id as string
  order: number;
  content: string;
  emotion?: string;
  speakerId?: string;
  bubbleType?: "normal" | "thought" | "scream" | "whisper" | "narration";
  panelId: string; // Instead of Types.ObjectId
  createdAt?: Date;
  updatedAt?: Date;
  config?: any; // Made optional to match component usage
}
