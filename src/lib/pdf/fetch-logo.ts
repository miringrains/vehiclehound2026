type LogoData = { base64: string; format: "PNG" | "JPEG" | "WEBP" };

export async function fetchLogoData(url: string | null | undefined): Promise<LogoData | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;

    const ct = res.headers.get("content-type") ?? "";
    let format: LogoData["format"];
    if (ct.includes("png")) format = "PNG";
    else if (ct.includes("webp")) format = "WEBP";
    else format = "JPEG";

    const buf = await res.arrayBuffer();
    if (buf.byteLength === 0 || buf.byteLength > 4 * 1024 * 1024) return null;

    const b64 = `data:${ct || "image/png"};base64,${Buffer.from(buf).toString("base64")}`;
    return { base64: b64, format };
  } catch {
    return null;
  }
}
