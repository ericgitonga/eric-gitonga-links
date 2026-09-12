// Nightly Vercel Cron job (see vercel.json) that crawls Angry Hosting over
// FTP(S) for the Daguerreotypes/Dudus media, and republishes a manifest to
// Vercel Blob for the gallery pages to read via /api/media-manifest.
//
// Folder convention on Angry Hosting (one level of albums, no further
// nesting): <ANGRYHOSTING_FTP_BASE_PATH>/Daguerreotypes/<album>/<image> and
// .../Dudus/<album>/<image>. An optional cover.<ext> file per album sets its
// grid thumbnail; otherwise the first image alphabetically is used.
//
// Requires env vars: ANGRYHOSTING_FTP_HOST, ANGRYHOSTING_FTP_USER,
// ANGRYHOSTING_FTP_PASSWORD, MEDIA_BASE_URL, CRON_SECRET. Optional:
// ANGRYHOSTING_FTP_BASE_PATH (default ""), ANGRYHOSTING_FTP_SECURE
// (default "true" — set to "false" only if the account can't do FTPS).

import { Client } from "basic-ftp";
import { put } from "@vercel/blob";

const PLATES = ["Daguerreotypes", "Dudus"];
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function isImage(filename) {
  const dot = filename.lastIndexOf(".");
  if (dot === -1) return false;
  return IMAGE_EXTENSIONS.has(filename.slice(dot).toLowerCase());
}

function isCover(filename) {
  const dot = filename.lastIndexOf(".");
  const base = dot === -1 ? filename : filename.slice(0, dot);
  return base.toLowerCase() === "cover";
}

function titleCase(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function imageUrl(basePath, plate, album, filename) {
  return `${process.env.MEDIA_BASE_URL}/${plate}/${encodeURIComponent(album)}/${encodeURIComponent(filename)}`;
}

async function listAlbums(client, basePath, plate) {
  const plateDir = basePath ? `${basePath}/${plate}` : plate;
  const albumDirs = (await client.list(plateDir)).filter((e) => e.isDirectory);
  const albums = [];

  for (const dir of albumDirs) {
    const albumDir = `${plateDir}/${dir.name}`;
    const files = (await client.list(albumDir)).filter(
      (e) => e.isFile && isImage(e.name),
    );

    const cover = files.find((e) => isCover(e.name));
    const images = files
      .filter((e) => e !== cover)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((e) => ({
        filename: e.name,
        url: imageUrl(basePath, plate, dir.name, e.name),
      }));

    if (images.length === 0) continue;

    albums.push({
      slug: dir.name,
      title: titleCase(dir.name),
      cover: cover
        ? imageUrl(basePath, plate, dir.name, cover.name)
        : images[0].url,
      images,
    });
  }

  return albums.sort((a, b) => a.slug.localeCompare(b.slug));
}

export default async function handler(req, res) {
  if (
    process.env.CRON_SECRET &&
    req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const required = [
    "ANGRYHOSTING_FTP_HOST",
    "ANGRYHOSTING_FTP_USER",
    "ANGRYHOSTING_FTP_PASSWORD",
    "MEDIA_BASE_URL",
  ];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) {
    console.error("Missing env vars:", missing.join(", "));
    res.status(500).json({ error: `Missing env vars: ${missing.join(", ")}` });
    return;
  }

  const basePath = (process.env.ANGRYHOSTING_FTP_BASE_PATH || "").replace(/\/+$/, "");
  const client = new Client();

  try {
    await client.access({
      host: process.env.ANGRYHOSTING_FTP_HOST,
      user: process.env.ANGRYHOSTING_FTP_USER,
      password: process.env.ANGRYHOSTING_FTP_PASSWORD,
      secure: process.env.ANGRYHOSTING_FTP_SECURE !== "false",
    });

    const plates = {};
    for (const plate of PLATES) {
      plates[plate.toLowerCase()] = await listAlbums(client, basePath, plate);
    }

    const manifest = { generatedAt: new Date().toISOString(), plates };

    const blob = await put("media-manifest.json", JSON.stringify(manifest), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });

    res.status(200).json({
      ok: true,
      url: blob.url,
      albumCounts: Object.fromEntries(
        Object.entries(plates).map(([plate, albums]) => [plate, albums.length]),
      ),
    });
  } catch (err) {
    console.error("Media sync failed:", err);
    res.status(502).json({ error: "Media sync failed", detail: String(err) });
  } finally {
    client.close();
  }
}
