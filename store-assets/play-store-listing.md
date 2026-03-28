# Fiche Google Play Store — Famille Khmère

## Identifiants

- **Package name** : `dev.chetana.kh`
- **URL privacyPolicy** : `https://kh.chetana.dev/privacy.html`
- **URL site web** : `https://kh.chetana.dev`
- **Email contact** : `chetana@chetana.dev`
- **Catégorie** : Éducation
- **Classement contenu** : Tout public (3+)
- **Prix** : Gratuit

---

## Titre (max 50 caractères)

```
Famille Khmère — Traducteur FR↔KH
```
*(36 caractères)*

---

## Description courte (max 80 caractères)

```
Parle avec ta famille cambodgienne grâce à l'IA Google Gemini 🇰🇭
```
*(66 caractères)*

---

## Description complète (max 4000 caractères)

```
Tu as de la famille au Cambodge et tu voudrais lui parler en khmer ?
Famille Khmère est une application de traduction français–khmer conçue spécialement pour les échanges familiaux.

🌏 TRADUCTION CONTEXTUALISÉE
Contrairement aux traducteurs génériques, Famille Khmère adapte les pronoms et le registre selon qui tu parles : grand-mère (យាយ yeay), père (ប៉ា pa), oncle (ពូ pou), tante (មីង ming), frère/sœur aîné(e) (បង bong)... Fini les traductions maladroites !

📸 COMPRENDRE UN MESSAGE REÇU
Tu as reçu un message en khmer que tu ne comprends pas ? Colle le texte ou prends une photo directement depuis l'appli — elle traduit en français avec des explications culturelles.

🎓 APPRENDRE LE VOCABULAIRE
Un quiz de 10 expressions générées par l'IA te permet de progresser à ton rythme. Chaque quiz est différent !

🌺 EXPRESSION DU JOUR
Une nouvelle expression khmère chaque jour, avec sa phonétique et un bouton pour l'écouter.

💬 GUIDE CULTUREL INTERACTIF
Pose n'importe quelle question sur la culture khmère : conversion de riels en euros, comment se comporter au temple, les fêtes nationales, la signification du sampeah... L'IA répond en français.

🔊 AUDIO NATUREL
Écoute la prononciation de chaque traduction grâce à la synthèse vocale Google Gemini — en khmer et en français.

✨ FONCTIONNALITÉS
• 12 relations familiales prises en charge (+ copain/copine)
• Traduction FR → KH et KH → FR toujours accessibles
• Scan de screenshot ou photo pour traduire un message reçu
• Ton du message : doux, drôle ou quotidien
• Historique de tes 50 dernières traductions
• Favoris pour sauvegarder les phrases importantes
• 100% gratuit, sans publicité, sans compte requis

L'application fonctionne comme une vraie app native. Aucune donnée personnelle n'est collectée ni partagée.
```
*(1 841 caractères — il reste de la place)*

---

## Mots-clés (balises internes — non affichés)

```
khmer, cambodge, traduction, famille, cambodgien, langue khmère, apprendre khmer, traduire khmer français, parler cambodgien, culture khmère
```

---

## Assets graphiques requis

| Asset | Taille | Status |
|-------|--------|--------|
| Icône app | 512×512 px PNG | ✅ `public/icon-512.png` |
| Feature graphic (bannière) | 1024×500 px | ❌ À créer |
| Screenshots téléphone | min 2, max 8 — 1080×1920 px | ❌ À prendre |
| Screenshots tablette (optionnel) | 1200×1920 px | — |

### Feature graphic — description pour le créer
Fond dégradé teal (#0F766E → #134e4a), texte blanc "Famille Khmère" en grand, sous-titre "Parle avec ta famille cambodgienne 🇰🇭", icône de l'app à droite. Format 1024×500.

### Screenshots recommandés (ordre)
1. Onglet Trad — saisie FR avec résultat KH (montrer les pronoms)
2. Onglet Trad — section "Comprendre grand-mère"
3. Onglet Guide — chat culturel avec une réponse
4. Onglet Apprendre — quiz en cours
5. Sélecteur de relation (picker)

---

## Étapes Play Console

1. Créer compte développeur : https://play.google.com/console ($25 une fois)
2. Nouvelle app → "Famille Khmère"
3. Fiche du Play Store → coller les textes ci-dessus
4. Politique de confidentialité → `https://kh.chetana.dev/privacy.html`
5. Contenu de l'app → "Pas pour les enfants" (ou "Tout public")
6. Version → Upload AAB généré par PWABuilder
7. Mettre à jour `assetlinks.json` avec l'empreinte SHA256 du keystore PWABuilder
8. Soumettre pour review (~3-7 jours)
