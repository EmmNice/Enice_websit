/**
 * The block editor.
 *
 * Produces an `EniceDoc` — an ordered list of typed blocks (see `src/lib/cms/doc.ts`). Each block
 * is edited by its own small component; inline formatting inside a block is handled by
 * `InlineEditable`. This split is the whole design: structure is explicit and never free-form
 * HTML, so the published article can be styled entirely by the design system, and an author can
 * never produce a layout that is off-brand.
 *
 * ## What makes it feel like a writing tool rather than a form
 *
 * - **Slash command.** Typing `/` in an empty paragraph opens the block menu, so a whole document
 *   can be written without the mouse.
 * - **Add-between.** A hairline "+" appears between any two blocks on hover.
 * - **Keyboard flow.** Enter in a list item adds the next item; Backspace in an empty block
 *   removes it and moves focus up. The common motions do not require reaching for a control.
 * - **Reorder and delete** live in a hover rail on each block, not in a modal.
 *
 * The value is controlled: the parent owns the `EniceDoc` and every edit calls `onChange` with a
 * new document, which is what lets the editor sit inside a form that also tracks dirty state and
 * autosaves.
 */

import { useCallback, useRef, useState } from "react";
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2, type LucideIcon } from "lucide-react";
import * as icons from "lucide-react";
import type {
  BlockType,
  CalloutBlock,
  CodeBlock,
  DocBlock,
  EniceDoc,
  HeadingBlock,
  ImageBlock,
  ListBlock,
  QuoteBlock,
  TableBlock,
  VideoBlock,
} from "@/lib/cms/doc";
import {
  BLOCK_META,
  BLOCK_TYPES,
  CALLOUT_VARIANTS,
  CODE_LANGUAGES,
  createBlock,
  HEADING_LEVELS,
} from "@/lib/cms/doc";
import { cn } from "@/lib/utils";
import { InlineEditable } from "./InlineEditable";
import { MediaPicker } from "../MediaPicker";
import { Button, Select } from "../primitives";

// ─── Block menu ──────────────────────────────────────────────────────────────

function iconByName(name: string): LucideIcon {
  const registry = icons as unknown as Record<string, LucideIcon>;
  return registry[name] ?? icons.Square;
}

