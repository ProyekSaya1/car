import { ProjectState, StoryboardScene, VehicleConfig } from '../types';

export function createBlankVehicle(id = `v-${Date.now()}`): VehicleConfig {
  return {
    id,
    name: 'Kendaraan Belum Ditentukan',
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
      front: '',
      rear: '',
      sideRight: '',
      sideLeft: '',
      threeQuarter: '',
      details: '',
      extraPhotos: [],
    },
    interiorPhotos: {
      dashboard: '',
      steeringWheel: '',
      instrumentCluster: '',
      infotainmentScreen: '',
      centerConsole: '',
      gearShifter: '',
      pedals: '',
      driverAndPassengerSeats: '',
      controlButtons: '',
      secondRowSeats: '',
      thirdRowSeats: '',
      rearConsole: '',
      doorsAndPanels: '',
      trunkArea: '',
      extraPhotos: [],
    },
    verifiedFeaturesFromReference: [],
    manualKnownFeatures: [],
    unverifiedNotes: '',
    customNotes: '',
    paintFinish: 'Gloss',
    dynamicState: 'Kecepatan Sedang Terkendali',
  };
}

export function createBlankScene(sceneNumber = 1): StoryboardScene {
  return {
    id: `scene-${Date.now()}-${sceneNumber}`,
    sceneNumber,
    title: `Scene 0${sceneNumber}`,
    durationSeconds: 4,
    description: '',
    imageUrl: '',
    modelTarget: 'universal',
    vehicle: createBlankVehicle(`v-scene-${sceneNumber}`),
    character: {
      id: `c-${sceneNumber}`,
      name: '',
      role: '',
      gender: 'Tidak Disebutkan',
      attire: '',
      headwear: '',
      pose: '',
      expression: '',
    },
    location: {
      id: `l-${sceneNumber}`,
      name: '',
      environmentType: '',
      timeOfDay: 'Siang Hari',
      weather: 'Cerah',
      lightingSources: 'Cahaya Alami',
      roadSurface: 'Aspal Mulus',
    },
    camera: {
      id: `cam-${sceneNumber}`,
      rigType: 'Kamera Pelacak Sinematik',
      focalLength: '35mm Sinematik Standar',
      cameraMotion: 'Pelacakan Halus Sejajar Mobil',
      aspectRatio: '16:9 Standar',
      shutterMotionBlur: 'Alami 1/48s',
      colorGrading: 'Sinematik Netral',
    },
  };
}

export function createBlankProject(name = 'CAR SCENE WORKSPACE'): ProjectState {
  const firstScene = createBlankScene(1);
  return {
    id: `proj-${Date.now()}`,
    projectName: name,
    storyboardName: 'Konsep Storyboard Otomotif',
    directorNotes: 'Tentukan visi visual, referensi mobil, dan arahan adegan Anda sendiri.',
    activeSceneId: firstScene.id,
    scenes: [firstScene],
    updatedAt: 'Baru dibuat',
    isTemplate: false,
  };
}

// Tidak ada template contoh yang mengunci cerita atau jenis mobil
export const OPTIONAL_TEMPLATES: ProjectState[] = [];

// Proyek awal murni bersih: universal, halaman kosong, tanpa sampel drift/balap
export const INITIAL_PROJECTS: ProjectState[] = [
  createBlankProject('CAR SCENE WORKSPACE'),
];

export const INITIAL_PROJECT: ProjectState = INITIAL_PROJECTS[0];
