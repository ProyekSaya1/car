import { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Sliders,
  Flame,
  Droplets,
  Film,
  Zap,
  Terminal,
  Globe,
  FileCode,
  Image as ImageIcon,
  Video,
} from 'lucide-react';
import { AIModelTarget, StoryboardScene } from '../../types';
import {
  buildAutomotivePrompt,
  buildAutomotiveImagePrompt,
  buildStructuredJsonPrompt,
  getNegativePrompt,
} from '../../utils/promptSynthesizer';

interface PromptGeneratorViewProps {
  activeScene: StoryboardScene;
  allScenes: StoryboardScene[];
  onUpdateScene: (scene: StoryboardScene) => void;
  onShowToast: (msg: string) => void;
}

export function PromptGeneratorView({
  activeScene,
  allScenes,
  onUpdateScene,
  onShowToast,
}: PromptGeneratorViewProps) {
  const [selectedModel, setSelectedModel] = useState<AIModelTarget>(activeScene.modelTarget || 'universal');
  const [promptLanguage, setPromptLanguage] = useState<'en' | 'id'>('en');
  const [promptMode, setPromptMode] = useState<'video' | 'image' | 'json'>('video');
  const [motionIntensity, setMotionIntensity] = useState<number>(75);
  const [wetnessFactor, setWetnessFactor] = useState<number>(80);
  const [anamorphicStreak, setAnamorphicStreak] = useState<boolean>(true);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedNegative, setCopiedNegative] = useState(false);
  const [batchTab, setBatchTab] = useState<'single' | 'batch'>('single');

  // Build enhanced prompt
  let extraTags = '';
  if (anamorphicStreak) extraTags += ' Subtle horizontal anamorphic lens flare.';
  if (motionIntensity > 80) extraTags += ' Dynamic automotive tracking blur.';
  if (wetnessFactor > 75) extraTags += ' Specular reflections on road surface.';

  const currentSceneWithEnhancements: StoryboardScene = {
    ...activeScene,
    customPromptEnhancer: (activeScene.customPromptEnhancer || '') + extraTags,
  };

  let synthesizedPrompt = '';
  if (promptMode === 'video') {
    synthesizedPrompt = buildAutomotivePrompt(currentSceneWithEnhancements, selectedModel, promptLanguage);
  } else if (promptMode === 'image') {
    synthesizedPrompt = buildAutomotiveImagePrompt(currentSceneWithEnhancements, promptLanguage);
  } else {
    synthesizedPrompt = buildStructuredJsonPrompt(currentSceneWithEnhancements);
  }

  const negativePrompt = getNegativePrompt(selectedModel, promptLanguage);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(synthesizedPrompt);
    setCopiedPrompt(true);
    onShowToast(`Prompt berhasil disalin ke papan klip!`);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyNegative = () => {
    navigator.clipboard.writeText(negativePrompt);
    setCopiedNegative(true);
    onShowToast('Prompt negatif berhasil disalin!');
    setTimeout(() => setCopiedNegative(false), 2000);
  };

  const handleCopyAllBatch = () => {
    const batchText = allScenes
      .map((s) => {
        const p = buildAutomotivePrompt(s, selectedModel, promptLanguage);
        return `// SCENE ${s.sceneNumber} (${s.durationSeconds} detik) - ${s.title}\n${p}\n`;
      })
      .join('\n');

    navigator.clipboard.writeText(batchText);
    onShowToast(`Berhasil menyalin seluruh ${allScenes.length} prompt scene (${selectedModel.toUpperCase()})!`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <Sparkles className="h-4 w-4" />
            <span>SINTESIS PROMPT AI OTOMOTIF UNIVERSAL</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            Prompt Generator & Export Format
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Hasilkan prompt video, prompt gambar, teks Bahasa Indonesia / Inggris, serta JSON terstruktur tanpa mengarang fitur di luar referensi foto.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setPromptLanguage('en')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                promptLanguage === 'en'
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              EN (Inggris)
            </button>
            <button
              onClick={() => setPromptLanguage('id')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                promptLanguage === 'id'
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              ID (Indonesia)
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setBatchTab('single')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                batchTab === 'single'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Scene #{activeScene.sceneNumber}
            </button>
            <button
              onClick={() => setBatchTab('batch')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                batchTab === 'batch'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Batch ({allScenes.length} Scene)
            </button>
          </div>
        </div>
      </div>

      {/* Format Selector: Prompt Video vs Prompt Gambar vs JSON Terstruktur */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setPromptMode('video')}
          className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
            promptMode === 'video'
              ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-sm'
              : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
          }`}
        >
          <div className={`p-2 rounded-lg ${promptMode === 'video' ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
            <Video className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold">Prompt Video AI</div>
            <div className="text-[10px] text-zinc-400">Gerakan & rig kamera sinematik</div>
          </div>
        </button>

        <button
          onClick={() => setPromptMode('image')}
          className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
            promptMode === 'image'
              ? 'border-cyan-500 bg-cyan-500/10 text-white shadow-sm'
              : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
          }`}
        >
          <div className={`p-2 rounded-lg ${promptMode === 'image' ? 'bg-cyan-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
            <ImageIcon className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold">Prompt Gambar / Still</div>
            <div className="text-[10px] text-zinc-400">Flux, Midjourney, Still Fotorealistik</div>
          </div>
        </button>

        <button
          onClick={() => setPromptMode('json')}
          className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
            promptMode === 'json'
              ? 'border-purple-500 bg-purple-500/10 text-white shadow-sm'
              : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
          }`}
        >
          <div className={`p-2 rounded-lg ${promptMode === 'json' ? 'bg-purple-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
            <FileCode className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold">JSON Terstruktur</div>
            <div className="text-[10px] text-zinc-400">Ekspor metadata lengkap adegan</div>
          </div>
        </button>
      </div>

      {/* Model Selection Tabs (Hanya jika mode Video atau Gambar) */}
      {promptMode !== 'json' && (
        <div className="space-y-2">
          <div className="text-xs font-mono uppercase text-zinc-400">Pilih Target Format Engine AI:</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {[
              { id: 'universal', name: 'Universal', tag: 'Kompatibel Semua Platform' },
              { id: 'custom', name: 'Custom Format', tag: 'Pemisah Bracket Rapi' },
              { id: 'kling', name: 'Kling 1.5', tag: 'Presisi Dinamis' },
              { id: 'runway', name: 'Runway Gen-3', tag: 'Bracket Camera Tracking' },
              { id: 'sora', name: 'OpenAI Sora', tag: 'Fisika & Narasi Sinematik' },
              { id: 'luma', name: 'Luma Dream', tag: 'Rotasi Kamera Sinematik' },
              { id: 'veo', name: 'Google Veo', tag: 'Fotorealistik Halus' },
              { id: 'flux', name: 'Flux Stills', tag: 'Keyframe Detail 8K' },
              { id: 'midjourney', name: 'Midjourney v6', tag: 'Parameter Aspek Rasio' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedModel(m.id as AIModelTarget);
                  onUpdateScene({ ...activeScene, modelTarget: m.id as AIModelTarget });
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedModel === m.id
                    ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-sm'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className="text-xs font-bold">{m.name}</div>
                <div className="text-[10px] text-zinc-400 font-mono truncate">{m.tag}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {batchTab === 'single' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Prompt Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-5 py-3">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <Terminal className="h-4 w-4 text-emerald-400" />
                  <span className="font-bold text-white uppercase">
                    {promptMode === 'json' ? 'JSON Terstruktur' : `Prompt (${selectedModel.toUpperCase()}) - ${promptLanguage.toUpperCase()}`}
                  </span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-zinc-400">Scene #{activeScene.sceneNumber}</span>
                </div>

                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 shadow-md shadow-emerald-500/20"
                >
                  {copiedPrompt ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedPrompt ? 'Tersalin!' : 'Salin Hasil'}</span>
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 font-mono text-xs md:text-sm text-emerald-300/90 leading-relaxed tracking-wide select-all whitespace-pre-wrap max-h-[350px] overflow-y-auto">
                  {synthesizedPrompt}
                </div>

                {promptMode !== 'json' && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 flex items-center justify-between">
                      <span>Instruksi Tambahan Sutradara (Opsional)</span>
                      <span className="font-mono text-[10px] text-zinc-400">Akan ditambahkan ke prompt akhir</span>
                    </label>
                    <input
                      type="text"
                      value={activeScene.customPromptEnhancer || ''}
                      onChange={(e) =>
                        onUpdateScene({ ...activeScene, customPromptEnhancer: e.target.value })
                      }
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
                      placeholder="Contoh: Tambahkan pantulan lampu jalan perkotaan, lensa 35mm f/2.8, sedikit film grain..."
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Negative Prompt */}
            {promptMode !== 'json' && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                    <span className="text-red-400 font-bold uppercase">Prompt Negatif ({promptLanguage.toUpperCase()})</span>
                    <span className="text-zinc-600">·</span>
                    <span>Menghindari posisi setir terbalik dan distorsi bodi</span>
                  </div>
                  <button
                    onClick={handleCopyNegative}
                    className="flex items-center gap-1 rounded bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-300 transition-colors"
                  >
                    {copiedNegative ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedNegative ? 'Tersalin' : 'Salin Negatif'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-950 font-mono text-xs text-zinc-400 leading-relaxed select-all">
                  {negativePrompt}
                </div>
              </div>
            )}
          </div>

          {/* Right Col: Parameters & Reference Verification Status */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="h-4 w-4 text-cyan-400" />
                Parameter Visual
              </h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">Motion Tracking</span>
                  <span className="font-mono text-emerald-400">{motionIntensity}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={motionIntensity}
                  onChange={(e) => setMotionIntensity(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">Refleksi Aspal Sian</span>
                  <span className="font-mono text-cyan-400">{wetnessFactor}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={wetnessFactor}
                  onChange={(e) => setWetnessFactor(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <label className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-300 cursor-pointer">
                  <span>Anamorphic Flare Streak</span>
                  <input
                    type="checkbox"
                    checked={anamorphicStreak}
                    onChange={(e) => setAnamorphicStreak(e.target.checked)}
                    className="accent-cyan-500 h-4 w-4 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Reference Integrity Checklist */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 space-y-3">
              <div className="text-xs font-mono uppercase text-emerald-400 font-bold">
                Integritas Referensi Foto
              </div>
              <ul className="text-xs text-zinc-400 space-y-1.5 leading-relaxed">
                <li className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Setir: <strong>{activeScene.vehicle.steeringPosition}</strong></span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Transmisi: <strong>{activeScene.vehicle.transmission}</strong></span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  <span>Fitur Terverifikasi: <strong>{(activeScene.vehicle.verifiedFeaturesFromReference || []).length} Item</strong></span>
                </li>
              </ul>
              <p className="text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/80">
                Fitur yang belum tampak di foto tidak akan dikarang secara otomatis demi konsistensi produksi.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Batch All Scenes Mode */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono text-zinc-400">
              Daftar prompt untuk seluruh <strong className="text-white">{allScenes.length} scene</strong> ({selectedModel.toUpperCase()})
            </div>

            <button
              onClick={handleCopyAllBatch}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-xs font-bold text-zinc-950 shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Salin Seluruh Batch Scene</span>
            </button>
          </div>

          <div className="space-y-4">
            {allScenes.map((scene) => {
              const prompt = buildAutomotivePrompt(scene, selectedModel, promptLanguage);
              return (
                <div key={scene.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 font-bold">
                        Scene #{scene.sceneNumber} ({scene.durationSeconds} dtk)
                      </span>
                      <h4 className="text-xs font-bold text-zinc-200">{scene.title}</h4>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(prompt);
                        onShowToast(`Prompt Scene #${scene.sceneNumber} disalin!`);
                      }}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      Salin Scene Ini
                    </button>
                  </div>
                  <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-950 font-mono text-xs text-zinc-300 leading-relaxed select-all">
                    {prompt}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
