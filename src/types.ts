export interface FamilyRelationship {
  id: string;
  emoji: string;
  labelFr: string;
  speakerFr: string;
  listenerFr: string;
  speakerPronounFr: string;   // ex: "cheut (ចៅ)"
  listenerPronounFr: string;  // ex: "ta (តា)"
  speakerPronounKh: string;   // Khmer script
  listenerPronounKh: string;  // Khmer script
  geminiContext: string;
  quickPhrasesFr: string[];
}

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
  relationshipId: string;
  direction: Direction;
  ts: number;
}

export interface WordOfDay {
  fr: string;
  kh: string;
  phon: string;
}

export type Direction = 'FR_TO_KH' | 'KH_TO_FR';
export type Tab = 'translate' | 'favorites' | 'learn' | 'guide';
export type Tone = 'sweet' | 'funny' | 'daily';
