import { useState } from 'react';
import {
  Video,
  Sparkles,
  Layers,
  Check,
  Film,
  Camera,
  Activity,
  Sliders,
} from 'lucide-react';
import { CameraConfig, StoryboardScene } from '../../types';

interface CameraControlViewProps {
  activeScene: StoryboardScene;
  onUpdateCamera: (updated: CameraConfig) => void;
  onApplyToAllScenes: (cam: CameraConfig) => void;
  onShowToast: (msg: string) => void;
}

const UNIVERSAL_CAMERA_RIGS: Array<{ name: string; config: Partial<CameraConfig> }> = [
  {
    name: 'Pelacakan Sinematik Sejajar',
    config: {
      rigType: 'Rig Kamera Tracking Halus',
      focalLength: '35mm Sinematik Standar',
      cameraMotion: 'Pelacakan sejajar bergerak halus di samping bodi kendaraan',
      aspectRatio: '16:9 Standar',
      shutterMotionBlur: 'Alami 1/48s (Blur Sinematik)',
      colorGrading: 'Sinematik Netral Bersih',
    },
  },
  {
    name: 'Sudut Tiga Perempat Rendah',
    config: {
      rigType: 'Kamera Rendah Tiga Perempat',
      focalLength: '24mm Sudut Lebar',
      cameraMotion: 'Pelacakan rendah menonjolkan siluet dan pelek kendaraan',
      aspectRatio: '2.39:1 Anamorphic',
      shutterMotionBlur: 'Alami 1/48s (Blur Sinematik)',
      colorGrading: 'Kontras Hangat Sinematik',
    },
  },
  {
    name: 'Sudut Pandang Kokpit (Interior POV)',
    config: {
      rigType: 'Kamera Kokpit Bahu Pengemudi',
      focalLength: '28mm Lensa Lebar Kokpit',
      cameraMotion: 'Kamera stabil di dalam kabin menangkap setir dan kaca depan',
      aspectRatio: '16:9 Standar',
      shutterMotionBlur: 'Alami 1/48s (Blur Sinematik)',
      colorGrading: 'Natural Alami',
    },
  },
  {
    name: 'Close-Up Detail Kendaraan (Makro)',
    config: {
      rigType: 'Lensa Makro Detail',
      focalLength: '85mm Telephoto Kompresi',
      cameraMotion: 'Panci lambat menyorot emblem, pelek, atau lampu kendaraan',
      aspectRatio: '16:9 Standar',
      shutterMotionBlur: '1/96s Shutter Cepat Tajam',
      colorGrading: 'Studio Bersih Kontras Tinggi',
    },
  },
  {
    name: 'Bidikan Statis Sudut Lebar',
    config: {
      rigType: 'Tripod Statis Sinematik',
      focalLength: '50mm Perspektif Mata Manusia',
      cameraMotion: 'Kamera statis membiarkan kendaraan melintas melintasi frame',
      aspectRatio: '16:9 Standar',
      shutterMotionBlur: 'Alami 1/48s (Blur Sinematik)',
      colorGrading: 'Sinematik Netral Bersih',
    },
  },
  {
    name: 'Kamera Udara Lembut (Aerial Glide)',
    config: {
      rigType: 'Drone Sinematik Halus',
      focalLength: '24mm Sudut Lebar',
      cameraMotion: 'Pergerakan meluncur lembut dari atas mengikuti rute kendaraan',
      aspectRatio: '16:9 Standar',
      shutterMotionBlur: 'Alami 1/48s (Blur Sinematik)',
      colorGrading: 'Sinematik Netral Bersih',
    },
  },
];

