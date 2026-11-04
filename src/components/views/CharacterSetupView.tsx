import { useState } from 'react';
import {
  UserCheck,
  Sparkles,
  Layers,
  Check,
  Shield,
  Eye,
  Shirt,
  Compass,
} from 'lucide-react';
import { CharacterConfig, StoryboardScene } from '../../types';

interface CharacterSetupViewProps {
  activeScene: StoryboardScene;
  onUpdateCharacter: (updated: CharacterConfig) => void;
  onApplyToAllScenes: (char: CharacterConfig) => void;
  onShowToast: (msg: string) => void;
}

const DRIVER_PRESETS: Array<{ name: string; config: Partial<CharacterConfig> }> = [
  {
    name: 'Rian Pratama (Pembalap Legendaris)',
    config: {
      name: 'Rian Pratama',
      role: 'Pembalap Legendaris',
      gender: 'Pria',
      attire: 'Jaket Kulit Hitam Bermotor',
      headwear: 'Tanpa Helm (Rambut Tertata Rapi)',
      pose: 'Satu tangan di setir, satu memindahkan tuas transmisi',
      expression: 'Mata fokus tajam mengunci titik apex tikungan',
    },
  },
  {
    name: 'Siti Rahma (Spesialis Pelarian)',
    config: {
      name: 'Siti Rahma',
      role: 'Spesialis Pelarian',
      gender: 'Wanita',
      attire: 'Wearpack Balap Modern',
      headwear: 'Helm Balap Karbon Kaca Gelap',
      pose: 'Kedua tangan mencengkeram setir alcantara',
      expression: 'Ekspresi tegang penuh adrenalin',
    },
  },
  {
    name: 'Pengemudi Bayangan (Cyber Ghost)',
    config: {
      name: 'Pengemudi Bayangan',
      role: 'Pengemudi Sindikat Misterius',
      gender: 'Anonim / Bermasker',
      attire: 'Pakaian Streetwear Techwear',
      headwear: 'Balaclava Techwear',
      pose: 'Melirik tajam ke kaca spion samping',
      expression: 'Tatapan dingin penuh perhitungan',
    },
  },
  {
    name: 'Bima W. (Pembalap Utama)',
    config: {
      name: 'Bima W.',
      role: 'Pengemudi Utama',
      gender: 'Pria',
      attire: 'Mantel Stealth Formal',
      headwear: 'Kacamata Hitam Aviator',
      pose: 'Condong ke samping menahan gaya G-Force tikungan',
      expression: 'Senyum tenang dan terkendali',
    },
  },
];

