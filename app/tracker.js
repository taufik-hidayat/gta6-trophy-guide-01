// The tracker: renders the 55 trophies as a checklist, with filters by grade
// and kind, text search, a spoiler setting that masks hidden story trophies
// until they are earned, and per-trophy guides with their cited sources.
import { saveEarned } from './storage.js';

const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
const KIND_LABELS = {
  story: 'Story',
  collectibles: 'Collectibles',
  activities: 'Activities',
  combat: 'Combat',
  economy: 'Money',
  completion: 'Completion',
  platinum: 'Platinum',
};

// trophyMatches reports whether one trophy passes the tracker's current
// filters: kind chip, grade, search text, and the hide-earned toggle.
export function trophyMatches(trophy, filters, earned) {
  if (filters.kind === 'story' && trophy.kind !== 'story') return false;
  if (filters.kind === 'collectibles' && trophy.kind !== 'collectibles') return false;
  if (filters.kind === 'activities' && trophy.kind !== 'activities') return false;
  if (filters.kind === 'missable' && !trophy.missable) return false;
  if (filters.kind === 'online') return false;
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.hideEarned && earned.has(trophy.name)) return false;
  if (filters.search) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!haystack.includes(filters.search.toLowerCase())) return false;
  }
  return true;
}

// sortTrophies orders a filtered list: guide order, grade best first, or name.
export function sortTrophies(list, sort) {
  const copy = [...list];
  if (sort === 'grade') copy.sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.id - b.id);
  if (sort === 'name') copy.sort((a, b) => a.name.localeCompare(b.name));
  return copy;
}

// trophyIsMasked says whether the spoiler setting hides this trophy's name
// and description: hidden trophies stay masked until the reader earns them.
export function trophyIsMasked(trophy, spoilerOn, earned) {
  return spoilerOn && trophy.hidden && !earned.has(trophy.name);
}

// renderTrophyCard builds one checklist row: checkbox, grade badge, name,
// official description, guide with sources, and its flags and target count.
export function renderTrophyCard(trophy, earned, spoilerOn, onToggle) {
  const li = document.createElement('li');
  li.className = 'trophy' + (earned.has(trophy.name) ? ' earned' : '');
  const masked = trophyIsMasked(trophy, spoilerOn, earned);

  const checkWrap = document.createElement('div');
  checkWrap.className = 'trophy-check';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.name);
  box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  box.addEventListener('change', () => onToggle(trophy.name, box.checked));
  checkWrap.append(box);

  const body = document.createElement('div');
  body.className = 'trophy-body';

  const head = document.createElement('div');
  head.className = 'trophy-head';
  const name = document.createElement('span');
  name.className = 'trophy-name';
  name.textContent = masked ? 'Hidden trophy' : trophy.name;
  head.append(name);
  const grade = document.createElement('span');
  grade.className = `grade grade-${trophy.grade}`;
  grade.textContent = trophy.grade;
  head.append(grade);
  if (trophy.hidden) {
    const hiddenTag = document.createElement('span');
    hiddenTag.className = 'tag tag-hidden';
    hiddenTag.textContent = 'Hidden on PSN';
    head.append(hiddenTag);
  }
  if (trophy.missable) {
    const missTag = document.createElement('span');
    missTag.className = 'tag tag-missable';
    missTag.textContent = 'Possibly missable';
    head.append(missTag);
  }
  const kindTag = document.createElement('span');
  kindTag.className = 'tag tag-kind';
  kindTag.textContent = KIND_LABELS[trophy.kind] ?? trophy.kind;
  head.append(kindTag);
  body.append(head);

  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = masked
    ? 'Hidden on PlayStation until earned — tick it off to reveal its name and description.'
    : `Official description: “${trophy.description}”`;
  body.append(desc);

  if (!masked) {
    const guide = document.createElement('p');
    guide.className = 'trophy-guide';
    const guideLabel = document.createElement('strong');
    guideLabel.textContent = 'How to get it: ';
    guide.append(guideLabel, document.createTextNode(trophy.guide));
    body.append(guide);

    if (trophy.target !== null && trophy.target !== undefined) {
      const meta = document.createElement('p');
      meta.className = 'trophy-meta';
      meta.textContent = `PSN progress target: ${trophy.target.toLocaleString('en-US')}`;
      body.append(meta);
    }

    const sources = document.createElement('p');
    sources.className = 'trophy-sources';
    sources.append(document.createTextNode('Sources: '));
    for (const source of trophy.sources) {
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = source.label;
      sources.append(link);
    }
    body.append(sources);
  } else {
    const maskNote = document.createElement('p');
    maskNote.className = 'spoiler-mask';
    maskNote.textContent = 'Guide hidden with the spoiler setting — earn this trophy (or switch spoilers off) to read it.';
    body.append(maskNote);
  }

  li.append(checkWrap, body);
  return li;
}

// renderTracker redraws the checklist for the current filters and updates the
// progress header (count, bar, and per-grade counts) at the same time.
export function renderTracker(trophies, earned, filters, elements, onToggle) {
  const visible = sortTrophies(
    trophies.filter((t) => trophyMatches(t, filters, earned)),
    filters.sort,
  );
  elements.list.replaceChildren();
  for (const trophy of visible) {
    elements.list.append(renderTrophyCard(trophy, earned, filters.spoiler, onToggle));
  }
  elements.emptyState.hidden = visible.length !== 0;

  const total = trophies.length;
  elements.progressText.textContent = `${earned.size} of ${total} earned — ${Math.round((earned.size / total) * 100)}% to the platinum`;
  elements.progressFill.style.width = `${(earned.size / total) * 100}%`;
  elements.progressBar.setAttribute('aria-valuenow', String(earned.size));
  const byGrade = {};
  for (const trophy of trophies) {
    if (earned.has(trophy.name)) byGrade[trophy.grade] = (byGrade[trophy.grade] ?? 0) + 1;
  }
  const gradeTotals = {};
  for (const trophy of trophies) gradeTotals[trophy.grade] = (gradeTotals[trophy.grade] ?? 0) + 1;
  elements.progressGrades.textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${g}: ${byGrade[g] ?? 0}/${gradeTotals[g] ?? 0}`)
    .join(' · ');

  if (filters.kind === 'online') {
    elements.filterNote.textContent = 'No online trophies: all 55 are single-player, so there is nothing to track here. (PowerPyx — GTA 6 Trophy Guide & Roadmap.)';
  } else if (filters.kind === 'missable') {
    elements.filterNote.textContent = 'Only 1 trophy is flagged as possibly missable — Positive Mental Attitude. See the Missable tab for the full story.';
  } else {
    elements.filterNote.textContent = '';
  }
  elements.spoilerNote.hidden = !filters.spoiler;
}

// toggleEarned flips one trophy in the earned set, saves it, and re-renders.
export function toggleEarned(name, checked, earned, rerender) {
  if (checked) earned.add(name);
  else earned.delete(name);
  saveEarned(earned);
  rerender();
}
