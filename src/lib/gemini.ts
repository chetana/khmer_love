// No SDK in the browser — all Gemini calls go through our Express server at /api/gemini.
// The API key stays server-side (Cloud Run env var), never in the JS bundle.
import type { TranslationResult, WordOfDay, FamilyRelationship, Direction, Tone } from '../types';
import { buildWavHeader } from './utils';
import { getAudioCache, setAudioCache } from './audioCache';

async function callGemini(model: string, body: object): Promise<any> {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, ...body }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

function getText(response: any): string {
  return response?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

export async function translate(
  text: string,
  relationship: FamilyRelationship,
  direction: Direction,
  tone: Tone,
  imageBase64?: string
): Promise<TranslationResult> {
  const tonePrompt = {
    sweet: 'Utilise un ton doux et affectueux.',
    funny: 'Utilise un ton léger, taquin et amusant.',
    daily: 'Utilise un ton simple et quotidien.',
  }[tone];

  const prompt =
    direction === 'FR_TO_KH'
      ? `Tu aides quelqu'un à parler à un membre de sa famille cambodgienne en khmer.
         Contexte relationnel : ${relationship.geminiContext}
         Le locuteur (${relationship.speakerFr}) se désigne comme "${relationship.speakerPronounKh}" (${relationship.speakerPronounFr}).
         Il/elle s'adresse à son/sa ${relationship.listenerFr} qu'il/elle appelle "${relationship.listenerPronounKh}" (${relationship.listenerPronounFr}).
         ${tonePrompt}
         Traduis du français vers le khmer en utilisant absolument les bons pronoms et le registre approprié à cette relation.`
      : `Tu aides quelqu'un à comprendre un message de son/sa ${relationship.listenerFr} cambodgien(ne).
         Contexte relationnel : ${relationship.geminiContext}
         Le/la ${relationship.listenerFr} se désigne comme "${relationship.listenerPronounKh}" (${relationship.listenerPronounFr}).
         Il/elle s'adresse au locuteur (${relationship.speakerFr}) comme "${relationship.speakerPronounKh}" (${relationship.speakerPronounFr}).
         Traduis du khmer vers le français en expliquant le contexte culturel si nécessaire.`;

  const parts: any[] = [
    {
      text: `${prompt}\n\nTexte à traduire : "${text}"\n\nRéponds UNIQUEMENT au format JSON : { "translatedText", "phonetic", "explanation", "originalText" }`,
    },
  ];

  if (imageBase64) {
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] } });
  }

  const response = await callGemini('gemini-3-flash-preview', {
    contents: [{ parts }],
    generationConfig: { responseMimeType: 'application/json' },
  });

  return JSON.parse(getText(response) || '{}');
}

function playBase64Pcm(base64Audio: string): Promise<void> {
  const audioData = atob(base64Audio);
  const pcmBuffer = new ArrayBuffer(audioData.length);
  const pcmView = new Uint8Array(pcmBuffer);
  for (let i = 0; i < audioData.length; i++) pcmView[i] = audioData.charCodeAt(i);
  const blob = new Blob([buildWavHeader(audioData.length), pcmBuffer], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  return new Promise((resolve, reject) => {
    audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
    audio.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Audio playback failed')); };
    audio.play().catch(reject);
  });
}

export async function speak(text: string, lang: 'kh' | 'fr'): Promise<void> {
  const cleanText = text.replace(
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
    ''
  ).trim();

  // Serve from cache if available
  const cached = getAudioCache(cleanText, lang);
  if (cached) return playBase64Pcm(cached);

  const response = await callGemini('gemini-2.5-flash-preview-tts', {
    contents: [{ parts: [{ text: `Please say this text in ${lang === 'kh' ? 'Khmer' : 'French'}: ${cleanText}` }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: lang === 'kh' ? 'Kore' : 'Zephyr' } },
      },
    },
  });

  const base64Audio = response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error('No audio data returned');

  setAudioCache(cleanText, lang, base64Audio);
  return playBase64Pcm(base64Audio);
}

export async function generateWordOfDay(force = false): Promise<WordOfDay> {
  const today = new Date().toDateString();
  if (!force) {
    const cached = localStorage.getItem('word_of_the_day');
    const cachedDate = localStorage.getItem('word_of_the_day_date');
    if (cached && cachedDate === today) return JSON.parse(cached);
  }

  const response = await callGemini('gemini-3-flash-preview', {
    contents: [{ parts: [{ text: 'Génère un mot ou une expression courte et utile pour parler à sa famille cambodgienne. Évite les expressions déjà courantes. Réponds en JSON: {fr, kh, phon}' }] }],
    generationConfig: { responseMimeType: 'application/json' },
  });

  const data = JSON.parse(getText(response) || '{}');
  localStorage.setItem('word_of_the_day', JSON.stringify(data));
  localStorage.setItem('word_of_the_day_date', today);
  return data;
}

export async function askCultureChat(question: string): Promise<string> {
  const response = await callGemini('gemini-3-flash-preview', {
    contents: [{
      parts: [{
        text: `Tu es un expert de la culture et des traditions khmères (cambodgiennes).
Tu réponds en français, de manière concise, chaleureuse et pratique.
Tu couvres : langue, pronoms familiaux, coutumes, nourriture, fêtes (Nouvel An Khmer, Pchum Ben, Bon Om Touk), religion bouddhiste, argent (1 EUR ≈ 4400 KHR, 1 USD ≈ 4100 KHR), gestes de politesse, us et coutumes.
Si on te demande une conversion d'argent, utilise ces taux approximatifs.

Question : ${question}`,
      }],
    }],
  });
  return getText(response).trim() || 'Désolé, je n\'ai pas pu répondre à cette question.';
}

export async function generateFamilyVocab(): Promise<Array<{ fr: string; kh: string; phon: string }>> {
  const response = await callGemini('gemini-3-flash-preview', {
    contents: [{ parts: [{ text: `Génère exactement 15 expressions utiles pour parler avec sa famille cambodgienne.
Inclus : formules d'affection, questions du quotidien (manger, dormir, santé), expressions de respect, félicitations, réconfort.
Varie les registres (formel/informel). Chaque expression doit être naturelle et couramment utilisée.
Réponds UNIQUEMENT en JSON valide : [{"fr": "...", "kh": "...", "phon": "..."}]` }] }],
    generationConfig: { responseMimeType: 'application/json' },
  });
  const raw = getText(response);
  try {
    const arr = JSON.parse(raw || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
