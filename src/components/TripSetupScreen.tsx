import React, { useState } from 'react';
import {
  MapPin,
  X,
  Compass,
  Sun,
  Briefcase,
  Coffee,
  Check,
  ArrowRight,
  Info,
  Package,
} from 'lucide-react';
import { TripTemplateId, LuggageTier } from '../types';
import { TRIP_TEMPLATES } from '../data/templates';
import { Scale } from 'lucide-react';

interface TripSetupScreenProps {
  initialTripName?: string;
  initialTemplateId?: TripTemplateId;
  initialLuggageTier?: LuggageTier;
  onSubmit: (tripName: string, templateId: TripTemplateId, luggageTier: LuggageTier) => void;
  onBack: () => void;
}

export const TripSetupScreen: React.FC<TripSetupScreenProps> = ({
  initialTripName = 'Miami Weekend Getaway',
  initialTemplateId = 'beach',
  initialLuggageTier = 'carryon',
  onSubmit,
  onBack,
}) => {
  const [tripName, setTripName] = useState(initialTripName);
  const [selectedTemplate, setSelectedTemplate] = useState<TripTemplateId>(initialTemplateId);
  const [luggageTier, setLuggageTier] = useState<LuggageTier>(initialLuggageTier);

  const handleTemplateSelect = (id: TripTemplateId) => {
    setSelectedTemplate(id);
    // If the trip name is default or empty, auto-populate with the template's suggested default
    if (!tripName || tripName === TRIP_TEMPLATES[selectedTemplate]?.defaultTripName) {
      setTripName(TRIP_TEMPLATES[id].defaultTripName);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = tripName.trim() || TRIP_TEMPLATES[selectedTemplate].defaultTripName;
    onSubmit(finalName, selectedTemplate, luggageTier);
  };

  const getTemplateIcon = (id: TripTemplateId) => {
    switch (id) {
      case 'beach':
        return <Sun className="w-6 h-6 text-white" />;
      case 'business':
        return <Briefcase className="w-6 h-6 text-[#131B2E]" />;
      case 'weekend':
        return <Coffee className="w-6 h-6 text-[#131B2E]" />;
    }
  };

  return (
    <div className="flex flex-col w-full px-5 pt-3 pb-28 animate-fadeIn">
      {/* Step Header */}
      <div className="flex items-center justify-between py-1">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 -ml-1 rounded-full bg-[#F2F3FF] hover:bg-[#EAEDFF] text-[#131B2E] flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[11px] font-bold text-[#00685F] uppercase tracking-wider">
            Step 1 of 2
          </span>
          <div className="w-24 h-1.5 bg-[#DAE2FD] rounded-full overflow-hidden flex">
            <div className="w-1/2 h-full bg-[#00685F] rounded-full transition-all duration-500"></div>
            <div className="w-1/2 h-full bg-transparent"></div>
          </div>
        </div>
      </div>

      {/* Screen Title */}
      <div className="space-y-1 mt-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E2E7FF] text-[#00685F] text-[12px] font-bold">
          <Compass className="w-3.5 h-3.5" />
          <span>Smart Setup</span>
        </div>
        <h1 className="text-[24px] font-extrabold text-[#131B2E] tracking-tight">
          Where are you headed?
        </h1>
        <p className="text-[14px] text-[#475569]">
          Give your trip a name and pick a curated starter template.
        </p>
      </div>

      {/* Trip Name Field */}
      <div className="mt-4 space-y-1.5">
        <label
          htmlFor="trip-name-input"
          className="text-[13px] font-bold text-[#131B2E] tracking-tight"
        >
          Trip Name
        </label>
        <div className="relative flex items-center">
          <div className="absolute left-3.5 flex items-center pointer-events-none text-[#00685F]">
            <MapPin className="w-5 h-5 fill-[#00685F]" />
          </div>
          <input
            id="trip-name-input"
            type="text"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            placeholder="e.g. Miami Weekend Getaway"
            className="w-full h-13 pl-11 pr-11 bg-[#F2F3FF] focus:bg-white rounded-2xl text-[#131B2E] font-medium text-[15px] border border-transparent focus:border-[#00685F]/30 focus:outline-none transition-all shadow-xs"
          />
          {tripName && (
            <button
              type="button"
              onClick={() => setTripName('')}
              className="absolute right-3 w-7 h-7 rounded-full bg-[#E2E7FF] text-[#475569] hover:text-[#131B2E] flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Template Selection */}
      <div className="pt-4 flex items-center justify-between">
        <span className="text-[13px] font-bold text-[#131B2E]">
          Choose a packing template
        </span>
        <span className="text-[12px] text-[#00685F] font-semibold">
          3 curated decks
        </span>
      </div>

      <div className="mt-2.5 space-y-3" role="radiogroup">
        {(['beach', 'business', 'weekend'] as TripTemplateId[]).map((id) => {
          const t = TRIP_TEMPLATES[id];
          const isSelected = selectedTemplate === id;

          return (
            <div
              key={id}
              onClick={() => handleTemplateSelect(id)}
              role="radio"
              aria-checked={isSelected}
              className={`relative overflow-hidden rounded-2xl p-4 cursor-pointer transition-all duration-200 border ${
                isSelected
                  ? 'bg-[#89F5E7]/20 border-[#00685F]/40 shadow-sm'
                  : 'bg-[#F2F3FF] border-transparent hover:bg-[#EAEDFF]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${
                      isSelected ? 'bg-[#00685F]' : 'bg-[#E2E7FF]'
                    }`}
                  >
                    {id === 'beach' ? (
                      <Sun className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-[#131B2E]'}`} />
                    ) : id === 'business' ? (
                      <Briefcase className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-[#131B2E]'}`} />
                    ) : (
                      <Coffee className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-[#131B2E]'}`} />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[18px] font-bold text-[#131B2E] leading-tight">
                        {t.title}
                      </h3>
                      {isSelected && (
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#00685F] text-white">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-[#00685F] text-[11px] font-bold shadow-2xs">
                      <Package className="w-3 h-3" />
                      <span>{t.itemCount} curated items</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[13px] text-[#475569] mt-2.5 leading-relaxed">
                {t.tagline}
              </p>

              {/* Visual Accent Mini-Gallery */}
              <div className="mt-3 pt-2.5 flex items-center gap-2 border-t border-[#0F172A]/5">
                {t.sampleImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="w-9 h-9 rounded-lg overflow-hidden bg-[#E2E7FF] shrink-0 shadow-2xs"
                  >
                    <img
                      src={img}
                      alt="Essential item preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                <span className="text-[11px] font-semibold text-[#6D7A77] ml-1">
                  +{t.itemCount - t.sampleImages.length} more essentials
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Luggage Tier Selection */}
      <div className="mt-5 space-y-2">
        <label className="text-[13px] font-bold text-[#131B2E] tracking-tight flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-[#00685F]" />
            <span>Luggage Allowance</span>
          </span>
          <span className="text-[11px] font-medium text-[#6D7A77]">Helps monitor pack weight</span>
        </label>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'personal', label: 'Personal Item', max: '4 kg', icon: '🎒', desc: 'Backpack / Tote' },
            { id: 'carryon', label: 'Carry-on Bag', max: '7 kg', icon: '🧳', desc: 'Overhead bin' },
            { id: 'checked', label: 'Checked Bag', max: '23 kg', icon: '✈️', desc: 'Hold baggage' },
          ].map((tier) => {
            const isSelected = luggageTier === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setLuggageTier(tier.id as LuggageTier)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#00685F] bg-[#00685F]/5 ring-1 ring-[#00685F]'
                    : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                }`}
              >
                <div>
                  <span className="text-xl">{tier.icon}</span>
                  <p className={`text-[12px] font-bold mt-1 leading-tight ${
                    isSelected ? 'text-[#00685F]' : 'text-[#131B2E]'
                  }`}>
                    {tier.label}
                  </p>
                </div>
                <div className="mt-2">
                  <span className={`text-[11px] font-extrabold ${
                    isSelected ? 'text-[#00685F]' : 'text-[#475569]'
                  }`}>
                    max {tier.max}
                  </span>
                  <p className="text-[10px] text-[#6D7A77] truncate">{tier.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6 space-y-2">
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full h-14 rounded-full bg-[#00685F] text-white font-bold text-[16px] flex items-center justify-center gap-2 shadow-lg shadow-[#00685F]/20 hover:bg-[#005049] active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>Create packing list</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-1.5 text-center text-[#6D7A77] text-[12px]">
          <Info className="w-3.5 h-3.5 text-[#00685F]" />
          <span>You can customize or add items anytime.</span>
        </div>
      </div>
    </div>
  );
};
