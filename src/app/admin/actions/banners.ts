"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { COLLECTION_ORDER } from "@/data/categories";
import { CATALOG_TAG } from "@/data/store";
import { requireAdmin } from "@/lib/admin/auth";
import { bool, dateTime, dbMessage, int, list, text, type FormState } from "@/lib/admin/form";
import { db } from "@/lib/db";

const PLACEMENTS = ["home", "bar"];
const LINK_TYPES = ["none", "product", "category", "collection", "curated", "url"];

/** Create or update a home page banner or an announcement bar notice. */
export async function saveBanner(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const pool = db();
  if (!pool) return { error: "The database is not connected." };

  const id = int(form, "id");
  const placement = text(form, "placement", 10);
  const home = placement === "home";
  const title = text(form, "title", home ? 160 : 140);
  const rawType = text(form, "linkType", 20);
  const linkType = LINK_TYPES.includes(rawType) ? rawType : "none";
  const linkTarget = linkType === "none" ? "" : text(form, "linkTarget", 500);
  const startsAt = dateTime(form, "startsAt");
  const endsAt = dateTime(form, "endsAt");

  if (!PLACEMENTS.includes(placement)) return { error: "Choose where it appears: the home page or the announcement bar." };
  if (title.length < 2) return { error: home ? "Write the banner's heading." : "Write the message for the announcement bar." };
  if (linkType !== "none" && !linkTarget) return { error: "Choose where it leads, or pick “Nowhere”." };
  if (linkType === "url" && !/^(\/(?!\/)\S*|https:\/\/[^\s/]+\S*)$/.test(linkTarget)) {
    return { error: "A web address must start with “/” for a page on this website (for example /bespoke), or with “https://” for another website." };
  }
  if (text(form, "startsAt", 40) && !startsAt) return { error: "The “show from” date is not a valid date." };
  if (text(form, "endsAt", 40) && !endsAt) return { error: "The “show until” date is not a valid date." };
  if (startsAt && endsAt && endsAt <= startsAt) return { error: "“Show until” must be later than “show from”." };

  try {
    if (linkType !== "none" && linkType !== "url" && !(await destinationExists(linkType, linkTarget))) {
      return { error: "The place it leads to no longer exists. Choose another." };
    }

    const values = [
      placement,
      title,
      home ? text(form, "eyebrow", 80) : "",
      home ? text(form, "body", 600) : "",
      text(form, "cta", 40),
      home ? (list(form, "image", 1)[0] ?? null) : null,
      linkType,
      linkTarget,
      startsAt,
      endsAt,
      bool(form, "active"),
    ];

    if (id) {
      // A banner moved to the other place goes to the end of that list.
      const { rowCount } = await pool.query(
        `UPDATE banners SET
           position = CASE WHEN placement = $1 THEN position ELSE (SELECT coalesce(max(position), 0) + 1 FROM banners WHERE placement = $1) END,
           placement=$1, title=$2, eyebrow=$3, body=$4, cta=$5, image=$6, link_type=$7, link_target=$8, starts_at=$9, ends_at=$10, active=$11, updated_at=now()
         WHERE id=$12`,
        [...values, id],
      );
      if (!rowCount) return { error: "This banner no longer exists." };
    } else {
      await pool.query(
        `INSERT INTO banners (placement, title, eyebrow, body, cta, image, link_type, link_target, starts_at, ends_at, active, position)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, (SELECT coalesce(max(position), 0) + 1 FROM banners WHERE placement = $1))`,
        values,
      );
    }
  } catch (error) {
    return { error: dbMessage(error) };
  }
  updateTag(CATALOG_TAG);
  redirect(`/admin/banners?saved=${placement}`);
}

async function destinationExists(type: string, target: string): Promise<boolean> {
  if (type === "collection") return (COLLECTION_ORDER as string[]).includes(target);
  const sql =
    type === "product"
      ? "SELECT 1 FROM products WHERE slug = $1"
      : type === "category"
        ? "SELECT 1 FROM categories WHERE key = $1"
        : type === "curated"
          ? "SELECT 1 FROM curated WHERE slug = $1"
          : null;
  if (!sql) return false;
  const { rowCount } = await db()!.query(sql, [target]);
  return Boolean(rowCount);
}

export async function deleteBanner(form: FormData): Promise<void> {
  await requireAdmin();
  await db()?.query("DELETE FROM banners WHERE id = $1", [int(form, "id")]);
  updateTag(CATALOG_TAG);
  redirect("/admin/banners?deleted=1");
}

/** Switch a banner or notice on or off without opening it. */
export async function setBannerActive(form: FormData): Promise<void> {
  await requireAdmin();
  await db()?.query("UPDATE banners SET active = $2, updated_at = now() WHERE id = $1", [int(form, "id"), bool(form, "active")]);
  updateTag(CATALOG_TAG);
}

/** Move a banner up or down among the others in the same place. */
export async function moveBanner(form: FormData): Promise<void> {
  await requireAdmin();
  const pool = db();
  if (!pool) return;
  const id = int(form, "id");
  const direction = text(form, "direction", 4) === "up" ? -1 : 1;
  const { rows } = await pool.query("SELECT id FROM banners WHERE placement = (SELECT placement FROM banners WHERE id = $1) ORDER BY position, id", [id]);
  const order = rows.map((r) => Number(r.id));
  const i = order.indexOf(id ?? -1);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= order.length) return;
  [order[i], order[j]] = [order[j], order[i]];
  await pool.query("UPDATE banners b SET position = o.n FROM unnest($1::bigint[]) WITH ORDINALITY AS o(id, n) WHERE b.id = o.id", [order]);
  updateTag(CATALOG_TAG);
}
