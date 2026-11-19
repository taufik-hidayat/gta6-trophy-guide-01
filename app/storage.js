// Progress storage for the Vice City Trophy Atlas: the earned set lives in
// localStorage under one key, and can be exported to a file and imported back.
// Nothing leaves the browser except through the export the reader asks for.
export const STORAGE_KEY = 'vice-city-trophy-atlas-v1';
export const EXPORT_VERSION = 1;

// loadEarned reads the saved trophy names and returns them as a Set.
// A missing, corrupt or wrongly shaped value yields an empty set, never a crash.
export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((name) => typeof name === 'string'));
  } catch {
    return new Set();
  }
}

// saveEarned persists the earned set. It stores names only, in guide order.
export function saveEarned(earned) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
}

// exportProgress downloads the earned set as a JSON file the reader can keep
// or move to another browser. The filename carries the date for easy filing.
export function exportProgress(earned) {
  const payload = {
    app: 'vice-city-trophy-atlas',
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    earned: [...earned],
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `gta6-trophy-progress-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// parseImportFile turns an imported file's text into a Set of earned names,
// keeping only names that exist in the guide's trophy list. It throws a
// human-readable error when the file is not a progress export at all.
export function parseImportFile(text, knownNames) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That file is not JSON. Export progress from this guide first, then import that file.');
  }
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) {
    throw new Error('That file holds no earned list. Export progress from this guide first, then import that file.');
  }
  const known = new Set(knownNames);
  return new Set(names.filter((name) => typeof name === 'string' && known.has(name)));
}
