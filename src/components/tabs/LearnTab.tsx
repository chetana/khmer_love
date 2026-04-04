import { useState } from 'react';
import { Play, Loader2, RotateCcw, ChevronRight, Check, X, Sparkles, Trophy, List, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { WordOfDay } from '../../types';
import { generateFamilyVocab } from '../../lib/gemini';
import { cn } from '../../lib/utils';
import { AlphabetSection } from './learn/AlphabetSection';
import { AlphabetReference } from './learn/AlphabetReference';
import { NumbersSection } from './learn/NumbersSection';
import { NumbersReference } from './learn/NumbersReference';

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
type Difficulty = 'easy' | 'daily' | 'hard';
type ViewMode = 'learn' | 'reference';

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; emoji: string; count: number; prompt: string }> = {
  easy: {
    label: 'Facile', emoji: '🌱', count: 5,
    prompt: 'Génère exactement 8 expressions SIMPLES et courtes pour parler avec sa famille cambodgienne. Mots simples du quotidien (bonjour, merci, manger, dormir, bien, oui, non). Réponds en JSON: [{"fr":"...","kh":"...","phon":"..."}]',
  },
  daily: {
    label: 'Quotidien', emoji: '☀️', count: 10,
    prompt: 'Génère exactement 15 expressions utiles pour parler avec sa famille cambodgienne. Inclus : formules d\'affection, questions du quotidien (manger, dormir, santé), expressions de respect. Réponds en JSON: [{"fr":"...","kh":"...","phon":"..."}]',
  },
  hard: {
    label: 'Difficile', emoji: '🔥', count: 15,
    prompt: 'Génère exactement 20 expressions AVANCÉES pour parler avec sa famille cambodgienne. Inclus : proverbes, expressions idiomatiques, formules de politesse complexes, vocabulaire culturel (Pchum Ben, mariage, temple). Réponds en JSON: [{"fr":"...","kh":"...","phon":"..."}]',
  },
};

function loadSection(): Section {
  try {
    const s = localStorage.getItem('khmer_learn_section') as Section | null;
    if (s === 'vocab' || s === 'alpha' || s === 'numbers') return s;
  } catch {}
  return 'vocab';
}

export function LearnTab({ wordOfDay, isSpeaking, onSpeak }: LearnTabProps) {
  const [section, setSection] = useState<Section>(loadSection);
  const [viewMode, setViewMode] = useState<ViewMode>('learn');
  const [difficulty, setDifficulty] = useState<Difficulty>('daily');
  const [quizState, setQuizState] = useState<QuizState>('idle');
  const [cards, setCards] = useState<VocabCard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<VocabCard | null>(null);
  const [choices, setChoices] = useState<VocabCard[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSectionChange = (s: Section) => {
    setSection(s);
    setViewMode('learn');
    try { localStorage.setItem('khmer_learn_section', s); } catch {}
  };

  const config = DIFFICULTY_CONFIG[difficulty];

  const startQuiz = async () => {
    setQuizState('loading');
    setError(null);
    try {
      const vocab = await generateFamilyVocab(config.prompt);
      if (!vocab || vocab.length < 4) {
        setError('Impossible de générer le quiz. Vérifie ta connexion.');
        setQuizState('idle');
        return;
      }
      const shuffled = shuffle(vocab).slice(0, Math.min(config.count, vocab.length));
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
            {s === 'vocab' ? '📖 Vocab' : s === 'alpha' ? '🔤 Alphabet' : '🔢 Chiffres'}
          </button>
        ))}
      </div>

      {/* View mode toggle for alphabet & numbers */}
      {(section === 'alpha' || section === 'numbers') && (
        <div className="flex gap-1 bg-stone-50 rounded-xl p-1">
          <button
            onClick={() => setViewMode('learn')}
            className={cn('flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5',
              viewMode === 'learn' ? 'bg-white text-teal-600 shadow-sm' : 'text-stone-400'
            )}
          >
            <Layers className="w-3.5 h-3.5" /> Flashcards
          </button>
          <button
            onClick={() => setViewMode('reference')}
            className={cn('flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5',
              viewMode === 'reference' ? 'bg-white text-teal-600 shadow-sm' : 'text-stone-400'
            )}
          >
            <List className="w-3.5 h-3.5" /> Référence
          </button>
        </div>
      )}

      {/* Alphabet */}
      {section === 'alpha' && (viewMode === 'learn' ? <AlphabetSection /> : <AlphabetReference />)}

      {/* Numbers */}
      {section === 'numbers' && (viewMode === 'learn' ? <NumbersSection /> : <NumbersReference />)}

      {/* Quiz Section — vocab only */}
      {section === 'vocab' && (
        <div className="space-y-4">
          {/* Difficulty selector */}
          {(quizState === 'idle' || quizState === 'complete') && (
            <div className="flex gap-2">
              {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, typeof config][]).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setDifficulty(key)}
                  className={cn(
                    'flex-1 py-3 rounded-2xl border-2 text-center transition-all',
                    difficulty === key
                      ? 'border-teal-400 bg-teal-50 text-teal-700'
                      : 'border-stone-100 bg-white text-stone-400 hover:border-stone-200'
                  )}
                >
                  <span className="text-lg block">{cfg.emoji}</span>
                  <span className="text-xs font-bold block mt-1">{cfg.label}</span>
                  <span className="text-[10px] text-stone-400 block">{cfg.count} cartes</span>
                </button>
              ))}
            </div>
          )}

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
                  {config.emoji} {config.count} expressions de la famille khmère.
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
                <p className="text-stone-400 text-sm">Je prépare ton quiz {config.emoji}...</p>
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

      {/* Word of the Day — en bas de la section vocab */}
      {section === 'vocab' && wordOfDay && (
        <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-[32px] p-6 text-white shadow-lg relative overflow-hidden">
          <Sparkles className="absolute -top-4 -right-4 w-24 h-24 opacity-10" />
          <span className="text-[10px] uppercase font-bold tracking-widest opacity-70">
            Expression du jour
          </span>
          <div className="mt-3 space-y-1">
            <h3 className="text-2xl font-bold serif-text">{wordOfDay.fr}</h3>
            <p className="khmer-text text-3xl mt-2">{wordOfDay.kh}</p>
            <p className="text-sm opacity-80 italic">{wordOfDay.phon}</p>
          </div>
          <button
            onClick={() => onSpeak(wordOfDay.kh, 'kh')}
            disabled={isSpeaking}
            className="mt-4 p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all disabled:opacity-60"
          >
            {isSpeaking
              ? <Loader2 className="w-5 h-5 animate-spin" />
              : <Play className="w-5 h-5 fill-current" />
            }
          </button>
        </div>
      )}
    </motion.div>
  );
}
