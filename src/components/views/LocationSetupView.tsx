import { useState } from 'react';
import {
  Compass,
  CloudRain,
  Sun,
  Sparkles,
  Layers,
  MapPin,
  Check,
  Building2,
} from 'lucide-react';
import { LocationConfig, StoryboardScene } from '../../types';

interface LocationSetupViewProps {
  activeScene: StoryboardScene;
  onUpdateLocation: (updated: LocationConfig) => void;
  onApplyToAllScenes: (loc: LocationConfig) => void;
  onShowToast: (msg: string) => void;
}

const LOCATION_PRESETS: Array<{ name: string; config: Partial<LocationConfig> }> = [
  {
    name: 'Jalan Tol Layang Tengah Malam',
    config: {
      name: 'Tol Layang Perkotaan C1',
      environmentType: 'Jalan Tol Layang Malam Hari',
      timeOfDay: 'Tengah Malam',
      weather: 'Aspal Basah dengan Pantulan Cahaya Neon',
      lightingSources: 'Lampu jalan sodium & lampu overhead sian',
      roadSurface: 'Aspal basah licin memantulkan cahaya cermin',
    },
  },
  {
    name: 'Gurun Pasir Terbuka Sunset',
    config: {
      name: 'Lintasan Lurus Gurun Pasir',
      environmentType: 'Jalan Raya Gurun Pasir Terbuka',
      timeOfDay: 'Matahari Terbenam (Golden Hour)',
      weather: 'Udara Kering Berdebu Gurun',
      lightingSources: 'Sinar matahari senja sudut rendah',
      roadSurface: 'Aspal kering retak-retak khas gurun',
    },
  },
  {
    name: 'Gang Kota Modern Hujan Lebat',
    config: {
      name: 'Lorong Kota Modern Gemerlap',
      environmentType: 'Gang Kota Modern Hujan Lampu Neon',
      timeOfDay: 'Tengah Malam',
      weather: 'Hujan Deras Mengguyur',
      lightingSources: 'Papan neon warna-warni pertokoan kota',
      roadSurface: 'Aspal basah licin memantulkan cahaya cermin',
    },
  },
  {
    name: 'Jalan Tebing Laut Berkelok Senja',
    config: {
      name: 'Tebing Pesisir Samudra',
      environmentType: 'Jalan Tebing Pantai Berkelok',
      timeOfDay: 'Senja Dusk (Blue Hour)',
      weather: 'Kabut Tebal Bergelombang',
      lightingSources: 'Sorotan lampu utama mobil membelah kegelapan',
      roadSurface: 'Jalanan beton mulus pegunungan',
    },
  },
  {
    name: 'Gedung Parkir Beton Bawah Tanah',
    config: {
      name: 'Area Parkir Beton Brutalis',
      environmentType: 'Gedung Parkir Beton Bawah Tanah',
      timeOfDay: 'Tengah Malam',
      weather: 'Kabut Tebal Bergelombang',
      lightingSources: 'Lampu sorot industri berkekuatan tinggi',
      roadSurface: 'Lantai garasi semen poles mengkilap',
    },
  },
];

