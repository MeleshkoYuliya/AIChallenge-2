"use client";

import { useState } from "react";

interface Reply {
  author: string;
  avatar: string;
  date: string;
  content: string;
}

interface CommentData {
  id: number;
  author: string;
  avatar: string;
  date: string;
  editedDate?: string;
  content: string;
  likes: number;
  liked: boolean;
  replies: Reply[];
}

const initialComments: CommentData[] = [
  {
    id: 1,
    author: "Elena Kravchenko",
    avatar: "https://i.pravatar.cc/150?img=32",
    date: "12/03/2026",
    editedDate: "14/03/2026",
    likes: 3,
    liked: false,
    replies: [],
    content:
      "Quick guide to understanding your score:\n" +
      "Click the arrow next to your name to expand your details. You'll see the categories where you earned points – Education, Public Speaking, University Partnership – along with the specific activities and dates.\n\n" +
      "Abbreviations meaning:\n" +
      "[LAB] — lab curators, lecturers, and mentors\n" +
      "[REG] — speakers at events and internal trainings in locations\n" +
      "[UNI] — university speakers, academic practice curators, and other activities with universities\n" +
      "[EDU] — speakers/performers at EDU events",
  },
  {
    id: 2,
    author: "Elena Kravchenko",
    avatar: "https://i.pravatar.cc/150?img=32",
    date: "12/03/2026",
    editedDate: "12/03/2026",
    likes: 1,
    liked: false,
    replies: [],
    content:
      "What counts in 2025:\n" +
      "Employees in both production and non-production units can be recognized for: Mentoring, Labs, Public Speaking, Dev2Dev, and University Partnership.\n" +
      "Managers can be recognized for Public Speaking and University Partnership.",
  },
  {
    id: 3,
    author: "Sergei Volkov",
    avatar: "https://i.pravatar.cc/150?img=15",
    date: "08/03/2026",
    likes: 2,
    liked: false,
    replies: [],
    content:
      "The list is in the final check (together with contributors and managers), so this is the moment to take a quick look and make sure nothing important is missing (or accidentally duplicated, especially mentoring).\n" +
      "If you spot something off, no drama, just drop an update via the feedback form.\n" +
      "We want this thing to stay fair, transparent, and honest. No magic, no guessing.",
  },
  {
    id: 4,
    author: "Marina Boyko",
    avatar: "https://i.pravatar.cc/150?img=44",
    date: "01/03/2026",
    likes: 0,
    liked: false,
    replies: [],
    content:
      "Great to see the leaderboard updated! Really motivating to see colleagues recognized for their contributions across different categories.",
  },
  {
    id: 5,
    author: "Andrei Petrov",
    avatar: "https://i.pravatar.cc/150?img=53",
    date: "25/02/2026",
    likes: 4,
    liked: false,
    replies: [],
    content:
      "Just a reminder — if you've done any mentoring or public speaking activities that aren't reflected here, please reach out to your manager to get them logged before the end of the quarter.",
  },
];

const currentUser = {
  name: "You",
  avatar: "https://i.pravatar.cc/150?img=68",
};

function today() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function ThumbsUpIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
      <path d="M14 2l-2 6h6.5a2 2 0 0 1 1.93 2.49l-1.75 7A2 2 0 0 1 16.76 19H7V11l4-9h1a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function HoverButton({
  children,
  onClick,
  baseColor,
  hoverColor,
  style,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  baseColor: string;
  hoverColor: string;
  style?: React.CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        color: hovered ? hoverColor : baseColor,
        transition: "color 0.15s",
        display: "flex",
        alignItems: "center",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ─── Comment Item ────────────────────────────────────────

