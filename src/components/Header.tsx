import { ChevronDown } from 'lucide-react';
import type { FamilyRelationship } from '../types';

interface HeaderProps {
  relationship: FamilyRelationship;
  onOpenPicker: () => void;
}

export function Header({ relationship, onOpenPicker }: HeaderProps) {
  const listenerShort = relationship.listenerFr.split('(')[0].trim();

  return (
    <header className="px-4 py-3 flex justify-between items-center gap-3 border-b border-stone-100">
      {/* Concept visual: you (🧑) → family member */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-2xl">🧑</span>
        <span className="text-stone-300 text-xs font-bold">→</span>
        <span className="text-2xl">{relationship.emoji}</span>
      </div>

      {/* Relationship pill — tappable */}
      <button
        onClick={onOpenPicker}
        className="flex items-center gap-2 px-3 py-2 bg-stone-50 hover:bg-teal-50 border border-stone-200 hover:border-teal-200 rounded-full transition-all flex-1 min-w-0 max-w-[200px]"
      >
        <div className="flex flex-col items-start min-w-0 flex-1">
          <span className="text-[10px] text-stone-400 leading-none">parler avec</span>
          <span className="text-xs font-semibold text-stone-700 truncate leading-tight">
            {listenerShort}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
      </button>

      {/* FR ↔ KH indicator (non-interactive, just visual) */}
      <div className="flex items-center gap-1 flex-shrink-0 text-stone-400 text-sm">
        <span>🇫🇷</span>
        <span className="text-xs">↔</span>
        <span>🇰🇭</span>
      </div>
    </header>
  );
}
