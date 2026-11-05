import { useState, useEffect, useRef } from 'react';
import {
  X,
  Images,
  Filter,
  Maximize2,
  Trash2,
  Upload,
  Car,
  UserCheck,
  Film,
  ZoomIn,
  AlertCircle,
} from 'lucide-react';
import { ProjectState, StoryboardScene } from '../../types';
import { getImage, saveImage, deleteImage } from '../../utils/imageStore';

export interface GalleryItem {
  id: string; // unique item key
  refKey: string; // idb ref or dataUrl
  sourceCategory: 'exterior' | 'interior' | 'character' | 'keyframe';
  sourceLabel: string;
  sceneNumber: number;
  sceneId: string;
  subPath: string; // e.g. "exteriorPhotos.front" or "characters.0.imageUrl"
}

interface ReferenceWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectState;
  onUpdateProject: (updater: (prev: ProjectState) => ProjectState) => void;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

export function ReferenceWorkspaceModal({
  isOpen,
  onClose,
  project,
  onUpdateProject,
  onShowToast,
}: ReferenceWorkspaceModalProps) {
  const [filter, setFilter] = useState<'all' | 'exterior' | 'interior' | 'character' | 'keyframe'>('all');
  const [resolvedUrls, setResolvedUrls] = useState<Record<string, string>>({});
  const [lightboxItem, setLightboxItem] = useState<{ label: string; url: string } | null>(null);
  const [replaceTarget, setReplaceTarget] = useState<GalleryItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Extract all images across all scenes
  const items: GalleryItem[] = [];

  project.scenes.forEach((scene) => {
    // 1. Scene Keyframe
    if (scene.imageUrl) {
      items.push({
        id: `${scene.id}-keyframe`,
        refKey: scene.imageUrl,
        sourceCategory: 'keyframe',
        sourceLabel: `Scene #${scene.sceneNumber}: Keyframe Sinematik`,
        sceneNumber: scene.sceneNumber,
        sceneId: scene.id,
        subPath: 'imageUrl',
      });
    }

    // 2. Vehicle Exterior Photos
    if (scene.vehicle?.exteriorPhotos) {
      const ext = scene.vehicle.exteriorPhotos;
      const extLabels: Record<string, string> = {
        front: 'Tampak Depan',
        rear: 'Tampak Belakang',
        sideRight: 'Samping Kanan',
        sideLeft: 'Samping Kiri',
        threeQuarter: 'Tiga Perempat (3/4)',
        details: 'Detail (Lampu/Gril/Pelek)',
      };

      Object.entries(extLabels).forEach(([key, label]) => {
        const val = (ext as any)[key];
        if (typeof val === 'string' && val) {
          items.push({
            id: `${scene.id}-ext-${key}`,
            refKey: val,
            sourceCategory: 'exterior',
            sourceLabel: `Kendaraan: ${label} (Scene #${scene.sceneNumber})`,
            sceneNumber: scene.sceneNumber,
            sceneId: scene.id,
            subPath: `vehicle.exteriorPhotos.${key}`,
          });
        }
      });

      if (Array.isArray(ext.extraPhotos)) {
        ext.extraPhotos.forEach((extra, idx) => {
          if (extra.url) {
            items.push({
              id: `${scene.id}-ext-extra-${extra.id || idx}`,
              refKey: extra.url,
              sourceCategory: 'exterior',
              sourceLabel: `Kendaraan Ekstra: ${extra.label || `Foto #${idx + 1}`} (Scene #${scene.sceneNumber})`,
              sceneNumber: scene.sceneNumber,
              sceneId: scene.id,
              subPath: `vehicle.exteriorPhotos.extraPhotos.${idx}`,
            });
          }
        });
      }
    }

    // 3. Vehicle Interior Photos
    if (scene.vehicle?.interiorPhotos) {
      const int = scene.vehicle.interiorPhotos;
      const intLabels: Record<string, string> = {
        dashboard: 'Dashboard',
        steeringWheel: 'Setir Mobil',
        instrumentCluster: 'Panel Instrumen',
        infotainmentScreen: 'Layar Head Unit',
        centerConsole: 'Konsol Tengah',
        gearShifter: 'Tuas Transmisi',
        pedals: 'Pedal Gas & Rem',
        driverAndPassengerSeats: 'Jok Depan',
        controlButtons: 'Tombol Kontrol',
        secondRowSeats: 'Jok Baris Kedua',
        thirdRowSeats: 'Jok Baris Ketiga',
        doorsAndPanels: 'Doortrim & Panel Pintu',
        trunkArea: 'Area Bagasi',
      };

      Object.entries(intLabels).forEach(([key, label]) => {
        const val = (int as any)[key];
        if (typeof val === 'string' && val) {
          items.push({
            id: `${scene.id}-int-${key}`,
            refKey: val,
            sourceCategory: 'interior',
            sourceLabel: `Interior: ${label} (Scene #${scene.sceneNumber})`,
            sceneNumber: scene.sceneNumber,
            sceneId: scene.id,
            subPath: `vehicle.interiorPhotos.${key}`,
          });
        }
      });

      if (Array.isArray(int.extraPhotos)) {
        int.extraPhotos.forEach((extra, idx) => {
          if (extra.url) {
            items.push({
              id: `${scene.id}-int-extra-${extra.id || idx}`,
              refKey: extra.url,
              sourceCategory: 'interior',
              sourceLabel: `Interior Ekstra: ${extra.label || `Foto #${idx + 1}`} (Scene #${scene.sceneNumber})`,
              sceneNumber: scene.sceneNumber,
              sceneId: scene.id,
              subPath: `vehicle.interiorPhotos.extraPhotos.${idx}`,
            });
          }
        });
      }
    }

    // 4. Character Photos
    const charList = Array.isArray(scene.characters)
      ? scene.characters
      : scene.character
      ? [scene.character]
      : [];

    charList.forEach((char, cIdx) => {
      if (char?.imageUrl) {
        items.push({
          id: `${scene.id}-char-${char.id || cIdx}`,
          refKey: char.imageUrl,
          sourceCategory: 'character',
          sourceLabel: `Karakter #${cIdx + 1}: ${char.name || char.role || 'Wajah'} (Scene #${scene.sceneNumber})`,
          sceneNumber: scene.sceneNumber,
          sceneId: scene.id,
          subPath: `characters.${cIdx}.imageUrl`,
        });
      }
    });
  });

  // Load actual image URLs from IDB
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchImages = async () => {
      const urlMap: Record<string, string> = {};
      for (const item of items) {
        if (!urlMap[item.refKey]) {
          const url = await getImage(item.refKey);
          urlMap[item.refKey] = url || item.refKey;
        }
      }
      if (isMounted) {
        setResolvedUrls(urlMap);
      }
    };

    fetchImages();

    return () => {
      isMounted = false;
    };
  }, [isOpen, project]);

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    return item.sourceCategory === filter;
  });

  // Handle Delete
  const handleDelete = async (item: GalleryItem) => {
    if (!confirm(`Hapus foto referensi "${item.sourceLabel}"?`)) return;

    await deleteImage(item.refKey);

    onUpdateProject((prev) => {
      const updatedScenes = prev.scenes.map((sc) => {
        if (sc.id !== item.sceneId) return sc;

        const cloned: StoryboardScene = JSON.parse(JSON.stringify(sc));

        if (item.subPath === 'imageUrl') {
          cloned.imageUrl = '';
        } else if (item.subPath.startsWith('vehicle.exteriorPhotos.')) {
          const key = item.subPath.replace('vehicle.exteriorPhotos.', '');
          if (cloned.vehicle?.exteriorPhotos) {
            (cloned.vehicle.exteriorPhotos as any)[key] = '';
          }
        } else if (item.subPath.startsWith('vehicle.interiorPhotos.')) {
          const key = item.subPath.replace('vehicle.interiorPhotos.', '');
          if (cloned.vehicle?.interiorPhotos) {
            (cloned.vehicle.interiorPhotos as any)[key] = '';
          }
        } else if (item.subPath.startsWith('characters.')) {
          const parts = item.subPath.split('.');
          const idx = parseInt(parts[1], 10);
          if (Array.isArray(cloned.characters) && cloned.characters[idx]) {
            cloned.characters[idx].imageUrl = '';
          }
          if (cloned.character && idx === 0) {
            cloned.character.imageUrl = '';
          }
        }

        return cloned;
      });

      return {
        ...prev,
        scenes: updatedScenes,
      };
    });

    onShowToast(`Foto "${item.sourceLabel}" berhasil dihapus.`);
  };

  // Handle Replace Trigger
  const handleTriggerReplace = (item: GalleryItem) => {
    setReplaceTarget(item);
    fileInputRef.current?.click();
  };

  // Handle File Input Change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replaceTarget) return;

    try {
      const newRefKey = await saveImage(file);

      onUpdateProject((prev) => {
        const updatedScenes = prev.scenes.map((sc) => {
          if (sc.id !== replaceTarget.sceneId) return sc;

          const cloned: StoryboardScene = JSON.parse(JSON.stringify(sc));

          if (replaceTarget.subPath === 'imageUrl') {
            cloned.imageUrl = newRefKey;
          } else if (replaceTarget.subPath.startsWith('vehicle.exteriorPhotos.')) {
            const key = replaceTarget.subPath.replace('vehicle.exteriorPhotos.', '');
            if (cloned.vehicle?.exteriorPhotos) {
              (cloned.vehicle.exteriorPhotos as any)[key] = newRefKey;
            }
          } else if (replaceTarget.subPath.startsWith('vehicle.interiorPhotos.')) {
            const key = replaceTarget.subPath.replace('vehicle.interiorPhotos.', '');
            if (cloned.vehicle?.interiorPhotos) {
              (cloned.vehicle.interiorPhotos as any)[key] = newRefKey;
            }
          } else if (replaceTarget.subPath.startsWith('characters.')) {
            const parts = replaceTarget.subPath.split('.');
            const idx = parseInt(parts[1], 10);
            if (Array.isArray(cloned.characters) && cloned.characters[idx]) {
              cloned.characters[idx].imageUrl = newRefKey;
            }
            if (cloned.character && idx === 0) {
              cloned.character.imageUrl = newRefKey;
            }
          }

          return cloned;
        });

        return {
          ...prev,
          scenes: updatedScenes,
        };
      });

      onShowToast(`Foto referensi berhasil diganti!`);
    } catch (err) {
      onShowToast('Gagal memproses gambar baru.', 'info');
    } finally {
      setReplaceTarget(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative flex flex-col w-full max-w-6xl max-h-[90vh] rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Images className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Reference Workspace Gallery
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {items.length} Foto Tersimpan
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Pusat manajemen seluruh foto referensi kendaraan, interior, karakter, dan keyframe storyboard.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Tutup galeri"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Navigation Bar */}
        <div className="flex items-center justify-between gap-3 px-6 py-3 border-b border-zinc-800/80 bg-zinc-900/30 shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-zinc-400 flex items-center gap-1 mr-1">
              <Filter className="h-3.5 w-3.5 text-zinc-500" /> Filter:
            </span>
            {[
              { id: 'all', label: 'Semua Foto', count: items.length },
              {
                id: 'exterior',
                label: 'Eksterior',
                count: items.filter((i) => i.sourceCategory === 'exterior').length,
              },
              {
                id: 'interior',
                label: 'Interior',
                count: items.filter((i) => i.sourceCategory === 'interior').length,
              },
              {
                id: 'character',
                label: 'Karakter',
                count: items.filter((i) => i.sourceCategory === 'character').length,
              },
              {
                id: 'keyframe',
                label: 'Keyframe',
                count: items.filter((i) => i.sourceCategory === 'keyframe').length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  filter === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {tab.label} <span className="text-[10px] opacity-70 ml-1 font-mono">({tab.count})</span>
              </button>
            ))}
          </div>

          <div className="text-[11px] font-mono text-zinc-500">
            Penyimpanan: IndexedDB Berkapasitas Tinggi
          </div>
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-zinc-500">
                <Images className="h-8 w-8 text-zinc-600" />
              </div>
              <h4 className="text-sm font-bold text-zinc-300">Belum Ada Foto Referensi Terunggah</h4>
              <p className="text-xs text-zinc-500 max-w-md">
                Unggah foto eksterior dan interior di Vehicle Setup, foto wajah di Character Setup, atau keyframe di Storyboard untuk mengelola referensi visual terpusat di sini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredItems.map((item) => {
                const url = resolvedUrls[item.refKey];

                return (
                  <div
                    key={item.id}
                    className="group relative flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-zinc-700 transition-all shadow-sm"
                  >
                    {/* Image Thumbnail with Overlay */}
                    <div className="relative aspect-[4/3] w-full bg-zinc-950 overflow-hidden">
                      {url ? (
                        <img
                          src={url}
                          alt={item.sourceLabel}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-600 text-xs">
                          Memuat...
                        </div>
                      )}

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                        {url && (
                          <button
                            onClick={() => setLightboxItem({ label: item.sourceLabel, url })}
                            className="p-2 rounded-lg bg-zinc-800/90 text-zinc-200 hover:text-white hover:bg-zinc-700 transition-colors shadow"
                            title="Perbesar (Lightbox)"
                          >
                            <ZoomIn className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleTriggerReplace(item)}
                          className="p-2 rounded-lg bg-zinc-800/90 text-cyan-300 hover:text-white hover:bg-cyan-600 transition-colors shadow"
                          title="Ganti Foto"
                        >
                          <Upload className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 rounded-lg bg-zinc-800/90 text-red-400 hover:text-white hover:bg-red-600 transition-colors shadow"
                          title="Hapus Foto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Category Badge */}
                      <span className="absolute top-2 left-2 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/75 text-zinc-300 border border-zinc-700/60 backdrop-blur-sm">
                        {item.sourceCategory.toUpperCase()}
                      </span>
                    </div>

                    {/* Metadata Footer */}
                    <div className="p-2.5 space-y-1">
                      <p
                        className="text-xs font-semibold text-zinc-200 truncate"
                        title={item.sourceLabel}
                      >
                        {item.sourceLabel}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                        <span>Scene #{item.sceneNumber}</span>
                        <span className="truncate max-w-[80px]">
                          {item.refKey.startsWith('idb:') ? 'IDB Ref' : 'Base64'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hidden File Input for Replace */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-800 bg-zinc-900/60 shrink-0">
          <div className="text-xs text-zinc-400 flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-cyan-400" />
            <span>
              Foto-foto di workspace ini akan otomatis disertakan dalam paket unduhan ZIP pada Export Center.
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 hover:text-white transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute -top-10 right-0 p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
              title="Tutup lightbox"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={lightboxItem.url}
              alt={lightboxItem.label}
              className="max-h-[80vh] w-auto max-w-full rounded-xl border border-zinc-800 object-contain shadow-2xl"
            />
            <p className="mt-3 text-xs font-mono text-zinc-300 text-center">
              {lightboxItem.label}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
