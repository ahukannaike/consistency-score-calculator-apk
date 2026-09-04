import React from 'react';
import { TrendingUp, WifiOff } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full pt-[max(0.875rem,env(safe-area-inset-top))] pb-3 px-3.5 sm:px-4 border-b border-zinc-800/80 bg-zinc-950/95 sticky top-0 z-30 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 mb-1.5 flex-nowrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0 flex items-center justify-center rounded-lg bg-zinc-900/90 border border-zinc-700/60 p-1 shadow-md overflow-hidden">
            <img
              src="/bypass-logo.jpg"
              alt="BY-PASS Logo"
              referrerPolicy="no-referrer"
              className="h-8 sm:h-9 w-auto max-w-[38px] sm:max-w-[42px] object-contain rounded"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-black tracking-wider text-zinc-50 font-mono truncate flex items-center gap-2">
              BY-PASS
            </h1>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] sm:text-[11px] font-medium text-zinc-400">
          <WifiOff className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="whitespace-nowrap">100% Offline</span>
        </div>
      </div>

      <p className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase text-zinc-400 font-mono flex items-center gap-1.5 mt-0.5 break-words leading-tight">
        <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0 inline" />
        <span>PROP FIRM CONSISTENCY SCORE CALCULATOR</span>
      </p>
    </header>
  );
};
