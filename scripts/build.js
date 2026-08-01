import { build } from 'vite';
import path from 'path';

const rootDir = path.resolve('.');
console.log('🚀 Building Tokyo Waterbus Atlas in root:', rootDir);

try {
  await build({
    root: rootDir,
    base: './'
  });
  console.log('✅ Vite build completed successfully!');
} catch (err) {
  console.error('❌ Build Error:', err);
  process.exit(1);
}
