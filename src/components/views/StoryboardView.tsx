import { useState, useRef } from 'react';
import {
  Film,
  Plus,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layers,
  Clock,
  Upload,
  Image as ImageIcon,
  X,
  Check,
  Lock,
  Unlock,
  UserCheck,
  Compass,
  Video,
  Car,
  Activity,
  AlertTriangle,
  Sliders,
} from 'lucide-react';
import {
  PromptFormat,
  StoryboardScene,
  ViewMode,
  VehicleDrivingAction,
  CharacterConfig,
} from '../../types';
import { buildAutomotivePrompt } from '../../utils/promptSynthesizer';
import { saveImage } from '../../utils/imageStore';
import { AsyncImage } from '../ui/AsyncImage';
import { ModuleHeader } from '../layout/ModuleHeader';
import { VehicleActionSection } from './VehicleActionSection';

interface StoryboardViewProps {
  scenes: StoryboardScene[];
  activeSceneId: string;
  targetDurationSeconds?: number;
  onUpdateTargetDuration?: (sec: number) => void;
  onSelectScene: (id: string) => void;
  onAddScene: () => void;
  onDuplicateScene: (id: string) => void;
  onDeleteScene: (id: string) => void;
  onMoveScene: (index: number, direction: 'up' | 'down') => void;
  onUpdateScene: (scene: StoryboardScene) => void;
  onNavigate: (view: ViewMode) => void;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

export function StoryboardView({
  scenes,
  activeSceneId,
  targetDurationSeconds = 15,
  onUpdateTargetDuration,
  onSelectScene,
  onAddScene,
  onDuplicateScene,
  onDeleteScene,
  onMoveScene,
  onUpdateScene,
  onNavigate,
  onShowToast,
}: StoryboardViewProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'action'>('timeline');
  const [selectedTarget, setSelectedTarget] = useState<number>(targetDurationSeconds);
  const [isCustomTarget, setIsCustomTarget] = useState(false);
  const [customTargetVal, setCustomTargetVal] = useState(targetDurationSeconds.toString());
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const totalRuntime = scenes.reduce((sum, s) => sum + s.durationSeconds, 0);
  const activeScene = scenes.find((s) => s.id === activeSceneId) || scenes[0];
  const isOverDuration = totalRuntime > selectedTarget;

  const handleTargetChange = (target: number) => {
    setSelectedTarget(target);
    setIsCustomTarget(false);
    onUpdateTargetDuration?.(target);
  };

  const handleCustomTargetChange = (valStr: string) => {
    setCustomTargetVal(valStr);
    const parsed = parseInt(valStr, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setSelectedTarget(parsed);
      onUpdateTargetDuration?.(parsed);
    }
  };

  const handleCopyShotPrompt = (scene: StoryboardScene) => {
    const prompt = buildAutomotivePrompt(
      scene,
      scene.promptFormat || 'universal',
      scene.promptMediaType || 'video',
      'en'
    );
    navigator.clipboard.writeText(prompt);
    onShowToast(`Prompt untuk Scene #${scene.sceneNumber} berhasil disalin!`);
  };

  const handleUploadKeyframe = async (sceneId: string, file: File | null) => {
    if (!file) return;
    try {
      const idbRef = await saveImage(file);
      const target = scenes.find((s) => s.id === sceneId);
      if (target) {
        onUpdateScene({ ...target, imageUrl: idbRef });
        onShowToast(`Keyframe visual Scene #${target.sceneNumber} disimpan ke IndexedDB!`);
      }
    } catch (e) {
      onShowToast('Gagal memproses gambar keyframe.', 'info');
    }
  };

  const handleRemoveKeyframe = (scene: StoryboardScene) => {
    if (scene.isLocked) {
      onShowToast(
        'Scene ini terkunci. Buka kunci (unlock) terlebih dahulu untuk mengubah keyframe.',
        'info'
      );
      return;
    }
    onUpdateScene({ ...scene, imageUrl: '' });
    onShowToast(`Keyframe Scene #${scene.sceneNumber} dihapus.`);
  };

  const handleToggleLock = (scene: StoryboardScene) => {
    const nextLocked = !scene.isLocked;
    onUpdateScene({ ...scene, isLocked: nextLocked });
    if (nextLocked) {
      onShowToast(
        `Scene #${scene.sceneNumber} dikunci. Detail adegan terlindungi dari perubahan tak sengaja.`
      );
    } else {
      onShowToast(
        `Kunci Scene #${scene.sceneNumber} dibuka. Anda dapat mengedit kembali detailnya.`
      );
    }
  };

  const handleUpdateActiveDrivingAction = (action: VehicleDrivingAction) => {
    if (!activeScene) return;
    onUpdateScene({
      ...activeScene,
      drivingAction: action,
      promptNeedsReview: activeScene.isPromptManuallyEdited ? true : false,
    });
  };

  const handleApplyActionToAllScenes = (action: VehicleDrivingAction) => {
    scenes.forEach((sc) => {
      onUpdateScene({
        ...sc,
        drivingAction: { ...action },
        promptNeedsReview: sc.isPromptManuallyEdited ? true : false,
      });
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Module Navigation Bar */}
      <ModuleHeader
        moduleNumber="MODUL 06"
        moduleTitle="Storyboard & Aksi Kendaraan"
        moduleDescription="Susun rangkaian adegan visual, atur durasi target, kunci scene, dan kelola aksi kendaraan dinamis"
        currentView="storyboard"
        onNavigate={onNavigate}
        prevView={{ view: 'camera', label: 'Camera Control' }}
        nextView={{ view: 'prompts', label: 'Prompt Generator' }}
      />

      {/* Title & Timeline Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <Film className="h-4 w-4" />
            <span>MODUL 06 // TIMELINE SEKUENSI STORYBOARD & AKSI</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            Timeline Storyboard & Rangkaian Scene
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Susun adegan sinematik multi-shot. Gunakan tombol{' '}
            <strong className="text-emerald-400">Lock Scene</strong> untuk mengamankan scene yang
            sudah selesai.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-xs font-mono text-zinc-300">
            <Clock className="h-3.5 w-3.5 text-emerald-400" />
            <span>{scenes.length} Scene</span>
            <span className="text-zinc-600">·</span>
            <span
              className={`font-bold ${
                isOverDuration ? 'text-amber-400 underline' : 'text-cyan-300'
              }`}
            >
              {totalRuntime} dtk aktual
            </span>
            <span className="text-zinc-500">/ {selectedTarget} dtk target</span>
          </div>

          <button
            onClick={onAddScene}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-xs font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Scene</span>
          </button>
        </div>
      </div>

      {/* Target Duration Selector & Alert (Tahap 7) */}
      <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
            Target Durasi Total Proyek:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { sec: 10, label: '10s (Reel/Short)' },
              { sec: 15, label: '15s (Iklan TV/Digital)' },
              { sec: 30, label: '30s (Trailer/Teaser)' },
              { sec: 60, label: '60s (Short Film)' },
            ].map((preset) => (
              <button
                key={preset.sec}
                onClick={() => handleTargetChange(preset.sec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedTarget === preset.sec && !isCustomTarget
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}

            <button
              onClick={() => setIsCustomTarget(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isCustomTarget
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                  : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
            >
              Kustom
            </button>

            {isCustomTarget && (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={600}
                  value={customTargetVal}
                  onChange={(e) => handleCustomTargetChange(e.target.value)}
                  className="w-16 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-emerald-400 font-mono text-center focus:outline-none"
                />
                <span className="text-zinc-500 text-xs">dtk</span>
              </div>
            )}
          </div>
        </div>

        {/* Warning if Actual > Target */}
        {isOverDuration && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 flex items-center gap-2.5 text-amber-300 text-xs">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              <strong>Peringatan Durasi:</strong> Durasi aktual ({totalRuntime} detik) melebihi target
              ({selectedTarget} detik). Kurangi durasi masing-masing scene atau naikkan target durasi.
            </span>
          </div>
        )}
      </div>

      {/* Tabs: Storyboard Timeline vs Aksi Kendaraan (Tahap 4) */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-1">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'timeline'
              ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Film className="h-4 w-4 text-emerald-400" />
          <span>Daftar Adegan Storyboard ({scenes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('action')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'action'
              ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Activity className="h-4 w-4 text-cyan-400" />
          <span>Aksi Kendaraan (Driving Dynamics)</span>
          <span className="text-[10px] font-mono text-cyan-300 px-1.5 py-0.2 rounded bg-cyan-500/10 border border-cyan-500/20">
            Scene #{activeScene?.sceneNumber || 1}
          </span>
        </button>
      </div>

      {/* Tab Content: Aksi Kendaraan (Tahap 4) */}
      {activeTab === 'action' && activeScene && (
        <VehicleActionSection
          activeScene={activeScene}
          onUpdateAction={handleUpdateActiveDrivingAction}
          onApplyToAllScenes={handleApplyActionToAllScenes}
          onShowToast={onShowToast}
          onNavigate={onNavigate}
        />
      )}

      {/* Tab Content: Timeline */}
      {activeTab === 'timeline' && (
        <>
          {scenes.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 p-12 text-center space-y-3">
              <div className="inline-flex p-4 rounded-2xl bg-zinc-900 text-zinc-500">
                <Film className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white">Belum Ada Adegan Storyboard</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Mulai susun alur visual dengan menambahkan adegan baru. Anda bebas menentukan
                pergerakan mobil, pencahayaan, dan sudut kamera.
              </p>
              <button
                onClick={onAddScene}
                className="px-5 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-all inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Buat Adegan Pertama</span>
              </button>
            </div>
          )}

          {/* Storyboard List */}
          <div className="space-y-5">
            {scenes.map((scene, index) => {
              const isActive = scene.id === activeSceneId;
              const promptPreview = buildAutomotivePrompt(
                scene,
                scene.promptFormat || 'universal',
                scene.promptMediaType || 'video',
                'en'
              );

              // Multi-character label
              const charList: CharacterConfig[] =
                Array.isArray(scene.characters) && scene.characters.length > 0
                  ? scene.characters
                  : scene.character
                  ? [scene.character]
                  : [];
              const charLabel =
                charList
                  .map((c) => c.name || c.role || c.seatingPosition)
                  .filter(Boolean)
                  .join(', ') || 'Tanpa Karakter Khusus';

              return (
                <div
                  key={scene.id}
                  className={`rounded-2xl border transition-all ${
                    scene.isLocked
                      ? 'border-amber-500/50 bg-zinc-900/80 shadow-md ring-1 ring-amber-500/20'
                      : isActive
                      ? 'border-cyan-500/80 bg-zinc-900/90 shadow-xl ring-1 ring-cyan-500/40'
                      : 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-700 hover:bg-zinc-900/40'
                  }`}
                >
                  <div className="p-4 md:p-5 flex flex-col lg:flex-row items-start gap-5">
                    {/* Visual Keyframe Thumbnail */}
                    <div className="relative w-full lg:w-64 aspect-video rounded-xl overflow-hidden bg-zinc-900 shrink-0 group border border-zinc-800">
                      {scene.imageUrl ? (
                        <>
                          <AsyncImage
                            src={scene.imageUrl}
                            alt={scene.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {!scene.isLocked && (
                            <button
                              onClick={() => handleRemoveKeyframe(scene)}
                              className="absolute top-2 right-2 p-1 rounded-lg bg-black/70 text-zinc-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Hapus gambar keyframe"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </>
                      ) : (
                        <div
                          onClick={() =>
                            !scene.isLocked && fileInputRefs.current[scene.id]?.click()
                          }
                          className={`h-full w-full flex flex-col items-center justify-center text-zinc-500 transition-colors p-4 text-center ${
                            scene.isLocked
                              ? 'cursor-not-allowed'
                              : 'cursor-pointer hover:text-zinc-300 hover:bg-zinc-850'
                          }`}
                        >
                          <ImageIcon className="h-7 w-7 text-zinc-600 mb-1 group-hover:text-emerald-400 transition-colors" />
                          <span className="text-[11px] font-semibold text-zinc-300">
                            Tambahkan Keyframe
                          </span>
                          <span className="text-[9px] text-zinc-500">
                            Klik untuk upload foto referensi
                          </span>
                        </div>
                      )}

                      <input
                        type="file"
                        ref={(el) => {
                          fileInputRefs.current[scene.id] = el;
                        }}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleUploadKeyframe(scene.id, e.target.files?.[0] || null)
                        }
                      />

                      {/* Thumbnail Badges */}
                      <span className="absolute top-2 left-2 rounded bg-zinc-950/80 backdrop-blur-md px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-400 border border-zinc-700">
                        SCENE 0{scene.sceneNumber}
                      </span>

                      {scene.isLocked && (
                        <span className="absolute top-2 right-2 rounded bg-amber-500/20 backdrop-blur-md px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <Lock className="h-3 w-3" /> Terkunci
                        </span>
                      )}

                      <span className="absolute bottom-2 right-2 rounded bg-zinc-950/80 backdrop-blur-md px-2 py-0.5 font-mono text-[10px] text-zinc-300 border border-zinc-700">
                        {scene.durationSeconds} dtk
                      </span>
                    </div>

                    {/* Shot Content & Fields */}
                    <div className="flex-1 w-full space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            SHOT {index + 1}
                          </span>
                          <input
                            type="text"
                            disabled={scene.isLocked}
                            value={scene.title}
                            onChange={(e) =>
                              onUpdateScene({ ...scene, title: e.target.value })
                            }
                            className="text-sm md:text-base font-bold bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-cyan-500 focus:outline-none text-white px-1 py-0.5 transition-colors disabled:opacity-75"
                            placeholder="Nama atau Judul Scene..."
                          />
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex items-center gap-1">
                          {/* Lock Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleLock(scene)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              scene.isLocked
                                ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                                : 'border-zinc-800 text-zinc-500 hover:text-zinc-200'
                            }`}
                            title={
                              scene.isLocked
                                ? 'Buka kunci scene (Unlock)'
                                : 'Kunci scene agar tidak berubah (Lock)'
                            }
                          >
                            {scene.isLocked ? (
                              <Lock className="h-3.5 w-3.5" />
                            ) : (
                              <Unlock className="h-3.5 w-3.5" />
                            )}
                          </button>

                          {/* Move Up */}
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => onMoveScene(index, 'up')}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Geser ke atas"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>

                          {/* Move Down */}
                          <button
                            type="button"
                            disabled={index === scenes.length - 1}
                            onClick={() => onMoveScene(index, 'down')}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Geser ke bawah"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>

                          {/* Duplicate */}
                          <button
                            type="button"
                            onClick={() => onDuplicateScene(scene.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800"
                            title="Gandakan scene ini"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => onDeleteScene(scene.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
                            title="Hapus scene"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Scene Description Textarea */}
                      <div>
                        <textarea
                          disabled={scene.isLocked}
                          rows={2}
                          value={scene.description}
                          onChange={(e) =>
                            onUpdateScene({ ...scene, description: e.target.value })
                          }
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 focus:border-cyan-500 focus:outline-none disabled:opacity-75"
                          placeholder="Jelaskan aksi adegan: pergerakan bodi mobil, pantulan cahaya, suasana jalan, dan nuansa visual yang diinginkan..."
                        />
                      </div>

                      {/* Metadata Chips Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {/* Vehicle chip */}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectScene(scene.id);
                            onNavigate('vehicle');
                          }}
                          className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-2 text-left hover:border-emerald-500/40 hover:bg-zinc-900 transition-colors group"
                        >
                          <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase font-mono">
                            <span className="flex items-center gap-1">
                              <Car className="h-3 w-3 text-emerald-400" />
                              Kendaraan
                            </span>
                            <span className="text-emerald-400 opacity-0 group-hover:opacity-100">
                              Edit →
                            </span>
                          </div>
                          <span className="font-medium text-zinc-200 truncate block mt-0.5">
                            {scene.vehicle.make || scene.vehicle.model
                              ? `${scene.vehicle.make} ${scene.vehicle.model}`
                              : 'Belum Ditentukan'}
                          </span>
                        </button>

                        {/* Character chip */}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectScene(scene.id);
                            onNavigate('character');
                          }}
                          className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-2 text-left hover:border-cyan-500/40 hover:bg-zinc-900 transition-colors group"
                        >
                          <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase font-mono">
                            <span className="flex items-center gap-1">
                              <UserCheck className="h-3 w-3 text-cyan-400" />
                              Karakter ({charList.length})
                            </span>
                            <span className="text-cyan-400 opacity-0 group-hover:opacity-100">
                              Edit →
                            </span>
                          </div>
                          <span className="font-medium text-zinc-200 truncate block mt-0.5">
                            {charLabel}
                          </span>
                        </button>

                        {/* Location chip */}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectScene(scene.id);
                            onNavigate('location');
                          }}
                          className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-2 text-left hover:border-emerald-500/40 hover:bg-zinc-900 transition-colors group"
                        >
                          <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase font-mono">
                            <span className="flex items-center gap-1">
                              <Compass className="h-3 w-3 text-emerald-400" />
                              Lokasi
                            </span>
                            <span className="text-emerald-400 opacity-0 group-hover:opacity-100">
                              Edit →
                            </span>
                          </div>
                          <span className="font-medium text-zinc-200 truncate block mt-0.5">
                            {scene.location.environmentType ||
                              scene.location.name ||
                              'Belum Ditentukan'}
                          </span>
                        </button>

                        {/* Duration input */}
                        <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-2">
                          <span className="text-[10px] text-zinc-500 uppercase font-mono block">
                            Durasi
                          </span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <input
                              type="number"
                              disabled={scene.isLocked}
                              min={1}
                              max={60}
                              value={scene.durationSeconds}
                              onChange={(e) =>
                                onUpdateScene({
                                  ...scene,
                                  durationSeconds: Math.max(1, parseInt(e.target.value) || 1),
                                })
                              }
                              className="w-12 bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-xs text-emerald-400 font-mono disabled:opacity-60"
                            />
                            <span className="text-zinc-500 text-xs">detik</span>
                          </div>
                        </div>
                      </div>

                      {/* Prompt Preview Snippet */}
                      <div className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-950/80 font-mono text-[11px] text-zinc-400 line-clamp-1">
                        <span className="text-emerald-400 font-bold mr-1.5">Prompt:</span>
                        <span>{promptPreview}</span>
                      </div>

                      {/* Footer Scene Tools */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectScene(scene.id);
                              setActiveTab('action');
                            }}
                            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700"
                          >
                            <Activity className="h-3 w-3" />
                            <span>Atur Aksi Kendaraan</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyShotPrompt(scene)}
                            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                          >
                            <Copy className="h-3 w-3 text-emerald-400" />
                            <span>Salin Prompt</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