export function CameraControlView({
  activeScene,
  onUpdateCamera,
  onApplyToAllScenes,
  onShowToast,
}: CameraControlViewProps) {
  const current = activeScene.camera;

  const handleChange = <K extends keyof CameraConfig>(field: K, value: CameraConfig[K]) => {
    onUpdateCamera({
      ...current,
      [field]: value,
    });
  };

  const handleLoadRig = (rigName: string, rigConfig: Partial<CameraConfig>) => {
    onUpdateCamera({
      ...current,
      ...rigConfig,
    });
    onShowToast(`Rig kamera dimuat: ${rigName}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Video className="h-4 w-4" />
            <span>MODUL 05 // SINEMATOGRAFI, RIG & LENSA KAMERA</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            Kontrol Rig Kamera & Optik Sinematik
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Sudut lensa, rasio aspek, dan pergerakan kamera untuk <strong className="text-zinc-200">Scene #{activeScene.sceneNumber}: {activeScene.title || 'Scene Aktif'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onApplyToAllScenes(current);
              onShowToast('Pengaturan kamera ini berhasil diterapkan ke semua scene!');
            }}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-200 transition-colors"
          >
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>Terapkan ke Semua Scene</span>
          </button>
        </div>
      </div>

      {/* Preset Rig Kamera Universal */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
          Rig & Gaya Pengambilan Gambar Universal
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {UNIVERSAL_CAMERA_RIGS.map((rig) => {
            const isMatch = current.rigType === rig.config.rigType;
            return (
              <button
                key={rig.name}
                onClick={() => handleLoadRig(rig.name, rig.config)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isMatch
                    ? 'border-cyan-500 bg-cyan-500/10 text-white'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="text-xs font-bold truncate text-zinc-100">{rig.name}</div>
                <div className="text-[10px] text-zinc-400 mt-1 font-mono truncate">
                  {rig.config.focalLength} · {rig.config.aspectRatio}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Controls Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Rig & Focal Length */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Camera className="h-4 w-4 text-emerald-400" />
              Lensa & Jenis Rig Kamera
            </h3>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Jenis Rig / Penyangga Kamera
              </label>
              <input
                type="text"
                value={current.rigType}
                onChange={(e) => handleChange('rigType', e.target.value)}
                placeholder="Contoh: Kamera Pelacak Sinematik, Tripod Statis, Rig Kamera Bahu..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Focal Length (Panjang Lensa)
                </label>
                <select
                  value={current.focalLength}
                  onChange={(e) => handleChange('focalLength', e.target.value as any)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="16mm Ultra-Wide">16mm Ultra-Wide (Dramatis & Luas)</option>
                  <option value="24mm Sudut Lebar">24mm Sudut Lebar (Proporsi Bodi Dinamis)</option>
                  <option value="35mm Sinematik Standar">35mm Sinematik Standar (Alami & Seimbang)</option>
                  <option value="50mm Perspektif Mata Manusia">50mm Perspektif Mata Manusia</option>
                  <option value="85mm Telephoto Kompresi">85mm Telephoto (Kompresi Latar Belakang)</option>
                  <option value="135mm Super-Telephoto">135mm Super-Telephoto (Isolasi Kendaraan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Rasio Aspek (Aspect Ratio)
                </label>
                <select
                  value={current.aspectRatio}
                  onChange={(e) => handleChange('aspectRatio', e.target.value as any)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="16:9 Standar">16:9 Layar Lebar Standar</option>
                  <option value="2.39:1 Anamorphic">2.39:1 Anamorphic Sinematik</option>
                  <option value="9:16 Vertikal">9:16 Vertikal (Smartphone / Reels)</option>
                  <option value="4:3 Klasik">4:3 Klasik Retro</option>
                  <option value="1:1 Persegi">1:1 Persegi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Gerakan Kamera & Shutter */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              Pergerakan Kamera & Motion Blur
            </h3>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Pergerakan Kamera (Camera Motion)
              </label>
              <input
                type="text"
                value={current.cameraMotion}
                onChange={(e) => handleChange('cameraMotion', e.target.value)}
                placeholder="Contoh: Pelacakan halus di samping mobil, Mengikuti kendaraan dari belakang..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Shutter & Motion Blur
                </label>
                <select
                  value={current.shutterMotionBlur}
                  onChange={(e) => handleChange('shutterMotionBlur', e.target.value as any)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Alami 1/48s (Blur Sinematik)">Alami 1/48s (Blur Sinematik Standar)</option>
                  <option value="1/96s Shutter Cepat Tajam">1/96s Shutter Cepat Tajam</option>
                  <option value="1/250s Shutter Ekstrem">1/250s Shutter Ekstrem (Tanpa Blur)</option>
                  <option value="1/24s Slow Shutter">1/24s Slow Shutter (Streak Cahaya Panjang)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Pewarnaan (Color Grading)
                </label>
                <select
                  value={current.colorGrading}
                  onChange={(e) => handleChange('colorGrading', e.target.value as any)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Sinematik Netral Bersih">Sinematik Netral Bersih</option>
                  <option value="Kontras Hangat Sinematik">Kontras Hangat Sinematik (Golden)</option>
                  <option value="Studio Bersih Kontras Tinggi">Studio Bersih Kontras Tinggi</option>
                  <option value="Nuansa Sejuk Dingin">Nuansa Sejuk Dingin</option>
                  <option value="Monokrom Hitam Putih">Monokrom Hitam Putih</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Token Ringkasan Kamera */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                Deskripsi Kamera Scene
              </span>
            </div>
            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/80 font-mono text-xs text-zinc-300 leading-relaxed">
              "Diambil menggunakan {current.rigType} dengan lensa {current.focalLength}, melakukan {current.cameraMotion}, rasio aspek {current.aspectRatio}, shutter {current.shutterMotionBlur}, pewarnaan {current.colorGrading}."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
