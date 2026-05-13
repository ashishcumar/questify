import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
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
            fontSize: 19,
            color: "#ffffff",
            lineHeight: 1,
            letterSpacing: "-0.5px",
            marginTop: 1,
          }}
        >
          Q
        </span>
        {/* Branch dot — represents conditional logic */}
        <div
          style={{
            position: "absolute",
            bottom: 5,
            right: 5,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.65)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
