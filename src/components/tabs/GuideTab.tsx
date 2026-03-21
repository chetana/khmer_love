import { Heart, User, Info, Sparkles, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

const GUIDES = [
  {
    title: 'Bong & Oun',
    icon: Heart,
    color: 'bg-rose-50 text-rose-500',
    short: "Le système de respect basé sur l'âge. Bong (Aîné) et Oun (Cadet).",
    long: "En khmer, les pronoms personnels reflètent la hiérarchie familiale et sociale. « Bong » désigne un aîné — homme ou femme — et signifie aussi « grand frère/grande sœur ». « Oun » désigne un cadet et signifie « petit frère/petite sœur ». Dans un couple, on utilise ces termes à la place de « je » et « tu » selon l'âge relatif. C'est une marque de respect et de tendresse profondément ancrée dans la culture khmère.",
  },
  {
    title: 'Le Sampeah',
    icon: User,
    color: 'bg-blue-50 text-blue-500',
    short: 'La salutation traditionnelle en joignant les mains.',
    long: "Le sampeah (សំពះ) est le geste de salutation khmer : on joint les paumes devant la poitrine, comme en prière, et on s'incline légèrement. Plus les mains sont hautes et plus l'inclinaison est profonde, plus le respect est grand. C'est un geste universellement utilisé au Cambodge pour saluer, remercier ou exprimer du respect.",
  },
  {
    title: 'Nham bay nov?',
    icon: Info,
    color: 'bg-amber-50 text-amber-500',
    short: "Pourquoi demander 'As-tu mangé ?' est la plus grande preuve d'amour.",
    long: "« ញ៉ាំបាយហើយ? » (Nham bay haoy?) — « As-tu mangé ? » — est probablement la phrase la plus importante dans la culture khmère. C'est l'équivalent de « je t'aime » et de « comment vas-tu ? » réunis. Demander si quelqu'un a mangé, c'est lui montrer qu'on se soucie de son bien-être. Ne jamais répondre « je n'ai pas faim » quand quelqu'un vous pose cette question — c'est impoli. Dites plutôt « ញ៉ាំហើយ! » (j'ai mangé !) même si vous avez peu mangé.",
  },
  {
    title: 'Fêtes Nationales',
    icon: Sparkles,
    color: 'bg-emerald-50 text-emerald-500',
    short: 'Nouvel An Khmer (Avril) et Pchum Ben (Septembre).',
    long: "Le Nouvel An Khmer (Chaul Chnam Thmey, ចូលឆ្នាំថ្មី) se fête en avril pendant 3 jours. C'est la fête la plus importante : les familles se réunissent, font des offrandes, jouent et se rendent au temple. Pchum Ben (ភ្ជុំបិណ្ឌ) en septembre/octobre est la fête des ancêtres : on prépare de la nourriture pour les esprits et on va au temple. Offrir de la nourriture à votre partenaire cambodgien pendant ces fêtes est un geste très apprécié.",
  },
];

export function GuideTab() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <motion.div
      key="guide"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <h2 className="serif-text text-2xl font-bold px-2">Guide Culturel</h2>

      <div className="space-y-3">
        {GUIDES.map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden"
          >
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full p-6 flex gap-4 items-start text-left"
            >
              <div className={cn('p-3 rounded-2xl flex-shrink-0', item.color)}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-stone-800">{item.title}</h4>
                <p className="text-sm text-stone-500 leading-relaxed mt-1">{item.short}</p>
              </div>
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-stone-400 flex-shrink-0 mt-1 transition-transform duration-200',
                  expanded === i && 'rotate-180'
                )}
              />
            </button>
            {expanded === i && (
              <div className="px-6 pb-6 -mt-2">
                <div className="h-px bg-stone-100 mb-4" />
                <p className="text-sm text-stone-600 leading-relaxed">{item.long}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
