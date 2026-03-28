import { Star, Volume2, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import type { TranslationResult, HistoryEntry } from '../../types';
import { RELATIONSHIPS } from '../../lib/relationships';
import { cn } from '../../lib/utils';

interface FavoritesTabProps {
  favorites: TranslationResult[];
  history: HistoryEntry[];
  isSpeaking: boolean;
  onSpeak: (text: string, lang: 'kh' | 'fr') => void;
  onToggleFavorite: (res: TranslationResult) => void;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `il y a ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  return `il y a ${Math.floor(h / 24)}j`;
}

export function FavoritesTab({
  favorites,
  history,
  isSpeaking,
  onSpeak,
  onToggleFavorite,
}: FavoritesTabProps) {
  return (
    <motion.div
      key="favorites"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Favorites */}
      <section className="space-y-4">
        <h2 className="serif-text text-2xl font-bold px-2">Favoris</h2>
        {favorites.length === 0 ? (
          <div className="text-center py-12 text-stone-300 space-y-4">
            <Star className="w-12 h-12 mx-auto opacity-20" />
            <p>Tes phrases préférées apparaîtront ici</p>
          </div>
        ) : (
          favorites.map((fav, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-stone-400 mb-1 truncate">{fav.originalText}</p>
                  <p className="khmer-text text-2xl text-stone-800 leading-relaxed">
                    {fav.translatedText}
                  </p>
                  {fav.phonetic && (
                    <p className="text-xs text-stone-400 italic mt-1">{fav.phonetic}</p>
                  )}
                </div>
                <button
                  onClick={() => onToggleFavorite(fav)}
                  className="text-amber-500 ml-3 flex-shrink-0"
                >
                  <Star className="w-5 h-5 fill-current" />
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onSpeak(fav.translatedText, 'kh')}
                  className={cn(
                    'p-2 bg-stone-50 rounded-lg text-stone-400 hover:text-teal-600 transition-colors',
                    isSpeaking && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* History */}
      {history.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Clock className="w-4 h-4 text-stone-400" />
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-stone-400">
              Historique récent
            </h3>
          </div>
          <div className="space-y-3">
            {history.map((entry, i) => {
              const rel = RELATIONSHIPS.find((r) => r.id === entry.relationshipId);
              const isFrToKh = entry.direction === 'FR_TO_KH';
              return (
                <div
                  key={i}
                  className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm space-y-2"
                >
                  {/* Relationship badge + time */}
                  <div className="flex items-center justify-between">
                    {rel && (
                      <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
                        <span>{rel.emoji}</span>
                        <span className="font-medium">{rel.listenerFr}</span>
                        <span className="text-stone-300">·</span>
                        <span>{isFrToKh ? '🇫🇷 → 🇰🇭' : '🇰🇭 → 🇫🇷'}</span>
                      </div>
                    )}
                    <span className="text-[10px] text-stone-300">{timeAgo(entry.ts)}</span>
                  </div>

                  {/* Source → target */}
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className={cn(
                        'text-xs text-stone-400 truncate',
                        !isFrToKh && 'khmer-text text-sm text-stone-500'
                      )}>
                        {entry.source}
                      </p>
                      <div className="flex items-start gap-1 mt-0.5">
                        <ArrowRight className="w-3 h-3 text-stone-300 flex-shrink-0 mt-1" />
                        <p className={cn(
                          'font-medium leading-relaxed',
                          isFrToKh ? 'khmer-text text-lg text-stone-800' : 'text-sm text-stone-700'
                        )}>
                          {entry.target}
                        </p>
                      </div>
                      {entry.phonetic && (
                        <p className="text-[10px] text-stone-400 italic">{entry.phonetic}</p>
                      )}
                    </div>
                  </div>

                  {/* Explanation */}
                  {entry.explanation && (
                    <p className="text-[11px] text-stone-400 leading-relaxed pt-1 border-t border-stone-50">
                      {entry.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </motion.div>
  );
}
