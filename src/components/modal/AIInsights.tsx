"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Project } from "@/lib/types";
import { HUB_ID, getStatusColor } from "@/lib/types";
import { buildLinks } from "@/lib/graphData";

function countBy(values: string[]): [string, number][] {
  const map = new Map<string, number>();
  for (const value of values) map.set(value, (map.get(value) ?? 0) + 1);
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
}

function normalizeHosting(value: string): string {
  return value.split(/[—(]/)[0].trim();
}

function dateKey(project: Project): string | undefined {
  return project.createdDate ?? project.lastUpdated;
}

function StatTile({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
      <div className="flex items-center gap-1.5">
        {color && <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />}
        <span className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</span>
      </div>
      <p className="mt-1 text-xl font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

function UsageList({ title, items }: { title: string; items: [string, number][] }) {
  if (items.length === 0) return null;
  const max = items[0][1];
  return (
    <div>
      <h3 className="mb-2 text-[11px] uppercase tracking-wider text-zinc-500">{title}</h3>
      <div className="flex flex-col gap-1.5">
        {items.slice(0, 6).map(([label, count]) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-28 shrink-0 truncate text-[12px] text-zinc-300">{label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-emerald-400/60"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
            <span className="w-4 shrink-0 text-right text-[11px] text-zinc-500">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
      <span className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</span>
      <p className="mt-1 truncate text-[13px] text-zinc-100">{value}</p>
    </div>
  );
}

export default function AIInsights({
  projects,
  open,
  onClose,
}: {
  projects: Project[];
  open: boolean;
  onClose: () => void;
}) {
  const stats = useMemo(() => {
    const statusCounts = countBy(projects.map((p) => p.status));
    const techCounts = countBy(projects.flatMap((p) => p.techStack ?? []));
    const frameworkCounts = countBy(projects.map((p) => p.framework).filter((v): v is string => Boolean(v)));
    const databaseCounts = countBy(projects.map((p) => p.database).filter((v): v is string => Boolean(v)));
    const hostingCounts = countBy(
      projects.map((p) => p.hosting).filter((v): v is string => Boolean(v)).map(normalizeHosting)
    );

    const links = buildLinks(projects, HUB_ID);
    const connectionCounts = new Map<string, number>();
    for (const link of links) {
      if (link.source === HUB_ID || link.target === HUB_ID) continue;
      connectionCounts.set(link.source, (connectionCounts.get(link.source) ?? 0) + 1);
      connectionCounts.set(link.target, (connectionCounts.get(link.target) ?? 0) + 1);
    }
    const mostConnected = projects.reduce<{ project: Project; count: number } | null>((best, project) => {
      const count = connectionCounts.get(project.id) ?? 0;
      if (!best || count > best.count) return { project, count };
      return best;
    }, null);

    const dated = projects.filter((p) => dateKey(p));
    const newest = dated.length ? dated.reduce((a, b) => (dateKey(b)! > dateKey(a)! ? b : a)) : null;
    const oldest = dated.length ? dated.reduce((a, b) => (dateKey(b)! < dateKey(a)! ? b : a)) : null;

    return { statusCounts, techCounts, frameworkCounts, databaseCounts, hostingCounts, mostConnected, newest, oldest };
  }, [projects]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.1] bg-white/[0.06] p-6 shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">AI Insights</h2>
                <p className="text-xs text-zinc-500">Live statistics computed from every project.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 ring-1 ring-inset ring-white/[0.08] transition-colors hover:bg-white/[0.06]"
              >
                ×
              </button>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
              <StatTile label="Total" value={projects.length} />
              {stats.statusCounts.map(([status, count]) => (
                <StatTile key={status} label={status} value={count} color={getStatusColor(status)} />
              ))}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <UsageList title="Technology Usage" items={stats.techCounts} />
              <UsageList title="Framework Usage" items={stats.frameworkCounts} />
              <UsageList title="Database Usage" items={stats.databaseCounts} />
              <UsageList title="Hosting Providers" items={stats.hostingCounts} />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {stats.mostConnected && stats.mostConnected.count > 0 && (
                <InfoTile
                  label="Most Connected Project"
                  value={`${stats.mostConnected.project.name} (${stats.mostConnected.count})`}
                />
              )}
              <InfoTile label="Newest Project" value={stats.newest?.name} />
              <InfoTile label="Oldest Project" value={stats.oldest?.name} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
