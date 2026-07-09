import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <style>{`
        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
      `}</style>
      <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
        <img
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            objectFit: "cover",
          }}
          src="/public/hero.png"
          alt="Payshelf Preview"
        />

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily: "'Geist', sans-serif",
              fontWeight: 600,
              fontSize: "5rem",
              color: "oklch(0.12 0 0)",
              letterSpacing: "-0.03em",
              lineHeight: 1,
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            Payshelf
          </h1>
          <p
            style={{
              margin: 0,
              fontFamily: "'Geist', sans-serif",
              fontWeight: 500,
              fontSize: "1.5rem",
              color: "oklch(0.12 0 0)",
              letterSpacing: "-0.03em",
              lineHeight: 1,
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            The simplest way to sell your products online.
          </p>
          <Link
            to="/setup"
            style={{
              marginTop: 14,
              backgroundColor: "oklch(0.12 0 0)",
              color: "oklch(1 0 0)",
              border: "1px solid transparent",
              borderRadius: "8px",
              padding: "10px 20px",
              fontFamily: "'Geist', sans-serif",
              fontWeight: 500,
              fontSize: "0.875rem",
              textDecoration: "none",
              display: "inline-block",
              cursor: "pointer",
              transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(24, 24, 27, 0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "oklch(0.12 0 0)";
              e.currentTarget.style.transform = "none";
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "translateY(1px)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "none";
            }}
          >
            Get Started
          </Link>
        </div>
      </div>
    </>
  );
}
