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
  Home,
  Trees,
} from 'lucide-react';
import { LocationConfig, StoryboardScene, ViewMode } from '../../types';
import { ModuleHeader } from '../layout/ModuleHeader';

interface LocationSetupViewProps {
  activeScene: StoryboardScene;
  onUpdateLocation: (updated: LocationConfig) => void;
  onApplyToAllScenes: (loc: LocationConfig) => void;
  onShowToast: (msg: string) => void;
  onNavigate?: (view: ViewMode) => void;
}

const UNIVERSAL_ENVIRONMENTS = [
  {
    name: 'Jalan Raya Perkotaan Modern',
    environmentType: 'Jalanan Boulevard Perkotaan',
    isIndoor: false,
    atmosphere: 'Modern & Berwibawa',
    timeOfDay: 'Siang Hari',
    weather: 'Cerah',
    lightingSources: 'Cahaya Alami Matahari',
    roadSurface: 'Aspal Mulus Bersih',
  },
  {
    name: 'Jalan Bebas Hambatan Sore',
    environmentType: 'Jalan Tol Terbuka Antar Kota',
    isIndoor: false,
    atmosphere: 'Dramatis & Sinematik',
    timeOfDay: 'Sore Hari (Golden Hour)',
    weather: 'Cerah Berawan',
    lightingSources: 'Sinar Keemasan Matahari Rendah',
    roadSurface: 'Aspal Halus dengan Pantulan Halus',
  },
  {
    name: 'Jalur Pegunungan Berkelok',
    environmentType: 'Jalan Perbukitan Lereng Lembah',
    isIndoor: false,
    atmosphere: 'Sejuk & Petualangan',
    timeOfDay: 'Pagi Hari',
    weather: 'Cerah Segar',
    lightingSources: 'Cahaya Pagi Lembut',
    roadSurface: 'Aspal Berkelok Mulus',
  },
  {
    name: 'Studio Otomotif / Showroom',
    environmentType: 'Studio Fotografi Otomotif Minimalis',
    isIndoor: true,
    atmosphere: 'Mewah & Bersih Eksklusif',
    timeOfDay: 'Terkontrol Studio',
    weather: 'Dalam Ruangan (Indoor)',
    lightingSources: 'Softbox Difus & Lampu Overhead Bersih',
    roadSurface: 'Lantai Poles Reflektif',
  },
  {
    name: 'Pesisir Pantai Samudra',
    environmentType: 'Jalan Tepi Laut Terbuka',
    isIndoor: false,
    atmosphere: 'Tenang & Megah',
    timeOfDay: 'Senja (Blue Hour)',
    weather: 'Angin Tenang',
    lightingSources: 'Gradasi Langit Senja & Rim Light Bodi Mobil',
    roadSurface: 'Aspal Pesisir Bersih',
  },
  {
    name: 'Garasi / Workshop Eksklusif',
    environmentType: 'Garasi Modern Arsitektural',
    isIndoor: true,
    atmosphere: 'Industrial Elegan',
    timeOfDay: 'Terkontrol Studio',
    weather: 'Indoor Bebas Cuaca',
    lightingSources: 'Lampu LED Batang Linear & Spotlight Kendaraan',
    roadSurface: 'Lantai Semen Epoxy Halus',
  },
];

const ATMOSPHERE_OPTIONS = [
  'Dramatis & Sinematik',
  'Tenang & Bersih',
  'Mewah & Eksklusif',
  'Gemerlap Perkotaan Dinamis',
  'Sejuk & Petualangan Alami',
  'Misterius & Moody',
];

