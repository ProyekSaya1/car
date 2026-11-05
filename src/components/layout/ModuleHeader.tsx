import { ArrowLeft, ArrowRight, LayoutDashboard, ChevronRight } from 'lucide-react';
import { ViewMode } from '../../types';

interface ModuleHeaderProps {
  moduleNumber: string;
  moduleTitle: string;
  moduleDescription: string;
  currentView: ViewMode;
  onNavigate?: (view: ViewMode) => void;
  prevView?: { view: ViewMode; label: string };
  nextView?: { view: ViewMode; label: string };
  extraActions?: React.ReactNode;
}

export function ModuleHeader({
  moduleNumber,
  moduleTitle,
  moduleDescription,
  onNavigate,
  prevView,
  nextView,
  extraActions,
}: ModuleHeaderProps) {
  if (!onNavigate) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-6 border-b border-zinc-800/80 bg-zinc-950/40 rounded-xl p-3">
      {/* Left: Breadcrumb & Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-850 transition-all shrink-0 active:scale-95 shadow-sm"
          title="Kembali ke Dashboard Utama"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-emerald-400" />
          <span>Dashboard</span>
        </button>

        <ChevronRight className="h-3.5 w-3.5 text-zinc-600 shrink-0 hidden xs:inline" />

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              {moduleNumber}
            </span>
            <span className="text-xs sm:text-sm font-bold text-white truncate">
              {moduleTitle}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 truncate hidden md:block">
            {moduleDescription}
          </p>
        </div>
      </div>

      {/* Right: Step Navigation (Prev / Next) & Extra Actions */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        {prevView && (
          <button
            onClick={() => onNavigate(prevView.view)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
            title={`Kembali ke ${prevView.label}`}
          >
            <ArrowLeft className="h-3 w-3" />
            <span className="hidden sm:inline">{prevView.label}</span>
          </button>
        )}

        {nextView && (
          <button
            onClick={() => onNavigate(nextView.view)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-[11px] font-semibold text-emerald-300 transition-colors"
            title={`Lanjut ke ${nextView.label}`}
          >
            <span>{nextView.label}</span>
            <ArrowRight className="h-3 w-3 text-emerald-400" />
          </button>
        )}

        {extraActions}
      </div>
    </div>
  );
}
