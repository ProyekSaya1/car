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
  TreePine,
  Lightbulb,
} from 'lucide-react';
import { LocationConfig, StoryboardScene } from '../../types';

interface LocationSetupViewProps {
  activeScene: StoryboardScene;
  onUpdateLocation: (updated: LocationConfig) => void;
  onApplyToAllScenes: (loc: LocationConfig) => void;
  onShowToast: (msg: string) => void;
}

const UNIVERSAL_ENVIRONMENTS = [
  {
    name: 'Jalan Raya Perkotaan',
    environmentType: 'Jalanan Kota Modern',
    timeOfDay: 'Siang Hari',
    weather: 'Cerah',
    lightingSources: 'Cahaya Alami Matahari',
    roadSurface: 'Aspal Mulus Bersih',
  },
  {
    name: 'Jalan Bebas Hambatan',
    environmentType: 'Jalan Tol Antar Kota',
    timeOfDay: 'Sore Hari (Golden Hour)',
    weather: 'Cerah Berawan',
    lightingSources: 'Sinar Matahari Rendah',
    roadSurface: 'Aspal Mulus',
  },
  {
    name: 'Jalur Pedesaan & Perbukitan',
    environmentType: 'Jalan Perbukitan Berkelok Indah',
    timeOfDay: 'Pagi Hari',
    weather: 'Cerah Segar',
    lightingSources: 'Cahaya Pagi Lembut',
    roadSurface: 'Aspal Halus',
  },
  {
    name: 'Studio Otomotif / Showroom',
    environmentType: 'Studio Fotografi Otomotif Minimalis',
    timeOfDay: 'Pencahayaan Studio Terkontrol',
    weather: 'Dalam Ruangan (Indoor)',
    lightingSources: 'Softbox Difus & Lampu Overhead Bersih',
    roadSurface: 'Lantai Poles Reflektif',
  },
  {
    name: 'Pesisir Pantai Terbuka',
    environmentType: 'Jalan Pesisir Samudra Terbuka',
    timeOfDay: 'Senja (Blue Hour)',
    weather: 'Angin Tenang',
    lightingSources: 'Gradasi Langit Senja',
    roadSurface: 'Aspal Pesisir',
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

  const handleLoadTemplate = (env: typeof UNIVERSAL_ENVIRONMENTS[0]) => {
    onUpdateLocation({
      ...current,
      name: env.name,
      environmentType: env.environmentType,
      timeOfDay: env.timeOfDay as any,
      weather: env.weather as any,
      lightingSources: env.lightingSources as any,
      roadSurface: env.roadSurface as any,
    });
    onShowToast(`Pengaturan lingkungan dimuat: ${env.name}`);
  };

  const hasLocation = Boolean(current.name || current.environmentType);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title & Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <Compass className="h-4 w-4" />
            <span>MODUL 04 // LINGKUNGAN, CUACA & PENCAHAYAAN (UNIVERSAL)</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            Setting Lingkungan & Tata Cahaya
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Suasana atmosfer dan permukaan jalan untuk <strong className="text-zinc-200">Scene #{activeScene.sceneNumber}: {activeScene.title || 'Scene Aktif'}</strong>
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

      {/* Empty State / Hint */}
      {!hasLocation && (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 p-6 text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-zinc-900 text-zinc-400">
            <MapPin className="h-6 w-6 text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold text-zinc-200">
            Belum Ada Lokasi Ditentukan untuk Scene Ini
          </h3>
          <p className="text-xs text-zinc-400 max-w-lg mx-auto">
            Tentukan latar belakang jalan, studio, cuaca, dan waktu pengambilan gambar, atau pilih salah satu inspirasi lingkungan universal di bawah ini.
          </p>
        </div>
      )}

      {/* Inspirasi Lingkungan Universal */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
          Inspirasi Latar Otomotif Universal (Opsional)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {UNIVERSAL_ENVIRONMENTS.map((env) => {
            const isMatch = current.name === env.name;
            return (
              <button
                key={env.name}
                onClick={() => handleLoadTemplate(env)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isMatch
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="text-xs font-bold truncate text-zinc-100">{env.name}</div>
                <div className="text-[10px] text-zinc-400 mt-1 font-mono truncate">
                  {env.timeOfDay} · {env.weather}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tipe Lingkungan */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="h-4 w-4 text-emerald-400" />
              Latar Tempat & Lingkungan
            </h3>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Nama Lokasi (Opsional)
              </label>
              <input
                type="text"
                value={current.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Contoh: Kawasan Bisnis Kota, Jalur Lembah Hijau, Area Pameran..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Tipe Lingkungan
              </label>
              <input
                type="text"
                value={current.environmentType}
                onChange={(e) => handleChange('environmentType', e.target.value)}
                placeholder="Contoh: Jalan Raya Perkotaan Terbuka, Jalan Tol Mulus, Studio Putih Minimalis..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Waktu & Cuaca */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-400" />
              Waktu Pengambilan & Cuaca
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Waktu Hari</label>
                <select
                  value={current.timeOfDay}
                  onChange={(e) => handleChange('timeOfDay', e.target.value as any)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Pagi Hari">Pagi Hari (Sunrise)</option>
                  <option value="Siang Hari">Siang Hari (Cahaya Terang)</option>
                  <option value="Sore Hari">Sore Hari (Golden Hour)</option>
                  <option value="Senja">Senja (Blue Hour)</option>
                  <option value="Malam Hari">Malam Hari</option>
                  <option value="Terkontrol Studio">Terkontrol Studio / Showroom</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Kondisi Cuaca</label>
                <select
                  value={current.weather}
                  onChange={(e) => handleChange('weather', e.target.value as any)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Cerah">Cerah Bersih</option>
                  <option value="Cerah Berawan">Cerah Berawan Lembut</option>
                  <option value="Mendung">Mendung Redup</option>
                  <option value="Hujan Gerimis">Hujan Gerimis</option>
                  <option value="Hujan Deras">Hujan Deras Basah</option>
                  <option value="Berkabut">Berkabut Alami</option>
                  <option value="Indoor Bebas Cuaca">Dalam Ruangan (Indoor)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Permukaan Jalan & Tata Cahaya */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-cyan-400" />
              Tata Cahaya & Permukaan Jalan
            </h3>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Sumber Pencahayaan Utama
              </label>
              <input
                type="text"
                value={current.lightingSources}
                onChange={(e) => handleChange('lightingSources', e.target.value)}
                placeholder="Contoh: Sinar matahari langsung, Lampu jalan perkotaan, Softbox studio, Sorotan lampu depan..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Permukaan Jalan / Lantai
              </label>
              <input
                type="text"
                value={current.roadSurface}
                onChange={(e) => handleChange('roadSurface', e.target.value)}
                placeholder="Contoh: Aspal mulus kering, Aspal basah berkilau, Beton bersih, Lantai studio poles..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Ringkasan Lingkungan */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                Deskripsi Lingkungan Scene
              </span>
            </div>
            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/80 font-mono text-xs text-zinc-300 leading-relaxed">
              {hasLocation
                ? `"${current.environmentType || current.name || 'Jalan terbuka'} pada waktu ${current.timeOfDay}, cuaca ${current.weather}, dengan pencahayaan ${current.lightingSources}, di atas permukaan ${current.roadSurface}."`
                : 'Belum ada latar lingkungan yang ditentukan.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
