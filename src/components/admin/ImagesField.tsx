"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { LibraryImage } from "@/lib/admin/data";
import { cn } from "@/lib/cn";
import { buttonStyles, inputClass } from "./ui";

/**
 * Photographs for a product, category, banner or collection: upload new ones
 * (they are resized in the browser, then processed and stored in Cloudflare R2),
 * or choose from the photographs already on the site; reorder; remove.
 * Posts the chosen ids as a JSON list in a hidden field.
 */
export function ImagesField({
  name,
  initial,
  library,
  max = 30,
  uploads = true,
  emptyHint,
}: {
  name: string;
  initial: LibraryImage[];
  library: LibraryImage[];
  max?: number;
  uploads?: boolean;
  emptyHint?: string;
}) {
  const [items, setItems] = useState<LibraryImage[]>(initial);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const full = items.length >= max;

  const move = (i: number, d: number) =>
    setItems((list) => {
      const next = [...list];
      const j = i + d;
      if (j < 0 || j >= next.length) return list;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const chosen = Array.from(files).slice(0, Math.max(0, max - items.length));
    setBusy((b) => b + chosen.length);
    for (const file of chosen) {
      try {
        const body = new FormData();
        body.append("file", await shrink(file), file.name.replace(/\.[^.]+$/, "") + ".jpg");
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const json = (await res.json().catch(() => ({}))) as { id?: string; src?: string; error?: string };
        if (!res.ok || !json.id || !json.src) throw new Error(json.error || "Upload failed.");
        setItems((list) => (list.length >= max ? list : [...list, { id: json.id!, src: json.src!, label: file.name }]));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed.");
      } finally {
        setBusy((b) => b - 1);
      }
    }
    if (fileInput.current) fileInput.current.value = "";
  }

  return (
    <div data-images-field>
      <input type="hidden" name={name} value={JSON.stringify(items.map((i) => i.id))} />
      {items.length ? (
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item, i) => (
            <li key={item.id} className="border border-line bg-white">
              <div className="relative aspect-[4/5] bg-paper">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.src} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                {i === 0 && max > 1 ? <span className="absolute top-2 left-2 bg-ink px-2 py-1 text-[10.5px] tracking-[0.06em] text-white">MAIN</span> : null}
              </div>
              <div className="flex items-center justify-between gap-1 p-1.5">
                {max > 1 ? (
                  <div className="flex">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="grid h-8 w-8 place-items-center text-ink-2 hover:text-ink disabled:opacity-25" aria-label={`Move photograph ${i + 1} earlier`} title="Move earlier">
                      ←
                    </button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="grid h-8 w-8 place-items-center text-ink-2 hover:text-ink disabled:opacity-25" aria-label={`Move photograph ${i + 1} later`} title="Move later">
                      →
                    </button>
                  </div>
                ) : (
                  <span />
                )}
                <button type="button" onClick={() => setItems((list) => list.filter((x) => x.id !== item.id))} className="h-8 px-2 text-[12.5px] text-accent hover:underline" aria-label={max > 1 ? `Remove photograph ${i + 1}` : "Remove the photograph"}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="border border-dashed border-line bg-white px-4 py-6 text-center text-[13.5px] text-ink-3">{emptyHint ?? "No photographs yet."}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {uploads ? (
          <>
            {/* The file box is hidden and its label is the button, so the label shows the keyboard focus. */}
            <input ref={fileInput} type="file" accept="image/*" multiple={max > 1} className="peer sr-only" id={`${name}-upload`} onChange={(e) => upload(e.target.files)} disabled={full || busy > 0} />
            <label
              htmlFor={`${name}-upload`}
              className={cn(buttonStyles.secondary, "cursor-pointer peer-focus-visible:border-ink peer-focus-visible:outline-[1.5px] peer-focus-visible:outline-offset-3 peer-focus-visible:outline-ink peer-focus-visible:outline-solid", (full || busy > 0) && "pointer-events-none opacity-50")}
            >
              {busy > 0 ? `Uploading ${busy}…` : max > 1 ? "Upload photographs" : "Upload a photograph"}
            </label>
          </>
        ) : null}
        <button type="button" ref={opener} className={buttonStyles.secondary} onClick={() => setPicking(true)} disabled={full} aria-haspopup="dialog">
          Choose from the site&apos;s photographs
        </button>
        {max > 1 ? <span className="text-[12.5px] text-ink-3">The first photograph is the main one. Use the arrows to reorder.</span> : null}
      </div>
      {error ? <p className="mt-2 text-[13px] text-accent">{error}</p> : null}

      {picking ? (
        <Library
          library={library}
          chosen={new Set(items.map((i) => i.id))}
          opener={opener}
          onClose={() => setPicking(false)}
          onPick={(img) => {
            setItems((list) => (list.length >= max || list.some((x) => x.id === img.id) ? list : [...list, img]));
            if (max === 1 || items.length + 1 >= max) setPicking(false);
          }}
        />
      ) : null}
    </div>
  );
}

/**
 * The photo library, as a modal dialog (the browser's own <dialog>): Escape or
 * Done closes it, a tap outside closes it, the keyboard stays inside it while
 * open, and focus goes back to the "Choose from…" button afterwards.
 * Enter in its search box never sends the form behind it.
 */
function Library({
  library,
  chosen,
  opener,
  onPick,
  onClose,
}: {
  library: LibraryImage[];
  chosen: Set<string>;
  opener: RefObject<HTMLButtonElement | null>;
  onPick: (img: LibraryImage) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(60);
  const dialog = useRef<HTMLDialogElement>(null);
  const shown = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    return library.filter((img) => terms.every((t) => (img.label + " " + img.id).toLowerCase().includes(t)));
  }, [library, q]);

  useEffect(() => {
    const d = dialog.current;
    const back = opener.current;
    if (d && !d.open) d.showModal();
    return () => {
      if (d?.open) d.close();
      // The opener is disabled when the last free place was just filled: then focus the new photograph's Remove button.
      if (back && !back.disabled) back.focus();
      else back?.closest("[data-images-field]")?.querySelector<HTMLElement>("ol > li:last-child button[aria-label^='Remove']")?.focus();
    };
  }, [opener]);

  return (
    <dialog
      ref={dialog}
      aria-label="Choose a photograph"
      // Escape: the browser closes the dialog; the form behind keeps what was chosen.
      // (A close event can also arrive late from an earlier close() while the dialog is open again: ignore that one.)
      onClose={() => {
        if (!dialog.current?.open) onClose();
      }}
      // A tap on the dimmed area outside the panel closes it.
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="mx-auto mt-auto mb-0 max-h-[88dvh] w-full max-w-5xl border-0 bg-white p-0 text-ink backdrop:bg-[rgba(28,27,23,0.4)] open:flex open:flex-col sm:mb-auto"
    >
      <div className="flex items-center gap-3 border-b border-line p-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            // Enter only searches (the results already follow the typing); it must not send the form behind.
            if (e.key === "Enter") e.preventDefault();
          }}
          enterKeyHint="search"
          type="search"
          autoComplete="off"
          placeholder="Search: sherwani, navy, achkan, shirt…"
          aria-label="Search the photographs"
          className={inputClass}
        />
        <button type="button" onClick={onClose} className={buttonStyles.secondary}>
          Done
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
        <p className="mb-3 text-[12.5px] text-ink-3" aria-live="polite">
          {shown.length === 0 ? `No photographs match “${q.trim()}”.` : `${shown.length} ${shown.length === 1 ? "photograph" : "photographs"}. Tap one to add it.`}
        </p>
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {shown.slice(0, limit).map((img) => (
            <li key={img.id} className="min-w-0">
              <button type="button" onClick={() => onPick(img)} disabled={chosen.has(img.id)} className="group block w-full text-left disabled:opacity-35" title={img.label}>
                <span className="relative block aspect-[4/5] bg-paper">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-opacity group-hover:opacity-80" />
                </span>
                <span className="mt-1 block truncate text-[11px] text-ink-3">
                  {img.label}
                  {chosen.has(img.id) ? <span className="sr-only"> (already chosen)</span> : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {shown.length > limit ? (
          <div className="mt-4 text-center">
            <button type="button" className={buttonStyles.secondary} onClick={() => setLimit((l) => l + 120)}>
              Show more
            </button>
          </div>
        ) : null}
      </div>
    </dialog>
  );
}

/** Resize a photo in the browser (longest side 2400 px, JPEG) so uploads stay small and fast. */
async function shrink(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 3_500_000 && file.type === "image/jpeg") return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.9));
  } catch {
    return file;
  }
}
