import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');

for (const ext of ['js', 'cjs']) {
  const entryFile = path.join(distDir, `index.${ext}`);
  const bundleFile = path.join(distDir, `index.bundle.${ext}`);
  const entryMapFile = `${entryFile}.map`;
  const bundleMapFile = `${bundleFile}.map`;

  if (!fs.existsSync(entryFile)) {
    continue;
  }

  // Replace any previous bundle so watch mode stays idempotent.
  fs.rmSync(bundleFile, { force: true });
  fs.rmSync(bundleMapFile, { force: true });

  fs.renameSync(entryFile, bundleFile);
  if (fs.existsSync(entryMapFile)) {
    fs.renameSync(entryMapFile, bundleMapFile);
  }

  const bundleSource = fs.readFileSync(bundleFile, 'utf8');
  const updatedBundleSource = bundleSource.replace(
    /\/\/# sourceMappingURL=.*$/m,
    `//# sourceMappingURL=index.bundle.${ext}.map`,
  );
  fs.writeFileSync(bundleFile, updatedBundleSource);

  const wrapperSource =
    ext === 'cjs'
      ? '"use client";\nmodule.exports = require("./index.bundle.cjs");\n'
      : '"use client";\nexport * from "./index.bundle.js";\n';

  fs.writeFileSync(entryFile, wrapperSource);
}
