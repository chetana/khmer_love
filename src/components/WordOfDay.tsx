import { Heart, Sun, Volume2, RefreshCw, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { WordOfDay } from '../types';
import { cn } from '../lib/utils';

interface WordOfDayProps {
  word: WordOfDay;
  isSpeaking: boolean;
  isRefreshing?: boolean;
  onSpeak: () => void;
  onRefresh: () => void;
}

export function WordOfDayCard({ word, isSpeaking, isRefreshing, onSpeak, onRefresh }: WordOfDayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-teal-50 to-amber-50 rounded-[32px] p-6 border border-teal-100 shadow-sm relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Heart className="w-24 h-24 text-teal-600 rotate-12" />
      </div>
      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-2 text-teal-600 font-bold text-[10px] uppercase tracking-widest">
          <Sun className="w-3 h-3" /> Mot ou expression du jour
        </div>
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="khmer-text text-3xl text-stone-800">{word.kh}</p>
            <p className="text-xs text-stone-400 italic">{word.phon}</p>
            <p className="serif-text text-lg text-stone-600">{word.fr}</p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={onSpeak}
              disabled={isSpeaking}
              className="p-3 bg-white/80 backdrop-blur-sm text-teal-600 rounded-full hover:bg-white transition-all shadow-sm disabled:opacity-60"
            >
              {isSpeaking
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <Volume2 className="w-5 h-5" />
              }
            </button>
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-3 bg-white/80 backdrop-blur-sm text-stone-400 rounded-full hover:bg-white hover:text-teal-600 transition-all shadow-sm disabled:opacity-40"
              title="Autre expression"
            >
              <RefreshCw className={cn('w-5 h-5', isRefreshing && 'animate-spin')} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
