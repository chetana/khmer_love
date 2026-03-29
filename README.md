<div align="center">
  <h1>🌸 Bong & Oun</h1>
  <p><strong>Application franco-khmère — traduction, apprentissage et culture</strong></p>
  <p>
    <a href="https://khmer-love-translator-267131866578.us-west1.run.app">🚀 Live</a> ·
    <a href="docs/ARCHITECTURE.md">Architecture</a> ·
    <a href="docs/DEPLOY.md">Déploiement</a>
  </p>
</div>

---

## Présentation

Application PWA destinée aux familles franco-khmères. Elle traduit des messages avec le bon contexte culturel (système Bong/Oun, pronoms de respect), propose de l'audio TTS, un apprentissage progressif de l'alphabet et des chiffres khmers, et un guide culturel complet.

Initialement conçue pour un couple franco-cambodgien séparé par 9 074 km, elle a évolué pour couvrir toute la famille : parents, grands-parents, oncles, tantes, frères et sœurs.

---

## Fonctionnalités

### 🔄 Traduction (FR ↔ KH)

| Feature | Description |
|---|---|
| **Traduction contextuelle** | Adapte le texte aux pronoms de la relation sélectionnée (Bong/Oun/Pa/Mae…) |
| **3 tons** | Doux 💕, Drôle 😄, Quotidien 💬 |
| **12 relations familiales** | Grand-parents, parents, oncles/tantes, fratrie, couple |
| **Traduction d'image** | Capture ou galerie → contenu extrait + traduit par Gemini |
| **Émojis intégrés** | Picker 40 émojis directement dans l'input |
| **Audio TTS** | Synthèse vocale khmer + français via Gemini, fallback Web Speech API |

### 📚 Apprentissage (`Apprendre`)

| Section | Contenu |
|---|---|
| **Quiz vocabulaire** | 10 flashcards générées par Gemini (expressions famille), QCM KH → FR, score final |
| **Alphabet khmer** | 33 consonnes + 20 voyelles indépendantes — flashcards avec prononciation et exemple |
| **Chiffres khmers** | 23 cartes : 0–9, dizaines 10–90, 100, 1 000, 10 000, 1 000 000 — avec notes culturelles |

Chaque section de flashcards :
- Bouton 🔊 pour entendre la prononciation (Gemini TTS + fallback voix téléphone)
- Boutons **Appris !** / **À revoir** pour gérer son avancement
- Progression sauvegardée dans localStorage
- Barre de progression avec compteur

### ⭐ Historique & Favoris

- Favoris illimités (⭐ sur chaque traduction)
- Historique des 50 dernières traductions avec relation et direction
- Boutons copier + TTS + supprimer par entrée

### 🗺️ Guide culturel

- Système Bong/Oun expliqué avec tableau des pronoms
- Sampeah (salut traditionnel)
- Expressions courantes ("Nham bay ?", "Sok sabay ?")
- Fêtes nationales (Nouvel An Khmer, Pchum Ben, Bon Om Touk)
- Contexte bouddhiste
- Conversion monnaie (EUR/USD → KHR)
- Sections dépliables avec animations

### 🎯 Autres

- **Mot du jour** : expression romantique/familiale générée par Gemini, renouvelée chaque 24h
- **PWA** : installable sur iOS (Safari → Ajouter à l'écran d'accueil) et Android (Chrome, banner auto)
- **Cache audio** : les TTS générés sont mis en cache (session + localStorage, 30 entrées max) — pas de re-génération sur replay
- **Persistance onglets** : l'état du quiz et du chat reste en mémoire quand on change d'onglet

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 19 + TypeScript + Vite 6 |
| Styles | Tailwind CSS 4 + Motion (animations) |
| Icônes | Lucide React |
| Backend | Express (Node.js) — proxy Gemini + static serving |
| IA | Google Gemini API (`gemini-3-flash-preview` + `gemini-2.5-flash-preview-tts`) |
| TTS fallback | Web Speech API (`km-KH` / `fr-FR`) |
| Hosting | Google Cloud Run (us-west1) |
| Build | Cloud Build (Docker multi-stage) |

---