export function LocationSetupView({
  activeScene,
  onUpdateLocation,
  onApplyToAllScenes,
  onShowToast,
}: LocationSetupViewProps) {
  const current = activeScene.location;

  const handleChange = <K extends keyof LocationConfig>(field: K, value: LocationConfig[K]) => {
    onUpdateLocation({
      ...current,
      [field]: value,
    });
  };

  const handleLoadPreset = (presetConfig: Partial<LocationConfig>) => {
    onUpdateLocation({
      ...current,
      ...presetConfig,
    });
    onShowToast(`Berhasil memuat preset lokasi: ${presetConfig.name}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title & Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <Compass className="h-4 w-4" />
            <span>MODUL 04 // LINGKUNGAN, CUACA & PENCAHAYAAN</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            Setting Dunia, Pencahayaan & Cuaca
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Suasana atmosfer untuk <strong className="text-zinc-200">Scene #{activeScene.sceneNumber}: {activeScene.title}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onApplyToAllScenes(current);
              onShowToast('Pengaturan lingkungan ini berhasil diterapkan ke semua scene!');
            }}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-200 transition-colors"
          >
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>Terapkan ke Semua Scene</span>
          </button>
        </div>
      </div>

      {/* Preset Strips */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
          Preset Lingkungan Sinematik
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {LOCATION_PRESETS.map((preset) => {
            const isMatch = current.environmentType === preset.config.environmentType;
            return (
              <button
                key={preset.name}
                onClick={() => handleLoadPreset(preset.config)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isMatch
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="text-xs font-bold truncate text-zinc-100">{preset.name}</div>
                <div className="text-[11px] text-zinc-400 mt-1 font-mono">
                  {preset.config.timeOfDay} · {preset.config.weather}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Environment Biome */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-400" />
              Area Lingkungan & Lokasi
            </h3>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Nama Lokasi / Tempat</label>
              <input
                type="text"
                value={current.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
                placeholder="misal: Jalur Pegunungan Berkelok, Tol Layang Malam"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Tipe Lingkungan Arsitektur</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(
                  [
                    'Jalan Tol Layang Malam Hari',
                    'Gang Kota Modern Hujan Lampu Neon',
                    'Jalan Raya Gurun Pasir Terbuka',
                    'Jalan Tebing Pantai Berkelok',
                    'Gedung Parkir Beton Bawah Tanah',
                    'Jalur Pegunungan Berkelok (Touge)',
                    'Area Pelabuhan Kontainer Industri',
                  ] as const
                ).map((env) => (
                  <button
                    key={env}
                    onClick={() => handleChange('environmentType', env)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      current.environmentType === env
                        ? 'border-emerald-500/80 bg-emerald-500/10 text-emerald-300 font-semibold'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Time of Day & Lighting */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sun className="h-4 w-4 text-cyan-400" />
              Waktu Hari & Sudut Cahaya Matahari
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                [
                  'Tengah Malam',
                  'Senja Dusk (Blue Hour)',
                  'Matahari Terbenam (Golden Hour)',
                  'Sore Hari Hangat',
                  'Fajar Dini Hari Berkabut',
                  'Malam Badai Petir',
                ] as const
              ).map((time) => (
                <button
                  key={time}
                  onClick={() => handleChange('timeOfDay', time)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                    current.timeOfDay === time
                      ? 'border-cyan-500/80 bg-cyan-500/10 text-cyan-300'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Sumber Pencahayaan Utama</label>
              <select
                value={current.lightingSources}
                onChange={(e) => handleChange('lightingSources', e.target.value as any)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value="Lampu jalan sodium & lampu overhead sian">Lampu jalan sodium & lampu overhead sian (Gaya Tol Layang)</option>
                <option value="Sinar matahari senja sudut rendah">Sinar matahari senja sudut rendah (Flare Keemasan)</option>
                <option value="Papan neon warna-warni pertokoan kota">Papan neon warna-warni pertokoan kota (Metropolitan Modern)</option>
                <option value="Sorotan lampu utama mobil membelah kegelapan">Sorotan lampu utama mobil membelah kegelapan</option>
                <option value="Lampu sorot industri berkekuatan tinggi">Lampu sorot industri berkekuatan tinggi (Pelabuhan / Gudang)</option>
              </select>
            </div>
          </div>

          {/* Road Surface & Wetness */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="h-4 w-4 text-emerald-400" />
              Karakter Permukaan Jalan & Refleksi Aspal
            </h3>

            <div className="space-y-2">
              {(
                [
                  'Aspal basah licin memantulkan cahaya cermin',
                  'Aspal kering retak-retak khas gurun',
                  'Jalanan beton mulus pegunungan',
                  'Lantai garasi semen poles mengkilap',
                ] as const
              ).map((surf) => (
                <button
                  key={surf}
                  onClick={() => handleChange('roadSurface', surf)}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    current.roadSurface === surf
                      ? 'border-emerald-500 bg-emerald-500/10 text-white font-medium'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <span>{surf}</span>
                  {current.roadSurface === surf && <Check className="h-4 w-4 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Weather & Fog */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CloudRain className="h-4 w-4 text-cyan-400" />
              Cuaca & Atmosfer Udara
            </h3>
            <p className="text-xs text-zinc-400">
              Menyuntikkan partikel air, kabut volumetrik, dan percikan hujan pada lensa ke dalam model video AI.
            </p>

            <div className="space-y-2">
              {(
                [
                  'Aspal Basah dengan Pantulan Cahaya Neon',
                  'Kabut Tebal Bergelombang',
                  'Langit Malam Cerah Bertabur Bintang',
                  'Udara Kering Berdebu Gurun',
                  'Hujan Deras Mengguyur',
                  'Kilauan Cahaya Matahari Terang',
                ] as const
              ).map((w) => (
                <button
                  key={w}
                  onClick={() => handleChange('weather', w)}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    current.weather === w
                      ? 'border-cyan-500 bg-cyan-500/10 text-white font-medium'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <span>{w}</span>
                  {current.weather === w && <Check className="h-4 w-4 text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Token Preview */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                Token Lingkungan
              </span>
              <span className="text-[10px] font-mono text-cyan-400">Live</span>
            </div>
            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/80 font-mono text-xs text-zinc-300 leading-relaxed">
              "{current.environmentType} pada waktu {current.timeOfDay}, dengan kondisi {current.weather} di atas {current.roadSurface}. Diterangi oleh {current.lightingSources}."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
