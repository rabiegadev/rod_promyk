import { put } from "@vercel/blob";
import { DocumentKind } from "@prisma/client";

import { auth } from "@/auth";
import { forbidden, isAdmin, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const MAX_UPLOAD_SIZE_BYTES = 12 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!isAdmin(session)) return forbidden();

  const formData = await req.formData();
  const titleRaw = formData.get("title");
  const kindRaw = formData.get("kind");
  const contentRaw = formData.get("content");
  const sortOrderRaw = formData.get("sortOrder");
  const file = formData.get("file");

  const title = typeof titleRaw === "string" ? titleRaw.trim() : "";
  const content = typeof contentRaw === "string" ? contentRaw.trim() : "";
  const parsedSort = typeof sortOrderRaw === "string" ? Number(sortOrderRaw) : Number.NaN;

  if (!title) {
    return Response.json({ error: "Podaj tytuł dokumentu." }, { status: 400 });
  }

  const kind = Object.values(DocumentKind).includes(kindRaw as DocumentKind) ? (kindRaw as DocumentKind) : DocumentKind.OTHER;

  let fileUrl: string | null = null;
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return Response.json({ error: "Plik jest za duży (max 12 MB)." }, { status: 413 });
    }
    const normalizedName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]+/g, "-")
      .replace(/-+/g, "-");
    const key = `documents/${Date.now()}-${normalizedName || "document"}`;
    try {
      const uploaded = await put(key, file, {
        access: "public",
        addRandomSuffix: true,
      });
      fileUrl = uploaded.url;
    } catch {
      return Response.json(
        { error: "Upload dokumentu do Blob nie powiódł się. Sprawdź BLOB_READ_WRITE_TOKEN." },
        { status: 500 },
      );
    }
  }

  if (!fileUrl && !content) {
    return Response.json({ error: "Dodaj plik lub treść dokumentu." }, { status: 400 });
  }

  const created = await prisma.document.create({
    data: {
      title: title.slice(0, 250),
      kind,
      fileUrl,
      content: content ? content.slice(0, 50_000) : null,
      sortOrder: Number.isFinite(parsedSort) ? Math.trunc(parsedSort) : 0,
    },
  });

  return Response.json({ document: created });
}
