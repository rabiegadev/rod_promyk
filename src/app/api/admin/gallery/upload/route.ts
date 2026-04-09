import { put } from "@vercel/blob";

import { auth } from "@/auth";
import { forbidden, isAdmin, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const MAX_UPLOAD_SIZE_BYTES = 8 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!isAdmin(session)) return forbidden();

  const formData = await req.formData();
  const file = formData.get("file");
  const captionRaw = formData.get("caption");
  const sortOrderRaw = formData.get("sortOrder");

  if (!(file instanceof File)) {
    return Response.json({ error: "Brak pliku w żądaniu." }, { status: 400 });
  }

  if (file.size <= 0) {
    return Response.json({ error: "Pusty plik." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return Response.json({ error: "Plik jest za duży (max 8 MB)." }, { status: 413 });
  }
  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "Dozwolone są tylko obrazy." }, { status: 400 });
  }

  const normalizedName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-");

  const key = `gallery/${Date.now()}-${normalizedName || "image"}`;
  let uploaded: { url: string };
  try {
    uploaded = await put(key, file, {
      access: "public",
      addRandomSuffix: true,
    });
  } catch {
    return Response.json(
      { error: "Upload do Blob nie powiódł się. Sprawdź BLOB_READ_WRITE_TOKEN w zmiennych środowiska." },
      { status: 500 },
    );
  }

  const caption = typeof captionRaw === "string" && captionRaw.trim() ? captionRaw.trim().slice(0, 500) : null;
  const parsedSort = typeof sortOrderRaw === "string" ? Number(sortOrderRaw) : Number.NaN;

  const item = await prisma.galleryItem.create({
    data: {
      imageUrl: uploaded.url,
      caption,
      sortOrder: Number.isFinite(parsedSort) ? Math.trunc(parsedSort) : 0,
      createdById: session.user.id,
    },
  });

  return Response.json({ item });
}
