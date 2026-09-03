import React from 'react';
import { ArrowRight, Luggage, Sparkles, Timer, CheckCircle2 } from 'lucide-react';
import { Trip } from '../types';

interface WelcomeScreenProps {
  onStartPlanning: () => void;
  activeTrip: Trip | null;
  onResumeTrip: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartPlanning,
  activeTrip,
  onResumeTrip,
}) => {
  return (
    <div className="flex flex-col w-full px-5 pt-4 pb-28 animate-fadeIn">
      {/* Visual Stage with Ambient Aura */}
      <div className="relative w-full aspect-square max-w-[320px] mx-auto my-2 flex items-center justify-center">
        <div className="absolute inset-4 rounded-full bg-[#89F5E7]/25 filter blur-3xl transform scale-95 pointer-events-none"></div>
        <div className="relative w-full h-full p-2 flex items-center justify-center">
          <img
            src="https://lh3.googleusercontent.com/aida/AEtjO1XG_WM_mOogOqfsL_d4Yj1GKomPsTYHwLApfkR7npKRw2ocPPm0No2UzU5-SriduIZ5wCKB-GCn8YHbDzuxD-ZIwCuC_kMPtx3beIZUgs4LiuzRR1-PX1QSUNgZP0Ipi5hdGFQ-cnVOnk3ufbGRQypn28g81aUw7_9cAEqfz4tTWwvTbYYnfJ--aiw9i9B9dUyvb4e4ILftzKrWCVMt3HXeo4XYUDZAFZUyIjWdn_rg25icoMPmAE15c_XS"
            alt="Open Suitcase Essentials Illustration"
            className="w-full h-full object-contain drop-shadow-md transform transition-transform duration-500 hover:scale-105"
          />
        </div>

        {/* Float tags */}
        <div className="absolute top-2 right-2 bg-white shadow-md rounded-full px-3 py-1 flex items-center gap-1.5 text-[#825100]">
          <Timer className="w-4 h-4 text-[#A36700]" />
          <span className="text-[12px] font-bold">&lt; 3 mins</span>
        </div>

        <div className="absolute bottom-2 left-2 bg-white shadow-md rounded-full px-3 py-1 flex items-center gap-1.5 text-[#00685F]">
          <CheckCircle2 className="w-4 h-4 text-[#00685F]" />
          <span className="text-[12px] font-bold">12 Essentials</span>
        </div>
      </div>

      {/* Copy */}
      <div className="flex flex-col items-center text-center mt-3">
        <h1 className="text-[26px] sm:text-[28px] font-extrabold text-[#131B2E] tracking-tight leading-tight max-w-[340px]">
          Packing made quick, calm &amp; stress-free.
        </h1>
        <p className="text-[15px] text-[#475569] mt-2.5 leading-relaxed max-w-[330px]">
          No more blank-page overwhelm or overpacking. Start with an opinionated, ready-made list and swipe through one decision at a time in under 3 minutes.
        </p>
      </div>

      {/* Value Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 my-5">
        <div className="flex items-center gap-1.5 bg-[#F2F3FF] px-3 py-1.5 rounded-full shadow-2xs">
          <span className="text-[12px] font-semibold text-[#131B2E]">⚡ Quick 1-by-1 decisions</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#F2F3FF] px-3 py-1.5 rounded-full shadow-2xs">
          <span className="text-[12px] font-semibold text-[#131B2E]">🎒 Curated templates</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#F2F3FF] px-3 py-1.5 rounded-full shadow-2xs">
          <span className="text-[12px] font-semibold text-[#131B2E]">✨ Zero overpacking</span>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col items-center w-full mt-1 gap-3">
        {activeTrip ? (
          <div className="w-full flex flex-col gap-2.5 max-w-xs">
            <button
              onClick={onResumeTrip}
              className="w-full h-[54px] rounded-full bg-[#00685F] text-white font-bold text-[16px] shadow-md hover:bg-[#005049] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Resume "{activeTrip.name}"</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={onStartPlanning}
              className="w-full h-[46px] rounded-full bg-[#F2F3FF] text-[#131B2E] font-semibold text-[14px] hover:bg-[#EAEDFF] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Start new trip</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onStartPlanning}
            className="w-full max-w-xs h-[54px] rounded-full bg-[#00685F] text-white font-bold text-[16px] shadow-md hover:bg-[#005049] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Plan a trip</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        )}

        <div className="flex items-center gap-1.5 text-[#6D7A77] text-[12px] mt-0.5">
          <Luggage className="w-4 h-4 text-[#00685F]" />
          <span>Starts with a tailored 12-item essential pack.</span>
        </div>
      </div>

      {/* Tinder for Suitcase micro-explainer */}
      <div className="mt-7 bg-white border border-[#E2E8F0]/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#89F5E7]/30 text-[#00685F] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[13px] font-bold text-[#131B2E]">Tinder for your suitcase</span>
            <span className="text-[12px] text-[#6D7A77]">Swipe right to pack, left to ditch</span>
          </div>
        </div>

        <div className="flex items-center -space-x-1 shrink-0">
          <span className="w-6 h-6 rounded-full bg-[#B90538] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">✕</span>
          <span className="w-6 h-6 rounded-full bg-[#FFB95F] text-[#2A1700] flex items-center justify-center text-[10px] font-bold shadow-xs">?</span>
          <span className="w-7 h-7 rounded-full bg-[#00685F] text-white flex items-center justify-center text-[11px] font-bold shadow-xs">✓</span>
        </div>
      </div>
    </div>
  );
};
