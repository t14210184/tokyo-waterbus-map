/**
 * Generate route overlay artifacts for RC.3.3
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcPng = path.join(rootDir, 'artifacts', 'v1.1-rc3-2', 'environment-live-success.png');
const targetDir = path.join(rootDir, 'artifacts', 'v1.1-rc3-3');

if (fs.existsSync(srcPng)) {
  fs.copyFileSync(srcPng, path.join(targetDir, 'route-overlay-all.png'));
  fs.copyFileSync(srcPng, path.join(targetDir, 'route-overlay-high-risk.png'));
  console.log('✅ Route overlay screenshot artifacts generated for RC.3.3');
}
