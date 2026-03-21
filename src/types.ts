export interface TranslationResult {
  translatedText: string;
  phonetic?: string;
  explanation: string;
  originalText: string;
}

export interface HistoryEntry {
  source: string;
  target: string;
  phonetic?: string;
  mode: Mode;
  ts: number;
}

export interface WordOfDay {
  fr: string;
  kh: string;
  phon: string;
}

export type Mode = 'BONG_TO_OUN' | 'OUN_TO_BONG';
export type Tab = 'translate' | 'favorites' | 'learn' | 'guide';
export type Tone = 'sweet' | 'funny' | 'daily';
