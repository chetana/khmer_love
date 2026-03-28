export interface KhmerNumber {
  digit: string;
  value: number;
  phon: string;
  hint?: string;
}

export const NUMBERS: KhmerNumber[] = [
  { digit: '០', value: 0, phon: 'soun' },
  { digit: '១', value: 1, phon: 'muoy' },
  { digit: '២', value: 2, phon: 'pii' },
  { digit: '៣', value: 3, phon: 'bei' },
  { digit: '៤', value: 4, phon: 'buon' },
  { digit: '៥', value: 5, phon: 'pram' },
  { digit: '៦', value: 6, phon: 'pram-muoy', hint: '5 + 1' },
  { digit: '៧', value: 7, phon: 'pram-pii', hint: '5 + 2' },
  { digit: '៨', value: 8, phon: 'pram-bei', hint: '5 + 3' },
  { digit: '៩', value: 9, phon: 'pram-buon', hint: '5 + 4' },
  { digit: '១០', value: 10, phon: 'dop' },
  { digit: '២០', value: 20, phon: 'm\'phei' },
  { digit: '៣០', value: 30, phon: 'sam-sep' },
  { digit: '៤០', value: 40, phon: 'saesep' },
  { digit: '៥០', value: 50, phon: 'ha-sep' },
  { digit: '១០០', value: 100, phon: 'muoy-roy' },
  { digit: '១០០០', value: 1000, phon: 'muoy-poan' },
];
