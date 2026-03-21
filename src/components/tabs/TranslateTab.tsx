import { useState, useRef, type ChangeEvent } from 'react';
import {
  Send, Copy, Check, Heart, Info, Sparkles, ArrowRightLeft,
  Volume2, Camera, Star, Share2, Laugh, Coffee,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { TranslationResult, Mode, Tone } from '../../types';
import { translate } from '../../lib/gemini';
import { cn } from '../../lib/utils';
import { ImagePreview } from '../ImagePreview';

interface TranslateTabProps {
  mode: Mode;
  wordOfDay: { fr: string; kh: string; phon: string } | null;
  isSpeaking: boolean;
  isFavorite: (res: TranslationResult) => boolean;
  onSpeak: (text: string, lang: 'kh' | 'fr') => void;
  onToggleFavorite: (res: TranslationResult) => void;
  onAddHistory: (source: string, target: string, phonetic: string | undefined, mode: Mode) => void;
  onError: (msg: string) => void;
}

const QUICK_PHRASES_BONG = [
  { text: 'Tu me manques', phon: 'បងនឹកអូន' },
  { text: "Je t'aime", phon: 'បងស្រឡាញ់អូន' },
  { text: 'Tu as mangé ?', phon: 'ញ៉ាំបាយនៅ?' },
  { text: 'Bonne nuit', phon: 'រាត្រីសួស្ដី' },
  { text: 'Bonjour', phon: 'អរុណសួស្ដី' },
  { text: 'Prends soin de toi', phon: 'ថែរក្សាខ្លួនផង' },
  { text: 'Je suis fier de toi', phon: 'បងមានមោទនភាព' },
  { text: 'Tu es magnifique', phon: 'អូនស្អាតណាស់' },
  { text: 'À bientôt', phon: 'ជួបគ្នាឆាប់ៗ' },
  { text: 'Fais de beaux rêves', phon: 'យល់សប្ដិល្អ' },
];

const QUICK_PHRASES_OUN = [
  { text: 'អូននឹកបង', phon: 'Oun nirk Bong' },
  { text: 'អូនស្រឡាញ់បង', phon: 'Oun srolanh Bong' },
  { text: 'ញ៉ាំបាយនៅ?', phon: 'Nham bay nov?' },
  { text: 'រាត្រីសួស្ដី', phon: 'Reatrey soursdey' },
  { text: 'អរុណសួស្ដី', phon: 'Arun soursdey' },
  { text: 'ថែរក្សាខ្លួនផង', phon: 'Thae raksa kloun' },
  { text: 'អូនមានមោទនភាព', phon: 'Oun mean motonakpheap' },
  { text: 'បងសង្ហាណាស់', phon: 'Bong sangha nas' },
  { text: 'ជួបគ្នាឆាប់ៗ', phon: 'Choub knia chab chab' },
  { text: 'យល់សប្ដិល្អ', phon: "Yol sopti l'or" },
];

export function TranslateTab({
  mode,
  isSpeaking,
  isFavorite,
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

  const handleTranslate = async (textOverride?: string) => {
    const text = textOverride ?? inputText;
    if (!text.trim() && !pendingImage) return;
    setIsLoading(true);
    try {
      const data = await translate(text, mode, tone, pendingImage ?? undefined);
      setResult(data);
      setPendingImage(null);
      onAddHistory(text || 'Image', data.translatedText, data.phonetic, mode);
    } catch (e) {
      console.error(e);
      onError('Erreur de traduction. Vérifie ta connexion.');
    } finally {
      setIsLoading(false);
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
    const isBong = mode === 'BONG_TO_OUN';
    const frFlag = '🇫🇷 ';
    const khFlag = '🇰🇭 ';
    const text =
      type === 'single'
        ? (isBong ? khFlag : frFlag) + result.translatedText
        : `${(isBong ? frFlag : khFlag) + result.originalText}\n---\n${(isBong ? khFlag : frFlag) + result.translatedText}`;

    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const shareResult = async (res: TranslationResult) => {
    const isBong = mode === 'BONG_TO_OUN';
    const text = `${(isBong ? '🇫🇷 ' : '🇰🇭 ') + res.originalText}\n---\n${(isBong ? '🇰🇭 ' : '🇫🇷 ') + res.translatedText}`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch { /* dismissed */ }
    } else {
      copyToClipboard('both');
    }
  };

  const phrases = mode === 'BONG_TO_OUN' ? QUICK_PHRASES_BONG : QUICK_PHRASES_OUN;

  return (
    <motion.div
      key="translate"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Input Card */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-stone-100 space-y-4">
        {/* Tone Selector */}
        <div className="flex gap-2 p-1 bg-stone-50 rounded-2xl">
          {[
            { id: 'sweet', label: 'Doux', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-100' },
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
          {['❤️', '💖', '🥰', '😘', '😍', '🌹', '✨', '🙏', '😊', '🌙'].map((emoji) => (
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
            placeholder={mode === 'BONG_TO_OUN' ? 'Écris ton message...' : 'សរសេរសាររបស់អ្នក...'}
            className={cn(
              'w-full h-32 p-0 bg-transparent border-none focus:ring-0 text-xl transition-all placeholder:text-stone-300 resize-none',
              mode === 'OUN_TO_BONG' && 'khmer-text'
            )}
          />
          <div className="flex justify-between items-center mt-2">
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-stone-50 text-stone-400 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-all"
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
            className="bg-white rounded-[32px] p-6 shadow-md border border-rose-100 space-y-6"
          >
            <div className="space-y-4">
              <div className="flex-1 text-center py-4">
                <p
                  className={cn(
                    'text-stone-800 leading-relaxed',
                    mode === 'BONG_TO_OUN' ? 'khmer-text text-4xl' : 'serif-text text-2xl'
                  )}
                >
                  {result.translatedText}
                </p>
                {result.phonetic && (
                  <p className="text-sm text-stone-400 italic mt-2">{result.phonetic}</p>
                )}
              </div>

              <div className="flex justify-center gap-3 flex-wrap">
                <button
                  onClick={() => onSpeak(result.translatedText, mode === 'BONG_TO_OUN' ? 'kh' : 'fr')}
                  className="p-4 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-100 transition-all"
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
                    copied === 'both' ? 'bg-rose-100 text-rose-600' : 'bg-rose-50 text-rose-400 hover:bg-rose-100'
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

      {/* Quick Phrases */}
      <div className="space-y-3">
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-stone-400 px-2">
          Phrases rapides
        </h3>
        <div className="flex flex-wrap gap-2">
          {phrases.map((p, i) => (
            <button
              key={i}
              onClick={() => setInputText(p.text)}
              className="px-4 py-2 bg-white border border-stone-200 rounded-2xl text-stone-600 hover:border-rose-200 transition-all flex flex-col items-center min-w-[100px]"
            >
              <span className={cn('text-sm', mode === 'OUN_TO_BONG' && 'khmer-text text-lg')}>
                {p.text}
              </span>
              {p.phon && (
                <span
                  className={cn(
                    'text-[9px] text-stone-400 leading-tight',
                    mode === 'BONG_TO_OUN' ? 'khmer-text' : 'italic'
                  )}
                >
                  {p.phon}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
