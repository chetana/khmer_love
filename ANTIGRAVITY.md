# ANTIGRAVITY — khmer_love (React 19)

## Stack
- React 19 + Vite 6 + TypeScript + Tailwind 4.
- Motion (`motion/react`).
- Express proxy (server.js).

## Deploy
- **`~/.claude/bin/gcloud builds submit --config cloudbuild.yaml`**.
- Pipeline Cloud Build atomique (build → push → deploy).
- Région : `us-west1`, service : `khmer-love-translator`.

## Gemini (REST API)
- La clé `GEMINI_API_KEY` est stockée comme **env var Cloud Run runtime**.
- Pas de SDK Gemini côté browser.
- TTS audio WAV via `gemini-2.5-flash-preview-tts`.
- Fallback Web Speech API `km-KH`/`fr-FR`.

## Fichiers clés
- `src/lib/gemini.ts` : Fonctions Gemini + TTS + fallback.
- `src/lib/audioCache.ts` : Cache audio session + localStorage.
- `src/data/alphabet.ts`, `src/data/numbers.ts`.

## UI / UX
- **Always-mounted tabs** : Pour préserver l'état (quiz, chat). Masqués par `hidden`.
- **Capture camera** : `capture="environment"` pour ouvrir directement la caméra.

## Commits
- **PAS de `Co-Authored-By`**.
- Lint mandatory.
