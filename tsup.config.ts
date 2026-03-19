import { defineConfig } from 'tsup';

export default defineConfig([
  // Browser component entry (no Babel, no Node fs)
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom'],
    treeshake: true,
  },
  // Node.js analysis entry (includes Babel for AST parsing)
  {
    entry: ['src/analysis/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    outDir: 'dist/analysis',
    platform: 'node',
    external: ['react', 'react-dom'],
  },
]);
