import UniverseApp from "@/components/UniverseApp";
import projects from "@/data/projects.json";
import type { Project } from "@/lib/types";

export default function Home() {
  return <UniverseApp projects={projects as Project[]} />;
}
