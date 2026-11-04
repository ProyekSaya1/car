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
  UserX,
  UserPlus,
} from 'lucide-react';
import { CharacterConfig, StoryboardScene } from '../../types';

interface CharacterSetupViewProps {
  activeScene: StoryboardScene;
  onUpdateCharacter: (updated: CharacterConfig) => void;
  onApplyToAllScenes: (char: CharacterConfig) => void;
  onShowToast: (msg: string) => void;
}

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

  const handleClearCharacter = () => {
    onUpdateCharacter({
      id: current.id,
      name: '',
      role: '',
      gender: 'Tidak Disebutkan',
      attire: '',
      headwear: '',
      pose: '',
      expression: '',
    });
    onShowToast('Karakter dikosongkan. Adegan berfokus murni pada kendaraan.');
  };

  const hasCharacter = Boolean(current.name || current.role || current.attire);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <UserCheck className="h-4 w-4" />
            <span>MODUL 03 // PENGEMUDI & KARAKTER KABIN (OPSIONAL)</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            Pengemudi & Karakter (Universal)
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Tentukan profil pengemudi untuk <strong className="text-zinc-200">Scene #{activeScene.sceneNumber}: {activeScene.title || 'Scene Aktif'}</strong> (Boleh dikosongkan jika adegan hanya fokus pada kendaraan).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasCharacter && (
            <button
              onClick={handleClearCharacter}
              className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-3.5 py-2 text-xs font-medium text-red-400 transition-colors"
            >
              <UserX className="h-3.5 w-3.5" />
              <span>Kosongkan Karakter</span>
            </button>
          )}

          <button
            onClick={() => {
              onApplyToAllScenes(current);
              onShowToast('Profil karakter ini berhasil diterapkan ke semua scene!');
            }}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-200 transition-colors"
          >
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>Terapkan ke Semua Scene</span>
          </button>
        </div>
      </div>

      {/* Empty State Banner if no character is configured */}
      {!hasCharacter && (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 p-6 text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-zinc-900 text-zinc-400">
            <UserPlus className="h-6 w-6 text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold text-zinc-200">
            Belum Ada Karakter / Pengemudi Ditentukan (Opsional)
          </h3>
          <p className="text-xs text-zinc-400 max-w-lg mx-auto">
            Scene otomotif dapat berfokus murni pada bodi luar dan pergerakan mobil. Jika konsep Anda membutuhkan pengemudi atau penumpang, isi formulir di bawah ini.
          </p>
        </div>
      )}

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Identitas & Peran */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              Identitas Pengemudi / Penumpang
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Nama Karakter / Pengemudi (Opsional)
                </label>
                <input
                  type="text"
                  value={current.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
                  placeholder="Contoh: Pengemudi, Alex, Sarah, atau nama kustom..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Gender</label>
                <div className="flex gap-2">
                  {(['Pria', 'Wanita', 'Tidak Disebutkan'] as const).map((gender) => (
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
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Peran dalam Adegan</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'Pengemudi Utama',
                  'Pengemudi Harian',
                  'Penumpang Depan',
                  'Penumpang Eksekutif',
                  'Keluarga',
                  'Kustom Pengguna',
                ].map((role) => (
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

          {/* Pakaian & Gaya */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Shirt className="h-4 w-4 text-cyan-400" />
              Pakaian & Penampilan
            </h3>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Gaya Busana</label>
              <input
                type="text"
                value={current.attire}
                onChange={(e) => handleChange('attire', e.target.value)}
                placeholder="Contoh: Pakaian santai rapi, Kemeja formal, Jaket outdoor..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Aksesoris / Penutup Kepala (Opsional)</label>
              <input
                type="text"
                value={current.headwear}
                onChange={(e) => handleChange('headwear', e.target.value)}
                placeholder="Contoh: Tanpa penutup kepala, Kacamata hitam, Topi kasual..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Posisi & Interaksi Kabin */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Compass className="h-4 w-4 text-emerald-400" />
              Posisi & Aktivitas di Kabin
            </h3>

            <div className="space-y-2">
              {[
                'Duduk tegak mengemudi santai dengan kedua tangan di setir',
                'Satu tangan di setir, satu tangan di konsol tengah',
                'Duduk rileks memperhatikan pemandangan jalan',
                'Melirik ke arah layar navigasi / spion',
                'Melangkah masuk atau keluar kendaraan',
              ].map((pose) => (
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

        {/* Right Col: Ekspresi & Token */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Eye className="h-4 w-4 text-cyan-400" />
              Ekspresi Wajah & Suasana
            </h3>
            <p className="text-xs text-zinc-400">
              Menentukan ekspresi wajah pengemudi di kokpit saat terekam kamera.
            </p>

            <div className="space-y-2">
              {[
                'Tenang dan fokus mengemudi',
                'Senyum ramah menikmati perjalanan',
                'Konsentrasi penuh melihat ke depan',
                'Santai tanpa ketegangan',
              ].map((expr) => (
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
                Deskripsi Karakter Prompt
              </span>
            </div>
            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/80 font-mono text-xs text-zinc-300 leading-relaxed">
              {hasCharacter
                ? `"${current.name || 'Pengemudi'} (${current.role || 'pengemudi'}), berbusana ${current.attire || 'rapi'}, ${current.pose || 'duduk mengemudi'}, ekspresi ${current.expression || 'tenang'}."`
                : 'Fokus adegan murni pada kendaraan (tanpa karakter khusus).'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
