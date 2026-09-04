import React, { useState, useRef } from 'react';
import { CalculationInputs as InputsType, CalculationResult, ValidationResult } from './types';
import { calculateConsistencyScore, validateInputs } from './utils/calculator';
import { Header } from './components/Header';
import { CalculationInputs } from './components/CalculationInputs';
import { YourResults } from './components/YourResults';
import { DailyProfitPlanTab } from './components/DailyProfitPlanTab';
import { DailyProfitPlanDrawer } from './components/DailyProfitPlanDrawer';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const [inputs, setInputs] = useState<InputsType>({
    profitTarget: '',
    consistencyLimit: '20',
    totalProfit: '',
    bestTradingDay: '',
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [calculationKey, setCalculationKey] = useState<number>(0);
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  // Expand / collapse states according to specifications
  const [isInputsExpanded, setIsInputsExpanded] = useState<boolean>(true);
  const [isResultsExpanded, setIsResultsExpanded] = useState<boolean>(false);
  const [isDailyPlanOpen, setIsDailyPlanOpen] = useState<boolean>(false);

  const resultsRef = useRef<HTMLDivElement | null>(null);

  const handleInputChange = (field: keyof InputsType, value: string) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for that field when user types
    if (validation?.errors[field]) {
      setValidation((prev) => {
        if (!prev) return null;
        const newErrors = { ...prev.errors };
        delete newErrors[field];
        return {
          ...prev,
          isValid: Object.keys(newErrors).length === 0,
          errors: newErrors,
        };
      });
    }
  };

  const handleCalculate = () => {
    const val = validateInputs(inputs);
    setValidation(val);

    if (val.isValid) {
      // 1. Instantly perform the exact calculation
      const calculated = calculateConsistencyScore(inputs);
      setResult(calculated);
      setCalculationKey(Date.now());
      setIsResultsExpanded(true);

      // 2. Smoothly bring the animated results reveal directly into viewport
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 60);
    }
  };

  const handleReset = () => {
    setInputs({
      profitTarget: '',
      consistencyLimit: '20',
      totalProfit: '',
      bestTradingDay: '',
    });
    setResult(null);
    setCalculationKey(0);
    setValidation(null);
    setIsResultsExpanded(false);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-zinc-950 text-zinc-100 flex flex-col items-center selection:bg-emerald-500 selection:text-zinc-950 font-sans antialiased">
      {/* Mobile-first Constrained Container with dynamic viewport handling */}
      <main className="w-full max-w-lg min-h-screen min-h-[100dvh] bg-zinc-950 flex flex-col border-x border-zinc-900/50 shadow-2xl relative">
        {/* Top Header with Sticky Nav & Safe Area Padding */}
        <Header />

        {/* Scrollable Screen Content with Safe Area Bottom Padding */}
        <div className="flex-1 p-3.5 sm:p-4 space-y-4 pb-[max(3rem,calc(env(safe-area-inset-bottom)+1.5rem))] overflow-y-auto">
          
          {/* Section 1: Calculation Inputs (Expanded by default) */}
          <section id="section-inputs" className="scroll-mt-20">
            <CalculationInputs
              inputs={inputs}
              onChange={handleInputChange}
              onCalculate={handleCalculate}
              onReset={handleReset}
              validation={validation}
              isExpanded={isInputsExpanded}
              onToggleExpand={() => setIsInputsExpanded((prev) => !prev)}
            />
          </section>

          {/* Section 2: Your Results (Revealed with animated rolling sequence) */}
          {result && (
            <section id="section-results" ref={resultsRef} className="scroll-mt-20">
              <YourResults
                result={result}
                calculationKey={calculationKey}
                isExpanded={isResultsExpanded}
                onToggleExpand={() => setIsResultsExpanded((prev) => !prev)}
              />
            </section>
          )}

          {/* Offline Security Footer Note */}
          <footer className="pt-2 pb-4 text-center">
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/70 border border-zinc-800/80 text-[11px] text-zinc-500 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Offline Local Engine &bull; Private &bull; No Data Transferred</span>
            </div>
            <p className="text-[10px] text-zinc-600 mt-2 font-mono">
              BY-PASS v1.0.0 &bull; Prop Firm Consistency Calculator
            </p>
          </footer>

        </div>
      </main>

      {/* Floating Daily Profit Plan Tab (Right Edge of Screen) */}
      <DailyProfitPlanTab
        isOpen={isDailyPlanOpen}
        onClick={() => setIsDailyPlanOpen(true)}
      />

      {/* Slide-out Daily Profit Plan Drawer Overlay */}
      <DailyProfitPlanDrawer
        isOpen={isDailyPlanOpen}
        onClose={() => setIsDailyPlanOpen(false)}
        result={result}
        inputs={inputs}
      />
    </div>
  );
}
