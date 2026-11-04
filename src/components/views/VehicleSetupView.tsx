import { useState, useRef } from 'react';
import {
  Car,
  Check,
  Sparkles,
  Save,
  Trash2,
  Edit3,
  Upload,
  Image as ImageIcon,
  X,
  Layers,
  ShieldCheck,
  Eye,
  Plus,
  KeyRound,
  RotateCcw,
  Sliders,
  ChevronRight,
  Info,
  Maximize2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileBadge,
  Filter,
} from 'lucide-react';
import {
  DriveType,
  EngineType,
  ExteriorPhotos,
  IgnitionSystem,
  InteriorPhotos,
  ParkingBrakeType,
  ReferencePhotoItem,
  SteeringPosition,
  StoryboardScene,
  TransmissionType,
  VehicleCategory,
  VehicleConfig,
} from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';

interface VehicleSetupViewProps {
  activeScene: StoryboardScene;
  onUpdateVehicle: (updated: VehicleConfig) => void;
  onApplyToAllScenes: (vehicle: VehicleConfig) => void;
  onShowToast: (msg: string) => void;
}

const CATEGORIES: VehicleCategory[] = [
  'Mobil Klasik',
  'Mobil Jadul',
  'Mobil Modern',
  'Mobil Terbaru',
  'Sedan',
  'SUV',
  'MPV',
  'Hatchback',
  'Pickup',
  'Van',
  'Kendaraan Listrik',
  'Kendaraan Komersial',
  'Kategori Lainnya',
];

const STEERING_POSITIONS: SteeringPosition[] = [
  'Kanan (RHD - Indonesia)',
  'Kiri (LHD)',
];

const IGNITION_SYSTEMS: IgnitionSystem[] = [
  'Tombol Start/Stop',
  'Kunci Kontak Manual',
  'Smart Key',
  'Remote Start',
  'Sistem Kendaraan Listrik',
  'Belum Ditentukan',
];

const TRANSMISSIONS: TransmissionType[] = [
  'Otomatis (AT)',
  'Manual (MT)',
  'CVT',
  'DCT (Dual Clutch)',
  'Direct Drive EV',
  'Lainnya',
  'Belum Ditentukan',
];

const PARKING_BRAKES: ParkingBrakeType[] = [
  'Electronic Parking Brake + Auto-Hold',
  'Electronic Parking Brake (EPB)',
  'Rem Tangan Manual',
  'Belum Ditentukan',
];

const ENGINE_TYPES: EngineType[] = [
  'Bensin Turbocharged',
  'Bensin N/A (Naturally Aspirated)',
  'Diesel Common Rail',
  'Hybrid (HEV / PHEV)',
  'Motor Listrik (EV)',
  'Mesin Klasik Karburator',
  'Lainnya',
  'Belum Ditentukan',
];

const DRIVE_TYPES: DriveType[] = [
  'Penggerak Roda Belakang (RWD)',
  'Penggerak Roda Depan (FWD)',
  'All-Wheel Drive (AWD)',
  'Four-Wheel Drive (4WD / 4x4)',
  'Dual-Motor EV AWD',
  'Belum Diketahui / Tidak Disebutkan',
];

const SUGGESTED_VERIFIED_FEATURES = [
  'Layar Infotainment Floating',
  'Panel AC Digital',
  'Setir dengan Tombol Kontrol Audio',
  'Paddle Shift di Belakang Setir',
  'Jok Kulit Perforated',
  'Tuas Transmisi Konsol Tengah',
  'Panoramic Sunroof',
  'Ventilasi AC Baris Kedua',
  'Lampu Utama Proyektor LED',
  'Velg Two-Tone Alloy',
  'Sensor Parkir & Kamera Mundur',
  'Rem Parkir Elektrik dengan Tombol Auto-Hold',
];

