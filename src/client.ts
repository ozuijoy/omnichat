import type { ChatMessage, ModelInfo } from "../shared/types";
import { AVAILABLE_MODELS } from "../shared/models";

export type AppMessage = {
  role: "system" | "user" | "assistant";
  content: string;
  done?: boolean;
  keyIndex?: number;
};

export type ChatConfig = {
  model: string;
  temperature: number;
  maxTokens: number;
};

export const MODELS = AVAILABLE_MODELS as ModelInfo[];
export const DEFAULT_MODEL = MODELS[0].id;
export const DEFAULT_TEMP = 0.7;
export const DEFAULT_MAX_TOKENS = 2048;

// API endpoint - configurable per deployment platform
// Vercel / Cloudflare Pages: /api/chat
// Netlify: /.netlify/functions/chat (via environment variable)
// Local dev: /api/chat (with Vite proxy)
const API_PATH = import.meta.env.VITE_API_ENDPOINT || "/api/chat";

export async function chatClient(
  messages: ChatMessage[],
  model: string,
  temperature: number = DEFAULT_TEMP,
  maxTokens: number = DEFAULT_MAX_TOKENS
): Promise<Response | null> {
  const res = await fetch(API_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      model,
      temperature,
      maxTokens,
    }),
  });
  return res;
}

export async function streamChat(
  messages: ChatMessage[],
  model: string,
  temperature: number = DEFAULT_TEMP,
  maxTokens: number = DEFAULT_MAX_TOKENS,
  onData: (delta: string) => void,
  onDone?: () => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await chatClient(messages, model, temperature, maxTokens);
  if (!res || !res.ok) {
    throw new Error(`API error: ${res?.status || 0}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Split on SSE event boundaries (\n\n)
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";

    for (const part of parts) {
      const lines = part.split("\n");
      let eventData: string | null = null;

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            eventData = "[DONE]";
            break;
          }
          eventData = data;
        }
      }

      if (eventData === "[DONE]" || eventData) {
        if (eventData !== "[DONE]") {
          try {
            const parsed = JSON.parse(eventData);
            const content = parsed.choices?.[0]?.delta?.content || "";
            if (content) onData(content);
          } catch {
            // Non-JSON data line — ignore
          }
        }
      }
    }

    if (signal?.aborted) break;
  }

  onDone?.();
}