## Développement local

```bash
# 1. Cloner
git clone https://github.com/chetana/khmer_love
cd khmer_love

# 2. Installer les dépendances
npm install

# 3. Configurer la clé API
cp .env.example .env
# Éditer .env et ajouter GEMINI_API_KEY=...

# 4. Lancer
npm run dev
# → http://localhost:3000
```

> En dev, Vite proxy automatiquement `/api/gemini` vers le server Express lancé séparément si besoin.
> Pour tester l'Express complet : `npm run build && node server.js` sur :8080

---

## Déploiement Cloud Run

```bash
~/.claude/bin/gcloud builds submit --config cloudbuild.yaml --project cykt-399216
```

Cloud Build exécute : **docker build → docker push → gcloud run deploy**. Durée ~3 min.

Voir [docs/DEPLOY.md](docs/DEPLOY.md) pour le détail complet (rollback, logs, variables).

---

## Structure du projet

```
khmer_love/
├── src/
│   ├── App.tsx                    # Orchestrateur principal, state global
│   ├── types.ts                   # Types TypeScript partagés
│   ├── data/
│   │   ├── alphabet.ts            # 33 consonnes + 20 voyelles khmères
│   │   └── numbers.ts             # 23 chiffres khmers (0–1 000 000)
│   ├── lib/
│   │   ├── gemini.ts              # Appels API Gemini + TTS + fallback Web Speech
│   │   ├── audioCache.ts          # Cache audio 2 niveaux (session + localStorage)
│   │   ├── relationships.ts       # 12 relations familiales avec pronoms KH/FR
│   │   └── utils.ts               # cn(), buildWavHeader()
│   ├── hooks/
│   │   ├── useToast.ts            # Toasts d'erreur auto-dismiss 3s
│   │   └── useFavorites.ts        # Favoris + historique (localStorage)
│   └── components/
│       ├── Header.tsx             # Barre du haut + sélecteur de relation
│       ├── RelationshipPicker.tsx # Modal 12 relations
│       ├── WordOfDay.tsx          # Expression du jour
│       ├── ImagePreview.tsx       # Preview image + envoi
│       ├── Toast.tsx              # Conteneur de toasts
│       ├── NavButton.tsx          # Bouton de nav par onglet
│       └── tabs/
│           ├── TranslateTab.tsx   # Onglet traduction principal
│           ├── FavoritesTab.tsx   # Favoris + historique
│           ├── LearnTab.tsx       # Quiz + sélecteur de section
│           ├── GuideTab.tsx       # Fiches culturelles + chat
│           └── learn/
│               ├── AlphabetSection.tsx  # Flashcards alphabet (consonnes/voyelles)
│               └── NumbersSection.tsx   # Flashcards chiffres khmers
├── server.js                      # Express : proxy /api/gemini + static SPA
├── Dockerfile                     # Multi-stage : node build → node serve
├── cloudbuild.yaml                # GCP Cloud Build pipeline
├── deploy.sh                      # Script de déploiement
└── docs/
    ├── ARCHITECTURE.md            # Architecture technique détaillée
    └── DEPLOY.md                  # Guide de déploiement
```

---

## Relations familiales supportées

| # | Locuteur | Interlocuteur | Pronom locuteur | Pronom interlocuteur |
|---|---|---|---|---|
| 1 | Petit-enfant | Grand-père | cheut | ta |
| 2 | Petit-enfant | Grand-mère | cheut | yeay |
| 3 | Enfant | Père | khloun | pa |
| 4 | Enfant | Mère | khloun | mae |
| 5 | Cadet(te) | Frère aîné | oun | bong |
| 6 | Cadet(te) | Sœur aînée | oun | bong |
| 7 | Neveu/Nièce | Oncle aîné | khloun | om |
| 8 | Neveu/Nièce | Tante aînée | khloun | om |
| 9 | Neveu/Nièce | Oncle cadet | khloun | pou |
| 10 | Neveu/Nièce | Tante cadette | khloun | ming |
| 11 | Lui (bong) | Elle (oun) | bong | oun |
| 12 | Elle (oun) | Lui (bong) | oun | bong |
