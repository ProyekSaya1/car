import { useState, useRef, useEffect } from 'react';
import {
  StoryboardScene,
  ProjectState,
  PromptLang,
} from '../../types';
import {
  buildUnifiedPrompt,
  getNegativePrompt,
} from '../../utils/promptSynthesizer';
import {
  Copy,
  Check,
  Lock,
  Unlock,
  MoreVertical,
  Plus,
  Trash2,
  Edit3,
  AlertCircle,
  FileText,
  RotateCcw,
} from 'lucide-react';

interface ResultColumnProps {
  project: ProjectState;
  onUpdateProject: (updater: (prev: ProjectState) => ProjectState) => void;
  onSelectScene: (sceneId: string) => void;
  onAddScene: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

export function ResultColumn({
  project,
  onUpdateProject,
  onSelectScene,
  onAddScene,
  onShowToast,
}: ResultColumnProps) {
  const lang: PromptLang = project.promptLanguage || 'id';
  const [activeMenuSceneId, setActiveMenuSceneId] = useState<string | null>(null);
  const [editingManualSceneId, setEditingManualSceneId] = useState<string | null>(null);
  const [manualText, setManualText] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Close 3-dots dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuSceneId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyPrompt = (text: string, sceneNumber: number) => {
    navigator.clipboard.writeText(text);
    onShowToast(`Prompt Scene 0${sceneNumber} (${lang.toUpperCase()}) berhasil disalin!`);
  };

  const handleCopyNegative = () => {
    const neg = getNegativePrompt(project.mediaMode, lang);
    navigator.clipboard.writeText(neg);
    onShowToast(`Negative prompt (${lang.toUpperCase()}) berhasil disalin!`);
  };

  const handleToggleLock = (sceneId: string) => {
    onUpdateProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.id === sceneId ? { ...s, isLocked: !s.isLocked } : s
      ),
    }));
  };

  const handleDeleteScene = (sceneId: string) => {
    if (project.scenes.length <= 1) {
      onShowToast('Tidak dapat menghapus scene satu-satunya', 'info');
      return;
    }
    onUpdateProject((prev) => {
      const filtered = prev.scenes.filter((s) => s.id !== sceneId);
      const reindexed = filtered.map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));
      return {
        ...prev,
        activeSceneId: reindexed[0]?.id || '',
        scenes: reindexed,
      };
    });
    onShowToast('Scene berhasil dihapus');
  };

  const handleStartManualEdit = (scene: StoryboardScene) => {
    const currentPrompt =
      lang === 'id'
        ? scene.manualPromptId || buildUnifiedPrompt(scene, project, 'id')
        : scene.manualPromptEn || buildUnifiedPrompt(scene, project, 'en');
    setManualText(currentPrompt);
    setEditingManualSceneId(scene.id);
    setActiveMenuSceneId(null);
  };

  const handleSaveManualEdit = (sceneId: string) => {
    onUpdateProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => {
        if (s.id !== sceneId) return s;
        return {
          ...s,
          isPromptManuallyEdited: true,
          promptNeedsReview: false,
          ...(lang === 'id' ? { manualPromptId: manualText } : { manualPromptEn: manualText }),
        };
      }),
    }));
    setEditingManualSceneId(null);
    onShowToast('Prompt manual berhasil disimpan!');
  };

  // Conflict Resolution: Rebuild from data vs Keep manual
  const handleResolveConflictRebuild = (sceneId: string) => {
    onUpdateProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => {
        if (s.id !== sceneId) return s;
        return {
          ...s,
          isPromptManuallyEdited: false,
          promptNeedsReview: false,
          manualPromptId: undefined,
          manualPromptEn: undefined,
        };
      }),
    }));
    onShowToast('Prompt dibuat ulang sesuai data terbaru.');
  };

  const handleResolveConflictKeep = (sceneId: string) => {
    onUpdateProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => {
        if (s.id !== sceneId) return s;
        return {
          ...s,
          promptNeedsReview: false,
        };
      }),
    }));
    onShowToast('Editan manual dipertahankan.');
  };

  // Check if all scenes are completely empty
  const isCompletelyEmpty = project.scenes.every(
    (s) =>
      !s.description &&
      !s.vehicle.name &&
      (!s.vehicle.exteriorPhotos?.front &&
        !s.vehicle.exteriorPhotos?.rear &&
        !s.vehicle.exteriorPhotos?.sideRight)
  );

  return (
    <div className="space-y-4">
      {/* HEADER KOLOM HASIL */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
            Hasil Prompt Sinematik
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-400">Bahasa:</span>
          <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {lang === 'id' ? 'Bahasa Indonesia' : 'English'}
          </span>
        </div>
      </div>

      {/* EMPTY STATE IF NOT CONFIGURED */}
      {isCompletelyEmpty && (
        <div className="p-6 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 text-center space-y-2">
          <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            BELUM ADA ADEGAN
          </div>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
            Mulai dengan mengetikkan adegan pada formulir "Ceritakan adegannya" atau unggah foto mobil di sebelah kiri untuk menghasilkan prompt otomatis.
          </p>
        </div>
      )}

      {/* SCENE PROMPT CARDS */}
      <div className="space-y-4">
        {project.scenes.map((scene, idx) => {
          const isActive = scene.id === project.activeSceneId;
          const isLocked = Boolean(scene.isLocked);

          // Get prompt text
          const computedPrompt = buildUnifiedPrompt(scene, project, lang);
          const activePromptText =
            lang === 'id'
              ? scene.manualPromptId || computedPrompt
              : scene.manualPromptEn || computedPrompt;

          return (
            <div
              key={scene.id}
              onClick={() => onSelectScene(scene.id)}
              className={`relative rounded-2xl border p-4 sm:p-5 transition-all space-y-3 cursor-pointer ${
                isActive
                  ? 'border-emerald-500/80 bg-zinc-950 shadow-xl ring-1 ring-emerald-500/30'
                  : 'border-zinc-800/90 bg-zinc-950/70 hover:border-zinc-700 hover:bg-zinc-950'
              }`}
            >
              {/* Card Header: Scene Number, Editable Title, Buttons */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 shrink-0">
                    SCENE 0{scene.sceneNumber}
                  </span>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={scene.title || `Scene 0${scene.sceneNumber}`}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      onUpdateProject((prev) => ({
                        ...prev,
                        scenes: prev.scenes.map((s) =>
                          s.id === scene.id ? { ...s, title: newTitle } : s
                        ),
                      }));
                    }}
                    className="bg-transparent text-xs font-bold text-white hover:border-b hover:border-zinc-700 focus:border-b focus:border-emerald-500 focus:outline-none truncate max-w-[180px] sm:max-w-[240px]"
                  />
                  {isLocked && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20">
                      Terkunci
                    </span>
                  )}
                </div>

                {/* Action Buttons: Salin, Kunci, ⋯ */}
                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Salin Button */}
                  <button
                    type="button"
                    onClick={() => handleCopyPrompt(activePromptText, scene.sceneNumber)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all active:scale-95"
                    title="Salin prompt ini"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Salin</span>
                  </button>

                  {/* Kunci Button (Scene Lock) */}
                  <button
                    type="button"
                    onClick={() => handleToggleLock(scene.id)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      isLocked
                        ? 'border-amber-500/40 bg-amber-500/20 text-amber-400'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                    }`}
                    title={isLocked ? 'Buka kunci scene' : 'Kunci scene agar tidak berubah'}
                  >
                    {isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                  </button>

                  {/* 3-dots Menu Button */}
                  <div className="relative" ref={activeMenuSceneId === scene.id ? menuRef : undefined}>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMenuSceneId((cur) => (cur === scene.id ? null : scene.id))
                      }
                      className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
                      title="Menu opsi scene"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </button>

                    {activeMenuSceneId === scene.id && (
                      <div className="absolute right-0 mt-1 w-44 rounded-xl border border-zinc-800 bg-zinc-950 p-1 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                        <button
                          type="button"
                          onClick={() => handleStartManualEdit(scene)}
                          className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-200 hover:text-white hover:bg-zinc-900 rounded-lg text-left"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-cyan-400" />
                          <span>Edit manual prompt</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            handleCopyNegative();
                            setActiveMenuSceneId(null);
                          }}
                          className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-200 hover:text-white hover:bg-zinc-900 rounded-lg text-left"
                        >
                          <Copy className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Salin negatif</span>
                        </button>

                        {project.scenes.length > 1 && (
                          <>
                            <div className="my-1 border-t border-zinc-800" />
                            <button
                              type="button"
                              onClick={() => {
                                handleDeleteScene(scene.id);
                                setActiveMenuSceneId(null);
                              }}
                              className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg text-left"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Hapus scene</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Conflict Alert Banner (If manual edit conflict detected) */}
              {scene.promptNeedsReview && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-2"
                >
                  <div className="flex items-center gap-2 font-semibold text-amber-300">
                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Perubahan terdeteksi pada adegan yang memiliki editan manual:</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleResolveConflictRebuild(scene.id)}
                      className="px-3 py-1 rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition-colors"
                    >
                      Buat Ulang dari Data
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResolveConflictKeep(scene.id)}
                      className="px-3 py-1 rounded-lg bg-zinc-800 text-zinc-200 font-medium text-xs hover:bg-zinc-700 transition-colors"
                    >
                      Pertahankan Manual
                    </button>
                  </div>
                </div>
              )}

              {/* Inline Manual Editor or Prompt Text */}
              {editingManualSceneId === scene.id ? (
                <div className="space-y-2 pt-1" onClick={(e) => e.stopPropagation()}>
                  <label className="block text-[11px] font-mono text-cyan-400">
                    Editor Manual Prompt ({lang.toUpperCase()}):
                  </label>
                  <textarea
                    rows={4}
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    className="w-full rounded-xl border border-cyan-500/50 bg-zinc-900 p-3 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 leading-relaxed font-sans"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingManualSceneId(null)}
                      className="px-3 py-1 rounded-lg text-xs font-medium text-zinc-400 hover:text-white"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveManualEdit(scene.id)}
                      className="px-4 py-1 rounded-lg text-xs font-bold bg-cyan-500 text-zinc-950 hover:bg-cyan-400"
                    >
                      Simpan Manual
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs sm:text-[13px] text-zinc-300 font-sans leading-relaxed break-words bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/80">
                  {activePromptText || (
                    <span className="text-zinc-600 italic">
                      Belum ada deskripsi untuk adegan ini.
                    </span>
                  )}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* + TAMBAH SCENE BUTTON */}
      <button
        type="button"
        onClick={onAddScene}
        className="w-full py-3 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-emerald-500/80 bg-zinc-950/60 hover:bg-zinc-900/60 text-xs font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
      >
        <Plus className="h-4 w-4 text-emerald-400" />
        <span>+ Tambah Scene Baru</span>
      </button>
    </div>
  );
}
