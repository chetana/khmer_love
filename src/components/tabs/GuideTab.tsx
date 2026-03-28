import { Heart, Users, Info, Sparkles, ChevronDown, Send, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { RELATIONSHIPS } from '../../lib/relationships';
import { cn } from '../../lib/utils';
import { askCultureChat } from '../../lib/gemini';

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

const SUGGESTED_QUESTIONS = [
  '💰 100 € c\'est combien en riels ?',
  '🍜 Quels plats offrir à la belle-famille ?',
  '🙏 Comment saluer les grands-parents ?',
  '🎉 C\'est quoi Pchum Ben ?',
  '👗 Comment s\'habiller pour rendre visite ?',
  '🛕 Comment se comporter au temple ?',
];

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export function GuideTab() {
  const [expandedRel, setExpandedRel] = useState<string | null>(null);
  const [expandedCulture, setExpandedCulture] = useState<number | null>(null);
  const [showAllRels, setShowAllRels] = useState(false);

  // Culture chat
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendMessage = async (text?: string) => {
    const question = (text ?? chatInput).trim();
    if (!question || chatLoading) return;
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: question }]);
    setChatLoading(true);
    try {
      const answer = await askCultureChat(question);
      setChatMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: 'assistant', text: 'Désolé, une erreur s\'est produite. Réessaie !' }]);
    } finally {
      setChatLoading(false);
    }
  };

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
                    <span className="text-xs text-stone-500 font-mono">{r.speakerPronounFr}</span>
                    <span className="text-stone-300 text-xs">→</span>
                    <span className="text-xs text-teal-600 font-semibold font-mono">{r.listenerPronounFr}</span>
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

      {/* ── Culture Chat ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-2">
          <MessageCircle className="w-4 h-4 text-teal-500" />
          <h3 className="text-[10px] uppercase tracking-widest font-bold text-stone-400">
            Pose une question à Gemini
          </h3>
        </div>

        <div className="bg-white rounded-[32px] border border-stone-100 shadow-sm overflow-hidden">
          {/* Messages */}
          {chatMessages.length > 0 && (
            <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
              {chatMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-teal-600 text-white rounded-br-sm'
                        : 'bg-stone-50 text-stone-700 rounded-bl-sm border border-stone-100'
                    )}
                  >
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          strong: ({ children }) => <strong className="font-semibold text-stone-800">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-2">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          h3: ({ children }) => <h3 className="font-bold text-stone-800 mt-3 mb-1">{children}</h3>,
                          h4: ({ children }) => <h4 className="font-semibold text-stone-700 mt-2 mb-1">{children}</h4>,
                          code: ({ children }) => <code className="bg-stone-100 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    ) : msg.text}
                  </div>
                </motion.div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-stone-50 border border-stone-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                    <Sparkles className="w-4 h-4 text-teal-400 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>
          )}

          {/* Suggested questions (only if no messages yet) */}
          {chatMessages.length === 0 && (
            <div className="p-4 space-y-3">
              <p className="text-xs text-stone-400 text-center">Questions fréquentes :</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-2xl text-stone-600 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 transition-all text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2 p-3 border-t border-stone-100">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
              placeholder="Pose ta question sur la culture khmère..."
              className="flex-1 bg-stone-50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 placeholder:text-stone-300"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!chatInput.trim() || chatLoading}
              className="p-2.5 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:bg-stone-100 disabled:text-stone-300 transition-all flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
