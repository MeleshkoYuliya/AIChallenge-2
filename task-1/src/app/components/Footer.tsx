"use client";

import { useState } from "react";

export default function Footer() {
  const [saved, setSaved] = useState(false);

  return (
    <>
      {/* Engagement bar */}
      <div style={{ background: "#e5e5e5" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
          }}
        >
        <div style={{ borderTop: "1px solid #d0d0d0", paddingTop: 20, paddingBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {/* Likes */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#555", fontSize: 14 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                <path d="M14 2l-2 6h6.5a2 2 0 0 1 1.93 2.49l-1.75 7A2 2 0 0 1 16.76 19H7V11l4-9h1a2 2 0 0 1 2 2z" />
              </svg>
              <span>1 person liked this</span>
            </div>

            {/* Views */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#555", fontSize: 14 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>1869 Views</span>
            </div>

            {/* Save for later */}
            <button
              onClick={() => setSaved(!saved)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                color: saved ? "#1a1a1a" : "#555",
                fontSize: 14, cursor: "pointer",
                background: "none", border: "none", padding: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? "#1a1a1a" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              <span>{saved ? "Saved for later" : "Save for later"}</span>
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          background: "#333",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
        }}
      >
        <span style={{ color: "#fff", fontSize: 16, fontWeight: 600, letterSpacing: "0.02em" }}>
          vention
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {[
            { name: "LinkedIn", url: "https://www.linkedin.com/company/vaborovskyy/" },
            { name: "Instagram", url: "https://www.instagram.com/ventionteams/" },
            { name: "Twitter", url: "https://twitter.com/ventionteams" },
            { name: "Youtube", url: "https://www.youtube.com/@ventionteams" },
            { name: "Facebook", url: "https://www.facebook.com/ventionteams" },
          ].map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#ccc",
                fontSize: 14,
                textDecoration: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#ccc")}
            >
              {link.name}
            </a>
          ))}
        </div>
      </footer>
    </>
  );
}
