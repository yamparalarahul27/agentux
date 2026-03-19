import type { AppMapData, FlowEdge, RouteNode } from '../types';
import { matchDynamicRoute } from '../analysis/parsers/common';

/** Merge static analysis data with runtime-detected data */
export function mergeAppMapData(
  staticData: AppMapData | null,
  runtimeRoutes: RouteNode[],
  runtimeEdges: FlowEdge[],
): AppMapData {
  if (!staticData) {
    return {
      routes: runtimeRoutes,
      edges: runtimeEdges,
      framework: 'unknown',
      scannedAt: new Date().toISOString(),
    };
  }

  const mergedRoutes = [...staticData.routes];
  const routeIdSet = new Set(mergedRoutes.map((r) => r.id));

  // Add runtime routes that don't exist in static data
  for (const runtimeRoute of runtimeRoutes) {
    const matchedStatic = findMatchingRoute(runtimeRoute.path, mergedRoutes);

    if (matchedStatic) {
      // Update source to 'both'
      matchedStatic.source = 'both';
    } else if (!routeIdSet.has(runtimeRoute.id)) {
      mergedRoutes.push(runtimeRoute);
      routeIdSet.add(runtimeRoute.id);
    }
  }

  // Merge edges
  const mergedEdges = [...staticData.edges];
  const edgeKeySet = new Set(
    mergedEdges.map((e) => `${e.sourceRouteId}→${e.targetRouteId}`),
  );

  for (const runtimeEdge of runtimeEdges) {
    const key = `${runtimeEdge.sourceRouteId}→${runtimeEdge.targetRouteId}`;
    if (!edgeKeySet.has(key)) {
      mergedEdges.push(runtimeEdge);
      edgeKeySet.add(key);
    }
  }

  return {
    routes: mergedRoutes,
    edges: mergedEdges,
    framework: staticData.framework,
    scannedAt: new Date().toISOString(),
  };
}

/** Find a static route that matches a runtime path (handles dynamic segments) */
function findMatchingRoute(runtimePath: string, routes: RouteNode[]): RouteNode | null {
  // Exact match
  const exact = routes.find((r) => r.path === runtimePath);
  if (exact) return exact;

  // Pattern match for dynamic segments using shared matcher
  for (const route of routes) {
    if (matchDynamicRoute(runtimePath, route.path)) {
      return route;
    }
  }

  return null;
}
