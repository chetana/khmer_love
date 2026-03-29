# khmer_love — Instructions Claude

Application PWA franco-khmère (Bong & Oun). React 19 + Vite + TypeScript + Tailwind 4 + Express proxy.

## Déploiement

```bash
~/.claude/bin/gcloud builds submit --config cloudbuild.yaml --project cykt-399216
```

- Durée : ~3 min (Cloud Build build + push + deploy)
- Région : `us-west1`, service : `khmer-love-translator`
- **Ne pas utiliser `bash deploy.sh`** directement — il utilise `--tag` au lieu de `--config` et peut créer une image sans les env vars correctes
- La clé `GEMINI_API_KEY` est stockée sur le service Cloud Run (ne pas la re-passer à chaque deploy)

## Architecture clé

- **Jamais de clé API dans le bundle JS** — tout appel Gemini passe par `/api/gemini` (Express proxy dans `server.js`)
- `src/lib/gemini.ts` = seul point d'entrée pour toutes les interactions Gemini
- Modèles : `gemini-3-flash-preview` (texte/JSON) + `gemini-2.5-flash-preview-tts` (audio)
- TTS : Gemini d'abord, fallback Web Speech API (`km-KH` / `fr-FR`) si échec

## Données statiques

- `src/data/alphabet.ts` : `CONSONANTS` (33) + `VOWELS` (20)
- `src/data/numbers.ts` : `NUMBERS` (23 entrées, 0–1 000 000)
- `src/lib/relationships.ts` : 12 `FamilyRelationship` objects

## localStorage keys

| Clé | Contenu |
|---|---|
| `khmer_relationship_id` | Relation sélectionnée |
| `khmer_direction` | `FR_TO_KH` \| `KH_TO_FR` |
| `khmer_learn_section` | `vocab` \| `alpha` \| `numbers` |
| `khmer_alpha_group` | `consonants` \| `vowels` |
| `khmer_alpha_learned` | Set de consonnes apprises (JSON array) |
| `khmer_vowels_learned` | Set de voyelles apprises |
| `khmer_numbers_learned` | Set de chiffres appris (par `digit`) |
| `khmer_favorites` | Traductions favorites |
| `khmer_history` | 50 dernières traductions |
| `word_of_the_day` + `_date` | Cache mot du jour (TTL 1 jour) |
| `khmer_audio_cache_v1` | Cache TTS audio (max 30 entrées PCM base64) |

## Pièges connus

- **TTS glyph isolé** : `speak('១', 'kh')` échoue — toujours utiliser le mot khmer (`speak('មួយ', 'kh')`). C'est pour ça que `KhmerNumber` a le champ `word` séparé de `digit`.
- **Tabs always-mounted** : les 4 onglets sont toujours dans le DOM, juste masqués par `className="hidden"`. Cela préserve l'état React (quiz en cours, chat). Ne pas conditionner leur rendu.
- **audioCache** : hydraté depuis localStorage au démarrage du module — ne jamais cacher une base64 vide (guard dans `setAudioCache`).
- **Relation pronoms** : dans `RelationshipPicker` et `GuideTab`, la romanisation s'extrait via `pronounFr.split(' (')[0]` (ex: `"bong (aîné)"` → `"bong"`).
- **`capture="environment"`** sur l'input camera → ouvre directement la caméra (pas galerie).
- **Ton KH→FR** : hardcodé `'daily'` dans `translate()` — le sélecteur de ton ne s'applique qu'à FR→KH.

## Commandes utiles

```bash
npm run dev          # Dev server Vite :3000
npm run build        # Build prod → dist/
npm run lint         # tsc --noEmit
node server.js       # Test Express complet :8080
```
