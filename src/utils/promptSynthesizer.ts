import {
  PromptFormat,
  PromptMediaType,
  PromptLanguage,
  PromptLang,
  StoryboardScene,
  CharacterConfig,
  ProjectState,
} from '../types';

/**
 * Membentuk 1 paragraf prompt utuh (Bahasa Indonesia atau English)
 * - Tanpa tanda kurung siku []
 * - Tanpa nilai default palsu
 * - Hanya menyertakan data yang memang diisi / switch aktif
 */
export function buildUnifiedPrompt(
  scene: StoryboardScene,
  project?: ProjectState,
  lang: PromptLang = 'id'
): string {
  const isVideo = project ? project.mediaMode === 'video' : scene.promptMediaType !== 'image';
  const ratio = project?.aspectRatio || '16:9';
  const durationOpt = project?.durationOption || 'auto';
  const sentences: string[] = [];

  // ==========================================
  // 1. KENDARAAN (VEHICLE)
  // ==========================================
  const { vehicle } = scene;
  const hasExtPhotos = Boolean(
    vehicle.exteriorPhotos?.front ||
      vehicle.exteriorPhotos?.rear ||
      vehicle.exteriorPhotos?.sideRight ||
      vehicle.exteriorPhotos?.sideLeft ||
      vehicle.exteriorPhotos?.threeQuarter ||
      vehicle.exteriorPhotos?.details ||
      (vehicle.exteriorPhotos?.extraPhotos && vehicle.exteriorPhotos.extraPhotos.length > 0)
  );
  const hasIntPhotos = Boolean(
    vehicle.interiorPhotos?.dashboard ||
      vehicle.interiorPhotos?.steeringWheel ||
      vehicle.interiorPhotos?.instrumentCluster ||
      vehicle.interiorPhotos?.centerConsole ||
      (vehicle.interiorPhotos?.extraPhotos && vehicle.interiorPhotos.extraPhotos.length > 0)
  );
  const hasAnyVehiclePhotos = hasExtPhotos || hasIntPhotos;

  const vehicleName =
    vehicle.name?.trim() ||
    [vehicle.year, vehicle.make, vehicle.model, vehicle.typeVariant].filter(Boolean).join(' ').trim();

  const isRHD =
    vehicle.steeringPosition?.includes('Kanan') || vehicle.steeringPosition?.includes('RHD');

  if (lang === 'id') {
    const vehParts: string[] = [];
    if (vehicleName) {
      vehParts.push(vehicleName);
    } else if (hasAnyVehiclePhotos) {
      vehParts.push('Kendaraan');
    }

    if (vehParts.length > 0) {
      if (hasAnyVehiclePhotos) {
        vehParts.push('sesuai foto referensi');
      }
      if (vehicle.paintColor?.trim()) {
        vehParts.push(`warna ${vehicle.paintColor.trim()}`);
      }
      if (vehicle.condition?.trim()) {
        vehParts.push(`kondisi ${vehicle.condition.trim()}`);
      }
      if (vehicle.licensePlate?.trim()) {
        vehParts.push(`pelat nomor "${vehicle.licensePlate.trim()}"`);
      }
      if (vehicle.steeringPosition) {
        vehParts.push(isRHD ? 'posisi setir kanan' : 'posisi setir kiri');
      }
      if (vehicle.transmission && vehicle.transmission !== 'Belum Ditentukan') {
        vehParts.push(`transmisi ${vehicle.transmission}`);
      }
      sentences.push(`Fokus utama ${vehParts.join(', ')}.`);
    }
  } else {
    // English
    const vehParts: string[] = [];
    if (vehicleName) {
      vehParts.push(vehicleName);
    } else if (hasAnyVehiclePhotos) {
      vehParts.push('Automotive vehicle');
    }

    if (vehParts.length > 0) {
      if (hasAnyVehiclePhotos) {
        vehParts.push('strictly matching reference photograph');
      }
      if (vehicle.paintColor?.trim()) {
        vehParts.push(`finished in ${vehicle.paintColor.trim()}`);
      }
      if (vehicle.condition?.trim()) {
        vehParts.push(`in ${vehicle.condition.trim()} condition`);
      }
      if (vehicle.licensePlate?.trim()) {
        vehParts.push(`bearing license plate "${vehicle.licensePlate.trim()}"`);
      }
      if (vehicle.steeringPosition) {
        vehParts.push(isRHD ? 'right-hand drive configuration' : 'left-hand drive configuration');
      }
      if (vehicle.transmission && vehicle.transmission !== 'Belum Ditentukan') {
        vehParts.push(`${vehicle.transmission} transmission`);
      }
      sentences.push(`Hero subject: ${vehParts.join(', ')}.`);
    }
  }

  // ==========================================
  // 2. KARAKTER & POSISI DUDUK (MAX 3)
  // ==========================================
  const characters: CharacterConfig[] = (
    Array.isArray(scene.characters) && scene.characters.length > 0
      ? scene.characters
      : scene.character
      ? [scene.character]
      : []
  ).slice(0, 3);

  const activeCharacters = characters.filter(
    (c) =>
      c.imageUrl ||
      c.name?.trim() ||
      c.seatingPosition ||
      (c.poseEnabled && c.pose?.trim()) ||
      (c.expressionEnabled && c.expression?.trim()) ||
      (c.dialogEnabled && c.dialog?.trim()) ||
      c.attire?.trim()
  );

  activeCharacters.forEach((c, index) => {
    const num = index + 1;
    if (lang === 'id') {
      const parts: string[] = [];
      const charName = c.name?.trim() ? `Karakter ${num} (${c.name.trim()})` : `Karakter ${num}`;
      parts.push(charName);

      if (c.imageUrl) {
        parts.push(`sesuai persis foto referensi ${num}`);
      }
      if (c.seatingPosition) {
        parts.push(`duduk di ${c.seatingPosition}`);
      }
      if (c.poseEnabled && c.pose?.trim()) {
        parts.push(`pose ${c.pose.trim()}`);
      }
      if (c.expressionEnabled && c.expression?.trim()) {
        parts.push(`ekspresi ${c.expression.trim()}`);
      }
      if (c.attire?.trim()) {
        parts.push(`mengenakan ${c.attire.trim()}`);
      }

      sentences.push(`${parts.join(', ')}.`);

      if (c.dialogEnabled && c.dialog?.trim()) {
        sentences.push(`${charName} berkata: "${c.dialog.trim()}".`);
      }
    } else {
      // English
      const parts: string[] = [];
      const charName = c.name?.trim() ? `Character ${num} (${c.name.trim()})` : `Character ${num}`;
      parts.push(charName);

      if (c.imageUrl) {
        parts.push(`strictly matching reference photo ${num}`);
      }
      if (c.seatingPosition) {
        parts.push(`seated at ${c.seatingPosition}`);
      }
      if (c.poseEnabled && c.pose?.trim()) {
        parts.push(`pose: ${c.pose.trim()}`);
      }
      if (c.expressionEnabled && c.expression?.trim()) {
        parts.push(`facial expression: ${c.expression.trim()}`);
      }
      if (c.attire?.trim()) {
        parts.push(`wearing ${c.attire.trim()}`);
      }

      sentences.push(`${parts.join(', ')}.`);

      if (c.dialogEnabled && c.dialog?.trim()) {
        sentences.push(`${charName} says: "${c.dialog.trim()}".`);
      }
    }
  });

  // ==========================================
  // 3. AKSI KENDARAAN (HANYA JIKA DIAKTIFKAN)
  // ==========================================
  const act = scene.drivingAction;
  if (act && act.enabled) {
    const actionParts: string[] = [];
    if (act.entrySequence?.trim()) actionParts.push(act.entrySequence.trim());
    if (act.engineStatus?.trim()) actionParts.push(act.engineStatus.trim());
    if (act.maneuver?.trim()) actionParts.push(act.maneuver.trim());
    if (act.estimatedSpeed?.trim()) actionParts.push(act.estimatedSpeed.trim());
    if (act.activeGear?.trim()) actionParts.push(`gigi ${act.activeGear.trim()}`);
    if (act.headlights && act.headlights !== 'Mati') actionParts.push(`lampu ${act.headlights}`);

    if (actionParts.length > 0) {
      if (lang === 'id') {
        sentences.push(`Dinamika berkendara: ${actionParts.join(', ')}.`);
      } else {
        sentences.push(`Vehicle dynamics: ${actionParts.join(', ')}.`);
      }
    }
  }

  // ==========================================
  // 4. LOKASI & CUACA (HANYA JIKA SAKLAR AKTIF)
  // ==========================================
  const loc = scene.location;
  if (loc && loc.enabled) {
    if (lang === 'id') {
      const locParts: string[] = [];
      const place = loc.name?.trim() || loc.environmentType?.trim() || '';
      if (loc.isIndoor) {
        locParts.push('Area dalam ruangan');
        if (place) locParts.push(`di ${place}`);
        if (loc.atmosphere?.trim()) locParts.push(`suasana ${loc.atmosphere.trim()}`);
        if (loc.lightingSources?.trim()) locParts.push(`pencahayaan ${loc.lightingSources.trim()}`);
      } else {
        if (place) locParts.push(`Lokasi di ${place}`);
        if (loc.timeOfDay?.trim()) locParts.push(`waktu ${loc.timeOfDay.trim()}`);
        if (loc.weather?.trim()) locParts.push(`cuaca ${loc.weather.trim()}`);
        if (loc.roadSurface?.trim()) locParts.push(`permukaan jalan ${loc.roadSurface.trim()}`);
        if (loc.atmosphere?.trim()) locParts.push(`suasana ${loc.atmosphere.trim()}`);
      }
      if (locParts.length > 0) {
        sentences.push(`${locParts.join(', ')}.`);
      }
    } else {
      // English
      const locParts: string[] = [];
      const place = loc.name?.trim() || loc.environmentType?.trim() || '';
      if (loc.isIndoor) {
        locParts.push('Indoor setting');
        if (place) locParts.push(`at ${place}`);
        if (loc.atmosphere?.trim()) locParts.push(`atmosphere: ${loc.atmosphere.trim()}`);
        if (loc.lightingSources?.trim()) locParts.push(`lighting: ${loc.lightingSources.trim()}`);
      } else {
        if (place) locParts.push(`Location at ${place}`);
        if (loc.timeOfDay?.trim()) locParts.push(`time: ${loc.timeOfDay.trim()}`);
        if (loc.weather?.trim()) locParts.push(`weather: ${loc.weather.trim()}`);
        if (loc.roadSurface?.trim()) locParts.push(`road surface: ${loc.roadSurface.trim()}`);
        if (loc.atmosphere?.trim()) locParts.push(`atmosphere: ${loc.atmosphere.trim()}`);
      }
      if (locParts.length > 0) {
        sentences.push(`${locParts.join(', ')}.`);
      }
    }
  }

  // ==========================================
  // 5. KAMERA & SINEMATOGRAFI
  // ==========================================
  const cam = scene.camera;
  if (cam) {
    const camAngle = cam.angle || cam.cameraAngle || '';
    const camMotion = cam.motion || cam.cameraMotion || '';
    const lens = cam.lensType || '';
    const color = cam.colorTone || '';

    if (lang === 'id') {
      const camParts: string[] = [];
      if (camAngle) camParts.push(`sudut kamera ${camAngle}`);
      if (camMotion) camParts.push(`pergerakan ${camMotion}`);
      if (lens) camParts.push(`lensa ${lens}`);
      if (color) camParts.push(`tone warna ${color}`);
      if (camParts.length > 0) {
        sentences.push(`Sinematografi: ${camParts.join(', ')}.`);
      }
    } else {
      const camParts: string[] = [];
      if (camAngle) camParts.push(`camera angle ${camAngle}`);
      if (camMotion) camParts.push(`camera movement: ${camMotion}`);
      if (lens) camParts.push(`${lens} lens`);
      if (color) camParts.push(`${color} color tone`);
      if (camParts.length > 0) {
        sentences.push(`Cinematography: ${camParts.join(', ')}.`);
      }
    }
  }

  // ==========================================
  // 6. NARASI ADEGAN (REFINER / CERITAKAN ADEGAN)
  // ==========================================
  if (scene.description?.trim()) {
    sentences.push(scene.description.trim());
  }

  // ==========================================
  // 7. RASIO ASPEK & DURASI
  // ==========================================
  if (lang === 'id') {
    sentences.push(`Rasio aspek ${ratio}.`);
    if (isVideo && durationOpt !== 'auto') {
      const durSeconds =
        typeof durationOpt === 'number'
          ? durationOpt
          : project?.customDurationSeconds || scene.durationSeconds || 4;
      sentences.push(`Durasi adegan ${durSeconds} detik.`);
    }
  } else {
    sentences.push(`Aspect ratio ${ratio}.`);
    if (isVideo && durationOpt !== 'auto') {
      const durSeconds =
        typeof durationOpt === 'number'
          ? durationOpt
          : project?.customDurationSeconds || scene.durationSeconds || 4;
      sentences.push(`Sequence duration ${durSeconds} seconds.`);
    }
  }

  // ==========================================
  // 8. INSTRUKSI TAMBAHAN (CUSTOM PANEL)
  // ==========================================
  if (scene.customInstruction?.trim()) {
    sentences.push(scene.customInstruction.trim());
  }

  // Gabungkan menjadi 1 paragraf mengalir yang rapi
  return sentences.join(' ').replace(/\s{2,}/g, ' ').trim();
}

