export interface KhmerNumber {
  digit: string;  // Khmer numeral glyph
  word: string;   // Khmer word spelling (used for TTS — more reliable than isolated glyph)
  value: number;
  phon: string;
  hint?: string;
}

export const NUMBERS: KhmerNumber[] = [
  { digit: '០', word: 'សូន្យ',      value: 0,    phon: 'soun' },
  { digit: '១', word: 'មួយ',        value: 1,    phon: 'muoy' },
  { digit: '២', word: 'ពីរ',        value: 2,    phon: 'pii' },
  { digit: '៣', word: 'បី',         value: 3,    phon: 'bei' },
  { digit: '៤', word: 'បួន',        value: 4,    phon: 'buon' },
  { digit: '៥', word: 'ប្រាំ',      value: 5,    phon: 'pram' },
  { digit: '៦', word: 'ប្រាំមួយ',  value: 6,    phon: 'pram-muoy',  hint: '5 + 1' },
  { digit: '៧', word: 'ប្រាំពីរ',  value: 7,    phon: 'pram-pii',   hint: '5 + 2' },
  { digit: '៨', word: 'ប្រាំបី',   value: 8,    phon: 'pram-bei',   hint: '5 + 3' },
  { digit: '៩', word: 'ប្រាំបួន',  value: 9,    phon: 'pram-buon',  hint: '5 + 4' },
  { digit: '១០',  word: 'ដប់',      value: 10,   phon: 'dop' },
  { digit: '២០',  word: 'ម្ភៃ',     value: 20,   phon: 'm\'phei' },
  { digit: '៣០',  word: 'សាមសិប',  value: 30,   phon: 'sam-sep' },
  { digit: '៤០',  word: 'សែសិប',   value: 40,   phon: 'saesep' },
  { digit: '៥០',  word: 'ហាសិប',   value: 50,   phon: 'ha-sep' },
  { digit: '១០០',  word: 'មួយរយ',  value: 100,  phon: 'muoy-roy' },
  { digit: '១០០០', word: 'មួយពាន់', value: 1000, phon: 'muoy-poan' },
];
