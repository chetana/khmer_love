import { MessageSquareHeart, User, HeartHandshake } from 'lucide-react';
import { motion } from 'motion/react';
import type { Mode } from '../types';
import { cn } from '../lib/utils';

interface HeaderProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export function Header({ mode, onModeChange }: HeaderProps) {
  return (
    <header className="p-6 pb-2 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-rose-100 rounded-full">
          <MessageSquareHeart className="text-rose-500 w-5 h-5" />
        </div>
        <h1 className="serif-text text-xl font-bold text-stone-800 hidden sm:block">
          Bong & Oun
        </h1>
      </div>

      <div
        onClick={() => onModeChange(mode === 'BONG_TO_OUN' ? 'OUN_TO_BONG' : 'BONG_TO_OUN')}
        className="relative flex items-center bg-stone-100 p-1 rounded-full cursor-pointer select-none w-48 h-10 border border-stone-200/50"
      >
        <motion.div
          className="absolute h-8 bg-white rounded-full shadow-sm"
          initial={false}
          animate={{ x: mode === 'BONG_TO_OUN' ? 0 : 88, width: 96 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
        <div
          className={cn(
            'relative z-10 w-1/2 text-center text-[9px] font-black uppercase tracking-widest transition-colors duration-200 flex items-center justify-center gap-1',
            mode === 'BONG_TO_OUN' ? 'text-rose-500' : 'text-stone-400'
          )}
        >
          <User className="w-3 h-3" /> Bong
        </div>
        <div
          className={cn(
            'relative z-10 w-1/2 text-center text-[9px] font-black uppercase tracking-widest transition-colors duration-200 flex items-center justify-center gap-1',
            mode === 'OUN_TO_BONG' ? 'text-rose-500' : 'text-stone-400'
          )}
        >
          Oun <HeartHandshake className="w-3 h-3" />
        </div>
      </div>
    </header>
  );
}
