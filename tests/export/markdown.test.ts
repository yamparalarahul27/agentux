import { describe, it, expect } from 'vitest';
import { generateMarkdown } from '../../src/export';
import type { AppMapData } from '../../src/types';

describe('Markdown Export', () => {
  const mockData: AppMapData = {
    routes: [
      {
        id: 'route-home',
        path: '/',
        name: 'Home',
        componentFile: 'app/page.tsx',
        framework: 'nextjs-app',
        source: 'static',
      },
      {
        id: 'route-dashboard',
        path: '/dashboard',
        name: 'Dashboard',
        componentFile: 'app/dashboard/page.tsx',
        framework: 'nextjs-app',
        source: 'static',
      },
      {
        id: 'route-users',
        path: '/users',
        name: 'Users',
        componentFile: 'app/users/page.tsx',
        framework: 'nextjs-app',
        source: 'both',
      },
    ],
    edges: [
      {
        id: 'edge-1',
        sourceRouteId: 'route-home',
        targetRouteId: 'route-dashboard',
        type: 'link',
        sourceFile: 'app/page.tsx',
        sourceLine: 7,
      },
      {
        id: 'edge-2',
        sourceRouteId: 'route-dashboard',
        targetRouteId: 'route-users',
        type: 'navigate',
        sourceFile: 'app/dashboard/page.tsx',
        sourceLine: 12,
      },
    ],
    framework: 'nextjs-app',
    scannedAt: '2026-03-18T10:00:00.000Z',
  };

  it('generates valid markdown with all sections', () => {
    const md = generateMarkdown(mockData);

    expect(md).toContain('# App Map');
    expect(md).toContain('## Screens');
    expect(md).toContain('## Navigation Flows');
    expect(md).toContain('## Summary');
  });

  it('includes all screens with correct details', () => {
    const md = generateMarkdown(mockData);

    expect(md).toContain('### Home');
    expect(md).toContain('**Path**: `/`');
    expect(md).toContain('**Component**: `app/page.tsx`');
    expect(md).toContain('### Dashboard');
    expect(md).toContain('### Users');
  });

  it('includes navigation flows with source info', () => {
    const md = generateMarkdown(mockData);

    expect(md).toContain('Home → Dashboard');
    expect(md).toContain('`<Link>`');
    expect(md).toContain('app/page.tsx:7');
    expect(md).toContain('Dashboard → Users');
    expect(md).toContain('`useNavigate`');
  });

  it('includes correct summary counts', () => {
    const md = generateMarkdown(mockData);

    expect(md).toContain('**Total screens**: 3');
    expect(md).toContain('**Total flows**: 2');
    expect(md).toContain('Next.js App Router');
  });

  it('marks runtime-detected sources', () => {
    const md = generateMarkdown(mockData);
    expect(md).toContain('**Source**: both');
  });
});
