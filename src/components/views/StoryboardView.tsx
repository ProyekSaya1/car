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
} from 'lucide-react';
import { AIModelTarget, StoryboardScene, ViewMode } from '../../types';
import { buildAutomotivePrompt } from '../../utils/promptSynthesizer';
import { compressImageFile } from '../../utils/imageCompressor';

interface StoryboardViewProps {
  scenes: StoryboardScene[];
  activeSceneId: string;
  onSelectScene: (id: string) => void;
  onAddScene: () => void;
  onDuplicateScene: (id: string) => void;
  onDeleteScene: (id: string) => void;
  onMoveScene: (index: number, direction: 'up' | 'down') => void;
  onUpdateScene: (scene: StoryboardScene) => void;
  onNavigate: (view: ViewMode) => void;
  onShowToast: (msg: string) => void;
}

export function StoryboardView({
  scenes,
  activeSceneId,
  onSelectScene,
  onAddScene,
  onDuplicateScene,
  onDeleteScene,
  onMoveScene,
  onUpdateScene,
  onNavigate,
  onShowToast,
}: StoryboardViewProps) {
  const totalRuntime = scenes.reduce((sum, s) => sum + s.durationSeconds, 0);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleCopyShotPrompt = (scene: StoryboardScene) => {
    const prompt = buildAutomotivePrompt(scene, scene.modelTarget);
    navigator.clipboard.writeText(prompt);
    onShowToast(`Prompt untuk Scene #${scene.sceneNumber} berhasil disalin!`);
  };

  const handleUploadKeyframe = async (sceneId: string, file: File | null) => {
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 1024, 0.75);
      const target = scenes.find((s) => s.id === sceneId);
      if (target) {
        onUpdateScene({ ...target, imageUrl: compressed });
        onShowToast(`Keyframe gambar untuk Scene #${target.sceneNumber} berhasil diunggah!`);
      }
    } catch (e) {
      onShowToast('Gagal memproses gambar keyframe.');
    }
  };

  const handleRemoveKeyframe = (scene: StoryboardScene) => {
    onUpdateScene({ ...scene, imageUrl: '' });
    onShowToast(`Keyframe Scene #${scene.sceneNumber} dihapus.`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title & Timeline Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <Film className="h-4 w-4" />
            <span>MODUL 06 // TIMELINE SEKUENSI STORYBOARD (UNIVERSAL)</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            Timeline Storyboard & Daftar Scene
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Susun adegan bergerak, kontinuitas multi-sudut pandang kamera, dan durasi visual otomotif sesuai konsep Anda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-xs font-mono text-zinc-300">
            <Clock className="h-3.5 w-3.5 text-emerald-400" />
            <span>{scenes.length} Scene</span>
            <span className="text-zinc-600">·</span>
            <span className="text-cyan-300">{totalRuntime} detik durasi</span>
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

      {/* Empty State if no scenes */}
      {scenes.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 p-12 text-center space-y-3">
          <div className="inline-flex p-4 rounded-2xl bg-zinc-900 text-zinc-500">
            <Film className="h-8 w-8 text-emerald-400" />
          </div>
          <h3 className="text-base font-bold text-white">Belum Ada Adegan Storyboard</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Mulai susun alur visual dengan menambahkan adegan baru. Anda bebas menentukan pergerakan mobil, pencahayaan, dan sudut kamera.
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
      <div className="space-y-4">
        {scenes.map((scene, index) => {
          const isActive = scene.id === activeSceneId;
          const promptPreview = buildAutomotivePrompt(scene, scene.modelTarget);

          return (
            <div
              key={scene.id}
              className={`rounded-2xl border transition-all ${
                isActive
                  ? 'border-emerald-500/80 bg-zinc-900/90 shadow-xl ring-1 ring-emerald-500/40'
                  : 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-700 hover:bg-zinc-900/40'
              }`}
            >
              <div className="p-4 md:p-5 flex flex-col lg:flex-row items-start gap-5">
                {/* Visual Keyframe Thumbnail */}
                <div className="relative w-full lg:w-64 aspect-video rounded-xl overflow-hidden bg-zinc-900 shrink-0 group border border-zinc-800">
                  {scene.imageUrl ? (
                    <>
                      <img
                        src={scene.imageUrl}
                        alt={scene.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        onClick={() => handleRemoveKeyframe(scene)}
                        className="absolute top-2 right-2 p-1 rounded-lg bg-black/60 text-zinc-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Hapus gambar keyframe"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <div
                      onClick={() => fileInputRefs.current[scene.id]?.click()}
                      className="h-full w-full flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-850 cursor-pointer transition-colors p-4 text-center"
                    >
                      <ImageIcon className="h-7 w-7 text-zinc-600 mb-1 group-hover:text-emerald-400 transition-colors" />
                      <span className="text-[11px] font-semibold text-zinc-300">Tambahkan Keyframe</span>
                      <span className="text-[9px] text-zinc-500">Klik untuk upload foto referensi</span>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={(el) => {
                      fileInputRefs.current[scene.id] = el;
                    }}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUploadKeyframe(scene.id, e.target.files?.[0] || null)}
                  />

                  {/* Thumbnail Badges */}
                  <span className="absolute top-2 left-2 rounded bg-zinc-950/80 backdrop-blur-md px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-400 border border-zinc-700">
                    SCENE 0{scene.sceneNumber}
                  </span>

                  <span className="absolute bottom-2 right-2 rounded bg-zinc-950/80 backdrop-blur-md px-2 py-0.5 font-mono text-[10px] text-zinc-300 border border-zinc-700">
                    {scene.durationSeconds} dtk
                  </span>
                </div>

                {/* Shot Content & Fields */}
                <div className="flex-1 w-full space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        #{scene.sceneNumber}
                      </span>
                      <input
                        type="text"
                        value={scene.title}
                        onChange={(e) => onUpdateScene({ ...scene, title: e.target.value })}
                        placeholder="Judul adegan..."
                        className="bg-transparent text-sm md:text-base font-bold text-white border-b border-transparent hover:border-zinc-700 focus:border-emerald-500 focus:outline-none transition-colors px-1"
                      />
                    </div>

                    {/* Target AI Engine Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-zinc-500 uppercase">Engine:</span>
                      <select
                        value={scene.modelTarget}
                        onChange={(e) =>
                          onUpdateScene({ ...scene, modelTarget: e.target.value as AIModelTarget })
                        }
                        className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs font-mono uppercase text-cyan-300 focus:outline-none"
                      >
                        <option value="universal">Universal Prompt</option>
                        <option value="custom">Custom Format</option>
                        <option value="kling">Kling 1.5</option>
                        <option value="runway">Runway Gen-3</option>
                        <option value="sora">OpenAI Sora</option>
                        <option value="luma">Luma Dream</option>
                        <option value="veo">Google Veo</option>
                        <option value="flux">Flux Stills</option>
                        <option value="midjourney">Midjourney</option>
                      </select>
                    </div>
                  </div>

                  {/* Description Box */}
                  <textarea
                    value={scene.description}
                    onChange={(e) => onUpdateScene({ ...scene, description: e.target.value })}
                    rows={2}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none leading-relaxed"
                    placeholder="Deskripsikan pergerakan kendaraan, pencahayaan, atau fokus kamera untuk adegan ini..."
                  />

                  {/* Meta Specs Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-2">
                      <span className="text-[10px] text-zinc-500 uppercase font-mono block">Kendaraan</span>
                      <span className="font-medium text-zinc-200 truncate block mt-0.5">
                        {scene.vehicle.make || scene.vehicle.model
                          ? `${scene.vehicle.make} ${scene.vehicle.model}`
                          : 'Belum Ditentukan'}
                      </span>
                    </div>

                    <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-2">
                      <span className="text-[10px] text-zinc-500 uppercase font-mono block">Suasana</span>
                      <span className="font-medium text-zinc-200 truncate block mt-0.5">
                        {scene.location.environmentType || scene.location.name
                          ? `${scene.location.timeOfDay} · ${scene.location.environmentType || scene.location.name}`
                          : 'Belum Ditentukan'}
                      </span>
                    </div>

                    <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-2">
                      <span className="text-[10px] text-zinc-500 uppercase font-mono block">Rig & Lensa</span>
                      <span className="font-medium text-zinc-200 truncate block mt-0.5">
                        {scene.camera.rigType} ({scene.camera.focalLength})
                      </span>
                    </div>

                    <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-2">
                      <span className="text-[10px] text-zinc-500 uppercase font-mono block">Durasi</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={scene.durationSeconds}
                          onChange={(e) =>
                            onUpdateScene({
                              ...scene,
                              durationSeconds: Math.max(1, parseInt(e.target.value) || 1),
                            })
                          }
                          className="w-12 bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-xs text-emerald-400 font-mono"
                        />
                        <span className="text-zinc-500 text-xs">detik</span>
                      </div>
                    </div>
                  </div>

                  {/* Prompt Preview Snippet */}
                  <div className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-950/80 font-mono text-[11px] text-zinc-400 line-clamp-1">
                    <span className="text-emerald-400 font-bold mr-1.5">Prompt:</span>
                    {promptPreview}
                  </div>
                </div>

                {/* Right Action Stack */}
                <div className="flex lg:flex-col items-center gap-1.5 shrink-0 self-center lg:self-start w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-zinc-800">
                  <button
                    onClick={() => {
                      onSelectScene(scene.id);
                      onNavigate('vehicle');
                    }}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-200 transition-colors"
                    title="Atur detail kendaraan scene ini"
                  >
                    <Layers className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Setup Mobil</span>
                  </button>

                  <button
                    onClick={() => handleCopyShotPrompt(scene)}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs text-emerald-400 transition-colors"
                    title="Salin prompt scene ini"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Salin</span>
                  </button>

                  <button
                    onClick={() => onDuplicateScene(scene.id)}
                    className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                    title="Duplikasi Scene"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>

                  {/* Move Up / Down */}
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => onMoveScene(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 rounded border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Geser Naik"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onMoveScene(index, 'down')}
                      disabled={index === scenes.length - 1}
                      className="p-1.5 rounded border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Geser Turun"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {scenes.length > 1 && (
                    <button
                      onClick={() => onDeleteScene(scene.id)}
                      className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Hapus Scene"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
