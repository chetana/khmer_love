<div align="center">
  <h1>🇰🇭 Bong & Oun — kh.chetana.dev</h1>
  <p><strong>Apprendre le khmer pour communiquer avec sa famille cambodgienne</strong></p>
  <p>
    <a href="https://kh.chetana.dev">🚀 Live</a> ·
    <a href="docs/ARCHITECTURE.md">Architecture</a> ·
    <a href="docs/DEPLOY.md">Deploy</a>
  </p>
</div>

## Features

- **Traduction** : FR → KH avec contexte familial (12 relations), 3 tons (doux, drôle, quotidien)
- **Apprendre** : Alphabet khmer (33 consonnes + 20 voyelles), chiffres (0-1M), quiz vocabulaire 3 niveaux
- **Guide culturel** : Culture khmère (Nouvel An, Pchum Ben, pronoms familiaux, argent, coutumes)
- **Audio TTS** : Gemini 2.5 Flash TTS avec retry serveur (3 tentatives), fallback Web Speech
- **Micro VAD** : Enregistrement audio avec détection vocale (Silero VAD v5)
- **PWA** : installable, flashcards en cache localStorage

## Stack

- React 19 + Vite + TypeScript
- Express (serveur Gemini proxy + transcription audio)
- Cloud Run (us-west1)
- Gemini API (traduction, TTS, quiz, culture chat, transcription)

## Projet miroir

[fr.chetana.dev](https://french-love-267131866578.us-west1.run.app) — le miroir inversé pour aider les khmèrophones à apprendre le français.

## Deploy

```bash
~/.claude/bin/gcloud builds submit --config cloudbuild.yaml --project cykt-399216
```
