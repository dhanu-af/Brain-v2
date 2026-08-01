"use client";

import { getStatusColor, type ProjectStatus } from "@/lib/types";

const STATUSES: ProjectStatus[] = ["Live", "Development", "Testing", "Archived"];

export default function Legend({
  activeStatus,
  onSelectStatus,
}: {
  activeStatus: ProjectStatus | null;
  onSelectStatus: (status: ProjectStatus) => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center px-4">
      <div className="pointer-events-auto flex flex-wrap items-center gap-x-1 gap-y-1.5 rounded-full border border-white/[0.1] bg-[#050505]/70 px-2 py-1.5 shadow-2xl backdrop-blur-2xl">
        {STATUSES.map((status) => {
          const isActive = activeStatus === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => onSelectStatus(status)}
              title={isActive ? `Showing ${status} only — click to show all` : `Show ${status} only`}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors ${
                isActive ? "bg-white/[0.12] ring-1 ring-inset ring-white/[0.2]" : "hover:bg-white/[0.05]"
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: getStatusColor(status), boxShadow: `0 0 6px ${getStatusColor(status)}` }}
              />
              <span className={`text-[11px] ${isActive ? "text-zinc-100" : "text-zinc-400"}`}>{status}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
