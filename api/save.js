import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

function safePart(value) {
  return String(value ?? "unknown").replace(/[^a-zA-Z0-9_.-]/g, "_");
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const payload = request.body;
  const sessionId = safePart(payload?.sessionId);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  // Random suffix so a resubmission never collides with an earlier file, even within the same millisecond.
  const fileStem = `${sessionId}_${timestamp}_${randomUUID().slice(0, 8)}`;
  const basePath = [
    "data",
    safePart(payload?.cohort),
    `subj-${safePart(payload?.subject)}`,
    `ses-${safePart(payload?.session)}`,
    "navigate",
    fileStem
  ].join("/");
  const jsonBody = JSON.stringify(payload, null, 2);
  const csvBody = payload?.csv ?? "";

  const blobStoreId = process.env.MENTLASIMJS_BLOB_STORE_ID;
  const blobToken = process.env.MENTLASIMJS_BLOB_READ_WRITE_TOKEN;

  if (blobStoreId || blobToken) {
    const { put } = await import("@vercel/blob");
    const jsonOptions = {
      access: "private",
      contentType: "application/json",
      ...(blobStoreId ? { storeId: blobStoreId } : {}),
      ...(blobToken ? { token: blobToken } : {})
    };
    const csvOptions = {
      access: "private",
      contentType: "text/csv",
      ...(blobStoreId ? { storeId: blobStoreId } : {}),
      ...(blobToken ? { token: blobToken } : {})
    };
    const [jsonBlob, csvBlob] = await Promise.all([
      put(`${basePath}.json`, jsonBody, jsonOptions),
      put(`${basePath}.csv`, csvBody, csvOptions)
    ]);

    response.status(200).json({
      ok: true,
      storage: "vercel-blob",
      access: "private",
      url: jsonBlob.url,
      csvUrl: csvBlob.url
    });
    return;
  }

  const outDir = path.join("/tmp", "navigate-data");
  await mkdir(outDir, { recursive: true });
  const jsonPath = path.join(outDir, `${fileStem}.json`);
  const csvPath = path.join(outDir, `${fileStem}.csv`);
  await Promise.all([
    writeFile(jsonPath, jsonBody),
    writeFile(csvPath, csvBody)
  ]);

  response.status(200).json({
    ok: true,
    storage: "tmp",
    path: jsonPath,
    csvPath
  });
}
