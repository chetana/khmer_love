export interface AlphabetChar {
  char: string;
  phon: string;
  example?: { kh: string; phon: string; fr: string };
  note?: string;  // Extra info (e.g. vowel placement)
}

export const CONSONANTS: AlphabetChar[] = [
  { char: 'ក', phon: 'k', example: { kh: 'ក្បាល', phon: 'kbal', fr: 'tête' } },
  { char: 'ខ', phon: 'kh', example: { kh: 'ខ្លា', phon: 'khla', fr: 'tigre' } },
  { char: 'គ', phon: 'k', example: { kh: 'គ្រួសារ', phon: 'kruəsaa', fr: 'famille' } },
  { char: 'ឃ', phon: 'kh', example: { kh: 'ឃ្លាំ', phon: 'khlam', fr: 'surveiller' } },
  { char: 'ង', phon: 'ng', example: { kh: 'ងូតទឹក', phon: 'ngoot tik', fr: 'se laver' } },
  { char: 'ច', phon: 'ch', example: { kh: 'ចូល', phon: 'choul', fr: 'entrer' } },
  { char: 'ឆ', phon: 'chh', example: { kh: 'ឆ្ងាញ់', phon: 'chhngany', fr: 'délicieux' } },
  { char: 'ជ', phon: 'ch/j', example: { kh: 'ជើង', phon: 'choeng', fr: 'pied / jambe' } },
  { char: 'ឈ', phon: 'chh', example: { kh: 'ឈ្នះ', phon: 'chhnéah', fr: 'gagner' } },
  { char: 'ញ', phon: 'ñ/nh', example: { kh: 'ញ៉ាំ', phon: 'nyam', fr: 'manger' } },
  { char: 'ដ', phon: 'd', example: { kh: 'ដៃ', phon: 'dai', fr: 'main / bras' } },
  { char: 'ឋ', phon: 'th', example: { kh: 'ឋាន', phon: 'thaan', fr: 'lieu / ciel' } },
  { char: 'ឌ', phon: 'd', example: { kh: 'ឌីណូស័រ', phon: 'dinousɑr', fr: 'dinosaure' } },
  { char: 'ឍ', phon: 'dh', example: { kh: 'ឍានរដ្ឋ', phon: 'thean roth', fr: 'capitale' } },
  { char: 'ណ', phon: 'n', example: { kh: 'ណាស់', phon: 'nas', fr: 'très / beaucoup' } },
  { char: 'ត', phon: 't', example: { kh: 'តាម', phon: 'taam', fr: 'suivre / selon' } },
  { char: 'ថ', phon: 'th', example: { kh: 'ថ្ងៃ', phon: 'thngai', fr: 'jour / soleil' } },
  { char: 'ទ', phon: 't/d', example: { kh: 'ទឹក', phon: 'tik', fr: 'eau' } },
  { char: 'ធ', phon: 'th', example: { kh: 'ធំ', phon: 'thom', fr: 'grand / gros' } },
  { char: 'ន', phon: 'n', example: { kh: 'នំ', phon: 'nom', fr: 'gâteau' } },
  { char: 'ប', phon: 'b/p', example: { kh: 'បាយ', phon: 'baay', fr: 'riz / repas' } },
  { char: 'ផ', phon: 'ph', example: { kh: 'ផ្ទះ', phon: 'pteah', fr: 'maison' } },
  { char: 'ព', phon: 'p', example: { kh: 'ពេល', phon: 'peel', fr: 'moment / quand' } },
  { char: 'ភ', phon: 'ph', example: { kh: 'ភ្លៀង', phon: 'phlieng', fr: 'pluie' } },
  { char: 'ម', phon: 'm', example: { kh: 'ម្ដាយ', phon: 'mdaay', fr: 'maman' } },
  { char: 'យ', phon: 'y', example: { kh: 'យល់', phon: 'yol', fr: 'comprendre' } },
  { char: 'រ', phon: 'r', example: { kh: 'រៀន', phon: 'rien', fr: 'apprendre' } },
  { char: 'ល', phon: 'l', example: { kh: 'លេង', phon: 'leng', fr: 'jouer / s\'amuser' } },
  { char: 'វ', phon: 'v/w', example: { kh: 'វត្ត', phon: 'vott', fr: 'temple / pagode' } },
  { char: 'ស', phon: 's', example: { kh: 'សាលា', phon: 'saala', fr: 'école' } },
  { char: 'ហ', phon: 'h', example: { kh: 'ហូប', phon: 'hob', fr: 'manger (poli)' } },
  { char: 'ឡ', phon: 'l', example: { kh: 'ឡាន', phon: 'laan', fr: 'voiture' } },
  { char: 'អ', phon: 'a/o', example: { kh: 'អូន', phon: 'oun', fr: 'petit(e) frère/sœur' } },
];

