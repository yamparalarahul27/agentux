import * as fs from 'node:fs';
import * as path from 'node:path';
import type { RouteNode, ScanResult } from '../../types';
import { pathToScreenName, pathToId } from './common';
import { walkDirectory, isSourceFile } from '../scanner';
import { relativePath } from './path';

/** Scan a React Router project for routes by parsing route config files */
export function scanReactRouterRoutes(rootDir: string): ScanResult {
  const routes: RouteNode[] = [];

  // Find likely router config files
  const candidateFiles = findRouterConfigFiles(rootDir);

  for (const filePath of candidateFiles) {
    const fileRoutes = parseRouterFile(filePath, rootDir);
    routes.push(...fileRoutes);
  }

  return { framework: 'react-router', routes };
}

/** Find files that likely contain React Router configuration */
function findRouterConfigFiles(rootDir: string): string[] {
  const candidates: string[] = [];
  const srcDir = fs.existsSync(path.join(rootDir, 'src'))
    ? path.join(rootDir, 'src')
    : rootDir;

  // Common file names for route config
  const routerFilePatterns = [
    'router', 'routes', 'App', 'app', 'main',
  ];

  const allFiles = walkDirectory(srcDir);

  for (const file of allFiles) {
    if (!isSourceFile(file)) continue;

    const baseName = path.basename(file, path.extname(file));
    if (routerFilePatterns.includes(baseName)) {
      candidates.push(file);
    }
  }

  return candidates;
}

/** Parse a file for React Router route definitions using Babel AST */
function parseRouterFile(filePath: string, rootDir: string): RouteNode[] {
  const routes: RouteNode[] = [];

  try {
    const code = fs.readFileSync(filePath, 'utf-8');

    // Use dynamic import for babel to keep it tree-shakeable
    const { parse } = require('@babel/parser');
    const traverse = require('@babel/traverse').default;

    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });

    traverse(ast, {
      // Match createBrowserRouter([...]) or createHashRouter([...])
      CallExpression(astPath: any) {
        const callee = astPath.node.callee;
        if (
          callee.type === 'Identifier' &&
          (callee.name === 'createBrowserRouter' || callee.name === 'createHashRouter')
        ) {
          const args = astPath.node.arguments;
          if (args.length > 0 && args[0].type === 'ArrayExpression') {
            extractRoutesFromArray(args[0], routes, '', filePath, rootDir);
          }
        }
      },

      // Match <Route path="..." /> JSX elements
      JSXElement(astPath: any) {
        const openingElement = astPath.node.openingElement;
        if (
          openingElement.name.type === 'JSXIdentifier' &&
          openingElement.name.name === 'Route'
        ) {
          const pathAttr = openingElement.attributes.find(
            (attr: any) =>
              attr.type === 'JSXAttribute' &&
              attr.name.name === 'path',
          );

          if (pathAttr && pathAttr.value?.type === 'StringLiteral') {
            const routePath = pathAttr.value.value;
            if (routePath && routePath !== '*') {
              routes.push({
                id: pathToId(routePath),
                path: routePath,
                name: pathToScreenName(routePath),
                componentFile: relativePath(rootDir, filePath),
                framework: 'react-router',
                source: 'static',
              });
            }
          }
        }
      },
    });
  } catch {
    // If parsing fails, skip this file
  }

  return routes;
}

/** Extract routes from a createBrowserRouter array expression */
function extractRoutesFromArray(
  arrayNode: any,
  routes: RouteNode[],
  parentPath: string,
  filePath: string,
  rootDir: string,
): void {
  for (const element of arrayNode.elements) {
    if (!element || element.type !== 'ObjectExpression') continue;

    let routePath: string | null = null;

    for (const prop of element.properties) {
      if (prop.type !== 'ObjectProperty') continue;

      const key = prop.key.type === 'Identifier' ? prop.key.name : prop.key.value;

      if (key === 'path' && prop.value.type === 'StringLiteral') {
        routePath = prop.value.value;
      }

      if (key === 'children' && prop.value.type === 'ArrayExpression') {
        const fullPath = routePath ? joinPaths(parentPath, routePath) : parentPath;
        extractRoutesFromArray(prop.value, routes, fullPath, filePath, rootDir);
      }
    }

    if (routePath && routePath !== '*') {
      const fullPath = joinPaths(parentPath, routePath);
      routes.push({
        id: pathToId(fullPath),
        path: fullPath,
        name: pathToScreenName(fullPath),
        componentFile: relativePath(rootDir, filePath),
        framework: 'react-router',
        source: 'static',
      });
    }
  }
}

function joinPaths(parent: string, child: string): string {
  if (child.startsWith('/')) return child;
  if (!parent || parent === '/') return `/${child}`;
  return `${parent}/${child}`;
}
