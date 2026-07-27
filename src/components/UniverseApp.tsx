"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import type { Project } from "@/lib/types";
import Scene from "@/components/graph/Scene";
import SidePanel from "@/components/panel/SidePanel";
import ProjectModal from "@/components/modal/ProjectModal";
import {
  getFavoritesSnapshot,
  getServerSnapshot,
  subscribeFavorites,
  toggleFavorite,
} from "@/lib/storage";

export default function UniverseApp({ projects }: { projects: Project[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [focusedProjectId, setFocusedProjectId] = useState<string | null>(null);

  const favorites = useSyncExternalStore(subscribeFavorites, getFavoritesSnapshot, getServerSnapshot);

  const searchMatchId = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return null;
    const match = projects.find((project) => {
      const haystack = [project.name, project.category, project.status, ...(project.techStack ?? [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
    return match?.id ?? null;
  }, [searchQuery, projects]);

  const activeFocusId = searchMatchId ?? focusedProjectId;

  function handleSelectProject(project: Project) {
    setFocusedProjectId(project.id);
    setSelectedProject(project);
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#09090b]">
      <Scene
        projects={projects}
        searchQuery={searchQuery}
        focusedProjectId={activeFocusId}
        onSelectProject={handleSelectProject}
      />

      <SidePanel
        projects={projects}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onSelectProject={handleSelectProject}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <ProjectModal
        project={selectedProject}
        isFavorite={selectedProject ? favorites.includes(selectedProject.id) : false}
        onToggleFavorite={toggleFavorite}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}
