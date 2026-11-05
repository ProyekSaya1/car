import { useState } from 'react';
import { StoryboardScene } from '../../types';
import {
  Sparkles,
  MapPin,
  Camera,
  Sun,
  CloudRain,
  Building,
  TreePine,
  Compass,
} from 'lucide-react';

interface RefinerCardProps {
  activeScene: StoryboardScene;
  onUpdateScene: (updated: StoryboardScene) => void;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

const LOCATION_PRESETS = [
  'Jalan Kota Modern',
  'Jalan Tol Bebas Hambatan',
  'Jalan Berkelok Pegunungan',
  'Jalan Pesisir Pantai',
  'Garasi Tertutup',
  'Showroom / Studio Bersih',
  'Terowongan Bawah Tanah',
];

const TIME_OPTIONS = ['Pagi', 'Siang', 'Sore', 'Senja', 'Malam'];
const WEATHER_OPTIONS = ['Cerah', 'Berawan', 'Hujan', 'Berkabut', 'Gerimis Basah'];

const CAMERA_ANGLES = [
  'Depan Mobil',
  'Samping Mobil',
  'Belakang Mobil',
  'Dari Atas (High Angle)',
  'Dalam Kabin (Point of View)',
  'Mengikuti Mobil (Low Tracking)',
];

const CAMERA_MOTIONS = [
  'Diam (Static)',
  'Mendekat Perlahan (Dolly In)',
  'Mengikuti Mobil (Tracking)',
  'Memutari Mobil (Orbit 360)',
  'Menjauh Perlahan (Pull Out)',
];

export function RefinerCard({
  activeScene,
  onUpdateScene,
  onShowToast,
}: RefinerCardProps) {
  const loc = activeScene.location || {
    id: `l-${activeScene.sceneNumber}`,
    enabled: false,
    name: '',
    environmentType: '',
    isIndoor: false,
    timeOfDay: 'Siang Hari',
    weather: 'Cerah',
    lightingSources: '',
    roadSurface: '',
  };

  const cam = activeScene.camera || {
    id: `cam-${activeScene.sceneNumber}`,
    angle: 'Sejajar Mata (Eye Level)',
    motion: 'Diam (Static)',
    lensType: 'Standar',
    colorTone: 'Natural',
  };

  const handleDescriptionChange = (desc: string) => {
    onUpdateScene({
      ...activeScene,
      description: desc,
      promptNeedsReview: Boolean(activeScene.isPromptManuallyEdited),
    });
  };

  const handleToggleLocationSwitch = (enabled: boolean) => {
    onUpdateScene({
      ...activeScene,
      location: {
        ...loc,
        enabled,
      },
      promptNeedsReview: Boolean(activeScene.isPromptManuallyEdited),
    });
  };

  const handleUpdateLocation = (patch: Partial<typeof loc>) => {
    onUpdateScene({
      ...activeScene,
      location: {
        ...loc,
        ...patch,
      },
      promptNeedsReview: Boolean(activeScene.isPromptManuallyEdited),
    });
  };

  const handleUpdateCamera = (patch: Partial<typeof cam>) => {
    onUpdateScene({
      ...activeScene,
      camera: {
        ...cam,
        ...patch,
      },
      promptNeedsReview: Boolean(activeScene.isPromptManuallyEdited),
    });
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5 shadow-xl space-y-5 mb-5">
      {/* 1. CERITAKAN ADEGANNYA (MAIN NARRATIVE TEXTAREA) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Sparkles className="h-4 w-4" />
            <span>Ceritakan Adegannya</span>
          </label>
          <span className="text-[11px] text-zinc-500 font-mono">
            {activeScene.description?.length || 0} karakter
          </span>
        </div>

        <textarea
          rows={3}
          value={activeScene.description || ''}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="Tuliskan aksi apa yang terjadi di adegan ini... (Contoh: Mobil melaju mantap melintasi jalan aspal basah di bawah cahaya lampu jalan, pengemudi menatap fokus ke depan)"
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 p-3.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed transition-all"
        />
      </div>

      {/* 2. SAKLAR LOKASI & CUACA (DEFAULT: OFF) */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-cyan-400" />
            <div>
              <span className="text-xs font-bold text-zinc-200">
                Lokasi & Cuaca
              </span>
              <span className="ml-2 text-[10px] font-mono text-zinc-500">
                {loc.enabled ? '(Aktif di prompt)' : '(Dinonaktifkan)'}
              </span>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => handleToggleLocationSwitch(!loc.enabled)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              loc.enabled ? 'bg-cyan-500' : 'bg-zinc-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                loc.enabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Expanded Options when ON */}
        {loc.enabled && (
          <div className="space-y-3 pt-2 border-t border-zinc-800/80 animate-in fade-in duration-200">
            {/* Indoor vs Outdoor */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[11px] text-zinc-400 font-medium">Area:</span>
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                <button
                  type="button"
                  onClick={() => handleUpdateLocation({ isIndoor: false })}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all ${
                    !loc.isIndoor
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Luar Ruangan (Outdoor)
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateLocation({ isIndoor: true })}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all ${
                    loc.isIndoor
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Dalam Ruangan (Indoor)
                </button>
              </div>
            </div>

            {/* Presets Lokasi Chips */}
            <div>
              <span className="block text-[11px] text-zinc-400 font-medium mb-1.5">
                Pilih Tempat:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {LOCATION_PRESETS.map((preset) => {
                  const isSelected = loc.name === preset || loc.environmentType === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        handleUpdateLocation({
                          name: preset,
                          environmentType: preset,
                        })
                      }
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Waktu & Cuaca (Only show weather if Outdoor) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="block text-[11px] text-zinc-400 font-medium mb-1">
                  Waktu:
                </span>
                <div className="flex flex-wrap gap-1">
                  {TIME_OPTIONS.map((time) => {
                    const isSelected = loc.timeOfDay?.includes(time);
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => handleUpdateLocation({ timeOfDay: `${time} Hari` })}
                        className={`px-2 py-0.5 rounded text-[11px] border transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-semibold'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              {!loc.isIndoor && (
                <div>
                  <span className="block text-[11px] text-zinc-400 font-medium mb-1">
                    Cuaca:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {WEATHER_OPTIONS.map((weather) => {
                      const isSelected = loc.weather?.includes(weather);
                      return (
                        <button
                          key={weather}
                          type="button"
                          onClick={() => handleUpdateLocation({ weather })}
                          className={`px-2 py-0.5 rounded text-[11px] border transition-all ${
                            isSelected
                              ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 font-semibold'
                              : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {weather}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. KONTROL KAMERA CEPAT (SUDUT & GERAKAN) */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-3.5 space-y-3">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold text-zinc-200">
            Arah & Sudut Kamera Cepat
          </span>
        </div>

        {/* Sudut Kamera Chips */}
        <div>
          <span className="block text-[11px] text-zinc-400 font-medium mb-1.5">
            Sudut Pengambilan:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {CAMERA_ANGLES.map((ang) => {
              const isSelected = cam.angle === ang;
              return (
                <button
                  key={ang}
                  type="button"
                  onClick={() => handleUpdateCamera({ angle: ang, cameraAngle: ang })}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-semibold'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  {ang}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gerakan Kamera Chips */}
        <div>
          <span className="block text-[11px] text-zinc-400 font-medium mb-1.5">
            Gerakan Kamera:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {CAMERA_MOTIONS.map((mot) => {
              const isSelected = cam.motion === mot;
              return (
                <button
                  key={mot}
                  type="button"
                  onClick={() => handleUpdateCamera({ motion: mot, cameraMotion: mot })}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 font-semibold'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  {mot}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
