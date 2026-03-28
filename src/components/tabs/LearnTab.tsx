import { useState } from 'react';
import { Play, Loader2, RotateCcw, ChevronRight, Check, X, Sparkles, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { WordOfDay } from '../../types';
import { generateFamilyVocab } from '../../lib/gemini';
import { cn } from '../../lib/utils';
import { AlphabetSection } from './learn/AlphabetSection';
import { NumbersSection } from './learn/NumbersSection';

interface LearnTabProps {
  wordOfDay: WordOfDay | null;
  isSpeaking: boolean;
  onSpeak: (text: string, lang: 'kh' | 'fr') => void;
}

interface VocabCard {
  fr: string;
  kh: string;
  phon: string;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildChoices(correct: VocabCard, all: VocabCard[]): VocabCard[] {
  const wrong = shuffle(all.filter((c) => c.fr !== correct.fr)).slice(0, 3);
  return shuffle([correct, ...wrong]);
}

type QuizState = 'idle' | 'loading' | 'playing' | 'answered' | 'complete';
type Section = 'vocab' | 'alpha' | 'numbers';

function loadSection(): Section {
  try {
    const s = localStorage.getItem('khmer_learn_section') as Section | null;
    if (s === 'vocab' || s === 'alpha' || s === 'numbers') return s;
  } catch {}
  return 'vocab';
}

export function LearnTab({ wordOfDay, isSpeaking, onSpeak }: LearnTabProps) {
  const [section, setSection] = useState<Section>(loadSection);
  const [quizState, setQuizState] = useState<QuizState>('idle');
  const [cards, setCards] = useState<VocabCard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<VocabCard | null>(null);
  const [choices, setChoices] = useState<VocabCard[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSectionChange = (s: Section) => {
    setSection(s);
    try { localStorage.setItem('khmer_learn_section', s); } catch {}
  };

  const startQuiz = async () => {
    setQuizState('loading');
    setError(null);
    try {
      const vocab = await generateFamilyVocab();
      if (!vocab || vocab.length < 4) {
        setError('Impossible de générer le quiz. Vérifie ta connexion.');
        setQuizState('idle');
        return;
      }
      const shuffled = shuffle(vocab).slice(0, Math.min(10, vocab.length));
      setCards(shuffled);
      setCurrentIdx(0);
      setScore(0);
      setSelected(null);
      setChoices(buildChoices(shuffled[0], vocab));
      setQuizState('playing');
    } catch {
      setError('Erreur lors de la génération du quiz.');
      setQuizState('idle');
    }
  };

  const handleAnswer = (choice: VocabCard) => {
    if (quizState !== 'playing') return;
    setSelected(choice);
    if (choice.fr === cards[currentIdx].fr) setScore((s) => s + 1);
    setQuizState('answered');
  };

  const nextCard = () => {
    const next = currentIdx + 1;
    if (next >= cards.length) {
      setQuizState('complete');
    } else {
      setCurrentIdx(next);
      setSelected(null);
      setChoices(buildChoices(cards[next], cards));
      setQuizState('playing');
    }
  };

  const current = cards[currentIdx];

  return (
    <motion.div
      key="learn"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <h2 className="serif-text text-2xl font-bold px-2">Apprendre</h2>

      {/* Section picker */}
      <div className="flex gap-1 bg-stone-100 rounded-2xl p-1">
        {(['vocab', 'alpha', 'numbers'] as Section[]).map((s) => (
          <button
            key={s}
            onClick={() => handleSectionChange(s)}
            className={cn(
              'flex-1 py-2.5 text-xs font-bold rounded-xl transition-all',
              section === s
                ? 'bg-white text-teal-600 shadow-sm'
                : 'text-stone-400 hover:text-stone-600'
            )}
          >
            {s === 'vocab' ? '📖 Vocabulaire' : s === 'alpha' ? '🔤 Alphabet' : '🔢 Chiffres'}
          </button>
        ))}
      </div>

      {/* Word of the Day — only on vocab section */}
      {section === 'vocab' && wordOfDay && (
        <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-[32px] p-8 text-white shadow-xl shadow-teal-200 relative overflow-hidden">
          <Sparkles className="absolute -top-4 -right-4 w-24 h-24 opacity-10" />
          <span className="text-[10px] uppercase font-bold tracking-widest opacity-70">
            Expression du jour
          </span>
          <div className="mt-4 space-y-2">
            <h3 className="text-3xl font-bold serif-text">{wordOfDay.fr}</h3>
            <p className="khmer-text text-4xl mt-4">{wordOfDay.kh}</p>
            <p className="text-sm opacity-80 italic">{wordOfDay.phon}</p>
          </div>
          <button
            onClick={() => onSpeak(wordOfDay.kh, 'kh')}
            disabled={isSpeaking}
            className="mt-6 p-4 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all disabled:opacity-60"
          >
            {isSpeaking
              ? <Loader2 className="w-6 h-6 animate-spin" />
              : <Play className="w-6 h-6 fill-current" />
            }
          </button>
        </div>
      )}

      {/* Alphabet section */}
      {section === 'alpha' && <AlphabetSection isSpeaking={isSpeaking} onSpeak={onSpeak} />}

      {/* Numbers section */}
      {section === 'numbers' && <NumbersSection isSpeaking={isSpeaking} onSpeak={onSpeak} />}

      {/* Quiz Section — only on vocab */}
      {section === 'vocab' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-stone-400">
              Quiz vocabulaire
            </h3>
            {(quizState === 'playing' || quizState === 'answered') && (
              <span className="text-xs text-stone-400">
                {currentIdx + 1} / {cards.length}
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {/* Idle */}
            {quizState === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 text-center space-y-4"
              >
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <p className="text-stone-500 text-sm">
                  Je génère 10 expressions de la famille khmère.
                  <br />
                  Tu vois le mot en khmer, trouve la bonne traduction !
                </p>
                <button
                  onClick={startQuiz}
                  className="px-8 py-3 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition-colors"
                >
                  Commencer le quiz
                </button>
              </motion.div>
            )}

            {/* Loading */}
            {quizState === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-3xl border border-stone-100 shadow-sm p-12 text-center space-y-4"
              >
                <Sparkles className="w-10 h-10 mx-auto text-teal-400 animate-spin" />
                <p className="text-stone-400 text-sm">Je prépare ton quiz...</p>
              </motion.div>
            )}

            {/* Playing / Answered */}
            {(quizState === 'playing' || quizState === 'answered') && current && (
              <motion.div
                key={`card-${currentIdx}`}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="space-y-4"
              >
                <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-400 rounded-full transition-all duration-300"
                    style={{ width: `${((currentIdx + 1) / cards.length) * 100}%` }}
                  />
                </div>

                <div className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-3xl p-8 text-center space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                    Comment dit-on en français ?
                  </p>
                  <p className="khmer-text text-5xl text-stone-800">{current.kh}</p>
                  {quizState === 'answered' && (
                    <p className="text-xs text-stone-400 italic">{current.phon}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {choices.map((choice, i) => {
                    const isCorrect = choice.fr === current.fr;
                    const isSelected = selected?.fr === choice.fr;
                    let style = 'bg-white border-stone-200 text-stone-700 hover:border-teal-300';
                    if (quizState === 'answered') {
                      if (isCorrect) style = 'bg-emerald-50 border-emerald-300 text-emerald-700';
                      else if (isSelected) style = 'bg-red-50 border-red-300 text-red-600';
                      else style = 'bg-white border-stone-100 text-stone-400';
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(choice)}
                        disabled={quizState === 'answered'}
                        className={cn(
                          'p-4 rounded-2xl border-2 text-left font-medium transition-all flex items-center justify-between',
                          style
                        )}
                      >
                        <span>{choice.fr}</span>
                        {quizState === 'answered' && isCorrect && (
                          <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        )}
                        {quizState === 'answered' && isSelected && !isCorrect && (
                          <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {quizState === 'answered' && (
                  <button
                    onClick={nextCard}
                    className="w-full py-3 bg-stone-800 text-white rounded-2xl font-bold hover:bg-stone-900 transition-colors flex items-center justify-center gap-2"
                  >
                    {currentIdx + 1 >= cards.length ? 'Voir le résultat' : 'Suivant'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            )}

            {/* Complete */}
            {quizState === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 text-center space-y-6"
              >
                <Trophy className="w-16 h-16 mx-auto text-amber-400" />
                <div>
                  <p className="text-4xl font-bold text-stone-800">
                    {score} / {cards.length}
                  </p>
                  <p className="text-stone-500 mt-2">
                    {score === cards.length
                      ? 'Parfait ! Tu maîtrises le vocabulaire 🌟'
                      : score >= cards.length * 0.7
                      ? 'Très bien ! Continue comme ça ✨'
                      : 'Continue à pratiquer ! 💪'}
                  </p>
                </div>
                <button
                  onClick={startQuiz}
                  className="px-8 py-3 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <RotateCcw className="w-4 h-4" /> Nouveau quiz
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
