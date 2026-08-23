/**
 * A `contenteditable` region that produces the inline HTML subset the CMS stores.
 *
 * ## Why contenteditable rather than a rich-text library
 *
 * The document *structure* is handled by the block editor — each paragraph, heading and list item
 * is its own block. All this component has to do is inline formatting *within* one such run:
 * bold, italic, code, links. A `contenteditable` with `document.execCommand` does exactly that,
 * natively, in every browser, for zero bytes of dependency. Pulling in ProseMirror to bold a word
 * would be a large tree for a small job the platform already does.
 *
 * The catch with `execCommand` is that different engines emit different markup (`<b>` vs
 * `<strong>`, stray `<div>` wrappers on Enter). That is fine here, because nothing trusts what
 * comes out: `onChange` hands the raw innerHTML upward, and it is `sanitizeInlineHtml` on save —
 * and again on the server — that decides what is actually stored. This component is a convenient
 * input, not the source of truth for what is safe.
 *
 * ## The uncontrolled-input problem
 *
 * A `contenteditable` cannot be driven like a React input: writing `innerHTML` on every render
 * would reset the caret to the start on every keystroke. So the DOM is seeded once from `value`
 * and thereafter left alone while focused; `value` is only pushed back in when it changes from the
 * *outside* (a block reset, an undo), detected by comparing against the last value we emitted.
 */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Bold, Code, Italic, Link2, Strikethrough } from "lucide-react";
import { cn } from "@/lib/utils";
import { sanitizeUrl } from "@/lib/cms/sanitize";

export interface InlineEditableProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Enter inserts a line break rather than submitting; Shift+Enter always does. */
  multiline?: boolean;
  /** Called on Enter in single-line mode — used by list items to add a sibling. */
  onEnter?: () => void;
  /** Called on Backspace in an empty field — used to merge/remove a block. */
  onEmptyBackspace?: () => void;
  className?: string;
  ariaLabel?: string;
  autoFocus?: boolean;
  /** Formatting toolbar shown on selection. Off for plain fields like list items. */
  toolbar?: boolean;
}

/** Applies an execCommand and reports the resulting HTML. */
function exec(command: string, value?: string) {
  document.execCommand(command, false, value);
}

