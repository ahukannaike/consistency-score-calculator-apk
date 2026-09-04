import React, { useState } from 'react';
import { CalculationResult } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculator';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, ShieldAlert, Target, DollarSign, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConsistencyGauge } from './ConsistencyGauge';

interface YourResultsProps {
  result: CalculationResult | null;
  calculationKey?: number | string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

interface CtaRipple {
  x: number;
  y: number;
  id: number;
}

export const YourResults: React.FC<YourResultsProps> = ({
  result,
  calculationKey,
  isExpanded,
  onToggleExpand,
}) => {
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [ctaRipples, setCtaRipples] = useState<CtaRipple[]>([]);
  const [isPressed, setIsPressed] = useState<boolean>(false);

  if (!result) {
    return null;
  }

  const {
    consistencyScore,
    isPassed,
    consistencyLimit,
    totalProfit,
    bestTradingDay,
    maxAllowedBestDay,
    additionalProfitNeeded,
    profitTarget,
    profitTargetProgress,
    projectedConsistencyScore,
  } = result;

  // Visual clamp for progress bar (0% - 100%)
  const clampedProgress = profitTargetProgress !== null ? Math.min(100, Math.max(0, profitTargetProgress)) : 0;

  const handleCtaPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    // 1. Instantly capture touch/pointer coordinates anywhere on the surface
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX ? e.clientX - rect.left : rect.width / 2;
    const y = e.clientY ? e.clientY - rect.top : rect.height / 2;
    const newRipple: CtaRipple = { x, y, id: Date.now() };

    setCtaRipples((prev) => [...prev.slice(-2), newRipple]);
    setIsPressed(true);

    setTimeout(() => {
      setIsPressed(false);
    }, 150);

    setTimeout(() => {
      setCtaRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  };

  const handleCtaClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Ensure ripples fire even for keyboard triggers (Enter/Space)
    if (ctaRipples.length === 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX ? e.clientX - rect.left : rect.width / 2;
      const y = e.clientY ? e.clientY - rect.top : rect.height / 2;
      const newRipple: CtaRipple = { x, y, id: Date.now() };
      setCtaRipples([newRipple]);
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 150);
      setTimeout(() => setCtaRipples([]), 600);
    }

    // 2. Execute existing button action (Placeholder destination to be connected later)
    const openBypassApp = () => {
      /* Placeholder for app/destination link */
    };
    openBypassApp();
  };