export function CharacterSetupView({
  activeScene,
  onUpdateCharacter,
  onApplyToAllScenes,
  onShowToast,
}: CharacterSetupViewProps) {
  const current = activeScene.character;

  const handleChange = <K extends keyof CharacterConfig>(field: K, value: CharacterConfig[K]) => {
    onUpdateCharacter({
      ...current,
      [field]: value,
    });
  };

  const handleLoadPreset = (presetConfig: Partial<CharacterConfig>) => {
    onUpdateCharacter({
      ...current,
      ...presetConfig,
    });
    onShowToast(`Berhasil memuat profil pengemudi: ${presetConfig.name}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title & Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <UserCheck className="h-4 w-4" />
            <span>MODUL 03 // PROFIL PENGEMUDI & KARAKTER</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            Persona Pengemudi & Sikap Kokpit
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Profil pengemudi untuk <strong className="text-zinc-200">Scene #{activeScene.sceneNumber}: {activeScene.title}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onApplyToAllScenes(current);
              onShowToast('Profil pengemudi ini berhasil diterapkan ke semua scene storyboard!');
            }}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-200 transition-colors"
          >
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>Terapkan ke Semua Scene</span>
          </button>
        </div>
      </div>

      {/* Preset Driver Archetypes */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
          Preset Karakter Pengemudi
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DRIVER_PRESETS.map((preset) => {
            const isMatch = current.name === preset.config.name;
            return (
              <button
                key={preset.name}
                onClick={() => handleLoadPreset(preset.config)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isMatch
                    ? 'border-cyan-500 bg-cyan-500/10 text-white'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="text-xs font-bold truncate text-zinc-100">{preset.name}</div>
                <div className="text-[11px] text-zinc-400 mt-1 font-mono">
                  {preset.config.role} · {preset.config.attire}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Identity & Role */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              Identitas Pengemudi & Peran Naratif
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Nama Pengemudi / Kode</label>
                <input
                  type="text"
                  value={current.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
                  placeholder="misal: Rian Pratama, Siti Rahma"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Representasi Gender</label>
                <div className="flex gap-2">
                  {(['Pria', 'Wanita', 'Anonim / Bermasker'] as const).map((gender) => (
                    <button
                      key={gender}
                      onClick={() => handleChange('gender', gender)}
                      className={`flex-1 py-2 px-2 text-xs font-medium rounded-lg transition-all ${
                        current.gender === gender
                          ? 'bg-cyan-500 text-zinc-950 font-bold'
                          : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Peran dalam Cerita</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(
                  [
                    'Pengemudi Utama',
                    'Pengemudi Sindikat Misterius',
                    'Spesialis Pelarian',
                    'Pembalap Legendaris',
                    'Pengemudi Anonim / Masked',
                  ] as const
                ).map((role) => (
                  <button
                    key={role}
                    onClick={() => handleChange('role', role)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      current.role === role
                        ? 'border-emerald-500/80 bg-emerald-500/10 text-emerald-300 font-semibold'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Attire & Headwear */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Shirt className="h-4 w-4 text-cyan-400" />
              Pakaian, Helm & Perlengkapan Balap
            </h3>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Pakaian / Kostum</label>
              <select
                value={current.attire}
                onChange={(e) => handleChange('attire', e.target.value as any)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value="Wearpack Balap Modern">Wearpack Balap Modern (Nomex Antiapik)</option>
                <option value="Pakaian Streetwear Techwear">Pakaian Streetwear Techwear (Tudung Hitam & Tali)</option>
                <option value="Jaket Kulit Hitam Bermotor">Jaket Kulit Hitam Bermotor (Gaya Pembalap Jalanan)</option>
                <option value="Mantel Stealth Formal">Mantel Stealth Formal (Gaya Rahasia)</option>
                <option value="Wearpack Retro Klasik">Wearpack Retro Klasik (Pembalap Era 1970-an)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Penutup Kepala / Kacamata</label>
              <select
                value={current.headwear}
                onChange={(e) => handleChange('headwear', e.target.value as any)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value="Helm Balap Karbon Kaca Gelap">Helm Balap Karbon Kaca Gelap (Arai / Bell)</option>
                <option value="Tanpa Helm (Rambut Tertata Rapi)">Tanpa Helm (Rambut Tertata Rapi, Wajah Terlihat)</option>
                <option value="Balaclava Techwear">Balaclava Techwear (Penutup Wajah Minimalis)</option>
                <option value="Kacamata Hitam Aviator">Kacamata Hitam Aviator (Bingkai Metalik)</option>
                <option value="Visor HUD Minimalis">Visor HUD Minimalis (Aksen Cahaya Masa Depan)</option>
              </select>
            </div>
          </div>

          {/* Posture & Steering Wheel Interaction */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Compass className="h-4 w-4 text-emerald-400" />
              Posisi Mengemudi & Pegangan Setir
            </h3>

            <div className="space-y-2">
              {(
                [
                  'Kedua tangan mencengkeram setir alcantara',
                  'Satu tangan di setir, satu memindahkan tuas transmisi',
                  'Melirik tajam ke kaca spion samping',
                  'Condong ke samping menahan gaya G-Force tikungan',
                  'Melangkah keluar mobil di bawah hujan',
                ] as const
              ).map((pose) => (
                <button
                  key={pose}
                  onClick={() => handleChange('pose', pose)}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    current.pose === pose
                      ? 'border-emerald-500 bg-emerald-500/10 text-white font-medium'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <span>{pose}</span>
                  {current.pose === pose && <Check className="h-4 w-4 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Expression & Gaze */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Eye className="h-4 w-4 text-cyan-400" />
              Tatapan Mata & Intensitas Emosi
            </h3>
            <p className="text-xs text-zinc-400">
              Mengarahkan pencahayaan wajah di kokpit dan pantulan visor helm dalam model video AI.
            </p>

            <div className="space-y-2">
              {(
                [
                  'Mata fokus tajam mengunci titik apex tikungan',
                  'Senyum tenang dan terkendali',
                  'Ekspresi tegang penuh adrenalin',
                  'Tatapan dingin penuh perhitungan',
                ] as const
              ).map((expr) => (
                <button
                  key={expr}
                  onClick={() => handleChange('expression', expr)}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    current.expression === expr
                      ? 'border-cyan-500 bg-cyan-500/10 text-white font-medium'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <span>{expr}</span>
                  {current.expression === expr && <Check className="h-4 w-4 text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Token Preview */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                Token Karakter Tersintesis
              </span>
              <span className="text-[10px] font-mono text-cyan-400">Live</span>
            </div>
            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/80 font-mono text-xs text-zinc-300 leading-relaxed">
              "{current.name} ({current.role}), mengenakan {current.attire} dengan {current.headwear}, {current.pose}, menampilkan {current.expression}."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
