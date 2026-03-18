import { describe, it, expect } from 'vitest';
import { mergeAppMapData } from '../../src/merge';
import type { AppMapData, RouteNode, FlowEdge } from '../../src/types';

describe('Merge Layer', () => {
  const staticData: AppMapData = {
    routes: [
      { id: 'route-home', path: '/', name: 'Home', framework: 'nextjs-app', source: 'static', componentFile: 'app/page.tsx' },
      { id: 'route-dashboard', path: '/dashboard', name: 'Dashboard', framework: 'nextjs-app', source: 'static', componentFile: 'app/dashboard/page.tsx' },
      { id: 'route-users-id', path: '/users/:id', name: 'Users Detail', framework: 'nextjs-app', source: 'static', componentFile: 'app/users/[id]/page.tsx' },
    ],
    edges: [
      { id: 'edge-1', sourceRouteId: 'route-home', targetRouteId: 'route-dashboard', type: 'link' },
    ],
    framework: 'nextjs-app',
    scannedAt: '2026-03-18T10:00:00Z',
  };

  it('returns runtime data when no static data exists', () => {
    const runtimeRoutes: RouteNode[] = [
      { id: 'route-home', path: '/', name: 'Home', framework: 'unknown', source: 'runtime' },
    ];
    const result = mergeAppMapData(null, runtimeRoutes, []);

    expect(result.routes).toHaveLength(1);
    expect(result.routes[0].source).toBe('runtime');
  });

  it('merges runtime routes into static data', () => {
    const runtimeRoutes: RouteNode[] = [
      { id: 'route-home', path: '/', name: 'Home', framework: 'unknown', source: 'runtime' },
      { id: 'route-settings', path: '/settings', name: 'Settings', framework: 'unknown', source: 'runtime' },
    ];

    const result = mergeAppMapData(staticData, runtimeRoutes, []);

    // Should have 4 routes: 3 static + 1 new runtime
    expect(result.routes).toHaveLength(4);

    // Home should be marked as 'both'
    const home = result.routes.find((r) => r.path === '/');
    expect(home?.source).toBe('both');

    // Settings should be a new runtime-only route
    const settings = result.routes.find((r) => r.path === '/settings');
    expect(settings?.source).toBe('runtime');
  });

  it('deduplicates edges', () => {
    const runtimeEdges: FlowEdge[] = [
      { id: 'runtime-edge-1', sourceRouteId: 'route-home', targetRouteId: 'route-dashboard', type: 'inferred' },
      { id: 'runtime-edge-2', sourceRouteId: 'route-dashboard', targetRouteId: 'route-users-id', type: 'inferred' },
    ];

    const result = mergeAppMapData(staticData, [], runtimeEdges);

    // edge-1 is duplicate (same source→target as static), should not be added
    // edge-2 is new, should be added
    expect(result.edges).toHaveLength(2);
  });
});
