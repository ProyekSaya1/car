export type ViewMode = 
  | 'dashboard'
  | 'vehicle'
  | 'character'
  | 'location'
  | 'camera'
  | 'storyboard'
  | 'prompts'
  | 'export';

export type PromptEngineTarget = 
  | 'universal'
  | 'custom'
  | 'kling'
  | 'runway'
  | 'sora'
  | 'luma'
  | 'veo'
  | 'flux'
  | 'midjourney';

export type AIModelTarget = PromptEngineTarget;

export type VehicleCategory =
  | 'Mobil Klasik'
  | 'Mobil Jadul'
  | 'Mobil Modern'
  | 'Mobil Terbaru'
  | 'Sedan'
  | 'SUV'
  | 'MPV'
  | 'Hatchback'
  | 'Pickup'
  | 'Van'
  | 'Kendaraan Listrik'
  | 'Kendaraan Komersial'
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
  extraPhotos?: ReferencePhotoItem[]; // Foto detail tambahan tak terbatas
}

export interface InteriorPhotos {
  // Bagian Depan
  dashboard?: string;
  steeringWheel?: string;
  instrumentCluster?: string;
  infotainmentScreen?: string;
  centerConsole?: string;
  gearShifter?: string;
  pedals?: string;
  driverAndPassengerSeats?: string;
  controlButtons?: string;
  
  // Bagian Belakang
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
  licensePlate: string;       // Nomor polisi buatan pengguna
  
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

  // Visual Styling Opsional (hanya jika pengguna menentukan)
  paintFinish?: string;
  bodyKit?: string;
  wheelStyle?: string;
  lightingStyle?: string;
  dynamicState?: string;
}

export interface CharacterConfig {
  id: string;
  name: string;
  role: string;
  gender: string;
  attire: string;
  headwear: string;
  pose: string;
  expression: string;
  notes?: string;
}

export interface LocationConfig {
  id: string;
  name: string;
  environmentType: string;
  timeOfDay: string;
  weather: string;
  lightingSources: string;
  roadSurface: string;
  notes?: string;
}

export interface CameraConfig {
  id: string;
  rigType: string;
  focalLength: string;
  cameraMotion: string;
  aspectRatio: string;
  shutterMotionBlur: string;
  colorGrading: string;
  notes?: string;
}

export interface StoryboardScene {
  id: string;
  sceneNumber: number;
  title: string;
  durationSeconds: number;
  description: string;
  vehicle: VehicleConfig;
  character: CharacterConfig;
  location: LocationConfig;
  camera: CameraConfig;
  imageUrl?: string;
  modelTarget: PromptEngineTarget;
  customPromptEnhancer?: string;
}

export interface ProjectState {
  id: string;
  projectName: string;
  storyboardName: string;
  directorNotes: string;
  activeSceneId: string;
  scenes: StoryboardScene[];
  updatedAt?: string;
  isTemplate?: boolean;
}
