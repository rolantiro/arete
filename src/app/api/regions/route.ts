import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side proxy for Indonesia region data (emsifa/api-wilayah-
 * indonesia, a free static API hosted on GitHub Pages).
 *
 * Why proxy instead of fetching directly from the browser:
 * - A server-to-server fetch can't fail due to CORS — browser CORS
 *   restrictions don't apply to server code, so any CORS-related
 *   failure the browser hit is eliminated entirely.
 * - Retries happen here, server-side, with a longer per-attempt
 *   timeout than is comfortable to make a customer wait through in
 *   the browser, and the successful response is cached at the edge
 *   for a day since provinces/regencies/districts/villages data
 *   essentially never changes.
 *
 * Usage: /api/regions?type=provinces
 *        /api/regions?type=regencies&parent=11
 *        /api/regions?type=districts&parent=1103
 *        /api/regions?type=villages&parent=1103010
 */

const ENDPOINT_BUILDERS: Record<string, (parent?: string) => string> = {
  provinces: () => "https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json",
  regencies: (parent) =>
    `https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${parent}.json`,
  districts: (parent) =>
    `https://emsifa.github.io/api-wilayah-indonesia/api/districts/${parent}.json`,
  villages: (parent) =>
    `https://emsifa.github.io/api-wilayah-indonesia/api/villages/${parent}.json`,
};

async function fetchWithTimeout(url: string, timeoutMs = 6000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      // Cache region data at the edge for a day — provinces/
      // regencies/districts/villages essentially never change.
      next: { revalidate: 60 * 60 * 24 },
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const parent = searchParams.get("parent") ?? undefined;

  if (!type || !ENDPOINT_BUILDERS[type]) {
    return NextResponse.json(
      { error: "Parameter 'type' tidak valid. Gunakan: provinces, regencies, districts, villages." },
      { status: 400 }
    );
  }

  if (type !== "provinces" && !parent) {
    return NextResponse.json(
      { error: "Parameter 'parent' wajib diisi untuk type ini." },
      { status: 400 }
    );
  }

  const url = ENDPOINT_BUILDERS[type](parent);
  const RETRIES = 3;
  let lastError = "";

  for (let attempt = 0; attempt < RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(url);
      if (!res.ok) {
        lastError = `HTTP ${res.status}`;
      } else {
        const data = await res.json();
        return NextResponse.json(
          { data },
          { headers: { "Cache-Control": "public, max-age=86400" } }
        );
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
    if (attempt < RETRIES - 1) {
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }
  }

  return NextResponse.json(
    { error: "Gagal mengambil data wilayah dari sumber data.", details: lastError },
    { status: 502 }
  );
}