/**
 * Backward compatibility functions
 */
export function buildAutomotivePrompt(
  scene: StoryboardScene,
  format: PromptFormat = 'universal',
  mediaType: PromptMediaType = 'video',
  lang: PromptLanguage = 'en'
): string {
  // Map to unified prompt builder
  const mockProject: ProjectState = {
    id: 'mock',
    projectName: 'Temp',
    aspectRatio: (scene.camera?.aspectRatio as any) || '16:9',
    durationOption: scene.durationSeconds || 'auto',
    mediaMode: mediaType,
    promptLanguage: lang,
    activeSceneId: scene.id,
    scenes: [scene],
  };

  return buildUnifiedPrompt(scene, mockProject, lang);
}

export function buildAutomotiveImagePrompt(
  scene: StoryboardScene,
  lang: PromptLanguage = 'en'
): string {
  return buildAutomotivePrompt(scene, 'universal', 'image', lang);
}

export function buildAutomotiveVideoPrompt(
  scene: StoryboardScene,
  format: PromptFormat = 'universal',
  lang: PromptLanguage = 'en'
): string {
  return buildAutomotivePrompt(scene, format, 'video', lang);
}

export function buildStructuredJsonPrompt(scene: StoryboardScene): string {
  return JSON.stringify(
    {
      sceneNumber: scene.sceneNumber,
      title: scene.title,
      durationSeconds: scene.durationSeconds,
      vehicle: scene.vehicle,
      characters: scene.characters,
      location: scene.location,
      camera: scene.camera,
      prompts: {
        indonesia: buildUnifiedPrompt(scene, undefined, 'id'),
        english: buildUnifiedPrompt(scene, undefined, 'en'),
      },
    },
    null,
    2
  );
}

