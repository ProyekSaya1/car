import { Menu, Sparkles, Download, Layers } from 'lucide-react';
import { ProjectState, ViewMode } from '../../types';

interface HeaderProps {
  project: ProjectState;
  activeView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onToggleMobileSidebar: () => void;
  onSelectScene: (sceneId: string) => void;
  onQuickGenerate: () => void;
}

export function Header({
  project,
  activeView,
  onNavigate,
  onToggleMobileSidebar,
  onSelectScene,
  onQuickGenerate,
}: HeaderProps) {
  const viewTitles: Record<ViewMode, string> = {
    dashboard: 'Ringkasan Studio',
    vehicle: 'Pengaturan Kendaraan & Bodi',
    character: 'Pengaturan Pengemudi & Karakter',
    location: 'Pengaturan Lokasi & Suasana',
    camera: 'Kontrol Kamera & Optik',
    storyboard: 'Timeline Storyboard',
    prompts: 'Generator Prompt AI',
    export: 'Pusat Ekspor & Manifest',
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-800/80 bg-zinc-950/90 px-4 md:px-6 backdrop-blur-md">
      {/* Left side: Mobile Toggle & Header Brand */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onToggleMobileSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 md:hidden transition-colors"
          aria-label="Buka menu navigasi"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <h1 className="text-base md:text-lg font-bold tracking-tight text-white uppercase">
              CAR SCENE ENGINE <span className="text-emerald-400 font-mono text-sm md:text-base font-semibold">V2.0</span>
            </h1>
          </div>

          <span className="hidden sm:inline-block text-zinc-600">/</span>

          <span className="hidden sm:inline-block text-xs font-medium text-zinc-400 truncate max-w-[200px]">
            {viewTitles[activeView]}
          </span>
        </div>
      </div>

      {/* Right side: Active Scene Quick Selector & Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Active Scene Dropdown Pill */}
        <div className="hidden lg:flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-300">
          <Layers className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-zinc-500">Scene Aktif:</span>
          <select
            value={project.activeSceneId}
            onChange={(e) => onSelectScene(e.target.value)}
            className="bg-transparent text-xs font-medium text-emerald-300 focus:outline-none cursor-pointer"
          >
            {project.scenes.map((scene) => (
              <option key={scene.id} value={scene.id} className="bg-zinc-900 text-zinc-100">
                Scene {scene.sceneNumber}: {scene.title}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Generate Action */}
        <button
          onClick={onQuickGenerate}
          className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-all active:scale-95"
          title="Buka generator prompt untuk scene aktif"
        >
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Buat Prompt AI</span>
          <span className="sm:hidden">Prompt</span>
        </button>

        {/* Export Center Shortcut */}
        <button
          onClick={() => onNavigate('export')}
          className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition-all active:scale-95"
          title="Buka pusat ekspor manifest"
        >
          <Download className="h-3.5 w-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Pusat Ekspor</span>
          <span className="sm:hidden">Ekspor</span>
        </button>
      </div>
    </header>
  );
}
