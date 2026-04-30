"use client";

import { useState } from "react";

type DrawerType = "settings" | "help" | "profile" | "apps" | null;

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDrawer, setActiveDrawer] = useState<DrawerType>(null);

  const toggleDrawer = (drawer: DrawerType) => {
    setActiveDrawer(activeDrawer === drawer ? null : drawer);
  };

  return (
    <>
      <header className="bg-[#2d2d2d] flex items-center justify-between px-4 py-2 relative z-[1000]">
        {/* Left: Waffle + vention + SharePoint */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleDrawer("apps")}
            className={`p-1 rounded cursor-pointer ${activeDrawer === "apps" ? "bg-[#d0d0d0] text-[#333]" : "text-white hover:bg-[#444]"}`}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="4" height="4" rx="0.5" fill={activeDrawer === "apps" ? "#333" : "white"} />
              <rect x="8" y="2" width="4" height="4" rx="0.5" fill={activeDrawer === "apps" ? "#333" : "white"} />
              <rect x="14" y="2" width="4" height="4" rx="0.5" fill={activeDrawer === "apps" ? "#333" : "white"} />
              <rect x="2" y="8" width="4" height="4" rx="0.5" fill={activeDrawer === "apps" ? "#333" : "white"} />
              <rect x="8" y="8" width="4" height="4" rx="0.5" fill={activeDrawer === "apps" ? "#333" : "white"} />
              <rect x="14" y="8" width="4" height="4" rx="0.5" fill={activeDrawer === "apps" ? "#333" : "white"} />
              <rect x="2" y="14" width="4" height="4" rx="0.5" fill={activeDrawer === "apps" ? "#333" : "white"} />
              <rect x="8" y="14" width="4" height="4" rx="0.5" fill={activeDrawer === "apps" ? "#333" : "white"} />
              <rect x="14" y="14" width="4" height="4" rx="0.5" fill={activeDrawer === "apps" ? "#333" : "white"} />
            </svg>
          </button>
          <span className="text-white text-sm font-semibold tracking-wide">vention</span>
          <span className="text-white text-base font-semibold">SharePoint</span>
        </div>

        {/* Search bar */}
        <div className="flex-1 flex justify-center mx-4">
          <div className="relative w-full max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search this site"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 bg-white text-sm text-gray-900 rounded-sm border border-blue-500 outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Right side: Settings + Help + Avatar */}
        <div className="flex items-center gap-3">
          {/* Settings */}
          <button
            onClick={() => toggleDrawer("settings")}
            className={`p-1.5 rounded cursor-pointer ${activeDrawer === "settings" ? "bg-[#d0d0d0] text-[#333]" : "text-white hover:bg-[#444]"}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          {/* Help */}
          <button
            onClick={() => toggleDrawer("help")}
            className={`p-1.5 rounded cursor-pointer ${activeDrawer === "help" ? "bg-[#d0d0d0] text-[#333]" : "text-white hover:bg-[#444]"}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>
          <div className="relative">
            <button
              onClick={() => toggleDrawer("profile")}
              className="w-8 h-8 rounded-full bg-[#6b5b95] flex items-center justify-center text-white text-xs font-semibold cursor-pointer border-none outline-none"
            >
              AJ
            </button>
          </div>
        </div>
      </header>

      {/* Profile Menu */}
      {activeDrawer === "profile" && (
        <div
          className="fixed z-[1001] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.2)] border border-[#e0e0e0]"
          style={{
            top: 48,
            right: 0,
            width: 380,
            fontFamily: "Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
          }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3 bg-[#faf9f8] border-b border-[#e8e8e8]">
            <span className="text-sm font-semibold text-[#333]">VENTION INC</span>
            <a href="#" className="text-sm text-[#333] hover:underline">Sign out</a>
          </div>

          {/* User info */}
          <div className="flex items-center gap-5 px-5 py-6">
            <div className="w-20 h-20 rounded-full bg-[#6b5b95] flex items-center justify-center text-white text-2xl font-semibold flex-shrink-0 border-2 border-[#e0e0e0]">
              AJ
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-0.5">Alex Johnson</h3>
              <p className="text-sm text-[#666] mb-2">Alex.Johnson@ventiontea...</p>
              <div className="flex flex-col gap-1">
                <a href="#" className="text-sm text-[#0078d4] hover:underline">View account</a>
                <a href="#" className="text-sm text-[#0078d4] hover:underline">My Microsoft 365 profile</a>
              </div>
            </div>
          </div>

          {/* Sign in with different account */}
          <div className="border-t border-[#e8e8e8]">
            <a href="#" className="flex items-center gap-4 px-5 py-4 hover:bg-[#f5f5f5] transition-colors">
              <div className="w-10 h-10 rounded-full border-2 border-[#999] flex items-center justify-center text-[#999]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              </div>
              <span className="text-sm text-[#333]">Sign in with a different account</span>
            </a>
          </div>
        </div>
      )}

      {/* Apps Menu */}
      {activeDrawer === "apps" && (
        <div
          className="fixed z-[1001] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.2)] border border-[#e0e0e0] overflow-y-auto"
          style={{
            top: 48,
            left: 0,
            width: 500,
            maxHeight: "calc(100vh - 48px)",
            fontFamily: "Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
          }}
        >
          {/* Search */}
          <div className="px-5 pt-5 pb-3">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]"
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Find Microsoft 365 apps"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#e0e0e0] rounded bg-white text-[#1a1a1a] outline-none focus:border-[#0078d4]"
              />
            </div>
          </div>

          {/* Apps grid */}
          <div className="px-5 pb-4">
            <div className="grid grid-cols-5 gap-2">
              {[
                { name: "Microsoft 365 Copilot", color: "#7b5ea7", letter: "M365" },
                { name: "Outlook", color: "#0078d4", letter: "O" },
                { name: "OneDrive", color: "#0078d4", letter: "D" },
                { name: "Word", color: "#185abd", letter: "W" },
                { name: "Excel", color: "#107c41", letter: "X" },
                { name: "PowerPoint", color: "#c43e1c", letter: "P" },
                { name: "OneNote", color: "#7719aa", letter: "N" },
                { name: "SharePoint", color: "#038387", letter: "S" },
                { name: "Teams", color: "#5b5fc7", letter: "T" },
                { name: "Viva", color: "#0078d4", letter: "V" },
                { name: "Engage", color: "#0078d4", letter: "E" },
                { name: "More apps", color: "transparent", letter: "grid" },
              ].map((app) => (
                <a
                  key={app.name}
                  href="#"
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#f5f5f5] transition-colors"
                >
                  {app.letter === "grid" ? (
                    <div className="w-12 h-12 flex items-center justify-center">
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                        <rect x="2" y="2" width="5" height="5" rx="1" fill="#333" />
                        <rect x="11" y="2" width="5" height="5" rx="1" fill="#333" />
                        <rect x="20" y="2" width="5" height="5" rx="1" fill="#333" />
                        <rect x="2" y="11" width="5" height="5" rx="1" fill="#333" />
                        <rect x="11" y="11" width="5" height="5" rx="1" fill="#333" />
                        <rect x="20" y="11" width="5" height="5" rx="1" fill="#333" />
                        <rect x="2" y="20" width="5" height="5" rx="1" fill="#333" />
                        <rect x="11" y="20" width="5" height="5" rx="1" fill="#333" />
                        <rect x="20" y="20" width="5" height="5" rx="1" fill="#333" />
                      </svg>
                    </div>
                  ) : (
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg font-bold"
                      style={{ backgroundColor: app.color }}
                    >
                      {app.letter.length > 2 ? (
                        <span className="text-[10px] font-semibold">{app.letter}</span>
                      ) : (
                        app.letter
                      )}
                    </div>
                  )}
                  <span className="text-xs text-[#333] text-center leading-tight">{app.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="mx-5 border-t border-[#e0e0e0]" />

          {/* Create section */}
          <div className="px-5 py-4">
            <div className="grid grid-cols-5 gap-2">
              {[
                { name: "Document", color: "#185abd", letter: "W" },
                { name: "Workbook", color: "#107c41", letter: "X" },
                { name: "Presentation", color: "#c43e1c", letter: "P" },
                { name: "Survey", color: "#038387", letter: "F" },
                { name: "Create more", color: "transparent", letter: "plus" },
              ].map((item) => (
                <a
                  key={item.name}
                  href="#"
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#f5f5f5] transition-colors"
                >
                  {item.letter === "plus" ? (
                    <div className="w-12 h-12 rounded-full border-2 border-[#999] flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-12 h-14 rounded bg-[#f0f0f0] border border-[#e0e0e0] flex items-end justify-start p-1 relative">
                      <div
                        className="w-4 h-4 rounded-sm flex items-center justify-center text-white text-[8px] font-bold"
                        style={{ backgroundColor: item.color }}
                      >
                        {item.letter}
                      </div>
                    </div>
                  )}
                  <span className="text-xs text-[#333] text-center leading-tight">{item.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {activeDrawer && (
        <div
          className="fixed inset-0 z-[998]"
          onClick={() => setActiveDrawer(null)}
        />
      )}

      {/* Settings Drawer */}
      <div
        className="fixed right-0 z-[999] w-[340px] bg-[#faf9f8] shadow-[-4px_0_16px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-in-out"
        style={{
          fontFamily: "Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
          transform: activeDrawer === "settings" ? "translateX(0)" : "translateX(100%)",
          top: 48,
          height: "calc(100vh - 48px)",
        }}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-xl font-bold text-[#1a1a1a]">Settings</h2>
          <button onClick={() => setActiveDrawer(null)} className="text-[#666] hover:text-[#1a1a1a] p-1 cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="px-6 pb-6">
          <h3 className="text-base font-bold text-[#1a1a1a] mb-2">SharePoint</h3>
          <div className="flex flex-col gap-1.5">
            <a href="#" className="text-sm text-[#0078d4] hover:underline">Site contents</a>
            <a href="#" className="text-sm text-[#0078d4] hover:underline">Site permissions</a>
            <a href="#" className="text-sm text-[#0078d4] hover:underline">Site usage</a>
            <a href="#" className="text-sm text-[#0078d4] hover:underline">Site reviews</a>
          </div>
        </div>
        <div className="mx-6 border-t border-[#e0e0e0]" />
        <div className="px-6 pt-6">
          <h3 className="text-base font-bold text-[#1a1a1a] mb-2">Microsoft 365</h3>
          <a href="#" className="text-sm text-[#0078d4] hover:underline">View all</a>
        </div>
      </div>

      {/* Help Drawer */}
      <div
        className="fixed right-0 z-[999] w-[380px] bg-[#faf9f8] shadow-[-4px_0_16px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-in-out overflow-y-auto"
        style={{
          fontFamily: "Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
          transform: activeDrawer === "help" ? "translateX(0)" : "translateX(100%)",
          top: 48,
          height: "calc(100vh - 48px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-xl font-bold text-[#1a1a1a]">Help</h2>
          <button onClick={() => setActiveDrawer(null)} className="text-[#666] hover:text-[#1a1a1a] p-1 cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Search help */}
        <div className="px-6 pb-4">
          <div className="relative">
            <svg
              className="absolute left-12 top-1/2 -translate-y-1/2 text-[#666]"
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search help"
              className="w-full pl-20 pr-4 py-3 text-sm border border-[#e0e0e0] rounded-lg bg-white text-[#1a1a1a] outline-none focus:border-[#0078d4]"
            />
          </div>
        </div>

        {/* Quick links */}
        <div className="mx-6 mb-4 border border-[#e0e0e0] rounded-lg bg-white">
          {[
            { icon: "check", label: "Get started" },
            { icon: "people", label: "Sharing & permissions" },
            { icon: "docs", label: "Documents & libraries" },
            { icon: "list", label: "Data & lists" },
            { icon: "page", label: "Pages" },
            { icon: "sites", label: "Sites" },
            { icon: "wrench", label: "Troubleshoot" },
          ].map((item, idx) => (
            <a
              key={item.label}
              href="#"
              className="flex items-center gap-4 px-5 py-3 text-sm text-[#333] hover:bg-[#f5f5f5] transition-colors"
              style={{ borderTop: idx > 0 ? "none" : "none" }}
            >
              <span className="text-[#333] w-5 flex-shrink-0">
                {item.icon === "check" && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                )}
                {item.icon === "people" && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                )}
                {item.icon === "docs" && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><rect x="8" y="13" width="8" height="1" /></svg>
                )}
                {item.icon === "list" && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                )}
                {item.icon === "page" && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /></svg>
                )}
                {item.icon === "sites" && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                )}
                {item.icon === "wrench" && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                )}
              </span>
              <span>{item.label}</span>
            </a>
          ))}
        </div>

        {/* Explore team sites card */}
        <div className="mx-6 mb-4 border border-[#e0e0e0] rounded-lg bg-white overflow-hidden">
          <div className="p-5">
            <h3 className="text-base font-bold text-[#1a1a1a] mb-3">Explore team sites</h3>
            {/* Placeholder illustration */}
            <div className="rounded-md overflow-hidden mb-4 border border-[#e8e8e8]">
              <div className="bg-[#1a1a1a] h-6 w-full" />
              <div className="bg-[#f5f5f5] p-3 flex gap-2">
                <div className="flex-1 space-y-2">
                  <div className="h-2 bg-[#ddd] rounded w-3/4" />
                  <div className="h-1.5 bg-[#e8e8e8] rounded w-1/2" />
                  <div className="h-8 bg-[#0078d4] rounded w-1 mt-2" />
                  <div className="space-y-1">
                    <div className="h-1.5 bg-[#ddd] rounded w-full" />
                    <div className="h-1.5 bg-[#ddd] rounded w-4/5" />
                    <div className="h-1.5 bg-[#ddd] rounded w-3/5" />
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-14 h-16 bg-[#e8e8e8] rounded flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  </div>
                  <div className="w-14 h-16 bg-[#e8e8e8] rounded flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-[#333] leading-relaxed mb-3">
              A SharePoint team site connects you and your team to shared files, news, and information.
            </p>
            <a href="#" className="text-sm text-[#0078d4] hover:underline">Learn more about team sites</a>
          </div>
        </div>

        {/* Featured Topics card */}
        <div className="mx-6 mb-4 border border-[#e0e0e0] rounded-lg bg-white">
          <div className="p-5">
            <h3 className="text-base font-bold text-[#1a1a1a] mb-4">Featured Topics</h3>
            <div className="flex flex-col gap-4">
              {[
                "Share SharePoint files or folders in Microsoft 365",
                "Move or copy files in SharePoint",
                "What is a document library?",
                "Discover content with the SharePoint home page",
              ].map((topic) => (
                <a key={topic} href="#" className="flex items-start gap-3 text-sm text-[#333] hover:text-[#0078d4]">
                  <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  <span>{topic}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="px-6 py-6 text-center text-xs text-[#666] space-x-1">
          <a href="#" className="text-[#0078d4] hover:underline">Legal</a>
          <span>|</span>
          <a href="#" className="text-[#0078d4] hover:underline">Privacy & cookies</a>
          <br />
          <a href="#" className="text-[#0078d4] hover:underline">Consumer Health Privacy</a>
          <br />
          <a href="#" className="text-[#0078d4] hover:underline">Your Privacy Choices</a>
        </div>
      </div>
    </>
  );
}
