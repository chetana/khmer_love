# Déploiement — khmer_love

## Infra

| Paramètre | Valeur |
|---|---|
| Service Cloud Run | `khmer-love-translator` |
| Région | `us-west1` |
| Projet GCP | `cykt-399216` |
| Image Docker | `gcr.io/cykt-399216/khmer-love-translator` |
| URL prod | `https://khmer-love-translator-267131866578.us-west1.run.app` |
| Domaine custom | `kh.chetana.dev` |

---

## Déployer

```bash
~/.claude/bin/gcloud builds submit --config cloudbuild.yaml --project cykt-399216
```

Cloud Build exécute automatiquement :
1. `docker build` (multi-stage, ~2 min)
2. `docker push` vers `gcr.io/cykt-399216/khmer-love-translator`
3. `gcloud run deploy` de la nouvelle image

Durée totale : **~3 min**.

> La clé `GEMINI_API_KEY` est stockée comme variable d'environnement sur le service Cloud Run. Elle **n'est pas re-passée** à chaque deploy via cloudbuild.yaml (le step `gcloud run deploy` ne touche pas les env vars existantes).

---

## Variables d'environnement

| Variable | Scope | Description |
|---|---|---|
| `GEMINI_API_KEY` | Cloud Run runtime | Clé API Gemini — **ne jamais committer** |
| `PORT` | Cloud Run (injecté auto) | Port d'écoute (défaut: 8080) |

### Mettre à jour la clé API

```bash
~/.claude/bin/gcloud run services update khmer-love-translator \
  --region us-west1 \
  --set-env-vars GEMINI_API_KEY=ta_nouvelle_clé \
  --project cykt-399216
```

### Récupérer la clé actuelle

```bash
~/.claude/bin/gcloud run services describe khmer-love-translator \
  --region us-west1 \
  --project cykt-399216 \
  --format="value(spec.template.spec.containers[0].env)"
```

---

## Architecture Docker

```dockerfile
# Stage 1 — Build Vite (node:20-alpine)
npm ci
npm run build  →  dist/

# Stage 2 — Runtime (node:20-alpine)
npm ci --omit=dev
COPY dist/ + server.js
EXPOSE 8080
CMD ["node", "server.js"]
```

Le conteneur expose le port `8080` (valeur par défaut Cloud Run via `$PORT`).

---

## Développement local

```bash
# Dev (hot-reload Vite, pas d'Express)
npm install
cp .env.example .env   # Ajouter GEMINI_API_KEY=...
npm run dev            # Vite sur :3000

# Test complet avec Express (même comportement que prod)
npm run build
node server.js         # Express sur :8080
```

> En mode `npm run dev`, les requêtes `/api/gemini` doivent être proxiées par Vite vers un serveur Express local. Sinon, lancer `node server.js` après le build.

---

## Rollback

```bash
# Lister les révisions disponibles
~/.claude/bin/gcloud run revisions list \
  --service khmer-love-translator \
  --region us-west1 \
  --project cykt-399216

# Router 100% du trafic vers une révision précédente
~/.claude/bin/gcloud run services update-traffic khmer-love-translator \
  --region us-west1 \
  --project cykt-399216 \
  --to-revisions khmer-love-translator-XXXXX=100
```

---

## Logs

```bash
~/.claude/bin/gcloud run services logs read khmer-love-translator \
  --region us-west1 \
  --project cykt-399216 \
  --limit 50
```

---

## PWA — Notes iOS/Android

- **Android Chrome** : banner d'installation automatique (manifest + service worker via VitePWA)
- **iOS Safari** : Partager → "Ajouter à l'écran d'accueil" (pas de banner auto sur iOS)
- Icônes PWA dans `public/` (192px + 512px)
- `vite-plugin-pwa` génère `manifest.webmanifest` + service worker au build
