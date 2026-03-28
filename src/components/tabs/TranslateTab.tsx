import { useState, useRef, type ChangeEvent } from 'react';
import {
  Send, Copy, Check, Heart, Info, Sparkles, ArrowRightLeft,
  Volume2, Camera, Star, Share2, Laugh, Coffee, MessageSquare,
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
  onSpeak: (text: string, lang: 'kh' | 'fr') => void;
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
  onSpeak,
  onToggleFavorite,
  onAddHistory,
  onError,
}: TranslateTabProps) {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tone, setTone] = useState<Tone>('sweet');
  const [copied, setCopied] = useState<'single' | 'both' | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reverse: understand what the family member said (KH→FR)
  const [reverseText, setReverseText] = useState('');
  const [reverseResult, setReverseResult] = useState<TranslationResult | null>(null);
  const [reverseLoading, setReverseLoading] = useState(false);

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

  const handleReverseTranslate = async () => {
    if (!reverseText.trim()) return;
    setReverseLoading(true);
    try {
      const data = await translate(reverseText, relationship, 'KH_TO_FR', 'daily');
      setReverseResult(data);
      onAddHistory(reverseText, data.translatedText, data.phonetic, data.explanation);
    } catch (e) {
      console.error(e);
      onError('Erreur de traduction. Vérifie ta connexion.');
    } finally {
      setReverseLoading(false);
    }
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
    setPrevRelId(relationship.id);
    setPrevDir(direction);
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
          {/* Tone Selector */}
          <div className="flex gap-2 p-1 bg-stone-50 rounded-2xl">
            {[
              { id: 'sweet', label: 'Doux', icon: Heart, color: 'text-teal-600', bg: 'bg-teal-100' },
              { id: 'funny', label: 'Drôle', icon: Laugh, color: 'text-amber-500', bg: 'bg-amber-100' },
              { id: 'daily', label: 'Quotidien', icon: Coffee, color: 'text-blue-500', bg: 'bg-blue-100' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id as Tone)}
                className={cn(
                  'flex-1 py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all',
                  tone === t.id ? cn(t.bg, t.color) : 'text-stone-400 hover:bg-stone-100'
                )}
              >
                <t.icon className="w-3 h-3" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Emoji toolbar */}
          <div className="flex flex-wrap gap-2 px-1">
            {['❤️', '🙏', '😊', '😘', '🥰', '✨', '🌸', '💐', '🍚', '🌙'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => setInputText((prev) => prev + emoji)}
                className="text-xl hover:scale-125 transition-transform active:scale-95 p-1"
              >
                {emoji}
              </button>
            ))}
          </div>

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
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-stone-50 text-stone-400 rounded-full hover:bg-teal-50 hover:text-teal-600 transition-all"
                  title="Ajouter une image"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
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
                    className="p-4 bg-teal-50 text-teal-600 rounded-full hover:bg-teal-100 transition-all"
                    title="Écouter"
                  >
                    <Volume2 className={cn('w-6 h-6', isSpeaking && 'animate-pulse')} />
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
          <textarea
            value={reverseText}
            onChange={(e) => setReverseText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleReverseTranslate();
            }}
            placeholder={`Colle ici ce que ${relationship.listenerPronounFr} t'a écrit en khmer...`}
            className="khmer-text w-full h-24 p-0 bg-transparent border-none focus:ring-0 text-xl transition-all placeholder:text-stone-300 resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={handleReverseTranslate}
              disabled={reverseLoading || !reverseText.trim()}
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
                  className="p-3 bg-teal-50 text-teal-600 rounded-full hover:bg-teal-100 transition-all"
                >
                  <Volume2 className={cn('w-5 h-5', isSpeaking && 'animate-pulse')} />
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
          onSpeak={() => onSpeak(wordOfDay.kh, 'kh')}
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
