import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Pause,
  RotateCcw,
  Check,
  Clock,
  X,
  Luggage,
  Sparkles,
} from 'lucide-react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import { PackingItem, DecisionStatus } from '../types';
import { sounds } from '../utils/sound';

interface SwipeDecisionScreenProps {
  tripName: string;
  items: PackingItem[];
  onFinish: (updatedItems: PackingItem[], elapsedTimeSeconds: number) => void;
  onPause: () => void;
  onBack: () => void;
  isBlitzMode?: boolean;
}

export const SwipeDecisionScreen: React.FC<SwipeDecisionScreenProps> = ({
  tripName,
  items: initialItems,
  onFinish,
  onPause,
  onBack,
  isBlitzMode = false,
}) => {
  const [items, setItems] = useState<PackingItem[]>(initialItems);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<{ index: number; prevStatus: DecisionStatus }[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'none' | 'right' | 'left' | 'up'>('none');

  // Timer for session duration tracking
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const currentItem = items[currentIndex];
  const nextItem = items[currentIndex + 1];
  const totalItems = items.length;
  const progressPercent = Math.round((currentIndex / totalItems) * 100);

  // Motion values for swipe gesture
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-250, -150, 0, 150, 250], [0.6, 1, 1, 1, 0.6]);

  // Dynamic stamp opacity
  const packStampOpacity = useTransform(x, [40, 120], [0, 1]);
  const laterStampOpacity = useTransform(x, [-40, -120], [0, 1]);
  const skipStampOpacity = useTransform(y, [-40, -120], [0, 1]);

  const handleDecision = (status: DecisionStatus) => {
    if (currentIndex >= totalItems) return;

    // Trigger tactile audio & haptics
    if (status === 'pack') {
      sounds.playPack();
    } else if (status === 'later') {
      sounds.playLater();
    } else if (status === 'skip') {
      sounds.playSkip();
    }

    setHistory((prev) => [...prev, { index: currentIndex, prevStatus: currentItem.status }]);

    const updated = [...items];
    updated[currentIndex] = { ...currentItem, status };
    setItems(updated);

    if (currentIndex + 1 >= totalItems) {
      sounds.playCelebration();
      // Completed all items in deck!
      setTimeout(() => {
        onFinish(updated, elapsedSeconds);
      }, 350);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }

    // Reset coordinates
    x.set(0);
    y.set(0);
    setSwipeDirection('none');
  };

  const handleUndo = () => {
    if (history.length === 0 || currentIndex === 0) return;
    const lastAction = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));

    const updated = [...items];
    updated[lastAction.index] = { ...updated[lastAction.index], status: lastAction.prevStatus };
    setItems(updated);
    setCurrentIndex(lastAction.index);
    x.set(0);
    y.set(0);
    setSwipeDirection('none');
  };

  const handleDragEnd = (_: any, info: any) => {
    const offsetX = info.offset.x;
    const offsetY = info.offset.y;
    const velocityX = info.velocity.x;
    const velocityY = info.velocity.y;

    // Threshold detection
    if (offsetX > 100 || velocityX > 400) {
      handleDecision('pack');
    } else if (offsetX < -100 || velocityX < -400) {
      handleDecision('later');
    } else if (offsetY < -100 || velocityY < -400) {
      handleDecision('skip');
    } else {
      // Snap back
      setSwipeDirection('none');
    }
  };

  const handleDrag = (_: any, info: any) => {
    const offsetX = info.offset.x;
    const offsetY = info.offset.y;

    if (Math.abs(offsetY) > Math.abs(offsetX) && offsetY < -40) {
      setSwipeDirection('up');
    } else if (offsetX > 30) {
      setSwipeDirection('right');
    } else if (offsetX < -30) {
      setSwipeDirection('left');
    } else {
      setSwipeDirection('none');
    }
  };

  if (!currentItem) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[60vh]">
        <p className="text-[16px] font-bold text-[#131B2E]">Deck completed!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full px-5 pt-2 pb-24 select-none animate-fadeIn">
      {/* Session Navigation & Progress */}
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#F2F3FF] flex items-center justify-center text-[#131B2E] hover:bg-[#EAEDFF] transition-transform active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center">
            {isBlitzMode ? (
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#825100] bg-[#FEF3C7] px-2 py-0.5 rounded-full border border-[#FDE68A] flex items-center gap-1 mb-0.5">
                <Clock className="w-3 h-3 text-[#A36700]" /> Decide Later Blitz
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#00685F]">
                Trip Session
              </span>
            )}
            <span className="text-[17px] font-extrabold text-[#131B2E] truncate max-w-[200px]">
              {tripName}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleUndo}
                title="Undo last swipe"
                className="w-9 h-9 rounded-full bg-[#F2F3FF] flex items-center justify-center text-[#475569] hover:bg-[#EAEDFF] transition-transform active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsPaused(!isPaused);
                if (!isPaused) onPause();
              }}
              className="w-9 h-9 rounded-full bg-[#F2F3FF] flex items-center justify-center text-[#131B2E] hover:bg-[#EAEDFF] transition-transform active:scale-95 cursor-pointer"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col gap-1.5 mt-1">
          <div className="flex items-center justify-between text-[#475569]">
            <span className="text-[12px] font-bold text-[#00685F]">
              Item {currentIndex + 1} of {totalItems}
            </span>
            <span className="text-[12px] font-medium">
              {progressPercent}% complete
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#E2E7FF] overflow-hidden">
            <div
              className="h-full bg-[#00685F] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Swipe Deck Viewport */}
      <div className="relative w-full h-[400px] flex items-center justify-center my-1">
        {/* Underneath Next Card Peek */}
        {nextItem && (
          <div className="absolute w-[92%] h-[375px] bg-white border border-[#E2E8F0] rounded-3xl shadow-sm transform -rotate-2 translate-y-3 opacity-65 pointer-events-none flex flex-col p-5">
            <div className="flex justify-between items-center opacity-70">
              <span className="px-3 py-1 rounded-full bg-[#F2F3FF] text-[#475569] text-[11px] font-bold">
                {nextItem.category}
              </span>
              <span className="text-[11px] font-semibold text-[#6D7A77]">Next</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center opacity-40">
              <span className="text-[18px] font-bold text-[#131B2E] mt-2 text-center">
                {nextItem.name}
              </span>
            </div>
            <div className="h-10 bg-[#F2F3FF] rounded-xl opacity-50 w-full"></div>
          </div>
        )}

        {/* Foreground Active Card */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentItem.id}
            style={{ x, y, rotate, opacity }}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.9}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            whileTap={{ cursor: 'grabbing', scale: 1.02 }}
            className={`relative z-10 w-full h-[395px] bg-white border rounded-3xl shadow-xl flex flex-col p-5 overflow-hidden cursor-grab active:cursor-grabbing ${
              swipeDirection === 'right'
                ? 'border-[#00685F]/50 shadow-[#00685F]/15'
                : swipeDirection === 'left'
                ? 'border-[#A36700]/50 shadow-[#A36700]/15'
                : swipeDirection === 'up'
                ? 'border-[#DC2C4F]/50 shadow-[#DC2C4F]/15'
                : 'border-[#E2E8F0]'
            }`}
          >
            {/* Dynamic Stamp Overlays */}
            <motion.div
              style={{ opacity: packStampOpacity }}
              className="absolute top-4 right-4 z-20 pointer-events-none"
            >
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00685F] text-white shadow-lg transform rotate-3">
                <Check className="w-4 h-4 stroke-[3]" />
                <span className="text-[12px] font-extrabold uppercase tracking-wider">
                  PACKED ✓
                </span>
              </div>
            </motion.div>

            <motion.div
              style={{ opacity: laterStampOpacity }}
              className="absolute top-4 left-4 z-20 pointer-events-none"
            >
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A36700] text-white shadow-lg transform -rotate-3">
                <Clock className="w-4 h-4" />
                <span className="text-[12px] font-extrabold uppercase tracking-wider">
                  DECIDE LATER ⏱️
                </span>
              </div>
            </motion.div>

            <motion.div
              style={{ opacity: skipStampOpacity }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
            >
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DC2C4F] text-white shadow-lg">
                <X className="w-4 h-4 stroke-[3]" />
                <span className="text-[12px] font-extrabold uppercase tracking-wider">
                  SKIP ✕
                </span>
              </div>
            </motion.div>

            {/* Top Badging */}
            <div className="flex items-center justify-between z-10">
              <span className="px-3 py-1 rounded-full bg-[#F2F3FF] text-[#00685F] text-[11px] font-bold tracking-wide">
                {currentItem.category}
              </span>
              {currentItem.weightHint && (
                <span className="text-[11px] font-bold text-[#825100] bg-[#FEF3C7] px-2.5 py-0.5 rounded-full">
                  ~{currentItem.weightHint}
                </span>
              )}
            </div>

            {/* Card Visual Illustration / Photo */}
            <div className="relative flex-1 flex flex-col items-center justify-center my-2 z-10">
              {currentItem.image ? (
                <div className="w-full h-36 rounded-2xl overflow-hidden shadow-xs relative bg-[#F2F3FF]">
                  <img
                    src={currentItem.image}
                    alt={currentItem.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                </div>
              ) : (
                <div className="relative w-28 h-28 rounded-full bg-[#F2F3FF] flex items-center justify-center shadow-inner">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#00685F]/10 to-transparent"></div>
                  <Luggage className="w-14 h-14 text-[#00685F]" />
                </div>
              )}

              <h3 className="text-[20px] font-extrabold text-[#131B2E] mt-3 font-bold tracking-tight text-center leading-snug">
                {currentItem.name}
              </h3>
            </div>

            {/* Practical Notes & Context */}
            <div className="flex flex-col gap-2 z-10 mt-auto">
              <p className="text-[13px] text-[#475569] text-center leading-relaxed line-clamp-2">
                {currentItem.note}
              </p>

              {currentItem.tip && (
                <div className="flex items-center gap-2 bg-[#F2F3FF] px-3 py-2 rounded-xl">
                  <Luggage className="w-4 h-4 text-[#00685F] shrink-0" />
                  <span className="text-[11px] text-[#131B2E] line-clamp-1 font-medium">
                    {currentItem.tip}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Realtime Gesture Pill */}
      <div className="flex justify-center items-center my-1.5">
        <div
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-bold transition-all shadow-2xs ${
            swipeDirection === 'right'
              ? 'bg-[#89F5E7] text-[#00201D] scale-105'
              : swipeDirection === 'left'
              ? 'bg-[#FFDDB8] text-[#2A1700] scale-105'
              : swipeDirection === 'up'
              ? 'bg-[#FFDAD6] text-[#93000A] scale-105'
              : 'bg-[#F2F3FF] text-[#475569]'
          }`}
        >
          {swipeDirection === 'right' ? (
            <span>Swiping Right to Pack ⚡</span>
          ) : swipeDirection === 'left' ? (
            <span>Swiping Left: Move to Decide Later ⏱️</span>
          ) : swipeDirection === 'up' ? (
            <span>Swiping Up: Leave Out ✕</span>
          ) : (
            <span>Drag card or use buttons below</span>
          )}
        </div>
      </div>

      {/* 3 Prominent Touch Target Buttons */}
      <div className="flex items-center justify-around w-full max-w-xs mx-auto mt-2 px-1">
        {/* Left: Decide Later (👈) */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => handleDecision('later')}
            className="w-14 h-14 rounded-full bg-[#FFDDB8] text-[#2A1700] flex items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer"
            title="Move to Decide Later category"
          >
            <Clock className="w-6 h-6" />
          </button>
          <span className="text-[11px] font-bold text-[#475569]">Decide Later 👈</span>
        </div>

        {/* Center: Skip (👆) */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => handleDecision('skip')}
            className="w-14 h-14 rounded-full bg-[#FFDADB] text-[#40000D] flex items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>
          <span className="text-[11px] font-bold text-[#475569]">Skip 👆</span>
        </div>

        {/* Right: Pack (👉) */}
        <div className="flex flex-col items-center gap-1 relative">
          <div className="absolute -inset-1.5 rounded-full bg-[#00685F]/20 animate-ping pointer-events-none"></div>
          <button
            type="button"
            onClick={() => handleDecision('pack')}
            className="relative w-16 h-16 rounded-full bg-[#00685F] text-white flex items-center justify-center shadow-xl active:scale-95 transition-transform cursor-pointer"
          >
            <Check className="w-8 h-8 stroke-[3]" />
          </button>
          <span className="text-[12px] font-extrabold text-[#00685F]">Pack 👉</span>
        </div>
      </div>

      {/* Tactile Gesture Quick Guide Bar */}
      <div className="mt-4 mx-auto py-1.5 px-4 rounded-full bg-[#F2F3FF] text-[#475569] text-[11px] font-medium text-center">
        👉 Right = Pack &nbsp;·&nbsp; 👆 Up = Skip &nbsp;·&nbsp; 👈 Left = Decide Later
      </div>
    </div>
  );
};
