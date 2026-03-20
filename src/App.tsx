/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
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
  HeartHandshake
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

export default function App() {
  const [mode, setMode] = useState<Mode>('BONG_TO_OUN');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<'single' | 'both' | null>(null);
  const [history, setHistory] = useState<{source: string, target: string, mode: Mode}[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const translate = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    try {
      const isBong = mode === 'BONG_TO_OUN';
      const prompt = isBong 
        ? `Traduis cette phrase du français vers le khmer pour ma petite amie au Cambodge. 
           CONTEXTE : Je suis un homme plus âgé (Bong), elle est plus jeune (Oun). 
           Utilise un ton affectueux et naturel.`
        : `Traduis cette phrase du khmer vers le français pour mon petit ami français. 
           CONTEXTE : Je suis une femme plus jeune (Oun), il est plus âgé (Bong). 
           Garde le ton affectueux et respectueux.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `${prompt}
        
        Texte à traduire : "${inputText}"
        
        Réponds UNIQUEMENT au format JSON suivant :
        {
          "translatedText": "la traduction",
          "phonetic": "la prononciation phonétique (seulement si la cible est le khmer)",
          "explanation": "une brève explication du choix des termes (Bong/Oun)",
          "originalText": "${inputText}"
        }`,
        config: {
          responseMimeType: "application/json",
        }
      });

      const data = JSON.parse(response.text || '{}');
      setResult(data);
      setHistory(prev => [{ source: inputText, target: data.translatedText, mode }, ...prev].slice(0, 10));
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (type: 'single' | 'both') => {
    if (!result) return;
    
    let textToCopy = result.translatedText;
    if (type === 'both') {
      textToCopy = `${result.originalText}\n---\n${result.translatedText}`;
    }
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const quickPhrases = mode === 'BONG_TO_OUN' 
    ? ["Tu me manques", "Je t'aime mon amour", "Est-ce que tu as mangé ?", "Bonne nuit", "Prends soin de toi"]
    : ["Oun nirk Bong", "Oun srolanh Bong", "Bong nham bay nov?", "Reatrey sour sdei", "Moul Bong"];

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full text-center mb-6 space-y-4"
      >
        <div className="flex justify-center items-center gap-2 mb-2">
          <div className="p-2 bg-rose-100 rounded-full">
            <MessageSquareHeart className="text-rose-500 w-6 h-6" />
          </div>
          <h1 className="serif-text text-3xl font-bold text-stone-800">Bong & Oun</h1>
        </div>
        
        {/* Mode Switcher */}
        <div className="inline-flex p-1 bg-stone-100 rounded-2xl border border-stone-200">
          <button
            onClick={() => { setMode('BONG_TO_OUN'); setResult(null); setInputText(''); }}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              mode === 'BONG_TO_OUN' ? "bg-white text-rose-500 shadow-sm" : "text-stone-400 hover:text-stone-600"
            )}
          >
            <User className="w-3 h-3" /> Bong → Oun
          </button>
          <button
            onClick={() => { setMode('OUN_TO_BONG'); setResult(null); setInputText(''); }}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              mode === 'OUN_TO_BONG' ? "bg-white text-rose-500 shadow-sm" : "text-stone-400 hover:text-stone-600"
            )}
          >
            <HeartHandshake className="w-3 h-3" /> Oun → Bong
          </button>
        </div>
      </motion.header>

      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-white rounded-[32px] shadow-xl shadow-stone-200/50 border border-stone-100 overflow-hidden"
      >
        <div className="p-6 space-y-6">
          {/* Input Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 flex items-center gap-1">
                <Languages className="w-3 h-3" /> {mode === 'BONG_TO_OUN' ? 'Français' : 'Khmer'}
              </label>
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="text-stone-400 hover:text-stone-600 transition-colors"
              >
                <History className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={mode === 'BONG_TO_OUN' ? "Écris ton message..." : "សរសេរសាររបស់អ្នក..."}
              className={cn(
                "w-full h-32 p-4 bg-stone-50 rounded-2xl border-none focus:ring-2 focus:ring-rose-200 resize-none text-lg transition-all placeholder:text-stone-300",
                mode === 'OUN_TO_BONG' && "khmer-text"
              )}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  translate();
                }
              }}
            />
          </div>

          {/* Action Button */}
          <button
            onClick={translate}
            disabled={isLoading || !inputText.trim()}
            className={cn(
              "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95",
              isLoading || !inputText.trim() 
                ? "bg-stone-100 text-stone-300 cursor-not-allowed" 
                : "bg-stone-800 text-white hover:bg-stone-900 shadow-lg shadow-stone-200"
            )}
          >
            {isLoading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <Sparkles className="w-5 h-5" />
              </motion.div>
            ) : (
              <>
                <span>Traduire</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Result Section */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4 pt-4 border-t border-stone-100"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 flex items-center gap-1">
                      <ArrowRightLeft className="w-3 h-3" /> {mode === 'BONG_TO_OUN' ? 'Khmer' : 'Français'}
                    </label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => copyToClipboard('single')}
                        title="Copier la traduction"
                        className="p-2 hover:bg-stone-50 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold text-stone-400"
                      >
                        {copied === 'single' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        Traduction
                      </button>
                      <button 
                        onClick={() => copyToClipboard('both')}
                        title="Copier Source + Traduction"
                        className="p-2 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold text-rose-500"
                      >
                        {copied === 'both' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        Source + Trad
                      </button>
                    </div>
                  </div>
                  <div className="p-6 bg-rose-50/30 rounded-2xl border border-rose-100/50">
                    <p className={cn(
                      "text-stone-800 leading-relaxed text-center",
                      mode === 'BONG_TO_OUN' ? "khmer-text text-3xl" : "serif-text text-2xl"
                    )}>
                      {result.translatedText}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.phonetic && (
                    <div className="p-4 bg-stone-50 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase font-bold text-stone-400">Phonétique</span>
                      <p className="text-sm text-stone-600 italic">{result.phonetic}</p>
                    </div>
                  )}
                  <div className={cn("p-4 bg-stone-50 rounded-xl space-y-1", !result.phonetic && "md:col-span-2")}>
                    <span className="text-[10px] uppercase font-bold text-stone-400 flex items-center gap-1">
                      <Info className="w-3 h-3" /> Note culturelle
                    </span>
                    <p className="text-xs text-stone-500 leading-relaxed">{result.explanation}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Quick Phrases */}
      <div className="w-full mt-8 space-y-3">
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-stone-400 px-1">Phrases rapides</h3>
        <div className="flex flex-wrap gap-2">
          {quickPhrases.map((phrase, i) => (
            <button
              key={i}
              onClick={() => setInputText(phrase)}
              className="px-4 py-2 bg-white border border-stone-200 rounded-full text-sm text-stone-600 hover:border-rose-200 hover:text-rose-500 transition-all active:scale-95"
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>

      {/* History Drawer */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-[32px] p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="serif-text text-xl font-bold">Historique</h2>
                <button onClick={() => setShowHistory(false)} className="text-stone-400">Fermer</button>
              </div>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {history.length === 0 ? (
                  <p className="text-center text-stone-400 py-8">Aucun historique</p>
                ) : (
                  history.map((item, i) => (
                    <div key={i} className="p-4 bg-stone-50 rounded-2xl space-y-1 group cursor-pointer" onClick={() => {
                      setInputText(item.source);
                      setMode(item.mode);
                      setShowHistory(false);
                    }}>
                      <p className="text-[10px] text-stone-400 uppercase font-bold">{item.mode === 'BONG_TO_OUN' ? 'Bong → Oun' : 'Oun → Bong'}</p>
                      <p className="text-xs text-stone-400 line-clamp-1">{item.source}</p>
                      <p className="text-sm text-stone-700 font-medium">{item.target}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-auto py-8 text-stone-300 text-[10px] uppercase tracking-widest flex items-center gap-2">
        Fait avec <Heart className="w-3 h-3 fill-stone-300" /> pour Bong & Oun
      </footer>
    </div>
  );
}
