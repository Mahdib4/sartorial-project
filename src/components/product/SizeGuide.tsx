"use client";

import { useState } from "react";
import { Modal } from "@/components/interior/modal";
import type { SizeScale } from "@/config/site";

const HOW: Record<string, string[]> = {
  "Chest (in)": ["Measure around the fullest part of the chest, under the arms, with the tape level and one finger of ease.", "If you are between sizes, take the larger; the waist can be taken in at your fitting."],
  "Collar (in)": ["Measure around the base of the neck where a collar sits, with one finger between the tape and the skin.", "Sleeve length is checked at your fitting, or tell us yours when you send your enquiry."],
  "Waist (in)": ["Measure around your natural waist, where your trousers sit, without pulling the tape tight.", "Dress trousers arrive with an unfinished hem so that the length can be set to your inseam."],
  "UK size": ["Shoe sizes are given in UK sizing."],
};

const toCm = (inches: string) => Math.round(Number(inches) * 2.54);

/** A "Size guide" link that opens the scale for this kind of garment and how to take the measurement. */
export function SizeGuide({ scale }: { scale: SizeScale }) {
  const [open, setOpen] = useState(false);
  const inches = scale.label.includes("(in)");

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="-my-3 py-3 pl-3 text-[12.5px] text-ink-3 transition-colors hover:text-ink" aria-haspopup="dialog">
        <span className="link-under inline-block">Size guide</span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Size guide" description={scale.hint || undefined} maxWidth={620} closeLabel="Close size guide">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] border-collapse text-left text-[14px]">
            <caption className="sr-only">Sizes offered for this piece</caption>
            <thead>
              <tr className="border-b border-ink">
                <th scope="col" className="label py-3 pr-6 font-normal">
                  {scale.label}
                </th>
                {inches ? (
                  <th scope="col" className="label py-3 font-normal">
                    Centimetres
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {scale.sizes.map((size) => (
                <tr key={size} className="border-b border-line">
                  <td className="py-3 pr-6 tabular-nums">{size}</td>
                  {inches ? <td className="py-3 text-ink-3 tabular-nums">{toCm(size)} cm</td> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-6 space-y-3 text-[13.5px] leading-relaxed text-ink-2">
          {(HOW[scale.label] ?? []).map((line) => (
            <li key={line}>{line}</li>
          ))}
          {scale.allowBespoke ? <li>Prefer not to choose? Select “Made to measure” and we will take your measurements at a fitting.</li> : null}
        </ul>
      </Modal>
    </>
  );
}
