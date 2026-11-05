import { ProjectState, StoryboardScene, VehicleConfig } from '../types';

export function createBlankVehicle(id = `v-${Date.now()}`): VehicleConfig {
  return {
    id,
    name: '',
    make: '',
    model: '',
    year: '',
    typeVariant: '',
    category: 'Mobil',
    paintColor: '',
    condition: '',
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
    paintFinish: '',
    dynamicState: '',
  };
}

export function createBlankCharacter(sceneNumber = 1, index = 1) {
  return {
    id: `c-${sceneNumber}-${index}-${Date.now()}`,
    name: '',
    role: index === 1 ? 'Pengemudi' : 'Penumpang Depan',
    gender: 'Tidak Disebutkan',
    seatingPosition: index === 1 ? 'Pengemudi' : 'Penumpang Depan',
    imageUrl: '',
    physicalDescription: '',
    facialFeatures: '',
    attire: '',
    accessories: '',
    headwear: '',
    distinctiveTraits: '',
    pose: '',
    poseEnabled: false,
    expression: '',
    expressionEnabled: false,
    dialog: '',
    dialogEnabled: false,
  };
}

export function createBlankDrivingAction() {
  return {
    enabled: false,
    entrySequence: '',
    engineStatus: '',
    seatbelt: '',
    activeGear: '',
    parkingBrakeState: '',
    maneuver: '',
    estimatedSpeed: '',
    headlights: '',
    turnSignal: '',
    wipers: '',
    cabinClimate: '',
    audioInfotainment: '',
    windows: '',
  };
}

export function createBlankScene(sceneNumber = 1): StoryboardScene {
  return {
    id: `scene-${Date.now()}-${sceneNumber}`,
    sceneNumber,
    title: `Scene 0${sceneNumber}`,
    durationSeconds: 4,
    description: '',
    characterAction: '',
    isLocked: false,
    imageUrl: '',
    promptFormat: 'universal',
    promptMediaType: 'video',
    modelTarget: 'universal',
    vehicle: createBlankVehicle(`v-scene-${sceneNumber}`),
    characters: [], // Starts empty per specifications
    drivingAction: createBlankDrivingAction(),
    activePanels: {
      vehicleDetail: false,
      character: false,
      cameraPro: false,
      locationDetail: false,
      vehicleAction: false,
      custom: false,
    },
    location: {
      id: `l-${sceneNumber}`,
      enabled: false, // Default switch OFF
      name: '',
      environmentType: '',
      isIndoor: false,
      atmosphere: '',
      timeOfDay: 'Siang Hari',
      weather: 'Cerah',
      lightingSources: '',
      roadSurface: '',
    },
    camera: {
      id: `cam-${sceneNumber}`,
      angle: 'Sejajar Mata (Eye Level)',
      motion: 'Diam (Static)',
      lensType: 'Standar',
      colorTone: 'Natural',
      cameraAngle: 'Eye Level',
      cameraShot: 'Medium Shot',
      cameraMotion: 'Static',
    },
    customInstruction: '',
  };
}

export function createBlankProject(name = 'CAR SCENE WORKSPACE'): ProjectState {
  const firstScene = createBlankScene(1);
  return {
    id: `proj-${Date.now()}`,
    schemaVersion: 2,
    projectName: name,
    storyboardName: 'Konsep Storyboard Otomotif',
    directorNotes: '',
    targetDurationSeconds: 15,
    aspectRatio: '16:9',
    durationOption: 'auto',
    mediaMode: 'video',
    promptLanguage: 'id',
    activeSceneId: firstScene.id,
    scenes: [firstScene],
    updatedAt: 'Baru dibuat',
    isTemplate: false,
  };
}

export const OPTIONAL_TEMPLATES: ProjectState[] = [];

export const INITIAL_PROJECTS: ProjectState[] = [
  createBlankProject('CAR SCENE WORKSPACE'),
];

export const INITIAL_PROJECT: ProjectState = INITIAL_PROJECTS[0];


