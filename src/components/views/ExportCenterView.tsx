import { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  FileCode,
  FileText,
  Terminal,
} from 'lucide-react';
import { ProjectState } from '../../types';
import { buildAutomotivePrompt, getNegativePrompt } from '../../utils/promptSynthesizer';

interface ExportCenterViewProps {
  project: ProjectState;
  onShowToast: (msg: string) => void;
}

export function ExportCenterView({ project, onShowToast }: ExportCenterViewProps) {
  const [exportFormat, setExportFormat] = useState<'markdown' | 'json' | 'csv'>('markdown');
  const [copied, setCopied] = useState(false);

  // Generate Markdown
  const totalRuntime = project.scenes.reduce((acc, s) => acc + s.durationSeconds, 0);

  const generateMarkdown = () => {
    let md = `# ${project.projectName.toUpperCase()}\n`;
    md += `## Paket Produksi Storyboard & Prompt Video AI Otomotif\n`;
    md += `Dibuat dengan CAR SCENE ENGINE V2.0\n\n`;
    md += `**Total Sekuens Scene:** ${project.scenes.length}\n`;
    md += `**Total Estimasi Durasi:** ${totalRuntime} detik\n`;
    md += `**Catatan Sutradara:** ${project.directorNotes}\n\n`;
    md += `---\n\n`;

    project.scenes.forEach((scene) => {
      const prompt = buildAutomotivePrompt(scene, scene.modelTarget);
      const neg = getNegativePrompt(scene.modelTarget);

      md += `### SCENE 0${scene.sceneNumber}: ${scene.title.toUpperCase()}\n`;
      md += `- **Durasi:** ${scene.durationSeconds} detik\n`;
      md += `- **Target Model AI:** ${scene.modelTarget.toUpperCase()}\n`;
      md += `- **Kendaraan:** ${scene.vehicle.year} ${scene.vehicle.make} ${scene.vehicle.model} (${scene.vehicle.category}) finishing ${scene.vehicle.paintFinish} ${scene.vehicle.paintColor}\n`;
      md += `- **Lingkungan:** ${scene.location.environmentType} (${scene.location.timeOfDay}, ${scene.location.weather})\n`;
      md += `- **Rig Kamera & Lensa:** ${scene.camera.rigType} | ${scene.camera.focalLength} | ${scene.camera.aspectRatio}\n`;
      md += `- **Pergerakan Kamera:** ${scene.camera.cameraMotion}\n\n`;
      md += `**Prompt Generasi AI Video:**\n`;
      md += `\`\`\`text\n${prompt}\n\`\`\`\n\n`;
      md += `**Prompt Negatif:**\n`;
      md += `\`\`\`text\n${neg}\n\`\`\`\n\n`;
      md += `---\n\n`;
    });

    return md;
  };

  // Generate JSON
  const generateJSON = () => {
    const exportData = {
      project: project.projectName,
      version: '2.0',
      totalRuntimeSeconds: totalRuntime,
      directorNotes: project.directorNotes,
      scenes: project.scenes.map((s) => ({
        sceneNumber: s.sceneNumber,
        title: s.title,
        durationSeconds: s.durationSeconds,
        targetModel: s.modelTarget,
        vehicle: s.vehicle,
        character: s.character,
        location: s.location,
        camera: s.camera,
        synthesizedPrompt: buildAutomotivePrompt(s, s.modelTarget),
        negativePrompt: getNegativePrompt(s.modelTarget),
      })),
    };
    return JSON.stringify(exportData, null, 2);
  };

  // Generate CSV
  const generateCSV = () => {
    const headers = ['Nomor Scene', 'Judul Scene', 'Durasi (detik)', 'Kendaraan', 'Lingkungan', 'Rig Kamera', 'Target AI', 'Prompt'];
    const rows = project.scenes.map((s) => [
      s.sceneNumber,
      `"${s.title.replace(/"/g, '""')}"`,
      s.durationSeconds,
      `"${s.vehicle.make} ${s.vehicle.model}"`,
      `"${s.location.environmentType}"`,
      `"${s.camera.rigType}"`,
      s.modelTarget.toUpperCase(),
      `"${buildAutomotivePrompt(s, s.modelTarget).replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  };

  const getExportContent = () => {
    switch (exportFormat) {
      case 'markdown':
        return generateMarkdown();
      case 'json':
        return generateJSON();
      case 'csv':
        return generateCSV();
    }
  };

  const currentContent = getExportContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    onShowToast(`Berhasil menyalin manifest ${exportFormat.toUpperCase()} ke papan klip!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = exportFormat === 'markdown' ? 'md' : exportFormat;
    const mime =
      exportFormat === 'json'
        ? 'application/json'
        : exportFormat === 'csv'
        ? 'text/csv'
        : 'text/markdown';

    const blob = new Blob([currentContent], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `car_scene_engine_${project.projectName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast(`File ${ext.toUpperCase()} berhasil diunduh!`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Download className="h-4 w-4" />
            <span>MODUL 08 // PUSAT EKSPOR & MANIFEST BATCH</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            Pusat Ekspor & Lembar Produksi
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Unduh atau salin lembar prompt storyboard lengkap dan spesifikasi teknis untuk alur kerja produksi Anda.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-200 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Tersalin' : 'Salin Manifest'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-xs font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all active:scale-95"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Unduh File</span>
          </button>
        </div>
      </div>

      {/* Format Selector Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setExportFormat('markdown')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
            exportFormat === 'markdown'
              ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold'
              : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="h-4 w-4 text-emerald-400" />
          <span>Dokumen Markdown (.md)</span>
        </button>

        <button
          onClick={() => setExportFormat('json')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
            exportFormat === 'json'
              ? 'border-cyan-500 bg-cyan-500/10 text-white font-bold'
              : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileCode className="h-4 w-4 text-cyan-400" />
          <span>Pipeline JSON Terstruktur (.json)</span>
        </button>

        <button
          onClick={() => setExportFormat('csv')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
            exportFormat === 'csv'
              ? 'border-sky-500 bg-sky-500/10 text-white font-bold'
              : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Terminal className="h-4 w-4 text-sky-400" />
          <span>Lembar Spreadsheet (.csv)</span>
        </button>
      </div>

      {/* Code / Content Viewer */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-zinc-400 font-mono">
          <span>
            Pratinjau: {project.projectName} ({exportFormat.toUpperCase()})
          </span>
          <span className="text-[11px] text-emerald-400">
            {project.scenes.length} Scene Siap
          </span>
        </div>

        <pre className="p-5 font-mono text-xs text-zinc-300 bg-zinc-950 overflow-x-auto max-h-[550px] leading-relaxed select-all">
          {currentContent}
        </pre>
      </div>
    </div>
  );
}
