// Vice City Trophy Atlas — bootstrap: loads the trophy list and the roadmap,
// wires the tracker controls, the tabs, and export/import, then renders.
// The app fetches only its own files under app/ (data/trophies.json and
// data/roadmap.json); it makes no network request at run time.
import { loadEarned, saveEarned, exportProgress, parseImportFile } from './storage.js';
import { renderTracker, toggleEarned } from './tracker.js';
import { renderRoadmap, renderMissable, renderSources } from './roadmap.js';

// loadGuideData fetches the guide's own data files. Both live under app/,
// so the app works with the network off from any static file server.
async function loadGuideData() {
  const [trophyDoc, roadmapDoc] = await Promise.all([
    (await fetch('data/trophies.json')).json(),
    (await fetch('data/roadmap.json')).json(),
  ]);
  return { trophies: trophyDoc.trophies, roadmap: roadmapDoc };
}

// switchTab shows one section (tracker, roadmap, missable or sources) and
// marks its tab active. Tabs are buttons, so this is all plain DOM work.
function switchTab(tab, tabs, views) {
  for (const button of tabs) button.classList.toggle('active', button.dataset.tab === tab);
  for (const view of views) view.classList.toggle('active', view.id === `view-${tab}`);
}

async function main() {
  const { trophies, roadmap } = await loadGuideData();
  const earned = loadEarned();
  const filters = { kind: 'all', grade: 'all', search: '', sort: 'default', spoiler: true, hideEarned: false };

  const elements = {
    list: document.getElementById('trophyList'),
    emptyState: document.getElementById('emptyState'),
    progressText: document.getElementById('progressText'),
    progressFill: document.getElementById('progressFill'),
    progressBar: document.getElementById('progressBar'),
    progressGrades: document.getElementById('progressGrades'),
    filterNote: document.getElementById('filterNote'),
    spoilerNote: document.getElementById('spoilerNote'),
  };
  const roadmapElements = {
    title: document.getElementById('roadmapTitle'),
    summary: document.getElementById('roadmapSummary'),
    warnings: document.getElementById('roadmapWarnings'),
    stages: document.getElementById('roadmapStages'),
    sources: document.getElementById('roadmapSources'),
  };

  // rerender redraws every view from the same state, so a tick in the
  // tracker also updates the roadmap chips and the missable page.
  function rerender() {
    renderTracker(trophies, earned, filters, elements, (name, checked) =>
      toggleEarned(name, checked, earned, rerender),
    );
    renderRoadmap(roadmap, trophies, earned, roadmapElements);
    renderMissable(trophies, earned, filters.spoiler, document.getElementById('missableBody'));
    renderSources(trophies, document.getElementById('sourcesBody'));
    document.getElementById('missableCount').textContent = String(
      trophies.filter((t) => t.missable).length,
    );
  }

  const tabs = [...document.querySelectorAll('.tab')];
  const views = [...document.querySelectorAll('.view')];
  for (const button of tabs) {
    button.addEventListener('click', () => switchTab(button.dataset.tab, tabs, views));
  }

  document.getElementById('search').addEventListener('input', (event) => {
    filters.search = event.target.value.trim();
    rerender();
  });
  document.getElementById('gradeFilter').addEventListener('change', (event) => {
    filters.grade = event.target.value;
    rerender();
  });
  document.getElementById('sortFilter').addEventListener('change', (event) => {
    filters.sort = event.target.value;
    rerender();
  });
  document.getElementById('spoilerToggle').addEventListener('change', (event) => {
    filters.spoiler = event.target.checked;
    rerender();
  });
  document.getElementById('hideEarnedToggle').addEventListener('change', (event) => {
    filters.hideEarned = event.target.checked;
    rerender();
  });
  for (const chip of document.querySelectorAll('.chip')) {
    chip.addEventListener('click', () => {
      for (const other of document.querySelectorAll('.chip')) other.classList.remove('active');
      chip.classList.add('active');
      filters.kind = chip.dataset.kind;
      rerender();
    });
  }

  document.getElementById('exportBtn').addEventListener('click', () => exportProgress(earned));
  document.getElementById('importFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const imported = parseImportFile(await file.text(), trophies.map((t) => t.name));
      earned.clear();
      for (const name of imported) earned.add(name);
      saveEarned(earned);
      rerender();
    } catch (error) {
      alert(error.message);
    }
    event.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Clear all earned trophies? This cannot be undone (export first if you want a backup).')) {
      earned.clear();
      saveEarned(earned);
      rerender();
    }
  });

  rerender();
}

main();
