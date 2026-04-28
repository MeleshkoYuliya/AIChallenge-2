"use client";

import Link from "next/link";

interface NavItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
}

const navItems: NavItem[] = [
  { label: "Knowledge Base", href: "#" },
  { label: "Company Info", href: "#", hasDropdown: true },
  { label: "News & Events", href: "#", hasDropdown: true },
  { label: "Personal Growth", href: "#", hasDropdown: true },
  { label: "Benefits", href: "#" },
  { label: "Policies", href: "#" },
  { label: "Instructions and Guides", href: "#" },
  { label: "Locations", href: "#", hasDropdown: true },
  { label: "Spaces", href: "#", hasDropdown: true },
  { label: "Wiki Search", href: "#" },
  { label: "Marketing", href: "#" },
  { label: "InfoSec", href: "#" },
];

export default function Navigation() {
  return (
    <nav className="bg-[#e0e0e0] border-b border-[#ccc]">
      <div className="flex items-center gap-1 px-4 overflow-x-auto">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-1 px-3 py-2.5 text-sm text-[#333] hover:bg-[#d0d0d0] whitespace-nowrap transition-colors"
          >
            {item.label}
            {item.hasDropdown && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#666]"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
