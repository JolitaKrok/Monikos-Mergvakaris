export const GAME_ID = 'monikos-jaunikio-atranka';

export function normalizeName(name) {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ą/g, 'a')
    .replace(/č/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ė/g, 'e')
    .replace(/į/g, 'i')
    .replace(/š/g, 's')
    .replace(/ų/g, 'u')
    .replace(/ū/g, 'u')
    .replace(/ž/g, 'z')
    .replace(/\s+/g, '-');
}

export function isBrideName(name) {
  return normalizeName(name) === 'monika';
}

export function localPlayer() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(window.localStorage.getItem('monikosPlayer'));
  } catch {
    return null;
  }
}
