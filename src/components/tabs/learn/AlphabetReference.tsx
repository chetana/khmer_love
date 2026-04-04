import { useState } from 'react';
import { Volume2, Loader2, VolumeX } from 'lucide-react';
import { CONSONANTS, VOWELS, type AlphabetChar } from '../../../data/alphabet';
import { speak, ensureAudioUnlocked } from '../../../lib/gemini';
import { cn } from '../../../lib/utils';

type Group = 'consonants' | 'vowels';

export function AlphabetReference() {
  const [group, setGroup] = useState<Group>('consonants');
  const [playingChar, setPlayingChar] = useState<string | null>(null);

  const data = group === 'consonants' ? CONSONANTS : VOWELS;

  const handleSpeak = async (char: AlphabetChar) => {
    if (playingChar) return;
    ensureAudioUnlocked();
    const text = char.example?.kh ?? char.char;
    setPlayingChar(char.char);
    try {
      await speak(text, 'kh');
    } catch { /* silent */ }
    finally { setPlayingChar(null); }
  };

  return (
    <div className="space-y-4">
      {/* Group toggle */}
      <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
        <button
          onClick={() => setGroup('consonants')}
          className={cn('flex-1 py-2 text-xs font-bold rounded-lg transition-all',
            group === 'consonants' ? 'bg-white text-teal-600 shadow-sm' : 'text-stone-400'
          )}
        >
          ព្យញ្ជនៈ Consonnes ({CONSONANTS.length})
        </button>
        <button
          onClick={() => setGroup('vowels')}
          className={cn('flex-1 py-2 text-xs font-bold rounded-lg transition-all',
            group === 'vowels' ? 'bg-white text-teal-600 shadow-sm' : 'text-stone-400'
          )}
        >
          ស្រៈ Voyelles ({VOWELS.length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-50 text-stone-400 text-[10px] uppercase tracking-wider">
              <th className="py-2 px-3 text-left">Lettre</th>
              <th className="py-2 px-3 text-left">Son</th>
              <th className="py-2 px-3 text-left">Exemple</th>
              <th className="py-2 px-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((c, i) => (
              <tr key={c.char} className={cn('border-t border-stone-50', i % 2 === 0 ? 'bg-white' : 'bg-stone-50/50')}>
                <td className="py-3 px-3">
                  <span className="khmer-text text-2xl text-stone-800">{c.char}</span>
                </td>
                <td className="py-3 px-3">
                  <span className="font-mono text-teal-600 text-xs">{c.phon}</span>
                  {c.note && <span className="block text-[10px] text-stone-400 mt-0.5">{c.note}</span>}
                </td>
                <td className="py-3 px-3">
                  {c.example ? (
                    <div>
                      <span className="khmer-text text-base">{c.example.kh}</span>
                      <span className="block text-[10px] text-stone-400">{c.example.phon} — {c.example.fr}</span>
                    </div>
                  ) : <span className="text-stone-300">—</span>}
                </td>
                <td className="py-3 px-2">
                  <button
                    onClick={() => handleSpeak(c)}
                    disabled={!!playingChar}
                    className="p-1.5 rounded-full text-teal-500 hover:bg-teal-50 transition-colors disabled:opacity-40"
                  >
                    {playingChar === c.char
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
    </div>
  );
}
