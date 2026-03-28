export interface AlphabetChar {
  char: string;
  phon: string;
  example?: { kh: string; phon: string; fr: string };
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
  { char: 'ឌ', phon: 'd', example: { kh: 'ឌូ', phon: 'doo', fr: 'jouer (instrument)' } },
  { char: 'ឍ', phon: 'dh', example: { kh: 'ឍឹម', phon: 'dheum', fr: 'sourd' } },
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
