import Breadcrumbs from "./components/Breadcrumbs";
import Leaderboard from "./components/Leaderboard";

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "EDU", href: "#" },
  { label: "Company Leader Board 2025" },
];

export default function Home() {
  return (
    <main className="flex-1 bg-[#e5e5e5]">
      <div className="max-w-[1200px] mx-auto px-6">
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className="text-[42px] font-bold text-[#1a1a1a] pb-8">
          Company Leader Board 2025
        </h1>
        <Leaderboard />
      </div>
    </main>
  );
}
