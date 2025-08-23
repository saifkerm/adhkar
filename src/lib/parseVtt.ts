export type Cue = { start: number; end: number; i: number };

function msFromParts(h: string, m: string, s: string, ms: string) {
  return ((+h) * 3600 + (+m) * 60 + (+s)) * 1000 + (+ms || 0);
}

export function parseVttFromString(vtt: string): Cue[] {
  const lines = vtt.split(/\r?\n/);
  const out: Cue[] = [];
  let i = 0;

  while (i < lines.length) {
    let line = (lines[i] || "").trim();
    i++;
    if (!line) continue;
    if (/^WEBVTT/i.test(line)) continue;
    if (/^\d+$/.test(line)) { line = (lines[i] || "").trim(); i++; }

    const tm = /(?:(\d{2}):)?(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(?:(\d{2}):)?(\d{2}):(\d{2})\.(\d{3})/.exec(line);
    if (!tm) continue;

    const sMs = msFromParts(tm[1] || "00", tm[2], tm[3], tm[4]);
    const eMs = msFromParts(tm[5] || "00", tm[6], tm[7], tm[8]);

    let text = "";
    while (i < lines.length && (lines[i] || "").trim() !== "") {
      text += (text ? "\n" : "") + lines[i];
      i++;
    }
    const idxMatch = /idx\s*:\s*(\d+)/.exec(text);
    const idx = idxMatch ? parseInt(idxMatch[1], 10) : out.length;
    out.push({ start: sMs, end: eMs, i: idx });
  }
  return out.sort((a, b) => a.start - b.start);
}

export async function loadVtt(url: string): Promise<Cue[]> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`VTT introuvable: ${url}`);
  const txt = await res.text();
  return parseVttFromString(txt);
}
