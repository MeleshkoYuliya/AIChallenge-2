"use client";

import { useState } from "react";

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [category, setCategory] = useState("Feedback");
  const [submitted, setSubmitted] = useState(false);

  const handleSave = () => {
    if (!feedback.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setOpen(false);
      setFeedback("");
      setCategory("Feedback");
      setSubmitted(false);
    }, 1500);
  };

  const handleCancel = () => {
    setOpen(false);
    setFeedback("");
    setCategory("Feedback");
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed z-[900] cursor-pointer"
        style={{
          bottom: 24,
          right: 24,
          width: 44,
          height: 44,
          borderRadius: 8,
          background: "#ddd",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M14 10a2 2 0 0 1-2 2H8" />
          <circle cx="17" cy="8" r="3" />
        </svg>
      </button>

      {/* Drawer */}
      {open && (
        <div
          className="fixed inset-0 z-[998]"
          onClick={handleCancel}
        />
      )}
      <div
        className="fixed right-0 z-[999] w-[380px] bg-white shadow-[-4px_0_16px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-in-out overflow-y-auto"
        style={{
          fontFamily: "Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
          transform: open ? "translateX(0)" : "translateX(100%)",
          top: 0,
          height: "100vh",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
            Collect Feedback
          </h2>
          <button
            onClick={handleCancel}
            className="text-[#666] hover:text-[#1a1a1a] p-1 cursor-pointer"
            style={{ background: "none", border: "none" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 pb-6">
          {submitted ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#107c41", fontSize: 16, fontWeight: 600 }}>
              Thank you for your feedback!
            </div>
          ) : (
            <>
              {/* Site */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 4 }}>
                  Site
                </label>
                <input
                  type="text"
                  readOnly
                  value="EDU"
                  style={{
                    width: "100%", padding: "8px 12px", fontSize: 14,
                    border: "1px solid #e0e0e0", borderRadius: 2,
                    background: "#fff", color: "#333", boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Page */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 4 }}>
                  Page
                </label>
                <input
                  type="text"
                  readOnly
                  value="EDU - Company Leader Board 2025"
                  style={{
                    width: "100%", padding: "8px 12px", fontSize: 14,
                    border: "1px solid #e0e0e0", borderRadius: 2,
                    background: "#fff", color: "#333", boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Feedback */}
              <div style={{ marginBottom: 4 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 4 }}>
                  Your feedback <span style={{ color: "#c00" }}>*</span>
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={6}
                  style={{
                    width: "100%", padding: "10px 12px", fontSize: 14,
                    border: `2px solid ${!feedback.trim() ? "#c00" : "#0078d4"}`,
                    borderRadius: 2, background: "#fff", color: "#333",
                    resize: "vertical", boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>
              <p style={{ fontSize: 12, color: "#c00", margin: "0 0 16px" }}>
                Feedback is a required field. Please enter your feedback in this field.
              </p>

              {/* Category */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 4 }}>
                  Choose a Category <span style={{ color: "#c00" }}>*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: "100%", padding: "8px 12px", fontSize: 14,
                    border: "1px solid #e0e0e0", borderRadius: 2,
                    background: "#fff", color: "#333",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                    backgroundPosition: "right 10px center",
                    backgroundRepeat: "no-repeat",
                    boxSizing: "border-box",
                    cursor: "pointer",
                  }}
                >
                  <option>Feedback</option>
                  <option>Bug Report</option>
                  <option>Feature Request</option>
                  <option>Question</option>
                </select>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={handleSave}
                  style={{
                    padding: "8px 20px", fontSize: 14, fontWeight: 500,
                    background: "#333", color: "#fff", border: "none",
                    borderRadius: 2, cursor: "pointer",
                  }}
                >
                  Save Feedback
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    padding: "8px 20px", fontSize: 14, fontWeight: 500,
                    background: "#fff", color: "#333",
                    border: "1px solid #999", borderRadius: 2,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
