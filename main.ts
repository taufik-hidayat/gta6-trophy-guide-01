// Vice City Trophy Atlas — the entry program (Node 22, standard library only).
// The guide itself is plain static files in app/ (index.html, its modules,
// styles and data, trophies included) that any static server can serve with
// the network off. This program hands it in: it copies app/ and screenshots/
// from beside this file into /output and writes /output/dossier.json — the
// summary the judge reads (the screenshots, the first load's files and
// bytes, and the source) — with the vendored make.fun library.
//
// Leave vendor/makefun-frontend.ts exactly as the kit ships it: the scorer
// rebuilds the dossier with its own copy and requires the two to match byte
// for byte.
//
// Serve the guide locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// copyTree mirrors one directory into /output, creating the target first.
function copyTree(name) {
  const source = join(here, name);
  if (!existsSync(source)) return;
  cpSync(source, join(out, name), { recursive: true });
}

mkdirSync(out, { recursive: true });
copyTree('app');
copyTree('screenshots');

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files and directories in
// app/ or 48 MiB of app files: app/ counts beside /output's own 1000-entry
// cap, its screenshots/ and dossier.json).
const dossier = buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 });
writeFileSync(join(out, 'dossier.json'), dossier);

// A one-line receipt on stdout, so a run's log shows what was handed in:
// the dossier's bytes and the screenshots beside it.
const shots = existsSync(join(out, 'screenshots')) ? readdirSync(join(out, 'screenshots')) : [];
console.log(`wrote ${out}/dossier.json (${dossier.length} bytes) with ${shots.length} screenshot(s): ${shots.join(', ')}`);
