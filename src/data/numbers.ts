export interface KhmerNumber {
  digit: string;  // Khmer numeral glyph
  word: string;   // Khmer word spelling (used for TTS — more reliable than isolated glyph)
  value: number;
  phon: string;
  hint?: string;  // Pattern hint to help memorize
  note?: string;  // Cultural/linguistic note
}

export const NUMBERS: KhmerNumber[] = [
  { digit: '០', word: 'សូន្យ',       value: 0,       phon: 'soun' },
  { digit: '១', word: 'មួយ',         value: 1,       phon: 'muoy' },
  { digit: '២', word: 'ពីរ',         value: 2,       phon: 'pii' },
  { digit: '៣', word: 'បី',          value: 3,       phon: 'bei' },
  { digit: '៤', word: 'បួន',         value: 4,       phon: 'buon' },
  { digit: '៥', word: 'ប្រាំ',       value: 5,       phon: 'pram' },
  { digit: '៦', word: 'ប្រាំមួយ',   value: 6,       phon: 'pram-muoy',  hint: '5 + 1' },
  { digit: '៧', word: 'ប្រាំពីរ',   value: 7,       phon: 'pram-pii',   hint: '5 + 2' },
  { digit: '៨', word: 'ប្រាំបី',    value: 8,       phon: 'pram-bei',   hint: '5 + 3' },
  { digit: '៩', word: 'ប្រាំបួន',   value: 9,       phon: 'pram-buon',  hint: '5 + 4' },
  { digit: '១០',   word: 'ដប់',       value: 10,      phon: 'dop' },
  { digit: '២០',   word: 'ម្ភៃ',      value: 20,      phon: 'm\'phei' },
  { digit: '៣០',   word: 'សាមសិប',   value: 30,      phon: 'sam-sep' },
  { digit: '៤០',   word: 'សែសិប',    value: 40,      phon: 'saesep' },
  { digit: '៥០',   word: 'ហាសិប',    value: 50,      phon: 'ha-sep' },
  { digit: '៦០',   word: 'ហុកសិប',   value: 60,      phon: 'hok-sep' },
  { digit: '៧០',   word: 'ចិតសិប',   value: 70,      phon: 'chet-sep' },
  { digit: '៨០',   word: 'ប៉ែតសិប',  value: 80,      phon: 'paet-sep' },
  { digit: '៩០',   word: 'កៅសិប',    value: 90,      phon: 'kav-sep' },
  { digit: '១០០',  word: 'មួយរយ',    value: 100,     phon: 'muoy-roy' },
  { digit: '១០០០', word: 'មួយពាន់',  value: 1000,    phon: 'muoy-poan' },
  {
    digit: '១០០០០',
    word: 'មួយម៉ឺន',
    value: 10000,
    phon: 'muoy-meun',
    note: 'ម៉ឺន (meun) = 10 000. En khmer, les grands nombres se comptent par tranches de 10 000. "100 000" se dit ដប់ម៉ឺន (dop meun = 10 × 10 000).',
  },
  {
    digit: '១០០០០០០',
    word: 'មួយលាន',
    value: 1000000,
    phon: 'muoy-lean',
    note: 'លាន (lean) = 1 000 000. Correspond au million français. "2 millions" = ពីរលាន (pii lean).',
  },
];
