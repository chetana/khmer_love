// No SDK in the browser — all Gemini calls go through our Express server at /api/gemini.
// The API key stays server-side (Cloud Run env var), never in the JS bundle.
import type { TranslationResult, WordOfDay, Mode, Tone } from '../types';
import { buildWavHeader } from './utils';

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
  mode: Mode,
  tone: Tone,
  imageBase64?: string
): Promise<TranslationResult> {
  const isBong = mode === 'BONG_TO_OUN';
  const tonePrompt = {
    sweet: 'Utilise un ton très doux, romantique et affectueux (mots doux, expressions tendres).',
    funny: 'Utilise un ton drôle, taquin et léger (pour se faire rire mutuellement).',
    daily: 'Utilise un ton simple, pratique et quotidien (pour les choses de la vie de tous les jours).',
  }[tone];

  const prompt = isBong
    ? `Traduis cette phrase ou analyse cette image du français vers le khmer pour ma petite amie au Cambodge.
       CONTEXTE : Je suis un homme plus âgé (Bong), elle est plus jeune (Oun).
       ${tonePrompt}`
    : `Traduis cette phrase ou analyse cette image du khmer vers le français pour mon petit ami français.
       CONTEXTE : Je suis une femme plus jeune (Oun), il est plus âgé (Bong).
       ${tonePrompt}`;

  const parts: any[] = [
    {
      text: `${prompt}\n\nTexte/Image à traduire : "${text}"\n\nRéponds UNIQUEMENT au format JSON : { "translatedText", "phonetic", "explanation", "originalText" }`,
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

export async function speak(text: string, lang: 'kh' | 'fr'): Promise<void> {
  const cleanText = text.replace(
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
    ''
  );

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

export async function generateWordOfDay(): Promise<WordOfDay> {
  const today = new Date().toDateString();
  const cached = localStorage.getItem('word_of_the_day');
  const cachedDate = localStorage.getItem('word_of_the_day_date');
  if (cached && cachedDate === today) return JSON.parse(cached);

  const response = await callGemini('gemini-3-flash-preview', {
    contents: [{ parts: [{ text: "Génère un mot ou une expression courte et romantique en français avec sa traduction en khmer et sa phonétique pour un couple. Réponds en JSON: {fr, kh, phon}" }] }],
    generationConfig: { responseMimeType: 'application/json' },
  });

  const data = JSON.parse(getText(response) || '{}');
  localStorage.setItem('word_of_the_day', JSON.stringify(data));
  localStorage.setItem('word_of_the_day_date', today);
  return data;
}
