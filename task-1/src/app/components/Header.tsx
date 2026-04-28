"use client";

import { useState } from "react";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="bg-[#2d2d2d] flex items-center justify-between px-4 py-2">
      {/* Waffle/Grid icon */}
      <button className="text-white hover:bg-[#444] p-1 rounded">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="2" y="2" width="4" height="4" rx="0.5" fill="white" />
          <rect x="8" y="2" width="4" height="4" rx="0.5" fill="white" />
          <rect x="14" y="2" width="4" height="4" rx="0.5" fill="white" />
          <rect x="2" y="8" width="4" height="4" rx="0.5" fill="white" />
          <rect x="8" y="8" width="4" height="4" rx="0.5" fill="white" />
          <rect x="14" y="8" width="4" height="4" rx="0.5" fill="white" />
          <rect x="2" y="14" width="4" height="4" rx="0.5" fill="white" />
          <rect x="8" y="14" width="4" height="4" rx="0.5" fill="white" />
          <rect x="14" y="14" width="4" height="4" rx="0.5" fill="white" />
        </svg>
      </button>

      {/* Search bar */}
      <div className="flex-1 flex justify-center mx-4">
        <div className="relative w-full max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 bg-white text-sm text-gray-900 rounded-sm border border-blue-500 outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Right side: Help + Avatar */}
      <div className="flex items-center gap-3">
        <button className="text-white hover:bg-[#444] p-1 rounded">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
        <div className="w-8 h-8 rounded-full bg-[#6b5b95] flex items-center justify-center text-white text-xs font-semibold">
          YM
        </div>
      </div>
    </header>
  );
}
