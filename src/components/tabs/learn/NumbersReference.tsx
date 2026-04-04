import { useState } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { NUMBERS } from '../../../data/numbers';
import { speak, ensureAudioUnlocked } from '../../../lib/gemini';
import { cn } from '../../../lib/utils';

export function NumbersReference() {
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  const handleSpeak = async (idx: number) => {
    if (playingIdx !== null) return;
    ensureAudioUnlocked();
    setPlayingIdx(idx);
    try {
      await speak(NUMBERS[idx].word, 'kh');
    } catch { /* silent */ }
    finally { setPlayingIdx(null); }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-stone-50 text-stone-400 text-[10px] uppercase tracking-wider">
            <th className="py-2 px-3 text-center">🔢</th>
            <th className="py-2 px-3 text-left">Valeur</th>
            <th className="py-2 px-3 text-left">Khmer</th>
            <th className="py-2 px-3 text-left">Son</th>
            <th className="py-2 px-2 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {NUMBERS.map((n, i) => (
            <tr key={n.value} className={cn('border-t border-stone-50', i % 2 === 0 ? 'bg-white' : 'bg-amber-50/30')}>
              <td className="py-3 px-3 text-center">
                <span className="khmer-text text-2xl text-amber-600">{n.digit}</span>
              </td>
              <td className="py-3 px-3">
                <span className="font-bold text-stone-700">{n.value.toLocaleString('fr-FR')}</span>
                {n.hint && <span className="block text-[10px] text-stone-400">{n.hint}</span>}
              </td>
              <td className="py-3 px-3">
                <span className="khmer-text text-base text-stone-800">{n.word}</span>
              </td>
              <td className="py-3 px-3">
                <span className="font-mono text-amber-600 text-xs">{n.phon}</span>
                {n.note && <span className="block text-[10px] text-stone-400 max-w-[120px]">{n.note}</span>}
              </td>
              <td className="py-3 px-2">
                <button
                  onClick={() => handleSpeak(i)}
                  disabled={playingIdx !== null}
                  className="p-1.5 rounded-full text-amber-500 hover:bg-amber-50 transition-colors disabled:opacity-40"
                >
                  {playingIdx === i
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Volume2 className="w-4 h-4" />
                  }
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
