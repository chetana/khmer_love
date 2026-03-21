import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import type { Toast } from '../hooks/useToast';
import { cn } from '../lib/utils';

interface ToastContainerProps {
  toasts: Toast[];
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium pointer-events-auto',
              t.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-emerald-500 text-white'
            )}
          >
            <span className="flex-1">{t.message}</span>
            <X className="w-4 h-4 opacity-70 flex-shrink-0" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
