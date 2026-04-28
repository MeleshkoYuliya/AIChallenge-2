"use client";

import { useState } from "react";
import { allLeaders, type Leader } from "../data/leaders";

const categoryBadgeStyles: Record<string, { bg: string; color: string }> = {
  Education: { bg: "#dbeafe", color: "#1e40af" },
  Training: { bg: "#dbeafe", color: "#1e40af" },
  "University Partnership": { bg: "#e2e8f0", color: "#475569" },
  Community: { bg: "#dcfce7", color: "#166534" },
  Contribution: { bg: "#f3e8ff", color: "#6b21a8" },
  "Public Speaking": { bg: "#fef3c7", color: "#92400e" },
};

function StarIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function EducationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 0 3 3 6 3s6-3 6-3v-5" />
    </svg>
  );
}

function PresentationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21l4-4 4 4" />
      <path d="M12 17v-4" />
    </svg>
  );
}

function CommunityIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}

function ChevronIcon({ up }: { up: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: up ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CategoryIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "education":
      return <EducationIcon />;
    case "presentation":
      return <PresentationIcon />;
    case "community":
      return <CommunityIcon />;
    default:
      return <EducationIcon />;
  }
}

// ─── Podium ──────────────────────────────────────────────

function PodiumColumn({ leader, rank }: { leader: Leader; rank: number }) {
  const isFirst = rank === 1;
  const avatarSize = isFirst ? 112 : 80;
  const badgeSize = isFirst ? 40 : 32;
  const badgeBg = rank === 1 ? "#eab308" : rank === 2 ? "#94a3b8" : "#92400e";
  const avatarBorder = rank === 1 ? "4px solid #fbbf24" : "4px solid #fff";
  const avatarBgColor = rank === 1 ? "#86efac" : rank === 2 ? "#cbd5e1" : "#5eead4";
  const scoreBg = rank === 1 ? "#fef9c3" : "#fff";
  const scoreBorder = rank === 1 ? "#fde047" : "#e2e8f0";
  const scoreColor = rank === 1 ? "#ca8a04" : "#0ea5e9";
  const blockHeight = rank === 1 ? 160 : rank === 2 ? 128 : 128;
  const blockBg = rank === 1
    ? "linear-gradient(180deg, #fef3c7, #fde68a)"
    : "linear-gradient(180deg, #e2e8f0, #cbd5e1)";
  const blockBorderTop = rank === 1 ? "2px solid #fde047" : "2px solid #cbd5e1";
  const rankNumberColor = rank === 1 ? "rgba(234,179,8,.2)" : "rgba(148,163,184,.2)";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        maxWidth: 280,
        width: "100%",
        position: "relative",
        marginTop: isFirst ? -32 : 0,
        order: rank === 1 ? 2 : rank === 2 ? 1 : 3,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 16, position: "relative", zIndex: 10 }}>
        <div style={{ position: "relative", marginBottom: 12 }}>
          <div
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: "50%",
              border: avatarBorder,
              backgroundImage: `url(${leader.avatar})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: avatarBgColor,
              boxShadow: "0 4px 12px rgba(0,0,0,.15)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -8,
              right: -4,
              width: badgeSize,
              height: badgeSize,
              borderRadius: "50%",
              background: badgeBg,
              border: "4px solid #fff",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: isFirst ? 18 : 14,
            }}
          >
            {rank}
          </div>
        </div>
        <h3 style={{ fontSize: isFirst ? 24 : 20, fontWeight: 700, color: "#0f172a", margin: "0 0 4px", textAlign: "center" }}>
          {leader.name}
        </h3>
        <p style={{ fontSize: 14, fontWeight: 500, color: "#64748b", margin: "0 0 8px" }}>
          {leader.role}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: isFirst ? "8px 20px" : "6px 16px",
            background: scoreBg,
            border: `1px solid ${scoreBorder}`,
            borderRadius: 20,
            boxShadow: "0 1px 2px rgba(0,0,0,.05)",
            color: scoreColor,
            fontSize: isFirst ? 20 : 18,
            fontWeight: 700,
          }}
        >
          <StarIcon size={isFirst ? 18 : 16} />
          <span>{leader.score}</span>
        </div>
      </div>
      <div
        style={{
          width: "100%",
          height: blockHeight,
          background: blockBg,
          borderRadius: "12px 12px 0 0",
          borderTop: blockBorderTop,
          boxShadow: "inset 0 2px 4px rgba(0,0,0,.06)",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          paddingTop: 16,
          overflow: "hidden",
        }}
      >
        <span style={{ fontSize: isFirst ? 112 : 96, fontWeight: 900, color: rankNumberColor, userSelect: "none", lineHeight: 1 }}>
          {rank}
        </span>
      </div>
    </div>
  );
}

// ─── Leader Row ──────────────────────────────────────────

function LeaderRow({ leader, rank }: { leader: Leader; rank: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        background: "#fff",
        border: expanded ? "1px solid #0ea5e9" : "1px solid #e2e8f0",
        borderRadius: 12,
        boxShadow: expanded ? "0 4px 12px rgba(0,0,0,.1)" : "0 1px 3px rgba(0,0,0,.1)",
        overflow: "hidden",
        transition: "all .2s",
      }}
    >
      {/* Main row */}
      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "space-between" }}>
          {/* Left: rank + avatar + info */}
          <div style={{ display: "flex", alignItems: "center", flex: 1, gap: 24 }}>
            <span style={{ color: "#94a3b8", fontSize: 24, fontWeight: 700, minWidth: 32, textAlign: "center" }}>
              {rank}
            </span>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                backgroundImage: `url(${leader.avatar})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: "#fbbf24",
                flexShrink: 0,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                {leader.name}
              </h3>
              <span style={{ fontSize: 14, color: "#64748b" }}>{leader.role}</span>
            </div>
          </div>

          {/* Right: category stats + total + expand */}
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {/* Category stats */}
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              {leader.categoryStats.map((stat) => (
                <div key={stat.icon} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ color: "#0ea5e9", fontSize: 20, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <CategoryIcon icon={stat.icon} />
                  </span>
                  <span style={{ color: "#475569", fontSize: 12, fontWeight: 600 }}>{stat.count}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 4,
                borderLeft: "1px solid #e2e8f0",
                paddingLeft: 24,
              }}
            >
              <span style={{ color: "#94a3b8", fontSize: 10, fontWeight: 600, letterSpacing: "0.05em" }}>
                TOTAL
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#0ea5e9", fontSize: 24, fontWeight: 700 }}>
                <StarIcon size={20} />
                <span>{leader.score}</span>
              </div>
            </div>

            {/* Expand button */}
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 8,
                background: expanded ? "#e0f2fe" : "#f1f5f9",
                border: "none",
                borderRadius: "50%",
                color: "#0ea5e9",
                cursor: "pointer",
                transition: "background .2s",
              }}
            >
              <ChevronIcon up={expanded} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", padding: 24 }}>
          <h4
            style={{
              color: "#64748b",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              margin: "0 0 16px",
            }}
          >
            Recent Activity
          </h4>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px 16px 8px 0", fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid #e2e8f0" }}>
                    Activity
                  </th>
                  <th style={{ textAlign: "left", padding: "8px 16px", fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid #e2e8f0" }}>
                    Category
                  </th>
                  <th style={{ textAlign: "left", padding: "8px 16px", fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid #e2e8f0" }}>
                    Date
                  </th>
                  <th style={{ textAlign: "right", padding: "8px 0 8px 16px", fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid #e2e8f0" }}>
                    Points
                  </th>
                </tr>
              </thead>
              <tbody>
                {leader.activities.map((activity, idx) => {
                  const badge = categoryBadgeStyles[activity.category] || { bg: "#e2e8f0", color: "#475569" };
                  return (
                    <tr key={idx}>
                      <td style={{ padding: "14px 16px 14px 0", fontSize: 14, fontWeight: 600, color: "#1e293b", borderBottom: "1px solid #f1f5f9" }}>
                        {activity.name}
                      </td>
                      <td style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "4px 12px",
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 600,
                            background: badge.bg,
                            color: badge.color,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {activity.category}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 14, color: "#64748b", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>
                        {activity.date}
                      </td>
                      <td style={{ padding: "14px 0 14px 16px", fontSize: 14, fontWeight: 700, color: "#0ea5e9", textAlign: "right", borderBottom: "1px solid #f1f5f9" }}>
                        +{activity.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────

export default function Leaderboard() {
  const [search, setSearch] = useState("");

  const top3 = allLeaders.slice(0, 3);
  const rest = allLeaders.slice(3);

  return (
    <section
      style={{
        fontFamily: "Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
        color: "#0f172a",
        background: "#fff",
        borderRadius: 12,
        padding: "32px 24px",
        marginBottom: 32,
      }}
    >
      {/* Header */}
      <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", maxWidth: 1200, margin: "0 auto 32px" }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 30, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>
            Leaderboard
          </h2>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
            Top performers based on contributions and activity
          </p>
        </div>
      </header>

      {/* Filter Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "space-between",
          maxWidth: 1200,
          margin: "0 auto 24px",
          padding: "20px 24px",
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,.1)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {["All Years", "All Quarters", "All Categories"].map((label) => (
            <select
              key={label}
              defaultValue={label}
              style={{
                padding: "8px 32px 8px 12px",
                fontSize: 14,
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                background: "#fff",
                color: "#0f172a",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 10px center",
                backgroundRepeat: "no-repeat",
                cursor: "pointer",
              }}
            >
              <option>{label}</option>
              {label === "All Years" && <><option>2025</option><option>2024</option><option>2023</option></>}
              {label === "All Quarters" && <><option>Q1</option><option>Q2</option><option>Q3</option><option>Q4</option></>}
              {label === "All Categories" && <><option>Engineering</option><option>Design</option><option>Management</option></>}
            </select>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 250, position: "relative" }}>
          <svg
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#64748b" }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 34px",
              fontSize: 14,
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              background: "#fff",
              color: "#0f172a",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Podium */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 24, maxWidth: 900, margin: "0 auto 64px", padding: "32px 8px" }}>
        <PodiumColumn leader={top3[1]} rank={2} />
        <PodiumColumn leader={top3[0]} rank={1} />
        <PodiumColumn leader={top3[2]} rank={3} />
      </div>

      {/* Leader List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1200, margin: "0 auto" }}>
        {rest.map((leader, idx) => (
          <LeaderRow key={leader.name} leader={leader} rank={idx + 4} />
        ))}
      </div>
    </section>
  );
}
