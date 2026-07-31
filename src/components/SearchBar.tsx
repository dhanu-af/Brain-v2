"use client";

import { SearchIcon } from "@/components/icons";

export default function SearchBar({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-20 flex justify-center px-4">
      <div className="pointer-events-auto relative w-full max-w-md">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
          <SearchIcon />
        </span>
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search the graph..."
          className="w-full rounded-full border border-white/[0.1] bg-[#050505]/70 py-3 pl-11 pr-4 text-[14px] text-zinc-100 shadow-2xl backdrop-blur-2xl outline-none transition-colors placeholder:text-zinc-500 focus:border-emerald-400/40 focus:bg-[#050505]/85"
        />
      </div>
    </div>
  );
}
