# Task 1: Company Leader Board 2025 — Approach Report

## Objective

Recreate the Company Leader Board 2025 page from a SharePoint-based HTML reference as a Next.js application, matching the original layout, styles, colors, and structure while replacing all real employee data with generated mock data.

## Tools & Technologies

- **Next.js 16** with App Router and TypeScript
- **Tailwind CSS v4** for layout-level styling (page background, breadcrumbs, title)
- **Inline styles** for the Leaderboard component — chosen to precisely match the original CSS values extracted from the reference HTML without needing to map every property to Tailwind utility classes
- **Claude Code** for development assistance, code generation, and iterative refinement based on screenshot comparisons

## Approach

### 1. Extracting the Reference Design

The original page was a saved SharePoint HTML file (~2.2 MB). I used regex-based extraction to pull out all CSS class definitions scoped to the leaderboard component (identified by the `_2943a085` suffix). This gave me exact values for:

- Colors (`#0f172a`, `#64748b`, `#0ea5e9`, `#eab308`, etc.)
- Font sizes, weights, and font-family stack (Segoe UI system font stack)
- Border radii (12px for cards, 20px for score pills, 50% for avatars)
- Padding, margins, gaps, and max-widths
- Box shadows and gradients for podium blocks
- Expanded/collapsed row states (border color `#0ea5e9`)

I also extracted the HTML structure to understand the component hierarchy: section > header + filterBar + podium + list.

### 2. Component Architecture

The app is split into reusable components:

| Component | Purpose |
|---|---|
| `Header.tsx` | Top dark bar with search, help icon, user avatar |
| `Navigation.tsx` | Gray nav bar with 12 menu items and dropdown indicators |
| `Breadcrumbs.tsx` | Reusable breadcrumb trail with link support |
| `Leaderboard.tsx` | Main leaderboard: filter bar, podium, expandable list |
| `leaders.ts` | Mock data generator for 100 leaders |

### 3. Data Replacement Strategy

All original employee data was replaced with procedurally generated mock data:

- **Names**: Combined from arrays of 100 first names and 100 last names using a seeded pseudo-random number generator (`seededRandom(42)`) for deterministic output
- **Roles**: Randomly assigned from 30 engineering/design/management titles paired with location codes (e.g., `UA.D1.G1`, `PL.G6`)
- **Scores**: Calculated using a descending formula (`500 - rank * 4 - random jitter`) to produce a natural-looking distribution
- **Avatars**: Sourced from `i.pravatar.cc` placeholder avatar service with varied image IDs
- **Activities**: Generated with randomized combinations of activity prefixes (`[REG]`, `[UNI]`, `[COM]`), action types, subjects/persons, categories, dates, and point values
- **Category stats**: Each leader receives 1-3 randomly assigned category icons with counts

The seeded RNG ensures the same data is generated on every render, avoiding hydration mismatches between server and client.

### 4. Iterative Refinement

Development followed an iterative screenshot-comparison workflow:

1. Built initial structure from the reference HTML
2. Compared rendered output against screenshots
3. Adjusted specific values (podium heights, background colors, border radius, padding) until the visual output matched
4. Fixed edge cases like the rank "3" being cut off by increasing the 3rd-place podium block height from 96px to 128px

## File Structure

```
task-1/
├── src/app/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   ├── Breadcrumbs.tsx
│   │   └── Leaderboard.tsx
│   ├── data/
│   │   └── leaders.ts
│   ├── leaderboard/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── next.config.ts
├── package.json
└── tsconfig.json
```
