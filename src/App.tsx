/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Languages, Star, BookOpen, Lightbulb } from 'lucide-react';

import type { FamilyRelationship, Direction, Tab } from './types';
import { RELATIONSHIPS } from './lib/relationships';
import { speak, generateWordOfDay, ensureAudioUnlocked } from './lib/gemini';
import { useToast } from './hooks/useToast';
import { useFavorites } from './hooks/useFavorites';
import { ToastContainer } from './components/Toast';
import { NavButton } from './components/NavButton';
import { APP_VERSION } from './version';
import { Header } from './components/Header';
import { RelationshipPicker } from './components/RelationshipPicker';
import { TranslateTab } from './components/tabs/TranslateTab';
import { FavoritesTab } from './components/tabs/FavoritesTab';
import { LearnTab } from './components/tabs/LearnTab';
import { GuideTab } from './components/tabs/GuideTab';

function loadRelationship(): FamilyRelationship {
  try {
    const saved = localStorage.getItem('khmer_relationship_id');
    if (saved) {
      const found = RELATIONSHIPS.find((r) => r.id === saved);
      if (found) return found;
    }
  } catch {}
  return RELATIONSHIPS[0];
}

function loadDirection(): Direction {
  try {
    const saved = localStorage.getItem('khmer_direction') as Direction | null;
    if (saved === 'FR_TO_KH' || saved === 'KH_TO_FR') return saved;
  } catch {}
  return 'FR_TO_KH';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('translate');
  const [relationship, setRelationship] = useState<FamilyRelationship>(loadRelationship);
  const [direction, setDirection] = useState<Direction>(loadDirection);
  const [showPicker, setShowPicker] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [wordOfDay, setWordOfDay] = useState<{ fr: string; kh: string; phon: string } | null>(null);
  const [isRefreshingWord, setIsRefreshingWord] = useState(false);

  const { toasts, showToast } = useToast();
  const { favorites, history, toggleFavorite, isFavorite, addToHistory } = useFavorites();

  useEffect(() => {
    generateWordOfDay()
      .then(setWordOfDay)
      .catch(() => showToast('Impossible de charger le mot du jour'));
  }, []);

  const handleRefreshWord = async () => {
    setIsRefreshingWord(true);
    try {
      const word = await generateWordOfDay(true);
      setWordOfDay(word);
    } catch {
      showToast('Impossible de charger une nouvelle expression');
    } finally {
      setIsRefreshingWord(false);
    }
  };

  const handleSelectRelationship = (r: FamilyRelationship) => {
    setRelationship(r);
    localStorage.setItem('khmer_relationship_id', r.id);
  };

  const handleToggleDirection = () => {
    const next: Direction = direction === 'FR_TO_KH' ? 'KH_TO_FR' : 'FR_TO_KH';
    setDirection(next);
    localStorage.setItem('khmer_direction', next);
  };

  const handleSpeak = async (text: string, lang: 'kh' | 'fr') => {
    if (isSpeaking || !text) return;
    ensureAudioUnlocked();
    setIsSpeaking(true);
    try {
      await speak(text, lang);
    } catch {
      showToast('Erreur audio. Réessaie dans un instant.');
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FDFB] flex flex-col max-w-2xl mx-auto border-x border-stone-100 shadow-2xl">
      <ToastContainer toasts={toasts} />

      {showPicker && (
        <RelationshipPicker
          current={relationship}
          onSelect={handleSelectRelationship}
          onClose={() => setShowPicker(false)}
        />
      )}

      <Header
        relationship={relationship}
        onOpenPicker={() => setShowPicker(true)}
      />

      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {/* Tabs are always mounted to preserve state (chat history, quiz, translation results) */}
        <div className={activeTab === 'translate' ? undefined : 'hidden'}>
          <TranslateTab
            relationship={relationship}
            direction={direction}
            isSpeaking={isSpeaking}
            isFavorite={isFavorite}
            wordOfDay={wordOfDay}
            isRefreshingWord={isRefreshingWord}
            onSpeak={handleSpeak}
            onRefreshWord={handleRefreshWord}
            onToggleFavorite={toggleFavorite}
            onAddHistory={(source, target, phonetic, explanation) =>
              addToHistory({ source, target, phonetic, explanation, relationshipId: relationship.id, direction })
            }
            onError={showToast}
          />
        </div>
        <div className={activeTab === 'favorites' ? undefined : 'hidden'}>
          <FavoritesTab
            favorites={favorites}
            history={history}
            isSpeaking={isSpeaking}
            onSpeak={handleSpeak}
            onToggleFavorite={toggleFavorite}
          />
        </div>
        <div className={activeTab === 'learn' ? undefined : 'hidden'}>
          <LearnTab
            wordOfDay={wordOfDay}
            isSpeaking={isSpeaking}
            onSpeak={handleSpeak}
          />
        </div>
        <div className={activeTab === 'guide' ? undefined : 'hidden'}>
          <GuideTab />
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white/80 backdrop-blur-xl border-t border-stone-100 px-6 pt-4 pb-2 flex flex-col items-center z-40">
        <div className="flex justify-between items-center w-full">
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
          label="Historique"
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
        </div>
        <span className="text-[0.55rem] font-mono text-stone-300 mt-1">v{APP_VERSION}</span>
      </nav>
    </div>
  );
}
