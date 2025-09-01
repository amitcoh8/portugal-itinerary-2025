import React from "react";

type ItineraryHeaderProps = {
  title: string;
  subtitle?: string;
  progressPercent?: number;
  onGoToToday?: () => void;
};

export function ItineraryHeader({ title, subtitle, progressPercent, onGoToToday }: ItineraryHeaderProps) {
  const pct = Math.max(0, Math.min(100, progressPercent ?? 0));
  return (
    <header className="bg-white/90 backdrop-blur-lg sticky top-0 z-20 border-b border-gray-200/80 print:static print:border-none">
      <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-500">{subtitle}</p>}
        </div>
        {onGoToToday && (
          <button onClick={onGoToToday} className="flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 whitespace-nowrap">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-check"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>
            Go to today
          </button>
        )}
      </div>
      {typeof progressPercent === 'number' && (
        <div className="max-w-4xl mx-auto px-6 pb-4">
            <div className="flex items-center gap-3">
                <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden" aria-label="Trip progress">
                    <div className="h-full bg-gray-900" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs tabular-nums text-gray-600">{Math.round(pct)}%</span>
            </div>
        </div>
      )}
    </header>
  );
}
