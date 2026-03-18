import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import { scanNextjsAppRoutes } from '../../src/analysis/parsers/nextjs-app';
import { detectFramework } from '../../src/analysis/scanner';

const fixtureDir = path.resolve(__dirname, '../fixtures/nextjs-app');

describe('Next.js App Router Scanner', () => {
  it('detects the framework as nextjs-app', () => {
    const framework = detectFramework(fixtureDir);
    expect(framework).toBe('nextjs-app');
  });

  it('discovers all page routes', () => {
    const result = scanNextjsAppRoutes(fixtureDir);

    expect(result.framework).toBe('nextjs-app');
    expect(result.routes.length).toBe(4);

    const paths = result.routes.map((r) => r.path).sort();
    expect(paths).toEqual([
      '/',
      '/dashboard',
      '/users',
      '/users/:id',
    ]);
  });

  it('generates human-readable screen names', () => {
    const result = scanNextjsAppRoutes(fixtureDir);
    const nameMap = Object.fromEntries(result.routes.map((r) => [r.path, r.name]));

    expect(nameMap['/']).toBe('Home');
    expect(nameMap['/dashboard']).toBe('Dashboard');
    expect(nameMap['/users']).toBe('Users');
    expect(nameMap['/users/:id']).toBe('Users Detail');
  });

  it('includes component file paths relative to root', () => {
    const result = scanNextjsAppRoutes(fixtureDir);
    const homeRoute = result.routes.find((r) => r.path === '/');

    expect(homeRoute?.componentFile).toBe('app/page.tsx');
  });

  it('marks all routes as static source', () => {
    const result = scanNextjsAppRoutes(fixtureDir);
    for (const route of result.routes) {
      expect(route.source).toBe('static');
    }
  });
});
