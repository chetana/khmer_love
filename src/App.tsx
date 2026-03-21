/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Languages, Star, BookOpen, Lightbulb } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

import type { Mode, Tab } from './types';
import { speak, generateWordOfDay } from './lib/gemini';
import { useToast } from './hooks/useToast';
import { useFavorites } from './hooks/useFavorites';
import { ToastContainer } from './components/Toast';
import { NavButton } from './components/NavButton';
import { Header } from './components/Header';
import { WordOfDayCard } from './components/WordOfDay';
import { TranslateTab } from './components/tabs/TranslateTab';
import { FavoritesTab } from './components/tabs/FavoritesTab';
import { LearnTab } from './components/tabs/LearnTab';
import { GuideTab } from './components/tabs/GuideTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('translate');
  const [mode, setMode] = useState<Mode>('BONG_TO_OUN');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [wordOfDay, setWordOfDay] = useState<{ fr: string; kh: string; phon: string } | null>(null);

  const { toasts, showToast } = useToast();
  const { favorites, history, toggleFavorite, isFavorite, addToHistory } = useFavorites();

  useEffect(() => {
    generateWordOfDay()
      .then(setWordOfDay)
      .catch(() => showToast('Impossible de charger le mot du jour'));
  }, []);

  const handleSpeak = async (text: string, lang: 'kh' | 'fr') => {
    if (isSpeaking || !text) return;
    setIsSpeaking(true);
    try {
      await speak(text, lang);
    } catch {
      showToast('Erreur audio. Réessaie dans un instant.');
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
  };

  return (
    <div className="min-h-screen bg-[#fdfcf8] flex flex-col max-w-2xl mx-auto border-x border-stone-100 shadow-2xl">
      <ToastContainer toasts={toasts} />

      <Header mode={mode} onModeChange={handleModeChange} />

      {/* Word of the Day - only on translate tab */}
      {activeTab === 'translate' && wordOfDay && (
        <div className="px-4 pt-2">
          <WordOfDayCard
            word={wordOfDay}
            isSpeaking={isSpeaking}
            onSpeak={() => handleSpeak(wordOfDay.kh, 'kh')}
          />
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-4 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'translate' && (
            <TranslateTab
              mode={mode}
              wordOfDay={wordOfDay}
              isSpeaking={isSpeaking}
              isFavorite={isFavorite}
              onSpeak={handleSpeak}
              onToggleFavorite={toggleFavorite}
              onAddHistory={(source, target, phonetic, m) =>
                addToHistory({ source, target, phonetic, mode: m })
              }
              onError={showToast}
            />
          )}
          {activeTab === 'favorites' && (
            <FavoritesTab
              favorites={favorites}
              history={history}
              isSpeaking={isSpeaking}
              onSpeak={handleSpeak}
              onToggleFavorite={toggleFavorite}
            />
          )}
          {activeTab === 'learn' && (
            <LearnTab
              wordOfDay={wordOfDay}
              isSpeaking={isSpeaking}
              onSpeak={handleSpeak}
            />
          )}
          {activeTab === 'guide' && <GuideTab />}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white/80 backdrop-blur-xl border-t border-stone-100 px-6 py-4 flex justify-between items-center z-40">
        <NavButton
          active={activeTab === 'translate'}
          onClick={() => setActiveTab('translate')}
          icon={<Languages className="w-6 h-6" />}
          label="Trad"
        />
        <NavButton
          active={activeTab === 'favorites'}
          onClick={() => setActiveTab('favorites')}
          icon={<Star className="w-6 h-6" />}
          label="Favoris"
        />
        <NavButton
          active={activeTab === 'learn'}
          onClick={() => setActiveTab('learn')}
          icon={<BookOpen className="w-6 h-6" />}
          label="Apprendre"
        />
        <NavButton
          active={activeTab === 'guide'}
          onClick={() => setActiveTab('guide')}
          icon={<Lightbulb className="w-6 h-6" />}
          label="Guide"
        />
      </nav>
    </div>
  );
}
