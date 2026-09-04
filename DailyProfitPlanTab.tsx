import React from 'react';
import { BarChart3 } from 'lucide-react';

interface DailyProfitPlanTabProps {
  onClick: () => void;
  isOpen: boolean;
}

export const DailyProfitPlanTab: React.FC<DailyProfitPlanTabProps> = ({ onClick, isOpen }) => {
  if (isOpen) return null;

  return (
    <button
      id="btn-open-daily-plan-tab"
      type="button"
      onClick={onClick}
      aria-label="Open Daily Recovery Plan"
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center gap-1.5 py-2.5 px-3 rounded-l-xl bg-zinc-900/95 border-y border-l border-blue-500/40 text-blue-400 hover:text-blue-300 hover:bg-zinc-800 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all active:scale-95 cursor-pointer touch-manipulation backdrop-blur-md group"
    >
      <BarChart3 className="w-4 h-4 shrink-0 text-blue-400 group-hover:scale-110 transition-transform" />
      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider font-mono whitespace-nowrap">
        DAILY RECOVERY PLAN
      </span>
    </button>
  );
};
