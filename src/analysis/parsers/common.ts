import * as path from 'node:path';

/** Convert a file-system segment name to a route segment */
export function segmentToRoute(segment: string): string | null {
  // Route groups: (marketing) → skip (not part of URL)
  if (segment.startsWith('(') && segment.endsWith(')')) {
    return null;
  }

  // Catch-all: [...slug] → *slug
  if (segment.startsWith('[...') && segment.endsWith(']')) {
    return `:${segment.slice(4, -1)}*`;
  }

  // Optional catch-all: [[...slug]] → *slug?
  if (segment.startsWith('[[...') && segment.endsWith(']]')) {
    return `:${segment.slice(5, -2)}*?`;
  }

  // Dynamic segment: [id] → :id
  if (segment.startsWith('[') && segment.endsWith(']')) {
    return `:${segment.slice(1, -1)}`;
  }

  // Parallel routes: @modal → skip
  if (segment.startsWith('@')) {
    return null;
  }

  // Intercepting routes: (.) (..) (...) → skip for now
  if (segment.startsWith('(.)') || segment.startsWith('(..)') || segment.startsWith('(...)')) {
    return null;
  }

  return segment;
}

/** Convert a route path to a human-readable screen name */
export function pathToScreenName(routePath: string): string {
  if (routePath === '/') return 'Home';

  const lastSegment = routePath.split('/').filter(Boolean).pop() || 'Home';

  // Handle dynamic segments: :id → "Detail"
  if (lastSegment.startsWith(':')) {
    const paramName = lastSegment.replace(/^:/, '').replace(/\*\??$/, '');
    // Use parent + param for better naming
    const segments = routePath.split('/').filter(Boolean);
    if (segments.length >= 2) {
      const parent = segments[segments.length - 2];
      if (!parent.startsWith(':')) {
        return `${capitalize(parent)} Detail`;
      }
    }
    return `${capitalize(paramName)} Detail`;
  }

  return capitalize(lastSegment.replace(/-/g, ' '));
}

/** Capitalize first letter of each word */
function capitalize(str: string): string {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Generate a stable route ID from a path */
export function pathToId(routePath: string): string {
  return routePath === '/'
    ? 'route-home'
    : 'route-' +
      routePath
        .replace(/^\//, '')
        .replace(/\//g, '-')
        .replace(/:/g, '')
        .replace(/\*/g, '')
        .replace(/\?/g, '');
}

/** Get relative path from root directory */
export function relativePath(rootDir: string, filePath: string): string {
  return path.relative(rootDir, filePath).replace(/\\/g, '/');
}

/** Check if a concrete path matches a route pattern with dynamic segments */
export function matchDynamicRoute(concretePath: string, routePattern: string): boolean {
  const concreteSegments = concretePath.split('/').filter(Boolean);
  const patternSegments = routePattern.split('/').filter(Boolean);

  // Check for catch-all
  const hasCatchAll = patternSegments.some((s) => s.endsWith('*'));
  if (!hasCatchAll && concreteSegments.length !== patternSegments.length) {
    return false;
  }

  for (let i = 0; i < patternSegments.length; i++) {
    const pattern = patternSegments[i];

    // Catch-all matches everything remaining
    if (pattern.endsWith('*')) return true;

    // Dynamic segment matches anything
    if (pattern.startsWith(':')) continue;

    // Static segment must match exactly
    if (concreteSegments[i] !== pattern) return false;
  }

  return true;
}
