/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppScreen, NavTab, Trip, TripTemplateId, PackingItem, LuggageTier } from './types';
import { TRIP_TEMPLATES } from './data/templates';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { WelcomeScreen } from './components/WelcomeScreen';
import { TripSetupScreen } from './components/TripSetupScreen';
import { ListPreviewScreen } from './components/ListPreviewScreen';
import { AddCustomItemModal } from './components/AddCustomItemModal';
import { SwipeDecisionScreen } from './components/SwipeDecisionScreen';
import { DecisionCompleteScreen } from './components/DecisionCompleteScreen';
import { ReviewSummaryScreen } from './components/ReviewSummaryScreen';
import { TripCompleteScreen } from './components/TripCompleteScreen';
import { LiveVoiceDrawer } from './components/LiveVoiceDrawer';
import { Mic } from 'lucide-react';

const STORAGE_KEY = 'packswipe_trip_v2';

const createDefaultTrip = (
  templateId: TripTemplateId = 'beach',
  name?: string,
  luggageTier: LuggageTier = 'carryon'
): Trip => {
  const t = TRIP_TEMPLATES[templateId] || TRIP_TEMPLATES.beach;
  return {
    id: 'trip-' + Date.now(),
    name: name || t.defaultTripName,
    templateId,
    duration: t.duration,
    createdAt: new Date().toISOString(),
    isCompleted: false,
    luggageTier,
    isReturnRepackMode: false,
    items: t.items.map((item) => ({
      ...item,
      status: 'unreviewed',
      isPackedInLuggage: false,
    })),
  };
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');
  const [activeTab, setActiveTab] = useState<NavTab>('planner');
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(102);
  const [isBlitzMode, setIsBlitzMode] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.items && parsed.items.length > 0) {
          setTrip(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load saved trip', e);
    }
  }, []);

  // Save to localStorage whenever trip changes
  useEffect(() => {
    if (trip) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
      } catch (e) {
        console.warn('Failed to save trip', e);
      }
    }
  }, [trip]);

  // Sync tab with screen
  const handleTabSelect = (tab: NavTab) => {
    setActiveTab(tab);

    if (tab === 'planner') {
      if (trip && !trip.isCompleted) {
        setCurrentScreen('list-preview');
      } else {
        setCurrentScreen('welcome');
      }
    } else if (tab === 'swipe') {
      if (!trip) {
        const newTrip = createDefaultTrip('beach');
        setTrip(newTrip);
        setCurrentScreen('swipe');
      } else {
        // If unreviewed items exist, swipe those
        const hasUnreviewed = trip.items.some((i) => i.status === 'unreviewed');
        if (hasUnreviewed) {
          setCurrentScreen('swipe');
        } else {
          setCurrentScreen('decision-complete');
        }
      }
    } else if (tab === 'review') {
      if (!trip) {
        const newTrip = createDefaultTrip('beach');
        setTrip(newTrip);
      }
      setCurrentScreen('review');
    } else if (tab === 'summary') {
      if (!trip) {
        const newTrip = createDefaultTrip('beach');
        setTrip(newTrip);
      }
      if (trip?.isCompleted) {
        setCurrentScreen('trip-complete');
      } else {
        setCurrentScreen('decision-complete');
      }
    }
  };

  // Screen Transitions
  const handleStartPlanning = () => {
    setCurrentScreen('trip-setup');
    setActiveTab('planner');
  };

  const handleResumeTrip = () => {
    if (!trip) return;
    const hasUnreviewed = trip.items.some((i) => i.status === 'unreviewed');
    if (hasUnreviewed) {
      setCurrentScreen('swipe');
      setActiveTab('swipe');
    } else {
      setCurrentScreen('review');
      setActiveTab('review');
    }
  };

  const handleCreateTrip = (
    tripName: string,
    templateId: TripTemplateId,
    luggageTier: LuggageTier = 'carryon'
  ) => {
    const newTrip = createDefaultTrip(templateId, tripName, luggageTier);
    setTrip(newTrip);
    setIsBlitzMode(false);
    setCurrentScreen('list-preview');
    setActiveTab('planner');
  };

  const handleStartSwiping = () => {
    setIsBlitzMode(false);
    setCurrentScreen('swipe');
    setActiveTab('swipe');
  };

  const handleStartBlitz = () => {
    setIsBlitzMode(true);
    setCurrentScreen('swipe');
    setActiveTab('swipe');
  };

  const handleStartReturnRepack = () => {
    if (!trip) return;
    setTrip({ ...trip, isReturnRepackMode: true });
    setCurrentScreen('review');
    setActiveTab('review');
  };

  const handleFinishSwiping = (updatedItems: PackingItem[], seconds: number) => {
    if (!trip) return;
    setElapsedSeconds(seconds || 95);

    if (isBlitzMode) {
      const updatedMap = new Map(updatedItems.map((item) => [item.id, item]));
      const mergedItems = trip.items.map((item) => updatedMap.get(item.id) || item);
      const updated = {
        ...trip,
        items: mergedItems,
      };
      setTrip(updated);
      setIsBlitzMode(false);
      setCurrentScreen('review');
      setActiveTab('review');
      return;
    }

    const updated = {
      ...trip,
      items: updatedItems,
      decisionTimeSeconds: seconds,
    };
    setTrip(updated);
    setCurrentScreen('decision-complete');
    setActiveTab('summary');
  };

  const handleAddCustomItem = (newItem: Omit<PackingItem, 'status' | 'isPackedInLuggage'>) => {
    if (!trip) {
      const defaultTrip = createDefaultTrip('beach');
      defaultTrip.items.unshift({
        ...newItem,
        status: 'unreviewed',
        isPackedInLuggage: false,
      });
      setTrip(defaultTrip);
      return;
    }

    const updated = {
      ...trip,
      items: [
        {
          ...newItem,
          status: 'unreviewed' as const,
          isPackedInLuggage: false,
        },
        ...trip.items,
      ],
    };
    setTrip(updated);
  };

  const handleUpdateItems = (updatedItems: PackingItem[]) => {
    if (!trip) return;
    setTrip({ ...trip, items: updatedItems });
  };

  const handleFinishPacking = () => {
    if (!trip) return;
    const updated = { ...trip, isCompleted: true };
    setTrip(updated);
    setCurrentScreen('trip-complete');
    setActiveTab('summary');
  };

  const handleResetTrip = () => {
    if (!trip) return;
    const resetItems: PackingItem[] = trip.items.map((item) => ({
      ...item,
      status: 'unreviewed',
      isPackedInLuggage: false,
    }));
    const updated: Trip = {
      ...trip,
      items: resetItems,
      isCompleted: false,
      isReturnRepackMode: false,
      decisionTimeSeconds: undefined,
    };
    setTrip(updated);
    setIsBlitzMode(false);
    setCurrentScreen('list-preview');
    setActiveTab('planner');
  };

  const handlePlanAnotherTrip = () => {
    setCurrentScreen('trip-setup');
    setActiveTab('planner');
  };

  const handleHeaderBack = () => {
    switch (currentScreen) {
      case 'trip-setup':
        setCurrentScreen('welcome');
        break;
      case 'list-preview':
        setCurrentScreen('trip-setup');
        break;
      case 'swipe':
        setCurrentScreen('list-preview');
        setActiveTab('planner');
        break;
      case 'decision-complete':
        setCurrentScreen('swipe');
        setActiveTab('swipe');
        break;
      case 'review':
        setCurrentScreen('decision-complete');
        setActiveTab('summary');
        break;
      case 'trip-complete':
        setCurrentScreen('review');
        setActiveTab('review');
        break;
      default:
        setCurrentScreen('welcome');
    }
  };

  // Safe fallback trip for screens requiring trip data
  const currentTrip = trip || createDefaultTrip('beach');

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#131B2E] flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentScreen={currentScreen}
        onBack={handleHeaderBack}
        showBack={currentScreen !== 'welcome'}
        onOpenVoice={() => setIsVoiceOpen(true)}
      />

      {/* Main Screen Content */}
      <main className="flex-1 flex flex-col relative w-full max-w-md mx-auto pt-16 pb-20 bg-[#FAF9F6]">
        {currentScreen === 'welcome' && (
          <WelcomeScreen
            onStartPlanning={handleStartPlanning}
            activeTrip={trip}
            onResumeTrip={handleResumeTrip}
          />
        )}

        {currentScreen === 'trip-setup' && (
          <TripSetupScreen
            initialTripName={trip?.name || 'Miami Weekend Getaway'}
            initialTemplateId={trip?.templateId || 'beach'}
            onSubmit={handleCreateTrip}
            onBack={() => setCurrentScreen('welcome')}
          />
        )}

        {currentScreen === 'list-preview' && (
          <ListPreviewScreen
            trip={currentTrip}
            onBack={() => setCurrentScreen('trip-setup')}
            onStartSwiping={handleStartSwiping}
            onOpenAddCustomItem={() => setIsCustomModalOpen(true)}
          />
        )}

        {currentScreen === 'swipe' && (
          <SwipeDecisionScreen
            key={isBlitzMode ? 'blitz-deck' : 'standard-deck'}
            tripName={isBlitzMode ? `⚡ Blitz: ${currentTrip.name}` : currentTrip.name}
            items={
              isBlitzMode
                ? currentTrip.items.filter((i) => i.status === 'later')
                : currentTrip.items
            }
            onFinish={handleFinishSwiping}
            onPause={() => {
              if (isBlitzMode) {
                setIsBlitzMode(false);
                setCurrentScreen('review');
                setActiveTab('review');
              } else {
                setCurrentScreen('list-preview');
              }
            }}
            onBack={() => {
              if (isBlitzMode) {
                setIsBlitzMode(false);
                setCurrentScreen('review');
                setActiveTab('review');
              } else {
                setCurrentScreen('list-preview');
              }
            }}
            isBlitzMode={isBlitzMode}
          />
        )}

        {currentScreen === 'decision-complete' && (
          <DecisionCompleteScreen
            trip={currentTrip}
            elapsedSeconds={elapsedSeconds}
            onViewSummary={() => {
              setCurrentScreen('review');
              setActiveTab('review');
            }}
            onUndoLast={() => {
              setCurrentScreen('swipe');
              setActiveTab('swipe');
            }}
            onStartBlitz={handleStartBlitz}
          />
        )}

        {currentScreen === 'review' && (
          <ReviewSummaryScreen
            trip={currentTrip}
            onUpdateItems={handleUpdateItems}
            onFinishTrip={handleFinishPacking}
            onOpenAddItem={() => setIsCustomModalOpen(true)}
            onStartBlitz={handleStartBlitz}
            onResetTrip={handleResetTrip}
          />
        )}

        {currentScreen === 'trip-complete' && (
          <TripCompleteScreen
            trip={currentTrip}
            onViewChecklist={() => {
              setCurrentScreen('review');
              setActiveTab('review');
            }}
            onPlanAnotherTrip={handlePlanAnotherTrip}
            onStartReturnRepack={handleStartReturnRepack}
          />
        )}
      </main>

      {/* Modal: Add Custom Item */}
      <AddCustomItemModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onAddItem={handleAddCustomItem}
      />

      {/* Floating Live Voice Assistant Button */}
      <button
        type="button"
        onClick={() => setIsVoiceOpen(true)}
        className="fixed bottom-20 right-4 z-40 h-11 px-3.5 rounded-full bg-gradient-to-r from-[#00685F] to-[#00877B] hover:from-[#005049] hover:to-[#00685F] text-white font-extrabold text-[12px] shadow-lg shadow-[#00685F]/25 flex items-center gap-2 active:scale-95 transition-all cursor-pointer border border-white/20 backdrop-blur-sm"
        title="Open Gemini 3.1 Flash Live Voice Assistant"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#89F5E7] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#89F5E7]"></span>
        </span>
        <Mic className="w-3.5 h-3.5 text-white" />
        <span>Voice AI</span>
      </button>

      {/* Gemini Live Voice Drawer */}
      <LiveVoiceDrawer
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        currentTrip={trip}
      />

      {/* Persistent Bottom Navigation */}
      <BottomNav activeTab={activeTab} onSelectTab={handleTabSelect} />
    </div>
  );
}
