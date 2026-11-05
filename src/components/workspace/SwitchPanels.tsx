import { useState } from 'react';
import {
  StoryboardScene,
  VehicleConfig,
  CharacterConfig,
  VehicleCategory,
  SteeringPosition,
  IgnitionSystem,
  TransmissionType,
  ParkingBrakeType,
  ActivePanelsState,
} from '../../types';
import {
  Car,
  Users,
  Camera,
  MapPin,
  Gauge,
  Sliders,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Copy,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';
import { AsyncImage } from '../ui/AsyncImage';

interface SwitchPanelsProps {
  activeScene: StoryboardScene;
  onUpdateScene: (updated: StoryboardScene) => void;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
  targetDurationSeconds?: number;
}

const CATEGORY_OPTIONS: VehicleCategory[] = [
  'Mobil',
  'Sepeda Motor',
  'Truk',
  'Bus',
  'Kendaraan Klasik',
  'Kendaraan Sport',
  'Mobil Listrik (EV)',
  'SUV',
  'Sedan',
  'MPV',
  'Pickup & Van',
  'Mobil Modern',
  'Mobil Jadul',
  'Kendaraan Lainnya',
];

const SEATING_OPTIONS = [
  'Pengemudi',
  'Penumpang Depan',
  'Belakang Kiri',
  'Belakang Kanan',
  'Belakang Tengah',
  'Di Luar Mobil',
];

export function SwitchPanels({
  activeScene,
  onUpdateScene,
  onShowToast,
  targetDurationSeconds = 4,
}: SwitchPanelsProps) {
  // Toggle states for the 6 panels
  const activePanels: ActivePanelsState = activeScene.activePanels || {};

  const togglePanel = (key: keyof ActivePanelsState) => {
    onUpdateScene({
      ...activeScene,
      activePanels: {
        ...activePanels,
        [key]: !activePanels[key],
      },
    });
  };

  const vehicle = activeScene.vehicle;
  const characters: CharacterConfig[] = (
    Array.isArray(activeScene.characters) && activeScene.characters.length > 0
      ? activeScene.characters
      : activeScene.character
      ? [activeScene.character]
      : []
  ).slice(0, 3);

  // Update vehicle
  const handleUpdateVehicle = (patch: Partial<VehicleConfig>) => {
    onUpdateScene({
      ...activeScene,
      vehicle: {
        ...vehicle,
        ...patch,
      },
      promptNeedsReview: Boolean(activeScene.isPromptManuallyEdited),
    });
  };

  // Update character
  const handleUpdateCharacter = (index: number, patch: Partial<CharacterConfig>) => {
    const updated = [...characters];
    if (updated[index]) {
      updated[index] = { ...updated[index], ...patch };
      onUpdateScene({
        ...activeScene,
        characters: updated,
        promptNeedsReview: Boolean(activeScene.isPromptManuallyEdited),
      });
    }
  };

  // Check seating duplicates
  const seatingCounts: Record<string, number> = {};
  characters.forEach((c) => {
    if (c.seatingPosition && c.seatingPosition !== 'Di Luar Mobil') {
      seatingCounts[c.seatingPosition] = (seatingCounts[c.seatingPosition] || 0) + 1;
    }
  });
  const duplicateSeats = Object.keys(seatingCounts).filter((seat) => seatingCounts[seat] > 1);

  // Copy AI Prompt for car slot reference
  const handleCopyAiSlotPrompt = (slotName: string) => {
    const carName = vehicle.name || 'Automotive car';
    const color = vehicle.paintColor ? `${vehicle.paintColor} ` : '';
    const prompt = `Studio photograph of ${color}${carName}, ${slotName} view, ultra clean lighting, sharp automotive reflections, photorealistic neutral background, 8k resolution`;
    navigator.clipboard.writeText(prompt);
    onShowToast(`Prompt AI untuk ${slotName} disalin ke papan klip!`);
  };

  return (
    <div className="space-y-4 mb-6">
      {/* 6 SWITCH BUTTONS BAR */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => togglePanel('vehicleDetail')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
            activePanels.vehicleDetail
              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm'
              : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
          }`}
        >
          <Car className="h-3.5 w-3.5" />
          <span>Detail Mobil</span>
          {activePanels.vehicleDetail ? (
            <ChevronUp className="h-3 w-3 ml-0.5" />
          ) : (
            <ChevronDown className="h-3 w-3 ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => togglePanel('character')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
            activePanels.character
              ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 shadow-sm'
              : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Karakter</span>
          {duplicateSeats.length > 0 && (
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          )}
          {activePanels.character ? (
            <ChevronUp className="h-3 w-3 ml-0.5" />
          ) : (
            <ChevronDown className="h-3 w-3 ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => togglePanel('cameraPro')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
            activePanels.cameraPro
              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm'
              : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
          }`}
        >
          <Camera className="h-3.5 w-3.5" />
          <span>Kamera Pro</span>
          {activePanels.cameraPro ? (
            <ChevronUp className="h-3 w-3 ml-0.5" />
          ) : (
            <ChevronDown className="h-3 w-3 ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => togglePanel('locationDetail')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
            activePanels.locationDetail
              ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 shadow-sm'
              : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
          }`}
        >
          <MapPin className="h-3.5 w-3.5" />
          <span>Detail Lokasi</span>
          {activePanels.locationDetail ? (
            <ChevronUp className="h-3 w-3 ml-0.5" />
          ) : (
            <ChevronDown className="h-3 w-3 ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => togglePanel('vehicleAction')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
            activePanels.vehicleAction
              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm'
              : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
          }`}
        >
          <Gauge className="h-3.5 w-3.5" />
          <span>Aksi Kendaraan</span>
          {activePanels.vehicleAction ? (
            <ChevronUp className="h-3 w-3 ml-0.5" />
          ) : (
            <ChevronDown className="h-3 w-3 ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => togglePanel('custom')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
            activePanels.custom
              ? 'border-amber-500 bg-amber-500/20 text-amber-300 shadow-sm'
              : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Custom</span>
          {activePanels.custom ? (
            <ChevronUp className="h-3 w-3 ml-0.5" />
          ) : (
            <ChevronDown className="h-3 w-3 ml-0.5" />
          )}
        </button>
      </div>

      {/* PANEL 1: DETAIL MOBIL */}
      {activePanels.vehicleDetail && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Car className="h-4 w-4" />
              <span>Pengaturan Detail Mobil</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* Nama / Model Mobil */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Nama / Model Mobil
              </label>
              <input
                type="text"
                value={vehicle.name || ''}
                onChange={(e) => handleUpdateVehicle({ name: e.target.value })}
                placeholder="Contoh: Toyota Land Cruiser 300"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Kategori Kendaraan */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Kategori Kendaraan
              </label>
              <select
                value={vehicle.category || 'Mobil'}
                onChange={(e) => handleUpdateVehicle({ category: e.target.value as VehicleCategory })}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Warna Cat */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Warna Kendaraan
              </label>
              <input
                type="text"
                value={vehicle.paintColor || ''}
                onChange={(e) => handleUpdateVehicle({ paintColor: e.target.value })}
                placeholder="Contoh: Hitam Metalik Gloss"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Posisi Setir */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Posisi Setir (Default Indonesia)
              </label>
              <select
                value={vehicle.steeringPosition || 'Kanan (RHD - Indonesia)'}
                onChange={(e) =>
                  handleUpdateVehicle({ steeringPosition: e.target.value as SteeringPosition })
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Kanan (RHD - Indonesia)">Kanan (RHD - Indonesia)</option>
                <option value="Kiri (LHD)">Kiri (LHD)</option>
              </select>
            </div>

            {/* Transmisi */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Transmisi
              </label>
              <select
                value={vehicle.transmission || 'Belum Ditentukan'}
                onChange={(e) =>
                  handleUpdateVehicle({ transmission: e.target.value as TransmissionType })
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Belum Ditentukan">Belum Ditentukan</option>
                <option value="Otomatis (AT)">Otomatis (AT)</option>
                <option value="Manual (MT)">Manual (MT)</option>
                <option value="CVT">CVT</option>
                <option value="DCT (Dual Clutch)">DCT (Dual Clutch)</option>
                <option value="Direct Drive EV">Direct Drive EV</option>
              </select>
            </div>

            {/* Sistem Starter */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Sistem Menyalakan Mesin
              </label>
              <select
                value={vehicle.ignitionSystem || 'Belum Ditentukan'}
                onChange={(e) =>
                  handleUpdateVehicle({ ignitionSystem: e.target.value as IgnitionSystem })
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Belum Ditentukan">Belum Ditentukan</option>
                <option value="Tombol Start/Stop">Tombol Start/Stop</option>
                <option value="Smart Key">Smart Key</option>
                <option value="Kunci Kontak Manual">Kunci Kontak Manual</option>
                <option value="Sistem Kendaraan Listrik">Sistem Kendaraan Listrik</option>
              </select>
            </div>
          </div>

          {/* Quick AI Reference Generator Prompts Helper */}
          <div className="pt-2 border-t border-zinc-800/80">
            <span className="block text-[11px] font-medium text-zinc-400 mb-1.5">
              Salin Prompt AI untuk Membuat Foto Referensi Mobil:
            </span>
            <div className="flex flex-wrap gap-2">
              {['Tampak Depan', 'Tampak Samping', 'Tampak Belakang', 'Kokpit Interior'].map(
                (slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => handleCopyAiSlotPrompt(slot)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900 text-[11px] text-zinc-300 hover:text-white hover:border-emerald-500 transition-colors"
                  >
                    <Copy className="h-3 w-3 text-emerald-400" />
                    <span>Salin Prompt {slot}</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* PANEL 2: KARAKTER */}
      {activePanels.character && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Detail Karakter & Kabin (Maks. 3 Orang)</span>
            </h4>
            <span className="text-[11px] font-mono text-zinc-400">
              {characters.length}/3 Karakter
            </span>
          </div>

          {/* Duplicate seating warning */}
          {duplicateSeats.length > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                Peringatan: Posisi duduk <u>{duplicateSeats.join(', ')}</u> dipilih oleh lebih dari satu karakter!
              </span>
            </div>
          )}

          {characters.length === 0 ? (
            <div className="text-center py-6 text-xs text-zinc-500">
              Belum ada karakter di adegan ini. Unggah foto karakter pada kotak di atas atau tambahkan karakter baru.
            </div>
          ) : (
            <div className="space-y-4">
              {characters.map((char, idx) => (
                <div
                  key={char.id || idx}
                  className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200">
                      Karakter #{idx + 1} {char.name ? `(${char.name})` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const filtered = characters.filter((_, cI) => cI !== idx);
                        onUpdateScene({ ...activeScene, characters: filtered });
                        onShowToast(`Karakter #${idx + 1} dihapus`);
                      }}
                      className="text-[11px] text-zinc-500 hover:text-rose-400 flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> Hapus
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">
                        Nama Karakter (Opsional)
                      </label>
                      <input
                        type="text"
                        value={char.name || ''}
                        onChange={(e) => handleUpdateCharacter(idx, { name: e.target.value })}
                        placeholder="Contoh: Rian"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">
                        Posisi Duduk
                      </label>
                      <select
                        value={char.seatingPosition || 'Pengemudi'}
                        onChange={(e) =>
                          handleUpdateCharacter(idx, { seatingPosition: e.target.value })
                        }
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
                      >
                        {SEATING_OPTIONS.map((pos) => (
                          <option key={pos} value={pos}>
                            {pos}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">
                        Pakaian / Busana
                      </label>
                      <input
                        type="text"
                        value={char.attire || ''}
                        onChange={(e) => handleUpdateCharacter(idx, { attire: e.target.value })}
                        placeholder="Contoh: Jaket kulit cokelat"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Pose, Ekspresi & Dialog Switches */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                    {/* Pose switch */}
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-300">
                        <input
                          type="checkbox"
                          checked={Boolean(char.poseEnabled)}
                          onChange={(e) =>
                            handleUpdateCharacter(idx, { poseEnabled: e.target.checked })
                          }
                          className="rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-0"
                        />
                        <span>Pose:</span>
                      </label>
                      {char.poseEnabled && (
                        <input
                          type="text"
                          value={char.pose || ''}
                          onChange={(e) => handleUpdateCharacter(idx, { pose : e.target.value })}
                          placeholder="Contoh: Kedua tangan menggenggam setir stabil"
                          className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
                        />
                      )}
                    </div>

                    {/* Ekspresi switch */}
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-300">
                        <input
                          type="checkbox"
                          checked={Boolean(char.expressionEnabled)}
                          onChange={(e) =>
                            handleUpdateCharacter(idx, { expressionEnabled: e.target.checked })
                          }
                          className="rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-0"
                        />
                        <span>Ekspresi:</span>
                      </label>
                      {char.expressionEnabled && (
                        <input
                          type="text"
                          value={char.expression || ''}
                          onChange={(e) =>
                            handleUpdateCharacter(idx, { expression: e.target.value })
                          }
                          placeholder="Contoh: Fokus tenang, tatapan tajam ke depan"
                          className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
                        />
                      )}
                    </div>

                    {/* Dialog switch */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-300">
                          <input
                            type="checkbox"
                            checked={Boolean(char.dialogEnabled)}
                            onChange={(e) =>
                              handleUpdateCharacter(idx, { dialogEnabled: e.target.checked })
                            }
                            className="rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-0"
                          />
                          <span>Ucapan Dialog:</span>
                        </label>
                        {char.dialogEnabled && (
                          <input
                            type="text"
                            value={char.dialog || ''}
                            onChange={(e) =>
                              handleUpdateCharacter(idx, { dialog: e.target.value })
                            }
                            placeholder="Contoh: Kita akan sampai sebelum malam tiba."
                            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
                          />
                        )}
                      </div>

                      {/* Speaking duration indicator */}
                      {char.dialogEnabled && char.dialog && (
                        <div className="text-[10px] font-mono text-zinc-400 pl-6">
                          {(() => {
                            const wordCount = char.dialog.trim().split(/\s+/).filter(Boolean).length;
                            const estSeconds = Math.max(1, Math.round(wordCount / 2.5));
                            const isTooLong = estSeconds > targetDurationSeconds;
                            return (
                              <span className={isTooLong ? 'text-amber-400 font-bold' : ''}>
                                {wordCount} kata (~{estSeconds} detik bicara).
                                {isTooLong && ` Peringatan: melebihi durasi scene (${targetDurationSeconds}s)!`}
                              </span>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PANEL 3: KAMERA PRO */}
      {activePanels.cameraPro && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Camera className="h-4 w-4" />
              <span>Pengaturan Kamera Pro & Lensa</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tipe Lensa */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                Tipe Lensa Sinematik
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Lebar', label: 'Lebar (Wide 24mm)' },
                  { id: 'Standar', label: 'Standar (35-50mm)' },
                  { id: 'Tele', label: 'Tele (85mm Bokeh)' },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() =>
                      onUpdateScene({
                        ...activeScene,
                        camera: {
                          ...activeScene.camera,
                          lensType: l.id as any,
                        },
                      })
                    }
                    className={`p-2 rounded-xl border text-center text-xs font-semibold transition-all ${
                      activeScene.camera?.lensType === l.id
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Tone / Gradasi */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                Tone Warna Sinematik
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'Natural', label: 'Natural Alami' },
                  { id: 'Sinematik', label: 'Sinematik Film' },
                  { id: 'Hangat', label: 'Hangat (Warm)' },
                  { id: 'Dingin', label: 'Dingin (Cool)' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() =>
                      onUpdateScene({
                        ...activeScene,
                        camera: {
                          ...activeScene.camera,
                          colorTone: c.id as any,
                        },
                      })
                    }
                    className={`p-2 rounded-xl border text-center text-xs font-semibold transition-all ${
                      activeScene.camera?.colorTone === c.id
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PANEL 4: DETAIL LOKASI */}
      {activePanels.locationDetail && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Detail Lingkungan & Permukaan Jalan</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Kondisi Permukaan Jalan
              </label>
              <input
                type="text"
                value={activeScene.location?.roadSurface || ''}
                onChange={(e) =>
                  onUpdateScene({
                    ...activeScene,
                    location: {
                      ...activeScene.location,
                      roadSurface: e.target.value,
                    },
                  })
                }
                placeholder="Contoh: Aspal basah dengan pantulan lampu"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Pencahayaan Utama
              </label>
              <input
                type="text"
                value={activeScene.location?.lightingSources || ''}
                onChange={(e) =>
                  onUpdateScene({
                    ...activeScene,
                    location: {
                      ...activeScene.location,
                      lightingSources: e.target.value,
                    },
                  })
                }
                placeholder="Contoh: Lampu jalan sodium & pantulan neon"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Suasana / Atmosfer
              </label>
              <input
                type="text"
                value={activeScene.location?.atmosphere || ''}
                onChange={(e) =>
                  onUpdateScene({
                    ...activeScene,
                    location: {
                      ...activeScene.location,
                      atmosphere: e.target.value,
                    },
                  })
                }
                placeholder="Contoh: Sinematik tenang, misterius"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* PANEL 5: AKSI KENDARAAN */}
      {activePanels.vehicleAction && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              <span>Aksi Dinamis & Kontrol Kendaraan</span>
            </h4>
            <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(activeScene.drivingAction?.enabled)}
                onChange={(e) =>
                  onUpdateScene({
                    ...activeScene,
                    drivingAction: {
                      ...activeScene.drivingAction,
                      enabled: e.target.checked,
                    },
                  })
                }
                className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-0"
              />
              <span>Aktifkan di Prompt</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Status Mesin
              </label>
              <select
                value={activeScene.drivingAction?.engineStatus || ''}
                onChange={(e) =>
                  onUpdateScene({
                    ...activeScene,
                    drivingAction: {
                      ...activeScene.drivingAction,
                      engineStatus: e.target.value,
                    },
                  })
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Pilih status...</option>
                <option value="Mesin Menyala Idle">Mesin Menyala (Idle)</option>
                <option value="Melaju Stabil">Melaju Stabil</option>
                <option value="Akselerasi Cepat">Akselerasi Cepat</option>
                <option value="Pengereman Halus">Pengereman Halus</option>
                <option value="Pengereman Keras">Pengereman Keras</option>
                <option value="Mesin Mati Parkir">Mesin Mati / Parkir</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Manuver Kendaraan
              </label>
              <input
                type="text"
                value={activeScene.drivingAction?.maneuver || ''}
                onChange={(e) =>
                  onUpdateScene({
                    ...activeScene,
                    drivingAction: {
                      ...activeScene.drivingAction,
                      maneuver: e.target.value,
                    },
                  })
                }
                placeholder="Contoh: Menyalip perlahan ke lajur kanan"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Perkiraan Kecepatan
              </label>
              <input
                type="text"
                value={activeScene.drivingAction?.estimatedSpeed || ''}
                onChange={(e) =>
                  onUpdateScene({
                    ...activeScene,
                    drivingAction: {
                      ...activeScene.drivingAction,
                      estimatedSpeed: e.target.value,
                    },
                  })
                }
                placeholder="Contoh: 40 km/jam"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* PANEL 6: CUSTOM */}
      {activePanels.custom && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              <span>Instruksi Tambahan (Custom)</span>
            </h4>
            <span className="text-[10px] text-zinc-500">
              Akan ditambahkan di akhir prompt tanpa tanda kurung []
            </span>
          </div>

          <textarea
            rows={3}
            value={activeScene.customInstruction || ''}
            onChange={(e) =>
              onUpdateScene({
                ...activeScene,
                customInstruction: e.target.value,
              })
            }
            placeholder="Tuliskan arahan tambahan khusus untuk generator AI Anda... (Contoh: Grain analog halus 35mm, detail pantulan cat mobil tajam, tanpa flare berlebihan)"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none leading-relaxed"
          />
        </div>
      )}
    </div>
  );
}
