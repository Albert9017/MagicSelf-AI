export interface GeneratedImage {
  id: string;
  url: string;
  styleName: string;
  promptUsed: string;
}

export interface ImageAsset {
  data: string; // Base64 string
  mimeType: string;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  EDITING = 'EDITING',
  ERROR = 'ERROR'
}

export type StyleOption = {
  name: string;
  label: string;
  prompt: string;
  icon: string;
}