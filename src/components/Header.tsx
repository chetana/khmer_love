import { MessageSquareHeart, ChevronDown, ArrowLeftRight } from 'lucide-react';
import type { FamilyRelationship, Direction } from '../types';

interface HeaderProps {
  relationship: FamilyRelationship;
  direction: Direction;
  onOpenPicker: () => void;
  onToggleDirection: () => void;
}

export function Header({ relationship, direction, onOpenPicker, onToggleDirection }: HeaderProps) {
  const isFrToKh = direction === 'FR_TO_KH';

  return (
    <header className="px-4 py-3 flex justify-between items-center gap-3 border-b border-stone-100">
      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="p-2 bg-rose-100 rounded-full">
          <MessageSquareHeart className="text-rose-500 w-5 h-5" />
        </div>
        <h1 className="serif-text text-base font-bold text-stone-800 hidden sm:block">
          Famille Khmère
        </h1>
      </div>

      {/* Relationship pill — tappable */}
      <button
        onClick={onOpenPicker}
        className="flex items-center gap-2 px-3 py-2 bg-stone-50 hover:bg-rose-50 border border-stone-200 hover:border-rose-200 rounded-full transition-all flex-1 min-w-0 max-w-[200px]"
      >
        <span className="text-lg flex-shrink-0">{relationship.emoji}</span>
        <span className="text-xs font-semibold text-stone-600 truncate flex-1 text-left">
          {relationship.listenerPronounFr}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
      </button>

      {/* Direction toggle */}
      <button
        onClick={onToggleDirection}
        className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-full transition-all flex-shrink-0 text-xs font-bold"
        title={isFrToKh ? 'Passer en Khmer → Français' : 'Passer en Français → Khmer'}
      >
        <span>{isFrToKh ? '🇫🇷' : '🇰🇭'}</span>
        <ArrowLeftRight className="w-3 h-3" />
        <span>{isFrToKh ? '🇰🇭' : '🇫🇷'}</span>
      </button>
    </header>
  );
}
