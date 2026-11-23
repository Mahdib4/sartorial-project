"use client";

import { useState } from "react";
import { saveCategory } from "@/app/admin/actions/categories";
import type { Category, CollectionKey, SizeScaleKey } from "@/data/types";
import type { LibraryImage } from "@/lib/admin/data";
import { slugify } from "@/lib/admin/form";
import { ActionForm } from "./ActionForm";
import { ImagesField } from "./ImagesField";
import { Card, Field, Input, Select, Textarea, Toggle } from "./ui";

/** A department as the form needs it: its name and where its pages live on the website. */
export type DepartmentOption = { key: CollectionKey; name: string; href: string };

const SIZE_SCALES: Array<{ value: SizeScaleKey; label: string }> = [
  { value: "tailoring", label: "Jackets & coats (chest size)" },
  { value: "shirts", label: "Shirts (collar size)" },
  { value: "trousers", label: "Trousers (waist size)" },
  { value: "footwear", label: "Shoes (UK size)" },
  { value: "one", label: "One size" },
];

/** A sensible size scale for a new category in this department. */
function sizesFor(department: CollectionKey): SizeScaleKey {
  return department === "footwear" ? "footwear" : department === "accessories" ? "one" : "tailoring";
}

export function CategoryForm({
  category,
  preview,
  library,
  departments,
  defaultDepartment,
}: {
  category: Category | null;
  preview: LibraryImage[];
  library: LibraryImage[];
  departments: DepartmentOption[];
  defaultDepartment?: CollectionKey;
}) {
  const c = category;
  const [department, setDepartment] = useState<CollectionKey>(c?.collection ?? defaultDepartment ?? "heritage");
  const [sizes, setSizes] = useState<SizeScaleKey>(c?.sizes ?? sizesFor(department));
  const [sizesChosen, setSizesChosen] = useState(Boolean(c));
  const [name, setName] = useState(c?.name ?? "");
  const dept = departments.find((d) => d.key === department) ?? departments[0];

  return (
    <ActionForm action={saveCategory} submitLabel={c ? "Save changes" : "Add category"}>
      {c ? <input type="hidden" name="original" value={c.key} /> : null}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card
            title="Hover photographs"
            intro="Shown when visitors hover over the category on the home page and in the menu. The first is also the photograph at the top of the category page. Up to six."
          >
            <ImagesField name="preview" initial={preview} library={library} max={6} emptyHint="No photographs yet. Add at least one." />
          </Card>

          <Card title="About the category">
            <Field label="Name" htmlFor="name" hint="As it appears in the menu, e.g. “Sherwanis”.">
              <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} placeholder="e.g. Waistcoats" />
            </Field>
            {!c ? (
              <Field label="Web address" htmlFor="slug" hint="Leave empty to make it from the name. It cannot be changed later.">
                <div className="flex items-center">
                  <span className="max-w-[55%] shrink-0 truncate border border-r-0 border-line bg-paper px-3 py-2.5 text-[13px] text-ink-3">{dept.href}/</span>
                  <Input id="slug" name="slug" placeholder={slugify(name) || "waistcoats"} />
                </div>
              </Field>
            ) : (
              <p className="text-[13px] text-ink-3">
                Web address:{" "}
                <a href={`${dept.href}/${c.slug}`} target="_blank" rel="noreferrer" className="underline">
                  {dept.href}/{c.slug}
                </a>
              </p>
            )}
            <Field label="Short line for menus" htmlFor="blurb" hint="One line shown with the category on the home page and in the menu, e.g. “Raw silk and dupioni, embroidered by hand in zardosi.”">
              <Input id="blurb" name="blurb" defaultValue={c?.blurb} maxLength={200} />
            </Field>
            <Field label="Introduction" htmlFor="intro" hint="The opening paragraph at the top of the category page.">
              <Textarea id="intro" name="intro" defaultValue={c?.intro} rows={5} maxLength={2000} />
            </Field>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Where it appears">
            {!c ? (
              <Field
                label="Department"
                htmlFor="collection"
                hint="Choose carefully: the department and web address cannot be changed later, because products are filed under them. To move a category, add a new one and move its products across."
              >
                <Select
                  id="collection"
                  name="collection"
                  value={department}
                  onChange={(e) => {
                    const next = e.target.value as CollectionKey;
                    setDepartment(next);
                    if (!sizesChosen) setSizes(sizesFor(next));
                  }}
                >
                  {departments.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.name}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : (
              <Field
                label="Department"
                hint="The department and web address cannot be changed, because products are filed under them. To move this category, add a new one in the other department and move its products across."
              >
                <p className="border border-line bg-paper px-3 py-2.5 text-[14.5px] text-ink-2">{dept.name}</p>
              </Field>
            )}
            <Toggle
              name="visible"
              label="Show on the website"
              hint="Turn off to hide the category, and every product in it, without deleting anything."
              defaultChecked={c ? c.visible !== false : true}
            />
          </Card>

          <Card title="Sizes" intro="The size choices customers see on its products.">
            <Field label="Size scale" htmlFor="sizes">
              <Select
                id="sizes"
                name="sizes"
                value={sizes}
                onChange={(e) => {
                  setSizes(e.target.value as SizeScaleKey);
                  setSizesChosen(true);
                }}
              >
                {SIZE_SCALES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </Field>
          </Card>
        </div>
      </div>
    </ActionForm>
  );
}
