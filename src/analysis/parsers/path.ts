import * as path from 'node:path';

/** Get relative path from root directory */
export function relativePath(rootDir: string, filePath: string): string {
  return path.relative(rootDir, filePath).replace(/\\/g, '/');
}
