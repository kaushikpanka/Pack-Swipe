import React from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  Sparkles,
  Plus,
  MoreVertical,
  Zap,
  Layers,
} from 'lucide-react';
import { Trip } from '../types';
import { TRIP_TEMPLATES } from '../data/templates';

interface ListPreviewScreenProps {
  trip: Trip;
  onBack: () => void;
  onStartSwiping: () => void;
  onOpenAddCustomItem: () => void;
}

export const ListPreviewScreen: React.FC<ListPreviewScreenProps> = ({
  trip,
  onBack,
  onStartSwiping,
  onOpenAddCustomItem,
}) => {
  const template = TRIP_TEMPLATES[trip.templateId] || TRIP_TEMPLATES.beach;

  // Group items by category
  const categories = Array.from(new Set(trip.items.map((i) => i.category)));

  return (
    <div className="flex flex-col w-full px-5 pt-3 pb-32 animate-fadeIn">
      {/* Trip Context Header */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 -ml-1 rounded-full bg-[#F2F3FF] hover:bg-[#EAEDFF] text-[#131B2E] flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[19px] font-bold text-[#131B2E] tracking-tight">
                {trip.name}
              </span>
              <BadgeCheck className="w-4 h-4 text-[#00685F] fill-[#89F5E7]" />
            </div>
            <p className="text-[12px] text-[#475569]">
              {trip.duration || template.duration}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-[#E2E7FF] text-[#00685F] px-3 py-1.5 rounded-full shadow-2xs">
          <span className="text-[13px]">
            {trip.templateId === 'beach' ? '🏖️' : trip.templateId === 'business' ? '💼' : '☕'}
          </span>
          <span className="text-[12px] font-bold tracking-tight">
            {template.title}
          </span>
        </div>
      </div>

      {/* Summary Banner Card */}
      <div className="relative overflow-hidden bg-white border border-[#E2E8F0]/80 rounded-2xl p-4 shadow-sm mt-3">
        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-1.5 max-w-[72%]">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#89F5E7]/40 text-[#00201D] text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#00685F]" />
              <span>Curated For You</span>
            </div>
            <h2 className="text-[20px] font-bold text-[#131B2E] leading-snug">
              {trip.items.length} essentials picked for your {template.title} trip
            </h2>
            <p className="text-[12px] text-[#475569] leading-relaxed">
              Swipe through each card to decide what stays, what drops, or what needs a quick rethink.
            </p>
          </div>

          {/* Ambient Gauge */}
          <div className="relative flex items-center justify-center w-14 h-14 shrink-0 mt-1">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="transparent"
                stroke="#E2E7FF"
                strokeWidth="4.5"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="transparent"
                stroke="#00685F"
                strokeWidth="4.5"
                strokeDasharray="125.6"
                strokeDashoffset="25"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[14px] font-extrabold text-[#00685F] leading-none">
                {trip.items.length}
              </span>
              <span className="text-[9px] font-semibold text-[#6D7A77]">items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Custom Item Banner */}
      <div className="mt-3 group relative overflow-hidden rounded-2xl bg-[#F2F3FF] border border-[#E2E7FF] p-3.5 transition-all">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-white text-[#00685F] flex items-center justify-center shrink-0 shadow-2xs">
              <Plus className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[14px] font-bold text-[#131B2E] truncate">
                Packing a special favorite?
              </h3>
              <p className="text-[12px] text-[#475569] truncate">
                Add snorkel, kindle, or personal gear
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenAddCustomItem}
            className="shrink-0 bg-[#00685F] text-white px-3.5 py-1.5 rounded-full text-[12px] font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Grouped Categories & Items */}
      <div className="mt-5 space-y-4">
        {categories.map((cat, catIdx) => {
          const categoryItems = trip.items.filter((i) => i.category === cat);
          return (
            <div key={cat} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      catIdx % 3 === 0
                        ? 'bg-[#00685F]'
                        : catIdx % 3 === 1
                        ? 'bg-[#A36700]'
                        : 'bg-[#DC2C4F]'
                    }`}
                  ></span>
                  <span className="text-[12px] font-bold uppercase tracking-wider text-[#131B2E]">
                    {cat}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#475569] bg-[#E2E7FF] px-2 py-0.5 rounded-full">
                  {categoryItems.length}
                </span>
              </div>

              <div className="bg-white border border-[#E2E8F0]/80 rounded-2xl shadow-xs divide-y divide-[#F2F3FF] overflow-hidden">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 hover:bg-[#F2F3FF]/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#F2F3FF] flex items-center justify-center text-[#00685F] shrink-0">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold text-[#131B2E] truncate">
                          {item.name}
                        </p>
                        <p className="text-[12px] text-[#6D7A77] truncate">
                          {item.note}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.isCustom && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-[#E2E7FF] text-[#00685F] px-2 py-0.5 rounded-full">
                          Custom
                        </span>
                      )}
                      <button
                        type="button"
                        aria-label="Options"
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[#6D7A77] hover:bg-[#F2F3FF]"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Destination Photo Vignette */}
      <div className="mt-5 rounded-2xl overflow-hidden shadow-xs relative h-28 w-full">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('${template.destinationPreview.bgImage}')`,
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#131B2E]/80 via-[#131B2E]/40 to-transparent flex items-center px-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#89F5E7]">
              {template.destinationPreview.location}
            </span>
            <p className="text-[18px] font-bold text-white">
              {template.destinationPreview.weather}
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Call to Action */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto px-5 py-2.5 bg-[#FAF9F6]/95 backdrop-blur-md z-40 border-t border-[#0F172A]/5">
        <button
          type="button"
          onClick={onStartSwiping}
          className="w-full h-14 bg-[#00685F] text-white rounded-full font-bold text-[16px] flex items-center justify-center gap-2 shadow-lg shadow-[#00685F]/20 hover:bg-[#005049] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Zap className="w-5 h-5 fill-current" />
          <span>Start swiping ({trip.items.length} items)</span>
        </button>
      </div>
    </div>
  );
};
