import type { Collection, Item, RegistryGraph, Skill } from "../types.js";

export interface CollectionDescriptor {
  id: string;
  filePath: string;
  data: Record<string, unknown>;
}

export interface CollectionResolution {
  collections: Collection[];
  issues: Array<{
    code: string;
    message: string;
    path?: string;
    severity: "error" | "warning" | "info";
  }>;
}

export function sortItems(items: Item[]): Item[] {
  return [...items].sort((left, right) => {
    const byType = left.type.localeCompare(right.type);
    if (byType !== 0) return byType;
    return left.sourcePath.localeCompare(right.sourcePath);
  });
}

export function sortSkills(skills: Skill[]): Skill[] {
  return [...skills].sort((left, right) =>
    left.skillPath.localeCompare(right.skillPath),
  );
}

export function sortCollections(collections: Collection[]): Collection[] {
  return [...collections].sort((left, right) => left.id.localeCompare(right.id));
}

export function normalizeGraph(graph: RegistryGraph): RegistryGraph {
  return {
    ...graph,
    items: sortItems(graph.items),
    skills: sortSkills(graph.skills),
    collections: sortCollections(graph.collections),
    plugins: {
      ...graph.plugins,
      packRoots: [...graph.plugins.packRoots].sort((left, right) =>
        left.localeCompare(right),
      ),
      collections: [...graph.plugins.collections].sort((left, right) =>
        left.localeCompare(right),
      ),
    },
    issues: [...graph.issues].sort((left, right) => {
      const leftPath = left.path ?? "";
      const rightPath = right.path ?? "";
      const byPath = leftPath.localeCompare(rightPath);
      if (byPath !== 0) return byPath;
      return left.code.localeCompare(right.code);
    }),
  };
}
