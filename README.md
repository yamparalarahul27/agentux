# appmap

Interactive App Map visualization for React — see all screens, routes, and navigation flows in a drag-and-drop canvas. Export as structured Markdown for AI agents.

![npm](https://img.shields.io/npm/v/appmap)
![license](https://img.shields.io/npm/l/appmap)

## Features

- **Auto-detect routes** — Scans your file structure (Next.js App/Pages Router, React Router) to discover all screens
- **Runtime tracking** — Tracks navigation events as you use your app to discover flows
- **Interactive canvas** — Drag-and-drop nodes, zoom, pan — powered by React Flow
- **AI-ready export** — Copy structured Markdown to clipboard, optimized for AI coding agents
- **Zero config** — Drop `<AppMap />` into your app and it works

## Quick Start

```bash
npm install appmap
```

### Option 1: Runtime-only (zero config)

Drop the component into your app — it will track navigation events as you browse:

```tsx
import { AppMap } from 'appmap';

function App() {
  return (
    <>
      <YourApp />
      <AppMap />
    </>
  );
}
```

### Option 2: Static analysis + runtime (recommended)

Run static analysis first for a complete picture, then pass the data:

```ts
// scripts/analyze.ts
import { analyzeProject } from 'appmap/analysis';
import { writeFileSync } from 'fs';

const data = await analyzeProject('./');
writeFileSync('appmap.json', JSON.stringify(data, null, 2));
```

```tsx
// app/layout.tsx
import { AppMap } from 'appmap';
import appMapData from '../appmap.json';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <AppMap data={appMapData} />
    </>
  );
}
```

## Configuration

```tsx
<AppMap
  data={preComputedData}       // Pre-computed AppMapData (from static analysis)
  position="bottom-right"      // Floating button position
  runtimeDetection={true}      // Enable runtime navigation tracking
  devOnly={true}               // Only render in development (default: true)
/>
```

## Supported Frameworks

| Framework | Route Detection | Link Detection |
|-----------|----------------|----------------|
| Next.js App Router | `app/` directory scanning | `<Link href>` |
| Next.js Pages Router | `pages/` directory scanning | `<Link href>` |
| React Router v6 | `createBrowserRouter` config | `<Link to>`, `useNavigate` |

## Export Format

The "Copy Markdown" button generates structured output like this:

```markdown
# App Map

## Screens
### Dashboard
- **Path**: `/dashboard`
- **Component**: `app/dashboard/page.tsx`
- **Framework**: Next.js App Router

## Navigation Flows
- Home → Dashboard (`<Link>` in `app/page.tsx:7`)
- Dashboard → Users (`useNavigate` in `app/dashboard/page.tsx:12`)

## Summary
- **Total screens**: 5
- **Total flows**: 8
- **Framework**: Next.js App Router
```

## Development

```bash
npm install
npm test          # Run tests
npm run build     # Build package
npm run dev       # Watch mode
```

## License

MIT
