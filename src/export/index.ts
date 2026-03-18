import type { AppMapData } from '../types';

/** Generate structured Markdown from app map data, optimized for AI agent consumption */
export function generateMarkdown(data: AppMapData): string {
  const lines: string[] = [];

  lines.push('# App Map');
  lines.push('');

  // Screens section
  lines.push('## Screens');
  lines.push('');

  const sortedRoutes = [...data.routes].sort((a, b) => a.path.localeCompare(b.path));

  for (const route of sortedRoutes) {
    lines.push(`### ${route.name}`);
    lines.push(`- **Path**: \`${route.path}\``);
    if (route.componentFile) {
      lines.push(`- **Component**: \`${route.componentFile}\``);
    }
    lines.push(`- **Framework**: ${formatFramework(route.framework)}`);
    if (route.source !== 'static') {
      lines.push(`- **Source**: ${route.source}`);
    }
    lines.push('');
  }

  // Navigation Flows section
  if (data.edges.length > 0) {
    lines.push('## Navigation Flows');
    lines.push('');

    // Build route ID → name lookup
    const routeMap = new Map(data.routes.map((r) => [r.id, r]));

    for (const edge of data.edges) {
      const source = routeMap.get(edge.sourceRouteId);
      const target = routeMap.get(edge.targetRouteId);

      if (!source || !target) continue;

      const typeLabel = formatEdgeType(edge.type);
      const location = edge.sourceFile
        ? edge.sourceLine
          ? ` (\`${typeLabel}\` in \`${edge.sourceFile}:${edge.sourceLine}\`)`
          : ` (\`${typeLabel}\` in \`${edge.sourceFile}\`)`
        : ` (${typeLabel})`;

      lines.push(`- ${source.name} → ${target.name}${location}`);
    }

    lines.push('');
  }

  // Summary section
  lines.push('## Summary');
  lines.push(`- **Total screens**: ${data.routes.length}`);
  lines.push(`- **Total flows**: ${data.edges.length}`);
  lines.push(`- **Framework**: ${formatFramework(data.framework)}`);
  lines.push(`- **Generated**: ${data.scannedAt}`);
  lines.push('');

  return lines.join('\n');
}

function formatFramework(framework: string): string {
  switch (framework) {
    case 'nextjs-app':
      return 'Next.js App Router';
    case 'nextjs-pages':
      return 'Next.js Pages Router';
    case 'react-router':
      return 'React Router';
    default:
      return 'Unknown';
  }
}

function formatEdgeType(type: string): string {
  switch (type) {
    case 'link':
      return '<Link>';
    case 'navigate':
      return 'useNavigate';
    case 'redirect':
      return 'redirect';
    case 'inferred':
      return 'inferred';
    default:
      return type;
  }
}

export { copyToClipboard } from './clipboard';
