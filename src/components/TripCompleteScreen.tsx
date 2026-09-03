import React, { useState } from 'react';
import {
  Plane,
  Package,
  ShoppingCart,
  Feather,
  Lightbulb,
  CheckSquare,
  PlusCircle,
  Share2,
  Check,
  Sparkles,
  Clock,
  Home,
} from 'lucide-react';
import { Trip } from '../types';
import { ConfettiCanvas } from './ConfettiCanvas';

interface TripCompleteScreenProps {
  trip: Trip;
  onViewChecklist: () => void;
  onPlanAnotherTrip: () => void;
  onStartReturnRepack?: () => void;
}

export const TripCompleteScreen: React.FC<TripCompleteScreenProps> = ({
  trip,
  onViewChecklist,
  onPlanAnotherTrip,
  onStartReturnRepack,
}) => {
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [reBurst, setReBurst] = useState(1);

  const packedItems = trip.items.filter((i) => i.status === 'pack');
  const laterItems = trip.items.filter((i) => i.status === 'later');
  const skippedItems = trip.items.filter((i) => i.status === 'skip');

  // Calculate approximate weight saved from skipped items (in lbs and kg)
  const weightSavedLbs = ((skippedItems.length * 0.75) + 0.5).toFixed(1);

  const handleShare = async () => {
    const textToShare = `🎒 PackSwipe Checklist for ${trip.name}:\n\n` +
      `✅ PACKED (${packedItems.length} items):\n` +
      packedItems.map((i) => `• ${i.name} (${i.category})`).join('\n') +
      (laterItems.length > 0
        ? `\n\n⏳ DECIDE LATER (${laterItems.length} items):\n` +
          laterItems.map((i) => `• ${i.name} (${i.category})`).join('\n')
        : '\n\n⏳ DECIDE LATER: 0 items') +
      (skippedItems.length > 0
        ? `\n\n🚫 LEFT BEHIND (${skippedItems.length} items):\n` +
          skippedItems.map((i) => `• ${i.name}`).join('\n')
        : '') +
      `\n\nPacked with PackSwipe ✨`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `PackSwipe - ${trip.name}`,
          text: textToShare,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(textToShare);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      // Ignore
    }
  };

  return (
    <div className="flex flex-col w-full px-5 pt-3 pb-28 animate-fadeIn relative overflow-hidden">
      {/* Dynamic Confetti */}
      <ConfettiCanvas key={reBurst} isActive={true} />

      {/* Top Pill Badge */}
      <div className="flex items-center justify-center mt-2 mb-3">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#E2E7FF] shadow-2xs">
          <Plane className="w-4 h-4 text-[#00685F]" />
          <span className="text-[12px] font-bold text-[#131B2E]">
            {trip.name} · All Sorted
          </span>
        </div>
      </div>

      {/* Hero Illustration */}
      <div className="relative flex items-center justify-center my-2">
        <div className="absolute w-56 h-56 rounded-full bg-[#89F5E7]/20 blur-3xl pointer-events-none -z-10"></div>
        <div
          onClick={() => setReBurst((b) => b + 1)}
          className="relative w-48 h-48 sm:w-56 sm:h-56 p-2 transition-transform duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          title="Tap for celebration confetti!"
        >
          <img
            src="https://lh3.googleusercontent.com/aida/AEtjO1X4pujguzqFMsh1v7uAueL8nDlDEyKQgBha8UDjzr1yFVIHQwx_VFrhfkqSIjSX750LApBud8pS3xzMtEM4Prn-j2R96Sngs5S5kRYXCwJXoFAsySND3UfC9Xo7GT2ZEXSjW1jycCZS9NnokXxkeZbSEfOJwThgbeeH7aSysWP7zE5LrPd0D--q7RSP95iIAeLbopMIjVjkKYYpD3qIaGrFf3UZkv8P6jDW_gOTebImjXfUJwuAmE6U3vf5"
            alt="All packed suitcase"
            className="w-full h-full object-contain drop-shadow-md select-none"
          />
          <div className="absolute top-2 right-2 bg-[#00685F] text-white w-9 h-9 rounded-full flex items-center justify-center shadow-md animate-bounce">
            <Check className="w-5 h-5 stroke-[3]" />
          </div>
        </div>
      </div>

      {/* Celebratory Copy */}
      <div className="text-center mt-1 mb-5">
        <h1 className="text-[26px] font-extrabold text-[#131B2E] tracking-tight leading-tight mb-1.5">
          You're all packed &amp; ready to fly! ✈️
        </h1>
        <p className="text-[14px] text-[#475569] max-w-xs mx-auto leading-relaxed">
          Every essential accounted for, zero dead weight, and complete peace of mind.
        </p>
      </div>

      {/* Trip Readiness Snapshot Bento */}
      <div className="bg-white border border-[#E2E8F0]/80 rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D7A77]">
            Trip Readiness Snapshot
          </span>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
            laterItems.length === 0
              ? 'text-[#00685F] bg-[#89F5E7]/30'
              : 'text-[#825100] bg-[#FEF3C7]'
          }`}>
            {laterItems.length === 0 ? '100% Sorted' : `${laterItems.length} in Decide Later`}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          {/* Stat 1: Packed */}
          <div className="bg-[#F2F3FF] rounded-xl p-3 flex flex-col items-center justify-center">
            <div className="w-7 h-7 rounded-full bg-[#00685F]/15 text-[#00685F] flex items-center justify-center mb-1">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-[20px] font-black text-[#131B2E]">{packedItems.length}</span>
            <span className="text-[11px] text-[#475569] font-medium mt-0.5">
              Items packed
            </span>
          </div>

          {/* Stat 2: Decide Later */}
          <div className={`rounded-xl p-3 flex flex-col items-center justify-center ${
            laterItems.length > 0 ? 'bg-[#FEF3C7] border border-[#FDE68A]' : 'bg-[#F2F3FF]'
          }`}>
            <div className="w-7 h-7 rounded-full bg-[#A36700]/15 text-[#A36700] flex items-center justify-center mb-1">
              <Clock className="w-4 h-4" />
            </div>
            <span className={`text-[20px] font-black ${laterItems.length > 0 ? 'text-[#825100]' : 'text-[#131B2E]'}`}>
              {laterItems.length}
            </span>
            <span className={`text-[11px] font-medium mt-0.5 ${laterItems.length > 0 ? 'text-[#825100] font-bold' : 'text-[#475569]'}`}>
              Decide Later
            </span>
          </div>

          {/* Stat 3: Left Behind */}
          <div className="bg-[#F2F3FF] rounded-xl p-3 flex flex-col items-center justify-center">
            <div className="w-7 h-7 rounded-full bg-[#DC2C4F]/15 text-[#DC2C4F] flex items-center justify-center mb-1">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <span className="text-[20px] font-black text-[#131B2E]">{skippedItems.length}</span>
            <span className="text-[11px] text-[#475569] font-medium mt-0.5">
              Left behind
            </span>
          </div>

          {/* Stat 4: Weight Saved */}
          <div className="bg-[#F2F3FF] rounded-xl p-3 flex flex-col items-center justify-center">
            <div className="w-7 h-7 rounded-full bg-[#A36700]/15 text-[#A36700] flex items-center justify-center mb-1">
              <Feather className="w-4 h-4" />
            </div>
            <span className="text-[20px] font-black text-[#131B2E]">
              {weightSavedLbs}
              <span className="text-[11px] font-normal text-[#6D7A77]"> lbs</span>
            </span>
            <span className="text-[11px] text-[#475569] font-medium mt-0.5">
              Weight saved
            </span>
          </div>
        </div>
      </div>

      {/* Dedicated Decide Later Category Summary Card */}
      <div className={`border rounded-2xl p-4 mb-4 flex items-start gap-3 shadow-2xs ${
        laterItems.length > 0
          ? 'bg-[#FEF3C7]/90 border-[#FDE68A]'
          : 'bg-[#F2F3FF] border-[#E2E7FF]'
      }`}>
        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-0.5 shadow-2xs ${
          laterItems.length > 0 ? 'bg-[#A36700] text-white' : 'bg-[#00685F] text-white'
        }`}>
          <Clock className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className={`text-[13px] font-bold ${laterItems.length > 0 ? 'text-[#825100]' : 'text-[#131B2E]'}`}>
              'Decide Later' Category
            </span>
            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs ${
              laterItems.length > 0
                ? 'bg-[#A36700] text-white'
                : 'bg-[#89F5E7]/50 text-[#00201D]'
            }`}>
              {laterItems.length} {laterItems.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className={`text-[12px] mt-1 leading-relaxed ${
            laterItems.length > 0 ? 'text-[#825100]' : 'text-[#475569]'
          }`}>
            {laterItems.length > 0
              ? `You currently have ${laterItems.length} undecided ${laterItems.length === 1 ? 'item' : 'items'} (${laterItems.map((i) => i.name).join(', ')}). You can revisit and decide on them anytime in your packing checklist.`
              : "All items have been decided! There are currently 0 items in your 'Decide Later' category."}
          </p>
        </div>
      </div>

      {/* Helpful Reminder Box */}
      <div className="bg-[#F2F3FF] border border-[#E2E7FF] rounded-2xl p-4 mb-5 flex items-start gap-3 shadow-2xs">
        <div className="w-8 h-8 rounded-full bg-[#00685F] text-white shrink-0 flex items-center justify-center mt-0.5 shadow-2xs">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[13px] font-bold text-[#131B2E] block mb-0.5">
            Departure Day Pro-Tip
          </span>
          <p className="text-[12px] text-[#475569] leading-relaxed">
            Keep PackSwipe open on travel day to check off items as they go into your bag.
          </p>
        </div>
      </div>

      {/* Action CTA Stack */}
      <div className="flex flex-col gap-2.5 w-full">
        <button
          type="button"
          onClick={onViewChecklist}
          className="w-full h-13 bg-[#00685F] hover:bg-[#005049] active:scale-[0.98] transition-all rounded-full flex items-center justify-center gap-2 text-white font-bold text-[15px] shadow-lg shadow-[#00685F]/20 cursor-pointer"
        >
          <CheckSquare className="w-5 h-5" />
          <span>View packing checklist</span>
        </button>

        {onStartReturnRepack && (
          <button
            type="button"
            onClick={onStartReturnRepack}
            className="w-full h-13 bg-[#F2F3FF] hover:bg-[#EAEDFF] border border-[#DAE2FD] active:scale-[0.98] transition-all rounded-full flex items-center justify-center gap-2 text-[#00685F] font-bold text-[15px] shadow-xs cursor-pointer"
          >
            <Home className="w-5 h-5" />
            <span>Ready to head home? Open Return Repack</span>
          </button>
        )}

        <button
          type="button"
          onClick={onPlanAnotherTrip}
          className="w-full h-13 bg-white hover:bg-[#F2F3FF] border border-[#E2E8F0] active:scale-[0.98] transition-all rounded-full flex items-center justify-center gap-2 text-[#131B2E] font-bold text-[15px] shadow-xs cursor-pointer"
        >
          <PlusCircle className="w-5 h-5 text-[#00685F]" />
          <span>Plan another trip</span>
        </button>
      </div>

      {/* Share / Export Action */}
      <div className="mt-5 text-center">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-[#475569] hover:text-[#00685F] active:opacity-75 transition-colors cursor-pointer"
        >
          {copyFeedback ? (
            <>
              <Check className="w-4 h-4 text-[#00685F]" />
              <span className="text-[13px] font-bold text-[#00685F]">
                Copied checklist to clipboard!
              </span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-[#00685F]" />
              <span className="text-[13px] font-semibold underline underline-offset-4 decoration-[#CBD5E1]">
                Export list or share with travel partner
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
