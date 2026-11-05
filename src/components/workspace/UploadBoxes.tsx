import { useRef, useState } from 'react';
import { Upload, Car, Users, Plus, X, Trash2, Camera, Check } from 'lucide-react';
import { StoryboardScene, CharacterConfig } from '../../types';
import { saveImage } from '../../utils/imageStore';
import { AsyncImage } from '../ui/AsyncImage';

interface UploadBoxesProps {
  activeScene: StoryboardScene;
  onUpdateScene: (updated: StoryboardScene) => void;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

export function UploadBoxes({
  activeScene,
  onUpdateScene,
  onShowToast,
}: UploadBoxesProps) {
  const carFileInputRef = useRef<HTMLInputElement>(null);
  const charFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingCar, setIsUploadingCar] = useState(false);
  const [isUploadingChar, setIsUploadingChar] = useState(false);

  const vehicle = activeScene.vehicle;
  const ext = vehicle.exteriorPhotos || {};

  // Count uploaded exterior photos
  const extSlots = [
    { key: 'front', label: 'Depan', url: ext.front },
    { key: 'rear', label: 'Belakang', url: ext.rear },
    { key: 'sideRight', label: 'Samping Kanan', url: ext.sideRight },
    { key: 'sideLeft', label: 'Samping Kiri', url: ext.sideLeft },
    { key: 'threeQuarter', label: '3/4 Sudut', url: ext.threeQuarter },
    { key: 'details', label: 'Detail', url: ext.details },
  ];
  const uploadedCarPhotosCount = extSlots.filter((s) => Boolean(s.url)).length;
  const primaryCarPhoto =
    ext.front || ext.threeQuarter || ext.sideRight || ext.sideLeft || ext.rear;

  // Characters (max 3)
  const characters: CharacterConfig[] = (
    Array.isArray(activeScene.characters) && activeScene.characters.length > 0
      ? activeScene.characters
      : activeScene.character
      ? [activeScene.character]
      : []
  ).slice(0, 3);

  // Multi-upload for car photos
  const handleCarFilesChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingCar(true);

