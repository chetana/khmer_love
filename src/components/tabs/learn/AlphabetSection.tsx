import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Check, RefreshCw, Trophy, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { CONSONANTS, VOWELS } from '../../../data/alphabet';
import type { AlphabetChar } from '../../../data/alphabet';
import { speak, ensureAudioUnlocked } from '../../../lib/gemini';
import { cn } from '../../../lib/utils';

type Group = 'consonants' | 'vowels';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function loadLearned(key: string): Set<string> {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return new Set(JSON.parse(saved) as string[]);
  } catch {}
  return new Set();
}

function saveLearned(key: string, learned: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...learned]));
  } catch {}
}

function loadGroup(): Group {
  try {
    const g = localStorage.getItem('khmer_alpha_group') as Group | null;
    if (g === 'consonants' || g === 'vowels') return g;
  } catch {}
  return 'consonants';
}

const STORAGE_KEYS: Record<Group, string> = {
  consonants: 'khmer_alpha_learned',
  vowels: 'khmer_vowels_learned',
};

const DATA: Record<Group, AlphabetChar[]> = {
  consonants: CONSONANTS,
  vowels: VOWELS,
};

// No props needed — manages its own audio state to avoid App's generic error toast
export function AlphabetSection() {
  const [group, setGroup] = useState<Group>(loadGroup);

  const storageKey = STORAGE_KEYS[group];
  const data = DATA[group];

  const [learned, setLearned] = useState<Set<string>>(() => loadLearned(storageKey));
  const [deck, setDeck] = useState<AlphabetChar[]>(() => {
    const l = loadLearned(storageKey);
    return shuffle(data.filter((c) => !l.has(c.char)));
  });
  const [flipped, setFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const current = deck[0] ?? null;
  const learnedCount = learned.size;
  const total = data.length;

  const switchGroup = (g: Group) => {
    if (g === group) return;
    setGroup(g);
    try { localStorage.setItem('khmer_alpha_group', g); } catch {}
    const key = STORAGE_KEYS[g];
    const d = DATA[g];
    const l = loadLearned(key);
    setLearned(l);
    setDeck(shuffle(d.filter((c) => !l.has(c.char))));
    setFlipped(false);
    setAudioError(false);
  };

  const handleCardSpeak = async () => {
    if (!current || isPlaying) return;
    ensureAudioUnlocked();
    const text = current.example?.kh ?? current.char;
    setAudioError(false);
    setIsPlaying(true);
    try {
      await speak(text, 'kh');
    } catch {
      setAudioError(true);
    } finally {
      setIsPlaying(false);
    }
  };

  const markLearned = () => {
    if (!current) return;
    const next = new Set(learned);
    next.add(current.char);
    setLearned(next);
    saveLearned(storageKey, next);
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
    saveLearned(storageKey, empty);
    setDeck(shuffle(DATA[group]));
    setFlipped(false);
    setAudioError(false);
  };

  return (
    <div className="space-y-4">
      {/* Group picker */}
      <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
        {(['consonants', 'vowels'] as Group[]).map((g) => (
          <button
            key={g}
            onClick={() => switchGroup(g)}
            className={cn(
              'flex-1 py-2 text-xs font-bold rounded-lg transition-all',
              group === g
                ? 'bg-white text-teal-600 shadow-sm'
                : 'text-stone-400 hover:text-stone-600'
            )}
          >
            {g === 'consonants' ? `Consonnes (${CONSONANTS.length})` : `Voyelles (${VOWELS.length})`}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-stone-500">
          {learnedCount} / {total} {group === 'consonants' ? 'consonnes' : 'voyelles'} apprises
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
          className="h-full bg-teal-400 rounded-full transition-all duration-500"
          style={{ width: `${(learnedCount / total) * 100}%` }}
        />
      </div>

      {/* All learned */}
      {deck.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-stone-100 shadow-sm p-10 text-center space-y-5"
        >
          <Trophy className="w-14 h-14 mx-auto text-amber-400" />
          <div>
            <p className="text-2xl font-bold text-stone-800">Bravo ! 🎉</p>
            <p className="text-stone-500 mt-1 text-sm">
              Tu connais les {total} {group === 'consonants' ? 'consonnes' : 'voyelles'} khmères !
            </p>
          </div>
          <button
            onClick={reset}
            className="px-6 py-3 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition-colors flex items-center gap-2 mx-auto"
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
                  className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 min-h-[200px]"
                >
                  <p className="khmer-text text-8xl text-stone-800 leading-none">{current.char}</p>
                  <p className="text-xs text-stone-400">Appuie pour voir la prononciation</p>
                </motion.div>
              ) : (
                <motion.div
                  key="back"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 min-h-[200px]"
                >
                  <p className="khmer-text text-6xl text-teal-700 leading-none">{current.char}</p>
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-bold text-stone-800 font-mono">/{current.phon}/</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCardSpeak(); }}
                      disabled={isPlaying}
                      title={audioError ? 'Audio non disponible pour ce mot' : 'Écouter'}
                      className={`p-2 bg-white/70 rounded-full hover:bg-white transition-all disabled:opacity-50 ${audioError ? 'text-stone-400' : 'text-teal-600'}`}
                    >
                      {isPlaying ? <Loader2 className="w-4 h-4 animate-spin" /> : audioError ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>
                  {current.note && (
                    <p className="text-[10px] text-teal-600 bg-teal-50 rounded-lg px-2 py-0.5 italic">
                      {current.note}
                    </p>
                  )}
                  {current.example && (
                    <div className="bg-white/70 rounded-2xl px-5 py-3 w-full text-center space-y-1 mt-1">
                      <p className="khmer-text text-xl text-stone-700">{current.example.kh}</p>
                      <p className="text-xs text-stone-400 italic">{current.example.phon}</p>
                      <p className="text-sm font-semibold text-stone-600">{current.example.fr}</p>
                    </div>
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
              className="py-4 rounded-2xl bg-teal-600 text-white font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Appris !
            </button>
          </div>
        </>
      )}
    </div>
  );
}
