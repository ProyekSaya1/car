import { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Plus,
  FolderOpen,
  Edit2,
  Trash2,
  Download,
  Menu,
} from 'lucide-react';
import { ProjectState } from '../../types';
import { downloadProjectZip } from '../../utils/zipExporter';

interface HeaderProps {
  project: ProjectState;
  saveStatus?: 'saved' | 'saving' | 'error';
  onNewProject: () => void;
  onOpenProject: () => void;
  onRenameProject: () => void;
  onDeleteProject: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onToggleMobileMenu?: () => void;
}

export function Header({
  project,
  saveStatus = 'saved',
  onNewProject,
  onOpenProject,
  onRenameProject,
  onDeleteProject,
  onShowToast,
  onToggleMobileMenu,
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      await downloadProjectZip(project);
      onShowToast('Berkas ZIP proyek berhasil diunduh!');
    } catch (err) {
      console.error(err);
      onShowToast('Gagal mengunduh ZIP', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-zinc-800/80 bg-zinc-950/95 px-3 sm:px-5 backdrop-blur-md">
      {/* Brand & Project Dropdown */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
          <div className="flex items-center gap-1.5 font-extrabold tracking-tight text-white uppercase text-sm sm:text-base">
            <span>CAR SCENE</span>
            <span className="text-emerald-400 font-mono text-xs font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              V2.0
            </span>
          </div>
        </div>

        {/* Separator */}
        <div className="hidden sm:block h-5 w-[1px] bg-zinc-800" />

        {/* Project Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800/90 text-xs font-medium text-zinc-200 transition-all max-w-[180px] sm:max-w-[260px]"
          >
            <span className="truncate">{project.projectName || 'Tanpa Nama'}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 mt-2 w-52 rounded-xl border border-zinc-800 bg-zinc-950 p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onNewProject();
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-200 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors text-left"
              >
                <Plus className="h-4 w-4 text-emerald-400" />
                <span>Proyek Baru</span>
              </button>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onOpenProject();
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-200 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors text-left"
              >
                <FolderOpen className="h-4 w-4 text-cyan-400" />
                <span>Buka Proyek</span>
              </button>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onRenameProject();
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-200 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors text-left"
              >
                <Edit2 className="h-4 w-4 text-amber-400" />
                <span>Ganti Nama</span>
              </button>

              <div className="my-1 border-t border-zinc-800/80" />

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onDeleteProject();
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
              >
                <Trash2 className="h-4 w-4 text-rose-400" />
                <span>Hapus Proyek</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Save indicator & Unduh ZIP */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Save Status Indicator */}
        <div className="flex items-center">
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span className="hidden sm:inline">Tersimpan</span>
            </div>
          )}
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-400 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span className="hidden sm:inline">Menyimpan...</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-[11px] font-mono text-rose-400">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
              <span className="hidden sm:inline">Gagal menyimpan</span>
            </div>
          )}
        </div>

        {/* Unduh ZIP Button */}
        <button
          onClick={handleDownloadZip}
          disabled={isDownloading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-zinc-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:opacity-95 shadow-md shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5 text-zinc-950" />
          <span>{isDownloading ? 'Menyiapkan...' : 'Unduh ZIP'}</span>
        </button>
      </div>
    </header>
  );
}