  return (
    <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800/90 shadow-xl overflow-hidden backdrop-blur-sm">
      {/* Accordion Header */}
      <button
        id="section-results-toggle"
        type="button"
        onClick={onToggleExpand}
        className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left transition-colors hover:bg-zinc-800/40 active:bg-zinc-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer min-h-[52px]"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-7 h-7 shrink-0 rounded-lg border flex items-center justify-center font-bold text-xs transition-colors duration-300 ${
            !isRevealed
              ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
              : isPassed 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            2
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-100 font-mono">
                YOUR RESULTS
              </h2>
              <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold border shrink-0 transition-all duration-300 ${
                !isRevealed
                  ? 'bg-sky-950/60 text-sky-400 border-sky-500/30 animate-pulse'
                  : isPassed 
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30' 
                    : 'bg-amber-950/60 text-amber-400 border-amber-500/30'
              }`}>
                {!isRevealed ? 'ANALYZING...' : isPassed ? 'PASSED' : 'ACTION NEEDED'}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400 leading-tight truncate">
              Consistency analysis, profit targets, and recovery requirements
            </p>
          </div>
        </div>
        <div className="text-zinc-400 p-1.5 rounded-lg bg-zinc-800/60 shrink-0 ml-2">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="p-3.5 sm:p-4 pt-2 border-t border-zinc-800/60 space-y-4">
              
              {/* Primary Score Hero Card with Animated Rolling Dial */}
              <div className={`rounded-2xl p-4 sm:p-5 border text-center relative overflow-hidden transition-all duration-500 ${
                !isRevealed
                  ? 'bg-zinc-950/80 border-sky-500/30 shadow-[0_0_20px_rgba(56,189,248,0.1)]'
                  : isPassed 
                    ? 'bg-emerald-950/20 border-emerald-500/30 animate-score-pulse-emerald' 
                    : 'bg-amber-950/20 border-amber-500/30 animate-score-pulse-amber'
              }`}>
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono block mb-1">
                  {!isRevealed ? 'Determining Consistency Score...' : 'Current Consistency Score'}
                </span>

                {/* Animated Futuristic Consistency Gauge with Rolling / Spinning Sequence */}
                <div className="my-2">
                  <ConsistencyGauge
                    score={consistencyScore}
                    limit={consistencyLimit}
                    isPassed={isPassed}
                    calculationKey={calculationKey}
                    onStateChange={(revealed) => setIsRevealed(revealed)}
                  />
                </div>

                {/* Pass / Fail Status Banner with Smooth Reveal */}
                <div className="min-h-[38px] flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {!isRevealed ? (
                      <motion.div
                        key="analyzing"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-300 font-bold text-xs sm:text-sm font-mono text-center"
                      >
                        <Activity className="w-4 h-4 text-sky-400 animate-spin" />
                        <span>ANALYZING TRADING CONSISTENCY...</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="revealed"
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="flex items-center justify-center gap-2"
                      >
                        {isPassed ? (
                          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-bold text-xs sm:text-sm font-mono text-center flex-wrap shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>
                              {profitTarget !== null ? 'TARGET & CONSISTENCY PASSED' : 'CONSISTENCY REQUIREMENT PASSED'}
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 font-bold text-xs sm:text-sm font-mono text-center flex-wrap shadow-[0_0_12px_rgba(245,158,11,0.15)]">
                            <XCircle className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>
                              {profitTarget !== null && totalProfit < profitTarget
                                ? (consistencyScore <= consistencyLimit ? 'PROFIT TARGET NOT MET' : 'CONSISTENCY REQUIREMENT NOT MET')
                                : 'CONSISTENCY REQUIREMENT NOT MET'}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Context Details */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35, delay: 0.1 }}
                >
                  <p className="text-[11px] sm:text-xs text-zinc-400 mt-2.5 font-mono break-words leading-tight">
                    Target Limit: <span className="text-zinc-200 font-semibold">{formatPercent(consistencyLimit)}</span> (Best Day: {formatCurrency(bestTradingDay)} of {formatCurrency(totalProfit)})
                  </p>
                  {profitTarget !== null && additionalProfitNeeded > 0 && projectedConsistencyScore !== undefined && (
                    <p className="text-[11px] sm:text-xs text-zinc-400 mt-1 font-mono break-words leading-tight">
                      Projected Consistency at Profit Target: <span className="text-emerald-400 font-semibold">{formatPercent(projectedConsistencyScore)}</span>
                    </p>
                  )}
                </motion.div>
              </div>

              {/* Core Output Metrics Grid */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.15 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3"
              >
                {/* Maximum Allowed Best Day */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center justify-between text-zinc-400 text-xs">
                    <span className="font-semibold text-zinc-300">Maximum Allowed Best Day</span>
                    <DollarSign className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold font-mono text-zinc-100 truncate">
                    {formatCurrency(maxAllowedBestDay)}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug break-words">
                    {formatPercent(consistencyLimit)} of your current total profit ({formatCurrency(totalProfit)}).
                  </p>
                </div>

                {/* Additional Profit Needed */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center justify-between text-zinc-400 text-xs">
                    <span className="font-semibold text-zinc-300">Additional Profit Needed</span>
                    <ShieldAlert className={`w-3.5 h-3.5 shrink-0 ${additionalProfitNeeded > 0 ? 'text-amber-400' : 'text-emerald-400'}`} />
                  </div>
                  <div className={`text-lg sm:text-xl font-bold font-mono truncate ${
                    additionalProfitNeeded > 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {formatCurrency(additionalProfitNeeded)}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug break-words">
                    {additionalProfitNeeded > 0
                      ? `Profit needed to dilute your highest day to ${formatPercent(consistencyLimit)}.`
                      : 'Requirement met. No extra profit needed.'}
                  </p>
                </div>
              </motion.div>

              {/* Profit Target Progress (Shown only when profit target is provided) */}
              {profitTarget !== null && profitTargetProgress !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.2 }}
                  className="p-3.5 sm:p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-2.5 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
                      <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Profit Target Progress</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-zinc-200">
                      {formatCurrency(totalProfit)} / {formatCurrency(profitTarget)} ({formatPercent(profitTargetProgress)})
                    </div>
                  </div>

                  {/* Progress Track */}
                  <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden relative">
                    <motion.div
                      className={`h-full rounded-full ${
                        profitTargetProgress >= 100 ? 'bg-emerald-400' : 'bg-emerald-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${clampedProgress}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-zinc-400 flex-wrap gap-1">
                    <span>Target: {formatCurrency(profitTarget)}</span>
                    <span>
                      {profitTargetProgress >= 100
                        ? 'Target achieved!'
                        : `${formatCurrency(Math.max(0, profitTarget - totalProfit))} remaining`}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Call to Action (CTA) - Entire glowing button is a unified clickable element */}
              <div className="pt-2 relative">
                {/* Ambient Radiant Golden Halo Effect */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-600/40 via-yellow-400/55 to-amber-500/40 blur-md animate-energy-pulse pointer-events-none z-0" />

                <button
                  id="cta-lower-consistency-app"
                  type="button"
                  aria-label="Urgent Attention Needed: Lower your consistency score immediately using this app - Click Here"
                  onPointerDown={handleCtaPointerDown}
                  onClick={handleCtaClick}
                  className={`relative z-10 w-full min-h-[68px] p-3.5 pt-3 sm:p-4.5 sm:pt-3.5 rounded-2xl bg-gradient-to-br from-zinc-950 via-amber-950/50 to-zinc-950 border-2 border-amber-400/90 text-center transition-all duration-150 cursor-pointer group shadow-2xl animate-radiant-glow overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 touch-manipulation select-none ${
                    isPressed
                      ? 'scale-[0.97] brightness-125 shadow-[0_0_35px_rgba(251,191,36,0.9)] ring-2 ring-amber-300'
                      : 'active:scale-[0.97] active:brightness-125'
                  }`}
                >
                  {/* Continuous Fast Travelling Golden Light Shimmer / Light Beam */}
                  <div className="absolute inset-0 w-[55%] h-full bg-gradient-to-r from-transparent via-amber-100/35 to-transparent animate-light-shimmer pointer-events-none" />

                  {/* Dynamic Touch / Click Ripples originating from exact touch location */}
                  {ctaRipples.map((r) => (
                    <span
                      key={r.id}
                      style={{ left: r.x, top: r.y }}
                      className="absolute w-36 h-36 -ml-18 -mt-18 rounded-full bg-amber-300/40 pointer-events-none animate-[rippleEffect_0.6s_ease-out_forwards]"
                    />
                  ))}

                  {/* Upper-left 'Urgent Attention Needed' Notification Badge */}
                  <div className="relative z-10 flex items-center justify-between mb-1.5 pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-500/70 text-[9px] sm:text-[11px] font-black uppercase tracking-wider text-red-400 font-mono drop-shadow-[0_0_10px_rgba(239,68,68,0.85)] shadow-[0_0_12px_rgba(220,38,38,0.4)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
                      <span className="text-red-300 font-extrabold drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]">Urgent Attention Needed</span>
                    </span>
                  </div>

                  {/* High-visibility Bold Main Content */}
                  <div className="relative z-10 space-y-1 text-center pointer-events-none">
                    <span className="block text-xs xs:text-sm sm:text-base font-extrabold text-white tracking-wide leading-snug break-words drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      Lower your consistency score immediately using this app
                    </span>
                    <span className="inline-flex items-center justify-center gap-1.5 text-xs xs:text-sm sm:text-base font-black text-yellow-300 group-hover:text-yellow-200 font-mono tracking-wider transition-colors drop-shadow-[0_0_12px_rgba(250,204,21,0.9)]">
                      <span>➡️</span> <span>Click Here</span>
                    </span>
                  </div>
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
