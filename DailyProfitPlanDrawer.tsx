import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Target, Zap, AlertTriangle, CheckCircle2, TrendingUp, DollarSign, Calendar, BarChart3 } from 'lucide-react';
import { CalculationInputs, CalculationResult } from '../types';
import { calculateConsistencyScore, formatCurrency, formatPercent } from '../utils/calculator';
import { generateDailyProfitOptions } from '../utils/dailyProfitPlan';

interface DailyProfitPlanDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  result: CalculationResult | null;
  inputs: CalculationInputs;
}

export const DailyProfitPlanDrawer: React.FC<DailyProfitPlanDrawerProps> = ({
  isOpen,
  onClose,
  result,
  inputs,
}) => {
  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Always compute live data from current inputs or result
  const activeResult = result ?? calculateConsistencyScore(inputs);
  const consistencyLimit = activeResult?.consistencyLimit ?? (Number(inputs.consistencyLimit) || 20);
  const consistencyScore = activeResult?.consistencyScore;
  const additionalProfitNeeded = activeResult?.additionalProfitNeeded ?? 0;
  const bestTradingDay = activeResult?.bestTradingDay ?? 0;
  const isPassed = activeResult?.isPassed ?? false;

  const planOptions = activeResult
    ? generateDailyProfitOptions(additionalProfitNeeded, bestTradingDay)
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <motion.div
            id="daily-plan-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm cursor-pointer"
            aria-hidden="true"
          />

          {/* Slide-out Drawer Panel */}
          <motion.aside
            id="daily-profit-plan-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="daily-plan-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-md sm:w-[440px] h-full min-h-[100dvh] bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col z-10 overflow-hidden"
          >
            {/* Drawer Header with Close Button */}
            <div className="flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))] border-b border-zinc-800/80 bg-zinc-900/90 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2 id="daily-plan-title" className="text-sm font-bold uppercase tracking-wider text-zinc-100 font-mono truncate">
                    DAILY PROFIT PLAN
                  </h2>
                  <p className="text-[11px] text-zinc-400 truncate">
                    Personalized recovery & consistency schedule
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                id="btn-close-daily-plan"
                type="button"
                onClick={onClose}
                aria-label="Close Daily Profit Plan"
                className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-300 hover:text-white border border-zinc-700/60 text-xs font-mono transition-colors cursor-pointer min-h-[38px] touch-manipulation"
              >
                <X className="w-4 h-4 shrink-0" />
                <span className="font-semibold uppercase tracking-wider">CLOSE</span>
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 pb-[max(2rem,calc(env(safe-area-inset-bottom)+1rem))]">
              
              {!activeResult ? (
                /* Empty state when no inputs or calculation available */
                <div className="rounded-2xl p-6 bg-zinc-900/60 border border-zinc-800 text-center space-y-3 my-6">
                  <Target className="w-10 h-10 text-blue-400/80 mx-auto" />
                  <h3 className="text-sm font-bold text-zinc-200 font-mono uppercase tracking-wider">
                    CALCULATE YOUR SCORE FIRST
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Enter your prop firm parameters and trading metrics in the calculator to generate your personalized Daily Profit Plan.
                  </p>
                </div>
              ) : isPassed ? (
                /* Passed requirement state */
                <div className="space-y-4">
                  <div className="rounded-2xl p-4 sm:p-5 bg-emerald-950/30 border border-emerald-500/40 text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-2 rounded-full bg-emerald-500/10 text-emerald-400 mb-1">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-emerald-300 font-mono uppercase tracking-wider">
                      🎯 REQUIREMENT ALREADY MET
                    </h3>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Your current consistency score of <span className="text-emerald-400 font-bold font-mono">{formatPercent(consistencyScore!)}</span> already meets your target of <span className="text-zinc-100 font-bold font-mono">{formatPercent(consistencyLimit)}</span>.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800">
                      <span className="text-[10px] uppercase font-mono text-zinc-400 block">Current Score</span>
                      <span className="text-lg font-bold font-mono text-emerald-400">{formatPercent(consistencyScore!)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800">
                      <span className="text-[10px] uppercase font-mono text-zinc-400 block">Target Limit</span>
                      <span className="text-lg font-bold font-mono text-zinc-100">{formatPercent(consistencyLimit)}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-400 leading-relaxed">
                    No additional profit is required to dilute your best trading day. Continue trading normally within your risk parameters.
                  </div>
                </div>
              ) : (
                /* Active Action Needed State */
                <>
                  {/* Section 4: Personalized Target Card */}
                  <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-blue-950/20 border border-blue-500/30 space-y-3.5 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-blue-500/20 text-blue-400">
                        <Target className="w-4 h-4" />
                      </div>
                      <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-blue-300 font-mono">
                        🎯 YOUR PATH TO {formatPercent(consistencyLimit)}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                        <span className="text-[10px] uppercase font-mono text-zinc-400 block truncate">
                          Current Score
                        </span>
                        <span className="text-base sm:text-lg font-bold font-mono text-amber-400">
                          {formatPercent(consistencyScore!)}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                        <span className="text-[10px] uppercase font-mono text-zinc-400 block truncate">
                          Target
                        </span>
                        <span className="text-base sm:text-lg font-bold font-mono text-zinc-100">
                          {formatPercent(consistencyLimit)}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                        <span className="text-[10px] uppercase font-mono text-zinc-400 block truncate">
                          Profit Needed
                        </span>
                        <span className="text-base sm:text-lg font-bold font-mono text-amber-400 truncate block">
                          {formatCurrency(additionalProfitNeeded)}
                        </span>
                      </div>
                    </div>

                    {activeResult.profitTarget !== null && activeResult.projectedConsistencyScore !== undefined && activeResult.additionalProfitNeeded > 0 && (
                      <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-[11px] font-mono text-zinc-300 flex items-center justify-between">
                        <span className="text-zinc-400">Projected at Target ({formatCurrency(activeResult.profitTarget)}):</span>
                        <span className="text-emerald-400 font-bold">{formatPercent(activeResult.projectedConsistencyScore)}</span>
                      </div>
                    )}
                  </div>

                  {/* Section 5: Daily Profit Plan Options */}
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between pb-1 border-b border-zinc-800/80">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-zinc-200 font-mono flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                          <span>DAILY PROFIT PLAN</span>
                        </h4>
                      </div>
                    </div>

                    {/* Column Legend */}
                    <div className="flex items-center justify-between px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                      <span>AVERAGE DAILY PROFIT</span>
                      <span>DAYS NEEDED</span>
                    </div>

                    {/* Dynamic Options List */}
                    <div className="space-y-2">
                      {planOptions.map((opt, index) => {
                        if (opt.isFastest) {
                          return (
                            /* Fastest Valid Path Highlighted Card */
                            <div
                              key={index}
                              className="relative rounded-xl p-3 bg-gradient-to-r from-blue-950/40 via-zinc-900 to-blue-950/40 border border-blue-400/60 shadow-md shadow-blue-950/40 space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-[10px] font-bold uppercase tracking-wider text-blue-300 font-mono">
                                  <Zap className="w-3 h-3 text-blue-400 fill-blue-400" />
                                  <span>⚡ FASTEST VALID PATH</span>
                                </span>
                              </div>

                              <div className="flex items-center justify-between font-mono">
                                <div className="text-base font-extrabold text-blue-200">
                                  {formatCurrency(opt.dailyProfit)}<span className="text-xs text-zinc-400 font-sans">/day</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-base font-bold text-white">
                                  <span className="text-zinc-500">→</span>
                                  <span className="px-2 py-0.5 rounded-lg bg-blue-500/30 text-blue-200 font-black">
                                    {opt.daysNeeded} {opt.daysNeeded === 1 ? 'day' : 'days'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          /* Standard Pace Card */
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 transition-colors font-mono"
                          >
                            <div className="text-sm font-bold text-zinc-200">
                              {formatCurrency(opt.dailyProfit)}<span className="text-xs text-zinc-400 font-sans">/day</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-zinc-300">
                              <span className="text-zinc-600">→</span>
                              <span>{opt.daysNeeded} {opt.daysNeeded === 1 ? 'day' : 'days'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 8: Clear Warning Box */}
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs leading-relaxed space-y-1">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] sm:text-xs leading-snug">
                        <strong className="font-semibold text-amber-200">⚠️ Keep each new trading day at or below your current best day</strong> ({formatCurrency(bestTradingDay)}) to keep your current highest-day value unchanged.
                      </p>
                    </div>
                  </div>
                </>
              )}

            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
