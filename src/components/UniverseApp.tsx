"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import type { Project } from "@/lib/types";
import Scene from "@/components/graph/Scene";
import SearchBar from "@/components/SearchBar";
import SidePanel from "@/components/panel/SidePanel";
import ProjectModal from "@/components/modal/ProjectModal";
import AIInsights from "@/components/modal/AIInsights";
import {
  getFavoritesSnapshot,
  getRenamesServerSnapshot,
  getRenamesSnapshot,
  getServerSnapshot,
  renameProject,
  subscribeFavorites,
  subscribeRenames,
  toggleFavorite,
} from "@/lib/storage";

function matchesQuery(project: Project, query: string): boolean {
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
}

export default function UniverseApp({ projects }: { projects: Project[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [focusedProjectId, setFocusedProjectId] = useState<string | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);

  const favorites = useSyncExternalStore(subscribeFavorites, getFavoritesSnapshot, getServerSnapshot);
  const renames = useSyncExternalStore(subscribeRenames, getRenamesSnapshot, getRenamesServerSnapshot);

  const displayProjects = useMemo(() => {
    return projects.map((project) => (renames[project.id] ? { ...project, name: renames[project.id] } : project));
  }, [projects, renames]);

  const searchMatchId = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return null;
    const match = displayProjects.find((project) => matchesQuery(project, query));
    return match?.id ?? null;
  }, [searchQuery, displayProjects]);

  const activeFocusId = searchMatchId ?? focusedProjectId;
  const selectedProject = selectedProjectId
    ? displayProjects.find((project) => project.id === selectedProjectId) ?? null
    : null;

  function handleSelectProject(project: Project) {
    setFocusedProjectId(project.id);
    setSelectedProjectId(project.id);
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#050505]">
      <Scene
        projects={displayProjects}
        searchQuery={searchQuery}
        focusedProjectId={activeFocusId}
        onSelectProject={handleSelectProject}
        onOpenInsights={() => setInsightsOpen(true)}
      />

      <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <SidePanel
        projects={displayProjects}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onSelectProject={handleSelectProject}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenInsights={() => setInsightsOpen(true)}
      />

      <ProjectModal
        project={selectedProject}
        allProjects={displayProjects}
        isFavorite={selectedProject ? favorites.includes(selectedProject.id) : false}
        onToggleFavorite={toggleFavorite}
        onRenameProject={renameProject}
        onClose={() => setSelectedProjectId(null)}
      />

      <AIInsights projects={displayProjects} open={insightsOpen} onClose={() => setInsightsOpen(false)} />
    </div>
  );
}
