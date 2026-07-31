"use client";

import { getStatusColor, type ProjectStatus } from "@/lib/types";

const STATUSES: ProjectStatus[] = ["Live", "Development", "Testing", "Archived"];

export default function Legend() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center px-4">
      <div className="pointer-events-auto flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-full border border-white/[0.1] bg-[#050505]/70 px-5 py-2 shadow-2xl backdrop-blur-2xl">
        {STATUSES.map((status) => (
          <div key={status} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: getStatusColor(status), boxShadow: `0 0 6px ${getStatusColor(status)}` }}
            />
            <span className="text-[11px] text-zinc-400">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