    try {
      const availableKeys: (keyof typeof ext)[] = [
        'front',
        'rear',
        'sideRight',
        'sideLeft',
        'threeQuarter',
        'details',
      ];
      // Find empty slots first
      const updatedExt = { ...ext };
      let fileIdx = 0;

      for (const key of availableKeys) {
        if (!updatedExt[key] && fileIdx < files.length) {
          const file = files[fileIdx++];
          const savedRef = await saveImage(file);
          (updatedExt as any)[key] = savedRef;
        }
      }

      // If more files remain, overwrite from start
      let startIdx = 0;
      while (fileIdx < files.length && startIdx < availableKeys.length) {
        const key = availableKeys[startIdx++];
        const file = files[fileIdx++];
        const savedRef = await saveImage(file);
        (updatedExt as any)[key] = savedRef;
      }

      onUpdateScene({
        ...activeScene,
        vehicle: {
          ...vehicle,
          exteriorPhotos: updatedExt,
        },
      });

      onShowToast(`${files.length} foto referensi mobil berhasil diunggah!`);
    } catch (err) {
      console.error(err);
      onShowToast('Gagal memproses foto mobil', 'info');
    } finally {
      setIsUploadingCar(false);
      if (carFileInputRef.current) carFileInputRef.current.value = '';
    }
  };

  // Upload for character photo
  const handleCharFilesChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (characters.length >= 3 && characters.every((c) => Boolean(c.imageUrl))) {
      onShowToast('Maksimal 3 karakter telah tercapai', 'info');
      return;
    }

    setIsUploadingChar(true);
    try {
      const updatedChars = [...characters];
      const maxSlotsToAdd = Math.min(files.length, 3 - updatedChars.length);

      for (let i = 0; i < files.length; i++) {
        if (updatedChars.length < 3) {
          const savedRef = await saveImage(files[i]);
          const newIdx = updatedChars.length + 1;
          updatedChars.push({
            id: `c-${Date.now()}-${newIdx}`,
            name: '',
            role: newIdx === 1 ? 'Pengemudi' : 'Penumpang Depan',
            seatingPosition: newIdx === 1 ? 'Pengemudi' : 'Penumpang Depan',
            imageUrl: savedRef,
            poseEnabled: false,
            expressionEnabled: false,
            dialogEnabled: false,
          });
        } else {
          // If slot already exists without image, assign to it
          const emptySlotIdx = updatedChars.findIndex((c) => !c.imageUrl);
          if (emptySlotIdx !== -1) {
            const savedRef = await saveImage(files[i]);
            updatedChars[emptySlotIdx] = {
              ...updatedChars[emptySlotIdx],
              imageUrl: savedRef,
            };
          }
        }
      }

      onUpdateScene({
        ...activeScene,
        characters: updatedChars.slice(0, 3),
      });

      onShowToast('Foto karakter berhasil ditambahkan!');
    } catch (err) {
      console.error(err);
      onShowToast('Gagal memproses foto karakter', 'info');
    } finally {
      setIsUploadingChar(false);
      if (charFileInputRef.current) charFileInputRef.current.value = '';
    }
  };

  const handleDeleteCharacter = (charId: string) => {
    const filtered = characters.filter((c) => c.id !== charId);
    onUpdateScene({
      ...activeScene,
      characters: filtered,
    });
    onShowToast('Karakter dihapus dari adegan');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
      {/* 1. KOTAK UPLOAD MOBIL */}
      <div className="relative group rounded-2xl border-2 border-dashed border-zinc-700/80 hover:border-emerald-500/80 bg-zinc-900/40 hover:bg-zinc-900/60 transition-all p-4 flex flex-col justify-between min-h-[160px]">
        <input
          ref={carFileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleCarFilesChange(e.target.files)}
        />

        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Car className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Foto Referensi Mobil
              </h4>
              <p className="text-[11px] text-zinc-400">
                Depan, belakang, samping, 3/4 & detail
              </p>
            </div>
          </div>

          {uploadedCarPhotosCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {uploadedCarPhotosCount}/6 Foto
            </span>
          )}
        </div>

        {/* Content Preview or Upload Prompt */}
        {primaryCarPhoto ? (
          <div className="mt-3 flex items-center gap-3">
            <div className="relative h-14 w-20 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-950 shrink-0">
              <AsyncImage
                src={primaryCarPhoto}
                alt="Foto Mobil Utama"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-zinc-200 truncate">
                {vehicle.name || 'Kendaraan Utama'}
              </div>
              <div className="text-[11px] text-zinc-500 truncate">
                {vehicle.paintColor ? `Warna ${vehicle.paintColor}` : 'Warna belum diatur'}
              </div>

              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => carFileInputRef.current?.click()}
                  className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 underline"
                >
                  + Tambah Foto
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateScene({
                      ...activeScene,
                      vehicle: {
                        ...vehicle,
                        exteriorPhotos: {},
                      },
                    });
                    onShowToast('Semua foto eksterior mobil dihapus');
                  }}
                  className="text-[11px] font-medium text-zinc-500 hover:text-rose-400"
                >
                  Hapus Semua
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={() => carFileInputRef.current?.click()}
            className="mt-3 py-4 flex flex-col items-center justify-center text-center cursor-pointer"
          >
            <Upload className="h-6 w-6 text-zinc-500 group-hover:text-emerald-400 transition-colors mb-1.5" />
            <span className="text-xs font-semibold text-zinc-300 group-hover:text-white">
              {isUploadingCar ? 'Mengunggah Foto...' : 'Klik atau Tarik Foto Mobil ke Sini'}
            </span>
            <span className="text-[10px] text-zinc-500 mt-0.5">
              Mendukung multi-file JPG, PNG, WEBP
            </span>
          </div>
        )}
      </div>

      {/* 2. KOTAK UPLOAD KARAKTER (MAX 3) */}
      <div className="relative group rounded-2xl border-2 border-dashed border-zinc-700/80 hover:border-cyan-500/80 bg-zinc-900/40 hover:bg-zinc-900/60 transition-all p-4 flex flex-col justify-between min-h-[160px]">
        <input
          ref={charFileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleCharFilesChange(e.target.files)}
        />

        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Foto Karakter (Maks. 3)
              </h4>
              <p className="text-[11px] text-zinc-400">
                Wajah & busana acuan konsisten
              </p>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            {characters.length}/3 Karakter
          </span>
        </div>

        {/* Characters Thumbnails */}
        {characters.length > 0 ? (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              {characters.map((char, cIdx) => (
                <div
                  key={char.id || cIdx}
                  className="relative group/char flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-800"
                >
                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-zinc-900 shrink-0">
                    {char.imageUrl ? (
                      <AsyncImage
                        src={char.imageUrl}
                        alt={`Karakter ${cIdx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[10px] text-zinc-600">
                        No Pic
                      </div>
                    )}
                  </div>
                  <div className="pr-1.5">
                    <div className="text-[11px] font-bold text-zinc-200">
                      K{cIdx + 1}
                    </div>
                    <div className="text-[9px] text-zinc-400 truncate max-w-[60px]">
                      {char.seatingPosition || 'Duduk'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCharacter(char.id)}
                    className="p-1 rounded text-zinc-500 hover:text-rose-400 transition-colors"
                    title="Hapus Karakter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {characters.length < 3 && (
                <button
                  type="button"
                  onClick={() => charFileInputRef.current?.click()}
                  className="h-10 px-2 rounded-xl border border-dashed border-zinc-700 hover:border-cyan-400 text-zinc-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            onClick={() => charFileInputRef.current?.click()}
            className="mt-3 py-4 flex flex-col items-center justify-center text-center cursor-pointer"
          >
            <Upload className="h-6 w-6 text-zinc-500 group-hover:text-cyan-400 transition-colors mb-1.5" />
            <span className="text-xs font-semibold text-zinc-300 group-hover:text-white">
              {isUploadingChar ? 'Mengunggah Karakter...' : 'Upload Foto Karakter (1 - 3 orang)'}
            </span>
            <span className="text-[10px] text-zinc-500 mt-0.5">
              Setiap foto otomatis membuat slot karakter di adegan
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
