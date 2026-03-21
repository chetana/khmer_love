import { useState } from 'react';
import { Play, RotateCcw, ChevronRight, Check, X, Sparkles, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { WordOfDay } from '../../types';
import { cn } from '../../lib/utils';

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

const VOCAB: VocabCard[] = [
  { fr: "Je t'aime", kh: 'ខ្ញុំស្រឡាញ់អ្នក', phon: 'khnhom srolanh anak' },
  { fr: 'Tu me manques', kh: 'ខ្ញុំនឹកអ្នក', phon: 'khnhom nirk anak' },
  { fr: 'Bonjour', kh: 'អរុណសួស្ដី', phon: 'arun soursdey' },
  { fr: 'Bonne nuit', kh: 'រាត្រីសួស្ដី', phon: 'reatrey soursdey' },
  { fr: 'Merci', kh: 'អរគុណ', phon: 'orkoun' },
  { fr: 'Tu es belle', kh: 'អ្នកស្អាត', phon: "anak s'at" },
  { fr: 'Prends soin de toi', kh: 'ថែខ្លួនផង', phon: 'thae kloun phong' },
  { fr: 'Je pense à toi', kh: 'ខ្ញុំគិតដល់អ្នក', phon: 'khnhom kit dol anak' },
  { fr: 'Mon amour', kh: 'ស្នេហ៍ខ្ញុំ', phon: 'sneh khnhom' },
  { fr: 'Je suis heureux', kh: 'ខ្ញុំសប្បាយចិត្ត', phon: 'khnhom sabbay chet' },
  { fr: 'Tu as mangé ?', kh: 'ញ៉ាំបាយហើយ?', phon: 'nham bay haoy?' },
  { fr: 'Rêves doux', kh: 'យល់សប្ដិល្អ', phon: "yol sopti l'or" },
  { fr: 'À bientôt', kh: 'ជួបគ្នាឆាប់ៗ', phon: 'choub knia chab chab' },
  { fr: 'Mon cœur', kh: 'បេះដូងខ្ញុំ', phon: 'beh doung khnhom' },
  { fr: "Je t'attends", kh: 'ខ្ញុំរង់ចាំអ្នក', phon: 'khnhom rong cham anak' },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildChoices(correct: VocabCard, all: VocabCard[]): VocabCard[] {
  const wrong = shuffle(all.filter((c) => c.fr !== correct.fr)).slice(0, 3);
  return shuffle([correct, ...wrong]);
}

type QuizState = 'idle' | 'playing' | 'answered' | 'complete';

export function LearnTab({ wordOfDay, isSpeaking, onSpeak }: LearnTabProps) {
  const [quizState, setQuizState] = useState<QuizState>('idle');
  const [cards, setCards] = useState<VocabCard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<VocabCard | null>(null);
  const [choices, setChoices] = useState<VocabCard[]>([]);

  const startQuiz = () => {
    const shuffled = shuffle(VOCAB).slice(0, 10);
    setCards(shuffled);
    setCurrentIdx(0);
    setScore(0);
    setSelected(null);
    setChoices(buildChoices(shuffled[0], VOCAB));
    setQuizState('playing');
  };

  const handleAnswer = (choice: VocabCard) => {
    if (quizState !== 'playing') return;
    setSelected(choice);
    if (choice.fr === cards[currentIdx].fr) {
      setScore((s) => s + 1);
    }
    setQuizState('answered');
  };

  const nextCard = () => {
    const next = currentIdx + 1;
    if (next >= cards.length) {
      setQuizState('complete');
    } else {
      setCurrentIdx(next);
      setSelected(null);
      setChoices(buildChoices(cards[next], VOCAB));
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

      {/* Word of the Day */}
      {wordOfDay && (
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-[32px] p-8 text-white shadow-xl shadow-rose-200 relative overflow-hidden">
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
            className="mt-6 p-4 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all disabled:opacity-50"
          >
            <Play className="w-6 h-6 fill-current" />
          </button>
        </div>
      )}

      {/* Quiz Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] uppercase tracking-widest font-bold text-stone-400">
            Quiz vocabulaire
          </h3>
          {quizState !== 'idle' && quizState !== 'complete' && (
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
              <p className="text-stone-500 text-sm">
                Teste tes connaissances sur {VOCAB.length} mots essentiels du couple.
                <br />
                Tu vois le mot en khmer, trouve la bonne traduction !
              </p>
              <button
                onClick={startQuiz}
                className="px-8 py-3 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 transition-colors"
              >
                Commencer le quiz
              </button>
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
              {/* Progress bar */}
              <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-400 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / cards.length) * 100}%` }}
                />
              </div>

              {/* Question card */}
              <div className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-3xl p-8 text-center space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                  Comment dit-on en français ?
                </p>
                <p className="khmer-text text-5xl text-stone-800">{current.kh}</p>
                {quizState === 'answered' && (
                  <p className="text-xs text-stone-400 italic">{current.phon}</p>
                )}
              </div>

              {/* Choices */}
              <div className="grid grid-cols-1 gap-3">
                {choices.map((choice, i) => {
                  const isCorrect = choice.fr === current.fr;
                  const isSelected = selected?.fr === choice.fr;
                  let style = 'bg-white border-stone-200 text-stone-700 hover:border-rose-300';
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
                    ? 'Parfait ! Tu es bilingue 💕'
                    : score >= cards.length * 0.7
                    ? 'Très bien ! Continue comme ça 🌹'
                    : 'Continue à pratiquer ! ✨'}
                </p>
              </div>
              <button
                onClick={startQuiz}
                className="px-8 py-3 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 transition-colors flex items-center gap-2 mx-auto"
              >
                <RotateCcw className="w-4 h-4" /> Recommencer
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
