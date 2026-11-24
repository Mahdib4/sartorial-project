import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/admin/auth";
import { ImageTooLarge, storeUpload } from "@/lib/admin/images";
import { uploadUrl } from "@/lib/media";
import { r2 } from "@/lib/r2";

/**
 * True when the upload was sent by a page of this website (the admin), not by
 * another site posting with the admin's cookie. Like Next's own check on server
 * actions: the page's address (Origin, or Referer when there is none) must be on
 * the host the request was made to (x-forwarded-host behind Vercel's proxy).
 */
function fromThisSite(request: Request): boolean {
  const h = request.headers;
  const origin = h.get("origin");
  const source = origin && origin !== "null" ? origin : h.get("referer");
  let sourceHost: string;
  try {
    sourceHost = new URL(source ?? "").host;
  } catch {
    return false;
  }
  const forwardedHost = h.get("x-forwarded-host")?.split(",")[0]?.trim();
  return Boolean(sourceHost) && (sourceHost === forwardedHost || sourceHost === h.get("host"));
}

/**
 * Photograph upload for the admin. The browser shrinks the photo before sending
 * it (see components/admin/ImagesField.tsx), so requests stay small; the server
 * makes the web renditions and stores them in Cloudflare R2.
 */
export async function POST(request: Request) {
  if (!fromThisSite(request)) {
    return NextResponse.json({ error: "The photograph could not be sent from this page. Reload the admin and try again." }, { status: 403 });
  }
  if (!(await verifySession((await cookies()).get(SESSION_COOKIE)?.value))) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }
  if (!r2()) return NextResponse.json({ error: "Photo storage (Cloudflare R2) is not set up on the server." }, { status: 503 });

  let file: File | null = null;
  try {
    const form = await request.formData();
    const f = form.get("file");
    file = f instanceof File ? f : null;
  } catch {
    // fall through
  }
  if (!file) return NextResponse.json({ error: "No photograph was received." }, { status: 400 });
  if (file.size > 12 * 1024 * 1024) return NextResponse.json({ error: "That photograph is too large (12 MB at most)." }, { status: 413 });
  if (!/^image\//.test(file.type)) return NextResponse.json({ error: "Only photographs can be uploaded." }, { status: 415 });

  try {
    const record = await storeUpload(Buffer.from(await file.arrayBuffer()), file.name);
    return NextResponse.json({ id: record.id, src: uploadUrl(record.id, record.widths.find((w) => w >= 480) ?? record.widths[0]) }, { status: 201 });
  } catch (error) {
    if (error instanceof ImageTooLarge) return NextResponse.json({ error: error.message }, { status: 413 });
    console.error("upload failed", error);
    return NextResponse.json({ error: "The photograph could not be processed. Try a JPEG or PNG." }, { status: 500 });
  }
}
