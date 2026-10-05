import { useEffect, useState } from "react";
import type { ModelInfo } from "../shared/types";
import { MODELS } from "../client";

interface ModelSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export default function ModelSelector({
  selected,
  onSelect,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const current = MODELS.find((m) => m.id === selected);
  const filtered = MODELS.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.provider.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("click", handler, true);
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("click", handler, true);
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  if (!current) return null;

  return (
    <div className="relative z-20">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="group flex items-center gap-2 px-3 py-2 rounded-xl
          bg-ink-850 border border-ink-700 hover:border-pulse-400/50
          transition-all duration-200 cursor-pointer"
      >
        <span className="w-2 h-2 rounded-full bg-pulse-400 shadow-sm shadow-pulse-400/50" />
        <span className="text-sm font-medium text-ink-100 truncate max-w-[140px] sm:max-w-[200px]">
          {current.name}
        </span>
        <span
          className="font-mono text-[10px] text-ink-500 hidden sm:inline-block"
        >
          {current.id}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-ink-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-[320px] max-w-[90vw]
            rounded-2xl bg-ink-900 border border-ink-700 shadow-2xl
            shadow-black/60 overflow-hidden animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-3 border-b border-ink-700/60">
            <div className="relative">
              <input
                type="text"
                placeholder="Search models..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 pl-8 text-sm rounded-lg
                  bg-ink-800 border border-ink-700
                  text-ink-200 placeholder-ink-500
                  focus:outline-none focus:border-pulse-400/50
                  transition-colors"
              />
              <svg
                className="absolute left-2.5 top-2.5 w-4 h-4 text-ink-500"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <ul className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-ink-500">
                No models found
              </li>
            ) : (
              filtered.map((m) => (
                <li key={m.id}>
                  <button
                    onClick={() => {
                      onSelect(m.id);
                      setOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left flex items-start gap-3
                      hover:bg-ink-800/80 transition-colors
                      ${selected === m.id ? "bg-ink-800/60" : ""}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0
                      bg-pulse-400" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink-100 truncate">
                        {m.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-mono text-ink-500">
                          {m.id}
                        </span>
                      </div>
                      <div className="text-[11px] text-ink-500 mt-0.5">
                        {m.description}
                      </div>
                    </div>
                    {selected === m.id && (
                      <svg
                        className="w-4 h-4 text-pulse-400 shrink-0 mt-0.5"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}