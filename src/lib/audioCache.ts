/**
 * Audio cache: in-memory only (session).
 * Avoids re-calling Gemini TTS for the same text during a session.
 * NOT persisted to localStorage — iOS Safari 5MB quota causes crashes.
 * Cache is cleared on every page load.
 */

const LS_KEY = 'khmer_audio_cache_v1';

// In-memory map — session only, cleared on reload
const memCache = new Map<string, string>();

// Purge any leftover localStorage cache from older versions
(function purgeOnStart() {
  try { localStorage.removeItem(LS_KEY); } catch {}
  try { localStorage.removeItem('khmer_audio_cache_version'); } catch {}
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
}
