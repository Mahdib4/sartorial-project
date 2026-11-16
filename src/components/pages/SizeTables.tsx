"use client";

import { Tabs } from "@/components/interior/tabs";
import { SIZE_SCALES, type SizeScale } from "@/config/site";

const TABS: Array<{ value: string; label: string; scale: SizeScale; how: string }> = [
  { value: "tailoring", label: "Jackets and suits", scale: SIZE_SCALES.tailoring, how: "Measure around the fullest part of the chest, under the arms, with the tape level." },
  { value: "shirts", label: "Shirts", scale: SIZE_SCALES.shirts, how: "Measure around the base of the neck where a collar sits, with one finger between tape and skin." },
  { value: "trousers", label: "Trousers", scale: SIZE_SCALES.trousers, how: "Measure around your natural waist, where your trousers sit, without pulling the tape tight." },
];

const toCm = (inches: string) => Math.round(Number(inches) * 2.54);

/** The size scales offered on the site, one tab per kind of garment. */
export function SizeTables() {
  return (
    <Tabs
      label="Size scales"
      items={TABS.map((t) => ({ value: t.value, label: t.label }))}
      defaultValue="tailoring"
      classNames={{ panel: "pt-8" }}
      renderPanel={(value) => {
        const tab = TABS.find((t) => t.value === value) ?? TABS[0];
        return (
          <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
            <table className="w-full border-collapse text-left text-[14px]">
              <caption className="sr-only">{tab.label}: sizes offered</caption>
              <thead>
                <tr className="border-b border-ink">
                  <th scope="col" className="label py-3 pr-6 font-normal">
                    {tab.scale.label}
                  </th>
                  <th scope="col" className="label py-3 font-normal">
                    Centimetres
                  </th>
                </tr>
              </thead>
              <tbody>
                {tab.scale.sizes.map((size) => (
                  <tr key={size} className="border-b border-line">
                    <td className="py-3 pr-6 tabular-nums">{size}</td>
                    <td className="py-3 text-ink-3 tabular-nums">{toCm(size)} cm</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-[14.5px] leading-relaxed text-ink-2">
              <p className="label mb-3 text-ink-3">How to measure</p>
              <p>{tab.how}</p>
              <p className="mt-4">{tab.scale.hint}</p>
              <p className="mt-4">Between sizes, or unsure? Choose “Made to measure” on the product page and we will take your measurements at a fitting.</p>
            </div>
          </div>
        );
      }}
    />
  );
}
