"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { COLLECTION_ORDER } from "@/data/categories";
import { CATALOG_TAG } from "@/data/store";
import { requireAdmin } from "@/lib/admin/auth";
import { bool, dateTime, dbMessage, int, list, moneyField, text, type FormState } from "@/lib/admin/form";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";

const KINDS = ["percent", "amount", "note"];
const SCOPES = ["all", "collection", "category", "products"];
/** The longest label that fits beside the wishlist heart on a phone's product card. */
const BADGE_MAX = 18;

/** Create or update an offer. */
export async function saveOffer(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const pool = db();
  if (!pool) return { error: "The database is not connected." };

  const id = int(form, "id");
  const name = text(form, "name", 80);
  const kind = text(form, "kind", 10);
  const scope = text(form, "scope", 12);
  // An amount off is read like a price ("2,000", "৳2,000"); a percentage as a whole number ("15" or "15%").
  const amount = kind === "amount" ? moneyField(form, "value", "amount off", "2000") : null;
  if (amount?.error !== undefined) return { error: amount.error };
  const value = kind === "note" ? 0 : kind === "amount" ? (amount?.value ?? null) : int(form, "value");
  const badge = text(form, "badge", 60);
  const startsAt = dateTime(form, "startsAt");
  const endsAt = dateTime(form, "endsAt");
  // Each "applies to" choice has its own picker; only the chosen one counts.
  const targets =
    scope === "collection"
      ? list(form, "departments", 4).filter((k) => (COLLECTION_ORDER as string[]).includes(k))
      : scope === "category"
        ? list(form, "categories", 200)
        : scope === "products"
          ? list(form, "products", 500)
          : [];

  if (name.length < 2) return { error: "Give the offer a name. Visitors see it on the product page, for example “Eid offer”." };
  if (!KINDS.includes(kind)) return { error: "Choose the kind of offer: a percentage off, an amount off, or a label only." };
  if (kind === "percent" && (value === null || value < 1 || value > 90)) return { error: "The percentage off must be a whole number from 1 to 90." };
  if (kind === "amount" && (value === null || value <= 0)) return { error: "Enter how many taka to take off, for example 2000." };
  if (kind === "note" && !badge) return { error: "A label-only offer needs its label: type a few words in “Label on cards”, for example “Free alterations”." };
  if (badge.length > BADGE_MAX) return { error: `Keep the label on cards to ${BADGE_MAX} letters or fewer, so it fits on a phone. “${badge}” has ${badge.length}.` };
  if (!SCOPES.includes(scope)) return { error: "Choose what the offer applies to." };
  if (scope === "collection" && !targets.length) return { error: "Choose at least one department." };
  if (scope === "category" && !targets.length) return { error: "Choose at least one category." };
  if (scope === "products" && !targets.length) return { error: "Choose at least one piece." };
  if (text(form, "startsAt", 40) && !startsAt) return { error: "The “show from” date is not a valid date." };
  if (text(form, "endsAt", 40) && !endsAt) return { error: "The “show until” date is not a valid date." };
  if (startsAt && endsAt && endsAt <= startsAt) return { error: "“Show until” must be later than “show from”." };

  try {
    if (kind === "amount" && value !== null) {
      // Never let an amount off take a piece down to nothing.
      const cheapest = await cheapestPiece(scope, targets);
      if (cheapest && cheapest.price <= value) {
        const instead = scope === "products" ? "or leave that piece out" : "or apply the offer to fewer pieces (for example “Chosen pieces”)";
        return {
          error: `${formatPrice(value)} off is as much as the price of “${cheapest.name}” (${formatPrice(cheapest.price)}). Choose a smaller amount, ${instead}.`,
        };
      }
    }

    const values = [name, kind, value ?? 0, scope, JSON.stringify(targets), badge, startsAt, endsAt, bool(form, "active")];
    if (id) {
      const { rowCount } = await pool.query(
        `UPDATE offers SET name=$1, kind=$2, value=$3, scope=$4, targets=$5::jsonb, badge=$6, starts_at=$7, ends_at=$8, active=$9, updated_at=now() WHERE id=$10`,
        [...values, id],
      );
      if (!rowCount) return { error: "This offer no longer exists." };
    } else {
      await pool.query(
        `INSERT INTO offers (name, kind, value, scope, targets, badge, starts_at, ends_at, active) VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9)`,
        values,
      );
    }
  } catch (error) {
    return { error: dbMessage(error) };
  }
  updateTag(CATALOG_TAG);
  // An offer saved with an end date already past is kept but never shows: say so on the list.
  redirect(`/admin/offers?saved=1${endsAt && Date.parse(endsAt) <= Date.now() ? "&ended=1" : ""}`);
}

/** The lowest-priced piece an offer would reach (pieces without a price are left alone). */
async function cheapestPiece(scope: string, targets: string[]): Promise<{ name: string; price: number } | null> {
  const where =
    scope === "collection"
      ? "p.category IN (SELECT key FROM categories WHERE collection = ANY($1::text[]))"
      : scope === "category"
        ? "p.category = ANY($1::text[])"
        : scope === "products"
          ? "p.slug = ANY($1::text[])"
          : "$1::text[] IS NOT NULL";
  const { rows } = await db()!.query(`SELECT p.name, p.price FROM products p WHERE p.price IS NOT NULL AND ${where} ORDER BY p.price LIMIT 1`, [targets]);
  return rows[0] ? { name: rows[0].name as string, price: rows[0].price as number } : null;
}

export async function deleteOffer(form: FormData): Promise<void> {
  await requireAdmin();
  await db()?.query("DELETE FROM offers WHERE id = $1", [int(form, "id")]);
  updateTag(CATALOG_TAG);
  redirect("/admin/offers?deleted=1");
}

/** Switch an offer on or off without opening it. */
export async function setOfferActive(form: FormData): Promise<void> {
  await requireAdmin();
  await db()?.query("UPDATE offers SET active = $2, updated_at = now() WHERE id = $1", [int(form, "id"), bool(form, "active")]);
  updateTag(CATALOG_TAG);
}