function CommentItem({
  comment,
  onLike,
  onReply,
  isLast,
}: {
  comment: CommentData;
  onLike: (id: number) => void;
  onReply: (id: number, text: string) => void;
  isLast: boolean;
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleSubmitReply = () => {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    onReply(comment.id, trimmed);
    setReplyText("");
    setShowReplyInput(false);
  };

  return (
    <div style={{ borderBottom: isLast ? "none" : "1px solid #f1f5f9" }}>
      <div style={{ display: "flex", gap: 16, padding: "20px 0" }}>
        <div
          style={{
            width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
            backgroundImage: `url(${comment.avatar})`,
            backgroundSize: "cover", backgroundPosition: "center",
            backgroundColor: "#cbd5e1",
          }}
        />
        <div style={{ flex: 1 }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{comment.author}</span>
            <span style={{ fontSize: 13, color: "#94a3b8", flexShrink: 0, marginLeft: 16 }}>{comment.date}</span>
          </div>

          {/* Body */}
          <div style={{ fontSize: 14, color: "#333", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {comment.content}
            {comment.editedDate && (
              <span style={{ color: "#94a3b8", fontSize: 13 }}> - Edited {comment.editedDate}</span>
            )}
          </div>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
            <HoverButton
              baseColor="#64748b"
              hoverColor="#0f172a"
              onClick={() => setShowReplyInput(!showReplyInput)}
              style={{ fontSize: 13, fontWeight: 500 }}
            >
              Reply
            </HoverButton>
            <span style={{ color: "#cbd5e1" }}>·</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#94a3b8" }}>
              {comment.likes}
            </span>
            <HoverButton
              baseColor={comment.liked ? "#333" : "#94a3b8"}
              hoverColor={comment.liked ? "#111" : "#0f172a"}
              onClick={() => onLike(comment.id)}
            >
              <ThumbsUpIcon filled={comment.liked} />
            </HoverButton>
          </div>

          {/* Reply input */}
          {showReplyInput && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                    backgroundImage: `url(${currentUser.avatar})`,
                    backgroundSize: "cover", backgroundPosition: "center",
                    backgroundColor: "#cbd5e1", marginTop: 2,
                  }}
                />
                <div style={{ flex: 1, position: "relative" }}>
                  <textarea
                    placeholder=""
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitReply();
                      }
                    }}
                    autoFocus
                    rows={2}
                    style={{
                      width: "100%", padding: "12px 36px 12px 12px", fontSize: 14,
                      border: "1px solid #d0d0d0", borderRadius: 4,
                      background: "#fff", color: "#0f172a", outline: "none",
                      resize: "none", boxSizing: "border-box",
                      lineHeight: 1.5,
                    }}
                  />
                  <button
                    onClick={() => { setShowReplyInput(false); setReplyText(""); }}
                    style={{
                      position: "absolute", top: 10, right: 10,
                      background: "none", border: "none", cursor: "pointer",
                      color: "#94a3b8", fontSize: 18, lineHeight: 1,
                      padding: 0,
                    }}
                  >
                    &#x2716;
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <button
                  onClick={handleSubmitReply}
                  style={{
                    padding: "8px 24px", fontSize: 14, fontWeight: 500,
                    background: "#999", color: "#fff", border: "none",
                    borderRadius: 4, cursor: "pointer",
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies.length > 0 && (
            <div style={{ marginTop: 16, paddingLeft: 8, borderLeft: "2px solid #e2e8f0" }}>
              {comment.replies.map((reply, idx) => (
                <div key={idx} style={{ display: "flex", gap: 12, padding: "12px 0" }}>
                  <div
                    style={{
                      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                      backgroundImage: `url(${reply.avatar})`,
                      backgroundSize: "cover", backgroundPosition: "center",
                      backgroundColor: "#cbd5e1",
                    }}
                  />
                  <div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{reply.author}</span>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>{reply.date}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#333", lineHeight: 1.5 }}>{reply.content}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────

export default function Comments() {
  const [activeTab, setActiveTab] = useState<"newest" | "oldest" | "popular">("newest");
  const [comments, setComments] = useState<CommentData[]>(initialComments);
  const [newComment, setNewComment] = useState("");

  const handleLike = (id: number) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
          : c
      )
    );
  };

  const handleReply = (id: number, text: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              replies: [
                ...c.replies,
                { author: currentUser.name, avatar: currentUser.avatar, date: today(), content: text },
              ],
            }
          : c
      )
    );
  };

  const handleAddComment = () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;
    const newId = Math.max(...comments.map((c) => c.id)) + 1;
    setComments((prev) => [
      {
        id: newId,
        author: currentUser.name,
        avatar: currentUser.avatar,
        date: today(),
        content: trimmed,
        likes: 0,
        liked: false,
        replies: [],
      },
      ...prev,
    ]);
    setNewComment("");
  };

  const sorted = [...comments].sort((a, b) => {
    if (activeTab === "oldest") return a.date.localeCompare(b.date);
    if (activeTab === "popular") return b.likes - a.likes;
    return b.date.localeCompare(a.date);
  });

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: "newest", label: "Newest" },
    { key: "oldest", label: "Oldest" },
    { key: "popular", label: "Popular" },
  ];

  return (
    <section
      style={{
        fontFamily: "Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
        maxWidth: 1200, margin: "0 auto", padding: "32px 0",
      }}
    >
      {/* Add a comment */}
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
        <div
          style={{
            width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
            backgroundImage: `url(${currentUser.avatar})`,
            backgroundSize: "cover", backgroundPosition: "center",
            backgroundColor: "#cbd5e1",
          }}
        />
        <input
          type="text"
          placeholder="Add a comment"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
          style={{
            flex: 1, padding: "10px 16px", fontSize: 14,
            border: "1px solid #e2e8f0", borderRadius: 4,
            background: "#fff", color: "#0f172a", outline: "none",
          }}
        />
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid #d0d0d0" }}>
        <div style={{ display: "flex", gap: 0 }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "8px 12px", fontSize: 14,
                fontWeight: activeTab === tab.key ? 700 : 400,
                color: activeTab === tab.key ? "#1a1a1a" : "#999",
                background: "none", border: "none",
                borderBottom: activeTab === tab.key ? "2px solid #1a1a1a" : "2px solid transparent",
                cursor: "pointer", marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comments list */}
      <div>
        {sorted.map((comment, idx) => (
          <CommentItem key={comment.id} comment={comment} onLike={handleLike} onReply={handleReply} isLast={idx === sorted.length - 1} />
        ))}
      </div>
    </section>
  );
}
