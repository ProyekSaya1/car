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

const RIG_PRESETS: Array<{ name: string; config: Partial<CameraConfig> }> = [
  {
    name: 'Russian Arm Chase Crane',
    config: {
      rigType: 'Russian Arm Chase Crane',
      focalLength: '24mm Anamorphic Wide',
      cameraMotion: 'Pelacakan dinamis paralel kecepatan tinggi',
      aspectRatio: '2.39:1 Anamorphic Sinematik',
      shutterMotionBlur: '1/48s Blur Alami Sinematik',
      colorGrading: 'Teal & Orange Sinematik',
    },
  },
  {
    name: 'Drone Balap FPV Menukik',
    config: {
      rigType: 'Drone Balap FPV Manuver Cepat',
      focalLength: '16mm Ultra-Wide',
      cameraMotion: 'Menukik agresif dari atas menuju kap mesin',
      aspectRatio: '16:9 Standar',
      shutterMotionBlur: '1/96s Shutter Cepat Sangat Tajam',
      colorGrading: 'Sian Neon & Emerald Noir',
    },
  },
  {
    name: 'Kamera Rendah Merapat Aspal',
    config: {
      rigType: 'Kamera Rendah Merapat Aspal',
      focalLength: '24mm Anamorphic Wide',
      cameraMotion: 'Whip pan cepat mengikuti arah drift',
      aspectRatio: '2.39:1 Anamorphic Sinematik',
      shutterMotionBlur: '1/48s Blur Alami Sinematik',
      colorGrading: 'Sian Neon & Emerald Noir',
    },
  },
  {
    name: 'Sudut Pandang Bahu Kokpit',
    config: {
      rigType: 'Sudut Pandang Sudut Bahu Kokpit',
      focalLength: '35mm Sinematik Master',
      cameraMotion: 'Getaran dinamis dengan camera shake',
      aspectRatio: '16:9 Standar',
      shutterMotionBlur: '1/48s Blur Alami Sinematik',
      colorGrading: 'Nuansa Hangat Gurun Film Grain',
    },
  },
  {
    name: 'Macro Close-Up Pelek & Rem',
    config: {
      rigType: 'Macro Close-Up Pelek & Rem',
      focalLength: '85mm Kompresi Telephoto',
      cameraMotion: 'Pelacakan dinamis paralel kecepatan tinggi',
      aspectRatio: '2.39:1 Anamorphic Sinematik',
      shutterMotionBlur: '1/96s Shutter Cepat Sangat Tajam',
      colorGrading: 'Monokrom Industri Dingin',
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

  const handleLoadPreset = (presetName: string, presetConfig: Partial<CameraConfig>) => {
    onUpdateCamera({
      ...current,
      ...presetConfig,
    });
    onShowToast(`Berhasil memuat preset rig kamera: ${presetName}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title & Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Video className="h-4 w-4" />
            <span>MODUL 05 // SINEMATOGRAFI & RIG KAMERA</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            Rig Kamera, Focal Length & Pergerakan
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Optik sinematik untuk <strong className="text-zinc-200">Scene #{activeScene.sceneNumber}: {activeScene.title}</strong>
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

      {/* Preset Camera Rigs */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
          Preset Rig Kamera Sinematik Otomotif
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {RIG_PRESETS.map((preset) => {
            const isMatch = current.rigType === preset.config.rigType;
            return (
              <button
                key={preset.name}
                onClick={() => handleLoadPreset(preset.name, preset.config)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isMatch
                    ? 'border-cyan-500 bg-cyan-500/10 text-white'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="text-xs font-bold truncate text-zinc-100">{preset.name}</div>
                <div className="text-[11px] text-zinc-400 mt-1 font-mono">
                  {preset.config.focalLength} · {preset.config.aspectRatio}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Rig Type */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Camera className="h-4 w-4 text-emerald-400" />
              Platform Rig Kamera
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(
                [
                  'Russian Arm Chase Crane',
                  'Drone Balap FPV Manuver Cepat',
                  'Kamera Rendah Merapat Aspal',
                  'Sudut Pandang Sudut Bahu Kokpit',
                  'Macro Close-Up Pelek & Rem',
                  'Kamera Helikopter Pantauan Udara',
                  'Kamera Statis Telephoto Pan',
                ] as const
              ).map((rig) => (
                <button
                  key={rig}
                  onClick={() => handleChange('rigType', rig)}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    current.rigType === rig
                      ? 'border-emerald-500/80 bg-emerald-500/10 text-emerald-300 font-semibold'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {rig}
                </button>
              ))}
            </div>
          </div>

          {/* Focal Length & Framing */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Film className="h-4 w-4 text-cyan-400" />
              Panjang Fokus Lensa (Focal Length) & Optik
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                [
                  '16mm Ultra-Wide',
                  '24mm Anamorphic Wide',
                  '35mm Sinematik Master',
                  '50mm Standar Natural',
                  '85mm Kompresi Telephoto',
                  '135mm Telephoto Jauh',
                ] as const
              ).map((focal) => (
                <button
                  key={focal}
                  onClick={() => handleChange('focalLength', focal)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                    current.focalLength === focal
                      ? 'border-cyan-500/80 bg-cyan-500/10 text-cyan-300'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {focal}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Rasio Aspek (Aspect Ratio)</label>
                <select
                  value={current.aspectRatio}
                  onChange={(e) => handleChange('aspectRatio', e.target.value as any)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="2.39:1 Anamorphic Sinematik">2.39:1 Anamorphic (Layar Lebar Bioskop)</option>
                  <option value="16:9 Standar">16:9 (Standar Widescreen UHD)</option>
                  <option value="9:16 Vertikal (Reels / TikTok)">9:16 Vertikal (Format Reels & TikTok)</option>
                  <option value="4:3 Sinematik Klasik">4:3 Sinematik Klasik Academy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Kecepatan Shutter & Motion Blur</label>
                <select
                  value={current.shutterMotionBlur}
                  onChange={(e) => handleChange('shutterMotionBlur', e.target.value as any)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="1/48s Blur Alami Sinematik">1/48s (180° Blur Gerakan Film Alami)</option>
                  <option value="1/96s Shutter Cepat Sangat Tajam">1/96s (Shutter Cepat Roda Sangat Tajam)</option>
                  <option value="1/24s Jejak Cahaya Lembut">1/24s (Shutter Lambat Jejak Lampu Mengalir)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Camera Motion Trajectory */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              Trayektori & Pergerakan Kamera
            </h3>

            <div className="space-y-2">
              {(
                [
                  'Pelacakan dinamis paralel kecepatan tinggi',
                  'Menukik agresif dari atas menuju kap mesin',
                  'Rotasi 180 derajat mengelilingi mobil',
                  'Getaran dinamis dengan camera shake',
                  'Gerakan maju perlahan sinematik',
                  'Whip pan cepat mengikuti arah drift',
                ] as const
              ).map((motion) => (
                <button
                  key={motion}
                  onClick={() => handleChange('cameraMotion', motion)}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    current.cameraMotion === motion
                      ? 'border-emerald-500 bg-emerald-500/10 text-white font-medium'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <span>{motion}</span>
                  {current.cameraMotion === motion && <Check className="h-4 w-4 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Color Grade & Token Preview */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="h-4 w-4 text-cyan-400" />
              Profil LUT Pewarnaan (Color Grade)
            </h3>
            <p className="text-xs text-zinc-400">
              Menentukan grading warna dan kurva kontras dalam prompt generasi video AI.
            </p>

            <div className="space-y-2">
              {(
                [
                  'Sian Neon & Emerald Noir',
                  'Teal & Orange Sinematik',
                  'Nuansa Hangat Gurun Film Grain',
                  'Monokrom Industri Dingin',
                  'Vintage 35mm Analog Klasik',
                ] as const
              ).map((grade) => (
                <button
                  key={grade}
                  onClick={() => handleChange('colorGrading', grade)}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    current.colorGrading === grade
                      ? 'border-cyan-500 bg-cyan-500/10 text-white font-medium'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <span>{grade}</span>
                  {current.colorGrading === grade && <Check className="h-4 w-4 text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Token Preview */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                Token Kamera Tersintesis
              </span>
              <span className="text-[10px] font-mono text-cyan-400">Live</span>
            </div>
            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/80 font-mono text-xs text-zinc-300 leading-relaxed">
              "Direkam menggunakan {current.rigType} dengan lensa {current.focalLength}, melakukan {current.cameraMotion}. Kecepatan shutter {current.shutterMotionBlur}, dengan color grade {current.colorGrading}."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
