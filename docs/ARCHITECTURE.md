# Architecture — khmer_love (Bong & Oun)

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                     Browser (React + Vite)                       │
│                                                                   │
│  TranslateTab ──┐                                                 │
│  LearnTab       ├── src/lib/gemini.ts                             │
│  FavoritesTab   │   fetch('/api/gemini', { model, ... })          │
│  GuideTab    ───┘                                                 │
│                                                                   │
│  audioCache.ts  ── memCache (session) + localStorage (30 entrées)│
│  Favoris + Historique ────────────────── localStorage             │
│  Progression alphabet/chiffres ───────── localStorage             │
│  Mot du jour cache ─────────── localStorage (TTL: 1 jour)        │
└────────────────────┬────────────────────────────────────────────-┘
                     │ POST /api/gemini
                     │ (JSON: { model, contents, generationConfig, ... })
                     │
         ┌───────────▼──────────────────────────────────┐
         │         server.js (Express / Node.js)          │
         │         Cloud Run — us-west1                   │
         │                                                │
         │  POST /api/gemini                              │
         │    → ajoute x-goog-api-key (env var)           │
         │    → proxy vers Gemini REST API                 │
         │                                                │
         │  GET  /* → dist/ (Vite build statique)         │
         │  GET  * → index.html (SPA fallback)            │
         └───────────┬────────────────────────────────────┘
                     │ HTTPS + x-goog-api-key
                     │
         ┌───────────▼────────────────────────────────────┐
         │          Google Gemini API                       │
         │                                                  │
         │  gemini-3-flash-preview                          │
         │    ├── Traduction FR ↔ KH (JSON mode)           │
         │    ├── Mot du jour (JSON mode)                   │
         │    ├── Quiz vocabulaire — 15 phrases (JSON)      │
         │    └── Chat culture (texte libre / markdown)     │
         │                                                  │
         │  gemini-2.5-flash-preview-tts                    │
         │    └── TTS khmer (Kore) + français (Zephyr)      │
         │        → PCM 24kHz 16-bit → WAV                  │
         └────────────────────────────────────────────────--┘
                      ↓ si TTS Gemini échoue
         ┌────────────────────────────────┐
         │  Web Speech API (navigateur)   │
         │  km-KH / fr-FR                 │
         │  Voix synthétique du téléphone │
         └────────────────────────────────┘
```

---

## Pourquoi pas le SDK `@google/genai` côté browser ?

Le SDK AI Studio installe un **service worker** qui intercepte les appels à `generativelanguage.googleapis.com` et les re-route via `/gemini-api-proxy/...` — un mécanisme propre à l'infrastructure AI Studio. Hors AI Studio, cela cause des erreurs 405.

**Solution retenue** : supprimer le SDK du bundle browser, appeler directement notre endpoint Express `/api/gemini`. Avantages :
- La clé API ne touche jamais le bundle JS
- Pas de service worker
- Bundle ~200 KB plus léger

---

## Stack technique

| Couche | Technologie | Justification |
|---|---|---|
| Frontend | React 19 + TypeScript | Standard, excellent tooling |
| Build | Vite 6 | Rapide, HMR, support Tailwind 4 |
| Styles | Tailwind CSS 4 | Utility-first, zero config |
| Animations | Motion (framer-motion v12) | Transitions onglets, flashcards, toasts |
| Icônes | Lucide React | Tree-shakeable, cohérent |
| Backend | Express 4 (Node.js) | Minimal, suffit pour proxy + static |
| Conteneur | Docker multi-stage | Node builder → Node runner |
| Hosting | Cloud Run us-west1 | Scale-to-zero, sans infra |

---

## Flux de traduction

```
User input (text + ton + relation + direction)
  → TranslateTab.handleTranslate()
  → lib/gemini.translate(text, relationship, direction, tone, imageBase64?)
  → POST /api/gemini { model: 'gemini-3-flash-preview',
                       contents: [{ parts: [prompt, ?imageData] }],
                       generationConfig: { responseMimeType: 'application/json' } }
  → server.js ajoute x-goog-api-key
  → Gemini REST API
  → JSON { translatedText, phonetic, explanation, originalText }
  → Affichage résultat + ajout à l'historique localStorage
```

Le prompt injecte le **contexte relationnel complet** : pronoms locuteur + interlocuteur en KH et FR, registre de politesse, ton choisi.

---

## Flux TTS

```
User clique 🔊
  → lib/gemini.speak(text, lang)
  → Nettoyage emojis + check audioCache (memCache → localStorage)
  │
  ├── Cache HIT → playBase64Pcm(cached) (instantané, 0 appel API)
  │
  └── Cache MISS
        → POST /api/gemini { model: 'gemini-2.5-flash-preview-tts',
                              responseModalities: ['AUDIO'],
                              voiceName: 'Kore' (kh) | 'Zephyr' (fr) }
        ├── Succès → base64 PCM 24kHz
        │     → setAudioCache(text, lang, base64)
        │     → buildWavHeader() + Blob audio/wav
        │     → URL.createObjectURL() → new Audio() → play()
        │
        └── Échec (texte non reconnu, API unavailable…)
              → speakWebSpeech(text, lang)
              → SpeechSynthesisUtterance { lang: 'km-KH' | 'fr-FR' }
              → Voix synthétique du navigateur/téléphone
```

### Cache audio (`src/lib/audioCache.ts`)

| Niveau | Stockage | Limite | Durée |
|---|---|---|---|
| memCache | `Map<string, string>` (RAM) | Illimité | Session |
| Persistent | `localStorage['khmer_audio_cache_v1']` | 30 entrées (LRU) | Permanent |

Clé de cache : `lang::texte_nettoyé`. Chargé depuis localStorage au démarrage du module.

---

## Flux apprentissage flashcards

```
Onglet Apprendre → sélecteur [Vocabulaire | Alphabet | Chiffres]

Section Alphabet / Chiffres :
  → Charge données depuis data/alphabet.ts ou data/numbers.ts
  → Filtre les cartes déjà marquées "Appris" (depuis localStorage)
  → Shuffle() → deck[0] = carte courante
  → Front (glyph) → clic → Back (valeur + phon + 🔊 + exemple)
  → "Appris !" → retire du deck, sauvegarde dans localStorage
  → "À revoir" → envoie en fin de deck
  → Progression : bar + compteur X / total

Section Vocabulaire :
  → generateFamilyVocab() → Gemini (15 expressions)
  → Shuffle → 10 cartes
  → Quiz QCM : affiche KH, 4 choix FR
  → Feedback immédiat (vert/rouge) + score final
```

---

## État applicatif

| État | Stockage | Durée de vie |
|---|---|---|
| Relation sélectionnée | `localStorage['khmer_relationship_id']` | Permanent |
| Direction FR↔KH | `localStorage['khmer_direction']` | Permanent |
| Section apprendre | `localStorage['khmer_learn_section']` | Permanent |
| Groupe alphabet | `localStorage['khmer_alpha_group']` | Permanent |
| Consonnes apprises | `localStorage['khmer_alpha_learned']` | Permanent |
| Voyelles apprises | `localStorage['khmer_vowels_learned']` | Permanent |
| Chiffres appris | `localStorage['khmer_numbers_learned']` | Permanent |
| Favoris | `localStorage['khmer_favorites']` | Permanent |
| Historique | `localStorage['khmer_history']` | Permanent (max 50) |
| Mot du jour | `localStorage['word_of_the_day']` + `_date` | 1 jour TTL |
| Cache audio | `localStorage['khmer_audio_cache_v1']` | Permanent (max 30) |
| Résultat traduction | React state | Session |
| isSpeaking | React state (App) | Durée du TTS |
| État quiz | React state (LearnTab) | Session (tabs always-mounted) |

> **Tabs always-mounted** : les 4 onglets sont toujours rendus, cachés via `className="hidden"`. Cela préserve l'état du quiz et du chat en changeant d'onglet.

---

## Données statiques

### `src/data/alphabet.ts`

```ts
CONSONANTS: AlphabetChar[]  // 33 consonnes khmères
VOWELS: AlphabetChar[]      // 20 voyelles indépendantes

interface AlphabetChar {
  char: string;           // Caractère khmer
  phon: string;           // Romanisation (/k/, /kh/, /ng/…)
  example?: { kh, phon, fr };  // Mot exemple
  note?: string;          // Info contextuelle (voyelle courte, variante…)
}
```

### `src/data/numbers.ts`

```ts
NUMBERS: KhmerNumber[]  // 23 entrées : 0–9, 10/20…90, 100, 1000, 10000, 1000000

interface KhmerNumber {
  digit: string;  // Chiffre khmer (ex: ១)
  word: string;   // Mot khmer pour TTS (ex: មួយ — plus fiable que le glyph isolé)
  value: number;
  phon: string;   // Romanisation (ex: 'muoy')
  hint?: string;  // Aide mnémotechnique (ex: '5 + 1' pour 6)
  note?: string;  // Explication culturelle (ex: système ម៉ឺន pour 10 000)
}
```

> **Pourquoi `word` vs `digit` pour le TTS ?** Les glyphs numériques isolés (ex: `"១"`) sont peu fiables pour la synthèse vocale. Le modèle TTS reconnaît mieux les mots complets comme `"មួយ"`.

---

## Relations familiales (`src/lib/relationships.ts`)

12 objets `FamilyRelationship` :

```ts
interface FamilyRelationship {
  id: string;
  emoji: string;
  speakerFr: string;        // "Je (le/la cadet(te))"
  listenerFr: string;       // "mon frère aîné"
  speakerPronounKh: string; // "oun"
  listenerPronounKh: string;// "bong"
  speakerPronounFr: string; // "oun (je, cadet)"
  listenerPronounFr: string;// "bong (tu, aîné)"
  geminiContext: string;    // Contexte injecté dans le prompt Gemini
  quickPhrases: string[];   // Suggestions rapides
}
```

---

## Sécurité

- **Clé API** : env var Cloud Run (`GEMINI_API_KEY`), jamais dans le bundle JS ni dans git
- **`.env`** : dans `.gitignore` et `.dockerignore`
- **Proxy** : Express valide la présence de la clé au démarrage (`process.exit(1)` si absente)
- **Pas d'authentification** : app personnelle, publique par choix (`--allow-unauthenticated`)
- **Pas de données utilisateur** : tout est local (localStorage), aucun backend de persistance
