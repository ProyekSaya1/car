import { useState } from 'react';
import {
  Car,
  Video,
  Compass,
  Sparkles,
  Copy,
  Plus,
  Film,
  Sliders,
  FileText,
  Clock,
  Layers,
  FolderOpen,
  FolderPlus,
  Check,
  Edit2,
  Image as ImageIcon,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { AIModelTarget, ProjectState, StoryboardScene, ViewMode, CharacterConfig } from '../../types';
import { buildAutomotivePrompt } from '../../utils/promptSynthesizer';
import { AsyncImage } from '../ui/AsyncImage';

interface DashboardViewProps {
  project: ProjectState;
  totalProjects: number;
  totalStoryboards: number;
  onNavigate: (view: ViewMode) => void;
  onSelectScene: (sceneId: string) => void;
  onAddScene: () => void;
  onUpdateScene?: (scene: StoryboardScene) => void;
  onUpdateNotes: (notes: string) => void;
  onUpdateProjectName: (name: string) => void;
  onOpenNewProjectModal: () => void;
  onOpenOpenProjectModal: () => void;
  onUpdateVehicleGeneric: (vehicleName: string, make: string, model: string) => void;
  onShowToast: (msg: string) => void;
}

export function DashboardView({
  project,
  totalProjects,
  totalStoryboards,
  onNavigate,
  onSelectScene,
  onAddScene,
  onUpdateScene,
  onUpdateNotes,
  onUpdateProjectName,
  onOpenNewProjectModal,
  onOpenOpenProjectModal,
  onUpdateVehicleGeneric,
  onShowToast,
}: DashboardViewProps) {
  const activeScene = project.scenes.find((s) => s.id === project.activeSceneId) || project.scenes[0];
  const [copied, setCopied] = useState(false);
  const [notesEditing, setNotesEditing] = useState(false);
  const [tempNotes, setTempNotes] = useState(project.directorNotes || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project.projectName || 'CAR SCENE WORKSPACE');

  // Inline quick vehicle editor
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [vehMake, setVehMake] = useState(activeScene.vehicle.make);
  const [vehModel, setVehModel] = useState(activeScene.vehicle.model);

  const totalRuntime = project.scenes.reduce((acc, s) => acc + s.durationSeconds, 0);
  const currentPrompt = activeScene ? buildAutomotivePrompt(activeScene, activeScene.modelTarget) : '';

  const handleCopyPrompt = () => {
    if (!currentPrompt) return;
    navigator.clipboard.writeText(currentPrompt);
    setCopied(true);
    onShowToast('Prompt berhasil disalin ke papan klip!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNotes = () => {
    onUpdateNotes(tempNotes);
    setNotesEditing(false);
    onShowToast('Catatan sutradara berhasil diperbarui');
  };

  const handleSaveTitle = () => {
    if (titleInput.trim()) {
      onUpdateProjectName(titleInput.trim());
      setIsEditingTitle(false);
      onShowToast('Nama workspace berhasil diperbarui');
    }
  };

  const handleSaveVehicle = () => {
    if (vehMake.trim() || vehModel.trim()) {
      const vName = `${vehMake.trim()} ${vehModel.trim()}`.trim() || 'Kendaraan Kustom';
      onUpdateVehicleGeneric(vName, vehMake.trim(), vehModel.trim());
      setIsEditingVehicle(false);
      onShowToast(`Kendaraan diperbarui menjadi: ${vName}`);
    }
  };

  const hasVehicle = Boolean(activeScene.vehicle.make || activeScene.vehicle.model);
  const hasLocation = Boolean(activeScene.location.environmentType || activeScene.location.name);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner / Project Overview */}
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-900/90 via-zinc-900/50 to-zinc-950 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
              <span className="text-emerald-400 font-semibold uppercase tracking-wider">Studio Otomotif Universal</span>
              <span>·</span>
              <span>Storyboard & Prompt AI</span>
              <span>·</span>
              <span className="text-cyan-400">{project.scenes.length} Sekuens Scene</span>
            </div>

            {/* Editable Workspace Title */}
            {isEditingTitle ? (
              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="rounded-xl border border-emerald-500 bg-zinc-950 px-3 py-1.5 text-xl font-extrabold uppercase text-white focus:outline-none w-full"
                  autoFocus
                />
                <button
                  onClick={handleSaveTitle}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 text-xs font-bold shrink-0"
                >
                  Simpan
                </button>
                <button
                  onClick={() => setIsEditingTitle(false)}
                  className="px-2 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 text-xs shrink-0"
                >
                  Batal
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 group">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight uppercase text-white flex flex-wrap items-center gap-3">
                  <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                    {project.projectName || 'CAR SCENE WORKSPACE'}
                  </span>
                  <span className="text-[11px] font-mono tracking-wider font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1.5 align-middle normal-case">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                    WORKSPACE AKTIF
                  </span>
                </h2>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                  title="Ubah nama workspace"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Studio pembuatan storyboard dan prompt video otomotif berbasis AI. Tentukan referensi kendaraan apa pun, atur sudut kamera, kelola tata cahaya, dan hasilkan prompt akurat untuk platform AI pilihan Anda.
            </p>
          </div>

          {/* Quick Primary Actions: New Project, Open Project, & Prompt Synthesizer */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenNewProjectModal}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-xs font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all active:scale-95 whitespace-nowrap"
            >
              <FolderPlus className="h-4 w-4" />
              <span>Proyek Baru (New Project)</span>
            </button>

            <button
              onClick={onOpenOpenProjectModal}
              className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-800 hover:border-zinc-600 px-3.5 py-2.5 text-xs font-semibold text-zinc-200 transition-all active:scale-95 whitespace-nowrap"
            >
              <FolderOpen className="h-4 w-4 text-cyan-400" />
              <span>Buka Proyek (Open Project)</span>
            </button>

            <button
              onClick={() => onNavigate('prompts')}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-3.5 py-2.5 text-xs font-semibold text-emerald-400 transition-all active:scale-95 whitespace-nowrap"
            >
              <Sparkles className="h-4 w-4" />
              <span>Sintesis Prompt</span>
            </button>
          </div>
        </div>

        {/* Ringkasan Statistik Riil (Tanpa Angka Palsu) */}
        <div className="mt-6 pt-6 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60">
            <div className="text-[11px] font-mono text-zinc-400 uppercase flex items-center justify-between">
              <span>Jumlah Proyek</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white tabular-nums mt-1 flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-emerald-400" />
              <span>{totalProjects} Proyek</span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Tersimpan di studio Anda</div>
          </div>

          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60">
            <div className="text-[11px] font-mono text-zinc-400 uppercase flex items-center justify-between">
              <span>Jumlah Storyboard</span>
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white tabular-nums mt-1 flex items-center gap-2">
              <Film className="h-4 w-4 text-cyan-400" />
              <span>{totalStoryboards} Storyboard</span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Sekuens terkelola</div>
          </div>

          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60">
            <div className="text-[11px] font-mono text-zinc-400 uppercase flex items-center justify-between">
              <span>Jumlah Scene</span>
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white tabular-nums mt-1 flex items-center gap-2">
              <Layers className="h-4 w-4 text-sky-400" />
              <span>{project.scenes.length} Scene / Shot</span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Dalam workspace aktif</div>
          </div>

          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60">
            <div className="text-[11px] font-mono text-zinc-400 uppercase flex items-center justify-between">
              <span>Estimasi Durasi</span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white tabular-nums mt-1 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <span>{totalRuntime} Detik</span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Total sekuens video</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Scene Aktif & Catatan Sutradara */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Scene Hero Player & Prompt Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Scene Aktif #{activeScene.sceneNumber}: {activeScene.title || 'Scene Baru'}
              </h3>
            </div>
            <button
              onClick={() => onNavigate('storyboard')}
              className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium"
            >
              Buka Semua Storyboard →
            </button>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-xl">
            {/* Visual Container */}
            <div className="relative aspect-video w-full bg-zinc-950 overflow-hidden group">
              {activeScene.imageUrl ? (
                <AsyncImage
                  src={activeScene.imageUrl}
                  alt={activeScene.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center text-zinc-400 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 text-center space-y-3">
                  <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-emerald-400">
                    <Car className="h-10 w-10" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-200">Belum Ada Keyframe / Referensi Visual</h4>
                    <p className="text-xs text-zinc-400 max-w-sm mt-0.5">
                      Unggah foto referensi mobil Anda di Vehicle Setup atau tentukan konsep adegan di Storyboard.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onNavigate('vehicle')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
                    >
                      Buka Vehicle Setup
                    </button>
                    <button
                      onClick={() => onNavigate('storyboard')}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700 transition-colors"
                    >
                      Buka Storyboard
                    </button>
                  </div>
                </div>
              )}

              {/* Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent pointer-events-none" />

              {/* Top tags on image */}
              <div className="absolute top-4 left-4 flex items-center gap-2 text-xs text-zinc-200">
                <span className="bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded border border-zinc-700/80 font-mono text-[11px] text-emerald-400">
                  SCENE {activeScene.sceneNumber} / {activeScene.durationSeconds} Detik
                </span>
                <span className="bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded border border-zinc-700/80 font-mono text-[11px] text-cyan-400">
                  {activeScene.camera.aspectRatio}
                </span>
              </div>

              {/* Bottom detail on image */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white">{activeScene.title || `Scene 0${activeScene.sceneNumber}`}</h4>
                  <p className="text-xs text-zinc-300 line-clamp-1 max-w-lg mt-0.5">
                    {activeScene.description || 'Deskripsikan pergerakan atau komposisi visual scene ini...'}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('camera')}
                  className="rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-xs text-zinc-200 px-3 py-1.5 border border-zinc-700 backdrop-blur-sm transition-all shrink-0 ml-2"
                >
                  Atur Kamera
                </button>
              </div>
            </div>

            {/* Shot Specs Bar */}
            <div className="p-4 bg-zinc-900/90 border-t border-zinc-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Car className="h-3.5 w-3.5 text-cyan-400" />
                    <strong className="text-zinc-200 font-medium">Kendaraan:</strong>{' '}
                    {hasVehicle
                      ? `${activeScene.vehicle.make} ${activeScene.vehicle.model} (${activeScene.vehicle.category})`
                      : 'Belum ditentukan'}
                  </span>
                  <span className="text-zinc-600">·</span>
                  <span className="flex items-center gap-1.5">
                    <Compass className="h-3.5 w-3.5 text-emerald-400" />
                    <strong className="text-zinc-200 font-medium">Lokasi:</strong>{' '}
                    {hasLocation ? activeScene.location.environmentType : 'Belum ditentukan'}
                  </span>
                  <span className="text-zinc-600">·</span>
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-cyan-400" />
                    <strong className="text-zinc-200 font-medium">Karakter ({Array.isArray(activeScene.characters) ? activeScene.characters.length : (activeScene.character ? 1 : 0)}):</strong>{' '}
                    {Array.isArray(activeScene.characters) && activeScene.characters.length > 0
                      ? activeScene.characters.map((c) => c.name || c.role).filter(Boolean).join(', ') || 'Belum diatur'
                      : activeScene.character?.name || 'Belum diatur'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setVehMake(activeScene.vehicle.make);
                    setVehModel(activeScene.vehicle.model);
                    setIsEditingVehicle(!isEditingVehicle);
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>{isEditingVehicle ? 'Tutup Edit Cepat' : 'Edit Cepat Nama Mobil'}</span>
                </button>
              </div>

              {/* Inline Vehicle Quick Editor */}
              {isEditingVehicle && (
                <div className="p-3 rounded-xl border border-cyan-500/30 bg-zinc-950 space-y-2 animate-in fade-in">
                  <div className="text-xs font-semibold text-cyan-300">
                    Kustomisasi Kendaraan Cepat (Dapat Diubah Kapan Saja)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={vehMake}
                      onChange={(e) => setVehMake(e.target.value)}
                      placeholder="Merek (Contoh: Toyota, Honda, Porsche, Wuling...)"
                      className="rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-100"
                    />
                    <input
                      type="text"
                      value={vehModel}
                      onChange={(e) => setVehModel(e.target.value)}
                      placeholder="Model / Tipe (Contoh: Sedan Klasik, SUV EV, dll.)"
                      className="rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-100"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setIsEditingVehicle(false)}
                      className="px-2.5 py-1 rounded text-[11px] text-zinc-400 hover:text-zinc-200"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveVehicle}
                      className="px-3 py-1 rounded bg-cyan-500 text-zinc-950 font-bold text-[11px]"
                    >
                      Terapkan Nama
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Prompt Copy Box with Flexible Engine Selector */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="font-mono text-zinc-400 text-[11px]">Format Prompt:</span>
                    <select
                      value={activeScene.modelTarget || 'universal'}
                      onChange={(e) => {
                        const newTarget = e.target.value as 'universal' | 'custom';
                        if (onUpdateScene) {
                          onUpdateScene({ ...activeScene, modelTarget: newTarget, promptFormat: newTarget });
                        }
                        onShowToast(`Format diubah ke ${newTarget === 'universal' ? 'Universal Prompt' : 'Custom Prompt'}`);
                      }}
                      className="rounded bg-zinc-900 border border-zinc-700 px-2.5 py-1 text-xs text-emerald-300 font-mono font-bold uppercase cursor-pointer focus:outline-none"
                    >
                      <option value="universal">Universal Prompt</option>
                      <option value="custom">Custom Prompt</option>
                    </select>
                  </div>

                  <button
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1 rounded bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 text-[11px] font-medium text-zinc-200 transition-colors"
                  >
                    <Copy className="h-3 w-3" />
                    <span>{copied ? 'Tersalin!' : 'Salin Prompt'}</span>
                  </button>
                </div>
                <p className="text-xs text-zinc-300 font-mono line-clamp-2 leading-relaxed">
                  {currentPrompt}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Director Notes & Fast Tools */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Catatan Sutradara
              </h3>
            </div>
            {notesEditing ? (
              <button
                onClick={handleSaveNotes}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Simpan
              </button>
            ) : (
              <button
                onClick={() => setNotesEditing(true)}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                Ubah Catatan
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
            {notesEditing ? (
              <textarea
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
                rows={5}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                placeholder="Tulis arahan visual, pencahayaan, atau konsep adegan di sini..."
              />
            ) : (
              <p className="text-xs text-zinc-300 leading-relaxed font-sans italic border-l-2 border-emerald-500/50 pl-3 py-1">
                "{project.directorNotes || 'Belum ada catatan sutradara.'}"
              </p>
            )}

            <div className="pt-2 border-t border-zinc-800/80 space-y-2">
              <div className="text-[11px] uppercase font-mono text-zinc-400 font-semibold">
                Navigasi Modul Studio
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onNavigate('vehicle')}
                  className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/70 hover:bg-zinc-800/60 p-2.5 text-xs text-zinc-200 text-left transition-colors"
                >
                  <Car className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="truncate">Setup Mobil</span>
                </button>
                <button
                  onClick={() => onNavigate('character')}
                  className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/70 hover:bg-zinc-800/60 p-2.5 text-xs text-zinc-200 text-left transition-colors"
                >
                  <Sliders className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span className="truncate">Pengemudi</span>
                </button>
                <button
                  onClick={() => onNavigate('location')}
                  className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/70 hover:bg-zinc-800/60 p-2.5 text-xs text-zinc-200 text-left transition-colors"
                >
                  <Compass className="h-4 w-4 text-sky-400 shrink-0" />
                  <span className="truncate">Lingkungan</span>
                </button>
                <button
                  onClick={() => onNavigate('camera')}
                  className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/70 hover:bg-zinc-800/60 p-2.5 text-xs text-zinc-200 text-left transition-colors"
                >
                  <Video className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="truncate">Rig Kamera</span>
                </button>
              </div>
            </div>
          </div>

          {/* Format Prompt Universal & Custom */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
            <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
              <span>Format Output Prompt</span>
              <span className="font-mono text-[10px] text-emerald-400">Universal & Custom</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  if (onUpdateScene) {
                    onUpdateScene({ ...activeScene, modelTarget: 'universal', promptFormat: 'universal' });
                  }
                  onShowToast('Format dialihkan ke Universal Prompt');
                }}
                className={`px-3 py-2.5 rounded-xl font-medium border text-center transition-all ${
                  (activeScene.modelTarget || 'universal') === 'universal'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm font-bold'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                Universal Prompt
              </button>
              <button
                onClick={() => {
                  if (onUpdateScene) {
                    onUpdateScene({ ...activeScene, modelTarget: 'custom', promptFormat: 'custom' });
                  }
                  onShowToast('Format dialihkan ke Custom Prompt');
                }}
                className={`px-3 py-2.5 rounded-xl font-medium border text-center transition-all ${
                  activeScene.modelTarget === 'custom'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm font-bold'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                Custom Prompt
              </button>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">Prompt Gambar & Video</span>
              <button
                onClick={() => onNavigate('prompts')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                <span>Buka Generator Prompt</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Storyboard Strip: Quick Switcher */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Timeline Storyboard ({project.scenes.length} Scene)
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onAddScene}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Scene</span>
            </button>
            <button
              onClick={() => onNavigate('storyboard')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Kelola Urutan Storyboard →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {project.scenes.map((scene) => {
            const isSelected = scene.id === project.activeSceneId;
            return (
              <div
                key={scene.id}
                onClick={() => onSelectScene(scene.id)}
                className={`group cursor-pointer rounded-xl border p-3 transition-all ${
                  isSelected
                    ? 'border-emerald-500/80 bg-zinc-900 shadow-[0_0_15px_rgba(52,211,153,0.15)] ring-1 ring-emerald-500/50'
                    : 'border-zinc-800/80 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/40'
                }`}
              >
                <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-zinc-900 mb-2.5 border border-zinc-800">
                  {scene.imageUrl ? (
                    <AsyncImage
                      src={scene.imageUrl}
                      alt={scene.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-zinc-500 p-2 text-center">
                      <Film className="h-5 w-5 mb-1 text-zinc-600" />
                      <span className="text-[10px]">Belum Ada Gambar</span>
                    </div>
                  )}
                  <span className="absolute top-1.5 left-1.5 rounded bg-zinc-950/80 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300 border border-zinc-700">
                    Scene {scene.sceneNumber} ({scene.durationSeconds} dtk)
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-zinc-200 truncate group-hover:text-emerald-300 transition-colors">
                      {scene.title || `Scene 0${scene.sceneNumber}`}
                    </h5>
                    <span className="text-[10px] uppercase font-mono text-cyan-400">
                      {scene.modelTarget}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-1">
                    {scene.vehicle.make || scene.vehicle.model
                      ? `${scene.vehicle.make} ${scene.vehicle.model}`
                      : 'Kendaraan Belum Diatur'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
