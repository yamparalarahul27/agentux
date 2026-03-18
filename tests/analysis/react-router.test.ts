import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import { scanReactRouterRoutes } from '../../src/analysis/parsers/react-router';
import { detectFramework } from '../../src/analysis/scanner';

const fixtureDir = path.resolve(__dirname, '../fixtures/react-router');

describe('React Router Scanner', () => {
  it('detects the framework as react-router', () => {
    const framework = detectFramework(fixtureDir);
    expect(framework).toBe('react-router');
  });

  it('discovers routes from createBrowserRouter config', () => {
    const result = scanReactRouterRoutes(fixtureDir);

    expect(result.framework).toBe('react-router');
    expect(result.routes.length).toBeGreaterThanOrEqual(4);

    const paths = result.routes.map((r) => r.path).sort();
    expect(paths).toContain('/');
    expect(paths).toContain('/about');
    expect(paths).toContain('/products');
    expect(paths).toContain('/settings');
  });

  it('handles nested routes', () => {
    const result = scanReactRouterRoutes(fixtureDir);
    const paths = result.routes.map((r) => r.path);

    expect(paths).toContain('/products/:productId');
  });
});
