# Déploiement — khmer_love

## Infra

| Paramètre | Valeur |
|---|---|
| Service Cloud Run | `khmer-love-translator` |
| Région | `us-west1` |
| Projet GCP | `cykt-399216` |
| Image | `gcr.io/cykt-399216/khmer-love-translator` |
| URL prod | `https://khmer-love-translator-267131866578.us-west1.run.app` |

## Déployer

```bash
bash deploy.sh
```

Le script :
1. Charge `GEMINI_API_KEY` depuis `.env`
2. Soumet le build à Cloud Build via `cloudbuild.yaml`
3. Déploie la nouvelle image sur Cloud Run avec la clé en env var runtime

> **Important** : la clé API est passée à Cloud Run comme variable d'environnement runtime, **pas** comme build arg. Le bundle JS ne contient jamais la clé.

## Architecture Docker

```dockerfile
# Stage 1 — Build Vite (node:20-alpine)
npm ci && npm run build → dist/

# Stage 2 — Runtime (node:20-alpine)
npm ci --omit=dev
COPY dist/ + server.js
CMD ["node", "server.js"]
```

Le conteneur expose le port `8080` (valeur par défaut Cloud Run via `$PORT`).

## Variables d'environnement

| Variable | Scope | Description |
|---|---|---|
| `GEMINI_API_KEY` | Cloud Run runtime | Clé API Gemini — **ne jamais committer** |
| `PORT` | Cloud Run (injecté auto) | Port d'écoute (défaut: 8080) |

## Récupérer la clé API

```bash
# Si perdue, la récupérer depuis le service Cloud Run existant
gcloud run services describe khmer-love-translator \
  --region us-west1 \
  --format="value(spec.template.spec.containers[0].env[2].value)"
```

## Développement local

```bash
npm install
cp .env.example .env   # Ajouter GEMINI_API_KEY
npm run dev            # Vite dev server sur :3000
```

En local, les appels `/api/gemini` partent vers Vite dev server qui ne proxy pas vers Express. Pour tester le serveur Express en local :

```bash
npm run build
node server.js         # Serveur Express sur :8080
```

## Rollback

```bash
# Lister les révisions
gcloud run revisions list --service khmer-love-translator --region us-west1

# Router vers une révision précédente
gcloud run services update-traffic khmer-love-translator \
  --region us-west1 \
  --to-revisions khmer-love-translator-00009-5pn=100
```

## Logs

```bash
gcloud run services logs read khmer-love-translator \
  --region us-west1 \
  --limit 50
```