export function getNegativePrompt(
  mediaType: PromptMediaType = 'video',
  lang: PromptLanguage = 'en'
): string {
  if (lang === 'id') {
    if (mediaType === 'video') {
      return 'animasi murahan, kartun, mobil mainan plastik, bodi mobil melengkung, roda meleleh, setir di sisi yang salah, kabin terdistorsi, wajah karakter berganti rupa, mata guling ganjil, fisika melayang, glitch, getaran berlebihan, logo kabur, teks acak';
    }
    return 'kartun, 3d render murahan, bodi mobil tidak wajar, proporsi kendaraan salah, roda tidak bulat, pelek meleleh, setir terbalik, wajah karakter tidak konsisten, anatomi tangan rusak, buram, noise berlebihan, teks acak, watermark';
  }

  if (mediaType === 'video') {
    return 'cartoon, low-budget cgi, plastic toy vehicle, deformed automotive chassis, morphing car body, wrong steering wheel side, rubber tire stretching, melting rims, unnatural floating physics, distorted cabin dashboard, character face changing between frames, mutant hands, extra limbs, jitter, temporal stutter, flickering lights, random floating letters, watermark';
  }

  return 'cartoon, illustration, 3d render, distorted vehicle proportions, melted rims, wrong steering placement, mangled dashboard controls, deformed character face, anatomical distortion, extra fingers, oversaturated, blurry, grainy, out of focus, low resolution, watermark, signature';
}
