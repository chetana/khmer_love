import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import {
  Send, Copy, Check, Info, Sparkles, ArrowRightLeft,
  Volume2, Loader2, Camera, Images, Star, Share2, MessageSquare, Mic, SlidersHorizontal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { TranslationResult, FamilyRelationship, Direction, Tone, WordOfDay } from '../../types';
import { translate } from '../../lib/gemini';
import { cn } from '../../lib/utils';
import { ImagePreview } from '../ImagePreview';
import { WordOfDayCard } from '../WordOfDay';

interface TranslateTabProps {
  relationship: FamilyRelationship;
  direction: Direction;
  isSpeaking: boolean;
  isFavorite: (res: TranslationResult) => boolean;
  wordOfDay: WordOfDay | null;
  isRefreshingWord?: boolean;
  onSpeak: (text: string, lang: 'kh' | 'fr') => void;
  onRefreshWord: () => void;
  onToggleFavorite: (res: TranslationResult) => void;
  onAddHistory: (source: string, target: string, phonetic: string | undefined, explanation: string | undefined) => void;
  onError: (msg: string) => void;
}

export function TranslateTab({
  relationship,
  direction,
  isSpeaking,
  isFavorite,
  wordOfDay,
  isRefreshingWord,
  onSpeak,
  onRefreshWord,
  onToggleFavorite,
  onAddHistory,
  onError,
}: TranslateTabProps) {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tone, setTone] = useState<Tone>('daily');
  const [copied, setCopied] = useState<'single' | 'both' | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [showTone, setShowTone] = useState(false);
  const [vadLoading, setVadLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [micTarget, setMicTarget] = useState<'main' | 'reverse' | null>(null);
  const vadRef = useRef<{ start(): void; destroy(): void } | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const toneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showTone) return;
    const handler = (e: MouseEvent) => {
      if (showTone && toneRef.current && !toneRef.current.contains(e.target as Node)) {
        setShowTone(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showTone]);

  // Cleanup VAD on unmount
  useEffect(() => () => { vadRef.current?.destroy(); }, []);

  // Reverse: understand what the family member said (KH→FR)
  const [reverseText, setReverseText] = useState('');
  const [reverseResult, setReverseResult] = useState<TranslationResult | null>(null);
  const [reverseLoading, setReverseLoading] = useState(false);
  const [reversePendingImage, setReversePendingImage] = useState<string | null>(null);
  const reverseGalleryInputRef = useRef<HTMLInputElement>(null);
  const reverseCameraInputRef = useRef<HTMLInputElement>(null);

  const isFrToKh = direction === 'FR_TO_KH';

  const handleTranslate = async (textOverride?: string) => {
    const text = textOverride ?? inputText;
    if (!text.trim() && !pendingImage) return;
    setIsLoading(true);
    try {
      const data = await translate(text, relationship, direction, tone, pendingImage ?? undefined);
      setResult(data);
      setPendingImage(null);
      onAddHistory(text || 'Image', data.translatedText, data.phonetic, data.explanation);
    } catch (e) {
      console.error(e);
      onError('Erreur de traduction. Vérifie ta connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReverseTranslate = async (textOverride?: string) => {
    const text = textOverride ?? reverseText;
    if (!text.trim() && !reversePendingImage) return;
    setReverseLoading(true);
    try {
      const data = await translate(text, relationship, 'KH_TO_FR', 'daily', reversePendingImage ?? undefined);
      setReverseResult(data);
      setReversePendingImage(null);
      onAddHistory(text || 'Image', data.translatedText, data.phonetic, data.explanation);
    } catch (e) {
      console.error(e);
      onError('Erreur de traduction. Vérifie ta connexion.');
    } finally {
      setReverseLoading(false);
    }
  };

  // ── VAD / Enregistrement audio ──────────────────────────────────────────
  function float32ToWav(samples: Float32Array, sampleRate = 16000): Blob {
    const len = samples.length;
    const buf = new ArrayBuffer(44 + len * 2);
    const view = new DataView(buf);
    const w = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); view.setUint32(4, 36 + len * 2, true);
    w(8, 'WAVE'); w(12, 'fmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    w(36, 'data'); view.setUint32(40, len * 2, true);
    for (let i = 0; i < len; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(44 + i * 2, s < 0 ? s * 32768 : s * 32767, true);
    }
    return new Blob([buf], { type: 'audio/wav' });
  }

  function arrayBufferToBase64(buf: ArrayBuffer): string {
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  async function processAudio(samples: Float32Array, target: 'main' | 'reverse') {
    if (samples.length < 16000 * 0.8) return; // < 0.8s → bruit court, ignorer
    setTranscribing(true);
    try {
      const wav = float32ToWav(samples);
      const base64 = arrayBufferToBase64(await wav.arrayBuffer());
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: base64, mimeType: 'audio/wav' }),
      });
      const { text } = await res.json() as { text: string };
      if (!text?.trim()) return;
      if (target === 'main') {
        setInputText(text);
        await handleTranslate(text);
      } else {
        setReverseText(text);
        await handleReverseTranslate(text);
      }
    } catch {
      onError('Erreur de transcription vocale.');
    } finally {
      setTranscribing(false);
    }
  }

  async function startRecording(target: 'main' | 'reverse') {
    if (vadRef.current || vadLoading) return;
    setVadLoading(true);
    setMicTarget(target);
    try {
      const { MicVAD } = await import('@ricky0123/vad-web');
      const micVad = await MicVAD.new({
        baseAssetPath: '/',
        onnxWASMBasePath: '/',
        ortConfig: (ort: any) => { ort.env.wasm.wasmPaths = '/'; },
        model: 'v5',
        getStream: () => navigator.mediaDevices.getUserMedia({ audio: { noiseSuppression: true, echoCancellation: true, autoGainControl: true } }),
        onSpeechStart: () => setSpeaking(true),
        onSpeechEnd: (audio: Float32Array) => {
          setSpeaking(false);
          void processAudio(audio, target);
        },
      });
      vadRef.current = micVad;
      vadRef.current.start();
      setVadLoading(false);
      setRecording(true);
    } catch (e) {
      console.error('VAD init failed:', e);
      setVadLoading(false);
      setMicTarget(null);
    }
  }

  function stopRecording() {
    vadRef.current?.destroy();
    vadRef.current = null;
    setVadLoading(false);
    setRecording(false);
    setSpeaking(false);
    setMicTarget(null);
  }

  function toggleRecording(target: 'main' | 'reverse') {
    if (vadLoading || recording) stopRecording();
    else void startRecording(target);
  }

  const handleReverseImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setReversePendingImage(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPendingImage(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const copyToClipboard = (type: 'single' | 'both') => {
    if (!result) return;
    const frFlag = '🇫🇷 ';
    const khFlag = '🇰🇭 ';
    const text =
      type === 'single'
        ? (isFrToKh ? khFlag : frFlag) + result.translatedText
        : `${(isFrToKh ? frFlag : khFlag) + result.originalText}\n---\n${(isFrToKh ? khFlag : frFlag) + result.translatedText}`;
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const shareResult = async (res: TranslationResult) => {
    const frFlag = '🇫🇷 ';
    const khFlag = '🇰🇭 ';
    const text = `${(isFrToKh ? frFlag : khFlag) + res.originalText}\n---\n${(isFrToKh ? khFlag : frFlag) + res.translatedText}`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch { /* dismissed */ }
    } else {
      copyToClipboard('both');
    }
  };

  // Reset when relationship or direction changes
  const [prevRelId, setPrevRelId] = useState(relationship.id);
  const [prevDir, setPrevDir] = useState(direction);
  if (relationship.id !== prevRelId || direction !== prevDir) {
    setResult(null);
    setInputText('');
    setReverseText('');
    setReverseResult(null);
    setReversePendingImage(null);
    setPrevRelId(relationship.id);
    setPrevDir(direction);
    stopRecording();
  }

  const listenerShort = relationship.listenerFr.split('(')[0].trim();

  return (
    <motion.div
      key="translate"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Relationship context banner */}
      <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-100 rounded-2xl">
        <span className="text-2xl">{relationship.emoji}</span>
        <div className="text-xs text-stone-600 leading-tight">
          <span className="font-semibold text-teal-700">
            {isFrToKh ? 'Vous' : listenerShort}
          </span>
          {' '}({isFrToKh ? relationship.speakerPronounFr : relationship.listenerPronounFr})
          {' → '}
          <span className="font-semibold text-teal-700">
            {isFrToKh ? listenerShort : 'vous'}
          </span>
          {' '}({isFrToKh ? relationship.listenerPronounFr : relationship.speakerPronounFr})
        </div>
      </div>

      {/* ── Section 1 : Vous parlez à [listenerFr] ── */}
      <div className="space-y-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 px-2">
          Vous écrivez à {listenerShort}
        </p>

        {/* Input Card */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-stone-100 space-y-4">
          {/* Image preview */}
          <AnimatePresence>
            {pendingImage && (
              <ImagePreview src={pendingImage} onRemove={() => setPendingImage(null)} />
            )}
          </AnimatePresence>

          {/* Textarea + actions */}
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleTranslate();
              }}
              placeholder={`Écris en français pour ${relationship.listenerPronounFr}...`}
              className="w-full h-32 p-0 bg-transparent border-none focus:ring-0 text-xl transition-all placeholder:text-stone-300 resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <div className="flex gap-2">
                {/* Gallery */}
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  className="p-3 bg-stone-50 text-stone-400 rounded-full hover:bg-teal-50 hover:text-teal-600 transition-all"
                  title="Galerie photo"
                >
                  <Images className="w-5 h-5" />
                </button>
                <input type="file" ref={galleryInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />

                {/* Camera */}
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="p-3 bg-stone-50 text-stone-400 rounded-full hover:bg-teal-50 hover:text-teal-600 transition-all"
                  title="Prendre une photo"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input type="file" ref={cameraInputRef} onChange={handleImageSelect} accept="image/*" capture="environment" className="hidden" />

                {/* Mic VAD */}
                <button
                  onClick={() => toggleRecording('main')}
                  disabled={transcribing || (recording && micTarget === 'reverse')}
                  className={cn(
                    'p-3 rounded-full transition-all',
                    recording && micTarget === 'main' && !speaking ? 'bg-red-500 text-white' :
                    speaking && micTarget === 'main' ? 'bg-green-600 text-white' :
                    'bg-stone-50 text-stone-400 hover:bg-teal-50 hover:text-teal-600'
                  )}
                  title={vadLoading && micTarget === 'main' ? 'Chargement…' : recording && micTarget === 'main' ? 'Arrêter' : 'Message vocal'}
                >
                  {vadLoading && micTarget === 'main'
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : (recording || speaking) && micTarget === 'main'
                      ? <span className={cn('wav-bars', speaking && 'wav-active')}><span/><span/><span/><span/><span/></span>
                      : transcribing && micTarget === 'main'
                        ? <Loader2 className="w-5 h-5 animate-spin" />
                        : <Mic className="w-5 h-5" />
                  }
                </button>

                {/* Tone picker */}
                <div className="relative" ref={toneRef}>
                  <button
                    onClick={() => { setShowTone((v) => !v); }}
                    className={cn(
                      'p-3 rounded-full transition-all',
                      showTone ? 'bg-teal-50 text-teal-600' : 'bg-stone-50 text-stone-400 hover:bg-teal-50 hover:text-teal-600'
                    )}
                    title="Ton du message"
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                  </button>
                  <AnimatePresence>
                    {showTone && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-14 left-0 bg-white rounded-2xl shadow-xl border border-stone-100 p-2 flex flex-col gap-1 z-50 min-w-[140px]"
                      >
                        {([
                          { id: 'sweet', label: 'Doux', emoji: '🤍' },
                          { id: 'funny', label: 'Drôle', emoji: '😄' },
                          { id: 'daily', label: 'Quotidien', emoji: '☕' },
                        ] as { id: Tone; label: string; emoji: string }[]).map((t) => (
                          <button
                            key={t.id}
                            onClick={() => { setTone(t.id); setShowTone(false); }}
                            className={cn(
                              'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left',
                              tone === t.id ? 'bg-teal-50 text-teal-700' : 'text-stone-600 hover:bg-stone-50'
                            )}
                          >
                            <span>{t.emoji}</span> {t.label}
                            {tone === t.id && <Check className="w-3.5 h-3.5 ml-auto text-teal-500" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-stone-300">⌘↵</span>
                <button
                  onClick={() => handleTranslate()}
                  disabled={isLoading || (!inputText.trim() && !pendingImage)}
                  className="p-3 bg-stone-800 text-white rounded-full hover:bg-stone-900 shadow-lg disabled:bg-stone-100 disabled:text-stone-300 transition-all"
                >
                  {isLoading ? <Sparkles className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Result Card */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[32px] p-6 shadow-md border border-teal-100 space-y-6"
            >
              <div className="space-y-4">
                <div className="flex-1 text-center py-4">
                  <p className="khmer-text text-4xl text-stone-800 leading-relaxed">
                    {result.translatedText}
                  </p>
                  {result.phonetic && (
                    <p className="text-sm text-stone-400 italic mt-2">{result.phonetic}</p>
                  )}
                </div>

                <div className="flex justify-center gap-3 flex-wrap">
                  <button
                    onClick={() => onSpeak(result.translatedText, 'kh')}
                    disabled={isSpeaking}
                    className="p-4 bg-teal-50 text-teal-600 rounded-full hover:bg-teal-100 transition-all disabled:opacity-60"
                    title="Écouter"
                  >
                    {isSpeaking
                      ? <Loader2 className="w-6 h-6 animate-spin" />
                      : <Volume2 className="w-6 h-6" />
                    }
                  </button>

                  <button
                    onClick={() => copyToClipboard('single')}
                    className={cn(
                      'p-4 rounded-full transition-all',
                      copied === 'single' ? 'bg-green-50 text-green-500' : 'bg-stone-50 text-stone-400 hover:bg-stone-100'
                    )}
                    title="Copier la traduction"
                  >
                    {copied === 'single' ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                  </button>

                  <button
                    onClick={() => copyToClipboard('both')}
                    className={cn(
                      'p-4 rounded-full transition-all',
                      copied === 'both' ? 'bg-teal-100 text-teal-700' : 'bg-teal-50 text-teal-400 hover:bg-teal-100'
                    )}
                    title="Copier source + traduction"
                  >
                    {copied === 'both' ? <Check className="w-6 h-6" /> : <ArrowRightLeft className="w-6 h-6" />}
                  </button>

                  <button
                    onClick={() => onToggleFavorite(result)}
                    className={cn(
                      'p-4 rounded-full transition-all',
                      isFavorite(result) ? 'bg-amber-50 text-amber-500' : 'bg-stone-50 text-stone-400'
                    )}
                  >
                    <Star className={cn('w-6 h-6', isFavorite(result) && 'fill-current')} />
                  </button>

                  <button
                    onClick={() => shareResult(result)}
                    className="p-4 bg-stone-50 text-stone-400 rounded-full hover:bg-stone-100 transition-all"
                    title="Partager"
                  >
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl flex gap-3 items-start">
                <Info className="w-4 h-4 text-stone-400 mt-1 flex-shrink-0" />
                <p className="text-xs text-stone-500 leading-relaxed">{result.explanation}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ── Section 2 : Comprendre ce que [listenerFr] t'a dit ── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 px-2">
          <MessageSquare className="w-4 h-4 text-stone-400" />
          <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">
            Comprendre {listenerShort}
          </p>
        </div>

        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-stone-100 space-y-4">
          <AnimatePresence>
            {reversePendingImage && (
              <ImagePreview src={reversePendingImage} onRemove={() => setReversePendingImage(null)} />
            )}
          </AnimatePresence>

          <textarea
            value={reverseText}
            onChange={(e) => setReverseText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleReverseTranslate();
            }}
            placeholder={`Colle le texte khmer, ou prends une photo du message reçu...`}
            className="khmer-text w-full h-24 p-0 bg-transparent border-none focus:ring-0 text-xl transition-all placeholder:text-stone-300 resize-none"
          />

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => reverseGalleryInputRef.current?.click()}
                className="p-3 bg-stone-50 text-stone-400 rounded-full hover:bg-teal-50 hover:text-teal-600 transition-all"
                title="Galerie photo"
              >
                <Images className="w-5 h-5" />
              </button>
              <input type="file" ref={reverseGalleryInputRef} onChange={handleReverseImageSelect} accept="image/*" className="hidden" />

              <button
                onClick={() => reverseCameraInputRef.current?.click()}
                className="p-3 bg-stone-50 text-stone-400 rounded-full hover:bg-teal-50 hover:text-teal-600 transition-all"
                title="Prendre une photo"
              >
                <Camera className="w-5 h-5" />
              </button>
              <input type="file" ref={reverseCameraInputRef} onChange={handleReverseImageSelect} accept="image/*" capture="environment" className="hidden" />

              {/* Mic VAD section 2 */}
              <button
                onClick={() => toggleRecording('reverse')}
                disabled={transcribing || (recording && micTarget === 'main')}
                className={cn(
                  'p-3 rounded-full transition-all',
                  recording && micTarget === 'reverse' && !speaking ? 'bg-red-500 text-white' :
                  speaking && micTarget === 'reverse' ? 'bg-green-600 text-white' :
                  'bg-stone-50 text-stone-400 hover:bg-teal-50 hover:text-teal-600'
                )}
                title={vadLoading && micTarget === 'reverse' ? 'Chargement…' : recording && micTarget === 'reverse' ? 'Arrêter' : 'Dicter en khmer'}
              >
                {vadLoading && micTarget === 'reverse'
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : (recording || speaking) && micTarget === 'reverse'
                    ? <span className={cn('wav-bars', speaking && 'wav-active')}><span/><span/><span/><span/><span/></span>
                    : transcribing && micTarget === 'reverse'
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : <Mic className="w-5 h-5" />
                }
              </button>
            </div>

            <button
              onClick={() => handleReverseTranslate()}
              disabled={reverseLoading || (!reverseText.trim() && !reversePendingImage)}
              className="px-5 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-full hover:bg-teal-700 shadow-sm disabled:bg-stone-100 disabled:text-stone-300 transition-all flex items-center gap-2"
            >
              {reverseLoading
                ? <><Sparkles className="w-4 h-4 animate-spin" /> Traduction...</>
                : <><MessageSquare className="w-4 h-4" /> Comprendre</>
              }
            </button>
          </div>
        </div>

        {/* Reverse result */}
        <AnimatePresence>
          {reverseResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[32px] p-6 shadow-md border border-teal-100 space-y-4"
            >
              <p className="serif-text text-2xl text-stone-800 leading-relaxed text-center py-2">
                {reverseResult.translatedText}
              </p>
              {reverseResult.phonetic && (
                <p className="text-xs text-stone-400 italic text-center">{reverseResult.phonetic}</p>
              )}
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => onSpeak(reverseResult.translatedText, 'fr')}
                  disabled={isSpeaking}
                  className="p-3 bg-teal-50 text-teal-600 rounded-full hover:bg-teal-100 transition-all disabled:opacity-60"
                >
                  {isSpeaking
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : <Volume2 className="w-5 h-5" />
                  }
                </button>
              </div>
              {reverseResult.explanation && (
                <div className="p-4 bg-stone-50 rounded-2xl flex gap-3 items-start">
                  <Info className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-stone-500 leading-relaxed">{reverseResult.explanation}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Mot ou expression du jour ── */}
      {wordOfDay && (
        <WordOfDayCard
          word={wordOfDay}
          isSpeaking={isSpeaking}
          isRefreshing={isRefreshingWord}
          onSpeak={() => onSpeak(wordOfDay.kh, 'kh')}
          onRefresh={onRefreshWord}
        />
      )}

      {/* ── Phrases rapides (en bas) ── */}
      <div className="space-y-3">
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-stone-400 px-2">
          Phrases rapides — {relationship.listenerPronounFr}
        </h3>
        <div className="flex flex-wrap gap-2">
          {relationship.quickPhrasesFr.map((phrase, i) => (
            <button
              key={i}
              onClick={() => setInputText(phrase)}
              className="px-4 py-2 bg-white border border-stone-200 rounded-2xl text-sm text-stone-600 hover:border-teal-200 hover:bg-teal-50 transition-all"
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