export function LocationSetupView({
  activeScene,
  onUpdateLocation,
  onApplyToAllScenes,
  onShowToast,
  onNavigate,
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
      isIndoor: env.isIndoor,
      atmosphere: env.atmosphere,
      timeOfDay: env.timeOfDay,
      weather: env.weather,
      lightingSources: env.lightingSources,
      roadSurface: env.roadSurface,
    });
    onShowToast(`Pengaturan lingkungan dimuat: ${env.name}`);
  };

  const hasLocation = Boolean(current.name || current.environmentType);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Module Navigation Bar */}
      <ModuleHeader
        moduleNumber="MODUL 04"
        moduleTitle="Location Setup (Lingkungan & Tata Cahaya)"
        moduleDescription="Tentukan latar indoor/outdoor, suasana atmosfer, waktu, cuaca, dan kondisi permukaan"
        currentView="location"
        onNavigate={onNavigate}
        prevView={{ view: 'character', label: 'Character Setup' }}
        nextView={{ view: 'camera', label: 'Camera Control' }}
      />

      {/* Title & Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <Compass className="h-4 w-4" />
            <span>MODUL 04 // LINGKUNGAN, CUACA & PENCAHAYAAN (UNIVERSAL)</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            Setting Lingkungan, Suasana & Tata Cahaya
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Suasana atmosfer dan permukaan jalan untuk <strong className="text-zinc-200">Scene #{activeScene.sceneNumber}: {activeScene.title || 'Scene Aktif'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onApplyToAllScenes(current);
              onShowToast('Pengaturan lokasi & pencahayaan berhasil diterapkan ke semua scene!');
            }}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-3.5 py-2 text-xs font-semibold text-emerald-300 transition-colors"
            title="Kunci lokasi ini di semua scene storyboard agar alur latar konsisten"
          >
            <Layers className="h-3.5 w-3.5 text-emerald-400" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {UNIVERSAL_ENVIRONMENTS.map((env) => {
            const isMatch = current.name === env.name;
            return (
              <button
                key={env.name}
                onClick={() => handleLoadTemplate(env)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isMatch
                    ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-sm'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="text-xs font-bold truncate text-zinc-100">{env.name}</div>
                <div className="text-[10px] text-emerald-400 mt-1 font-mono truncate">
                  {env.isIndoor ? 'Indoor' : 'Outdoor'} · {env.atmosphere}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono truncate">
                  {env.timeOfDay}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tipe Area & Latar Tempat */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="h-4 w-4 text-emerald-400" />
              Tipe Area & Latar Tempat
            </h3>

            {/* Indoor vs Outdoor Selector */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Kategori Wilayah <span className="text-emerald-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleChange('isIndoor', false)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                    !current.isIndoor
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <Trees className="h-4 w-4" />
                  <span>Luar Ruangan (Outdoor)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('isIndoor', true)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                    current.isIndoor
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Dalam Ruangan (Indoor / Studio)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Nama Lokasi (Opsional)
                </label>
                <input
                  type="text"
                  value={current.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Contoh: Kawasan Bisnis Kota, Jalur Lembah Hijau, Showroom Utama..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Deskripsi Latar Lingkungan <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  value={current.environmentType}
                  onChange={(e) => handleChange('environmentType', e.target.value)}
                  placeholder="Contoh: Jalan Boulevard Perkotaan Lebar, Garasi Arsitektural, Pegunungan..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Suasana / Atmosphere */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Suasana / Atmosfer Visual
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ATMOSPHERE_OPTIONS.map((atm) => (
                  <button
                    key={atm}
                    type="button"
                    onClick={() => handleChange('atmosphere', atm)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      current.atmosphere === atm
                        ? 'border-emerald-500/80 bg-emerald-500/10 text-emerald-300 font-semibold'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    {atm}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Waktu & Cuaca */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-400" />
              Waktu Pengambilan & Kondisi Cuaca
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Waktu Hari</label>
                <select
                  value={current.timeOfDay}
                  onChange={(e) => handleChange('timeOfDay', e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="Pagi Hari">Pagi Hari (Sunrise)</option>
                  <option value="Siang Hari">Siang Hari (Cahaya Terang)</option>
                  <option value="Sore Hari (Golden Hour)">Sore Hari (Golden Hour)</option>
                  <option value="Senja (Blue Hour)">Senja (Blue Hour)</option>
                  <option value="Malam Hari">Malam Hari</option>
                  <option value="Terkontrol Studio">Terkontrol Studio / Showroom</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Kondisi Cuaca</label>
                <select
                  value={current.weather}
                  onChange={(e) => handleChange('weather', e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="Cerah">Cerah Bersih</option>
                  <option value="Cerah Berawan">Cerah Berawan Lembut</option>
                  <option value="Mendung">Mendung Redup</option>
                  <option value="Hujan Gerimis">Hujan Gerimis</option>
                  <option value="Hujan Deras">Hujan Deras Basah</option>
                  <option value="Berkabut Alami">Berkabut Alami</option>
                  <option value="Dalam Ruangan (Indoor)">Dalam Ruangan (Indoor Bebas Cuaca)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Permukaan Jalan & Tata Cahaya */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-cyan-400" />
              Tata Cahaya & Permukaan Jalan / Lantai
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
              {hasLocation ? (
                <div className="space-y-1">
                  <p className="text-emerald-300 font-semibold">
                    {current.isIndoor ? '[Indoor]' : '[Outdoor]'} {current.environmentType || current.name || 'Latar Otomotif'}
                  </p>
                  {current.atmosphere && (
                    <p className="text-cyan-400 text-[11px]">
                      Suasana: {current.atmosphere}
                    </p>
                  )}
                  <p className="text-zinc-400 text-[11px]">
                    {current.timeOfDay} · {current.weather}
                  </p>
                  <p className="text-zinc-400 text-[11px]">
                    Pencahayaan: {current.lightingSources || 'Alami'}
                  </p>
                  <p className="text-zinc-400 text-[11px]">
                    Permukaan: {current.roadSurface || 'Aspal'}
                  </p>
                </div>
              ) : (
                'Belum ada latar lingkungan yang ditentukan.'
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
