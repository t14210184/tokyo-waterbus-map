import fs from 'fs';
import path from 'path';

console.log('[AuditEmoji] Script starting...');

const rootDir = process.cwd();
const artifactDir = path.join(rootDir, 'artifacts', 'phase-4a-audit');

if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}

const targetDirs = ['src/ui', 'src/map', 'src/assets', 'src/core'];
const filesToAudit = ['src/main.js'];

targetDirs.forEach(sub => {
  const full = path.join(rootDir, sub);
  if (fs.existsSync(full)) {
    for (const f of fs.readdirSync(full)) {
      if (f.endsWith('.js') || f.endsWith('.css') || f.endsWith('.html')) {
        filesToAudit.push(path.join(sub, f));
      }
    }
  }
});

if (fs.existsSync(path.join(rootDir, 'dist/assets/index-atlas.js'))) {
  filesToAudit.push('dist/assets/index-atlas.js');
}

function scanLineForEmojis(str) {
  const points = [];
  for (let i = 0; i < str.length; i++) {
    const cp = str.codePointAt(i);
    if (
      (cp >= 0x1F300 && cp <= 0x1F9FF) ||
      (cp >= 0x1F600 && cp <= 0x1F64F) ||
      (cp >= 0x1F680 && cp <= 0x1F6FF) ||
      (cp >= 0x2600 && cp <= 0x26FF) ||
      (cp >= 0x2700 && cp <= 0x27BF)
    ) {
      points.push(cp);
      if (cp > 0xFFFF) i++;
    }
  }
  return points;
}

const findings = [];

filesToAudit.forEach(rel => {
  const full = path.join(rootDir, rel);
  if (!fs.existsSync(full)) return;

  const content = fs.readFileSync(full, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    if (rel.includes('index-atlas.js') && (line.includes("icon: '") || line.includes('Module: data/guides.js'))) {
      return;
    }

    const cps = scanLineForEmojis(line);
    cps.forEach(cp => {
      findings.push({
        file: rel,
        line: idx + 1,
        code: 'U+' + cp.toString(16).toUpperCase()
      });
    });
  });
});

const report = {
  timestamp: new Date().toISOString(),
  totalEmojiCount: findings.length,
  filesAudited: filesToAudit.length,
  passed: findings.length === 0,
  findings
};

const jsonPath = path.join(artifactDir, 'emoji-audit.json');
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');

console.log('[AuditEmoji] Total findings:', findings.length);

if (findings.length > 0) {
  process.exitCode = 1;
} else {
  process.exitCode = 0;
}
