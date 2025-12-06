export interface ScenePrompt {
  id: string;
  description: string;
  title: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING_IMAGES = 'GENERATING_IMAGES',
  EDITING_IMAGE = 'EDITING_IMAGE',
  ERROR = 'ERROR'
}

export interface Character {
  id: string;
  name: string;
  imageBase64: string;
}

export interface ScenarioAnalysis {
  scenes: {
    title: string;
    visualDescription: string;
  }[];
  style: string;
}