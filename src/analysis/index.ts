import * as path from 'node:path';
import type { AppMapData, FlowEdge, RouteNode } from '../types';
import { detectFramework } from './scanner';
import { scanNextjsAppRoutes } from './parsers/nextjs-app';
import { scanNextjsPagesRoutes } from './parsers/nextjs-pages';
import { scanReactRouterRoutes } from './parsers/react-router';
import { detectLinks } from './link-detector';
import { matchDynamicRoute } from './parsers/common';

/** Analyze a project and return the complete app map data */
export async function analyzeProject(rootDir: string): Promise<AppMapData> {
  const resolvedRoot = path.resolve(rootDir);
  const framework = detectFramework(resolvedRoot);

  // Run the appropriate scanner based on detected framework
  let routes: RouteNode[] = [];
  switch (framework) {
    case 'nextjs-app':
      routes = scanNextjsAppRoutes(resolvedRoot).routes;
      break;
    case 'nextjs-pages':
      routes = scanNextjsPagesRoutes(resolvedRoot).routes;
      break;
    case 'react-router':
      routes = scanReactRouterRoutes(resolvedRoot).routes;
      break;
    default:
      // Try all scanners and merge results
      routes = [
        ...scanNextjsAppRoutes(resolvedRoot).routes,
        ...scanNextjsPagesRoutes(resolvedRoot).routes,
        ...scanReactRouterRoutes(resolvedRoot).routes,
      ];
  }

  // Detect navigation links in all route component files
  // Cache parsed results by file path to avoid re-parsing shared component files
  const linkCache = new Map<string, ReturnType<typeof detectLinks>>();
  const edges: FlowEdge[] = [];
  for (const route of routes) {
    if (!route.componentFile) continue;

    const absolutePath = path.resolve(resolvedRoot, route.componentFile);
    let linkResult = linkCache.get(absolutePath);
    if (!linkResult) {
      linkResult = detectLinks(absolutePath, route.id);
      linkCache.set(absolutePath, linkResult);
    }

    for (const target of linkResult.targets) {
      // Try to match target path to a known route
      const targetRoute = matchTargetRoute(target.targetPath, routes);
      if (targetRoute) {
        edges.push({
          id: `edge-${route.id}-${targetRoute.id}-${target.line}`,
          sourceRouteId: route.id,
          targetRouteId: targetRoute.id,
          type: target.type,
          sourceFile: route.componentFile,
          sourceLine: target.line,
        });
      }
    }
  }

  return {
    routes,
    edges,
    framework,
    scannedAt: new Date().toISOString(),
  };
}

/** Match a navigation target path to a known route, handling dynamic segments */
function matchTargetRoute(targetPath: string, routes: RouteNode[]): RouteNode | null {
  // Clean the target path
  const cleanPath = targetPath.split('?')[0].split('#')[0];

  // Exact match first
  const exact = routes.find((r) => r.path === cleanPath);
  if (exact) return exact;

  // Pattern match for dynamic segments
  for (const route of routes) {
    if (matchDynamicRoute(cleanPath, route.path)) {
      return route;
    }
  }

  return null;
}

// Re-export for convenience
export { detectFramework } from './scanner';
export { scanNextjsAppRoutes } from './parsers/nextjs-app';
export { scanNextjsPagesRoutes } from './parsers/nextjs-pages';
export { scanReactRouterRoutes } from './parsers/react-router';
export { detectLinks } from './link-detector';
export type { AppMapData, RouteNode, FlowEdge } from '../types';