export function InlineEditable({
  value,
  onChange,
  placeholder,
  multiline = false,
  onEnter,
  onEmptyBackspace,
  className,
  ariaLabel,
  autoFocus,
  toolbar = true,
}: InlineEditableProps) {
  const ref = useRef<HTMLDivElement>(null);
  // The last value this component emitted. Guards the seeding effect so our own edits do not
  // trigger a re-seed (which would move the caret).
  const lastEmitted = useRef(value);
  const [toolbarState, setToolbarState] = useState<{ top: number; left: number } | null>(null);
  const [linkPrompt, setLinkPrompt] = useState<{ open: boolean; url: string }>({
    open: false,
    url: "",
  });
  const fieldId = useId();

  // Seed once, and re-seed only when the value changed from outside.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (value !== lastEmitted.current && value !== node.innerHTML) {
      node.innerHTML = value;
      lastEmitted.current = value;
    }
  }, [value]);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  const emit = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    const html = node.innerHTML;
    lastEmitted.current = html;
    onChange(html);
  }, [onChange]);

  // Positions the floating toolbar above the current selection, or hides it when the selection
  // is collapsed or has left this field.
  const updateToolbar = useCallback(() => {
    if (!toolbar) return;
    const selection = window.getSelection();
    const node = ref.current;
    if (!selection || selection.isCollapsed || !node || !node.contains(selection.anchorNode)) {
      setToolbarState(null);
      return;
    }
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const hostRect = node.getBoundingClientRect();
    setToolbarState({
      top: rect.top - hostRect.top - 42,
      left: Math.max(0, rect.left - hostRect.left + rect.width / 2 - 90),
    });
  }, [toolbar]);

  useEffect(() => {
    if (!toolbar) return;
    document.addEventListener("selectionchange", updateToolbar);
    return () => document.removeEventListener("selectionchange", updateToolbar);
  }, [toolbar, updateToolbar]);

  const applyLink = () => {
    const safe = sanitizeUrl(linkPrompt.url);
    if (safe) {
      // Re-focus first: the prompt stole focus, and execCommand acts on the document selection,
      // which must be back inside this field.
      ref.current?.focus();
      exec("createLink", safe);
      emit();
    }
    setLinkPrompt({ open: false, url: "" });
    setToolbarState(null);
  };

  return (
    <div className="relative">
      {toolbar && toolbarState && !linkPrompt.open && (
        <div
          className="border-border bg-popover absolute z-20 flex items-center gap-0.5 rounded-lg border p-0.5 shadow-[0_8px_24px_-8px_rgba(17,24,39,0.28)]"
          style={{ top: toolbarState.top, left: toolbarState.left }}
          // Prevent the mousedown from collapsing the selection before the command runs.
          onMouseDown={(event) => event.preventDefault()}
        >
          {[
            { icon: Bold, command: "bold", label: "Bold" },
            { icon: Italic, command: "italic", label: "Italic" },
            { icon: Strikethrough, command: "strikeThrough", label: "Strikethrough" },
          ].map(({ icon: Icon, command, label }) => (
            <button
              key={command}
              type="button"
              aria-label={label}
              title={label}
              onClick={() => {
                exec(command);
                emit();
              }}
              className="text-popover-foreground hover:bg-secondary flex h-7 w-7 items-center justify-center rounded-md transition-colors"
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ))}
          <span className="bg-border mx-0.5 h-4 w-px" aria-hidden="true" />
          <button
            type="button"
            aria-label="Inline code"
            title="Inline code"
            onClick={() => {
              // execCommand has no "code", so wrap the selection by hand.
              const selection = window.getSelection();
              if (selection && !selection.isCollapsed) {
                const text = selection.toString();
                exec("insertHTML", `<code>${text.replace(/</g, "&lt;")}</code>`);
                emit();
              }
            }}
            className="text-popover-foreground hover:bg-secondary flex h-7 w-7 items-center justify-center rounded-md transition-colors"
          >
            <Code className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Add link"
            title="Add link"
            onClick={() => {
              const selection = window.getSelection();
              const existing = selection?.anchorNode?.parentElement
                ?.closest("a")
                ?.getAttribute("href");
              setLinkPrompt({ open: true, url: existing ?? "" });
            }}
            className="text-popover-foreground hover:bg-secondary flex h-7 w-7 items-center justify-center rounded-md transition-colors"
          >
            <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {linkPrompt.open && (
        <div
          className="border-border bg-popover absolute z-30 flex items-center gap-1.5 rounded-lg border p-1.5 shadow-lg"
          style={{ top: toolbarState?.top ?? -42, left: toolbarState?.left ?? 0 }}
          onMouseDown={(event) => event.preventDefault()}
        >
          <input
            type="url"
            autoFocus
            value={linkPrompt.url}
            onChange={(event) =>
              setLinkPrompt((current) => ({ ...current, url: event.target.value }))
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                applyLink();
              } else if (event.key === "Escape") {
                setLinkPrompt({ open: false, url: "" });
              }
            }}
            placeholder="https://…"
            className="border-border bg-background h-7 w-56 rounded-md border px-2 text-[12px] outline-none"
          />
          <button
            type="button"
            onClick={applyLink}
            className="bg-primary text-primary-foreground h-7 rounded-md px-2.5 text-[11.5px] font-semibold"
          >
            Link
          </button>
        </div>
      )}

      <div
        ref={ref}
        id={fieldId}
        role="textbox"
        aria-label={ariaLabel}
        aria-multiline={multiline}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={emit}
        onBlur={emit}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !multiline && !event.shiftKey) {
            event.preventDefault();
            onEnter?.();
          }
          if (
            event.key === "Backspace" &&
            onEmptyBackspace &&
            ref.current &&
            // innerText, not innerHTML: an "empty" field may still hold a <br> the browser left.
            ref.current.innerText.trim() === ""
          ) {
            event.preventDefault();
            onEmptyBackspace();
          }
        }}
        onPaste={(event) => {
          // Paste as plain text. Pasting from Word or a web page otherwise drags in a mess of
          // styles and tags that the sanitiser would strip anyway — better to never insert them.
          event.preventDefault();
          const text = event.clipboardData.getData("text/plain");
          exec("insertText", text);
        }}
        className={cn(
          "focus:ring-primary/15 focus:border-primary min-h-[1.5em] rounded-md outline-none focus:ring-2",
          "data-[placeholder]:empty:before:text-muted-foreground/50 data-[placeholder]:empty:before:content-[attr(data-placeholder)]",
          className,
        )}
      />
    </div>
  );
}
