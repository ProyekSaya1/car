export type ViewMode = 
  | 'workspace'
  | 'dashboard'
  | 'vehicle'
  | 'character'
  | 'location'
  | 'camera'
  | 'storyboard'
  | 'prompts'
  | 'export';

export type PromptFormat = 'universal' | 'custom';
export type PromptMediaType = 'video' | 'image';
export type PromptLanguage = 'en' | 'id';

// Backward compatibility alias for legacy code
export type PromptEngineTarget = PromptFormat;
export type AIModelTarget = PromptFormat;

export type VehicleCategory =
  | 'Mobil'
  | 'Sepeda Motor'
  | 'Truk'
  | 'Bus'
  | 'Kendaraan Klasik'
  | 'Kendaraan Sport'
  | 'Mobil Listrik (EV)'
  | 'SUV'
  | 'Sedan'
  | 'MPV'
  | 'Pickup & Van'
  | 'Mobil Modern'
  | 'Mobil Jadul'
  | 'Kendaraan Komersial'
  | 'Kendaraan Lainnya'
  | 'Kategori Lainnya';

export interface ReferencePhotoItem {
  id: string;
  label: string;
  url: string;
  uploadedAt: string;
}

export interface ExteriorPhotos {
  front?: string;           // Tampak depan
  rear?: string;            // Tampak belakang
  sideRight?: string;       // Tampak samping kanan
  sideLeft?: string;        // Tampak samping kiri
  threeQuarter?: string;    // Tampak tiga perempat
  details?: string;         // Detail kendaraan (emblem, lampu, pelek, gril)
  extraPhotos?: ReferencePhotoItem[]; // Foto detail tambahan
}

export interface InteriorPhotos {
  dashboard?: string;
  steeringWheel?: string;
  instrumentCluster?: string;
  infotainmentScreen?: string;
  centerConsole?: string;
  gearShifter?: string;
  pedals?: string;
  driverAndPassengerSeats?: string;
  controlButtons?: string;
  secondRowSeats?: string;
  thirdRowSeats?: string;
  rearConsole?: string;
  doorsAndPanels?: string;
  trunkArea?: string;
  extraPhotos?: ReferencePhotoItem[];
}

export type SteeringPosition = 'Kanan (RHD - Indonesia)' | 'Kiri (LHD)';

export type IgnitionSystem =
  | 'Kunci Kontak Manual'
  | 'Tombol Start/Stop'
  | 'Smart Key'
  | 'Remote Start'
  | 'Sistem Kendaraan Listrik'
  | 'Belum Ditentukan';

export type TransmissionType =
  | 'Manual (MT)'
  | 'Otomatis (AT)'
  | 'CVT'
  | 'DCT (Dual Clutch)'
  | 'Direct Drive EV'
  | 'Lainnya'
  | 'Belum Ditentukan';

export type ParkingBrakeType =
  | 'Rem Tangan Manual'
  | 'Electronic Parking Brake (EPB)'
  | 'Electronic Parking Brake + Auto-Hold'
  | 'Belum Ditentukan';

export type EngineType =
  | 'Bensin N/A (Naturally Aspirated)'
  | 'Bensin Turbocharged'
  | 'Diesel Common Rail'
  | 'Hybrid (HEV / PHEV)'
  | 'Motor Listrik (EV)'
  | 'Mesin Klasik Karburator'
  | 'Lainnya'
  | 'Belum Ditentukan';

export type DriveType =
  | 'Penggerak Roda Depan (FWD)'
  | 'Penggerak Roda Belakang (RWD)'
  | 'All-Wheel Drive (AWD)'
  | 'Four-Wheel Drive (4WD / 4x4)'
  | 'Dual-Motor EV AWD'
  | 'Belum Diketahui / Tidak Disebutkan';

export type LicensePlateFormat =
  | 'indonesia_pribadi'
  | 'indonesia_ev'
  | 'luar_negeri'
  | 'tanpa_pelat'
  | 'kustom';

