/**
 * Audio cache: keeps generated TTS audio in memory (session) + localStorage (persistent).
 * Avoids re-generating the same audio with Gemini on every play.
 *
 * iOS Safari localStorage limit = 5 MB total.
 * Each PCM base64 entry = ~100-200 KB → max 10 entries in localStorage (~1-2 MB safe).
 * In-memory cache has no limit (session only).
 */

const MAX_PERSISTENT = 10;
const LS_KEY = 'khmer_audio_cache_v1';

interface CacheEntry {
  key: string;
  data: string; // base64 PCM
  ts: number;
}

// In-memory map (session) — fast access, no size limit
const memCache = new Map<string, string>();

function loadLS(): Map<string, string> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return new Map();
    const entries: CacheEntry[] = JSON.parse(raw);
    return new Map(entries.map((e) => [e.key, e.data]));
  } catch {
    // Corrupted cache — clear it
    try { localStorage.removeItem(LS_KEY); } catch {}
    return new Map();
  }
}

function saveLS() {
  try {
    const entries: CacheEntry[] = [...memCache.entries()]
      .slice(-MAX_PERSISTENT)
      .map(([key, data]) => ({ key, data, ts: Date.now() }));
    localStorage.setItem(LS_KEY, JSON.stringify(entries));
  } catch {
    // QuotaExceeded — reduce cache size and retry
    try {
      const smaller = [...memCache.entries()]
        .slice(-5)
        .map(([key, data]) => ({ key, data, ts: Date.now() }));
      localStorage.setItem(LS_KEY, JSON.stringify(smaller));
    } catch {
      // Still too big — just clear audio cache entirely
      try { localStorage.removeItem(LS_KEY); } catch {}
    }
  }
}

// Hydrate from localStorage on startup
(function hydrate() {
  loadLS().forEach((data, key) => memCache.set(key, data));
})();

function cacheKey(text: string, lang: 'kh' | 'fr'): string {
  return `${lang}::${text}`;
}

export function getAudioCache(text: string, lang: 'kh' | 'fr'): string | null {
  return memCache.get(cacheKey(text, lang)) ?? null;
}

export function setAudioCache(text: string, lang: 'kh' | 'fr', data: string) {
  if (!data) return;
  memCache.set(cacheKey(text, lang), data);
  saveLS();
}
