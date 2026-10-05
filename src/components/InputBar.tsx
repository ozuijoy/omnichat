import { useState, useRef, useEffect } from "react";

interface InputBarProps {
  onSend: (text: string) => void;
  disabled: boolean;
  error?: string | null;
}

export default function InputBar({ onSend, disabled, error }: InputBarProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-ink-800 bg-ink-900/80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Ask anything..."
            rows={1}
            className="w-full px-4 py-3 text-sm rounded-2xl
              bg-ink-800 border border-ink-700
              text-ink-100 placeholder-ink-500
              focus:outline-none focus:border-pulse-400/40 focus:ring-1 focus:ring-pulse-400/10
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all resize-none min-h-[48px] max-h-[160px]"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl
            bg-gradient-to-br from-pulse-400 to-pulse-600
            text-ink-950 font-semibold text-sm
            hover:from-pulse-500 hover:to-pulse-700
            disabled:from-ink-700 disabled:to-ink-700 disabled:text-ink-500
            disabled:cursor-not-allowed
            transition-all duration-200 shrink-0 shadow-lg shadow-pulse-400/10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>

      {error && (
        <div className="px-4 pb-2">
          <div className="text-xs font-mono text-red-400 bg-red-400/5 border border-red-400/10 rounded-lg px-3 py-1.5 inline-block">
            <span className="opacity-60">⚠</span> {error}
          </div>
        </div>
      )}
    </div>
  );
}