export interface VehicleConfig {
  id: string;
  name: string;
  make: string;               // Merek
  model: string;              // Model
  year: string;               // Tahun produksi
  typeVariant: string;        // Tipe dan varian
  category: VehicleCategory;
  customCategory?: string;    // Jika memilih Kategori Lainnya
  paintColor: string;         // Warna kendaraan
  condition?: string;         // Kondisi (Baru, Terawat, Modifikasi, Klasik Orisinal, Baret, dll)
  licensePlate: string;       // Nomor polisi buatan pengguna
  licensePlateFormat?: LicensePlateFormat; // Format pelat nomor (Tahap 7)
  
  // Konfigurasi Mekanikal & Operasional
  steeringPosition: SteeringPosition;
  ignitionSystem: IgnitionSystem;
  transmission: TransmissionType;
  parkingBrake: ParkingBrakeType;
  engineType: EngineType;
  driveType: DriveType;
  
  // Referensi Foto Eksterior & Interior
  exteriorPhotos: ExteriorPhotos;
  interiorPhotos: InteriorPhotos;
  
  // Akurasi Referensi & Fitur Kabin
  seatMaterial?: string;
  instrumentClusterType?: string;
  verifiedFeaturesFromReference: string[]; // Fitur nyata terverifikasi dari foto
  manualKnownFeatures: string[];           // Fitur yang diketahui dari spesifikasi
  unverifiedNotes?: string;                // Catatan bagian yang belum diverifikasi
  customNotes?: string;

  // Visual Styling Opsional
  paintFinish?: string;
  bodyKit?: string;
  wheelStyle?: string;
  lightingStyle?: string;
  dynamicState?: string;
}

export type AspectRatioOption = '16:9' | '9:16' | '4:5' | '1:1';
export type DurationOption = 'auto' | 3 | 4 | 5 | 8 | 10 | number;
export type MediaMode = 'video' | 'image';
export type PromptLang = 'id' | 'en';

export type SeatingPosition =
  | 'Pengemudi'
  | 'Penumpang Depan'
  | 'Belakang Kiri'
  | 'Belakang Kanan'
  | 'Belakang Tengah'
  | 'Di Luar Kendaraan'
  | 'Di Luar Mobil'
  | string;

export interface CharacterConfig {
  id: string;
  name?: string;
  role?: string;
  gender?: string;
  seatingPosition?: string;       // Posisi duduk di kabin (Pengemudi, Penumpang Depan, Belakang Kiri/Tengah/Kanan, Di Luar Kendaraan)
  imageUrl?: string;              // Foto referensi karakter (IndexedDB ref)
  physicalDescription?: string;   // Deskripsi fisik
  facialFeatures?: string;        // Ciri khas wajah
  attire?: string;
  accessories?: string;
  headwear?: string;
  distinctiveTraits?: string;
  pose?: string;                  // Pose / aksi
  poseEnabled?: boolean;
  expression?: string;            // Ekspresi wajah
  expressionEnabled?: boolean;
  dialog?: string;                // Dialog teks ucapan
  dialogEnabled?: boolean;        // Saklar dialog
  notes?: string;
}

export interface LocationConfig {
  id: string;
  enabled?: boolean;              // Saklar utama Lokasi & Cuaca
  name: string;
  environmentType: string;        // Lokasi: Jalan Kota, Jalan Tol, Pegunungan, Pantai, Showroom/Studio, Garasi
  isIndoor?: boolean;             // Indoor vs Outdoor
  atmosphere?: string;            // Suasana
  timeOfDay: string;              // Waktu: Pagi, Siang, Sore, Senja, Malam
  weather: string;                // Cuaca: Cerah, Berawan, Hujan, Berkabut
  lightingSources: string;        // Sumber Cahaya
  roadSurface: string;            // Permukaan Jalan
  regionCategory?: string;        // Kategori Wilayah
  locationDescription?: string;   // Deskripsi Latar
  notes?: string;
}

