# Architecture — khmer_love (Bong & Oun)

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                   Browser (React + Vite)                     │
│                                                             │
│  TranslateTab ──┐                                           │
│  LearnTab       ├── src/lib/gemini.ts                       │
│  FavoritesTab   │   fetch('/api/gemini', { model, ... })    │
│  GuideTab    ───┘                                           │
│                                                             │
│  Favoris + Historique → localStorage                        │
│  Mot du jour cache → localStorage (TTL: 1 jour)            │
└────────────────────┬────────────────────────────────────────┘
                     │ POST /api/gemini
                     │ (JSON: { model, contents, generationConfig, ... })
                     │
         ┌───────────▼──────────────────────────────┐
         │         server.js (Express / Node.js)     │
         │         Cloud Run — us-west1              │
         │                                           │
         │  POST /api/gemini                         │
         │    → ajoute x-goog-api-key (env var)      │
         │    → proxy vers Gemini REST API            │
         │                                           │
         │  GET  /* → dist/ (Vite build statique)    │
         │  GET  * → index.html (SPA fallback)       │
         └───────────┬───────────────────────────────┘
                     │ HTTPS + x-goog-api-key
                     │
         ┌───────────▼──────────────────────────────┐
         │       Google Gemini API                   │
         │                                           │
         │  gemini-3-flash-preview                   │
         │    ├── Traduction FR ↔ KH (JSON mode)    │
         │    └── Mot du jour (JSON mode)            │
         │                                           │
         │  gemini-2.5-flash-preview-tts             │
         │    └── TTS khmer (Kore) + français        │
         │        (Zephyr) → PCM 24kHz → WAV         │
         └───────────────────────────────────────────┘
```

## Pourquoi pas le SDK `@google/genai` côté browser ?

Le SDK AI Studio installe un **service worker** qui intercepte les appels à `generativelanguage.googleapis.com` et les re-route via `/gemini-api-proxy/...` sur le même domaine — un mécanisme propre à l'infrastructure AI Studio. Hors AI Studio, cela cause des erreurs 405.

**Solution retenue** : supprimer le SDK du bundle browser et appeler directement notre endpoint Express `/api/gemini`. Avantages :
- La clé API ne touche jamais le bundle JS
- Pas de service worker à gérer
- Bundle ~200 KB plus léger (SDK retiré)

## Stack technique

| Couche | Technologie | Justification |
|---|---|---|
| Frontend | React 19 + TypeScript | Standard, excellent tooling |
| Build | Vite 6 | Rapide, HMR, support Tailwind 4 |
| Styles | Tailwind CSS 4 | Utility-first, zero config |
| Animations | Motion (framer-motion v12) | Transitions onglets, toggle, toasts |
| Backend | Express 4 (Node.js) | Minimal, suffit pour proxy + static |
| Conteneur | Docker multi-stage | Node builder → Node runner |
| Hosting | Cloud Run us-west1 | Scale-to-zero, simple, sans infra |

## Flux de traduction

```
User input (text + tone + mode)
  → TranslateTab.handleTranslate()
  → lib/gemini.translate(text, mode, tone, image?)
  → POST /api/gemini { model: 'gemini-3-flash-preview', contents: [...], generationConfig: { responseMimeType: 'application/json' } }
  → server.js ajoute x-goog-api-key
  → Gemini REST API
  → JSON { translatedText, phonetic, explanation, originalText }
  → Affichage résultat + ajout à l'historique
```

## Flux TTS

```
User clique 🔊
  → App.handleSpeak(text, lang)
  → lib/gemini.speak(text, lang)
  → POST /api/gemini { model: 'gemini-2.5-flash-preview-tts', generationConfig: { responseModalities: ['AUDIO'] }, speechConfig: { voiceConfig: { voiceName: 'Kore'|'Zephyr' } } }
  → Réponse: candidates[0].content.parts[0].inlineData.data (base64 PCM 24kHz)
  → buildWavHeader() + Blob audio/wav
  → URL.createObjectURL() → new Audio() → play()
```

## État applicatif

| État | Stockage | Durée de vie |
|---|---|---|
| Favoris | localStorage `khmer_favorites` | Permanent |
| Historique | localStorage `khmer_history` | Permanent (max 10) |
| Mot du jour | localStorage `word_of_the_day` + `_date` | 1 jour |
| Résultat traduction | React state | Session |
| Image en attente | React state (TranslateTab) | Jusqu'à envoi |
| isSpeaking | React state (App) | Durée du TTS |

## Sécurité

- **Clé API** : env var Cloud Run (`GEMINI_API_KEY`), jamais dans le bundle JS ni dans git
- **`.env`** : dans `.gitignore` et `.dockerignore`
- **Proxy** : le server Express valide la présence de la clé au démarrage (`process.exit(1)` si absente)
- **Pas d'authentification** : app personnelle, publique par choix (`--allow-unauthenticated`)
