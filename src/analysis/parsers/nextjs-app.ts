import * as fs from 'node:fs';
import * as path from 'node:path';
import type { RouteNode, ScanResult } from '../../types';
import { segmentToRoute, pathToScreenName, pathToId } from './common';
import { relativePath } from './path';

/** Page file names that represent a route in Next.js App Router */
const PAGE_FILES = ['page.tsx', 'page.ts', 'page.jsx', 'page.js'];

/** Scan a Next.js App Router project for routes */
export function scanNextjsAppRoutes(rootDir: string): ScanResult {
  // Try both app/ and src/app/
  const appDir = fs.existsSync(path.join(rootDir, 'app'))
    ? path.join(rootDir, 'app')
    : fs.existsSync(path.join(rootDir, 'src/app'))
      ? path.join(rootDir, 'src/app')
      : null;

  if (!appDir) {
    return { framework: 'nextjs-app', routes: [] };
  }

  const routes: RouteNode[] = [];
  scanDirectory(appDir, '', rootDir, routes);

  return { framework: 'nextjs-app', routes };
}

function scanDirectory(
  dir: string,
  currentPath: string,
  rootDir: string,
  routes: RouteNode[],
): void {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  // Check if this directory has a page file (meaning it's a route)
  for (const entry of entries) {
    if (entry.isFile() && PAGE_FILES.includes(entry.name)) {
      const routePath = currentPath || '/';
      const componentFile = relativePath(rootDir, path.join(dir, entry.name));

      routes.push({
        id: pathToId(routePath),
        path: routePath,
        name: pathToScreenName(routePath),
        componentFile,
        framework: 'nextjs-app',
        source: 'static',
      });
      break; // Only one page file per directory
    }
  }

  // Recurse into subdirectories
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    // Skip special directories
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'api') {
      continue;
    }

    const segment = segmentToRoute(entry.name);

    // segment is null for route groups, parallel routes, etc. — still recurse but don't add to path
    const newPath = segment === null ? currentPath : `${currentPath}/${segment}`;

    scanDirectory(path.join(dir, entry.name), newPath, rootDir, routes);
  }
}
