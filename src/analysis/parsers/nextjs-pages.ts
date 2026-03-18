import * as fs from 'node:fs';
import * as path from 'node:path';
import type { RouteNode, ScanResult } from '../../types';
import { segmentToRoute, pathToScreenName, pathToId, relativePath } from './common';
import { isSourceFile } from '../scanner';
import { IGNORED_ROUTES } from '../../constants';

/** Scan a Next.js Pages Router project for routes */
export function scanNextjsPagesRoutes(rootDir: string): ScanResult {
  const pagesDir = fs.existsSync(path.join(rootDir, 'pages'))
    ? path.join(rootDir, 'pages')
    : fs.existsSync(path.join(rootDir, 'src/pages'))
      ? path.join(rootDir, 'src/pages')
      : null;

  if (!pagesDir) {
    return { framework: 'nextjs-pages', routes: [] };
  }

  const routes: RouteNode[] = [];
  scanDirectory(pagesDir, '', rootDir, routes);

  return { framework: 'nextjs-pages', routes };
}

function scanDirectory(
  dir: string,
  currentPath: string,
  rootDir: string,
  routes: RouteNode[],
): void {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'api') {
        continue;
      }

      const segment = segmentToRoute(entry.name);
      const newPath = segment === null ? currentPath : `${currentPath}/${segment}`;
      scanDirectory(fullPath, newPath, rootDir, routes);
      continue;
    }

    if (!entry.isFile() || !isSourceFile(fullPath)) continue;

    // Get file name without extension
    const baseName = path.basename(entry.name, path.extname(entry.name));

    // Skip special Next.js files
    if (IGNORED_ROUTES.includes(baseName as typeof IGNORED_ROUTES[number])) {
      continue;
    }

    // Convert file name to route segment
    const segment = segmentToRoute(baseName);
    if (segment === null) continue;

    // index file maps to the current directory path
    const routePath = baseName === 'index'
      ? (currentPath || '/')
      : `${currentPath}/${segment}`;

    const componentFile = relativePath(rootDir, fullPath);

    routes.push({
      id: pathToId(routePath),
      path: routePath,
      name: pathToScreenName(routePath),
      componentFile,
      framework: 'nextjs-pages',
      source: 'static',
    });
  }
}
