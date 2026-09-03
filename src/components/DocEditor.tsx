import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { Block, Doc } from "@/lib/app";
import { useDocMutations } from "@/lib/app";

const TYPES: { key: Block["type"]; label: string }[] = [
  { key: "heading", label: "Heading" },
  { key: "paragraph", label: "Text" },
  { key: "check", label: "Checklist" },
  { key: "callout", label: "Callout" },
];

function newBlock(type: Block["type"] = "paragraph"): Block {
  return { id: crypto.randomUUID(), type, text: "", checked: false };
}

export function DocEditor({ doc, onBack }: { doc: Doc; onBack: () => void }) {
  const { saveDoc } = useDocMutations();
  const [title, setTitle] = useState(doc.title);
  const [blocks, setBlocks] = useState<Block[]>(
    doc.blocks?.length ? doc.blocks : [newBlock()],
  );
  const [focusId, setFocusId] = useState<string | null>(blocks[0]?.id ?? null);
  const [saved, setSaved] = useState(true);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});
  const pendingFocus = useRef<string | null>(null);

  useEffect(() => {
    setSaved(false);
    const t = window.setTimeout(() => {
      saveDoc.mutate(
        { id: doc.id, title, blocks },
        { onSuccess: () => setSaved(true) },
      );
    }, 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, blocks, doc.id]);

  useEffect(() => {
    if (pendingFocus.current) {
      inputs.current[pendingFocus.current]?.focus();
      pendingFocus.current = null;
    }
  }, [blocks]);

  const words = blocks
    .map((b) => b.text)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;

  const patch = (id: string, next: Partial<Block>) =>
    setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, ...next } : b)));

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const block = blocks[index]!;
    if (e.key === "Enter") {
      e.preventDefault();
      const created = newBlock(block.type === "heading" ? "paragraph" : block.type);
      pendingFocus.current = created.id;
      setFocusId(created.id);
      setBlocks((bs) => [...bs.slice(0, index + 1), created, ...bs.slice(index + 1)]);
    } else if (e.key === "Backspace" && block.text === "" && blocks.length > 1) {
      e.preventDefault();
      const prev = blocks[index - 1] ?? blocks[index + 1]!;
      pendingFocus.current = prev.id;
      setFocusId(prev.id);
      setBlocks((bs) => bs.filter((b) => b.id !== block.id));
    }
  };

  const styleFor = (type: Block["type"]) =>
    type === "heading"
      ? "text-xl font-extrabold text-ink"
      : type === "callout"
        ? "text-[16px] text-ink"
        : "text-[16px] text-ink";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
        <button
          type="button"
          aria-label="Back to the doc list"
          onClick={onBack}
          className="grid h-11 w-11 place-items-center rounded-btn border border-line-2 text-ink-2"
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Doc title"
          className="min-w-0 min-h-11 rounded-btn border border-line-2 bg-bg px-3 font-extrabold text-ink"
        />
        <span className="num shrink-0 text-[11px] text-ink-3">
          {saved ? "Saved" : "Saving"}
        </span>
      </div>

      <div className="card space-y-1 p-4">
        {blocks.map((block, i) => (
          <div
            key={block.id}
            className={
              block.type === "callout"
                ? "rounded-tile border-l-4 bg-bg px-3 py-2"
                : "flex items-center gap-2"
            }
            style={
              block.type === "callout" ? { borderColor: "var(--blue)" } : undefined
            }
          >
            {block.type === "check" ? (
              <button
                type="button"
                role="checkbox"
                aria-checked={!!block.checked}
                aria-label={`Check the item ${block.text || "without text"}`}
                onClick={() => patch(block.id, { checked: !block.checked })}
                className="tap-44 grid h-6 w-6 shrink-0 place-items-center rounded-[8px] border-2"
                style={{
                  borderColor: block.checked ? "var(--mint)" : "var(--line-2)",
                  background: block.checked ? "var(--mint)" : "transparent",
                }}
              >
                {block.checked ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M5 12.5l4.5 4.5L19 7"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : null}
              </button>
            ) : null}
            <input
              ref={(el) => {
                inputs.current[block.id] = el;
              }}
              value={block.text}
              aria-label={`Block ${i + 1}`}
              onFocus={() => setFocusId(block.id)}
              onChange={(e) => patch(block.id, { text: e.target.value })}
              onKeyDown={(e) => onKeyDown(e, i)}
              placeholder={block.type === "heading" ? "Heading" : "Text"}
              className={`min-h-11 w-full bg-transparent outline-none ${styleFor(block.type)} ${
                block.checked ? "line-through" : ""
              }`}
            />
          </div>
        ))}
      </div>

      <div className="card p-3">
        <div className="flex items-center justify-between">
          <p className="label-xs text-ink-3">Block type</p>
          <p className="num text-[11px] text-ink-3">{words} words</p>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {TYPES.map((t) => {
            const current = blocks.find((b) => b.id === focusId);
            const active = current?.type === t.key;
            return (
              <button
                key={t.key}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  if (!focusId) return;
                  patch(focusId, { type: t.key });
                  inputs.current[focusId]?.focus();
                }}
                className="min-h-11 rounded-btn border px-1 text-[12px] font-bold"
                style={{
                  borderColor: active ? "var(--blue)" : "var(--line-2)",
                  color: active ? "var(--blue-ink)" : "var(--ink-2)",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
