import type { AppMessage } from "../client";

interface MessageProps {
  msg: AppMessage;
  isLast?: boolean;
}

export default function Message({ msg, isLast }: MessageProps) {
  if (msg.role === "system") {
    return (
      <div className="flex justify-center">
        <div className="max-w-[90%] px-4 py-2 rounded-lg bg-ink-800/40 border border-warn-400/20 text-sm text-warn-400 font-mono text-center">
          <span className="opacity-60">⚠</span> {msg.content}
        </div>
      </div>
    );
  }

  if (msg.role === "user") {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[80%] sm:max-w-[70%] px-4 py-3 rounded-2xl bg-ink-700/40 border border-ink-600/40">
          <p className="text-sm leading-relaxed text-ink-100 whitespace-pre-wrap break-words">
            {msg.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start animate-fade-in">
      <div className="max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl bg-ink-800/60 border border-ink-700/60">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-2 h-2 rounded-full bg-pulse-400 shadow-sm shadow-pulse-400/40" />
          <span className="font-mono text-[11px] text-pulse-400">
            AI
          </span>
          {msg.keyIndex !== undefined && (
            <span className="font-mono text-[10px] text-ink-500">
              key #{msg.keyIndex}
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed text-ink-200 whitespace-pre-wrap break-words">
          {msg.content}
        </p>
        {isLast && !msg.done && (
          <span className="inline-block ml-1 w-1.5 h-4 bg-pulse-400 rounded-sm animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
}