import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage } from "../shared/types";
import type { AppMessage } from "./client";
import { DEFAULT_MODEL, DEFAULT_TEMP, DEFAULT_MAX_TOKENS, streamChat } from "./client";
import ModelSelector from "./components/ModelSelector";
import Message from "./components/Message";
import InputBar from "./components/InputBar";

const STORAGE_KEY = "omnichat:messages";
const MODEL_KEY = "omnichat:model";

function loadMessages(): AppMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveMessages(msgs: AppMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
  } catch { /* ignore */ }
}

export default function App() {
  const [messages, setMessages] = useState<AppMessage[]>(loadMessages);
  const [model, setModel] = useState(() => {
    try { return localStorage.getItem(MODEL_KEY) || DEFAULT_MODEL; }
    catch { return DEFAULT_MODEL; }
  });
  const [temperature] = useState(DEFAULT_TEMP);
  const [maxTokens] = useState(DEFAULT_MAX_TOKENS);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Persist messages
  useEffect(() => {
    if (!streaming) saveMessages(messages);
  }, [messages, streaming]);

  // Persist model
  useEffect(() => {
    try { localStorage.setItem(MODEL_KEY, model); }
    catch { /* ignore */ }
  }, [model]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSend = useCallback(async (text: string) => {
    if (streaming) return;
    setError(null);

    // Build message history (last 6 messages for context)
    const history = messages
      .filter((m) => m.role !== "system")
      .slice(-6)
      .map((m) => ({ role: m.role as ChatMessage["role"], content: m.content }));

    const fullMessages: ChatMessage[] = [...history, { role: "user", content: text }];

    // Add user message to display
    const userMsg: AppMessage = { role: "user", content: text };
    const aiMsg: AppMessage = {
      role: "assistant",
      content: "",
      done: false,
      keyIndex: undefined,
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);

    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamChat(
        fullMessages,
        model,
        temperature,
        maxTokens,
        (delta) => {
          setMessages((prev) => {
            const msgs = [...prev];
            const lastIdx = msgs.length - 1;
            if (msgs[lastIdx]?.role === "assistant") {
              msgs[lastIdx] = { ...msgs[lastIdx], content: msgs[lastIdx].content + delta };
            }
            return msgs;
          });
        },
        () => {
          setMessages((prev) => {
            const msgs = [...prev];
            const lastIdx = msgs.length - 1;
            if (msgs[lastIdx]?.role === "assistant") {
              msgs[lastIdx] = { ...msgs[lastIdx], done: true };
            }
            return msgs;
          });
        },
        controller.signal
      );
    } catch (err: any) {
      if (err.name === "AbortError") {
        setMessages((prev) => {
          const msgs = [...prev];
          const lastIdx = msgs.length - 1;
          if (msgs[lastIdx]?.role === "assistant") {
            msgs[lastIdx] = { ...msgs[lastIdx], content: msgs[lastIdx].content || "(stopped)", done: true };
          }
          return msgs;
        });
      } else {
        setError(err.message || "Unknown error");
        setMessages((prev) => {
          const msgs = [...prev];
          const lastIdx = msgs.length - 1;
          if (msgs[lastIdx]?.role === "assistant") {
            msgs[lastIdx] = { ...msgs[lastIdx], content: msgs[lastIdx].content || "⚠ Error: " + (err.message || "Request failed"), done: true };
          }
          return msgs;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
      setTimeout(scrollToBottom, 50);
    }
  }, [messages, model, temperature, maxTokens, streaming]);

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleClear = () => {
    setMessages([]);
    setError(null);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-ink-800 bg-ink-900/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pulse-400 to-pulse-600 flex items-center justify-center shadow-lg shadow-pulse-400/20">
                <svg className="w-4 h-4 text-ink-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-semibold font-display text-ink-100 tracking-tight">
                  OmniChat
                </h1>
                <p className="text-[10px] font-mono text-ink-500">
                  OpenRouter Multi-Key Chatbot
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {streaming && (
              <button
                onClick={handleStop}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-sm bg-red-400" />
                Stop
              </button>
            )}
            {!isEmpty && !streaming && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-ink-800 border border-ink-700 text-ink-400 text-xs font-medium hover:text-ink-200 hover:border-ink-600 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
            )}
            <ModelSelector selected={model} onSelect={setModel} />
          </div>
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
      >
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col gap-3">
          {isEmpty && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-pulse-400/10 to-pulse-600/10 border border-pulse-400/20 flex items-center justify-center mb-4 animate-pulse-border">
                <svg className="w-7 h-7 text-pulse-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-ink-200 mb-1">
                Start a conversation
              </h2>
              <p className="text-sm text-ink-500 max-w-xs">
                Choose a model and ask anything. Multiple API keys rotate automatically to avoid rate limits.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <Message
              key={i}
              msg={msg}
              isLast={i === messages.length - 1 && streaming}
            />
          ))}
        </div>
      </div>

      {/* Input */}
      <InputBar onSend={handleSend} disabled={streaming} error={error} />
    </div>
  );
}