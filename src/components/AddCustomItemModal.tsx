import React, { useState } from 'react';
import { X, Layers, Bell, Sparkles, Plus, Check, Lightbulb } from 'lucide-react';
import { PackingItem } from '../types';

interface AddCustomItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: Omit<PackingItem, 'status' | 'isPackedInLuggage'>) => void;
  defaultCategory?: string;
}

const CATEGORIES = ['Clothes', 'Toiletries', 'Tech', 'Documents', 'Footwear', 'Other'];

const QUICK_SUGGESTIONS = [
  { name: 'Snorkel mask', category: 'Clothes' },
  { name: 'Book / Kindle', category: 'Tech' },
  { name: 'Portable charger', category: 'Tech' },
  { name: 'Beach tote', category: 'Clothes' },
  { name: 'Passport & Copies', category: 'Documents' },
  { name: 'Noise-canceling earplugs', category: 'Other' },
];

export const AddCustomItemModal: React.FC<AddCustomItemModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
  defaultCategory = 'Clothes',
}) => {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [quantity, setQuantity] = useState(1);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = itemName.trim();
    if (!name) return;

    setIsSuccess(true);
    setTimeout(() => {
      onAddItem({
        id: 'custom-' + Date.now(),
        name,
        category,
        note: `Custom item (${quantity}x)`,
        quantity,
        isCustom: true,
        tip: 'User-added personal essential.',
      });
      setItemName('');
      setQuantity(1);
      setIsSuccess(false);
      onClose();
    }, 450);
  };

  const handleQuickSuggestion = (item: { name: string; category: string }) => {
    setItemName(item.name);
    setCategory(item.category);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-[#0F172A]/40 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grabber Handle */}
        <div className="w-full flex items-center justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-[#E2E8F0]"></div>
        </div>

        {/* Sheet Header */}
        <div className="flex items-center justify-between px-5 py-2 border-b border-[#0F172A]/5">
          <button
            type="button"
            onClick={onClose}
            className="text-[14px] font-semibold text-[#475569] hover:text-[#131B2E] py-1 cursor-pointer"
          >
            Cancel
          </button>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00685F] animate-pulse"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#00685F]">
              Custom Item
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!itemName.trim()}
            className="text-[14px] font-bold text-[#00685F] hover:text-[#005049] disabled:opacity-40 py-1 cursor-pointer"
          >
            Done
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto px-5 pt-3 pb-8 space-y-5 no-scrollbar">
          {/* Visual Banner */}
          <div className="flex items-center gap-3 bg-[#F2F3FF] p-3 rounded-2xl">
            <div className="w-13 h-13 rounded-xl bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmZ5F4SZfegik-PfwpJF_O2FHiPj4k41fhNTCdXTJ-cV4o8ygroF31t8Dg2trLMSye8AjgqgW1nPlGiOSbQB2Gmbzr3PwDzWTCgvLzByebabdYbJt5yHWyp0SQm0q1Xx5vJTD94vqck4jdMmu6LWzlb07VzXXllNuN3ozNnCj-sQ2Muvr5Ey4pxvxqPFk5SdFvOsCJP8I6YGVaxKzVOfOOyAnKNssB1wtbUuxztq5Qf7EKHHRgI9v3hw"
                alt="Luggage custom gear"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-[16px] font-bold text-[#131B2E] truncate">
                Add an item to your pack
              </h2>
              <p className="text-[12px] text-[#475569] mt-0.5">
                Add anything special you can't leave home without.
              </p>
            </div>
          </div>

          {/* Item Name Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="custom-item-name"
              className="text-[11px] font-bold uppercase tracking-wider text-[#6D7A77]"
            >
              Item Name
            </label>
            <div className="relative flex items-center">
              <input
                id="custom-item-name"
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Prescription sunglasses & case, Kindle..."
                className="w-full h-13 pl-4 pr-11 bg-[#F2F3FF] focus:bg-white rounded-full text-[#131B2E] font-medium text-[15px] border border-transparent focus:border-[#00685F]/30 outline-none transition-all shadow-2xs"
                autoFocus
              />
              {itemName && (
                <button
                  type="button"
                  onClick={() => setItemName('')}
                  className="absolute right-3 w-7 h-7 rounded-full bg-[#E2E7FF] text-[#475569] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D7A77]">
              Category
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#00685F] text-white shadow-xs'
                        : 'bg-[#F2F3FF] text-[#475569] hover:bg-[#EAEDFF]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity & Reminder Bento Card */}
          <div className="bg-[#F2F3FF] rounded-2xl p-4 space-y-4">
            {/* Quantity Stepper */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#00685F] shadow-2xs">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#131B2E]">Quantity</p>
                  <p className="text-[11px] text-[#6D7A77]">Count for swipe deck</p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-white rounded-full p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#131B2E] hover:bg-[#F2F3FF] active:scale-90 transition-transform cursor-pointer"
                >
                  -
                </button>
                <span className="w-7 text-center font-bold text-[16px] text-[#131B2E] select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#131B2E] hover:bg-[#F2F3FF] active:scale-90 transition-transform cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Reminder Toggle */}
            <div className="flex items-center justify-between pt-1 border-t border-[#0F172A]/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#A36700] shadow-2xs">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#131B2E]">Remind when packing starts</p>
                  <p className="text-[11px] text-[#6D7A77]">Packing alert cue</p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={reminderEnabled}
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={`w-12 h-7 rounded-full flex items-center p-1 transition-colors cursor-pointer ${
                  reminderEnabled ? 'bg-[#00685F]' : 'bg-[#DAE2FD]'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    reminderEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Quick Suggestions Sparks */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D7A77] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#A36700]" />
                Quick Suggestions
              </span>
              <span className="text-[11px] text-[#6D7A77]">Tap to populate</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickSuggestion(item)}
                  className="px-3 py-1.5 rounded-full bg-[#F2F3FF] hover:bg-[#EAEDFF] text-[#131B2E] text-[12px] font-semibold active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-[#00685F]" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!itemName.trim()}
              className="w-full h-14 rounded-full bg-[#00685F] disabled:opacity-50 text-white font-bold text-[16px] shadow-lg hover:bg-[#005049] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSuccess ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Added to list!</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Add to list</span>
                </>
              )}
            </button>
            <p className="text-center text-[12px] text-[#6D7A77]">
              Will be added directly to your swipe decision flow.
            </p>
          </div>

          {/* Pro Tip */}
          <div className="p-3 bg-[#FEF3C7] rounded-xl flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#FFB95F] text-[#2A1700] flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div className="text-[12px] leading-tight">
              <span className="font-bold text-[#825100]">Pro tip: </span>
              <span className="text-[#825100]">
                Custom items are prioritized right away in your decision stack.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
