import React, { useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, User, Mic, Sparkles } from 'lucide-react';
import { AppScreen } from '../types';
import { sounds } from '../utils/sound';

interface HeaderProps {
  currentScreen: AppScreen;
  onBack?: () => void;
  showBack?: boolean;
  onOpenVoice?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onBack,
  showBack = false,
  onOpenVoice,
}) => {
  const [isMuted, setIsMuted] = useState(sounds.isMuted);

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sounds.playPack();
    }
  };
  const getSubtitle = () => {
    switch (currentScreen) {
      case 'welcome':
        return 'Smart Packing Ritual';
      case 'trip-setup':
        return 'Trip Planner';
      case 'list-preview':
        return 'List Preview';
      case 'swipe':
        return 'Decision Mode';
      case 'decision-complete':
      case 'review':
      case 'trip-complete':
        return 'Trip Summary';
      default:
        return 'Smart Packing Ritual';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#FAF9F6]/90 backdrop-blur-xl border-b border-[#0F172A]/5 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="h-16 px-4 max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={onBack}
              aria-label="Go back"
              className="w-9 h-9 -ml-1 rounded-full bg-[#F2F3FF] hover:bg-[#EAEDFF] text-[#131B2E] flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white shadow-xs p-0.5 flex items-center justify-center">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB28vuzF_RMrWuPHGrEdXIcOIwWJ0eE0cjLqYsnTEMzMZqyltQCK7NLJb-XY_nXoMBwnhEwK0H-nuIbO4UKDgIsrzN7esE8ukdEdwwuMa7jHHSFj0LvQyGli7MnwL0_pyrgOkXFhPtPOj-MvYLA2QtxoSumOwlI2kIahlwMl-hcYo0sKkk_3ISvf7bD8rZhsn6WodCpB1zfUaBtE4ZnPwGizoPw0TxRHofQsEj522rkMpQzxkLDnr77iw"
                alt="PackSwipe Brand Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[19px] font-bold text-[#131B2E] tracking-tight leading-none">
                PackSwipe
              </span>
              <span className="text-[11px] font-medium text-[#6D7A77]">
                {getSubtitle()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenVoice && (
            <button
              type="button"
              onClick={onOpenVoice}
              className="h-8 px-2.5 rounded-full bg-gradient-to-r from-[#E2E7FF] to-[#89F5E7]/30 hover:from-[#EAEDFF] hover:to-[#89F5E7]/50 text-[#00685F] border border-[#00685F]/20 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-2xs font-bold text-[11px]"
              title="Open Gemini 3.1 Flash Live Voice Assistant"
            >
              <Mic className="w-3.5 h-3.5 text-[#00685F]" />
              <span className="hidden sm:inline">Voice AI</span>
              <Sparkles className="w-3 h-3 text-[#A36700]" />
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleSound}
            aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            className="w-8 h-8 rounded-full bg-[#F2F3FF] hover:bg-[#EAEDFF] text-[#475569] hover:text-[#131B2E] flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-[#94A3B8]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#00685F]" />
            )}
          </button>

          {currentScreen === 'welcome' ? (
            <div className="flex items-center gap-1.5 bg-[#E2E7FF]/70 px-2.5 py-1 rounded-full shadow-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-[#00685F] animate-pulse"></span>
              <span className="text-[11px] font-bold text-[#00685F]">v2.4 Ready</span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#00685F] text-white flex items-center justify-center shadow-xs">
              <User className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
