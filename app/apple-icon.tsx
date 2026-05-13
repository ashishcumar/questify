import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Letter Q */}
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 900,
            fontSize: 108,
            color: "#ffffff",
            lineHeight: 1,
            letterSpacing: "-3px",
            marginTop: 4,
          }}
        >
          Q
        </span>
        {/* Branch dots */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            right: 28,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.5)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 28,
            right: 58,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.3)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
