import { useState, useRef, useEffect } from 'react';
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
  Upload,
  Image as ImageIcon,
  X,
  Lock,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { CharacterConfig, StoryboardScene, ViewMode, SeatingPosition } from '../../types';
import { ModuleHeader } from '../layout/ModuleHeader';
import { saveImage, getImage } from '../../utils/imageStore';
import { createBlankCharacter } from '../../data/initialData';

interface CharacterSetupViewProps {
  activeScene: StoryboardScene;
  onUpdateCharacter?: (updated: CharacterConfig) => void;
  onUpdateCharacters?: (characters: CharacterConfig[]) => void;
  onApplyToAllScenes: (chars: CharacterConfig[] | CharacterConfig) => void;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
  onNavigate?: (view: ViewMode) => void;
}

export function CharacterSetupView({
  activeScene,
  onUpdateCharacter,
  onUpdateCharacters,
  onApplyToAllScenes,
  onShowToast,
  onNavigate,
}: CharacterSetupViewProps) {
  // Normalize characters array (support legacy scene.character)
  const charactersList: CharacterConfig[] =
    Array.isArray(activeScene.characters) && activeScene.characters.length > 0
      ? activeScene.characters
      : activeScene.character
      ? [activeScene.character]
      : [createBlankCharacter(activeScene.sceneNumber, 1)];

  const [activeTab, setActiveTab] = useState(0);
  const [resolvedPhotoUrls, setResolvedPhotoUrls] = useState<Record<number, string>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active character
  const safeActiveTab = Math.min(activeTab, charactersList.length - 1);
  const current = charactersList[safeActiveTab] || charactersList[0];

  // Resolve photo URL from IDB
  useEffect(() => {
    let isMounted = true;
    const fetchPhotos = async () => {
      const urls: Record<number, string> = {};
      for (let i = 0; i < charactersList.length; i++) {
        const img = charactersList[i]?.imageUrl;
        if (img) {
          urls[i] = await getImage(img);
        }
      }
      if (isMounted) setResolvedPhotoUrls(urls);
    };
    fetchPhotos();
    return () => {
      isMounted = false;
    };
  }, [charactersList]);

  // Helper to sync update up
  const syncCharacters = (newList: CharacterConfig[]) => {
    if (onUpdateCharacters) {
      onUpdateCharacters(newList);
    } else if (onUpdateCharacter && newList[0]) {
      onUpdateCharacter(newList[0]);
    }
  };

  const handleUpdateCurrent = <K extends keyof CharacterConfig>(field: K, value: CharacterConfig[K]) => {
    const updated = charactersList.map((char, idx) => {
      if (idx === safeActiveTab) {
        return { ...char, [field]: value };
      }
      return char;
    });
    syncCharacters(updated);
  };

  const handleAddCharacter = () => {
    if (charactersList.length >= 3) {
      onShowToast('Maksimal 3 karakter per scene untuk menjaga konsistensi visual', 'info');
      return;
    }
    const nextIdx = charactersList.length + 1;
    const newChar = createBlankCharacter(activeScene.sceneNumber, nextIdx);

    // Pick an available seat
    const takenSeats = charactersList.map((c) => c.seatingPosition);
    if (!takenSeats.includes('Penumpang Depan')) {
      newChar.seatingPosition = 'Penumpang Depan';
      newChar.role = 'Penumpang Depan';
    } else if (!takenSeats.includes('Penumpang Belakang Kiri')) {
      newChar.seatingPosition = 'Penumpang Belakang Kiri';
      newChar.role = 'Penumpang Belakang';
    } else {
      newChar.seatingPosition = 'Di Luar Kendaraan';
      newChar.role = 'Figuran / Pejalan Kaki';
    }

    const updated = [...charactersList, newChar];
    syncCharacters(updated);
    setActiveTab(updated.length - 1);
    onShowToast(`Karakter #${nextIdx} berhasil ditambahkan ke Scene #${activeScene.sceneNumber}!`);
  };

  const handleRemoveCharacter = (idxToRemove: number) => {
    if (charactersList.length <= 1) {
      // Clear first character instead of removing
      const cleared = createBlankCharacter(activeScene.sceneNumber, 1);
      syncCharacters([cleared]);
      onShowToast('Profil Karakter 1 dikosongkan.');
      return;
    }
    const filtered = charactersList.filter((_, idx) => idx !== idxToRemove);
    syncCharacters(filtered);
    setActiveTab(Math.max(0, idxToRemove - 1));
    onShowToast(`Karakter #${idxToRemove + 1} berhasil dihapus dari scene.`);
  };

  const handleUploadPhoto = async (file: File | null) => {
    if (!file) return;
    try {
      const idbKey = await saveImage(file);
      handleUpdateCurrent('imageUrl', idbKey);
      onShowToast(`Foto referensi Karakter #${safeActiveTab + 1} berhasil disimpan ke IndexedDB!`);
    } catch (e) {
      onShowToast('Gagal memproses gambar karakter.', 'info');
    }
  };

  // Seating options & validation
  const seatingOptions: SeatingPosition[] = [
    'Pengemudi',
    'Penumpang Depan',
    'Penumpang Belakang Kiri',
    'Penumpang Belakang Tengah',
    'Penumpang Belakang Kanan',
    'Di Luar Kendaraan',
  ];

  // Check seat conflict for current character
  const seatConflict = charactersList.some(
    (c, idx) =>
      idx !== safeActiveTab &&
      c.seatingPosition &&
      c.seatingPosition !== 'Di Luar Kendaraan' &&
      c.seatingPosition === current.seatingPosition
  );

  const hasCharacter = Boolean(
    current.name ||
    current.role ||
    current.attire ||
    current.physicalDescription ||
    current.facialFeatures ||
    current.imageUrl
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Module Navigation Bar */}
      <ModuleHeader
        moduleNumber="MODUL 03"
        moduleTitle="Character Setup (Maksimal 3 Karakter)"
        moduleDescription="Kelola profil pengemudi, penumpang, dan figuran kabin secara konsisten per scene"
        currentView="character"
        onNavigate={onNavigate}
        prevView={{ view: 'vehicle', label: 'Vehicle Setup' }}
        nextView={{ view: 'location', label: 'Location Setup' }}
      />

      {/* Title & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <UserCheck className="h-4 w-4" />
            <span>MODUL 03 // MULTI-KARAKTER & POSISI DUDUK KABIN</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            Pengemudi & Penumpang (Scene #{activeScene.sceneNumber})
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Maksimal 3 karakter per scene. Tentukan posisi duduk tanpa tumpang tindih di dalam kendaraan.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              onApplyToAllScenes(charactersList);
              onShowToast('Seluruh profil karakter (1-3) berhasil diterapkan ke semua scene!');
            }}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-3.5 py-2 text-xs font-semibold text-emerald-300 transition-colors"
            title="Kunci seluruh karakter ini ke semua scene di storyboard"
          >
            <Layers className="h-3.5 w-3.5 text-emerald-400" />
            <span>Terapkan ke Semua Scene</span>
          </button>
        </div>
      </div>

      {/* Tabs Karakter 1, 2, 3 */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-2 flex-wrap">
        <div className="flex items-center gap-2">
          {charactersList.map((char, idx) => {
            const isActive = idx === safeActiveTab;
            const label = idx === 0 ? 'Karakter 1 (Utama)' : `Karakter ${idx + 1} (Opsional)`;
            const roleLabel = char.role || char.seatingPosition || 'Belum Ditentukan';

            return (
              <button
                key={char.id || idx}
                onClick={() => setActiveTab(idx)}
                className={`relative px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-zinc-900 text-white border border-emerald-500/50 shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isActive ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-zinc-600'
                  }`}
                />
                <div className="text-left">
                  <div>{label}</div>
                  <div className="text-[10px] text-zinc-500 font-normal font-mono truncate max-w-[120px]">
                    {char.name ? `${char.name} (${roleLabel})` : roleLabel}
                  </div>
                </div>

                {idx > 0 && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCharacter(idx);
                    }}
                    className="ml-1 p-1 rounded-md text-zinc-500 hover:text-red-400 hover:bg-zinc-800"
                    title="Hapus karakter ini"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </span>
                )}
              </button>
            );
          })}

          {/* Add Character Button */}
          {charactersList.length < 3 ? (
            <button
              onClick={handleAddCharacter}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Tambah Karakter ({charactersList.length}/3)</span>
            </button>
          ) : (
            <div
              className="text-[11px] text-zinc-500 italic px-2 py-1 font-mono"
              title="Maksimal 3 karakter per scene untuk menjaga konsistensi visual"
            >
              Maksimal 3 karakter per scene tercapai
            </div>
          )}
        </div>

        {/* Clear Current Button */}
        {hasCharacter && (
          <button
            onClick={() => handleRemoveCharacter(safeActiveTab)}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
          >
            <UserX className="h-3.5 w-3.5" />
            <span>{safeActiveTab === 0 ? 'Kosongkan Karakter 1' : `Hapus Karakter ${safeActiveTab + 1}`}</span>
          </button>
        )}
      </div>

      {/* Seat Conflict Warning Banner */}
      {seatConflict && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 flex items-center gap-3 text-rose-300 text-xs">
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
          <div>
            <strong className="font-semibold">Konflik Posisi Duduk:</strong> Posisi{' '}
            <span className="font-mono underline">{current.seatingPosition}</span> sudah ditempati oleh
            karakter lain di dalam mobil ini. Dua karakter tidak boleh memiliki posisi duduk yang sama di
            dalam kendaraan. Harap ganti posisi duduk salah satu karakter.
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Posisi Duduk di Kendaraan */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Compass className="h-4 w-4 text-emerald-400" />
                Posisi Duduk di Kendaraan (Validasi Anti-Duplikat)
              </h3>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                {current.seatingPosition || 'Belum Dipilih'}
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              Pilih posisi duduk untuk Karakter #{safeActiveTab + 1}. Posisi yang telah ditempati karakter
              lain di kabin ditandai agar tidak terjadi tumpang tindih.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {seatingOptions.map((seat) => {
                const isCurrent = current.seatingPosition === seat;
                const isTakenByOther = charactersList.some(
                  (c, idx) =>
                    idx !== safeActiveTab &&
                    seat !== 'Di Luar Kendaraan' &&
                    c.seatingPosition === seat
                );

                return (
                  <button
                    key={seat}
                    disabled={isTakenByOther}
                    onClick={() => handleUpdateCurrent('seatingPosition', seat)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all relative ${
                      isCurrent
                        ? 'border-emerald-500 bg-emerald-500/15 text-white font-semibold shadow-sm'
                        : isTakenByOther
                        ? 'border-zinc-800/50 bg-zinc-950/40 text-zinc-600 cursor-not-allowed'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{seat}</span>
                      {isCurrent && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                    </div>
                    {isTakenByOther && (
                      <div className="text-[10px] text-rose-400/80 mt-1 font-mono">
                        Sudah ditempati
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Foto Referensi & Identitas Wajah */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-emerald-400" />
                Foto Referensi & Identitas Wajah Karakter #{safeActiveTab + 1}
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                <Lock className="h-3 w-3" /> IndexedDB Safe
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Photo Box */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Foto Wajah Karakter
                </label>
                <div className="relative aspect-[3/4] w-full rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden flex flex-col items-center justify-center group">
                  {resolvedPhotoUrls[safeActiveTab] ? (
                    <>
                      <img
                        src={resolvedPhotoUrls[safeActiveTab]}
                        alt={`Karakter ${safeActiveTab + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={() => handleUpdateCurrent('imageUrl', '')}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-zinc-400 hover:text-red-400 transition-colors"
                        title="Hapus foto"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer flex flex-col items-center justify-center p-4 text-center text-zinc-500 hover:text-zinc-300 transition-colors h-full w-full"
                    >
                      <Upload className="h-7 w-7 text-emerald-400 mb-2" />
                      <span className="text-xs font-semibold text-zinc-300">Unggah Foto</span>
                      <span className="text-[10px] text-zinc-500 mt-1">PNG, JPG referensi wajah</span>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUploadPhoto(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              {/* Facial Inputs */}
              <div className="sm:col-span-2 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Ciri Khas Wajah (Wajib Konsisten) <span className="text-emerald-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={current.facialFeatures || ''}
                    onChange={(e) => handleUpdateCurrent('facialFeatures', e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
                    placeholder="Misal: Bentuk rahang tegas, rambut hitam lurus belah pinggir, alis tebal, mata elang tajam..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Deskripsi Fisik (Usia, Postur, Kulit)
                  </label>
                  <input
                    type="text"
                    value={current.physicalDescription || ''}
                    onChange={(e) => handleUpdateCurrent('physicalDescription', e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
                    placeholder="Misal: Usia sekitar 30 tahun, kulit sawo matang, tinggi 178 cm, postur atletis..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Ciri Khas Khusus / Tanda Menonjol
                  </label>
                  <input
                    type="text"
                    value={current.distinctiveTraits || ''}
                    onChange={(e) => handleUpdateCurrent('distinctiveTraits', e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
                    placeholder="Misal: Bekas luka kecil di pelipis, tahi lalat, jam tangan vintage..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Identitas & Peran */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              Identitas & Peran dalam Adegan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Nama Karakter</label>
                <input
                  type="text"
                  value={current.name}
                  onChange={(e) => handleUpdateCurrent('name', e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
                  placeholder="Contoh: Rian, Maya, Alex, Pengemudi..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Gender</label>
                <div className="flex gap-2">
                  {(['Pria', 'Wanita', 'Tidak Disebutkan'] as const).map((gender) => (
                    <button
                      key={gender}
                      onClick={() => handleUpdateCurrent('gender', gender)}
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
                  'Penumpang Depan',
                  'Penumpang Belakang',
                  'Mekanik / Kru Otomotif',
                  'Pejalan Kaki / Figuran',
                  'Kustom Pengguna',
                ].map((role) => (
                  <button
                    key={role}
                    onClick={() => handleUpdateCurrent('role', role)}
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

          {/* Pakaian, Aksesori & Penutup Kepala */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Shirt className="h-4 w-4 text-cyan-400" />
              Busana, Pakaian & Aksesori
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Gaya Busana / Pakaian
                </label>
                <input
                  type="text"
                  value={current.attire}
                  onChange={(e) => handleUpdateCurrent('attire', e.target.value)}
                  placeholder="Contoh: Jaket kulit bomber cokelat dengan kaus putih rapi..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Aksesori (Kacamata, Jam, dll)
                </label>
                <input
                  type="text"
                  value={current.accessories || ''}
                  onChange={(e) => handleUpdateCurrent('accessories', e.target.value)}
                  placeholder="Contoh: Kacamata hitam aviator, jam tangan chronograph..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Penutup Kepala / Topi (Opsional)
              </label>
              <input
                type="text"
                value={current.headwear}
                onChange={(e) => handleUpdateCurrent('headwear', e.target.value)}
                placeholder="Contoh: Tanpa penutup kepala (rambut rapi), topi baseball hitam..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Pose, Ekspresi & Token */}
        <div className="space-y-6">
          {/* Pose / Aktivitas */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Compass className="h-4 w-4 text-emerald-400" />
              Pose & Aktivitas Kabin
            </h3>
            <div className="space-y-1.5">
              {[
                'Duduk tegak mengemudi dengan kedua tangan di setir',
                'Satu tangan di setir, satu tangan di konsol tengah',
                'Duduk santai di kursi penumpang memperhatikan jalan',
                'Melirik ke arah kaca spion / panel instrumen',
                'Berdiri di samping kendaraan mengagumi mobil',
                'Melangkah keluar membuka pintu kendaraan',
              ].map((pose) => (
                <button
                  key={pose}
                  onClick={() => handleUpdateCurrent('pose', pose)}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    current.pose === pose
                      ? 'border-emerald-500 bg-emerald-500/10 text-white font-medium'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <span className="truncate">{pose}</span>
                  {current.pose === pose && <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 ml-1" />}
                </button>
              ))}
            </div>
          </div>

          {/* Ekspresi */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Eye className="h-4 w-4 text-cyan-400" />
              Ekspresi Wajah
            </h3>
            <div className="space-y-1.5">
              {[
                'Tenang, berwibawa dan fokus mengemudi',
                'Senyum tipis menikmati alunan perjalanan',
                'Konsentrasi penuh dengan tatapan tajam ke jalan',
                'Santai tanpa ketegangan',
                'Kagum memperhatikan performa kendaraan',
              ].map((expr) => (
                <button
                  key={expr}
                  onClick={() => handleUpdateCurrent('expression', expr)}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    current.expression === expr
                      ? 'border-cyan-500 bg-cyan-500/10 text-white font-medium'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <span className="truncate">{expr}</span>
                  {current.expression === expr && <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0 ml-1" />}
                </button>
              ))}
            </div>
          </div>

          {/* Token Preview */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                Ringkasan Semua Karakter ({charactersList.length})
              </span>
            </div>
            <div className="space-y-2">
              {charactersList.map((c, i) => (
                <div
                  key={c.id || i}
                  className={`p-2.5 rounded-xl border text-xs font-mono ${
                    i === safeActiveTab
                      ? 'border-emerald-500/40 bg-zinc-900/90'
                      : 'border-zinc-800/80 bg-zinc-900/40 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-emerald-300">
                    <span>
                      #{i + 1}: {c.name || `Karakter ${i + 1}`}
                    </span>
                    <span className="text-[10px] text-cyan-400">{c.seatingPosition || 'Posisi ?'}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                    Peran: {c.role || '-'} | Wajah: {c.facialFeatures ? 'Tercatat' : 'Belum'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
