import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 55%, #3730a3 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow orb */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(99,102,241,0.35)",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(67,56,202,0.4)",
            filter: "blur(60px)",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "linear-gradient(135deg, #818cf8, #6366f1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
            boxShadow: "0 8px 32px rgba(99,102,241,0.5)",
          }}
        >
          <span
            style={{
              fontWeight: 900,
              fontSize: 48,
              color: "#fff",
              lineHeight: 1,
              marginTop: 2,
            }}
          >
            Q
          </span>
        </div>

        {/* Wordmark */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-2px",
            lineHeight: 1,
            marginBottom: 20,
          }}
        >
          Questify
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 26,
            fontWeight: 400,
            color: "rgba(255,255,255,0.65)",
            letterSpacing: "0px",
            marginBottom: 40,
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          Headless questionnaire engine for React, Vue &amp; vanilla JS
        </div>

        {/* Pills row */}
        <div
          style={{
            display: "flex",
            gap: 12,
          }}
        >
          {["Zero dependencies", "~2 KB gzip", "TypeScript", "MIT"].map((label) => (
            <div
              key={label}
              style={{
                padding: "8px 18px",
                borderRadius: 999,
                border: "1.5px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.75)",
                fontSize: 16,
                fontWeight: 500,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 16,
            color: "rgba(255,255,255,0.35)",
            fontWeight: 500,
            letterSpacing: "0.03em",
          }}
        >
          questify.renderlog.in
        </div>
      </div>
    ),
    { ...size }
  );
}
