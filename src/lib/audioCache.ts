/**
 * Audio cache: keeps generated TTS audio in memory (session) + localStorage (persistent).
 * Avoids re-generating the same audio with Gemini on every play.
 *
 * Format: raw PCM base64 string (before WAV header), keyed by "lang::text".
 * Max 30 persistent entries (~3-5 MB), LRU eviction.
 */

const MAX_PERSISTENT = 30;
const LS_KEY = 'khmer_audio_cache_v1';

interface CacheEntry {
  key: string;
  data: string; // base64 PCM
  ts: number;
}

// In-memory map (session) — fast access, no size limit concern
const memCache = new Map<string, string>();

// Load from localStorage on startup
function loadLS(): Map<string, string> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return new Map();
    const entries: CacheEntry[] = JSON.parse(raw);
    return new Map(entries.map((e) => [e.key, e.data]));
  } catch {
    return new Map();
  }
}

// Persist current memCache state (capped to MAX_PERSISTENT entries)
function saveLS() {
  try {
    const entries: CacheEntry[] = [...memCache.entries()]
      .slice(-MAX_PERSISTENT)
      .map(([key, data]) => ({ key, data, ts: Date.now() }));
    localStorage.setItem(LS_KEY, JSON.stringify(entries));
  } catch {
    // Silently skip if localStorage is full
  }
}

// Hydrate in-memory cache from localStorage on module load
(function hydrate() {
  const ls = loadLS();
  ls.forEach((data, key) => memCache.set(key, data));
})();

function cacheKey(text: string, lang: 'kh' | 'fr'): string {
  return `${lang}::${text}`;
}

export function getAudioCache(text: string, lang: 'kh' | 'fr'): string | null {
  return memCache.get(cacheKey(text, lang)) ?? null;
}

export function setAudioCache(text: string, lang: 'kh' | 'fr', data: string) {
  memCache.set(cacheKey(text, lang), data);
  saveLS();
}
