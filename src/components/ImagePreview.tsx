import { X, Image } from 'lucide-react';
import { motion } from 'motion/react';

interface ImagePreviewProps {
  src: string;
  onRemove: () => void;
}

export function ImagePreview({ src, onRemove }: ImagePreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative inline-block"
    >
      <img
        src={src}
        alt="Aperçu"
        className="h-24 w-auto rounded-2xl object-cover border border-stone-200 shadow-sm"
      />
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 p-1 bg-stone-800 text-white rounded-full shadow-md hover:bg-red-500 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
      <div className="absolute bottom-1 left-1 flex items-center gap-1 bg-black/40 text-white text-[9px] rounded-lg px-1.5 py-0.5">
        <Image className="w-2.5 h-2.5" />
        Image
      </div>
    </motion.div>
  );
}
