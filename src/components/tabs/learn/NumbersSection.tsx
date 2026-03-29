import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Check, RefreshCw, Trophy, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { NUMBERS } from '../../../data/numbers';
import type { KhmerNumber } from '../../../data/numbers';
import { speak, ensureAudioUnlocked } from '../../../lib/gemini';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function loadLearned(): Set<string> {
  try {
    const saved = localStorage.getItem('khmer_numbers_learned');
    if (saved) return new Set(JSON.parse(saved) as string[]);
  } catch {}
  return new Set();
}

function saveLearned(learned: Set<string>) {
  try {
    localStorage.setItem('khmer_numbers_learned', JSON.stringify([...learned]));
  } catch {}
}

// No props needed — manages its own audio state to avoid App's generic error toast
export function NumbersSection() {
  const [learned, setLearned] = useState<Set<string>>(loadLearned);
  const [deck, setDeck] = useState<KhmerNumber[]>(() => {
    const l = loadLearned();
    return shuffle(NUMBERS.filter((n) => !l.has(n.digit)));
  });
  const [flipped, setFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const current = deck[0] ?? null;
  const learnedCount = learned.size;
  const total = NUMBERS.length;

  // Speak the Khmer WORD (e.g. "មួយ") not the glyph ("១") — much more reliable for TTS
  const handleCardSpeak = async () => {
    if (!current || isPlaying) return;
    ensureAudioUnlocked();
    setAudioError(false);
    setIsPlaying(true);
    try {
      await speak(current.word, 'kh');
    } catch {
      setAudioError(true);
    } finally {
      setIsPlaying(false);
    }
  };

  const markLearned = () => {
    if (!current) return;
    const next = new Set(learned);
    next.add(current.digit);
    setLearned(next);
    saveLearned(next);
    setDeck((d) => d.slice(1));
    setFlipped(false);
    setAudioError(false);
  };

  const markReview = () => {
    setDeck((d) => [...d.slice(1), d[0]]);
    setFlipped(false);
    setAudioError(false);
  };

  const reset = () => {
    const empty = new Set<string>();
    setLearned(empty);
    saveLearned(empty);
    setDeck(shuffle(NUMBERS));
    setFlipped(false);
  };

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-stone-500">
          {learnedCount} / {total} chiffres appris
        </span>
        {learnedCount > 0 && (
          <button
            onClick={reset}
            className="text-xs text-stone-300 hover:text-stone-500 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Recommencer
          </button>
        )}
      </div>
      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${(learnedCount / total) * 100}%` }}
        />
      </div>

      {/* Hint banner for 6-9 */}
      {current && !flipped && current.hint && (
        <p className="text-center text-xs text-amber-600 bg-amber-50 rounded-xl py-1.5 px-3">
          💡 Indice : {current.hint}
        </p>
      )}

      {/* All learned */}
      {deck.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-stone-100 shadow-sm p-10 text-center space-y-5"
        >
          <Trophy className="w-14 h-14 mx-auto text-amber-400" />
          <div>
            <p className="text-2xl font-bold text-stone-800">Parfait ! 🔢</p>
            <p className="text-stone-500 mt-1 text-sm">
              Tu connais les {total} chiffres khmers !
            </p>
          </div>
          <button
            onClick={reset}
            className="px-6 py-3 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <RotateCcw className="w-4 h-4" /> Recommencer
          </button>
        </motion.div>
      ) : (
        <>
          {/* Flashcard */}
          <div
            className="cursor-pointer select-none"
            onClick={() => setFlipped((f) => !f)}
          >
            <AnimatePresence mode="wait">
              {!flipped ? (
                <motion.div
                  key="front"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 min-h-[200px]"
                >
                  <p className="khmer-text text-8xl text-stone-800 leading-none">{current.digit}</p>
                  <p className="text-xs text-stone-400">Appuie pour voir la valeur</p>
                </motion.div>
              ) : (
                <motion.div
                  key="back"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 min-h-[200px]"
                >
                  <p className="khmer-text text-5xl text-amber-700 leading-none">{current.digit}</p>
                  <p className="text-5xl font-bold text-stone-800">{current.value}</p>
                  <div className="flex items-center gap-3">
                    <p className="text-xl font-mono text-stone-500 italic">{current.phon}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCardSpeak(); }}
                      disabled={isPlaying}
                      title={audioError ? 'Audio non disponible pour ce mot' : 'Écouter'}
                      className={`p-2 bg-white/70 rounded-full hover:bg-white transition-all disabled:opacity-50 ${audioError ? 'text-stone-400' : 'text-amber-600'}`}
                    >
                      {isPlaying ? <Loader2 className="w-4 h-4 animate-spin" /> : audioError ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>
                  {current.hint && (
                    <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-1">
                      {current.hint}
                    </p>
                  )}
                  {current.note && (
                    <p className="text-xs text-stone-500 bg-white/70 rounded-xl px-3 py-2 text-center leading-relaxed max-w-[280px]">
                      💡 {current.note}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Remaining count */}
          <p className="text-center text-xs text-stone-300">
            {deck.length} carte{deck.length > 1 ? 's' : ''} restante{deck.length > 1 ? 's' : ''}
          </p>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={markReview}
              className="py-4 rounded-2xl border-2 border-stone-200 text-stone-500 font-bold hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> À revoir
            </button>
            <button
              onClick={markLearned}
              className="py-4 rounded-2xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Appris !
            </button>
          </div>
        </>
      )}
    </div>
  );
}
