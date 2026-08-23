/**
 * The desktop / mobile preview.
 *
 * Renders the *same* `ArticleView` the public site uses, so what an author sees here is produced by
 * the code that will serve the live page — not a separate approximation that can drift. See
 * `ArticleView` for why that sharing matters.
 *
 * The two viewports are real width constraints (a 390px column for mobile, full for desktop) around
 * that one component, rendered on the dark theme the public blog uses. It reflects unsaved editor
 * state directly, so the workflow the brief asks for — Create → Save Draft → Preview → Publish —
 * works before anything is written to the database.
 */

import { Monitor, Smartphone } from "lucide-react";
import type { ContentAuthor } from "@/lib/cms/types";
import { ArticleView } from "@/components/site/ArticleView";
import { SegmentedControl } from "../primitives";

export type PreviewDevice = "desktop" | "mobile";

export function PreviewPane({
  device,
  onDeviceChange,
  article,
}: {
  device: PreviewDevice;
  onDeviceChange: (device: PreviewDevice) => void;
  article: {
    title: string;
    excerpt: string;
    category: string | null;
    tags: string[];
    coverImageUrl: string | null;
    author: ContentAuthor | null;
    publishedAt: string | null;
    body: unknown;
  };
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-muted-foreground text-[12px] font-semibold">
          Preview — how this appears on enicehq.com
        </p>
        <SegmentedControl
          value={device}
          onChange={onDeviceChange}
          size="sm"
          options={[
            { value: "desktop", label: "Desktop", icon: Monitor },
            { value: "mobile", label: "Mobile", icon: Smartphone },
          ]}
        />
      </div>

      {/* The dark canvas mirrors the public blog's shell. The inner frame is the device width. */}
      <div className="flex-1 overflow-y-auto rounded-xl bg-[#09090b] p-4 sm:p-8">
        <div
          className="mx-auto transition-[max-width] duration-300"
          style={{ maxWidth: device === "mobile" ? 390 : 680 }}
        >
          {device === "mobile" && (
            <div className="mb-3 flex justify-center">
              <span className="h-1 w-16 rounded-full bg-white/20" aria-hidden="true" />
            </div>
          )}
          <ArticleView article={article} theme="dark" backLink={null} showTableOfContents={false} />
        </div>
      </div>
    </div>
  );
}
