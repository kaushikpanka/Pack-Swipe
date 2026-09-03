import React, { useState, useEffect } from 'react';
import {
  Luggage,
  Clock,
  CheckCircle2,
  MinusCircle,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  RotateCcw,
  Plus,
  Info,
  CheckSquare,
  Square,
  Zap,
  Home,
  Plane,
  AlertTriangle,
  Scale,
} from 'lucide-react';
import { PackingItem, Trip, LuggageTier } from '../types';
import { sounds } from '../utils/sound';

interface ReviewSummaryScreenProps {
  trip: Trip;
  onUpdateItems: (items: PackingItem[]) => void;
  onFinishTrip: () => void;
  onOpenAddItem: () => void;
  onStartBlitz?: () => void;
  onResetTrip?: () => void;
}

const LUGGAGE_LIMITS: Record<LuggageTier, { label: string; maxKg: number; icon: string }> = {
  personal: { label: 'Personal Item', maxKg: 4.0, icon: '🎒' },
  carryon: { label: 'Carry-on Bag', maxKg: 7.0, icon: '🧳' },
  checked: { label: 'Checked Bag', maxKg: 23.0, icon: '✈️' },
};

export const ReviewSummaryScreen: React.FC<ReviewSummaryScreenProps> = ({
  trip,
  onUpdateItems,
  onFinishTrip,
  onOpenAddItem,
  onStartBlitz,
  onResetTrip,
}) => {
  const [items, setItems] = useState<PackingItem[]>(trip.items);
  const [luggageTier, setLuggageTier] = useState<LuggageTier>(trip.luggageTier || 'carryon');
  const [isReturnRepack, setIsReturnRepack] = useState<boolean>(trip.isReturnRepackMode || false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    later: true,
    packed: true,
    skip: true,
  });

  useEffect(() => {
    setItems(trip.items);
  }, [trip.items]);

  const laterItems = items.filter((i) => i.status === 'later');
  const packedItems = items.filter((i) => i.status === 'pack');
  const skipItems = items.filter((i) => i.status === 'skip');

  const totalItems = items.length;
  const packedPercent = Math.round((packedItems.length / Math.max(totalItems, 1)) * 100);

  // Approximate weight calculation
  const totalWeightGrams = packedItems.reduce((acc, item) => {
    if (!item.weightHint) return acc + 250;
    const match = item.weightHint.match(/(\d+)/);
    return acc + (match ? parseInt(match[1], 10) : 250);
  }, 0);
  const totalWeightKgNum = parseFloat((totalWeightGrams / 1000).toFixed(1));
  const totalWeightKg = totalWeightKgNum.toFixed(1);
  const maxTierWeight = LUGGAGE_LIMITS[luggageTier].maxKg;
  const weightPercent = Math.min(100, Math.round((totalWeightKgNum / maxTierWeight) * 100));
  const isOverWeight = totalWeightKgNum > maxTierWeight;
  const isNearLimit = !isOverWeight && weightPercent >= 80;

  const toggleSection = (section: 'later' | 'packed' | 'skip') => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const resolveLaterItem = (id: string, newStatus: 'pack' | 'skip') => {
    if (newStatus === 'pack') sounds.playPack();
    else sounds.playSkip();

    const updated = items.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item
    );
    setItems(updated);
    onUpdateItems(updated);
  };

  const togglePackedCheck = (id: string) => {
    sounds.playPack();
    const updated = items.map((item) =>
      item.id === id ? { ...item, isPackedInLuggage: !item.isPackedInLuggage } : item
    );
    setItems(updated);
    onUpdateItems(updated);
  };

  const restoreItem = (id: string) => {
    sounds.playPack();
    const updated = items.map((item) =>
      item.id === id ? { ...item, status: 'pack' as const } : item
    );
    setItems(updated);
    onUpdateItems(updated);
  };

  const moveToLater = (id: string) => {
    sounds.playLater();
    const updated = items.map((item) =>
      item.id === id ? { ...item, status: 'later' as const, isPackedInLuggage: false } : item
    );
    setItems(updated);
    onUpdateItems(updated);
  };

  const handleResetForReturnJourney = () => {
    sounds.playLater();
    const updated = items.map((item) => ({ ...item, isPackedInLuggage: false }));
    setItems(updated);
    onUpdateItems(updated);
  };

  const handleConfirmReset = () => {
    sounds.playLater();
    const resetItems = items.map((item) => ({
      ...item,
      status: 'unreviewed' as const,
      isPackedInLuggage: false,
    }));
    setItems(resetItems);
    onUpdateItems(resetItems);
    setShowResetConfirm(false);
    if (onResetTrip) {
      onResetTrip();
    }
  };

  const checkedInLuggageCount = packedItems.filter((i) => i.isPackedInLuggage).length;

  return (
    <div className="flex flex-col w-full px-5 pt-3 pb-36 animate-fadeIn">
      {/* Mode Switcher: Outbound vs Return Journey */}
      <div className="flex items-center justify-between bg-[#F2F3FF] p-1 rounded-2xl mb-3 border border-[#E2E7FF]">
        <button
          type="button"
          onClick={() => setIsReturnRepack(false)}
          className={`flex-1 py-1.5 px-3 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            !isReturnRepack
              ? 'bg-white text-[#00685F] shadow-2xs'
              : 'text-[#475569] hover:text-[#131B2E]'
          }`}
        >
          <Plane className="w-3.5 h-3.5" />
          <span>Outbound Packing</span>
        </button>
        <button
          type="button"
          onClick={() => setIsReturnRepack(true)}
          className={`flex-1 py-1.5 px-3 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            isReturnRepack
              ? 'bg-[#00685F] text-white shadow-2xs'
              : 'text-[#475569] hover:text-[#131B2E]'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Bring It Home Mode</span>
        </button>
      </div>

      {/* Return Repack Notification Banner */}
      {isReturnRepack && (
        <div className="bg-[#E2E7FF] border border-[#C5D0FD] rounded-2xl p-3.5 mb-3.5 shadow-2xs flex flex-col gap-2">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#00685F] text-white flex items-center justify-center shrink-0 mt-0.5">
              <Home className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-extrabold text-[#131B2E]">
                Hotel Room Sweep Checklist
              </p>
              <p className="text-[12px] text-[#475569] leading-relaxed mt-0.5">
                Before checkout, check off items as you pack them back to avoid leaving chargers, toiletries, or keys in the room.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#0F172A]/10 text-[11px]">
            <span className="text-[#00685F] font-bold">
              {checkedInLuggageCount} of {packedItems.length} packed for return
            </span>
            <button
              type="button"
              onClick={handleResetForReturnJourney}
              className="text-[#00685F] font-extrabold hover:underline cursor-pointer"
            >
              Reset checkboxes
            </button>
          </div>
        </div>
      )}

      {/* Trip Header Context Card */}
      <div className="bg-[#F2F3FF] border border-[#E2E7FF] rounded-2xl p-4 shadow-xs mb-4">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <Luggage className="w-5 h-5 text-[#00685F] shrink-0" />
            <h2 className="text-[20px] font-extrabold text-[#131B2E] tracking-tight truncate">
              {trip.name}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1 bg-white hover:bg-[#FFDAD6]/60 text-[#93000A] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-2xs border border-[#FFDAD6] active:scale-95 transition-all cursor-pointer"
              title="Reset Trip and return packing list to initial state"
            >
              <RotateCcw className="w-3 h-3 text-[#DC2C4F]" />
              <span>Reset Trip</span>
            </button>
            <span className="inline-flex items-center gap-1 bg-white text-[#00685F] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-2xs shrink-0">
              <span>🏖️</span>
              <span>{packedItems.length} of {packedItems.length + laterItems.length} ready</span>
            </span>
          </div>
        </div>

        <p className="text-[12px] text-[#475569] mb-3">
          {trip.duration || '3 days · 2 nights · Carry-on luggage'}
        </p>

        {/* Luggage Tier Selector & Weight Capacity Bar */}
        <div className="bg-white rounded-xl p-3 shadow-2xs border border-[#0F172A]/5 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1 text-[12px] font-extrabold text-[#131B2E]">
              <Scale className="w-3.5 h-3.5 text-[#00685F]" />
              <span>Luggage Limit Tier:</span>
            </div>
            <span className="text-[11px] font-semibold text-[#6D7A77]">
              Limit: {maxTierWeight} kg
            </span>
          </div>

          {/* Tier Pills */}
          <div className="grid grid-cols-3 gap-1.5 mb-2.5">
            {(Object.keys(LUGGAGE_LIMITS) as LuggageTier[]).map((tierKey) => {
              const tier = LUGGAGE_LIMITS[tierKey];
              const isSelected = luggageTier === tierKey;
              return (
                <button
                  key={tierKey}
                  type="button"
                  onClick={() => setLuggageTier(tierKey)}
                  className={`py-1.5 px-2 rounded-lg text-center text-[11px] font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#00685F] text-white border-[#00685F] shadow-2xs'
                      : 'bg-[#F2F3FF] text-[#475569] border-[#DAE2FD] hover:bg-[#EAEDFF]'
                  }`}
                >
                  <div className="truncate">{tier.icon} {tier.label}</div>
                  <div className={`text-[9px] ${isSelected ? 'text-white/80' : 'text-[#6D7A77]'}`}>
                    max {tier.maxKg} kg
                  </div>
                </button>
              );
            })}
          </div>

          {/* Weight Capacity Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#475569] font-medium">Estimated Packed Weight</span>
              <span className={`font-extrabold ${isOverWeight ? 'text-[#DC2C4F]' : isNearLimit ? 'text-[#A36700]' : 'text-[#00685F]'}`}>
                {totalWeightKg} / {maxTierWeight} kg ({weightPercent}%)
              </span>
            </div>
            <div className="w-full h-2 bg-[#E2E7FF] rounded-full overflow-hidden flex">
              <div
                className={`transition-all duration-500 rounded-full h-full ${
                  isOverWeight
                    ? 'bg-[#DC2C4F]'
                    : isNearLimit
                    ? 'bg-[#A36700]'
                    : 'bg-[#00685F]'
                }`}
                style={{ width: `${Math.min(weightPercent, 100)}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[10px] pt-0.5 text-[#6D7A77]">
              {isOverWeight ? (
                <span className="text-[#DC2C4F] font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Exceeds {maxTierWeight}kg tier. Skip heavy items to lighten bag.
                </span>
              ) : isNearLimit ? (
                <span className="text-[#A36700] font-bold">
                  ⚠️ Approaching {maxTierWeight}kg weight allowance
                </span>
              ) : (
                <span>✓ Well within {LUGGAGE_LIMITS[luggageTier].label} capacity</span>
              )}
            </div>
          </div>
        </div>

        {/* Readiness Gauge */}
        <div className="bg-white rounded-xl p-3 shadow-2xs border border-[#0F172A]/5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-bold text-[#00685F]">Packing Readiness</span>
              <span className="bg-[#89F5E7]/40 text-[#00201D] text-[11px] font-extrabold px-1.5 py-0.5 rounded-full">
                {packedPercent}%
              </span>
            </div>
            <span className="text-[12px] font-bold text-[#475569]">
              {packedItems.length} / {packedItems.length + laterItems.length} packed
            </span>
          </div>

          <div className="w-full h-2 bg-[#E2E7FF] rounded-full overflow-hidden flex">
            <div
              className="bg-[#00685F] transition-all duration-500 rounded-full h-full"
              style={{ width: `${packedPercent}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between mt-2 text-[11px]">
            <span className="text-[#6D7A77]">Suitcase zipped items: {checkedInLuggageCount}/{packedItems.length}</span>
            <span className={`font-bold ${laterItems.length > 0 ? 'text-[#A36700]' : 'text-[#00685F]'}`}>
              Decide Later: {laterItems.length} {laterItems.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: DECIDE LATER CATEGORY */}
      <section className={`mb-4 rounded-2xl p-4 shadow-xs border transition-all ${
        laterItems.length > 0
          ? 'bg-[#FEF3C7]/60 border-[#FDE68A]'
          : 'bg-white border-[#E2E8F0]/80'
      }`}>
        <div
          onClick={() => toggleSection('later')}
          className="flex items-center justify-between cursor-pointer mb-2.5"
        >
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white shadow-2xs ${
              laterItems.length > 0 ? 'bg-[#A36700]' : 'bg-[#94A3B8]'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-[17px] font-bold text-[#131B2E]">Decide Later</h3>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              laterItems.length > 0
                ? 'bg-[#A36700] text-white'
                : 'bg-[#F2F3FF] text-[#6D7A77]'
            }`}>
              {laterItems.length} {laterItems.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          {expandedSections.later ? (
            <ChevronUp className="w-4 h-4 text-[#6D7A77]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#6D7A77]" />
          )}
        </div>

        {expandedSections.later && (
          <div className="flex flex-col gap-2.5">
            {laterItems.length > 0 ? (
              <>
                <div className="bg-white/90 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border border-[#FDE68A]">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#A36700] shrink-0" />
                    <p className="text-[12px] text-[#475569]">
                      {laterItems.length} {laterItems.length === 1 ? 'item' : 'items'} pending your call before zipping
                    </p>
                  </div>

                  {onStartBlitz && (
                    <button
                      type="button"
                      onClick={onStartBlitz}
                      className="px-3 py-1.5 rounded-full bg-[#A36700] hover:bg-[#825100] text-white text-[11px] font-extrabold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>20s Blitz Mode</span>
                    </button>
                  )}
                </div>

                {laterItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl p-3.5 shadow-2xs border border-[#0F172A]/5 flex flex-col gap-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#F2F3FF] flex items-center justify-center text-[#A36700] shrink-0">
                          <Luggage className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-bold text-[#131B2E] truncate">
                            {item.name}
                          </p>
                          <p className="text-[12px] text-[#6D7A77] truncate">
                            {item.note} {item.weightHint ? `· ${item.weightHint}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FEF3C7] text-[#825100] px-2 py-0.5 rounded-full">
                        Undecided
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#0F172A]/5">
                      <button
                        type="button"
                        onClick={() => resolveLaterItem(item.id, 'skip')}
                        className="h-9 px-4 rounded-full bg-[#FFDAD6] text-[#93000A] text-[12px] font-bold flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Skip</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => resolveLaterItem(item.id, 'pack')}
                        className="h-9 px-4 rounded-full bg-[#00685F] text-white text-[12px] font-bold flex items-center gap-1 active:scale-95 shadow-xs transition-transform cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Pack</span>
                      </button>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="bg-[#F8FAFC] rounded-xl p-3 text-center border border-dashed border-[#E2E8F0]">
                <p className="text-[12px] text-[#6D7A77]">
                  0 items in Decide Later · Tap "Decide Later" on any packed or left out item below if you're undecided.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* SECTION 2: PACKED ITEMS */}
      <section className="mb-4 bg-white border border-[#E2E8F0]/80 rounded-2xl p-4 shadow-xs">
        <div
          onClick={() => toggleSection('packed')}
          className="flex items-center justify-between cursor-pointer mb-2.5"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#00685F] flex items-center justify-center text-white shadow-2xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-[17px] font-bold text-[#131B2E]">
              {isReturnRepack ? 'Return Luggage Checklist' : 'Packed for Suitcase'}
            </h3>
            <span className="bg-[#00685F] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              {packedItems.length}
            </span>
          </div>
          {expandedSections.packed ? (
            <ChevronUp className="w-4 h-4 text-[#6D7A77]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#6D7A77]" />
          )}
        </div>

        {expandedSections.packed && (
          <div className="flex flex-col gap-2">
            <p className="text-[12px] text-[#475569] mb-1">
              {isReturnRepack
                ? 'Check each item as you put it back in your luggage before leaving the hotel:'
                : 'Tap checkboxes as you physically place each item into your suitcase:'}
            </p>

            {packedItems.length === 0 ? (
              <div className="bg-[#F8FAFC] rounded-xl p-3 text-center border border-dashed border-[#E2E8F0]">
                <p className="text-[12px] text-[#6D7A77]">No items packed yet.</p>
              </div>
            ) : (
              packedItems.map((item) => {
                const isChecked = !!item.isPackedInLuggage;
                const isHotelRisk = /charger|phone|laptop|cable|passport|wallet|key|glasses|watch|ring|jewelry/i.test(item.name);

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isChecked
                        ? 'bg-[#89F5E7]/15 border-[#89F5E7]/40'
                        : 'bg-[#F8FAFC] border-[#0F172A]/5 hover:bg-[#F2F3FF]/70'
                    }`}
                  >
                    <div
                      onClick={() => togglePackedCheck(item.id)}
                      className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                    >
                      <button
                        type="button"
                        className="text-[#00685F] focus:outline-none shrink-0"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-[#00685F]" />
                        ) : (
                          <Square className="w-5 h-5 text-[#94A3B8]" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p
                            className={`text-[14px] font-bold truncate ${
                              isChecked ? 'line-through text-[#6D7A77]' : 'text-[#131B2E]'
                            }`}
                          >
                            {item.name}
                          </p>
                          {isReturnRepack && isHotelRisk && (
                            <span className="text-[9px] font-extrabold bg-[#FFDAD6] text-[#93000A] px-1.5 py-0.2 rounded-full shrink-0">
                              Hotel Risk
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#6D7A77] truncate">
                          {item.weightHint ? `~${item.weightHint}` : ''} {item.note ? `· ${item.note}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveToLater(item.id)}
                        className="px-2 py-1 rounded-full bg-[#FEF3C7] text-[#825100] hover:bg-[#FDE68A] text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                        title="Undecided? Move to Decide Later category"
                      >
                        <Clock className="w-3 h-3 text-[#A36700]" />
                        <span>Decide Later</span>
                      </button>
                      <span className="bg-white text-[#00685F] text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-2xs">
                        {item.category}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </section>

      {/* SECTION 3: SKIPPED (LEFT BEHIND) ITEMS */}
      <section className="mb-4 bg-white border border-[#E2E8F0]/80 rounded-2xl p-4 shadow-xs">
        <div
          onClick={() => toggleSection('skip')}
          className="flex items-center justify-between cursor-pointer mb-2.5"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#FFDAD6] flex items-center justify-center text-[#93000A] shadow-2xs">
              <MinusCircle className="w-4 h-4" />
            </div>
            <h3 className="text-[17px] font-bold text-[#131B2E]">Left Behind</h3>
            <span className="bg-[#FFDAD6] text-[#93000A] text-[11px] font-bold px-2 py-0.5 rounded-full">
              {skipItems.length}
            </span>
          </div>
          {expandedSections.skip ? (
            <ChevronUp className="w-4 h-4 text-[#6D7A77]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#6D7A77]" />
          )}
        </div>

        {expandedSections.skip && (
          <div className="flex flex-col gap-2">
            {skipItems.length === 0 ? (
              <div className="bg-[#F8FAFC] rounded-xl p-3 text-center border border-dashed border-[#E2E8F0]">
                <p className="text-[12px] text-[#6D7A77]">No items left behind.</p>
              </div>
            ) : (
              skipItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#0F172A]/5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#DC2C4F] shrink-0 shadow-2xs">
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#475569] line-through truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-[#6D7A77] truncate">
                        {item.note}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveToLater(item.id)}
                      className="px-2 py-1 rounded-full bg-[#FEF3C7] text-[#825100] hover:bg-[#FDE68A] text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                      title="Move to Decide Later category"
                    >
                      <Clock className="w-3 h-3 text-[#A36700]" />
                      <span>Decide Later</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => restoreItem(item.id)}
                      className="text-[#00685F] hover:bg-[#E2E7FF] text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto px-5 py-2.5 bg-[#FAF9F6]/95 backdrop-blur-md z-40 border-t border-[#0F172A]/5">
        <div className="flex flex-col gap-2">
          {laterItems.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {onStartBlitz && (
                <button
                  type="button"
                  onClick={onStartBlitz}
                  className="w-full h-11 rounded-full bg-[#A36700] hover:bg-[#825100] text-white font-extrabold text-[14px] flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>⚡ Quick Blitz {laterItems.length} in Decide Later</span>
                </button>
              )}
              <button
                type="button"
                onClick={onFinishTrip}
                className="w-full h-11 rounded-full bg-[#00685F] text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Finish packing ({laterItems.length} in Decide Later)</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onFinishTrip}
              className="w-full h-13 rounded-full bg-[#00685F] text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-[#00685F]/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>{isReturnRepack ? 'Finish Hotel Repack ✓' : 'Finish packing ✓'}</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenAddItem}
              className="flex-1 h-10 rounded-full bg-[#F2F3FF] hover:bg-[#EAEDFF] text-[#131B2E] font-semibold text-[13px] flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#00685F]" />
              <span>Add last-minute item</span>
            </button>
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="h-10 px-3.5 rounded-full bg-[#FFF5F5] hover:bg-[#FFDAD6]/60 text-[#93000A] border border-[#FFDAD6] font-bold text-[12px] flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shrink-0 shadow-2xs"
              title="Reset Trip and return packing list to initial state"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#DC2C4F]" />
              <span>Reset Trip</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reset Trip Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFDAD6] flex items-center justify-center text-[#93000A] shrink-0">
                <RotateCcw className="w-5 h-5 text-[#DC2C4F]" />
              </div>
              <div>
                <h4 className="text-[17px] font-extrabold text-[#131B2E]">Reset Trip?</h4>
                <p className="text-[12px] text-[#6D7A77]">Clear all current decisions</p>
              </div>
            </div>
            <p className="text-[13px] text-[#475569] leading-relaxed">
              This will clear all current decisions (Pack, Decide Later, and Skip) and return your packing list to its initial unreviewed state.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 h-11 rounded-full bg-[#F2F3FF] hover:bg-[#EAEDFF] text-[#131B2E] text-[13px] font-bold cursor-pointer transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 h-11 rounded-full bg-[#DC2C4F] hover:bg-[#B31938] text-white text-[13px] font-bold shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Yes, Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
