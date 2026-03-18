import * as fs from 'node:fs';
import * as path from 'node:path';

/** Recursively walk a directory and return all file paths */
export function walkDirectory(dir: string): string[] {
  const results: string[] = [];

  if (!fs.existsSync(dir)) {
    return results;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules, .next, dist, etc.
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') {
        continue;
      }
      results.push(...walkDirectory(fullPath));
    } else if (entry.isFile()) {
      results.push(fullPath);
    }
  }

  return results;
}

/** Check if a file is a TypeScript/JavaScript source file */
export function isSourceFile(filePath: string): boolean {
  const ext = path.extname(filePath);
  return ['.ts', '.tsx', '.js', '.jsx'].includes(ext);
}

/** Detect which framework a project uses based on its file structure */
export function detectFramework(rootDir: string): 'nextjs-app' | 'nextjs-pages' | 'react-router' | 'unknown' {
  // Check for Next.js
  const hasNextConfig =
    fs.existsSync(path.join(rootDir, 'next.config.js')) ||
    fs.existsSync(path.join(rootDir, 'next.config.mjs')) ||
    fs.existsSync(path.join(rootDir, 'next.config.ts'));

  if (hasNextConfig) {
    // Prefer App Router if app/ directory exists
    if (fs.existsSync(path.join(rootDir, 'app')) || fs.existsSync(path.join(rootDir, 'src/app'))) {
      return 'nextjs-app';
    }
    if (fs.existsSync(path.join(rootDir, 'pages')) || fs.existsSync(path.join(rootDir, 'src/pages'))) {
      return 'nextjs-pages';
    }
    return 'nextjs-app'; // Default for Next.js
  }

  // Check for React Router by looking at package.json
  const pkgPath = path.join(rootDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (allDeps['react-router'] || allDeps['react-router-dom']) {
        return 'react-router';
      }
    } catch {
      // ignore parse errors
    }
  }

  return 'unknown';
}
