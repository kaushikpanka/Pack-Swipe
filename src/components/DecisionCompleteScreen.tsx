import React from 'react';
import {
  PieChart,
  CheckCircle2,
  Clock,
  MinusCircle,
  ArrowRight,
  RotateCcw,
  Smile,
  Check,
  Zap,
} from 'lucide-react';
import { Trip } from '../types';

interface DecisionCompleteScreenProps {
  trip: Trip;
  elapsedSeconds?: number;
  onViewSummary: () => void;
  onUndoLast: () => void;
  onStartBlitz?: () => void;
}

export const DecisionCompleteScreen: React.FC<DecisionCompleteScreenProps> = ({
  trip,
  elapsedSeconds = 94,
  onViewSummary,
  onUndoLast,
  onStartBlitz,
}) => {
  const total = trip.items.length;
  const packedCount = trip.items.filter((i) => i.status === 'pack').length;
  const laterCount = trip.items.filter((i) => i.status === 'later').length;
  const skipCount = trip.items.filter((i) => i.status === 'skip').length;

  const packedPercent = Math.round((packedCount / Math.max(total, 1)) * 100);
  const laterPercent = Math.round((laterCount / Math.max(total, 1)) * 100);
  const skipPercent = Math.round((skipCount / Math.max(total, 1)) * 100);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    if (mins === 0) return `${remaining} sec`;
    return `${mins} min ${remaining} sec`;
  };

  const lastItem = trip.items[trip.items.length - 1];

  return (
    <div className="flex flex-col w-full px-5 pt-4 pb-28 animate-fadeIn">
      {/* Hero Visual Stage */}
      <div className="relative flex flex-col items-center justify-center pt-2 mb-4">
        <div className="absolute w-52 h-52 rounded-full bg-[#89F5E7]/20 blur-3xl pointer-events-none -z-10"></div>
        <div className="relative w-44 h-44 flex items-center justify-center">
          <img
            src="https://lh3.googleusercontent.com/aida/AEtjO1X4pujguzqFMsh1v7uAueL8nDlDEyKQgBha8UDjzr1yFVIHQwx_VFrhfkqSIjSX750LApBud8pS3xzMtEM4Prn-j2R96Sngs5S5kRYXCwJXoFAsySND3UfC9Xo7GT2ZEXSjW1jycCZS9NnokXxkeZbSEfOJwThgbeeH7aSysWP7zE5LrPd0D--q7RSP95iIAeLbopMIjVjkKYYpD3qIaGrFf3UZkv8P6jDW_gOTebImjXfUJwuAmE6U3vf5"
            alt="Packed Suitcase Completed"
            className="w-full h-full object-contain drop-shadow-md"
          />
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-md flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-[#00685F] flex items-center justify-center text-white shadow-xs">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
          </div>
        </div>

        {/* Headlines */}
        <div className="text-center mt-4 max-w-xs">
          <h1 className="text-[24px] font-extrabold text-[#131B2E] tracking-tight">
            Your packing decisions are in! 🎉
          </h1>
          <p className="text-[14px] text-[#475569] mt-1 leading-relaxed">
            All {total} items categorized in{' '}
            <span className="font-bold text-[#131B2E]">{formatTime(elapsedSeconds)}</span>. No
            second-guessing.
          </p>
        </div>
      </div>

      {/* Decisions Breakdown Card */}
      <section className="bg-white border border-[#E2E8F0]/80 rounded-2xl p-4 shadow-sm mb-4 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[#00685F]" />
            <span className="text-[15px] font-bold text-[#131B2E]">Decisions Breakdown</span>
          </div>
          <span className="text-[11px] bg-[#F2F3FF] px-2.5 py-0.5 rounded-full text-[#475569] font-bold">
            {total} items total
          </span>
        </div>

        {/* Segmented Bar */}
        <div className="w-full h-3 bg-[#F2F3FF] rounded-full overflow-hidden flex p-0.5 gap-0.5">
          <div
            className="h-full bg-[#00685F] rounded-full transition-all duration-700"
            style={{ width: `${Math.max(packedPercent, 5)}%` }}
            title={`${packedCount} Packed`}
          ></div>
          <div
            className="h-full bg-[#A36700] rounded-full transition-all duration-700"
            style={{ width: `${Math.max(laterPercent, 5)}%` }}
            title={`${laterCount} To Decide`}
          ></div>
          <div
            className="h-full bg-[#DC2C4F] rounded-full transition-all duration-700"
            style={{ width: `${Math.max(skipPercent, 5)}%` }}
            title={`${skipCount} Left Out`}
          ></div>
        </div>

        {/* 3-Column Stats */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="flex flex-col items-center p-2.5 rounded-xl bg-[#F2F3FF] text-center">
            <div className="w-7 h-7 rounded-full bg-[#00685F]/15 text-[#00685F] flex items-center justify-center mb-1">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[20px] font-black text-[#131B2E]">{packedCount}</span>
            <span className="text-[11px] text-[#475569] font-semibold">Packed</span>
          </div>

          <div className="flex flex-col items-center p-2.5 rounded-xl bg-[#F2F3FF] text-center">
            <div className="w-7 h-7 rounded-full bg-[#A36700]/15 text-[#A36700] flex items-center justify-center mb-1">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[20px] font-black text-[#131B2E]">{laterCount}</span>
            <span className="text-[11px] text-[#475569] font-semibold">Decide Later</span>
          </div>

          <div className="flex flex-col items-center p-2.5 rounded-xl bg-[#F2F3FF] text-center">
            <div className="w-7 h-7 rounded-full bg-[#DC2C4F]/15 text-[#DC2C4F] flex items-center justify-center mb-1">
              <MinusCircle className="w-4 h-4" />
            </div>
            <span className="text-[20px] font-black text-[#131B2E]">{skipCount}</span>
            <span className="text-[11px] text-[#475569] font-semibold">Left Out</span>
          </div>
        </div>

        {/* Readiness Metric Row */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F2F3FF]/70">
          <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
            <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" fill="none" stroke="#E2E7FF" strokeWidth="4" />
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="#00685F"
                strokeWidth="4"
                strokeDasharray="113.1"
                strokeDashoffset={113.1 - (113.1 * packedPercent) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[11px] font-extrabold text-[#131B2E]">
              {packedPercent}%
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-bold text-[#131B2E] truncate">
              {packedPercent}% Confirmed Packed
            </span>
            <span className="text-[12px] text-[#475569]">
              {laterCount > 0
                ? `${laterCount} item${laterCount > 1 ? 's' : ''} pending quick review`
                : 'All decisions completed!'}
            </span>
          </div>
        </div>
      </section>

      {/* Encouragement Callout */}
      <div className="flex items-start gap-3 p-3.5 bg-[#E2E7FF]/70 rounded-2xl mb-5">
        <div className="w-8 h-8 rounded-full bg-[#00685F] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
          <Smile className="w-4 h-4" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[13px] font-bold text-[#131B2E]">
            {laterCount > 0 ? 'Nearly Departure Ready!' : 'Ready for Adventure!'}
          </span>
          <p className="text-[12px] text-[#475569] mt-0.5">
            {laterCount > 0
              ? `You're nearly departure ready. Just ${laterCount} quick call${
                  laterCount > 1 ? 's' : ''
                } left in your summary.`
              : "Zero overpacking, clear luggage inventory, and complete peace of mind."}
          </p>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-col items-center gap-2.5 w-full">
        {laterCount > 0 && onStartBlitz && (
          <button
            type="button"
            onClick={onStartBlitz}
            className="w-full h-12 bg-[#A36700] hover:bg-[#825100] text-white rounded-full font-bold text-[15px] flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>⚡ Quick Blitz {laterCount} in Decide Later</span>
          </button>
        )}

        <button
          type="button"
          onClick={onViewSummary}
          className="w-full h-14 bg-[#00685F] text-white rounded-full font-bold text-[16px] flex items-center justify-center gap-2 shadow-lg shadow-[#00685F]/20 hover:bg-[#005049] active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>View my packing summary</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onUndoLast}
          className="h-11 px-4 text-[#475569] hover:text-[#131B2E] text-[13px] font-semibold flex items-center gap-1.5 rounded-full hover:bg-[#F2F3FF] active:scale-95 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Undo last decision ({lastItem?.name || 'Previous item'})</span>
        </button>
      </div>
    </div>
  );
};
