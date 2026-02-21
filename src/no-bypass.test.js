import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

function readFiles(dir, exts = ['.js', '.jsx', '.ts', '.tsx', '.mjs']) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      results.push(...readFiles(full, exts));
    } else if (exts.includes(path.extname(e.name))) {
      results.push(full);
    }
  }
  return results;
}

describe('Frontend no-bypass check', () => {
  it('does not contain direct backend URLs in source', () => {
    const projectRoot = path.resolve(__dirname, '..');
    const srcDir = path.join(projectRoot, 'src');
    const files = readFiles(srcDir);

    const forbidden = [
      'http://localhost:8081', // catalogo backend
      'http://localhost:8082', // rating
      'http://localhost:8083', // ventas
      'http://catalogo-backend',
      'http://ventas-backend',
      // Docker service hostnames (with ports)
      'http://catalogo-backend:8080',
      'http://rating-service:8082',
      'http://ventas-service:8083',
      'http://keycloak:8080',
      'http://keycloak-sso:8080'
    ];

    const violations = [];
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      for (const pattern of forbidden) {
        if (content.indexOf(pattern) !== -1) {
          violations.push({ file, pattern });
        }
      }
    }

    if (violations.length > 0) {
      const messages = violations.map(v => `${v.file}: contains '${v.pattern}'`).join('\n');
      throw new Error('Found forbidden direct-backend references:\n' + messages);
    }

    expect(violations.length).toBe(0);
  });
});
