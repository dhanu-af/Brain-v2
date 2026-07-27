"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/lib/types";
import ProjectListItem from "./ProjectListItem";

type SortMode = "newest" | "oldest";

function dateKey(project: Project): string {
  return project.createdDate ?? project.lastUpdated ?? "0000-00-00";
}

export default function TimeMachineList({
  projects,
  favorites,
  onToggleFavorite,
  onSelectProject,
}: {
  projects: Project[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectProject: (project: Project) => void;
}) {
  const [sort, setSort] = useState<SortMode>("newest");

  const sorted = useMemo(() => {
    const dated = projects.filter((p) => p.createdDate || p.lastUpdated);
    const undated = projects.filter((p) => !p.createdDate && !p.lastUpdated);
    dated.sort((a, b) => {
      const cmp = dateKey(b).localeCompare(dateKey(a));
      return sort === "newest" ? cmp : -cmp;
    });
    return [...dated, ...undated];
  }, [projects, sort]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1.5 px-1">
        {(["newest", "oldest"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setSort(mode)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${
              sort === mode
                ? "bg-zinc-100 text-zinc-900"
                : "bg-white/[0.04] text-zinc-400 ring-1 ring-inset ring-white/[0.06] hover:bg-white/[0.07]"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        {sorted.map((project) => (
          <div key={project.id} className="flex items-center gap-2">
            <span className="w-[68px] shrink-0 text-[10px] text-zinc-500">
              {project.createdDate ?? project.lastUpdated ?? "—"}
            </span>
            <div className="min-w-0 flex-1">
              <ProjectListItem
                project={project}
                isFavorite={favorites.includes(project.id)}
                onToggleFavorite={onToggleFavorite}
                onSelect={onSelectProject}
              />
            </div>
          </div>
        ))}
      </div>
      {sorted.length === 0 && (
        <p className="px-1 py-8 text-center text-xs text-zinc-500">No projects yet.</p>
      )}
    </div>
  );
}
