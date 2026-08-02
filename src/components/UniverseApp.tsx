"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import type { Project, ProjectStatus } from "@/lib/types";
import Scene, { type SceneControls } from "@/components/graph/Scene";
import SearchBar from "@/components/SearchBar";
import LeftControlsPanel from "@/components/LeftControlsPanel";
import Legend from "@/components/Legend";
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
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [controls, setControls] = useState<SceneControls>({
    showLinks: true,
    physicsEnabled: true,
    autoRotate: false,
    glowEnabled: true,
    particlesEnabled: true,
  });

  function handleControlsChange(patch: Partial<SceneControls>) {
    setControls((current) => ({ ...current, ...patch }));
  }

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

  const selectedProject = selectedProjectId
    ? displayProjects.find((project) => project.id === selectedProjectId) ?? null
    : null;

  function handleSelectProject(project: Project) {
    setSelectedProjectId(project.id);
  }

  function handleSelectStatus(status: ProjectStatus) {
    setStatusFilter((current) => (current === status ? null : status));
  }

  function handleResetView() {
    setResetSignal((current) => current + 1);
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#050505]">
      <Scene
        projects={displayProjects}
        searchQuery={searchQuery}
        focusedProjectId={searchMatchId}
        selectedProjectId={selectedProjectId}
        onSelectProject={handleSelectProject}
        onOpenInsights={() => setInsightsOpen(true)}
        controls={controls}
        statusFilter={statusFilter}
        resetSignal={resetSignal}
      />

      <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <LeftControlsPanel controls={controls} onChange={handleControlsChange} onResetView={handleResetView} />

      <Legend activeStatus={statusFilter} onSelectStatus={handleSelectStatus} />

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
