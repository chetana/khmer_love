import { Heart, Users, Info, Sparkles, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { RELATIONSHIPS } from '../../lib/relationships';
import { cn } from '../../lib/utils';

const CULTURAL_GUIDES = [
  {
    title: 'Le Sampeah',
    icon: Users,
    color: 'bg-blue-50 text-blue-500',
    short: 'La salutation traditionnelle en joignant les mains.',
    long: "Le sampeah (សំពះ) est le geste de salutation khmer : on joint les paumes devant la poitrine et on s'incline légèrement. Plus les mains sont hautes et plus l'inclinaison est profonde, plus le respect est grand. Envers les personnes âgées (ta, yeay, pa, mae, om, pou, ming), le sampeah est indispensable.",
  },
  {
    title: 'Nham bay haoy?',
    icon: Info,
    color: 'bg-amber-50 text-amber-500',
    short: "« As-tu mangé ? » — la plus grande preuve d'amour.",
    long: "« ញ៉ាំបាយហើយ? » — « As-tu mangé ? » — est l'équivalent de « je t'aime » et « comment vas-tu ? » réunis. C'est la phrase clé pour montrer qu'on se soucie du bien-être de quelqu'un. Utilisée avec tout le monde : ta, yeay, pa, mae, bong… Ne jamais répondre « je n'ai pas faim » — c'est impoli. Dites « ញ៉ាំហើយ! » même si vous avez peu mangé.",
  },
  {
    title: 'Fêtes Nationales',
    icon: Sparkles,
    color: 'bg-emerald-50 text-emerald-500',
    short: 'Nouvel An Khmer (Avril) et Pchum Ben (Septembre).',
    long: "Le Nouvel An Khmer (Chaul Chnam Thmey) se fête en avril pendant 3 jours. C'est la fête la plus importante : familles réunies, offrandes, temple. Pchum Ben en septembre est la fête des ancêtres. Lors de ces fêtes, appeler ta, yeay, pa ou mae en khmer — même par message — est un geste très fort culturellement.",
  },
  {
    title: 'Bong & Oun',
    icon: Heart,
    color: 'bg-teal-50 text-teal-600',
    short: "Le système de respect basé sur l'âge entre frères, sœurs et cousins.",
    long: "« Bong » (បង) désigne un aîné — homme ou femme — et signifie « grand frère/grande sœur ». « Oun » (អូន) désigne un cadet. Entre frères, sœurs ou cousins, on s'appelle par ces termes. C'est aussi utilisé dans les couples selon l'âge. Ce système de pronoms reflète la hiérarchie et le respect fondamentaux dans la culture khmère.",
  },
];

export function GuideTab() {
  const [expandedRel, setExpandedRel] = useState<string | null>(null);
  const [expandedCulture, setExpandedCulture] = useState<number | null>(null);
  const [showAllRels, setShowAllRels] = useState(false);

  return (
    <motion.div
      key="guide"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <h2 className="serif-text text-2xl font-bold px-2">Guide Culturel</h2>

      {/* Relations section */}
      <section className="space-y-3">
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-stone-400 px-2">
          Les pronoms par relation
        </h3>
        <div className="space-y-2">
          {(showAllRels ? RELATIONSHIPS : RELATIONSHIPS.slice(0, 4)).map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setExpandedRel(expandedRel === r.id ? null : r.id)}
                className="w-full p-4 flex gap-3 items-center text-left"
              >
                <span className="text-2xl flex-shrink-0">{r.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-bold text-stone-800 text-sm">{r.listenerFr}</span>
                    <span className="text-[10px] text-stone-400">moi : {r.speakerFr}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-stone-500 font-mono">
                      {r.speakerPronounFr}
                    </span>
                    <span className="text-stone-300 text-xs">→</span>
                    <span className="text-xs text-teal-600 font-semibold font-mono">
                      {r.listenerPronounFr}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="khmer-text text-base text-stone-700">
                    {r.speakerPronounKh}
                    <span className="text-stone-300 mx-1">→</span>
                    {r.listenerPronounKh}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-stone-400 flex-shrink-0 ml-1 transition-transform duration-200',
                    expandedRel === r.id && 'rotate-180'
                  )}
                />
              </button>
              <AnimatePresence>
                {expandedRel === r.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4 space-y-3">
                      <div className="h-px bg-stone-100" />
                      <p className="text-xs text-stone-500 leading-relaxed">{r.geminiContext}</p>
                      <div className="bg-stone-50 rounded-2xl p-3 space-y-1.5">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">
                          Phrases rapides
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {r.quickPhrasesFr.slice(0, 4).map((p, i) => (
                            <span
                              key={i}
                              className="text-xs text-stone-600 bg-white border border-stone-200 px-2 py-1 rounded-xl"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        {!showAllRels && (
          <button
            onClick={() => setShowAllRels(true)}
            className="w-full py-3 text-xs font-semibold text-stone-400 hover:text-teal-600 transition-colors"
          >
            Voir les {RELATIONSHIPS.length - 4} autres relations ▾
          </button>
        )}
      </section>

      {/* Cultural guides */}
      <section className="space-y-3">
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-stone-400 px-2">
          Culture khmère
        </h3>
        <div className="space-y-3">
          {CULTURAL_GUIDES.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setExpandedCulture(expandedCulture === i ? null : i)}
                className="w-full p-5 flex gap-4 items-start text-left"
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
                    expandedCulture === i && 'rotate-180'
                  )}
                />
              </button>
              {expandedCulture === i && (
                <div className="px-6 pb-6 -mt-2">
                  <div className="h-px bg-stone-100 mb-4" />
                  <p className="text-sm text-stone-600 leading-relaxed">{item.long}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
