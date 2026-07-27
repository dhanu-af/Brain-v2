"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/lib/types";
import { SearchIcon } from "@/components/icons";
import { logout } from "@/lib/auth-actions";
import ProjectListItem from "./ProjectListItem";
import TimeMachineList from "./TimeMachineList";

type Tab = "browse" | "timeline";

function uniqueSorted(values: (string | undefined)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v)))).sort();
}

export default function SidePanel({
  projects,
  favorites,
  onToggleFavorite,
  onSelectProject,
  searchQuery,
  onSearchChange,
  onOpenInsights,
}: {
  projects: Project[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectProject: (project: Project) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOpenInsights: () => void;
}) {
  const [tab, setTab] = useState<Tab>("browse");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeStatus, setActiveStatus] = useState<string>("All");
  const [activeTech, setActiveTech] = useState<string>("All");
  const [pinnedOnly, setPinnedOnly] = useState(false);

  const query = searchQuery.trim().toLowerCase();

  // Every filter option is derived from the data itself — a brand-new
  // category/status/technology in projects.json shows up here automatically.
  const categories = useMemo(() => uniqueSorted(projects.map((p) => p.category)), [projects]);
  const statuses = useMemo(() => uniqueSorted(projects.map((p) => p.status)), [projects]);
  const techs = useMemo(() => uniqueSorted(projects.flatMap((p) => p.techStack ?? [])), [projects]);

  const filtered = useMemo(() => {
    return projects.filter((project) => {
      if (activeCategory !== "All" && project.category !== activeCategory) return false;
      if (activeStatus !== "All" && project.status !== activeStatus) return false;
      if (activeTech !== "All" && !(project.techStack ?? []).includes(activeTech)) return false;
      if (pinnedOnly && !favorites.includes(project.id)) return false;
      if (!query) return true;
      const haystack = [
        project.name,
        project.category,
        project.status,
        project.company,
        project.framework,
        project.database,
        project.description,
        ...(project.techStack ?? []),
        ...(project.tags ?? []),
        ...(project.aiFeatures ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [projects, activeCategory, activeStatus, activeTech, pinnedOnly, favorites, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Project[]>();
    for (const project of filtered) {
      const list = map.get(project.category) ?? [];
      list.push(project);
      map.set(project.category, list);
    }
    return map;
  }, [filtered]);

  return (
    <aside className="pointer-events-auto fixed inset-y-0 right-0 z-20 flex w-[360px] flex-col border-l border-white/[0.08] bg-[#09090b]/70 backdrop-blur-2xl">
      <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[13px] font-semibold tracking-wide text-zinc-100">Dhanu Brain</h1>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenInsights}
              className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-zinc-300 ring-1 ring-inset ring-white/[0.08] transition-colors hover:bg-white/[0.08]"
            >
              AI Insights
            </button>
            <form action={logout}>
              <button
                type="submit"
                title="Log out"
                aria-label="Log out"
                className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-zinc-400 ring-1 ring-inset ring-white/[0.08] transition-colors hover:bg-white/[0.08] hover:text-zinc-200"
              >
                Log out
              </button>
            </form>
          </div>
        </div>

        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
            <SearchIcon />
          </span>
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search everything..."
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-9 pr-3 text-[13px] text-zinc-100 placeholder:text-zinc-500 outline-none transition-colors focus:border-white/[0.16] focus:bg-white/[0.06]"
          />
        </div>

        <div className="flex gap-1.5">
          {(["browse", "timeline"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-[12px] font-medium capitalize transition-colors ${
                tab === t
                  ? "bg-zinc-100 text-zinc-900"
                  : "bg-white/[0.04] text-zinc-400 ring-1 ring-inset ring-white/[0.06] hover:bg-white/[0.07]"
              }`}
            >
              {t === "browse" ? "Browse" : "Time Machine"}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPinnedOnly((v) => !v)}
            className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${
              pinnedOnly
                ? "bg-amber-400/20 text-amber-300 ring-1 ring-inset ring-amber-400/30"
                : "bg-white/[0.04] text-zinc-400 ring-1 ring-inset ring-white/[0.06] hover:bg-white/[0.07]"
            }`}
          >
            Pinned
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {["All", ...categories].map((category) => (
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

        <div className="flex flex-wrap items-center gap-1.5">
          {["All", ...statuses].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setActiveStatus(status)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                activeStatus === status
                  ? "bg-zinc-100 text-zinc-900"
                  : "bg-white/[0.04] text-zinc-400 ring-1 ring-inset ring-white/[0.06] hover:bg-white/[0.07] hover:text-zinc-200"
              }`}
            >
              {status}
            </button>
          ))}
          <select
            value={activeTech}
            onChange={(e) => setActiveTech(e.target.value)}
            className="ml-auto rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[11px] text-zinc-300 outline-none"
          >
            <option value="All">All tech</option>
            {techs.map((tech) => (
              <option key={tech} value={tech}>
                {tech}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {tab === "timeline" ? (
          <TimeMachineList
            projects={filtered}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
            onSelectProject={onSelectProject}
          />
        ) : (
          <>
            {categories
              .filter((category) => (grouped.get(category) ?? []).length > 0)
              .map((category) => (
                <div key={category} className="mb-4">
                  <h2 className="mb-1.5 px-1 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                    {category}
                  </h2>
                  <div className="flex flex-col gap-0.5">
                    {(grouped.get(category) ?? []).map((project) => (
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
              ))}
            {filtered.length === 0 && (
              <p className="px-1 py-8 text-center text-xs text-zinc-500">No projects match.</p>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
