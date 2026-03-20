/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, type ReactNode, type ChangeEvent } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { 
  Languages, 
  Send, 
  Copy, 
  Check, 
  Heart, 
  History, 
  Info,
  Sparkles,
  ArrowRightLeft,
  MessageSquareHeart,
  User,
  HeartHandshake,
  Volume2,
  Camera,
  Star,
  BookOpen,
  Share2,
  Trash2,
  Lightbulb,
  X,
  ChevronRight,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface TranslationResult {
  translatedText: string;
  phonetic?: string;
  explanation: string;
  originalText: string;
}

type Mode = 'BONG_TO_OUN' | 'OUN_TO_BONG';
type Tab = 'translate' | 'favorites' | 'learn' | 'guide';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('translate');
  const [mode, setMode] = useState<Mode>('BONG_TO_OUN');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState<'single' | 'both' | null>(null);
  const [favorites, setFavorites] = useState<TranslationResult[]>(() => {
    const saved = localStorage.getItem('khmer_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [history, setHistory] = useState<{source: string, target: string, mode: Mode}[]>([]);
  const [wordOfTheDay, setWordOfTheDay] = useState<{fr: string, kh: string, phon: string} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('khmer_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    generateWordOfTheDay();
  }, []);

  const generateWordOfTheDay = async () => {
    const today = new Date().toDateString();
    const cached = localStorage.getItem('word_of_the_day');
    const cachedDate = localStorage.getItem('word_of_the_day_date');

    if (cached && cachedDate === today) {
      setWordOfTheDay(JSON.parse(cached));
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Génère un mot ou une expression courte et romantique en français avec sa traduction en khmer et sa phonétique pour un couple. Réponds en JSON: {fr, kh, phon}",
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(response.text || '{}');
      setWordOfTheDay(data);
      localStorage.setItem('word_of_the_day', JSON.stringify(data));
      localStorage.setItem('word_of_the_day_date', today);
    } catch (e) {
      console.error(e);
    }
  };

  const translate = async (textOverride?: string, imageBase64?: string) => {
    const textToTranslate = textOverride || inputText;
    if (!textToTranslate.trim() && !imageBase64) return;
    
    setIsLoading(true);
    try {
      const isBong = mode === 'BONG_TO_OUN';
      const prompt = isBong 
        ? `Traduis cette phrase ou analyse cette image du français vers le khmer pour ma petite amie au Cambodge. 
           CONTEXTE : Je suis un homme plus âgé (Bong), elle est plus jeune (Oun). 
           Utilise un ton affectueux et naturel.`
        : `Traduis cette phrase ou analyse cette image du khmer vers le français pour mon petit ami français. 
           CONTEXTE : Je suis une femme plus jeune (Oun), il est plus âgé (Bong). 
           Garde le ton affectueux et respectueux.`;

      const contents: any[] = [{ text: `${prompt}\n\nTexte/Image à traduire : "${textToTranslate}"\n\nRéponds UNIQUEMENT au format JSON : { "translatedText", "phonetic", "explanation", "originalText" }` }];
      
      if (imageBase64) {
        contents.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64.split(',')[1]
          }
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: contents },
        config: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(response.text || '{}');
      setResult(data);
      setHistory(prev => [{ source: textToTranslate || "Image", target: data.translatedText, mode }, ...prev].slice(0, 10));
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const speak = async (text: string, lang: 'kh' | 'fr') => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Prononce ceci de manière naturelle et douce : ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: lang === 'kh' ? 'Kore' : 'Zephyr' } }
          }
        }
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        audio.onended = () => setIsSpeaking(false);
        audio.play();
      }
    } catch (e) {
      console.error(e);
      setIsSpeaking(false);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        translate("", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleFavorite = (res: TranslationResult) => {
    const exists = favorites.find(f => f.translatedText === res.translatedText);
    if (exists) {
      setFavorites(favorites.filter(f => f.translatedText !== res.translatedText));
    } else {
      setFavorites([...favorites, res]);
    }
  };

  const share = async (res: TranslationResult) => {
    const text = `${res.originalText}\n---\n${res.translatedText}`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (e) { console.error(e); }
    } else {
      copyToClipboard('both');
    }
  };

  const copyToClipboard = (type: 'single' | 'both') => {
    if (!result) return;
    let textToCopy = result.translatedText;
    if (type === 'both') textToCopy = `${result.originalText}\n---\n${result.translatedText}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#fdfcf8] flex flex-col max-w-2xl mx-auto border-x border-stone-100 shadow-2xl">
      {/* Header */}
      <header className="p-6 pb-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-100 rounded-full">
            <MessageSquareHeart className="text-rose-500 w-5 h-5" />
          </div>
          <h1 className="serif-text text-xl font-bold text-stone-800 hidden sm:block">Bong & Oun</h1>
        </div>
        
        {/* New Visual Toggle Switch */}
        <div 
          onClick={() => {
            setMode(mode === 'BONG_TO_OUN' ? 'OUN_TO_BONG' : 'BONG_TO_OUN');
            setResult(null);
            setInputText('');
          }}
          className="relative flex items-center bg-stone-100 p-1 rounded-full cursor-pointer select-none w-48 h-10 border border-stone-200/50"
        >
          <motion.div 
            className="absolute h-8 bg-white rounded-full shadow-sm"
            initial={false}
            animate={{ 
              x: mode === 'BONG_TO_OUN' ? 0 : 88,
              width: 96
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
          <div className={cn(
            "relative z-10 w-1/2 text-center text-[9px] font-black uppercase tracking-widest transition-colors duration-200 flex items-center justify-center gap-1",
            mode === 'BONG_TO_OUN' ? "text-rose-500" : "text-stone-400"
          )}>
            <User className="w-3 h-3" /> Bong
          </div>
          <div className={cn(
            "relative z-10 w-1/2 text-center text-[9px] font-black uppercase tracking-widest transition-colors duration-200 flex items-center justify-center gap-1",
            mode === 'OUN_TO_BONG' ? "text-rose-500" : "text-stone-400"
          )}>
            Oun <HeartHandshake className="w-3 h-3" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'translate' && (
            <motion.div 
              key="translate"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Input Card */}
              <div className="bg-white rounded-[32px] p-6 shadow-sm border border-stone-100 space-y-4">
                <div className="relative">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 px-1">
                    {["❤️", "💖", "🥰", "😘", "😍", "🌹", "✨", "🙏", "😊", "🌙"].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setInputText(prev => prev + emoji)}
                        className="text-xl hover:scale-125 transition-transform active:scale-95 p-1"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={mode === 'BONG_TO_OUN' ? "Écris ton message..." : "សរសេរសាររបស់អ្នក..."}
                    className={cn(
                      "w-full h-32 p-0 bg-transparent border-none focus:ring-0 text-xl transition-all placeholder:text-stone-300",
                      mode === 'OUN_TO_BONG' && "khmer-text"
                    )}
                  />
                </div>
                  <div className="absolute bottom-0 right-0 flex gap-2">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 bg-stone-50 text-stone-400 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-all"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    <button 
                      onClick={() => translate()}
                      disabled={isLoading || !inputText.trim()}
                      className="p-3 bg-stone-800 text-white rounded-full hover:bg-stone-900 shadow-lg disabled:bg-stone-100 disabled:text-stone-300 transition-all"
                    >
                      {isLoading ? <Sparkles className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Result Card */}
              {result && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[32px] p-6 shadow-md border border-rose-100 space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 text-center py-4">
                        <p className={cn(
                          "text-stone-800 leading-relaxed",
                          mode === 'BONG_TO_OUN' ? "khmer-text text-4xl" : "serif-text text-2xl"
                        )}>
                          {result.translatedText}
                        </p>
                        {result.phonetic && <p className="text-sm text-stone-400 italic mt-2">{result.phonetic}</p>}
                      </div>
                    </div>

                    <div className="flex justify-center gap-3 flex-wrap">
                      <button onClick={() => speak(result.translatedText, mode === 'BONG_TO_OUN' ? 'kh' : 'fr')} className="p-4 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-100 transition-all" title="Écouter">
                        <Volume2 className={cn("w-6 h-6", isSpeaking && "animate-pulse")} />
                      </button>
                      
                      <button 
                        onClick={() => copyToClipboard('single')} 
                        className={cn(
                          "p-4 rounded-full transition-all flex items-center gap-2",
                          copied === 'single' ? "bg-green-50 text-green-500" : "bg-stone-50 text-stone-400 hover:bg-stone-100"
                        )}
                        title="Copier la traduction"
                      >
                        {copied === 'single' ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                      </button>

                      <button 
                        onClick={() => copyToClipboard('both')} 
                        className={cn(
                          "p-4 rounded-full transition-all flex items-center gap-2",
                          copied === 'both' ? "bg-rose-100 text-rose-600" : "bg-rose-50 text-rose-400 hover:bg-rose-100"
                        )}
                        title="Copier Source + Traduction"
                      >
                        {copied === 'both' ? <Check className="w-6 h-6" /> : <ArrowRightLeft className="w-6 h-6" />}
                      </button>

                      <button onClick={() => toggleFavorite(result)} className={cn("p-4 rounded-full transition-all", favorites.find(f => f.translatedText === result.translatedText) ? "bg-amber-50 text-amber-500" : "bg-stone-50 text-stone-400")}>
                        <Star className={cn("w-6 h-6", favorites.find(f => f.translatedText === result.translatedText) && "fill-current")} />
                      </button>
                      
                      <button onClick={() => share(result)} className="p-4 bg-stone-50 text-stone-400 rounded-full hover:bg-stone-100 transition-all" title="Partager">
                        <Share2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-stone-50 rounded-2xl flex gap-3 items-start">
                    <Info className="w-4 h-4 text-stone-400 mt-1 flex-shrink-0" />
                    <p className="text-xs text-stone-500 leading-relaxed">{result.explanation}</p>
                  </div>
                </motion.div>
              )}

              {/* Quick Phrases */}
              <div className="space-y-3">
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-stone-400 px-2">Phrases rapides</h3>
                <div className="flex flex-wrap gap-2">
                  {(mode === 'BONG_TO_OUN' 
                    ? [
                        { text: "Tu me manques", phon: "បងនឹកអូន" }, 
                        { text: "Je t'aime", phon: "បងស្រឡាញ់អូន" }, 
                        { text: "Tu as mangé ?", phon: "ញ៉ាំបាយនៅ?" }, 
                        { text: "Bonne nuit", phon: "រាត្រីសួស្តី" },
                        { text: "Bonjour", phon: "អរុណសួស្តី" },
                        { text: "Prends soin de toi", phon: "ថែរក្សាខ្លួនផង" },
                        { text: "Je suis fier de toi", phon: "បងមានមោទនភាពចំពោះអូន" },
                        { text: "Tu es magnifique", phon: "អូនស្អាតណាស់" },
                        { text: "À bientôt", phon: "ជួបគ្នាឆាប់ៗ" },
                        { text: "Fais de beaux rêves", phon: "យល់សប្តិល្អ" }
                      ] 
                    : [
                        { text: "អូននឹកបង", phon: "Oun nirk Bong" }, 
                        { text: "អូនស្រឡាញ់បង", phon: "Oun srolanh Bong" }, 
                        { text: "ញ៉ាំបាយនៅ?", phon: "Nham bay nov?" },
                        { text: "រាត្រីសួស្តី", phon: "Reatrey sour sdei" },
                        { text: "អរុណសួស្តី", phon: "Arun sour sdei" },
                        { text: "ថែរក្សាខ្លួនផង", phon: "Thae raksa kloun pong" },
                        { text: "អូនមានមោទនភាពចំពោះបង", phon: "Oun mean motonakpheap chompos Bong" },
                        { text: "បងសង្ហាណាស់", phon: "Bong sangha nas" },
                        { text: "ជួបគ្នាឆាប់ៗ", phon: "Choub knia chab chab" },
                        { text: "យល់សប្តិល្អ", phon: "Yol sop l'or" }
                      ]
                  ).map((p, i) => (
                    <button 
                      key={i} 
                      onClick={() => setInputText(p.text)} 
                      className="px-4 py-2 bg-white border border-stone-200 rounded-2xl text-stone-600 hover:border-rose-200 transition-all flex flex-col items-center min-w-[100px]"
                    >
                      <span className={cn("text-sm", mode === 'OUN_TO_BONG' && "khmer-text text-lg")}>{p.text}</span>
                      {p.phon && (
                        <span className={cn(
                          "text-[9px] text-stone-400 leading-tight",
                          mode === 'BONG_TO_OUN' ? "khmer-text" : "italic"
                        )}>
                          {p.phon}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'favorites' && (
            <motion.div key="favorites" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              <h2 className="serif-text text-2xl font-bold px-2">Favoris</h2>
              {favorites.length === 0 ? (
                <div className="text-center py-20 text-stone-300 space-y-4">
                  <Star className="w-12 h-12 mx-auto opacity-20" />
                  <p>Tes phrases préférées apparaîtront ici</p>
                </div>
              ) : (
                favorites.map((fav, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-stone-400 mb-1">{fav.originalText}</p>
                        <p className="khmer-text text-2xl text-stone-800">{fav.translatedText}</p>
                      </div>
                      <button onClick={() => toggleFavorite(fav)} className="text-amber-500"><Star className="w-5 h-5 fill-current" /></button>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => speak(fav.translatedText, 'kh')} className="p-2 bg-stone-50 rounded-lg text-stone-400"><Volume2 className="w-4 h-4" /></button>
                      <button onClick={() => share(fav)} className="p-2 bg-stone-50 rounded-lg text-stone-400"><Share2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'learn' && (
            <motion.div key="learn" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              <h2 className="serif-text text-2xl font-bold px-2">Apprendre</h2>
              
              {/* Word of the Day */}
              {wordOfTheDay && (
                <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-[32px] p-8 text-white shadow-xl shadow-rose-200 relative overflow-hidden">
                  <Sparkles className="absolute -top-4 -right-4 w-24 h-24 opacity-10" />
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-70">Expression du jour</span>
                  <div className="mt-4 space-y-2">
                    <h3 className="text-3xl font-bold serif-text">{wordOfTheDay.fr}</h3>
                    <p className="khmer-text text-4xl mt-4">{wordOfTheDay.kh}</p>
                    <p className="text-sm opacity-80 italic">{wordOfTheDay.phon}</p>
                  </div>
                  <button onClick={() => speak(wordOfTheDay.kh, 'kh')} className="mt-6 p-4 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all">
                    <Play className="w-6 h-6 fill-current" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm space-y-2">
                  <div className="p-2 bg-amber-100 w-fit rounded-lg text-amber-600"><Lightbulb className="w-5 h-5" /></div>
                  <h4 className="font-bold text-stone-800">Quiz rapide</h4>
                  <p className="text-xs text-stone-500">Teste tes connaissances sur le Khmer.</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm space-y-2">
                  <div className="p-2 bg-blue-100 w-fit rounded-lg text-blue-600"><BookOpen className="w-5 h-5" /></div>
                  <h4 className="font-bold text-stone-800">Vocabulaire</h4>
                  <p className="text-xs text-stone-500">Liste des mots essentiels du couple.</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'guide' && (
            <motion.div key="guide" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              <h2 className="serif-text text-2xl font-bold px-2">Guide Culturel</h2>
              
              <div className="space-y-4">
                {[
                  { title: "Bong & Oun", desc: "Le système de respect basé sur l'âge. Bong (Aîné) et Oun (Cadet).", icon: <Heart className="w-5 h-5" /> },
                  { title: "Le Sampeah", desc: "La salutation traditionnelle en joignant les mains.", icon: <User className="w-5 h-5" /> },
                  { title: "Nham bay nov?", desc: "Pourquoi demander 'As-tu mangé ?' est la plus grande preuve d'amour.", icon: <Info className="w-5 h-5" /> },
                  { title: "Fêtes Nationales", desc: "Nouvel An Khmer (Avril) et Pchum Ben (Septembre).", icon: <Sparkles className="w-5 h-5" /> }
                ].map((item, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex gap-4 items-start">
                    <div className="p-3 bg-stone-50 rounded-2xl text-stone-400">{item.icon}</div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-stone-800">{item.title}</h4>
                      <p className="text-sm text-stone-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white/80 backdrop-blur-xl border-t border-stone-100 px-6 py-4 flex justify-between items-center z-40">
        <NavButton active={activeTab === 'translate'} onClick={() => setActiveTab('translate')} icon={<Languages className="w-6 h-6" />} label="Trad" />
        <NavButton active={activeTab === 'favorites'} onClick={() => setActiveTab('favorites')} icon={<Star className="w-6 h-6" />} label="Favoris" />
        <NavButton active={activeTab === 'learn'} onClick={() => setActiveTab('learn')} icon={<BookOpen className="w-6 h-6" />} label="Apprendre" />
        <NavButton active={activeTab === 'guide'} onClick={() => setActiveTab('guide')} icon={<Lightbulb className="w-6 h-6" />} label="Guide" />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: ReactNode, label: string }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 transition-all relative">
      <div className={cn("p-2 rounded-2xl transition-all", active ? "text-rose-500 bg-rose-50" : "text-stone-300 hover:text-stone-500")}>
        {icon}
      </div>
      <span className={cn("text-[8px] uppercase font-bold tracking-widest", active ? "text-rose-500" : "text-stone-300")}>{label}</span>
      {active && <motion.div layoutId="nav-dot" className="absolute -top-1 w-1 h-1 bg-rose-500 rounded-full" />}
    </button>
  );
}
