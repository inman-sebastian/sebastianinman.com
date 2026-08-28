import fs from "fs/promises";
import path from "path";

/**
 * Shared branding for generated Open Graph images (the root site card
 * and the per-post blog cards). Mirrors the hero: pine-dark field, sun
 * dot + wordmark, Fraunces headline, and the cream sawtooth edge.
 *
 * Fonts are vendored TTFs in assets/fonts because the OG renderer
 * (satori) needs raw font data and can't read woff2 or webfont CSS.
 */

export const OG_SIZE = { width: 1200, height: 630 };

export async function ogFonts() {
  const dir = path.join(process.cwd(), "assets", "fonts");
  const [fraunces, outfit] = await Promise.all([
    fs.readFile(path.join(dir, "fraunces-600.ttf")),
    fs.readFile(path.join(dir, "outfit-500.ttf")),
  ]);
  return [
    { name: "Fraunces", data: fraunces, weight: 600 as const, style: "normal" as const },
    { name: "Outfit", data: outfit, weight: 500 as const, style: "normal" as const },
  ];
}

/** One tooth = 40px wide, 24px tall, matching the site's sawtooth motif */
function sawtoothPath(width: number, tooth = 40, amp = 24, height = 88): string {
  let d = `M0 ${amp}`;
  for (let x = 0; x < width; x += tooth) {
    d += ` L${x + tooth / 2} 0 L${x + tooth} ${amp}`;
  }
  d += ` L${width} ${height} L0 ${height} Z`;
  return d;
}

export function OgFrame({
  eyebrow,
  headline,
  headlineSize = 66,
  card,
}: {
  eyebrow: string;
  headline: string;
  headlineSize?: number;
  card?: { title: string; sub: string };
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        background: "#18382c",
        fontFamily: "Outfit",
      }}
    >
      {/* Wordmark with the terracotta sun dot */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "56px 72px 0",
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 9999,
            background: "#c05f33",
          }}
        />
        <div style={{ fontFamily: "Fraunces", fontSize: 32, color: "#faf6ef" }}>
          Sebastian Inman
        </div>
      </div>

      {/* Headline block */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
          padding: "0 72px 88px",
        }}
      >
        <div
          style={{
            fontSize: 24,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#e8a583",
            marginBottom: 20,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            fontFamily: "Fraunces",
            fontSize: headlineSize,
            lineHeight: 1.12,
            color: "#faf6ef",
            maxWidth: card ? 760 : 1000,
          }}
        >
          {headline}
        </div>
      </div>

      {/* A floating hero-style notification card */}
      {card && (
        <div
          style={{
            position: "absolute",
            top: 170,
            right: 64,
            display: "flex",
            alignItems: "center",
            gap: 18,
            background: "#fdfbf7",
            borderRadius: 18,
            padding: "24px 30px",
            transform: "rotate(2deg)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: 9999,
              background: "#d9ecdc",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="m4.5 12.75 6 6 9-13.5"
                stroke="#234f3e"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 26, color: "#1f3d31" }}>{card.title}</div>
            <div style={{ fontSize: 20, color: "#6b7f74", marginTop: 4 }}>
              {card.sub}
            </div>
          </div>
        </div>
      )}

      {/* Cream sawtooth edge with the domain, like every page's fold */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          display: "flex",
        }}
      >
        <svg width="1200" height="88" viewBox="0 0 1200 88">
          <path d={sawtoothPath(1200)} fill="#faf6ef" />
        </svg>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 18,
          left: 72,
          fontSize: 22,
          color: "#234f3e",
        }}
      >
        www.sebastianinman.com
      </div>
    </div>
  );
}
