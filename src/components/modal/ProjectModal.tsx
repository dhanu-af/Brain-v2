"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Project } from "@/lib/types";
import { HUB_ID, getStatusColor } from "@/lib/types";
import { buildLinks } from "@/lib/graphData";
import IconTile from "@/components/IconTile";
import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  GithubIcon,
  StarIcon,
  TerminalIcon,
  VercelIcon,
} from "@/components/icons";

function ActionButton({
  href,
  onClick,
  primary,
  children,
}: {
  href?: string;
  onClick?: () => void;
  primary?: boolean;
  children: React.ReactNode;
}) {
  const className = `flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors ${
    primary
      ? "bg-zinc-100 text-zinc-900 hover:bg-white"
      : "text-zinc-300 ring-1 ring-inset ring-white/[0.1] hover:bg-white/[0.06]"
  }`;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</span>
      <span className="text-[13px] text-zinc-200">{value}</span>
    </div>
  );
}

export default function ProjectModal({
  project,
  allProjects,
  isFavorite,
  onToggleFavorite,
  onClose,
}: {
  project: Project | null;
  allProjects: Project[];
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const connectedNames = useMemo(() => {
    if (!project) return [];
    const links = buildLinks(allProjects, HUB_ID);
    const byId = new Map(allProjects.map((p) => [p.id, p]));
    const connectedIds = new Set<string>();
    for (const link of links) {
      if (link.source === HUB_ID || link.target === HUB_ID) continue;
      if (link.source === project.id) connectedIds.add(link.target);
      if (link.target === project.id) connectedIds.add(link.source);
    }
    return Array.from(connectedIds)
      .map((id) => byId.get(id)?.name)
      .filter((name): name is string => Boolean(name));
  }, [project, allProjects]);

  async function handleCopy(project: Project) {
    const url = project.website ?? project.localhost ?? "";
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable, ignore
    }
  }

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            key="modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92, rotateX: -8, y: 16 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, rotateX: 6, y: 10 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            style={{ perspective: 1200, transformStyle: "preserve-3d" }}
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/[0.1] bg-white/[0.06] p-6 shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <IconTile name={project.name} icon={project.icon} size={52} />
                <div>
                  <h2 className="text-lg font-semibold text-zinc-100">{project.name}</h2>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: getStatusColor(project.status) }}
                    />
                    <span className="text-xs text-zinc-400">
                      {project.status} · {project.category}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onToggleFavorite(project.id)}
                  aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 ring-1 ring-inset ring-white/[0.08] transition-colors hover:bg-white/[0.06] ${
                    isFavorite ? "text-amber-300" : ""
                  }`}
                >
                  <StarIcon filled={isFavorite} />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 ring-1 ring-inset ring-white/[0.08] transition-colors hover:bg-white/[0.06]"
                >
                  ×
                </button>
              </div>
            </div>

            <p className="mt-4 text-[13px] leading-relaxed text-zinc-300">{project.description}</p>
            {project.purpose && (
              <p className="mt-1.5 text-[12px] italic leading-relaxed text-zinc-500">{project.purpose}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {project.website && (
                <ActionButton href={project.website} primary>
                  <ExternalLinkIcon />
                  Open Website
                </ActionButton>
              )}
              {project.localhost && (
                <ActionButton href={project.localhost}>
                  <TerminalIcon />
                  Open Localhost
                </ActionButton>
              )}
              {project.github && (
                <ActionButton href={project.github}>
                  <GithubIcon />
                  GitHub
                </ActionButton>
              )}
              {project.vercel && (
                <ActionButton href={project.vercel}>
                  <VercelIcon />
                  Vercel
                </ActionButton>
              )}
              <ActionButton onClick={() => handleCopy(project)}>
                {copied ? <CheckIcon /> : <CopyIcon />}
                {copied ? "Copied" : "Copy URL"}
              </ActionButton>
            </div>

            {project.screenshots && project.screenshots.length > 0 && (
              <div className="mt-5">
                <span className="text-[11px] uppercase tracking-wider text-zinc-500">
                  Screenshots
                </span>
                <div className="mt-1.5 flex gap-2 overflow-x-auto pb-1">
                  {project.screenshots.map((src) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={src}
                      src={src}
                      alt=""
                      className="h-24 w-40 shrink-0 rounded-lg object-cover ring-1 ring-inset ring-white/[0.08]"
                    />
                  ))}
                </div>
              </div>
            )}

            {project.techStack && project.techStack.length > 0 && (
              <div className="mt-5">
                <span className="text-[11px] uppercase tracking-wider text-zinc-500">
                  Technology Stack
                </span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-zinc-300 ring-1 ring-inset ring-white/[0.08]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-4">
              <InfoRow label="Company" value={project.company} />
              <InfoRow label="Framework" value={project.framework} />
              <InfoRow label="Database" value={project.database} />
              <InfoRow label="Hosting" value={project.hosting} />
              <InfoRow label="Version" value={project.version} />
              <InfoRow label="Created" value={project.createdDate} />
              <InfoRow label="Last Updated" value={project.lastUpdated} />
            </div>

            {connectedNames.length > 0 && (
              <div className="mt-5">
                <span className="text-[11px] uppercase tracking-wider text-zinc-500">
                  Connected Projects
                </span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {connectedNames.map((name) => (
                    <span
                      key={name}
                      className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-zinc-300 ring-1 ring-inset ring-white/[0.08]"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.aiFeatures && project.aiFeatures.length > 0 && (
              <div className="mt-5">
                <span className="text-[11px] uppercase tracking-wider text-zinc-500">
                  AI Features
                </span>
                <ul className="mt-1.5 flex flex-col gap-1">
                  {project.aiFeatures.map((feature) => (
                    <li key={feature} className="text-[13px] leading-relaxed text-zinc-300">
                      · {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {project.notes && (
              <div className="mt-5">
                <span className="text-[11px] uppercase tracking-wider text-zinc-500">
                  Development Notes
                </span>
                <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-300">{project.notes}</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
