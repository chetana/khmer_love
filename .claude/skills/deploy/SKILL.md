# Deploy — khmer_love

Déploie l'app kh.chetana.dev sur Cloud Run via Cloud Build.

## Steps

1. Vérifie qu'il n'y a pas d'erreurs TypeScript : `npm run lint`
2. Build de production : `npm run build`
3. Stage et commit les changements non commités (demander un message de commit si non fourni)
4. Lance le deploy Cloud Build :
   ```bash
   ~/.claude/bin/gcloud builds submit --config cloudbuild.yaml --project cykt-399216
   ```
5. Attends la fin du build (SUCCESS/FAILURE dans les logs)
6. Vérifie que le service répond :
   ```bash
   curl -s -o /dev/null -w "%{http_code}" https://kh.chetana.dev
   ```
   → Doit retourner 200. Sinon signaler l'erreur.
7. Affiche l'URL finale : **kh.chetana.dev**

## Notes

- Durée ~3 min (Cloud Build)
- La clé Gemini est un secret Cloud Build — ne pas la manipuler
- Si le build échoue : vérifier les logs Cloud Build dans la console GCP projet `cykt-399216`