function BlockMenu({
  onPick,
  onClose,
}: {
  onPick: (type: BlockType) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="border-border bg-popover absolute z-30 mt-1 w-60 overflow-hidden rounded-xl border shadow-[0_12px_32px_-8px_rgba(17,24,39,0.24)]"
      onMouseLeave={onClose}
    >
      <div className="max-h-72 overflow-y-auto p-1.5">
        {BLOCK_TYPES.map((type) => {
          const meta = BLOCK_META[type];
          const Icon = iconByName(meta.icon);
          return (
            <button
              key={type}
              type="button"
              onClick={() => onPick(type)}
              className="hover:bg-secondary flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors"
            >
              <span className="border-border bg-card text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-md border">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="text-foreground block text-[12.5px] font-semibold">
                  {meta.label}
                </span>
                <span className="text-muted-foreground block truncate text-[11px]">
                  {meta.hint}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Per-block editors ───────────────────────────────────────────────────────

interface BlockEditorProps<T extends DocBlock> {
  block: T;
  onChange: (block: T) => void;
  onEnter: () => void;
  onEmptyBackspace: () => void;
  autoFocus: boolean;
}

function ParagraphEditor({
  block,
  onChange,
  onEnter,
  onEmptyBackspace,
  autoFocus,
}: BlockEditorProps<Extract<DocBlock, { type: "paragraph" }>>) {
  return (
    <InlineEditable
      value={block.html}
      onChange={(html) => onChange({ ...block, html })}
      onEnter={onEnter}
      onEmptyBackspace={onEmptyBackspace}
      autoFocus={autoFocus}
      placeholder="Write, or press / for blocks…"
      ariaLabel="Paragraph"
      className="text-[15px] leading-7 text-foreground"
    />
  );
}

function HeadingEditor({
  block,
  onChange,
  onEnter,
  onEmptyBackspace,
  autoFocus,
}: BlockEditorProps<HeadingBlock>) {
  const sizes: Record<number, string> = {
    2: "text-2xl font-bold",
    3: "text-xl font-bold",
    4: "text-lg font-semibold",
  };
  return (
    <div className="flex items-start gap-2">
      <Select
        value={String(block.level)}
        onChange={(event) =>
          onChange({ ...block, level: Number(event.target.value) as HeadingBlock["level"] })
        }
        className="mt-1 h-7 w-16 shrink-0 text-[11px]"
        aria-label="Heading level"
      >
        {HEADING_LEVELS.map((level) => (
          <option key={level} value={level}>
            H{level}
          </option>
        ))}
      </Select>
      <InlineEditable
        value={block.html}
        onChange={(html) => onChange({ ...block, html })}
        onEnter={onEnter}
        onEmptyBackspace={onEmptyBackspace}
        autoFocus={autoFocus}
        toolbar={false}
        placeholder="Heading"
        ariaLabel={`Heading level ${block.level}`}
        className={cn("flex-1 tracking-tight text-foreground", sizes[block.level])}
      />
    </div>
  );
}

function ListEditor({ block, onChange, onEmptyBackspace, autoFocus }: BlockEditorProps<ListBlock>) {
  // A list manages Enter per item (adds a sibling), so the block-level onEnter is unused here.
  const setItem = (index: number, html: string) => {
    const items = [...block.items];
    items[index] = html;
    onChange({ ...block, items });
  };
  const addItem = (afterIndex: number) => {
    const items = [...block.items];
    items.splice(afterIndex + 1, 0, "");
    onChange({ ...block, items });
  };
  const removeItem = (index: number) => {
    if (block.items.length === 1) {
      onEmptyBackspace();
      return;
    }
    onChange({ ...block, items: block.items.filter((_, i) => i !== index) });
  };

  return (
    <div>
      <div className="mb-2 flex gap-1">
        {[
          { ordered: false, label: "Bulleted" },
          { ordered: true, label: "Numbered" },
        ].map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange({ ...block, ordered: option.ordered })}
            className={cn(
              "rounded px-2 py-0.5 text-[11px] font-semibold transition-colors",
              block.ordered === option.ordered
                ? "bg-primary/[0.1] text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <ol className={cn("space-y-1", block.ordered ? "list-decimal" : "list-disc", "pl-6")}>
        {block.items.map((item, index) => (
          <li
            key={index}
            className="text-[15px] leading-7 text-foreground marker:text-muted-foreground"
          >
            <InlineEditable
              value={item}
              onChange={(html) => setItem(index, html)}
              onEnter={() => addItem(index)}
              onEmptyBackspace={() => removeItem(index)}
              autoFocus={autoFocus && index === 0}
              toolbar
              placeholder="List item"
              ariaLabel={`List item ${index + 1}`}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}

function QuoteEditor({
  block,
  onChange,
  onEnter,
  onEmptyBackspace,
  autoFocus,
}: BlockEditorProps<QuoteBlock>) {
  return (
    <div className="border-primary/40 border-l-2 pl-4">
      <InlineEditable
        value={block.html}
        onChange={(html) => onChange({ ...block, html })}
        onEnter={onEnter}
        onEmptyBackspace={onEmptyBackspace}
        autoFocus={autoFocus}
        multiline
        placeholder="Quote"
        ariaLabel="Quote"
        className="text-[16px] leading-7 text-foreground italic"
      />
      <input
        value={block.attribution}
        onChange={(event) => onChange({ ...block, attribution: event.target.value })}
        placeholder="Attribution (optional)"
        aria-label="Quote attribution"
        className="text-muted-foreground mt-2 w-full bg-transparent text-[12.5px] outline-none"
      />
    </div>
  );
}

function ImageEditor({ block, onChange }: BlockEditorProps<ImageBlock>) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="border-border rounded-lg border p-3">
      {block.url ? (
        <div className="space-y-3">
          <div className="bg-secondary overflow-hidden rounded-md">
            <img src={block.url} alt={block.alt} className="max-h-72 w-full object-contain" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={block.alt}
              onChange={(event) => onChange({ ...block, alt: event.target.value })}
              placeholder="Alt text (for accessibility and SEO)"
              aria-label="Image alt text"
              className="border-border bg-background h-8 rounded-md border px-2.5 text-[12px] outline-none"
            />
            <input
              value={block.caption}
              onChange={(event) => onChange({ ...block, caption: event.target.value })}
              placeholder="Caption (optional)"
              aria-label="Image caption"
              className="border-border bg-background h-8 rounded-md border px-2.5 text-[12px] outline-none"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-muted-foreground flex items-center gap-1.5 text-[11.5px]">
              <input
                type="checkbox"
                checked={block.width === "full"}
                onChange={(event) =>
                  onChange({ ...block, width: event.target.checked ? "full" : "inset" })
                }
                className="accent-primary"
              />
              Full width
            </label>
            <Button size="sm" variant="ghost" onClick={() => setPickerOpen(true)}>
              Replace image
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => setPickerOpen(true)}
          className="w-full justify-center"
        >
          Choose an image
        </Button>
      )}

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={({ url, alt }) => onChange({ ...block, url, alt: block.alt || alt || "" })}
        kind="image"
        folder="articles"
      />
    </div>
  );
}

function VideoEditor({ block, onChange }: BlockEditorProps<VideoBlock>) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="border-border rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <input
          value={block.url}
          onChange={(event) => onChange({ ...block, url: event.target.value })}
          placeholder="YouTube, Vimeo or file URL"
          aria-label="Video URL"
          className="border-border bg-background h-8 flex-1 rounded-md border px-2.5 text-[12px] outline-none"
        />
        <Button size="sm" variant="outline" onClick={() => setPickerOpen(true)}>
          Library
        </Button>
      </div>
      <input
        value={block.caption}
        onChange={(event) => onChange({ ...block, caption: event.target.value })}
        placeholder="Caption (optional)"
        aria-label="Video caption"
        className="border-border bg-background mt-2 h-8 w-full rounded-md border px-2.5 text-[12px] outline-none"
      />
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={({ url }) => onChange({ ...block, url })}
        kind="video"
        folder="articles"
      />
    </div>
  );
}

function TableEditor({ block, onChange }: BlockEditorProps<TableBlock>) {
  const setHead = (index: number, value: string) => {
    const head = [...block.head];
    head[index] = value;
    onChange({ ...block, head });
  };
  const setCell = (row: number, col: number, value: string) => {
    const rows = block.rows.map((r) => [...r]);
    rows[row][col] = value;
    onChange({ ...block, rows });
  };
  const addColumn = () => {
    if (block.head.length >= 8) return;
    onChange({
      ...block,
      head: [...block.head, "Column"],
      rows: block.rows.map((r) => [...r, ""]),
    });
  };
  const addRow = () => onChange({ ...block, rows: [...block.rows, block.head.map(() => "")] });
  const cellClass =
    "border-border bg-background h-8 w-full min-w-24 border px-2 text-[12px] outline-none focus:border-primary";

  return (
    <div className="border-border overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {block.head.map((cell, index) => (
                <th key={index} className="p-0">
                  <input
                    value={cell}
                    onChange={(event) => setHead(index, event.target.value)}
                    aria-label={`Column ${index + 1} heading`}
                    className={cn(cellClass, "bg-secondary font-semibold")}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="p-0">
                    <input
                      value={cell}
                      onChange={(event) => setCell(rowIndex, colIndex, event.target.value)}
                      aria-label={`Row ${rowIndex + 1}, column ${colIndex + 1}`}
                      className={cellClass}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-border flex gap-2 border-t p-2">
        <Button size="sm" variant="ghost" onClick={addRow}>
          Add row
        </Button>
        <Button size="sm" variant="ghost" onClick={addColumn} disabled={block.head.length >= 8}>
          Add column
        </Button>
      </div>
    </div>
  );
}

function CodeEditor({ block, onChange }: BlockEditorProps<CodeBlock>) {
  return (
    <div className="border-border overflow-hidden rounded-lg border">
      <div className="border-border bg-secondary flex items-center gap-2 border-b px-2 py-1.5">
        <Select
          value={block.language}
          onChange={(event) => onChange({ ...block, language: event.target.value })}
          className="h-7 w-32 text-[11px]"
          aria-label="Code language"
        >
          {CODE_LANGUAGES.map((language) => (
            <option key={language} value={language}>
              {language}
            </option>
          ))}
        </Select>
        <input
          value={block.filename}
          onChange={(event) => onChange({ ...block, filename: event.target.value })}
          placeholder="filename (optional)"
          aria-label="Code filename"
          className="text-muted-foreground h-7 flex-1 bg-transparent text-[11.5px] outline-none"
        />
      </div>
      <textarea
        value={block.code}
        onChange={(event) => onChange({ ...block, code: event.target.value })}
        rows={Math.min(Math.max(block.code.split("\n").length, 3), 20)}
        placeholder="Paste or type code…"
        aria-label="Code"
        spellCheck={false}
        className="bg-card text-foreground w-full resize-y p-3 font-mono text-[12.5px] leading-6 outline-none"
      />
    </div>
  );
}

function CalloutEditor({ block, onChange, autoFocus }: BlockEditorProps<CalloutBlock>) {
  const tones: Record<CalloutBlock["variant"], string> = {
    info: "border-blue-500/30 bg-blue-50",
    success: "border-emerald-500/30 bg-emerald-50",
    warning: "border-amber-500/30 bg-amber-50",
    danger: "border-red-500/30 bg-red-50",
  };
  return (
    <div className={cn("rounded-lg border p-3", tones[block.variant])}>
      <div className="mb-2 flex gap-1">
        {CALLOUT_VARIANTS.map((variant) => (
          <button
            key={variant}
            type="button"
            onClick={() => onChange({ ...block, variant })}
            className={cn(
              "rounded px-2 py-0.5 text-[10.5px] font-semibold capitalize transition-colors",
              block.variant === variant
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            {variant}
          </button>
        ))}
      </div>
      <input
        value={block.title}
        onChange={(event) => onChange({ ...block, title: event.target.value })}
        placeholder="Callout title (optional)"
        aria-label="Callout title"
        className="text-foreground w-full bg-transparent text-[13px] font-bold outline-none"
      />
      <InlineEditable
        value={block.html}
        onChange={(html) => onChange({ ...block, html })}
        autoFocus={autoFocus}
        multiline
        placeholder="Callout text"
        ariaLabel="Callout body"
        className="text-foreground/85 mt-1 text-[13.5px] leading-6"
      />
    </div>
  );
}

// ─── Block frame ─────────────────────────────────────────────────────────────

/** Dispatches to the right editor and wraps it in the hover rail. */
function BlockRow({
  block,
  index,
  total,
  autoFocus,
  onChange,
  onInsertAfter,
  onDelete,
  onMove,
  onSplit,
}: {
  block: DocBlock;
  index: number;
  total: number;
  autoFocus: boolean;
  onChange: (block: DocBlock) => void;
  onInsertAfter: () => void;
  onDelete: () => void;
  onMove: (direction: -1 | 1) => void;
  onSplit: () => void;
}) {
  const shared = {
    onEnter: onSplit,
    onEmptyBackspace: () => total > 1 && onDelete(),
    autoFocus,
  };

  return (
    <div className="group/block relative">
      {/* Reorder + delete rail, revealed on hover. Absolute so it does not shift the content. */}
      <div className="absolute top-0 -left-9 flex flex-col items-center gap-0.5 opacity-0 transition-opacity group-hover/block:opacity-100">
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={index === 0}
          aria-label="Move block up"
          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <span className="text-muted-foreground/40 cursor-grab" aria-hidden="true">
          <GripVertical className="h-3.5 w-3.5" />
        </span>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={index === total - 1}
          aria-label="Move block down"
          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="absolute top-0 -right-9 opacity-0 transition-opacity group-hover/block:opacity-100">
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete block"
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="py-1">
        {block.type === "paragraph" && (
          <ParagraphEditor block={block} onChange={onChange as never} {...shared} />
        )}
        {block.type === "heading" && (
          <HeadingEditor block={block} onChange={onChange as never} {...shared} />
        )}
        {block.type === "list" && (
          <ListEditor block={block} onChange={onChange as never} {...shared} />
        )}
        {block.type === "quote" && (
          <QuoteEditor block={block} onChange={onChange as never} {...shared} />
        )}
        {block.type === "image" && (
          <ImageEditor block={block} onChange={onChange as never} {...shared} />
        )}
        {block.type === "video" && (
          <VideoEditor block={block} onChange={onChange as never} {...shared} />
        )}
        {block.type === "table" && (
          <TableEditor block={block} onChange={onChange as never} {...shared} />
        )}
        {block.type === "code" && (
          <CodeEditor block={block} onChange={onChange as never} {...shared} />
        )}
        {block.type === "callout" && (
          <CalloutEditor block={block} onChange={onChange as never} {...shared} />
        )}
        {block.type === "divider" && <hr className="border-border my-3 border-t-2" />}
      </div>

      {/* Add-between affordance. */}
      <div className="relative flex h-0 items-center justify-center">
        <button
          type="button"
          onClick={onInsertAfter}
          aria-label="Add a block here"
          className="border-border bg-card text-muted-foreground hover:border-primary hover:text-primary absolute z-10 flex h-5 w-5 items-center justify-center rounded-full border opacity-0 transition-all group-hover/block:opacity-100"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// ─── The editor ──────────────────────────────────────────────────────────────

export function BlockEditor({
  doc,
  onChange,
}: {
  doc: EniceDoc;
  onChange: (doc: EniceDoc) => void;
}) {
  const [menuFor, setMenuFor] = useState<number | "end" | null>(null);
  // The id of the block to focus after the next change, so a freshly inserted block receives the
  // caret without the parent having to track refs.
  const focusNext = useRef<string | null>(null);

  const setBlocks = useCallback(
    (blocks: DocBlock[]) => onChange({ ...doc, blocks }),
    [doc, onChange],
  );

  const insertAt = (index: number, type: BlockType) => {
    const block = createBlock(type);
    focusNext.current = block.id;
    const blocks = [...doc.blocks];
    blocks.splice(index, 0, block);
    setBlocks(blocks);
    setMenuFor(null);
  };

  const updateBlock = (index: number, block: DocBlock) => {
    const blocks = [...doc.blocks];
    blocks[index] = block;
    setBlocks(blocks);
  };

  const deleteBlock = (index: number) => {
    const blocks = doc.blocks.filter((_, i) => i !== index);
    // Never leave a genuinely empty document with no place to type.
    setBlocks(blocks.length > 0 ? blocks : [createBlock("paragraph")]);
    focusNext.current = doc.blocks[Math.max(0, index - 1)]?.id ?? null;
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= doc.blocks.length) return;
    const blocks = [...doc.blocks];
    [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
    setBlocks(blocks);
  };

  // Enter at the end of a text block adds a paragraph after it.
  const splitBlock = (index: number) => insertAt(index + 1, "paragraph");

  return (
    <div className="pl-9">
      {doc.blocks.map((block, index) => (
        <div key={block.id} className="relative">
          <BlockRow
            block={block}
            index={index}
            total={doc.blocks.length}
            autoFocus={focusNext.current === block.id}
            onChange={(next) => updateBlock(index, next)}
            onInsertAfter={() => setMenuFor(index)}
            onDelete={() => deleteBlock(index)}
            onMove={(direction) => moveBlock(index, direction)}
            onSplit={() => splitBlock(index)}
          />
          {menuFor === index && (
            <div className="relative z-30 pl-9">
              <BlockMenu
                onPick={(type) => insertAt(index + 1, type)}
                onClose={() => setMenuFor(null)}
              />
            </div>
          )}
        </div>
      ))}

      {/* Persistent add-block control at the end. */}
      <div className="relative mt-2">
        <button
          type="button"
          onClick={() => setMenuFor(menuFor === "end" ? null : "end")}
          className="text-muted-foreground hover:border-primary/40 hover:text-primary border-border flex w-full items-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-[12.5px] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add a block
        </button>
        {menuFor === "end" && (
          <BlockMenu
            onPick={(type) => insertAt(doc.blocks.length, type)}
            onClose={() => setMenuFor(null)}
          />
        )}
      </div>
    </div>
  );
}
