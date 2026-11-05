import JSZip from 'jszip';
import { ProjectState } from '../types';
import { buildUnifiedPrompt, getNegativePrompt } from './promptSynthesizer';
import { getImageFromStore } from './imageStore';

/**
 * Mengonversi base64 data URL ke Uint8Array untuk JSZip
 */
function dataUrlToUint8Array(dataUrl: string): { data: Uint8Array; extension: string } {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  let extension = 'jpg';
  if (mime.includes('png')) extension = 'png';
  else if (mime.includes('webp')) extension = 'webp';

  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return { data: bytes, extension };
}

/**
 * Export project prompts and references as a clean ZIP
 * - prompts_indonesia.txt
 * - prompts_english.txt
 * - referensi/ (vehicle and character reference images)
 * - catatan.txt
 * - NO JSON FILES
 */
export async function downloadProjectZip(project: ProjectState): Promise<void> {
  const zip = new JSZip();

  // 1. Text prompts Indonesia
  const linesId: string[] = [
    `==================================================`,
    `CAR SCENE WORKSPACE - DAFTAR PROMPT (INDONESIA)`,
    `Proyek: ${project.projectName}`,
    `Rasio Aspek: ${project.aspectRatio}`,
    `Mode: ${project.mediaMode === 'video' ? 'Video' : 'Gambar'}`,
    `Total Scene: ${project.scenes.length}`,
    `Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID')}`,
    `==================================================\n`,
  ];

  project.scenes.forEach((scene, idx) => {
    const promptText = scene.manualPromptId || buildUnifiedPrompt(scene, project, 'id');
    linesId.push(
      `--------------------------------------------------`,
      `SCENE 0${scene.sceneNumber}: ${scene.title || `Adegan 0${scene.sceneNumber}`}`,
      `--------------------------------------------------`,
      promptText,
      `\n`
    );
  });

  linesId.push(
    `==================================================`,
    `NEGATIVE PROMPT (INDONESIA):`,
    getNegativePrompt(project.mediaMode, 'id'),
    `==================================================`
  );

  zip.file('prompts_indonesia.txt', linesId.join('\n'));

  // 2. Text prompts English
  const linesEn: string[] = [
    `==================================================`,
    `CAR SCENE WORKSPACE - PROMPT LIST (ENGLISH)`,
    `Project: ${project.projectName}`,
    `Aspect Ratio: ${project.aspectRatio}`,
    `Mode: ${project.mediaMode === 'video' ? 'Video' : 'Still Image'}`,
    `Total Scenes: ${project.scenes.length}`,
    `Export Date: ${new Date().toISOString().split('T')[0]}`,
    `==================================================\n`,
  ];

  project.scenes.forEach((scene, idx) => {
    const promptText = scene.manualPromptEn || buildUnifiedPrompt(scene, project, 'en');
    linesEn.push(
      `--------------------------------------------------`,
      `SCENE 0${scene.sceneNumber}: ${scene.title || `Scene 0${scene.sceneNumber}`}`,
      `--------------------------------------------------`,
      promptText,
      `\n`
    );
  });

  linesEn.push(
    `==================================================`,
    `NEGATIVE PROMPT (ENGLISH):`,
    getNegativePrompt(project.mediaMode, 'en'),
    `==================================================`
  );

  zip.file('prompts_english.txt', linesEn.join('\n'));

  // 3. Catatan proyek
  const notesText = [
    `Proyek: ${project.projectName}`,
    `Durasi per scene: ${project.durationOption === 'auto' ? 'Otomatis' : `${project.durationOption} detik`}`,
    `Rasio Aspek: ${project.aspectRatio}`,
    `Mode: ${project.mediaMode}`,
    `Bahasa Standar: ${project.promptLanguage.toUpperCase()}`,
    `\nCatatan Penting:`,
    `- Gunakan prompt di atas langsung pada generator AI pilihan Anda.`,
    `- Samakan rasio aspek di generator AI dengan rasio aspek di dokumen ini (${project.aspectRatio}).`,
    `- Folder referensi berisi foto acuan untuk menjaga konsistensi bodi kendaraan, kabin, dan karakter.`,
  ].join('\n');

  zip.file('catatan.txt', notesText);

  // 4. Folder referensi (Foto kendaraan & karakter)
  const refFolder = zip.folder('referensi');
  if (refFolder) {
    const savedKeys = new Set<string>();

    for (const scene of project.scenes) {
      // Exterior photos
      const ext = scene.vehicle.exteriorPhotos || {};
      const extSlots: [string, string | undefined][] = [
        ['eksterior_depan', ext.front],
        ['eksterior_belakang', ext.rear],
        ['eksterior_samping_kanan', ext.sideRight],
        ['eksterior_samping_kiri', ext.sideLeft],
        ['eksterior_tiga_perempat', ext.threeQuarter],
        ['eksterior_detail', ext.details],
      ];

      for (const [slotName, refVal] of extSlots) {
        if (refVal && !savedKeys.has(refVal)) {
          savedKeys.add(refVal);
          try {
            const dataUrl = await getImageFromStore(refVal);
            if (dataUrl && dataUrl.startsWith('data:')) {
              const { data, extension } = dataUrlToUint8Array(dataUrl);
              refFolder.file(`${slotName}_sc${scene.sceneNumber}.${extension}`, data);
            }
          } catch (e) {
            console.error('Failed to include image in zip', e);
          }
        }
      }

      // Interior photos
      const intPhotos = scene.vehicle.interiorPhotos || {};
      const intSlots: [string, string | undefined][] = [
        ['interior_dashboard', intPhotos.dashboard],
        ['interior_setir', intPhotos.steeringWheel],
        ['interior_instrumen', intPhotos.instrumentCluster],
        ['interior_konsol_tengah', intPhotos.centerConsole],
        ['interior_tuas_transmisi', intPhotos.gearShifter],
        ['interior_jok', intPhotos.driverAndPassengerSeats],
      ];

      for (const [slotName, refVal] of intSlots) {
        if (refVal && !savedKeys.has(refVal)) {
          savedKeys.add(refVal);
          try {
            const dataUrl = await getImageFromStore(refVal);
            if (dataUrl && dataUrl.startsWith('data:')) {
              const { data, extension } = dataUrlToUint8Array(dataUrl);
              refFolder.file(`${slotName}_sc${scene.sceneNumber}.${extension}`, data);
            }
          } catch (e) {
            console.error('Failed to include interior image in zip', e);
          }
        }
      }

      // Characters
      const characters = scene.characters || [];
      for (let cIdx = 0; cIdx < characters.length; cIdx++) {
        const char = characters[cIdx];
        if (char.imageUrl && !savedKeys.has(char.imageUrl)) {
          savedKeys.add(char.imageUrl);
          try {
            const dataUrl = await getImageFromStore(char.imageUrl);
            if (dataUrl && dataUrl.startsWith('data:')) {
              const { data, extension } = dataUrlToUint8Array(dataUrl);
              const charName = char.name?.trim().replace(/[^a-zA-Z0-9]/g, '_') || `karakter_${cIdx + 1}`;
              refFolder.file(`${charName}_sc${scene.sceneNumber}.${extension}`, data);
            }
          } catch (e) {
            console.error('Failed to include character image in zip', e);
          }
        }
      }
    }
  }

  // Generate and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  const sanitizedName = project.projectName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const filename = `${sanitizedName || 'car_scene'}_prompts.zip`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
