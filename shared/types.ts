// Shared types between frontend and backend

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  contextLength: number;
  pricing: string;
  free: boolean;
  description: string;
}