export function VehicleSetupView({
  activeScene,
  onUpdateVehicle,
  onApplyToAllScenes,
  onShowToast,
}: VehicleSetupViewProps) {
  // Working local state
  const [formData, setFormData] = useState<VehicleConfig>(() => ({
    ...activeScene.vehicle,
    exteriorPhotos: activeScene.vehicle.exteriorPhotos || {},
    interiorPhotos: activeScene.vehicle.interiorPhotos || {},
    verifiedFeaturesFromReference:
      activeScene.vehicle.verifiedFeaturesFromReference || [],
    manualKnownFeatures: activeScene.vehicle.manualKnownFeatures || [],
  }));

  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Modals & previews
  const [previewModalImage, setPreviewModalImage] = useState<{
    title: string;
    url: string;
    section?: string;
  } | null>(null);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'exterior' | 'interior'>('all');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [quickAddRefModalOpen, setQuickAddRefModalOpen] = useState(false);
  const [newRefLabel, setNewRefLabel] = useState('');
  const [newRefSection, setNewRefSection] = useState<'exterior' | 'interior'>('exterior');

  // Input states for feature tags
  const [newVerifiedText, setNewVerifiedText] = useState('');
  const [newManualSpecText, setNewManualSpecText] = useState('');

  // Toggle for third row seat interior slot
  const [hasThirdRow, setHasThirdRow] = useState<boolean>(
    Boolean(formData.interiorPhotos?.thirdRowSeats) || formData.category === 'MPV' || formData.category === 'SUV'
  );

  // Hidden file inputs
  const exteriorInputRefs: Record<string, React.RefObject<HTMLInputElement | null>> = {
    front: useRef<HTMLInputElement>(null),
    rear: useRef<HTMLInputElement>(null),
    sideRight: useRef<HTMLInputElement>(null),
    sideLeft: useRef<HTMLInputElement>(null),
    threeQuarter: useRef<HTMLInputElement>(null),
    details: useRef<HTMLInputElement>(null),
  };

  const interiorInputRefs: Record<string, React.RefObject<HTMLInputElement | null>> = {
    dashboard: useRef<HTMLInputElement>(null),
    steeringWheel: useRef<HTMLInputElement>(null),
    instrumentCluster: useRef<HTMLInputElement>(null),
    infotainmentScreen: useRef<HTMLInputElement>(null),
    centerConsole: useRef<HTMLInputElement>(null),
    gearShifter: useRef<HTMLInputElement>(null),
    pedals: useRef<HTMLInputElement>(null),
    driverAndPassengerSeats: useRef<HTMLInputElement>(null),
    controlButtons: useRef<HTMLInputElement>(null),
    secondRowSeats: useRef<HTMLInputElement>(null),
    thirdRowSeats: useRef<HTMLInputElement>(null),
    rearConsole: useRef<HTMLInputElement>(null),
    doorsAndPanels: useRef<HTMLInputElement>(null),
    trunkArea: useRef<HTMLInputElement>(null),
  };

  const customRefInputRef = useRef<HTMLInputElement>(null);

  const updateField = <K extends keyof VehicleConfig>(field: K, value: VehicleConfig[K]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasUnsavedChanges(true);
  };

  // Upload handler with client-side compression
  const handlePhotoUpload = async (
    section: 'exterior' | 'interior',
    key: string,
    file: File | null
  ) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('Mohon pilih file gambar yang valid (JPG, PNG, WebP).');
      return;
    }

    try {
      const compressedDataUrl = await compressImageFile(file, 1024, 0.78);
      if (section === 'exterior') {
        setFormData((prev) => ({
          ...prev,
          exteriorPhotos: {
            ...prev.exteriorPhotos,
            [key]: compressedDataUrl,
          },
        }));
        onShowToast(`Foto eksterior (${key}) berhasil diunggah!`);
      } else {
        setFormData((prev) => ({
          ...prev,
          interiorPhotos: {
            ...prev.interiorPhotos,
            [key]: compressedDataUrl,
          },
        }));
        onShowToast(`Foto interior (${key}) berhasil diunggah!`);
      }
      setHasUnsavedChanges(true);
    } catch (err) {
      console.error(err);
      onShowToast('Gagal memproses gambar referensi.');
    }
  };

  // Remove photo handler
  const handleRemovePhoto = (section: 'exterior' | 'interior', key: string) => {
    if (section === 'exterior') {
      setFormData((prev) => {
        const next = { ...prev.exteriorPhotos };
        delete next[key as keyof ExteriorPhotos];
        return { ...prev, exteriorPhotos: next };
      });
      onShowToast(`Foto eksterior dihapus`);
    } else {
      setFormData((prev) => {
        const next = { ...prev.interiorPhotos };
        delete next[key as keyof InteriorPhotos];
        return { ...prev, interiorPhotos: next };
      });
      onShowToast(`Foto interior dihapus`);
    }
    setHasUnsavedChanges(true);
  };

  // Add extra reference photo
  const handleAddExtraPhoto = async (file: File | null) => {
    if (!file || !newRefLabel.trim()) {
      onShowToast('Mohon isi label nama foto dan pilih file gambar.');
      return;
    }

    try {
      const compressedDataUrl = await compressImageFile(file, 1024, 0.78);
      const newItem: ReferencePhotoItem = {
        id: `ref-${Date.now()}`,
        label: newRefLabel.trim(),
        url: compressedDataUrl,
        uploadedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };

      if (newRefSection === 'exterior') {
        setFormData((prev) => ({
          ...prev,
          exteriorPhotos: {
            ...prev.exteriorPhotos,
            extraPhotos: [...(prev.exteriorPhotos.extraPhotos || []), newItem],
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          interiorPhotos: {
            ...prev.interiorPhotos,
            extraPhotos: [...(prev.interiorPhotos.extraPhotos || []), newItem],
          },
        }));
      }

      onShowToast(`Referensi tambahan "${newRefLabel}" berhasil diunggah!`);
      setNewRefLabel('');
      setQuickAddRefModalOpen(false);
      setHasUnsavedChanges(true);
    } catch (err) {
      console.error(err);
      onShowToast('Gagal memproses gambar referensi.');
    }
  };

  // Remove extra reference photo
  const handleRemoveExtraPhoto = (section: 'exterior' | 'interior', id: string) => {
    if (section === 'exterior') {
      setFormData((prev) => ({
        ...prev,
        exteriorPhotos: {
          ...prev.exteriorPhotos,
          extraPhotos: (prev.exteriorPhotos.extraPhotos || []).filter((item) => item.id !== id),
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        interiorPhotos: {
          ...prev.interiorPhotos,
          extraPhotos: (prev.interiorPhotos.extraPhotos || []).filter((item) => item.id !== id),
        },
      }));
    }
    onShowToast('Referensi tambahan dihapus');
    setHasUnsavedChanges(true);
  };

  // Verified Features Handlers
  const handleAddVerifiedFeature = (feature: string) => {
    const clean = feature.trim();
    if (!clean) return;
    if (!formData.verifiedFeaturesFromReference.includes(clean)) {
      setFormData((prev) => ({
        ...prev,
        verifiedFeaturesFromReference: [...prev.verifiedFeaturesFromReference, clean],
      }));
      setHasUnsavedChanges(true);
      onShowToast(`Fitur terverifikasi "${clean}" ditambahkan`);
    }
    setNewVerifiedText('');
  };

  const handleRemoveVerifiedFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      verifiedFeaturesFromReference: prev.verifiedFeaturesFromReference.filter((f) => f !== feature),
    }));
    setHasUnsavedChanges(true);
  };

  // Manual Known Specs Handlers
  const handleAddManualSpec = (spec: string) => {
    const clean = spec.trim();
    if (!clean) return;
    if (!formData.manualKnownFeatures.includes(clean)) {
      setFormData((prev) => ({
        ...prev,
        manualKnownFeatures: [...prev.manualKnownFeatures, clean],
      }));
      setHasUnsavedChanges(true);
      onShowToast(`Spesifikasi manual "${clean}" ditambahkan`);
    }
    setNewManualSpecText('');
  };

  const handleRemoveManualSpec = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      manualKnownFeatures: prev.manualKnownFeatures.filter((f) => f !== spec),
    }));
    setHasUnsavedChanges(true);
  };

  // Save Vehicle Configuration
  const handleSaveVehicle = () => {
    const makePart = formData.make.trim();
    const modelPart = formData.model.trim();
    const typePart = formData.typeVariant.trim();
    const generatedName =
      [makePart, modelPart, typePart].filter(Boolean).join(' ') ||
      `${formData.category} ${formData.year || ''}`.trim() ||
      'Kendaraan Kustom';

    const updated: VehicleConfig = {
      ...formData,
      name: generatedName,
    };

    onUpdateVehicle(updated);
    setHasUnsavedChanges(false);
    setIsEditing(false);
    onShowToast('Data kendaraan berhasil disimpan ke scene & memori proyek!');
  };

  // Reset / Delete Vehicle Data
  const handleResetVehicle = () => {
    const resetConfig: VehicleConfig = {
      id: `v-${Date.now()}`,
      name: 'Kendaraan Baru',
      make: '',
      model: '',
      year: '',
      typeVariant: '',
      category: 'Sedan',
      paintColor: '',
      licensePlate: '',
      steeringPosition: 'Kanan (RHD - Indonesia)',
      ignitionSystem: 'Belum Ditentukan',
      transmission: 'Belum Ditentukan',
      parkingBrake: 'Belum Ditentukan',
      engineType: 'Belum Ditentukan',
      driveType: 'Belum Diketahui / Tidak Disebutkan',
      exteriorPhotos: {
        extraPhotos: [],
      },
      interiorPhotos: {
        extraPhotos: [],
      },
      verifiedFeaturesFromReference: [],
      manualKnownFeatures: [],
      unverifiedNotes: '',
      customNotes: '',
    };
    setFormData(resetConfig);
    onUpdateVehicle(resetConfig);
    setShowResetConfirm(false);
    setIsEditing(true);
    setHasUnsavedChanges(false);
    onShowToast('Data konfigurasi kendaraan telah di-reset ke status kosong.');
  };

  // Count photos
  const exteriorCoreCount = [
    formData.exteriorPhotos.front,
    formData.exteriorPhotos.rear,
    formData.exteriorPhotos.sideRight,
    formData.exteriorPhotos.sideLeft,
    formData.exteriorPhotos.threeQuarter,
    formData.exteriorPhotos.details,
  ].filter(Boolean).length;
  const exteriorExtraCount = (formData.exteriorPhotos.extraPhotos || []).length;
  const totalExteriorPhotos = exteriorCoreCount + exteriorExtraCount;

  const interiorCoreCount = [
    formData.interiorPhotos.dashboard,
    formData.interiorPhotos.steeringWheel,
    formData.interiorPhotos.instrumentCluster,
    formData.interiorPhotos.infotainmentScreen,
    formData.interiorPhotos.centerConsole,
    formData.interiorPhotos.gearShifter,
    formData.interiorPhotos.pedals,
    formData.interiorPhotos.driverAndPassengerSeats,
    formData.interiorPhotos.controlButtons,
    formData.interiorPhotos.secondRowSeats,
    formData.interiorPhotos.thirdRowSeats,
    formData.interiorPhotos.rearConsole,
    formData.interiorPhotos.doorsAndPanels,
    formData.interiorPhotos.trunkArea,
  ].filter(Boolean).length;
  const interiorExtraCount = (formData.interiorPhotos.extraPhotos || []).length;
  const totalInteriorPhotos = interiorCoreCount + interiorExtraCount;

  // Collect all photos for gallery modal
  const allGalleryPhotos: Array<{
    id: string;
    section: 'exterior' | 'interior';
    label: string;
    url: string;
    key?: string;
    isExtra?: boolean;
  }> = [];

  const extSlots: Array<{ key: keyof ExteriorPhotos; label: string }> = [
    { key: 'front', label: 'Tampak Depan' },
    { key: 'rear', label: 'Tampak Belakang' },
    { key: 'sideRight', label: 'Tampak Samping Kanan' },
    { key: 'sideLeft', label: 'Tampak Samping Kiri' },
    { key: 'threeQuarter', label: 'Tampak Tiga Perempat' },
    { key: 'details', label: 'Detail Eksterior' },
  ];
  extSlots.forEach((slot) => {
    const val = formData.exteriorPhotos[slot.key];
    if (typeof val === 'string' && val) {
      allGalleryPhotos.push({
        id: `ext-${slot.key}`,
        section: 'exterior',
        label: slot.label,
        url: val,
        key: slot.key,
        isExtra: false,
      });
    }
  });
  (formData.exteriorPhotos.extraPhotos || []).forEach((item) => {
    allGalleryPhotos.push({
      id: item.id,
      section: 'exterior',
      label: `[Tambahan] ${item.label}`,
      url: item.url,
      isExtra: true,
    });
  });

  const intSlots: Array<{ key: keyof InteriorPhotos; label: string }> = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'steeringWheel', label: 'Setir' },
    { key: 'instrumentCluster', label: 'Panel Instrumen' },
    { key: 'infotainmentScreen', label: 'Layar Infotainment' },
    { key: 'centerConsole', label: 'Konsol Tengah' },
    { key: 'gearShifter', label: 'Tuas Transmisi' },
    { key: 'pedals', label: 'Pedal Pengemudi' },
    { key: 'driverAndPassengerSeats', label: 'Jok Depan' },
    { key: 'controlButtons', label: 'Tombol Kontrol' },
    { key: 'secondRowSeats', label: 'Jok Baris Kedua' },
    { key: 'thirdRowSeats', label: 'Jok Baris Ketiga' },
    { key: 'rearConsole', label: 'Konsol Belakang' },
    { key: 'doorsAndPanels', label: 'Pintu & Panel Interior' },
    { key: 'trunkArea', label: 'Area Bagasi' },
  ];
  intSlots.forEach((slot) => {
    const val = formData.interiorPhotos[slot.key];
    if (typeof val === 'string' && val) {
      allGalleryPhotos.push({
        id: `int-${slot.key}`,
        section: 'interior',
        label: slot.label,
        url: val,
        key: slot.key,
        isExtra: false,
      });
    }
  });
  (formData.interiorPhotos.extraPhotos || []).forEach((item) => {
    allGalleryPhotos.push({
      id: item.id,
      section: 'interior',
      label: `[Tambahan] ${item.label}`,
      url: item.url,
      isExtra: true,
    });
  });

  const filteredGalleryPhotos = allGalleryPhotos.filter((item) => {
    if (galleryFilter === 'all') return true;
    return item.section === galleryFilter;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Banner & Control Bar */}
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 p-6 md:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-48 -bottom-16 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400">
              <span className="text-emerald-400 font-bold">Modul Inti Otomotif</span>
              <span>·</span>
              <span className="text-cyan-400">Scene Aktif: #{activeScene.sceneNumber}</span>
              {hasUnsavedChanges && (
                <>
                  <span>·</span>
                  <span className="text-amber-400 flex items-center gap-1 font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Ada Perubahan Belum Disimpan
                  </span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase text-white flex items-center gap-3">
              <Car className="h-7 w-7 text-emerald-400 shrink-0" />
              <span>Vehicle Setup: Studio Konfigurasi & Referensi</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Atur identitas kendaraan universal, unggah foto referensi eksterior & interior kabin, tentukan posisi setir serta transmisi, dan verifikasi fitur nyata untuk prompt AI yang akurat tanpa halusinasi.
            </p>
          </div>

          {/* Top Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setGalleryModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white border border-zinc-700/80 transition-all shadow-sm active:scale-95"
            >
              <Eye className="h-3.5 w-3.5 text-cyan-400" />
              <span>Pratinjau Referensi ({allGalleryPhotos.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setQuickAddRefModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white border border-zinc-700/80 transition-all shadow-sm active:scale-95"
            >
              <Plus className="h-3.5 w-3.5 text-emerald-400" />
              <span>Tambah Referensi</span>
            </button>

            {isEditing ? (
              <button
                type="button"
                onClick={handleSaveVehicle}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:opacity-95 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Simpan Kendaraan</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-zinc-800 hover:bg-zinc-700 border border-emerald-500/40 transition-all active:scale-95"
              >
                <Edit3 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Edit Kendaraan</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all"
              title="Hapus / Reset Kendaraan"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick Summary Stat Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-zinc-800/80">
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3">
            <span className="text-[10px] uppercase font-mono text-zinc-400">Total Eksterior</span>
            <div className="text-base font-bold text-emerald-400 mt-0.5">
              {totalExteriorPhotos} Foto <span className="text-xs text-zinc-400 font-normal">({exteriorCoreCount}/6 Inti)</span>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3">
            <span className="text-[10px] uppercase font-mono text-zinc-400">Total Interior</span>
            <div className="text-base font-bold text-cyan-400 mt-0.5">
              {totalInteriorPhotos} Foto <span className="text-xs text-zinc-400 font-normal">({interiorCoreCount} Bagian)</span>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3">
            <span className="text-[10px] uppercase font-mono text-zinc-400">Posisi Kemudi</span>
            <div className="text-base font-bold text-zinc-200 mt-0.5 truncate">
              {formData.steeringPosition.split(' ')[0]} <span className="text-xs text-emerald-400 font-normal">({formData.steeringPosition.includes('RHD') ? 'RHD' : 'LHD'})</span>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3">
            <span className="text-[10px] uppercase font-mono text-zinc-400">Fitur Terverifikasi</span>
            <div className="text-base font-bold text-emerald-300 mt-0.5">
              {formData.verifiedFeaturesFromReference.length} Item <span className="text-xs text-zinc-400 font-normal">Terbukti Foto</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Identitas Kendaraan */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800/80 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                1. Identitas Kendaraan (Universal)
              </h2>
              <p className="text-xs text-zinc-400">
                Pilih kategori dan tentukan spesifikasi identitas tanpa batasan model tertentu.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60 self-start sm:self-auto">
            {formData.category}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Kategori Kendaraan */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Kategori Kendaraan <span className="text-emerald-400">*</span>
            </label>
            <select
              value={formData.category}
              disabled={!isEditing}
              onChange={(e) => updateField('category', e.target.value as VehicleCategory)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none disabled:opacity-60"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Jika Kategori Lainnya */}
          {formData.category === 'Kategori Lainnya' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">
                Nama Kategori Kustom
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.customCategory || ''}
                onChange={(e) => updateField('customCategory', e.target.value)}
                placeholder="Misal: Truk Ringan, Mobil Konsep, Buggy..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none disabled:opacity-60"
              />
            </div>
          )}

          {/* Merek */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Merek Kendaraan <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.make}
              onChange={(e) => updateField('make', e.target.value)}
              placeholder="Misal: Toyota, BMW, Porsche, Hyundai, Wuling..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none disabled:opacity-60"
            />
          </div>

          {/* Model */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Model Kendaraan <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.model}
              onChange={(e) => updateField('model', e.target.value)}
              placeholder="Misal: Corolla, 3 Series, Ioniq 5, Kijang Innova..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none disabled:opacity-60"
            />
          </div>

          {/* Tahun Produksi */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Tahun Produksi
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.year}
              onChange={(e) => updateField('year', e.target.value)}
              placeholder="Misal: 1986, 1999, 2018, 2024, 2025"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none disabled:opacity-60"
            />
          </div>

          {/* Tipe & Varian */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Tipe dan Varian
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.typeVariant}
              onChange={(e) => updateField('typeVariant', e.target.value)}
              placeholder="Misal: 2.0 Turbo Luxury, Type R, Standard, DX..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none disabled:opacity-60"
            />
          </div>

          {/* Warna Kendaraan */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Warna Kendaraan
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.paintColor}
              onChange={(e) => updateField('paintColor', e.target.value)}
              placeholder="Misal: Hitam Metalik, Putih Mutiara, Abu-Abu..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none disabled:opacity-60"
            />
          </div>

          {/* Nomor Polisi Buatan Pengguna */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-zinc-300">
                Nomor Polisi (Plat Kustom)
              </label>
              <span className="text-[10px] text-zinc-400">Opsional</span>
            </div>
            <div className="relative">
              <input
                type="text"
                disabled={!isEditing}
                value={formData.licensePlate}
                onChange={(e) => updateField('licensePlate', e.target.value.toUpperCase())}
                placeholder="Misal: B 1234 ABC atau plat kustom"
                className="w-full uppercase font-mono tracking-wider rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-emerald-300 focus:border-emerald-500 focus:outline-none disabled:opacity-60"
              />
              <FileBadge className="absolute right-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Referensi Eksterior */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800/80 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                2. Referensi Eksterior Kendaraan
              </h2>
              <p className="text-xs text-zinc-400">
                Unggah sudut tampak kendaraan untuk menjaga konsistensi bentuk bodi, velg, dan lampu.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {exteriorCoreCount}/6 Slot Terisi · {exteriorExtraCount} Tambahan
          </span>
        </div>

        {/* 6 Core Exterior Slots */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {extSlots.map((slot) => {
            const photoUrl = formData.exteriorPhotos[slot.key];
            const hasPhoto = Boolean(photoUrl);

            return (
              <div
                key={slot.key}
                className="group relative rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 flex flex-col justify-between hover:border-zinc-700 transition-all min-h-[170px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-zinc-300 truncate">
                      {slot.label}
                    </span>
                    {hasPhoto ? (
                      <span className="h-2 w-2 rounded-full bg-emerald-400" title="Terunggah" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-zinc-700" title="Kosong" />
                    )}
                  </div>

                  {hasPhoto ? (
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 mb-2">
                      <img
                        src={photoUrl as string}
                        alt={slot.label}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewModalImage({
                            title: `Eksterior: ${slot.label}`,
                            url: photoUrl as string,
                            section: 'Eksterior',
                          })
                        }
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <Maximize2 className="h-4 w-4 text-white drop-shadow" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => isEditing && exteriorInputRefs[slot.key]?.current?.click()}
                      className={`aspect-video w-full rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 flex flex-col items-center justify-center text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 cursor-pointer transition-colors mb-2 ${
                        !isEditing && 'pointer-events-none opacity-50'
                      }`}
                    >
                      <Upload className="h-4 w-4 mb-1" />
                      <span className="text-[10px]">Unggah</span>
                    </div>
                  )}
                </div>

                {/* Slot controls */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                  <input
                    type="file"
                    ref={exteriorInputRefs[slot.key]}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload('exterior', slot.key, e.target.files?.[0] || null)}
                  />

                  {hasPhoto ? (
                    <div className="flex items-center justify-between w-full">
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => exteriorInputRefs[slot.key]?.current?.click()}
                          className="text-[10px] text-zinc-400 hover:text-emerald-400"
                        >
                          Ganti
                        </button>
                      )}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto('exterior', slot.key)}
                          className="text-[10px] text-zinc-400 hover:text-red-400 ml-auto"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] text-zinc-400">Opsional</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Extra Exterior Photos List */}
        {(formData.exteriorPhotos.extraPhotos || []).length > 0 && (
          <div className="pt-3 border-t border-zinc-800/60">
            <span className="text-xs font-semibold text-zinc-300 block mb-2.5">
              Foto Eksterior Tambahan:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {(formData.exteriorPhotos.extraPhotos || []).map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-2 space-y-1.5 relative group"
                >
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-zinc-900 relative">
                    <img src={item.url} alt={item.label} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewModalImage({
                          title: `Eksterior Tambahan: ${item.label}`,
                          url: item.url,
                          section: 'Eksterior Tambahan',
                        })
                      }
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <Maximize2 className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-300 truncate max-w-[80px]" title={item.label}>
                      {item.label}
                    </span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExtraPhoto('exterior', item.id)}
                        className="text-zinc-400 hover:text-red-400 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: Referensi Interior */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 md:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800/80 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                3. Referensi Interior Kabin
              </h2>
              <p className="text-xs text-zinc-400">
                Bagian interior depan & belakang terpisah untuk menghindari kesalahan detail kabin pada prompt.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {interiorCoreCount} Slot Terisi · {interiorExtraCount} Tambahan
          </span>
        </div>

        {/* 3A: Interior Depan */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Interior Depan (Front Cockpit & Controls)
            </h3>
            <span className="text-[11px] text-zinc-400">9 Komponen Depan</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { key: 'dashboard', label: 'Dashboard' },
              { key: 'steeringWheel', label: 'Setir' },
              { key: 'instrumentCluster', label: 'Panel Instrumen' },
              { key: 'infotainmentScreen', label: 'Layar Infotainment' },
              { key: 'centerConsole', label: 'Konsol Tengah' },
              { key: 'gearShifter', label: 'Tuas Transmisi' },
              { key: 'pedals', label: 'Pedal Kaki' },
              { key: 'driverAndPassengerSeats', label: 'Jok Depan' },
              { key: 'controlButtons', label: 'Tombol Kontrol' },
            ].map((slot) => {
              const photoUrl = formData.interiorPhotos[slot.key as keyof InteriorPhotos];
              const hasPhoto = typeof photoUrl === 'string' && Boolean(photoUrl);

              return (
                <div
                  key={slot.key}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-2.5 flex flex-col justify-between hover:border-zinc-700 transition-all min-h-[145px]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-medium text-zinc-300 truncate">
                        {slot.label}
                      </span>
                      {hasPhoto ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                      )}
                    </div>

                    {hasPhoto ? (
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 group">
                        <img src={photoUrl} alt={slot.label} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewModalImage({
                              title: `Interior Depan: ${slot.label}`,
                              url: photoUrl,
                              section: 'Interior Depan',
                            })
                          }
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <Maximize2 className="h-3.5 w-3.5 text-white" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => isEditing && interiorInputRefs[slot.key]?.current?.click()}
                        className={`aspect-video w-full rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30 flex flex-col items-center justify-center text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 cursor-pointer transition-colors ${
                          !isEditing && 'pointer-events-none opacity-50'
                        }`}
                      >
                        <Upload className="h-3.5 w-3.5 mb-0.5" />
                        <span className="text-[9px]">Unggah</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-zinc-850">
                    <input
                      type="file"
                      ref={interiorInputRefs[slot.key]}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePhotoUpload('interior', slot.key, e.target.files?.[0] || null)}
                    />
                    {hasPhoto ? (
                      <div className="flex items-center justify-between w-full">
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => interiorInputRefs[slot.key]?.current?.click()}
                            className="text-[9px] text-zinc-400 hover:text-emerald-400"
                          >
                            Ganti
                          </button>
                        )}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto('interior', slot.key)}
                            className="text-[9px] text-zinc-400 hover:text-red-400 ml-auto"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-[9px] text-zinc-400">Opsional</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3B: Interior Belakang */}
        <div className="space-y-3 pt-3 border-t border-zinc-800/60">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              Interior Belakang & Bagasi (Rear Passenger & Cargo)
            </h3>
            <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={hasThirdRow}
                onChange={(e) => setHasThirdRow(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-0"
              />
              <span>Tampilkan Baris Ketiga (3-Row Seating)</span>
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { key: 'secondRowSeats', label: 'Jok Baris Kedua' },
              ...(hasThirdRow ? [{ key: 'thirdRowSeats', label: 'Jok Baris Ketiga' }] : []),
              { key: 'rearConsole', label: 'Konsol Belakang' },
              { key: 'doorsAndPanels', label: 'Pintu & Panel Interior' },
              { key: 'trunkArea', label: 'Area Bagasi' },
            ].map((slot) => {
              const photoUrl = formData.interiorPhotos[slot.key as keyof InteriorPhotos];
              const hasPhoto = typeof photoUrl === 'string' && Boolean(photoUrl);

              return (
                <div
                  key={slot.key}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-2.5 flex flex-col justify-between hover:border-zinc-700 transition-all min-h-[145px]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-medium text-zinc-300 truncate">
                        {slot.label}
                      </span>
                      {hasPhoto ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                      )}
                    </div>

                    {hasPhoto ? (
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 group">
                        <img src={photoUrl} alt={slot.label} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewModalImage({
                              title: `Interior Belakang: ${slot.label}`,
                              url: photoUrl,
                              section: 'Interior Belakang',
                            })
                          }
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <Maximize2 className="h-3.5 w-3.5 text-white" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => isEditing && interiorInputRefs[slot.key]?.current?.click()}
                        className={`aspect-video w-full rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30 flex flex-col items-center justify-center text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 cursor-pointer transition-colors ${
                          !isEditing && 'pointer-events-none opacity-50'
                        }`}
                      >
                        <Upload className="h-3.5 w-3.5 mb-0.5" />
                        <span className="text-[9px]">Unggah</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-zinc-850">
                    <input
                      type="file"
                      ref={interiorInputRefs[slot.key]}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePhotoUpload('interior', slot.key, e.target.files?.[0] || null)}
                    />
                    {hasPhoto ? (
                      <div className="flex items-center justify-between w-full">
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => interiorInputRefs[slot.key]?.current?.click()}
                            className="text-[9px] text-zinc-400 hover:text-cyan-400"
                          >
                            Ganti
                          </button>
                        )}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto('interior', slot.key)}
                            className="text-[9px] text-zinc-400 hover:text-red-400 ml-auto"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-[9px] text-zinc-400">Opsional</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3C: Foto Interior Tambahan */}
        {(formData.interiorPhotos.extraPhotos || []).length > 0 && (
          <div className="pt-3 border-t border-zinc-800/60">
            <span className="text-xs font-semibold text-zinc-300 block mb-2.5">
              Foto Interior Tambahan:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {(formData.interiorPhotos.extraPhotos || []).map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-2 space-y-1.5 relative group"
                >
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-zinc-900 relative">
                    <img src={item.url} alt={item.label} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewModalImage({
                          title: `Interior Tambahan: ${item.label}`,
                          url: item.url,
                          section: 'Interior Tambahan',
                        })
                      }
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <Maximize2 className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-300 truncate max-w-[80px]" title={item.label}>
                      {item.label}
                    </span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExtraPhoto('interior', item.id)}
                        className="text-zinc-400 hover:text-red-400 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: Konfigurasi Mekanikal & Operasional */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-800/80">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              4. Konfigurasi Mekanikal & Operasional
            </h2>
            <p className="text-xs text-zinc-400">
              Konfigurasi krusial agar AI menempatkan posisi setir, starter, tuas transmisi, dan rem tangan secara akurat.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Posisi Setir (Steering Position) */}
          <div className="space-y-2 p-4 rounded-xl border border-zinc-800 bg-zinc-950/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-200">
                Posisi Setir (Steering) <span className="text-emerald-400">*</span>
              </label>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Default RI: RHD
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {STEERING_POSITIONS.map((pos) => (
                <button
                  type="button"
                  key={pos}
                  disabled={!isEditing}
                  onClick={() => updateField('steeringPosition', pos)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    formData.steeringPosition === pos
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                  } disabled:opacity-60`}
                >
                  <div className="flex items-center justify-between">
                    <span>{pos}</span>
                    {formData.steeringPosition === pos && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-400 leading-normal">
              Posisi setir dimasukkan ke dalam prompt & negative prompt untuk mencegah gambar membalik posisi pengemudi.
            </p>
          </div>

          {/* Sistem Menyalakan Kendaraan (Ignition) */}
          <div className="space-y-2 p-4 rounded-xl border border-zinc-800 bg-zinc-950/60">
            <label className="text-xs font-bold text-zinc-200 block">
              Sistem Menyalakan (Ignition)
            </label>
            <select
              value={formData.ignitionSystem}
              disabled={!isEditing}
              onChange={(e) => updateField('ignitionSystem', e.target.value as IgnitionSystem)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none disabled:opacity-60"
            >
              {IGNITION_SYSTEMS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-zinc-400 leading-normal">
              Menentukan apakah adegan start mesin menggunakan anak kunci manual, tombol Start/Stop, atau sistem EV.
            </p>
          </div>

          {/* Transmisi */}
          <div className="space-y-2 p-4 rounded-xl border border-zinc-800 bg-zinc-950/60">
            <label className="text-xs font-bold text-zinc-200 block">
              Tipe Transmisi
            </label>
            <select
              value={formData.transmission}
              disabled={!isEditing}
              onChange={(e) => updateField('transmission', e.target.value as TransmissionType)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none disabled:opacity-60"
            >
              {TRANSMISSIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-zinc-400 leading-normal">
              Memastikan bentuk tuas transmisi (manual shift knob vs selector AT/CVT) sesuai kenyataan.
            </p>
          </div>

          {/* Rem Tangan (Parking Brake) */}
          <div className="space-y-2 p-4 rounded-xl border border-zinc-800 bg-zinc-950/60">
            <label className="text-xs font-bold text-zinc-200 block">
              Sistem Rem Tangan / Parkir
            </label>
            <select
              value={formData.parkingBrake}
              disabled={!isEditing}
              onChange={(e) => updateField('parkingBrake', e.target.value as ParkingBrakeType)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none disabled:opacity-60"
            >
              {PARKING_BRAKES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-zinc-400 leading-normal">
              Menghindari konsol tengah menampilkan tuas rem tangan manual jika mobil aslinya memakai tombol EPB.
            </p>
          </div>

          {/* Jenis Mesin / Tenaga */}
          <div className="space-y-2 p-4 rounded-xl border border-zinc-800 bg-zinc-950/60">
            <label className="text-xs font-bold text-zinc-200 block">
              Jenis Mesin / Motor Listrik
            </label>
            <select
              value={formData.engineType}
              disabled={!isEditing}
              onChange={(e) => updateField('engineType', e.target.value as EngineType)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none disabled:opacity-60"
            >
              {ENGINE_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-zinc-400 leading-normal">
              Menyesuaikan suara adegan, tachometer instrumen, atau ketiadaan knalpot pada mobil listrik.
            </p>
          </div>

          {/* Sistem Penggerak Roda */}
          <div className="space-y-2 p-4 rounded-xl border border-zinc-800 bg-zinc-950/60">
            <label className="text-xs font-bold text-zinc-200 block">
              Penggerak Roda (Drivetrain)
            </label>
            <select
              value={formData.driveType}
              disabled={!isEditing}
              onChange={(e) => updateField('driveType', e.target.value as DriveType)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none disabled:opacity-60"
            >
              {DRIVE_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-zinc-400 leading-normal">
              Menjaga akurasi dinamika putaran roda dan perilaku fisika saat melintasi tikungan atau medan berat.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 5: Akurasi Referensi & Fitur Kabin (Strict Truthfulness) */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-800/80">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              5. Akurasi Fitur & Kejujuran Referensi Visual
            </h2>
            <p className="text-xs text-zinc-400">
              Pemisahan tegas: Fitur nyata yang terbukti dari foto vs spesifikasi pengguna vs hal yang belum diverifikasi. Jangan mengarang fitur yang tidak terlihat.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 5A: Fitur Nyata Terverifikasi dari Foto */}
          <div className="space-y-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Terverifikasi dari Foto
                </h3>
                <span className="text-[10px] font-mono text-emerald-400/80">
                  {formData.verifiedFeaturesFromReference.length} Item
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-3">
                Fitur yang benar-benar tampak pada foto referensi yang diunggah.
              </p>

              {/* Tag Badges */}
              <div className="flex flex-wrap gap-1.5 mb-3 min-h-[60px]">
                {formData.verifiedFeaturesFromReference.length === 0 ? (
                  <span className="text-[11px] text-zinc-400 italic">
                    Belum ada fitur terverifikasi yang ditambahkan.
                  </span>
                ) : (
                  formData.verifiedFeaturesFromReference.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    >
                      <span>{item}</span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVerifiedFeature(item)}
                          className="hover:text-red-400"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Input & Suggestions */}
            {isEditing && (
              <div className="space-y-2 pt-2 border-t border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newVerifiedText}
                    onChange={(e) => setNewVerifiedText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddVerifiedFeature(newVerifiedText))}
                    placeholder="Tambah fitur terverifikasi..."
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddVerifiedFeature(newVerifiedText)}
                    className="p-2 rounded-lg bg-emerald-500 text-zinc-950 font-bold shrink-0 hover:bg-emerald-400"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Quick Suggestion Pills */}
                <div className="flex flex-wrap gap-1">
                  {SUGGESTED_VERIFIED_FEATURES.slice(0, 4).map((sug) => (
                    <button
                      type="button"
                      key={sug}
                      onClick={() => handleAddVerifiedFeature(sug)}
                      className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-emerald-300 border border-zinc-800"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 5B: Spesifikasi Manual yang Ditentukan Pengguna */}
          <div className="space-y-3 p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="h-4 w-4" />
                  Spesifikasi Pengguna
                </h3>
                <span className="text-[10px] font-mono text-cyan-400/80">
                  {formData.manualKnownFeatures.length} Item
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-3">
                Spesifikasi manual yang diinginkan pengguna (meski tidak tampak di foto).
              </p>

              {/* Tag Badges */}
              <div className="flex flex-wrap gap-1.5 mb-3 min-h-[60px]">
                {formData.manualKnownFeatures.length === 0 ? (
                  <span className="text-[11px] text-zinc-400 italic">
                    Belum ada spesifikasi manual.
                  </span>
                ) : (
                  formData.manualKnownFeatures.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    >
                      <span>{item}</span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveManualSpec(item)}
                          className="hover:text-red-400"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Input */}
            {isEditing && (
              <div className="space-y-2 pt-2 border-t border-cyan-500/20">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newManualSpecText}
                    onChange={(e) => setNewManualSpecText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddManualSpec(newManualSpecText))}
                    placeholder="Misal: Mesin 2.0L Turbo 250HP..."
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddManualSpec(newManualSpecText)}
                    className="p-2 rounded-lg bg-cyan-500 text-zinc-950 font-bold shrink-0 hover:bg-cyan-400"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 5C: Catatan Kejujuran & Belum Terverifikasi */}
          <div className="space-y-3 p-4 rounded-xl border border-amber-500/20 bg-amber-950/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4" />
                  Catatan Belum Terverifikasi
                </h3>
              </div>
              <p className="text-[11px] text-zinc-400 mb-2">
                Peringatan agar prompt AI tidak mengarang tombol atau bagian yang belum terlihat.
              </p>
              <textarea
                rows={4}
                disabled={!isEditing}
                value={formData.unverifiedNotes || ''}
                onChange={(e) => updateField('unverifiedNotes', e.target.value)}
                placeholder="Misal: Detail ventilasi AC belakang dan pedal kaki belum tampak di foto. Jangan merekayasa detail sunroof jika tidak terlihat pada referensi."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-200 focus:border-amber-500 focus:outline-none leading-relaxed disabled:opacity-60"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: Ringkasan Lengkap Kendaraan (Comprehensive Vehicle Summary) */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 md:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800/80 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileBadge className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                6. Ringkasan Konfigurasi Kendaraan
              </h2>
              <p className="text-xs text-zinc-400">
                Tinjauan lengkap data kendaraan yang akan dipakai oleh Storyboard, Prompt Generator, dan Export Center.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400">
              Status: {isEditing ? 'Mode Pengeditan Aktif' : 'Tersimpan & Terkunci'}
            </span>
          </div>
        </div>

        {/* Summary Card Details */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-zinc-800/60">
            <div>
              <div className="text-[10px] uppercase font-mono text-emerald-400 font-bold">
                Designasi Kendaraan
              </div>
              <div className="text-xl font-extrabold text-white uppercase tracking-tight">
                {formData.make || formData.model ? `${formData.make} ${formData.model} ${formData.typeVariant}` : 'Kendaraan Kustom'}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-zinc-900 text-zinc-300 border border-zinc-800">
                {formData.category}
              </span>
              {formData.year && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-zinc-900 text-zinc-300 border border-zinc-800">
                  Tahun {formData.year}
                </span>
              )}
              {formData.licensePlate && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  Plat: {formData.licensePlate}
                </span>
              )}
            </div>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-850">
              <span className="text-[10px] text-zinc-400 uppercase block font-mono">Posisi Setir</span>
              <span className="font-semibold text-zinc-200 mt-0.5 block truncate">
                {formData.steeringPosition}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-850">
              <span className="text-[10px] text-zinc-400 uppercase block font-mono">Starter</span>
              <span className="font-semibold text-zinc-200 mt-0.5 block truncate">
                {formData.ignitionSystem}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-850">
              <span className="text-[10px] text-zinc-400 uppercase block font-mono">Transmisi</span>
              <span className="font-semibold text-zinc-200 mt-0.5 block truncate">
                {formData.transmission}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-850">
              <span className="text-[10px] text-zinc-400 uppercase block font-mono">Rem Tangan</span>
              <span className="font-semibold text-zinc-200 mt-0.5 block truncate">
                {formData.parkingBrake}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-850">
              <span className="text-[10px] text-zinc-400 uppercase block font-mono">Tipe Mesin</span>
              <span className="font-semibold text-zinc-200 mt-0.5 block truncate">
                {formData.engineType}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-850">
              <span className="text-[10px] text-zinc-400 uppercase block font-mono">Penggerak</span>
              <span className="font-semibold text-zinc-200 mt-0.5 block truncate">
                {formData.driveType}
              </span>
            </div>
          </div>

          {/* Reference Coverage Progress */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400">
            <div>
              <span className="text-zinc-300 font-semibold">Cakupan Referensi Foto:</span>{' '}
              {totalExteriorPhotos} Eksterior · {totalInteriorPhotos} Interior (Total {totalExteriorPhotos + totalInteriorPhotos} Gambar)
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-300 font-semibold">Fitur Terbukti:</span>{' '}
              <span className="text-emerald-400 font-mono font-bold">
                {formData.verifiedFeaturesFromReference.length} Terverifikasi
              </span>
            </div>
          </div>
        </div>

        {/* 5 Real Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-800/80">
          <div className="flex flex-wrap items-center gap-2">
            {/* Tombol 1: Simpan Kendaraan */}
            <button
              type="button"
              onClick={handleSaveVehicle}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-zinc-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:opacity-95 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Kendaraan</span>
            </button>

            {/* Tombol 2: Edit Kendaraan */}
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                onShowToast('Mode pengeditan kendaraan diaktifkan');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                isEditing
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                  : 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
              }`}
            >
              <Edit3 className="h-4 w-4 text-emerald-400" />
              <span>{isEditing ? 'Sedang Mengedit' : 'Edit Kendaraan'}</span>
            </button>

            {/* Tombol 3: Hapus Kendaraan */}
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all"
            >
              <Trash2 className="h-4 w-4" />
              <span>Hapus Kendaraan</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Tombol 4: Tambah Referensi */}
            <button
              type="button"
              onClick={() => setQuickAddRefModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-all"
            >
              <Plus className="h-4 w-4 text-emerald-400" />
              <span>Tambah Referensi</span>
            </button>

            {/* Tombol 5: Pratinjau Referensi */}
            <button
              type="button"
              onClick={() => setGalleryModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-all"
            >
              <Eye className="h-4 w-4 text-cyan-400" />
              <span>Pratinjau Referensi ({allGalleryPhotos.length})</span>
            </button>

            {/* Tombol 6: Terapkan ke Semua Scene */}
            <button
              type="button"
              onClick={() => {
                onApplyToAllScenes(formData);
                onShowToast('Konfigurasi kendaraan berhasil diterapkan ke seluruh scene storyboard!');
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-all"
            >
              <Layers className="h-4 w-4 text-purple-400" />
              <span>Terapkan ke Semua Scene</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Single Image Zoom Preview Modal */}
      {previewModalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-mono text-emerald-400">
                  {previewModalImage.section || 'Foto Referensi'}
                </span>
                <h3 className="text-base font-bold text-white">
                  {previewModalImage.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalImage(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="aspect-video w-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <img
                src={previewModalImage.url}
                alt={previewModalImage.title}
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewModalImage(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Full Reference Gallery Modal */}
      {galleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-5xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Eye className="h-5 w-5 text-cyan-400" />
                  Pratinjau Galeri Referensi Kendaraan
                </h3>
                <p className="text-xs text-zinc-400">
                  Total {allGalleryPhotos.length} foto referensi aktif untuk kendaraan {formData.make} {formData.model}
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setGalleryFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    galleryFilter === 'all'
                      ? 'bg-emerald-500 text-zinc-950 font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Semua ({allGalleryPhotos.length})
                </button>
                <button
                  type="button"
                  onClick={() => setGalleryFilter('exterior')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    galleryFilter === 'exterior'
                      ? 'bg-emerald-500 text-zinc-950 font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Eksterior ({totalExteriorPhotos})
                </button>
                <button
                  type="button"
                  onClick={() => setGalleryFilter('interior')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    galleryFilter === 'interior'
                      ? 'bg-emerald-500 text-zinc-950 font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Interior ({totalInteriorPhotos})
                </button>
              </div>

              <button
                type="button"
                onClick={() => setGalleryModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Gallery Grid */}
            <div className="overflow-y-auto space-y-4 pr-1 flex-1">
              {filteredGalleryPhotos.length === 0 ? (
                <div className="py-16 text-center text-zinc-400 space-y-3">
                  <ImageIcon className="h-10 w-10 mx-auto text-zinc-600" />
                  <p className="text-sm">Belum ada foto referensi yang diunggah pada kategori ini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredGalleryPhotos.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 space-y-2 group"
                    >
                      <div className="aspect-video w-full rounded-lg overflow-hidden bg-zinc-950 relative border border-zinc-800/80">
                        <img
                          src={item.url}
                          alt={item.label}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setGalleryModalOpen(false);
                            setPreviewModalImage({
                              title: item.label,
                              url: item.url,
                              section: item.section === 'exterior' ? 'Eksterior' : 'Interior',
                            });
                          }}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <Maximize2 className="h-4 w-4 text-white" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-zinc-200 truncate" title={item.label}>
                          {item.label}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {item.section === 'exterior' ? 'Eks' : 'Int'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800 shrink-0">
              <span className="text-xs text-zinc-400">
                Klik ikon perbesar untuk melihat foto resolusi penuh.
              </span>
              <button
                type="button"
                onClick={() => setGalleryModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-zinc-800 hover:bg-zinc-700"
              >
                Tutup Galeri
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Quick Add Extra Reference Modal */}
      {quickAddRefModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Tambah Referensi Tambahan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickAddRefModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Kategori Bagian
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewRefSection('exterior')}
                    className={`py-2 rounded-xl text-xs font-semibold border ${
                      newRefSection === 'exterior'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    Eksterior Tambahan
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRefSection('interior')}
                    className={`py-2 rounded-xl text-xs font-semibold border ${
                      newRefSection === 'interior'
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    Interior Tambahan
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Label / Nama Bagian <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  value={newRefLabel}
                  onChange={(e) => setNewRefLabel(e.target.value)}
                  placeholder="Misal: Pelek 19 Inci, Knalpot Ganda, Jahitan Jok Merah..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  File Foto Gambar
                </label>
                <input
                  type="file"
                  ref={customRefInputRef}
                  accept="image/*"
                  onChange={(e) => handleAddExtraPhoto(e.target.files?.[0] || null)}
                  className="w-full text-xs text-zinc-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setQuickAddRefModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Reset / Delete Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-red-500/30 bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Reset Data Kendaraan?
                </h3>
                <p className="text-xs text-zinc-400">
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Semua identitas, foto eksterior, foto interior, konfigurasi mekanikal, dan daftar fitur terverifikasi untuk kendaraan ini akan dihapus dan dikosongkan.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetVehicle}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-600/20 transition-all active:scale-95"
              >
                Ya, Hapus / Reset Kendaraan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