// Independent vowels — used alone (without a consonant base)
export const VOWELS: AlphabetChar[] = [
  { char: 'អា', phon: 'aa', example: { kh: 'អាហារ', phon: 'aahaa', fr: 'nourriture' } },
  { char: 'អិ', phon: 'i', example: { kh: 'អិម', phon: 'im', fr: 'sourire' }, note: 'Voyelle courte' },
  { char: 'អី', phon: 'ei', example: { kh: 'អីវ៉ាន់', phon: 'ei-van', fr: 'affaires / bagages' } },
  { char: 'អុ', phon: 'o', example: { kh: 'អុំ', phon: 'om', fr: 'méditer' }, note: 'Voyelle courte' },
  { char: 'អូ', phon: 'oo', example: { kh: 'អូន', phon: 'oun', fr: 'petit(e) frère/sœur' } },
  { char: 'អឿ', phon: 'ɯə', example: { kh: 'អឿ', phon: 'ɯə', fr: 'oh ! (interjection)' } },
  { char: 'ឥ', phon: 'i', example: { kh: 'ឥឡូវ', phon: 'ei-lov', fr: 'maintenant' } },
  { char: 'ឦ', phon: 'ii', example: { kh: 'ឦសាន', phon: 'ei-saan', fr: 'nord-est' } },
  { char: 'ឧ', phon: 'u', example: { kh: 'ឧទ្យាន', phon: 'ut-tyen', fr: 'parc / jardin' } },
  { char: 'ឩ', phon: 'uu', example: { kh: 'ឩបករណ៍', phon: 'uu-pa-kɑ', fr: 'outil / équipement' } },
  { char: 'ឪ', phon: 'ov', example: { kh: 'ឪពុក', phon: 'ov-puk', fr: 'père / papa' } },
  { char: 'ឫ', phon: 'rɨ', example: { kh: 'ឫស', phon: 'rɨh', fr: 'racine' } },
  { char: 'ឬ', phon: 'rɨɨ', example: { kh: 'ឬ', phon: 'rɨɨ', fr: 'ou (conjonction)' } },
  { char: 'ឭ', phon: 'lɨ', example: { kh: 'ឭ', phon: 'lɨ', fr: 'syllabe rare (textes anciens)' } },
  { char: 'ឮ', phon: 'lɨɨ', example: { kh: 'ឮ', phon: 'lɨɨ', fr: 'entendre' } },
  { char: 'ឯ', phon: 'ae', example: { kh: 'ឯករាជ្យ', phon: 'ae-ka-riec', fr: 'indépendance' } },
  { char: 'ឰ', phon: 'ai', example: { kh: 'ឰដៀល', phon: 'ai-diel', fr: 'honte / gêne' } },
  { char: 'ឱ', phon: 'ao', example: { kh: 'ឱ្យ', phon: 'aoy', fr: 'donner / pour que' } },
  { char: 'ឲ', phon: 'ao', example: { kh: 'ឲ្យ', phon: 'aoy', fr: 'donner (variante de ឱ្យ)' }, note: 'Variante graphique de ឱ' },
  { char: 'ឳ', phon: 'au', example: { kh: 'ឳ', phon: 'au', fr: 'interjection (oh !)' } },
];
