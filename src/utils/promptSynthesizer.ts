import { AIModelTarget, StoryboardScene } from '../types';

/**
 * Membentuk deskripsi kendaraan yang akurat dan jujur terhadap referensi foto,
 * mencantumkan posisi setir (RHD/LHD), transmisi, plat nomor kustom,
 * serta fitur terverifikasi tanpa halusinasi.
 */
function getVehicleDescription(scene: StoryboardScene, lang: 'en' | 'id' = 'en'): string {
  const { vehicle } = scene;
  const isRHD = vehicle.steeringPosition?.includes('Kanan') || vehicle.steeringPosition?.includes('RHD');
  const steeringText = lang === 'en'
    ? (isRHD ? 'right-hand drive (RHD) cockpit' : 'left-hand drive (LHD) cockpit')
    : (isRHD ? 'setir kanan (RHD Indonesia)' : 'setir kiri (LHD)');

  const makeModel = [vehicle.year, vehicle.make, vehicle.model, vehicle.typeVariant].filter(Boolean).join(' ') || 'Automotive vehicle';
  const colorPart = vehicle.paintColor ? (lang === 'en' ? `in ${vehicle.paintColor}` : `warna ${vehicle.paintColor}`) : '';
  const platePart = vehicle.licensePlate ? (lang === 'en' ? `with license plate "${vehicle.licensePlate}"` : `dengan plat nomor "${vehicle.licensePlate}"`) : '';
  const transPart = vehicle.transmission && vehicle.transmission !== 'Belum Ditentukan'
    ? (lang === 'en' ? `${vehicle.transmission} transmission` : `transmisi ${vehicle.transmission}`)
    : '';

  const verified = (vehicle.verifiedFeaturesFromReference || []).slice(0, 4);
  const verifiedStr = verified.length > 0
    ? (lang === 'en' ? `features: ${verified.join(', ')}` : `fitur terverifikasi: ${verified.join(', ')}`)
    : '';

  const parts = [
    `${makeModel} (${vehicle.category || 'Automotive'})`,
    colorPart,
    steeringText,
    transPart,
    platePart,
    verifiedStr,
  ].filter(Boolean);

  return parts.join(', ');
}

export function buildAutomotivePrompt(
  scene: StoryboardScene,
  targetModel: AIModelTarget = 'universal',
  lang: 'en' | 'id' = 'en'
): string {
  const { vehicle, character, location, camera } = scene;
  const vehDesc = getVehicleDescription(scene, lang);

  if (lang === 'id') {
    const charDesc = character.name ? `Pengemudi ${character.name} (${character.role || 'pengemudi'}) dengan setelan ${character.attire || 'rapi'}, ekspresi ${character.expression || 'tenang'}.` : '';
    const locDesc = `Lokasi ${location.environmentType} pada waktu ${location.timeOfDay}, cuaca ${location.weather}, permukaan jalan ${location.roadSurface}.`;
    const camDesc = `Kamera menggunakan rig ${camera.rigType}, lensa ${camera.focalLength}, gerakan ${camera.cameraMotion}, rasio aspek ${camera.aspectRatio}.`;
    const customNotes = scene.customPromptEnhancer ? ` ${scene.customPromptEnhancer}` : '';

    return `Adegan sinematik otomotif: ${vehDesc}. ${charDesc} ${locDesc} ${camDesc}. Pencahayaan alami dan pantulan bodi kendaraan akurat.${customNotes}`;
  }

  // English generation optimized per model
  const customNotes = scene.customPromptEnhancer ? ` ${scene.customPromptEnhancer}` : '';
  const charDesc = character.name
    ? `Driver: ${character.name} (${character.role}), attire: ${character.attire || 'casual'}, expression: ${character.expression || 'focused'}.`
    : '';
  const locDesc = `Environment: ${location.environmentType}, time: ${location.timeOfDay}, weather: ${location.weather}, surface: ${location.roadSurface}.`;
  const camDesc = `Camera rig: ${camera.rigType}, focal length: ${camera.focalLength}, motion: ${camera.cameraMotion}, grading: ${camera.colorGrading}.`;

  switch (targetModel) {
    case 'universal':
      return `Cinematic automotive sequence featuring ${vehDesc}. ${charDesc} ${locDesc} ${camDesc}. Accurate specular automotive reflections, genuine cabin controls layout, clean depth of field, 4k master cinematography.${customNotes}`;

    case 'custom':
      return `[Vehicle]: ${vehDesc} | [Location]: ${location.environmentType}, ${location.timeOfDay} | [Optics]: ${camera.focalLength}, ${camera.cameraMotion} | [Lighting]: ${location.lightingSources}.${customNotes}`;

    case 'kling':
      return `Masterpiece 8k cinematic automotive film, ${vehDesc}. Smooth vehicle movement along ${location.environmentType}. ${charDesc} Shot on ${camera.focalLength} anamorphic lens, ${camera.cameraMotion}. Realistic road surface texture, dynamic tire interaction, crisp motion blur, photorealistic car commercial visual.${customNotes}`;

    case 'runway':
      return `[Camera Tracking]: ${camera.cameraMotion}, ${camera.rigType}. [Subject]: ${vehDesc}. [Environment]: ${location.environmentType}, ${location.timeOfDay}, ${location.weather}. [Lighting]: ${location.lightingSources}, photorealistic automotive broadcast commercial, consistent vehicular geometry.${customNotes}`;

    case 'sora':
      return `Cinematic automotive sequence of ${vehDesc}. ${charDesc} ${locDesc} Shot with ${camera.rigType} executing ${camera.cameraMotion}. True-to-life reflections on automotive paint finish, accurate cabin perspective, highly stable tracking camera, 8k film resolution.${customNotes}`;

    case 'luma':
      return `Photorealistic cinematic action shot of ${vehDesc} moving through ${location.environmentType}. Smooth ${camera.cameraMotion} on ${camera.rigType}. Natural daylight and reflections, authentic cockpit ergonomics, 24fps film grain.${customNotes}`;

    case 'veo':
      return `Google Veo cinematic automotive shot: ${vehDesc}. Moving through ${location.environmentType} during ${location.timeOfDay}. Smooth cinematic camera tracking, authentic automotive materials, accurate vehicle interior ergonomics.${customNotes}`;

    case 'flux':
      return `Editorial automotive still photograph, ${vehDesc} positioned at ${location.environmentType}. Natural daylight, ${location.weather}. Captured on 35mm film camera with ${camera.focalLength} lens, ${camera.colorGrading} grading, razor sharp details, commercial automotive lookbook.${customNotes}`;

    case 'midjourney':
      return `Editorial automotive photography of ${vehDesc}, ${location.environmentType}, ${location.timeOfDay}, cinematic lighting, shot on 35mm lens, f/2.8, color graded, ultra-detailed --ar ${camera.aspectRatio?.replace(':', '/') || '16/9'} --v 6.1 --style raw`;

    default:
      return `Cinematic automotive capture of ${vehDesc}. ${locDesc} ${camDesc}.${customNotes}`;
  }
}

