"use client";

import { useMemo, useState } from "react";
import type { Project, ProjectCategory } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import { SearchIcon } from "@/components/icons";
import ProjectListItem from "./ProjectListItem";

export default function SidePanel({
  projects,
  favorites,
  onToggleFavorite,
  onSelectProject,
  searchQuery,
  onSearchChange,
}: {
  projects: Project[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectProject: (project: Project) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | "All">("All");
  const query = searchQuery.trim().toLowerCase();

  const filtered = useMemo(() => {
    return projects.filter((project) => {
      if (activeCategory !== "All" && project.category !== activeCategory) return false;
      if (!query) return true;
      const haystack = [project.name, project.category, project.status, ...(project.techStack ?? [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [projects, activeCategory, query]);

  const grouped = useMemo(() => {
    const map = new Map<ProjectCategory, Project[]>();
    for (const category of CATEGORIES) map.set(category, []);
    for (const project of filtered) {
      map.get(project.category)?.push(project);
    }
    return map;
  }, [filtered]);

  return (
    <aside className="pointer-events-auto fixed inset-y-0 right-0 z-20 flex w-[340px] flex-col border-l border-white/[0.08] bg-[#09090b]/70 backdrop-blur-2xl">
      <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4">
        <h1 className="text-[13px] font-semibold tracking-wide text-zinc-100">Development Universe</h1>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
            <SearchIcon />
          </span>
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-9 pr-3 text-[13px] text-zinc-100 placeholder:text-zinc-500 outline-none transition-colors focus:border-white/[0.16] focus:bg-white/[0.06]"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["All", ...CATEGORIES] as const).map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                activeCategory === category
                  ? "bg-zinc-100 text-zinc-900"
                  : "bg-white/[0.04] text-zinc-400 ring-1 ring-inset ring-white/[0.06] hover:bg-white/[0.07] hover:text-zinc-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {CATEGORIES.map((category) => {
          const items = grouped.get(category) ?? [];
          if (items.length === 0) return null;
          return (
            <div key={category} className="mb-4">
              <h2 className="mb-1.5 px-1 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                {category}
              </h2>
              <div className="flex flex-col gap-0.5">
                {items.map((project) => (
                  <ProjectListItem
                    key={project.id}
                    project={project}
                    isFavorite={favorites.includes(project.id)}
                    onToggleFavorite={onToggleFavorite}
                    onSelect={onSelectProject}
                  />
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="px-1 py-8 text-center text-xs text-zinc-500">No projects match.</p>
        )}
      </div>
    </aside>
  );
}