export interface CameraConfig {
  id: string;
  angle?: string;                 // Depan, Samping, Belakang, Dari Atas, Dalam Kabin, Mengikuti Mobil
  motion?: string;                // Diam, Mendekat, Mengikuti, Memutari Mobil
  lensType?: 'Lebar' | 'Standar' | 'Tele';
  colorTone?: 'Natural' | 'Sinematik' | 'Hangat' | 'Dingin';
  rigType?: string;
  cameraAngle?: string;
  cameraShot?: string;
  cameraMotion?: string;
  focalLength?: string;
  depthOfField?: string;
  lighting?: string;
  cinematicComposition?: string;
  aspectRatio?: string;
  shutterMotionBlur?: string;
  colorGrading?: string;
  notes?: string;
}

export interface VehicleDrivingAction {
  enabled?: boolean;
  entrySequence?: string;     // Urutan masuk kabin
  engineStatus?: string;      // Mati / Idle / Akselerasi / Deselerasi / Pengereman Keras / Manuver Tajam / Parkir
  seatbelt?: string;          // Terpasang / Belum terpasang
  activeGear?: string;        // P / R / N / D / S / 1 / 2 / 3 / 4 / 5 / 6 / Direct Drive
  parkingBrakeState?: string; // Aktif / Nonaktif
  maneuver?: string;          // Melaju lurus, Belok kiri, Belok kanan, U-turn, Menyalip, Parkir paralel, dll.
  estimatedSpeed?: string;    // 0 km/h, 20-40 km/h, 60-80 km/h, 100+ km/h
  headlights?: string;        // Mati / Lampu Dekat / Lampu Jauh / DRL
  turnSignal?: string;        // Mati / Kiri / Kanan / Hazard
  wipers?: string;            // Mati / Pelan / Cepat
  cabinClimate?: string;      // AC Aktif / AC Mati
  audioInfotainment?: string; // Layar Navigasi Aktif / Audio Musik / Mati
  windows?: string;           // Tertutup Penuh / Terbuka Sebagian / Terbuka Penuh
  customNotes?: string;
}

export interface ActivePanelsState {
  vehicleDetail?: boolean;
  character?: boolean;
  cameraPro?: boolean;
  locationDetail?: boolean;
  vehicleAction?: boolean;
  custom?: boolean;
}

export interface StoryboardScene {
  id: string;
  sceneNumber: number;
  title: string;
  durationSeconds: number;
  description: string;            // Ceritakan adegannya (Refiner)
  characterAction?: string;
  isLocked?: boolean;             // Fitur lock scene
  
  // Prompt Manual Override & Conflict Tracking
  manualPromptId?: string;
  manualPromptEn?: string;
  isPromptManuallyEdited?: boolean;
  promptNeedsReview?: boolean;

  // Refiner & Saklar Panels State
  activePanels?: ActivePanelsState;
  customInstruction?: string;     // Instruksi tambahan (Custom)

  // Sub-komponen
  drivingAction?: VehicleDrivingAction;
  vehicle: VehicleConfig;
  character?: CharacterConfig;     // Backward compatibility
  characters: CharacterConfig[];   // Maksimal 3 karakter
  location: LocationConfig;
  camera: CameraConfig;
  imageUrl?: string;
  modelTarget?: PromptFormat;
  promptFormat?: PromptFormat;
  promptMediaType?: PromptMediaType;
  customPromptEnhancer?: string;
}

export interface ProjectState {
  id: string;
  schemaVersion?: number;          // Schema version: 2
  projectName: string;
  storyboardName?: string;
  directorNotes?: string;
  targetDurationSeconds?: number;
  
  // Pengaturan Proyek Global (Satu baris di atas kotak upload)
  aspectRatio: AspectRatioOption;  // 16:9 (default), 9:16, 4:5, 1:1
  durationOption: DurationOption;  // 'auto' (default), 3, 4, 5, 8, 10, or custom number
  customDurationSeconds?: number;
  mediaMode: MediaMode;            // 'video' (default) | 'image'
  promptLanguage: PromptLang;      // 'id' | 'en' (default 'id')
  
  activeSceneId: string;
  scenes: StoryboardScene[];
  updatedAt?: string;
  isTemplate?: boolean;
}


