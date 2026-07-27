"use client";

import type { Project } from "@/lib/types";
import { STATUS_COLORS } from "@/lib/types";
import IconTile from "@/components/IconTile";
import { StarIcon } from "@/components/icons";

export default function ProjectListItem({
  project,
  isFavorite,
  onToggleFavorite,
  onSelect,
}: {
  project: Project;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSelect: (project: Project) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(project)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSelect(project);
      }}
      className="group flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/[0.05]"
    >
      <IconTile name={project.name} icon={project.icon} size={30} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[13px] font-medium text-zinc-100">{project.name}</span>
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: STATUS_COLORS[project.status] }}
            title={project.status}
          />
        </div>
        <p className="truncate text-[11px] text-zinc-500">
          {(project.techStack ?? []).slice(0, 2).join(" · ") || project.status}
          {project.lastUpdated ? ` · ${project.lastUpdated}` : ""}
        </p>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(project.id);
        }}
        className={`shrink-0 rounded-md p-1 text-zinc-500 transition-colors hover:text-amber-300 ${
          isFavorite ? "text-amber-300" : ""
        }`}
        aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
      >
        <StarIcon filled={isFavorite} />
      </button>
    </div>
  );
}
