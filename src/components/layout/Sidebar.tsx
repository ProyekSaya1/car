import {
  LayoutDashboard,
  Car,
  UserCheck,
  Compass,
  Video,
  Film,
  Sparkles,
  Download,
  X,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';
import { ViewMode } from '../../types';

interface SidebarProps {
  activeView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  totalScenes: number;
}

interface NavItem {
  id: ViewMode;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string;
  description: string;
}

export function Sidebar({
  activeView,
  onNavigate,
  mobileOpen,
  onCloseMobile,
  totalScenes,
}: SidebarProps) {
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Ringkasan studio & statistik',
    },
    {
      id: 'vehicle',
      label: 'Vehicle Setup',
      icon: Car,
      description: 'Sasis, cat & bodi kustom',
    },
    {
      id: 'character',
      label: 'Character Setup',
      icon: UserCheck,
      description: 'Profil pengemudi & pakaian',
    },
    {
      id: 'location',
      label: 'Location Setup',
      icon: Compass,
      description: 'Lingkungan & cuaca',
    },
    {
      id: 'camera',
      label: 'Camera Control',
      icon: Video,
      description: 'Lensa, pergerakan & rig',
    },
    {
      id: 'storyboard',
      label: 'Storyboard',
      icon: Film,
      badge: `${totalScenes} scene`,
      description: 'Sekuens & timeline shot',
    },
    {
      id: 'prompts',
      label: 'Prompt Generator',
      icon: Sparkles,
      description: 'Sintesis prompt video AI',
    },
    {
      id: 'export',
      label: 'Export Center',
      icon: Download,
      description: 'Batch manifest & lembar shot',
    },
  ];

  const handleSelect = (view: ViewMode) => {
    onNavigate(view);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-zinc-950 border-r border-zinc-800/80 p-4">
      <div className="space-y-6">
        {/* Brand / Version Tag in sidebar */}
        <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-zinc-800/60">
          <div>
            <div className="text-xs uppercase tracking-widest text-zinc-500 font-mono font-semibold">
              Studio AI Otomotif
            </div>
            <div className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5 mt-0.5">
              <span>Suite Produksi Sinematik</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                v2.0
              </span>
            </div>
          </div>
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 md:hidden"
              aria-label="Tutup sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
            Menu Navigasi
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`group relative flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-sm border border-zinc-700/80'
                    : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
                }`}
              >
                {/* Active Indicator Accent line */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-emerald-400 to-cyan-500" />
                )}

                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-900 text-zinc-400 group-hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${isActive ? 'font-semibold text-white' : 'font-medium'}`}>
                        {item.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-tight">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-cyan-300">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight
                    className={`h-3.5 w-3.5 text-zinc-600 transition-transform ${
                      isActive ? 'text-emerald-400 translate-x-0.5' : 'group-hover:translate-x-0.5'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Specs */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 mt-4">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
          <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
            <SlidersHorizontal className="h-3.5 w-3.5 text-cyan-400" />
            Preset Engine AI
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">Siap Digunakan</span>
        </div>
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          Mendukung format prompt untuk Kling 1.5, Runway Gen-3, Sora, dan Luma.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden md:block w-64 lg:w-72 shrink-0 h-[calc(100vh-4rem)] sticky top-16 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile drawer with backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
