import { useEffect, useRef, useState } from 'react';
import type { FlowEdge, RouteNode } from '../types';
import { NavigationTracker } from './navigation-tracker';
import { pathToId, pathToScreenName } from '../analysis/parsers/common';

interface RuntimeData {
  routes: RouteNode[];
  edges: FlowEdge[];
}

/** React hook that tracks runtime navigation and discovers routes/edges */
export function useRuntimeRoutes(): RuntimeData {
  const trackerRef = useRef<NavigationTracker | null>(null);
  const [data, setData] = useState<RuntimeData>({ routes: [], edges: [] });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tracker = new NavigationTracker();
    trackerRef.current = tracker;
    tracker.start();

    // Add the initial route
    const initialPath = window.location.pathname;
    setData({
      routes: [createRuntimeRoute(initialPath)],
      edges: [],
    });

    // Poll for new navigation events periodically
    const interval = setInterval(() => {
      const uniqueEdges = tracker.getUniqueEdges();
      const allPaths = new Set<string>();

      // Collect all unique paths from navigation events
      allPaths.add(initialPath);
      for (const edge of uniqueEdges) {
        allPaths.add(edge.from);
        allPaths.add(edge.to);
      }
      // Also add the current path
      allPaths.add(window.location.pathname);

      const routes = Array.from(allPaths).map(createRuntimeRoute);
      const edges: FlowEdge[] = uniqueEdges.map((edge, i) => ({
        id: `runtime-edge-${i}`,
        sourceRouteId: pathToId(edge.from),
        targetRouteId: pathToId(edge.to),
        type: 'inferred' as const,
      }));

      setData({ routes, edges });
    }, 2000);

    return () => {
      clearInterval(interval);
      tracker.stop();
    };
  }, []);

  return data;
}

function createRuntimeRoute(routePath: string): RouteNode {
  return {
    id: pathToId(routePath),
    path: routePath,
    name: pathToScreenName(routePath),
    framework: 'unknown',
    source: 'runtime',
  };
}

export { NavigationTracker } from './navigation-tracker';
