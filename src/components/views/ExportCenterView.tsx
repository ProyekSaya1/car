import { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  FileCode,
  FileText,
  Terminal,
  Layers,
  Sparkles,
  Archive,
  Info,
  Images,
  AlertCircle,
} from 'lucide-react';
import JSZip from 'jszip';
import { ProjectState, ViewMode, CharacterConfig } from '../../types';
import { buildAutomotivePrompt, getNegativePrompt } from '../../utils/promptSynthesizer';
import { getImage } from '../../utils/imageStore';
import { ModuleHeader } from '../layout/ModuleHeader';

interface ExportCenterViewProps {
  project: ProjectState;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
  onNavigate?: (view: ViewMode) => void;
}

export function ExportCenterView({ project, onShowToast, onNavigate }: ExportCenterViewProps) {
  const [exportFormat, setExportFormat] = useState<'zip' | 'txt'>('zip');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const totalRuntime = project.scenes.reduce((acc, s) => acc + s.durationSeconds, 0);

  // Helper to extract character list
  const getSceneCharacters = (characters?: CharacterConfig[], character?: CharacterConfig): CharacterConfig[] => {
    if (Array.isArray(characters) && characters.length > 0) return characters;
    if (character) return [character];
    return [];
  };

  // Generate TXT / Plain Text Document
  const generateTXT = () => {
    let txt = `=======================================================================\n`;
    txt += `CAR SCENE ENGINE V2.0 - DOKUMEN PRODUKSI STORYBOARD & PROMPT SINEMATIK\n`;
    txt += `=======================================================================\n\n`;
    txt += `NAMA PROYEK     : ${project.projectName.toUpperCase()}\n`;
    txt += `TOTAL SCENE     : ${project.scenes.length} Scene\n`;
    txt += `TOTAL DURASI    : ${totalRuntime} Detik (Target: ${project.targetDurationSeconds || 15} dtk)\n`;
    txt += `CATATAN PRODUKSI: ${project.directorNotes || 'Tidak ada catatan sutradara.'}\n\n`;
    txt += `CATATAN PENTING :\n`;
    txt += `File prompt yang diekspor adalah panduan teks sinematik untuk dimasukkan\n`;
    txt += `ke platform pembuatan gambar atau video pilihan Anda. Aplikasi ini tidak\n`;
    txt += `merender video secara langsung.\n\n`;
    txt += `-----------------------------------------------------------------------\n\n`;

    project.scenes.forEach((scene) => {
      const chars = getSceneCharacters(scene.characters, scene.character);
      const charsStr =
        chars
          .map((c, i) => `#${i + 1} ${c.name || 'Karakter'} (${c.role || '-'}, ${c.seatingPosition || '-'})`)
          .join('; ') || 'Tanpa Karakter Khusus';

      const promptId =
        scene.isPromptManuallyEdited && scene.manualPromptId
          ? scene.manualPromptId
          : buildAutomotivePrompt(scene, scene.promptFormat || 'universal', scene.promptMediaType || 'video', 'id');

      const promptEn =
        scene.isPromptManuallyEdited && scene.manualPromptEn
          ? scene.manualPromptEn
          : buildAutomotivePrompt(scene, scene.promptFormat || 'universal', scene.promptMediaType || 'video', 'en');

      const customPrompt = buildAutomotivePrompt(scene, 'custom', scene.promptMediaType || 'video', 'en');
      const negPrompt = getNegativePrompt(scene.promptMediaType || 'video', 'en');

      txt += `SCENE 0${scene.sceneNumber}: ${scene.title.toUpperCase()}\n`;
      txt += `-----------------------------------------------------------------------\n`;
      txt += `Durasi            : ${scene.durationSeconds} detik\n`;
      txt += `Status Terkunci   : ${scene.isLocked ? 'YA (Terkunci)' : 'TIDAK'}\n`;
      txt += `Status Prompt     : ${scene.isPromptManuallyEdited ? 'Diedit Manual' : 'Otomatis'}\n`;
      txt += `Kendaraan         : ${scene.vehicle.year || ''} ${scene.vehicle.make || ''} ${scene.vehicle.model || ''} (${scene.vehicle.category}) | Warna: ${scene.vehicle.paintColor || 'Bebas'} | Plat: ${scene.vehicle.licensePlate || '-'}\n`;
      txt += `Karakter          : ${charsStr}\n`;
      if (scene.drivingAction) {
        txt += `Aksi Kendaraan    : ${scene.drivingAction.maneuver} | Kecepatan: ${scene.drivingAction.estimatedSpeed} | Mesin: ${scene.drivingAction.engineStatus} | Gigi: ${scene.drivingAction.activeGear}\n`;
      }
      txt += `Lokasi            : ${scene.location.isIndoor ? 'Indoor' : 'Outdoor'} - ${scene.location.environmentType || 'Area Otomotif'} (${scene.location.timeOfDay}, ${scene.location.weather})\n`;
      txt += `Sinematografi     : Angle: ${scene.camera.cameraAngle || 'Eye Level'} | Shot: ${scene.camera.cameraShot || 'Medium'} | Lensa: ${scene.camera.focalLength} | Gerak: ${scene.camera.cameraMotion}\n`;
      if (scene.description) {
        txt += `Deskripsi Adegan  : ${scene.description}\n`;
      }
      txt += `\n[PROMPT BAHASA INDONESIA]:\n${promptId}\n\n`;
      txt += `[PROMPT ENGLISH]:\n${promptEn}\n\n`;
      txt += `[CUSTOM PROMPT (TAGS)]:\n${customPrompt}\n\n`;
      txt += `[NEGATIVE PROMPT]:\n${negPrompt}\n\n`;
      txt += `=======================================================================\n\n`;
    });

    return txt;
  };

  // Generate JSON
  const generateJSON = () => {
    const exportData = {
      project: project.projectName,
      version: '2.0',
      schemaVersion: project.schemaVersion || 2,
      totalRuntimeSeconds: totalRuntime,
      targetDurationSeconds: project.targetDurationSeconds || 15,
      directorNotes: project.directorNotes,
      exportedAt: new Date().toISOString(),
      disclaimer:
        'File prompt yang diekspor adalah panduan teks sinematik untuk dimasukkan ke platform pembuatan gambar atau video pilihan Anda. Aplikasi ini tidak merender video secara langsung.',
      scenes: project.scenes.map((s) => ({
        sceneNumber: s.sceneNumber,
        title: s.title,
        durationSeconds: s.durationSeconds,
        isLocked: Boolean(s.isLocked),
        isPromptManuallyEdited: Boolean(s.isPromptManuallyEdited),
        description: s.description,
        characterAction: s.characterAction || '',
        drivingAction: s.drivingAction || null,
        vehicle: s.vehicle,
        characters: getSceneCharacters(s.characters, s.character),
        location: s.location,
        camera: s.camera,
        prompts: {
          promptId:
            s.isPromptManuallyEdited && s.manualPromptId
              ? s.manualPromptId
              : buildAutomotivePrompt(s, s.promptFormat || 'universal', s.promptMediaType || 'video', 'id'),
          promptEn:
            s.isPromptManuallyEdited && s.manualPromptEn
              ? s.manualPromptEn
              : buildAutomotivePrompt(s, s.promptFormat || 'universal', s.promptMediaType || 'video', 'en'),
          customPromptEn: buildAutomotivePrompt(s, 'custom', s.promptMediaType || 'video', 'en'),
          negativePrompt: getNegativePrompt(s.promptMediaType || 'video', 'en'),
        },
      })),
    };
    return JSON.stringify(exportData, null, 2);
  };

  // Generate CSV
  const generateCSV = () => {
    const headers = [
      'Nomor Scene',
      'Judul Scene',
      'Durasi (dtk)',
      'Status Lock',
      'Kendaraan',
      'Plat Nomor',
      'Karakter',
      'Aksi Kendaraan',
      'Lokasi',
      'Kamera',
      'Deskripsi Adegan',
      'Prompt Bahasa Indonesia',
      'Prompt English',
      'Negative Prompt',
    ];

    const escape = (str?: string) => `"${(str || '').replace(/"/g, '""')}"`;

    const rows = project.scenes.map((s) => {
      const chars = getSceneCharacters(s.characters, s.character);
      const charStr = chars.map((c) => c.name || c.role).filter(Boolean).join('; ');
      const pId =
        s.isPromptManuallyEdited && s.manualPromptId
          ? s.manualPromptId
          : buildAutomotivePrompt(s, s.promptFormat || 'universal', s.promptMediaType || 'video', 'id');
      const pEn =
        s.isPromptManuallyEdited && s.manualPromptEn
          ? s.manualPromptEn
          : buildAutomotivePrompt(s, s.promptFormat || 'universal', s.promptMediaType || 'video', 'en');

      return [
        s.sceneNumber,
        escape(s.title),
        s.durationSeconds,
        s.isLocked ? 'Terkunci' : 'Terbuka',
        escape(`${s.vehicle.make} ${s.vehicle.model} (${s.vehicle.category})`),
        escape(s.vehicle.licensePlate),
        escape(charStr || 'Tanpa Karakter'),
        escape(s.drivingAction ? `${s.drivingAction.maneuver} (${s.drivingAction.estimatedSpeed})` : ''),
        escape(s.location.environmentType),
        escape(`${s.camera.cameraShot || ''} ${s.camera.cameraMotion}`),
        escape(s.description),
        escape(pId),
        escape(pEn),
        escape(getNegativePrompt(s.promptMediaType || 'video', 'en')),
      ];
    });

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  };

  // Generate ZIP Package (Tahap 6)
  const handleExportZip = async () => {
    setIsZipping(true);
    onShowToast('Sedang menyiapkan paket ZIP dan mengekstrak foto referensi dari IndexedDB...', 'info');

    try {
      const zip = new JSZip();

      // 1. Text prompts files
      zip.file('prompts_indonesia.txt', generateTXT());
      zip.file('prompts_english.txt', generateTXT());

      // 2. storyboard.md
      let md = `# ${project.projectName.toUpperCase()} - STORYBOARD MANIFEST\n\n`;
      md += `> **Catatan Penggunaan:** File prompt yang diekspor adalah panduan teks sinematik untuk dimasukkan ke platform pembuatan gambar atau video pilihan Anda. Aplikasi ini tidak merender video secara langsung.\n\n`;
      md += `* **Total Scene**: ${project.scenes.length}\n`;
      md += `* **Total Durasi**: ${totalRuntime} detik\n`;
      md += `* **Catatan Sutradara**: ${project.directorNotes || '-'}\n\n`;
      md += `---\n\n`;

      project.scenes.forEach((s) => {
        const chars = getSceneCharacters(s.characters, s.character);
        const pId =
          s.isPromptManuallyEdited && s.manualPromptId
            ? s.manualPromptId
            : buildAutomotivePrompt(s, s.promptFormat || 'universal', s.promptMediaType || 'video', 'id');
        const pEn =
          s.isPromptManuallyEdited && s.manualPromptEn
            ? s.manualPromptEn
            : buildAutomotivePrompt(s, s.promptFormat || 'universal', s.promptMediaType || 'video', 'en');

        md += `## Scene 0${s.sceneNumber}: ${s.title}\n\n`;
        md += `- **Durasi**: ${s.durationSeconds} detik ${s.isLocked ? '(Terkunci)' : ''}\n`;
        md += `- **Kendaraan**: ${s.vehicle.year || ''} ${s.vehicle.make || ''} ${s.vehicle.model || ''} | Plat: ${s.vehicle.licensePlate || '-'}\n`;
        md += `- **Karakter**: ${chars.map((c) => `${c.name || 'Karakter'} (${c.seatingPosition || '-'})`).join(', ') || 'Tanpa Karakter'}\n`;
        if (s.drivingAction) {
          md += `- **Aksi Kendaraan**: ${s.drivingAction.maneuver} | ${s.drivingAction.estimatedSpeed} | Mesin: ${s.drivingAction.engineStatus}\n`;
        }
        md += `- **Lokasi**: ${s.location.environmentType} (${s.location.timeOfDay}, ${s.location.weather})\n`;
        md += `- **Kamera**: ${s.camera.cameraShot} | ${s.camera.cameraMotion} | ${s.camera.focalLength}\n\n`;
        md += `### Prompt (Bahasa Indonesia)\n\`\`\`text\n${pId}\n\`\`\`\n\n`;
        md += `### Prompt (English)\n\`\`\`text\n${pEn}\n\`\`\`\n\n`;
        md += `---\n\n`;
      });
      zip.file('storyboard.md', md);

      // 3. prompts_indonesia.txt
      const promptsIdText = project.scenes
        .map((s) => {
          const p =
            s.isPromptManuallyEdited && s.manualPromptId
              ? s.manualPromptId
              : buildAutomotivePrompt(s, s.promptFormat || 'universal', s.promptMediaType || 'video', 'id');
          return `// SCENE 0${s.sceneNumber} (${s.durationSeconds}s) - ${s.title}\n${p}\n`;
        })
        .join('\n');
      zip.file('prompts_indonesia.txt', promptsIdText);

      // 4. prompts_english.txt
      const promptsEnText = project.scenes
        .map((s) => {
          const p =
            s.isPromptManuallyEdited && s.manualPromptEn
              ? s.manualPromptEn
              : buildAutomotivePrompt(s, s.promptFormat || 'universal', s.promptMediaType || 'video', 'en');
          return `// SCENE 0${s.sceneNumber} (${s.durationSeconds}s) - ${s.title}\n${p}\n`;
        })
        .join('\n');
      zip.file('prompts_english.txt', promptsEnText);

      // 5. referensi/ folder
      const refFolder = zip.folder('referensi');
      let imageCount = 0;

      for (const s of project.scenes) {
        // Keyframe
        if (s.imageUrl) {
          const imgData = await getImage(s.imageUrl);
          if (imgData && imgData.includes(';base64,')) {
            const base64 = imgData.split(';base64,')[1];
            refFolder?.file(`scene_${s.sceneNumber}_keyframe.jpg`, base64, { base64: true });
            imageCount++;
          }
        }

        // Vehicle Exterior
        if (s.vehicle?.exteriorPhotos) {
          for (const [k, v] of Object.entries(s.vehicle.exteriorPhotos)) {
            if (typeof v === 'string' && v) {
              const imgData = await getImage(v);
              if (imgData && imgData.includes(';base64,')) {
                const base64 = imgData.split(';base64,')[1];
                refFolder?.file(`scene_${s.sceneNumber}_eksterior_${k}.jpg`, base64, { base64: true });
                imageCount++;
              }
            }
          }
        }

        // Vehicle Interior
        if (s.vehicle?.interiorPhotos) {
          for (const [k, v] of Object.entries(s.vehicle.interiorPhotos)) {
            if (typeof v === 'string' && v) {
              const imgData = await getImage(v);
              if (imgData && imgData.includes(';base64,')) {
                const base64 = imgData.split(';base64,')[1];
                refFolder?.file(`scene_${s.sceneNumber}_interior_${k}.jpg`, base64, { base64: true });
                imageCount++;
              }
            }
          }
        }

        // Characters
        const chars = getSceneCharacters(s.characters, s.character);
        for (let i = 0; i < chars.length; i++) {
          const charImg = chars[i]?.imageUrl;
          if (charImg) {
            const imgData = await getImage(charImg);
            if (imgData && imgData.includes(';base64,')) {
              const base64 = imgData.split(';base64,')[1];
              refFolder?.file(
                `scene_${s.sceneNumber}_karakter_${i + 1}_${chars[i].name || 'wajah'}.jpg`,
                base64,
                { base64: true }
              );
              imageCount++;
            }
          }
        }
      }

      if (imageCount === 0) {
        refFolder?.file(
          'README.txt',
          'Tidak ada foto referensi yang diunggah dalam proyek ini.'
        );
      }

      // Generate blob & download
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `car_scene_${project.projectName.toLowerCase().replace(/\s+/g, '_')}_bundle.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onShowToast(`Paket ZIP berhasil diunduh (${imageCount} foto referensi disertakan)!`);
    } catch (e) {
      console.error(e);
      onShowToast('Gagal membuat paket ZIP.', 'info');
    } finally {
      setIsZipping(false);
    }
  };

  const getExportContent = () => {
    switch (exportFormat) {
      case 'txt':
        return generateTXT();
      case 'zip':
        return `[PAKET ARSIP ZIP SIAP DIUNDUH]\n\nIsi Paket:\n- prompts_indonesia.txt\n- prompts_english.txt\n- storyboard.md\n- folder referensi/ (berisi foto referensi kendaraan, interior, dan karakter asli dari IndexedDB)\n\nCatatan: Berkas JSON telah dihilangkan sesuai spesifikasi antarmuka prompt teks murni.`;
    }
  };

  const currentContent = getExportContent();

  const handleCopy = () => {
    if (exportFormat === 'zip') {
      onShowToast('Format ZIP harus diunduh langsung via tombol Unduh Paket ZIP.', 'info');
      return;
    }
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    onShowToast(`Manifest ${exportFormat.toUpperCase()} berhasil disalin ke papan klip!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (exportFormat === 'zip') {
      handleExportZip();
      return;
    }

    const ext = 'txt';
    const mime = 'text/plain';

    const blob = new Blob([currentContent], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `car_scene_${project.projectName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast(`File ${ext.toUpperCase()} berhasil diunduh!`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Module Navigation Bar */}
      <ModuleHeader
        moduleNumber="MODUL 08"
        moduleTitle="Export Center (Pusat Unduh Manifest & ZIP)"
        moduleDescription="Ekspor seluruh rangkaian storyboard, prompt dua bahasa, dan paket foto referensi ZIP"
        currentView="export"
        onNavigate={onNavigate}
        prevView={{ view: 'prompts', label: 'Prompt Generator' }}
      />

      {/* Prominent Disclaimer Notice (Tahap 6) */}
      <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 flex items-start gap-3 text-cyan-200 text-xs leading-relaxed">
        <Info className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-white">Panduan Penggunaan Berkas Ekspor:</strong>
          <p className="mt-0.5 text-cyan-200/90">
            File prompt yang diekspor adalah panduan teks sinematik untuk dimasukkan ke platform
            pembuatan gambar atau video pilihan Anda. Aplikasi ini adalah studio perencanaan visual
            dan prompt, dan tidak merender video secara langsung.
          </p>
        </div>
      </div>

      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Download className="h-4 w-4" />
            <span>MODUL 08 // PUSAT EKSPOR PRODUKSI</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            Pusat Ekspor & Lembar Produksi
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Unduh paket ZIP lengkap beserta folder gambar referensi, atau ekspor lembar TXT, JSON, dan CSV.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-200 transition-colors"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span>{copied ? 'Tersalin' : `Salin ${exportFormat.toUpperCase()}`}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={isZipping}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-xs font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>
              {isZipping
                ? 'Membuat ZIP...'
                : exportFormat === 'zip'
                ? 'Unduh Paket ZIP Lengkap'
                : `Unduh File ${exportFormat.toUpperCase()}`}
            </span>
          </button>
        </div>
      </div>

      {/* Format Selector Tabs: TXT, ZIP */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setExportFormat('zip')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border transition-all ${
            exportFormat === 'zip'
              ? 'border-emerald-500 bg-emerald-500/15 text-white font-bold shadow-md ring-1 ring-emerald-500/40'
              : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Archive className="h-4 w-4 text-emerald-400" />
          <span>Paket ZIP Lengkap (.zip + Folder Referensi)</span>
        </button>

        <button
          onClick={() => setExportFormat('txt')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
            exportFormat === 'txt'
              ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold shadow-sm'
              : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="h-4 w-4 text-emerald-400" />
          <span>Dokumen Teks Lengkap (.txt)</span>
        </button>
      </div>

      {/* Content Viewer */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-zinc-400 font-mono">
          <span>
            Pratinjau Berkas: {project.projectName} ({exportFormat.toUpperCase()})
          </span>
          <span className="text-[11px] text-emerald-400">
            {project.scenes.length} Scene Siap Diekspor
          </span>
        </div>

        <pre className="p-5 font-mono text-xs text-zinc-300 bg-zinc-950 overflow-x-auto max-h-[550px] leading-relaxed select-all">
          {currentContent}
        </pre>
      </div>
    </div>
  );
}
