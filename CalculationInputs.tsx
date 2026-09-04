import React, { useState } from 'react';
import { CalculationInputs as InputsType, ValidationResult } from '../types';
import { Calculator, RotateCcw, AlertCircle, AlertTriangle, ChevronDown, ChevronUp, DollarSign, Percent, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CalculationInputsProps {
  inputs: InputsType;
  onChange: (field: keyof InputsType, value: string) => void;
  onCalculate: () => void;
  onReset: () => void;
  validation: ValidationResult | null;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isCalculating?: boolean;
}

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export const CalculationInputs: React.FC<CalculationInputsProps> = ({
  inputs,
  onChange,
  onCalculate,
  onReset,
  validation,
  isExpanded,
  onToggleExpand,
  isCalculating = false,
}) => {
  const [activeField, setActiveField] = useState<string | null>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const errors = validation?.errors || {};
  const warnings = validation?.warnings || {};

  const handleNumericInput = (field: keyof InputsType, rawValue: string) => {
    // Allow numbers, commas, and a single decimal point
    const sanitized = rawValue.replace(/[^0-9.,]/g, '');
    onChange(field, sanitized);
  };

  const handleFocus = (field: string) => (e: React.FocusEvent<HTMLInputElement>) => {
    setActiveField(field);
    // Delay scroll slightly to allow virtual keyboards to finish expanding
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  const handleBlur = () => {
    setActiveField(null);
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { x, y, id: Date.now() };

    setRipples((prev) => [...prev.slice(-2), newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    onCalculate();
  };

  return (
    <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800/90 shadow-xl overflow-hidden backdrop-blur-sm">
      {/* Accordion Header */}
      <button
        id="section-inputs-toggle"
        type="button"
        onClick={onToggleExpand}
        className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left transition-colors hover:bg-zinc-800/40 active:bg-zinc-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer min-h-[52px]"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-7 h-7 shrink-0 rounded-lg border flex items-center justify-center font-bold text-xs transition-colors duration-200 ${
            activeField 
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            1
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-100 font-mono truncate flex items-center gap-1.5">
              <span>CALCULATION INPUTS</span>
              {activeField && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-400 leading-tight">
              Enter your trading metrics and prop firm parameters
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
            <div className="p-3.5 sm:p-4 pt-3 border-t border-zinc-800/60 space-y-3.5">
              {/* Form Fields Grid */}
              {/* 1. Profit Target (Optional) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="input-profit-target" className={`text-xs font-semibold transition-colors duration-200 ${
                    activeField === 'profitTarget' ? 'text-emerald-300' : 'text-zinc-200'
                  }`}>
                    1. Profit Target <span className="text-zinc-500 font-normal">(Optional)</span>
                  </label>
                  <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded transition-colors ${
                    activeField === 'profitTarget' ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-300' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    Optional
                  </span>
                </div>
                <div className={`relative rounded-xl bg-zinc-950/80 border transition-all duration-200 ${
                  activeField === 'profitTarget'
                    ? 'border-emerald-400/90 ring-2 ring-emerald-500/20 shadow-[0_0_16px_rgba(16,185,129,0.22)]'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}>
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                    activeField === 'profitTarget' ? 'text-emerald-400' : 'text-zinc-500'
                  }`}>
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input
                    id="input-profit-target"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    spellCheck={false}
                    value={inputs.profitTarget}
                    onFocus={handleFocus('profitTarget')}
                    onBlur={handleBlur}
                    onChange={(e) => handleNumericInput('profitTarget', e.target.value)}
                    placeholder="e.g. 3,000"
                    className="w-full pl-8 pr-4 py-3 sm:py-2.5 bg-transparent text-base sm:text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none font-mono min-h-[44px]"
                  />
                </div>
                <p className="text-[11px] text-zinc-400 leading-tight">
                  Enter your prop firm's profit target if applicable.
                </p>
                {errors.profitTarget && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errors.profitTarget}</span>
                  </p>
                )}
              </div>

              {/* 2. Consistency Limit (%) */}
              <div className="space-y-1">
                <label htmlFor="input-consistency-limit" className={`text-xs font-semibold transition-colors duration-200 ${
                  activeField === 'consistencyLimit' ? 'text-emerald-300' : 'text-zinc-200'
                }`}>
                  2. Consistency Limit (%) <span className="text-emerald-400">*</span>
                </label>
                <div className={`relative rounded-xl bg-zinc-950/80 border transition-all duration-200 ${
                  errors.consistencyLimit 
                    ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-[0_0_14px_rgba(244,63,94,0.25)]' 
                    : activeField === 'consistencyLimit'
                      ? 'border-emerald-400/90 ring-2 ring-emerald-500/20 shadow-[0_0_16px_rgba(16,185,129,0.22)]'
                      : 'border-zinc-800 hover:border-zinc-700'
                }`}>
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                    activeField === 'consistencyLimit' ? 'text-emerald-400' : 'text-zinc-500'
                  }`}>
                    <Percent className="w-4 h-4" />
                  </div>
                  <input
                    id="input-consistency-limit"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    spellCheck={false}
                    value={inputs.consistencyLimit}
                    onFocus={handleFocus('consistencyLimit')}
                    onBlur={handleBlur}
                    onChange={(e) => handleNumericInput('consistencyLimit', e.target.value)}
                    placeholder="20"
                    className="w-full pl-8 pr-8 py-3 sm:py-2.5 bg-transparent text-base sm:text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none font-mono min-h-[44px]"
                  />
                  <div className={`absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-mono transition-colors duration-200 ${
                    activeField === 'consistencyLimit' ? 'text-emerald-400 font-bold' : 'text-zinc-500'
                  }`}>
                    %
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 leading-tight">
                  Enter the consistency limit allowed by your prop firm before payout.
                </p>
                {errors.consistencyLimit && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errors.consistencyLimit}</span>
                  </p>
                )}
                {warnings.consistencyLimit && (
                  <p className="text-[11px] text-amber-400 flex items-center gap-1 font-medium mt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{warnings.consistencyLimit}</span>
                  </p>
                )}
              </div>

              {/* 3. Total Profit */}
              <div className="space-y-1">
                <label htmlFor="input-total-profit" className={`text-xs font-semibold transition-colors duration-200 ${
                  activeField === 'totalProfit' ? 'text-emerald-300' : 'text-zinc-200'
                }`}>
                  3. Total Profit <span className="text-emerald-400">*</span>
                </label>
                <div className={`relative rounded-xl bg-zinc-950/80 border transition-all duration-200 ${
                  errors.totalProfit 
                    ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-[0_0_14px_rgba(244,63,94,0.25)]' 
                    : activeField === 'totalProfit'
                      ? 'border-emerald-400/90 ring-2 ring-emerald-500/20 shadow-[0_0_16px_rgba(16,185,129,0.22)]'
                      : 'border-zinc-800 hover:border-zinc-700'
                }`}>
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                    activeField === 'totalProfit' ? 'text-emerald-400' : 'text-zinc-500'
                  }`}>
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input
                    id="input-total-profit"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    spellCheck={false}
                    value={inputs.totalProfit}
                    onFocus={handleFocus('totalProfit')}
                    onBlur={handleBlur}
                    onChange={(e) => handleNumericInput('totalProfit', e.target.value)}
                    placeholder="e.g. 2,500"
                    className="w-full pl-8 pr-4 py-3 sm:py-2.5 bg-transparent text-base sm:text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none font-mono min-h-[44px]"
                  />
                </div>
                <p className="text-[11px] text-zinc-400 leading-tight">
                  Enter your current total profit.
                </p>
                {errors.totalProfit && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errors.totalProfit}</span>
                  </p>
                )}
              </div>

              {/* 4. Current Best Trading Day */}
              <div className="space-y-1">
                <label htmlFor="input-best-trading-day" className={`text-xs font-semibold transition-colors duration-200 ${
                  activeField === 'bestTradingDay' ? 'text-emerald-300' : 'text-zinc-200'
                }`}>
                  4. Current Best Trading Day <span className="text-emerald-400">*</span>
                </label>
                <div className={`relative rounded-xl bg-zinc-950/80 border transition-all duration-200 ${
                  errors.bestTradingDay 
                    ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-[0_0_14px_rgba(244,63,94,0.25)]' 
                    : activeField === 'bestTradingDay'
                      ? 'border-emerald-400/90 ring-2 ring-emerald-500/20 shadow-[0_0_16px_rgba(16,185,129,0.22)]'
                      : 'border-zinc-800 hover:border-zinc-700'
                }`}>
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                    activeField === 'bestTradingDay' ? 'text-emerald-400' : 'text-zinc-500'
                  }`}>
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input
                    id="input-best-trading-day"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    spellCheck={false}
                    value={inputs.bestTradingDay}
                    onFocus={handleFocus('bestTradingDay')}
                    onBlur={handleBlur}
                    onChange={(e) => handleNumericInput('bestTradingDay', e.target.value)}
                    placeholder="e.g. 700"
                    className="w-full pl-8 pr-4 py-3 sm:py-2.5 bg-transparent text-base sm:text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none font-mono min-h-[44px]"
                  />
                </div>
                <p className="text-[11px] text-zinc-400 leading-tight">
                  Enter your highest-profit trading day.
                </p>
                {errors.bestTradingDay && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errors.bestTradingDay}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                {/* Upgraded Futuristic Animated Calculate Button */}
                <div className="relative group">
                  {/* Ambient Pulsing Aura Glow */}
                  <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 opacity-60 group-hover:opacity-100 blur-sm animate-btn-pulse transition-opacity duration-300 pointer-events-none" />

                  <button
                    id="btn-calculate-score"
                    type="button"
                    disabled={isCalculating}
                    onClick={handleButtonClick}
                    className={`relative w-full min-h-[52px] py-3.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider font-mono shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none overflow-hidden touch-manipulation active:scale-[0.98] active:brightness-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                      isCalculating
                        ? 'bg-zinc-900 border border-emerald-500/50 text-emerald-300 cursor-wait'
                        : 'bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-300 text-zinc-950 shadow-emerald-950/60'
                    }`}
                  >
                    {/* Ripple animation elements */}
                    {ripples.map((r) => (
                      <span
                        key={r.id}
                        style={{ left: r.x, top: r.y }}
                        className="absolute w-24 h-24 -ml-12 -mt-12 rounded-full bg-white/40 pointer-events-none animate-[rippleEffect_0.6s_ease-out_forwards]"
                      />
                    ))}

                    {/* Button Content / Scanning Processing State */}
                    {isCalculating ? (
                      <div className="relative z-10 flex items-center justify-center gap-2 w-full">
                        {/* Scanning beam effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/25 to-transparent animate-radar-scan pointer-events-none" />
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
                        <span className="tracking-widest text-xs sm:text-sm font-bold text-emerald-300 animate-terminal-blink">
                          ANALYZING TRADING DATA...
                        </span>
                      </div>
                    ) : (
                      <div className="relative z-10 flex items-center justify-center gap-2">
                        <Calculator className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                        <span>CALCULATE SCORE</span>
                        <Sparkles className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                    )}
                  </button>
                </div>

                <div className="flex justify-center">
                  <button
                    id="btn-reset-inputs"
                    type="button"
                    onClick={onReset}
                    className="min-h-[44px] py-2 px-3 rounded-lg text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 active:bg-zinc-800 transition-all duration-150 flex items-center gap-1.5 cursor-pointer touch-manipulation active:scale-[0.97]"
                  >
                    <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                    <span>Reset Calculator</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
