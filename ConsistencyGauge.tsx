import React, { useEffect, useState, useRef } from 'react';
import { formatPercent } from '../utils/calculator';
import { Activity } from 'lucide-react';

interface ConsistencyGaugeProps {
  score: number;
  limit: number;
  isPassed: boolean;
  calculationKey?: number | string;
  onAnimationComplete?: () => void;
  onStateChange?: (isRevealed: boolean) => void;
}

export const ConsistencyGauge: React.FC<ConsistencyGaugeProps> = ({
  score,
  limit,
  isPassed,
  calculationKey,
  onAnimationComplete,
  onStateChange,
}) => {
  // Respect user preference for reduced motion
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [displayValue, setDisplayValue] = useState<number>(prefersReducedMotion ? score : 0);
  const [gaugeValue, setGaugeValue] = useState<number>(prefersReducedMotion ? score : 0);
  const [isRevealed, setIsRevealed] = useState<boolean>(prefersReducedMotion);
  const [isPulsing, setIsPulsing] = useState<boolean>(false);

  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastRollTimeRef = useRef<number>(0);

  // Dynamic max scale for gauge visualization (ensure limit & score are well spaced)
  const maxScale = Math.max(50, Math.ceil(Math.max(score, limit * 1.5) / 10) * 10);

  // SVG Arc Geometry (180-degree semicircular dial)
  const cx = 110;
  const cy = 95;
  const radius = 75;
  const strokeWidth = 10;
  const arcLength = Math.PI * radius; // ~235.62

  // Progress fractions clamped to [0, 1] relative to maxScale
  const scoreProgress = Math.min(Math.max(gaugeValue / maxScale, 0), 1);
  const limitProgress = Math.min(Math.max(limit / maxScale, 0), 1);

  // Stroke dash offset calculation
  const targetOffset = arcLength * (1 - scoreProgress);

  // Position on circle for limit marker
  const limitAngle = Math.PI * (1 - limitProgress);
  const limitMarkerX = cx + radius * Math.cos(limitAngle);
  const limitMarkerY = cy - radius * Math.sin(limitAngle);

  // Position on circle for current needle/pip tip
  const currentAngle = Math.PI * (1 - scoreProgress);
  const needleTipX = cx + (radius - 2) * Math.cos(currentAngle);
  const needleTipY = cy - (radius - 2) * Math.sin(currentAngle);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(score);
      setGaugeValue(score);
      setIsRevealed(true);
      setIsPulsing(false);
      onStateChange?.(true);
      onAnimationComplete?.();
      return;
    }

    // Initialize spinning sequence
    setIsRevealed(false);
    setIsPulsing(false);
    onStateChange?.(false);
    setDisplayValue(0);
    setGaugeValue(0);
    startTimeRef.current = null;
    lastRollTimeRef.current = 0;

    // Sequence timings (in ms)
    // 0ms - 1300ms: rapid spinning/rolling
    // 1300ms - 1950ms: gradual deceleration toward real score
    // 1950ms - 2200ms: exact convergence and lock on real score
    // 2200ms - 2600ms: subtle settlement and pulse
    const DURATION_SPIN = 1300;
    const DURATION_DECEL = 650; // ends at 1950ms
    const DURATION_LOCK = 250;  // ends at 2200ms
    const TOTAL_ANIMATION = DURATION_SPIN + DURATION_DECEL + DURATION_LOCK; // 2200ms

    // Pre-calculated seed sequence for smooth mechanical rhythm during spin
    const sampleDeltas = [8.7, 21.4, 13.2, 26.8, 17.5, 11.9, 29.3, 16.1, 23.5, 9.4, 31.2, 14.6, 27.1, 18.9, 22.8];
    let sampleIdx = 0;
    let transitionStartVal = 0;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
        lastRollTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;

      if (elapsed < DURATION_SPIN) {
        // --- PHASE 1: Rapid Spinning / Rolling (0ms - 1300ms) ---
        // Update displayed numerical value every ~45ms for readable yet rapid rolling effect
        if (timestamp - lastRollTimeRef.current > 45) {
          lastRollTimeRef.current = timestamp;
          const baseSample = sampleDeltas[sampleIdx % sampleDeltas.length];
          // Plausible variation around scale
          const jitter = (Math.sin(elapsed * 0.015) * 6.5);
          const nextVal = Math.max(1.5, Math.min(maxScale * 0.85, baseSample + jitter));
          setDisplayValue(Number(nextVal.toFixed(1)));
          sampleIdx++;
        }

        // Smooth continuous sinusoidal sweep for the gauge needle during spinning
        const sweepPhase = elapsed / DURATION_SPIN;
        const needleSweep = (Math.sin(sweepPhase * Math.PI * 4 - Math.PI / 2) + 1) / 2; // 0 to 1 oscillating
        const sweepGaugeVal = Math.max(3, needleSweep * (limit * 1.35) + 5);
        setGaugeValue(sweepGaugeVal);
        transitionStartVal = sweepGaugeVal;

        animationFrameRef.current = requestAnimationFrame(animate);
      } else if (elapsed < DURATION_SPIN + DURATION_DECEL) {
        // --- PHASE 2: Gradual Deceleration (1300ms - 1950ms) ---
        const decelElapsed = elapsed - DURATION_SPIN;
        const progress = Math.min(decelElapsed / DURATION_DECEL, 1);
        // Quartic ease-out curve for realistic mechanical braking
        const easeOut = 1 - Math.pow(1 - progress, 4);

        // Interpolate gauge value smoothly toward actual score
        const currentGauge = transitionStartVal + (score - transitionStartVal) * easeOut;
        setGaugeValue(currentGauge);

        // As it decelerates, slow down the number roll and converge to decimal neighborhood
        const stepInterval = 50 + progress * 90; // slows from 50ms to 140ms
        if (timestamp - lastRollTimeRef.current > stepInterval || progress > 0.85) {
          lastRollTimeRef.current = timestamp;
          // Interpolate number toward score with small diminishing noise
          const noise = (1 - progress) * (Math.sin(elapsed * 0.03) * 4.5);
          const interpolatedDisplay = Math.max(0, currentGauge + noise);
          setDisplayValue(Number(interpolatedDisplay.toFixed(1)));
        }

        animationFrameRef.current = requestAnimationFrame(animate);
      } else if (elapsed < TOTAL_ANIMATION) {
        // --- PHASE 3: Exact Final Convergence (1950ms - 2200ms) ---
        const lockElapsed = elapsed - (DURATION_SPIN + DURATION_DECEL);
        const lockProgress = Math.min(lockElapsed / DURATION_LOCK, 1);
        const smoothStep = 1 - Math.pow(1 - lockProgress, 3);

        // Step through final decimal fractions directly into exact score
        const finalApproximation = score * (0.95 + 0.05 * (1 - smoothStep));
        const val = Number((score - (score - finalApproximation) * (1 - smoothStep)).toFixed(2));
        
        setDisplayValue(val);
        setGaugeValue(score * (0.98 + 0.02 * (1 - smoothStep)));

        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // --- PHASE 4: Lock, Reveal Exact Result & Settle (2200ms+) ---
        // MUST GUARANTEE stopping exactly at the calculated score
        setDisplayValue(score);
        setGaugeValue(score);
        setIsRevealed(true);
        setIsPulsing(true);
        onStateChange?.(true);
        onAnimationComplete?.();

        // Small final micro-settle on gauge needle (2.2s - 2.5s)
        const settleTimer = setTimeout(() => {
          setIsPulsing(false);
        }, 500);

        return () => clearTimeout(settleTimer);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [score, limit, calculationKey, prefersReducedMotion]);

  const activeColor = isPassed ? '#10b981' : '#f59e0b';
  const glowClass = isPassed ? 'text-emerald-400' : 'text-amber-400';

  return (
    <div className="flex flex-col items-center justify-center relative select-none w-full max-w-[270px] mx-auto">
      {/* SVG Arc Gauge Container */}
      <div className="w-full relative flex items-center justify-center">
        <svg
          viewBox="0 0 220 125"
          className="w-full h-auto overflow-visible drop-shadow-[0_4px_14px_rgba(0,0,0,0.5)]"
          aria-hidden="true"
        >
          <defs>
            {/* Dynamic Arc Gradient */}
            <linearGradient id={`gauge-grad-${isPassed ? 'pass' : 'fail'}`} x1="0%" y1="0%" x2="100%" y2="0%">
              {isPassed ? (
                <>
                  <stop offset="0%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#34d399" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </>
              )}
            </linearGradient>

            {/* Glowing filter */}
            <filter id="gauge-glow" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="#27272a"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Target Limit Reference Line / Indicator */}
          {limitProgress > 0 && limitProgress < 1 && (
            <g>
              <line
                x1={cx + (radius - 9) * Math.cos(limitAngle)}
                y1={cy - (radius - 9) * Math.sin(limitAngle)}
                x2={cx + (radius + 9) * Math.cos(limitAngle)}
                y2={cy - (radius + 9) * Math.sin(limitAngle)}
                stroke="#a1a1aa"
                strokeWidth="2"
                strokeDasharray="2 1"
                className="opacity-80"
              />
              <circle
                cx={limitMarkerX}
                cy={limitMarkerY}
                r="2.5"
                fill="#f4f4f5"
              />
            </g>
          )}

          {/* Active Animated Progress Arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke={isRevealed ? `url(#gauge-grad-${isPassed ? 'pass' : 'fail'})` : '#38bdf8'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={targetOffset}
            filter="url(#gauge-glow)"
            style={{
              transition: isRevealed ? 'stroke-dashoffset 0.15s ease-out' : 'none',
            }}
          />

          {/* Needle / Pip Head Indicator */}
          {scoreProgress > 0.01 && (
            <circle
              cx={needleTipX}
              cy={needleTipY}
              r={isPulsing ? 5.5 : 4.5}
              fill="#ffffff"
              stroke={isRevealed ? activeColor : '#38bdf8'}
              strokeWidth="2.5"
              className="drop-shadow-[0_0_8px_rgba(255,255,255,0.9)] transition-all duration-200"
            />
          )}

          {/* Scale Start and End Labels */}
          <text x={cx - radius} y={cy + 16} fill="#71717a" fontSize="10" fontFamily="monospace" textAnchor="middle">
            0%
          </text>
          <text x={cx + radius} y={cy + 16} fill="#71717a" fontSize="10" fontFamily="monospace" textAnchor="middle">
            {maxScale}%
          </text>
        </svg>

        {/* Central Numerical Score Display with Rolling / Spinning Effect */}
        <div className="absolute inset-x-0 bottom-0.5 flex flex-col items-center justify-center text-center pointer-events-none">
          <div
            className={`text-3xl sm:text-4xl font-black font-mono tracking-tight transition-all duration-200 ${
              !isRevealed
                ? 'text-sky-300 drop-shadow-[0_0_12px_rgba(56,189,248,0.6)] scale-[1.03]'
                : isPulsing
                  ? `${glowClass} scale-105 drop-shadow-[0_0_16px_rgba(16,185,129,0.8)]`
                  : `${glowClass} scale-100`
            }`}
          >
            {formatPercent(displayValue)}
          </div>

          {/* Spinning / Calculating Status Subtitle */}
          {!isRevealed && (
            <div className="flex items-center gap-1.5 mt-1 text-[10px] sm:text-[11px] font-mono font-bold text-sky-400/90 uppercase tracking-wider">
              <Activity className="w-3 h-3 animate-spin text-sky-400" />
              <span className="animate-pulse">CALCULATING CONSISTENCY...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