export function buildAutomotiveImagePrompt(scene: StoryboardScene, lang: 'en' | 'id' = 'en'): string {
  return buildAutomotivePrompt(scene, 'flux', lang);
}

export function buildAutomotiveVideoPrompt(
  scene: StoryboardScene,
  targetModel: AIModelTarget = 'universal',
  lang: 'en' | 'id' = 'en'
): string {
  return buildAutomotivePrompt(scene, targetModel, lang);
}

export function buildStructuredJsonPrompt(scene: StoryboardScene): string {
  return JSON.stringify(
    {
      sceneNumber: scene.sceneNumber,
      title: scene.title,
      durationSeconds: scene.durationSeconds,
      vehicle: {
        category: scene.vehicle.category,
        make: scene.vehicle.make,
        model: scene.vehicle.model,
        year: scene.vehicle.year,
        typeVariant: scene.vehicle.typeVariant,
        color: scene.vehicle.paintColor,
        licensePlate: scene.vehicle.licensePlate,
        steeringPosition: scene.vehicle.steeringPosition,
        ignitionSystem: scene.vehicle.ignitionSystem,
        transmission: scene.vehicle.transmission,
        parkingBrake: scene.vehicle.parkingBrake,
        engineType: scene.vehicle.engineType,
        driveType: scene.vehicle.driveType,
        verifiedFeatures: scene.vehicle.verifiedFeaturesFromReference || [],
        manualSpecs: scene.vehicle.manualKnownFeatures || [],
        unverifiedNotes: scene.vehicle.unverifiedNotes || '',
      },
      character: scene.character,
      location: scene.location,
      camera: scene.camera,
      generatedPromptEn: buildAutomotivePrompt(scene, scene.modelTarget, 'en'),
      generatedPromptId: buildAutomotivePrompt(scene, scene.modelTarget, 'id'),
      negativePrompt: getNegativePrompt(scene.modelTarget, 'en'),
    },
    null,
    2
  );
}

export function getNegativePrompt(targetModel: AIModelTarget = 'universal', lang: 'en' | 'id' = 'en'): string {
  if (lang === 'id') {
    return 'animasi murah, kartun, mobil mainan plastik, pelek roda melengkung tidak wajar, fisika mustahil, mobil melayang, setir di posisi terbalik yang salah, interior terdistorsi, wajah cacat, glitch';
  }

  const baseNegative =
    'cgi, cartoon, plastic toy car, distorted vehicle body proportions, wrong steering wheel side (incorrect RHD/LHD placement), unnatural wheel rotation, deformed rims, floating car, messy cockpit controls, distorted car badge, blurry, oversaturated, unrealistic smoke';

  switch (targetModel) {
    case 'kling':
    case 'runway':
      return `${baseNegative}, glitch, jitter, temporal tearing, unnatural rubber tire stretching`;
    case 'sora':
      return `${baseNegative}, unnatural camera speed, artificial plastic reflections, morphing chassis`;
    default:
      return baseNegative;
  }
}
