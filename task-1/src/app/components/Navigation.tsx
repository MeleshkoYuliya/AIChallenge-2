"use client";

import { useState } from "react";
import Link from "next/link";

interface SubItem {
  label: string;
  href: string;
  hasSubmenu?: boolean;
}

interface NavItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
  children?: SubItem[];
}

const navItems: NavItem[] = [
  { label: "Knowledge Base", href: "#" },
  {
    label: "Company Info", href: "#", hasDropdown: true,
    children: [
      { label: "Mission & Values", href: "#" },
      { label: "Communication Standards", href: "#" },
      { label: "Internal Apps", href: "#" },
      { label: "Vention Impact", href: "#" },
      { label: "LD Mailing Groups", href: "#" },
      { label: "Travel Group", href: "#" },
      { label: "Brand", href: "#", hasSubmenu: true },
    ],
  },
  {
    label: "News & Events", href: "#", hasDropdown: true,
    children: [
      { label: "News", href: "#" },
      { label: "Events", href: "#" },
      { label: "Projects", href: "#" },
      { label: "Public & Corporate Holidays", href: "#" },
    ],
  },
  {
    label: "Personal Growth", href: "#", hasDropdown: true,
    children: [
      { label: "Performance Review", href: "#" },
      { label: "Interview Preparation Guide", href: "#" },
      { label: "English Training Center", href: "#" },
      { label: "Soft Skills", href: "#" },
      { label: "Trophy", href: "#" },
      { label: "EDU", href: "#", hasSubmenu: true },
    ],
  },
  { label: "Benefits", href: "#" },
  { label: "Policies", href: "#" },
  { label: "Instructions and Guides", href: "#" },
  {
    label: "Locations", href: "#", hasDropdown: true,
    children: [
      { label: "Delivery", href: "#", hasSubmenu: true },
      { label: "Sales", href: "#", hasSubmenu: true },
    ],
  },
  {
    label: "Spaces", href: "#", hasDropdown: true,
    children: [
      { label: "AI at Vention", href: "#" },
      { label: "Sales Materials", href: "#" },
      { label: "Divisions", href: "#", hasSubmenu: true },
    ],
  },
  { label: "Wiki Search", href: "#" },
  { label: "Marketing", href: "#" },
  { label: "InfoSec", href: "#" },
];

export default function Navigation() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <nav className="bg-[#e0e0e0]">
      {/* Mobile nav bar */}
      <div className="show-mobile items-center gap-3 px-4 py-2 border-b border-[#ccc]">
        <button className="text-[#333] p-1 cursor-pointer" style={{ background: "none", border: "none" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div style={{ width: 32, height: 32, background: "#333", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 600 }}>
            E
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>EDU</span>
        </div>
        <button className="text-[#333] p-1 cursor-pointer" style={{ background: "none", border: "none" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </div>
      {/* Desktop nav */}
      <div className="hide-mobile flex items-center gap-0 px-4">
        {navItems.map((item) => (
          <div key={item.label} className="relative">
            {item.hasDropdown ? (
              <button
                onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                className="flex items-center gap-1 px-3 py-2.5 text-sm text-[#333] hover:bg-[#d0d0d0] whitespace-nowrap transition-colors"
              >
                {item.label}
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="text-[#666]"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            ) : (
              <Link
                href={item.href}
                className="flex items-center gap-1 px-3 py-2.5 text-sm text-[#333] hover:bg-[#d0d0d0] whitespace-nowrap transition-colors"
              >
                {item.label}
              </Link>
            )}

            {/* Dropdown */}
            {item.hasDropdown && openMenu === item.label && item.children && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setOpenMenu(null)}
                />
                <div
                  className="absolute top-full left-0 z-50 bg-[#e0e0e0] rounded-b-lg shadow-lg py-1 min-w-[200px]"
                >
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      onClick={() => setOpenMenu(null)}
                      className="flex items-center justify-between px-4 py-2.5 text-sm text-[#333] hover:bg-[#d0d0d0] whitespace-nowrap"
                    >
                      <span>{child.label}</span>
                      {child.hasSubmenu && (
                        <svg
                          width="12" height="12" viewBox="0 0 24 24" fill="none"
                          stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          className="ml-4"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      )}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
