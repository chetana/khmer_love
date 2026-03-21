<div align="center">
  <h1>🌸 Bong & Oun</h1>
  <p><strong>Traducteur français ↔ khmer pour couples longue distance</strong></p>
  <p>
    <a href="https://khmer-love-translator-267131866578.us-west1.run.app">🚀 Live</a> ·
    <a href="docs/ARCHITECTURE.md">Architecture</a> ·
    <a href="docs/DEPLOY.md">Déploiement</a>
  </p>
</div>

---

## Présentation

Application web pensée pour un couple franco-cambodgien séparé par 9 074 km. Elle traduit des messages avec le contexte culturel Bong/Oun (système de respect lié à l'âge), propose de l'audio TTS, un quiz de vocabulaire khmer et un guide culturel.

## Fonctionnalités

| Feature | Description |
|---|---|
| **Traduction FR ↔ KH** | Contexte Bong (aîné) / Oun (cadet), 3 tons : doux / drôle / quotidien |
| **TTS** | Synthèse vocale khmer et française via Gemini Audio |
| **Upload image** | Preview + traduction du contenu d'une image |
| **Mot du jour** | Expression romantique générée par Gemini, cachée 24h |
| **Favoris** | Sauvegarde locale (localStorage) des traductions préférées |
| **Historique** | 10 dernières traductions persistées |
| **Quiz vocabulaire** | 10 flashcards KH → FR avec score, shuffle, progression |
| **Guide culturel** | Bong/Oun, Sampeah, "Nham bay?", fêtes nationales — fiches dépliables |

## Stack

| Couche | Technologie |
|---|---|
| Frontend | React 19 + TypeScript + Vite 6 |
| Styles | Tailwind CSS 4 + Motion (animations) |
| Icônes | Lucide React |
| Backend | Express (Node.js) — proxy Gemini + static serving |
| IA | Google Gemini API (`gemini-3-flash-preview` + `gemini-2.5-flash-preview-tts`) |
| Hosting | Google Cloud Run (us-west1) |
| Build | Cloud Build (multi-stage Docker) |

## Développement local

```bash
# 1. Cloner
git clone https://github.com/chetana/khmer_love
cd khmer_love

# 2. Installer les dépendances
npm install

# 3. Configurer la clé API
cp .env.example .env
# Éditer .env et ajouter ta GEMINI_API_KEY

# 4. Lancer
npm run dev
# → http://localhost:3000
```

## Déploiement Cloud Run

```bash
bash deploy.sh
```

Voir [docs/DEPLOY.md](docs/DEPLOY.md) pour le détail complet.

## Structure du projet

```
khmer_love/
├── src/
│   ├── App.tsx                  # Orchestrateur principal (~90 lignes)
│   ├── types.ts                 # Types TypeScript partagés
│   ├── lib/
│   │   ├── gemini.ts            # Appels API Gemini via fetch → /api/gemini
│   │   └── utils.ts             # cn(), buildWavHeader()
│   ├── hooks/
│   │   ├── useToast.ts          # Toasts d'erreur auto-dismiss 3s
│   │   └── useFavorites.ts      # Favoris + historique (localStorage)
│   └── components/
│       ├── Toast.tsx
│       ├── NavButton.tsx
│       ├── Header.tsx           # Toggle Bong/Oun
│       ├── WordOfDay.tsx
│       ├── ImagePreview.tsx
│       └── tabs/
│           ├── TranslateTab.tsx
│           ├── FavoritesTab.tsx  # Favoris + section Récents
│           ├── LearnTab.tsx      # Quiz vocabulaire fonctionnel
│           └── GuideTab.tsx      # Fiches culturelles dépliables
├── server.js                    # Express : proxy /api/gemini + static
├── Dockerfile                   # Multi-stage : node build → node serve
├── cloudbuild.yaml              # GCP Cloud Build
├── deploy.sh                    # Script de déploiement one-liner
└── docs/
    ├── ARCHITECTURE.md
    └── DEPLOY.md
```
