import { useState } from 'react';
import { X, Plus, FolderOpen, Film, Clock, Car, Trash2, Check, Bookmark } from 'lucide-react';
import { ProjectState, VehicleCategory } from '../../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export function NewProjectModal({ isOpen, onClose, onCreate }: NewProjectModalProps) {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim());
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Proyek Baru
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Nama Proyek <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Iklan SUV Perkotaan"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-95 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
            >
              Buat Proyek
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface RenameProjectModalProps {
  isOpen: boolean;
  currentName: string;
  onClose: () => void;
  onRename: (newName: string) => void;
}

export function RenameProjectModal({
  isOpen,
  currentName,
  onClose,
  onRename,
}: RenameProjectModalProps) {
  const [name, setName] = useState(currentName);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onRename(name.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Ganti Nama Proyek
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Nama Baru Proyek <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-95 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
            >
              Simpan Nama
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface OpenProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectState[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
}

export function OpenProjectModal({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onSelectProject,
  onDeleteProject,
}: OpenProjectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-cyan-400" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Buka Proyek (Open Project)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {projects.map((proj) => {
            const isActive = proj.id === activeProjectId;
            const totalRuntime = proj.scenes.reduce((acc, s) => acc + s.durationSeconds, 0);

            return (
              <div
                key={proj.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{proj.projectName}</h4>
                    {proj.isTemplate && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                        Template Opsional
                      </span>
                    )}
                    {isActive && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        Aktif Sekarang
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-1">{proj.directorNotes}</p>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Film className="h-3 w-3 text-cyan-400" />
                      {proj.scenes.length} Scene / Shot
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-emerald-400" />
                      {totalRuntime} detik
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!isActive ? (
                    <button
                      onClick={() => {
                        onSelectProject(proj.id);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-semibold text-cyan-300 transition-colors"
                    >
                      Buka Proyek
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Terpilih
                    </span>
                  )}

                  {projects.length > 1 && (
                    <button
                      onClick={() => onDeleteProject(proj.id)}
                      className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Hapus Proyek"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
