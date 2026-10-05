import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
for (const page of ['index.html', 'lp-1/index.html']) {
  const file = resolve(root, page);
  const html = readFileSync(file, 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) throw new Error('Duplicate IDs in ' + page + ': ' + duplicates.join(', '));
  if (/\[forminator_form|<!--\s*\/?wp:/.test(html)) throw new Error('Unrendered WordPress markup in ' + page);
  for (const [, link] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|tel:|mailto:|data:)/.test(link)) continue;
    if (link.startsWith('#')) {
      if (!ids.includes(link.slice(1))) throw new Error('Missing anchor ' + link + ' in ' + page);
      continue;
    }
    if (link.startsWith('/')) throw new Error('Root-relative URL breaks the Pages project path: ' + link);
    if (!existsSync(resolve(dirname(file), link))) throw new Error('Missing local file ' + link + ' in ' + page);
  }
  console.log(page + ': static markup, anchors, IDs, and local assets passed');
}
for (const file of ['header.js', 'voucher-modal.js', 'preview-forms.js']) {
  const result = spawnSync(process.execPath, ['--check', resolve(root, 'assets/js', file)], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr);
}
if (!existsSync(resolve(root, '.nojekyll'))) throw new Error('Missing .nojekyll');
console.log('Generated JavaScript and Pages configuration files passed');
