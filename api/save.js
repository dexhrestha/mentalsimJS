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
  const basePath = [
    "data",
    safePart(payload?.cohort),
    `subj-${safePart(payload?.subject)}`,
    `ses-${safePart(payload?.session)}`,
    "navigate",
    `${sessionId}_${timestamp}`
  ].join("/");
  const jsonBody = JSON.stringify(payload, null, 2);
  const csvBody = payload?.csv ?? "";

  if (process.env.MENTLASIMJS_BLOB_READ_WRITE_TOKEN) {
    const token = process.env.MENTLASIMJS_BLOB_READ_WRITE_TOKEN;
    const { put } = await import("@vercel/blob");
    const [jsonBlob, csvBlob] = await Promise.all([
      put(`${basePath}.json`, jsonBody, {
        access: "private",
        contentType: "application/json",
        token
      }),
      put(`${basePath}.csv`, csvBody, {
        access: "private",
        contentType: "text/csv",
        token
      })
    ]);

    response.status(200).json({
      ok: true,
      storage: "vercel-blob",
      url: jsonBlob.url,
      csvUrl: csvBlob.url
    });
    return;
  }

  const outDir = path.join("/tmp", "navigate-data");
  await mkdir(outDir, { recursive: true });
  const jsonPath = path.join(outDir, `${sessionId}_${timestamp}.json`);
  const csvPath = path.join(outDir, `${sessionId}_${timestamp}.csv`);
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
