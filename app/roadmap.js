// The roadmap, the missable page and the sources page: rendered from
// app/data/roadmap.json and app/data/trophies.json, so the words on screen
// always match the data files the guide ships.

// renderRoadmap builds the platinum roadmap: its summary, the three warnings
// (the missable meditation, no mission replay, cheats), and the four stages
// with the trophies each stage earns.
export function renderRoadmap(roadmap, trophies, earned, elements) {
  const byName = new Map(trophies.map((t) => [t.name, t]));
  elements.title.textContent = roadmap.title;
  elements.summary.textContent = roadmap.summary;

  elements.warnings.replaceChildren();
  for (const warning of roadmap.warnings) {
    const div = document.createElement('div');
    div.className = 'warning';
    const strong = document.createElement('strong');
    strong.textContent = 'Watch out: ';
    div.append(strong, document.createTextNode(warning));
    elements.warnings.append(div);
  }

  elements.stages.replaceChildren();
  for (const stage of roadmap.stages) {
    const li = document.createElement('li');
    li.className = 'roadmap-stage';
    const heading = document.createElement('h3');
    heading.textContent = `Stage ${stage.stage}: ${stage.title}`;
    const hours = document.createElement('span');
    hours.className = 'hours';
    hours.textContent = stage.hours;
    heading.append(hours);
    li.append(heading);
    const text = document.createElement('p');
    text.textContent = stage.text;
    li.append(text);
    const chips = document.createElement('div');
    chips.className = 'stage-trophies';
    for (const name of stage.trophies) {
      const trophy = byName.get(name);
      const chip = document.createElement('span');
      chip.className = 'stage-trophy' + (earned.has(name) ? ' done' : '');
      const mini = document.createElement('span');
      mini.className = 'mini-grade';
      mini.textContent = trophy ? trophy.grade : '';
      chip.append(mini, document.createTextNode(name));
      chips.append(chip);
    }
    li.append(chips);
    elements.stages.append(li);
  }

  elements.sources.replaceChildren();
  elements.sources.append(document.createTextNode('Roadmap figures and warnings: '));
  for (const source of roadmap.sources) {
    const link = document.createElement('a');
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = source.label;
    elements.sources.append(link, document.createTextNode(' · '));
  }
}

// renderMissable explains the one possibly missable trophy and why the rest
// of the list is safe, with the guide's own words and its sources beside it.
export function renderMissable(trophies, earned, spoilerOn, elements) {
  elements.replaceChildren();
  const missable = trophies.filter((t) => t.missable);
  for (const trophy of missable) {
    const card = document.createElement('div');
    card.className = 'missable-card';
    const heading = document.createElement('h3');
    heading.textContent = `⚠ ${trophy.name} — the one to watch`;
    card.append(heading);
    const desc = document.createElement('p');
    desc.textContent = `Official description: “${trophy.description}”`;
    card.append(desc);
    const guide = document.createElement('p');
    guide.textContent = trophy.guide;
    card.append(guide);
    const sources = document.createElement('p');
    sources.append(document.createTextNode('Sources: '));
    for (const source of trophy.sources) {
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = source.label;
      sources.append(link, document.createTextNode(' '));
    }
    card.append(sources);
    const status = document.createElement('p');
    status.textContent = earned.has(trophy.name)
      ? 'You have this one ticked off — the missable moment is behind you.'
      : 'Not earned yet — meditate at Jason’s house before Chapter 1 ends.';
    card.append(status);
    elements.append(card);
  }

  const safe = document.createElement('div');
  safe.className = 'callout';
  const safeTitle = document.createElement('h3');
  safeTitle.textContent = 'Everything else can wait';
  safe.append(safeTitle);
  const safeText = document.createElement('p');
  safeText.textContent = 'Every other trophy in the list is earned in free roam or through story missions that cannot be missed — PowerPyx and GTABase flag no other trophy as missable, and nothing on the 100% completion checklist is missable. The story has no mission replay, but free roam continues after the credits, so cleanup is always possible. One more rule for the whole run: cheats disable trophies and saving, so keep trophy runs cheat-free (PowerPyx; GTABase).';
  safe.append(safeText);
  const safeSources = document.createElement('p');
  safeSources.append(document.createTextNode('Sources: '));
  for (const source of [
    { label: 'PowerPyx — GTA 6 Trophy Guide & Roadmap', url: 'https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/' },
    { label: 'GTA Zone — GTA 6 Trophy List', url: 'https://gta-zone.com/news/gta-6-trophies-achievements/' },
  ]) {
    const link = document.createElement('a');
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = source.label;
    safeSources.append(link, document.createTextNode(' '));
  }
  safe.append(safeSources);
  elements.append(safe);
}

// renderSources writes the method note and the full source list: where the
// official list came from, where the counts came from, and what is still
// unconfirmed a day after launch.
export function renderSources(trophies, elements) {
  elements.replaceChildren();
  const intro = document.createElement('p');
  intro.textContent = 'Every guide in this atlas is written in our own words for this entry. A source is cited beside each trophy, never copied: the official name, description and grade are shown exactly as PlayStation publishes them, and everything else is our own summary of what the cited guide says. Where the guide sites have not pinned a trigger down yet, the trophy says so instead of guessing.';
  elements.append(intro);

  const list = document.createElement('ul');
  list.className = 'sources-list';
  const entries = [
    {
      name: 'Exophase — Grand Theft Auto VI Trophies (PS5)',
      url: 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/',
      note: 'The official trophy list: all 55 names, descriptions and grades, with rarity data from players. The two list sites agree on every name, description and grade.',
    },
    {
      name: 'PSNProfiles — Grand Theft Auto VI Trophies',
      url: 'https://psnprofiles.com/trophies/43531-grand-theft-auto-vi',
      note: 'The same official list, plus the progress target each counted trophy tracks (for example 250 stunts, 42 Shooting Range challenges, 100 WAiNK locations) and the hidden flags.',
    },
    {
      name: 'PowerPyx — GTA 6 Trophy Guide & Roadmap',
      url: 'https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/',
      note: 'The roadmap this guide follows: difficulty 4/10, about 200 hours, one playthrough, no online trophies, no mission replay, cheats disable trophies — and the only possibly missable trophy, Positive Mental Attitude.',
    },
    {
      name: 'GTA Zone — GTA 6 Trophy List',
      url: 'https://gta-zone.com/news/gta-6-trophies-achievements/',
      note: 'The per-trophy unlock tips this guide paraphrases (which strangers count for Strangers & Freaks, how many of each total a trophy needs), cross-checked against PowerPyx and GTABase, and the list of the five triggers still unconfirmed at launch.',
    },
  ];
  for (const entry of entries) {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = entry.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = entry.name;
    li.append(link);
    const note = document.createElement('p');
    note.textContent = entry.note;
    li.append(note);
    list.append(li);
  }
  elements.append(list);

  const unconfirmed = document.createElement('p');
  unconfirmed.textContent = 'Still unconfirmed at launch (PowerPyx and GTABase have not pinned them down): In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There and Ten Pin. Their guides in this atlas say so plainly rather than inventing steps.';
  elements.append(unconfirmed);

  const counts = document.createElement('p');
  const hiddenCount = trophies.filter((t) => t.hidden).length;
  counts.textContent = `List as shipped: ${trophies.length} trophies — 1 platinum, 2 gold, 6 silver, 46 bronze — of which ${hiddenCount} are hidden on PlayStation until earned, and 1 is flagged as possibly missable.`;
  elements.append(counts);
}
