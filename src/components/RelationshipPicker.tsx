import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import type { FamilyRelationship } from '../types';
import { RELATIONSHIPS } from '../lib/relationships';
import { cn } from '../lib/utils';

interface RelationshipPickerProps {
  current: FamilyRelationship;
  onSelect: (r: FamilyRelationship) => void;
  onClose: () => void;
}

export function RelationshipPicker({ current, onSelect, onClose }: RelationshipPickerProps) {
  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <motion.div
        key="sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white rounded-t-[32px] z-50 pb-safe"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        <div className="px-6 pb-6">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-lg font-bold text-stone-800">Quelle est votre relation ?</h2>
              <p className="text-xs text-stone-400 mt-0.5">
                La traduction utilisera les bons pronoms khmer
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {RELATIONSHIPS.map((r) => (
              <button
                key={r.id}
                onClick={() => { onSelect(r); onClose(); }}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all',
                  current.id === r.id
                    ? 'border-rose-300 bg-rose-50'
                    : 'border-stone-100 bg-stone-50 hover:border-rose-200 hover:bg-rose-50/50'
                )}
              >
                <span className="text-3xl flex-shrink-0">{r.emoji}</span>
                <div className="min-w-0">
                  <p className={cn(
                    'text-xs font-bold leading-tight',
                    current.id === r.id ? 'text-rose-600' : 'text-stone-700'
                  )}>
                    {r.speakerFr}
                  </p>
                  <p className="text-[10px] text-stone-400 leading-tight mt-0.5 truncate">
                    → {r.listenerPronounFr}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-1 font-medium khmer-text">
                    {r.speakerPronounKh} → {r.listenerPronounKh}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
