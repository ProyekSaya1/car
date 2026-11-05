import { useState } from 'react';
import { ProjectState, AspectRatioOption, DurationOption, MediaMode, PromptLang } from '../../types';
import { Video, Image as ImageIcon, Check, SlidersHorizontal, Info } from 'lucide-react';

interface ProjectSettingsBarProps {
  project: ProjectState;
  onUpdateProject: (updater: (prev: ProjectState) => ProjectState) => void;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

const RATIO_OPTIONS: AspectRatioOption[] = ['16:9', '9:16', '4:5', '1:1'];
const DURATION_BUTTONS: DurationOption[] = ['auto', 3, 4, 5, 8, 10];

export function ProjectSettingsBar({
  project,
  onUpdateProject,
  onShowToast,
}: ProjectSettingsBarProps) {
  const [showRatioConfirm, setShowRatioConfirm] = useState<AspectRatioOption | null>(null);
  const [isCustomDuration, setIsCustomDuration] = useState(
    typeof project.durationOption === 'number' && !DURATION_BUTTONS.includes(project.durationOption)
  );
  const [customDurInput, setCustomDurInput] = useState(
    typeof project.durationOption === 'number' ? String(project.durationOption) : '6'
  );

  const totalScenes = project.scenes.length;
  const isVideo = project.mediaMode === 'video';

  // Handle ratio change with confirmation
  const handleRatioClick = (ratio: AspectRatioOption) => {
    if (ratio === project.aspectRatio) return;
    setShowRatioConfirm(ratio);
  };

  const confirmApplyRatio = (ratio: AspectRatioOption) => {
    onUpdateProject((prev) => ({
      ...prev,
      aspectRatio: ratio,
      scenes: prev.scenes.map((s) => ({
        ...s,
        camera: {
          ...s.camera,
          aspectRatio: ratio,
        },
      })),
    }));
    setShowRatioConfirm(null);
    onShowToast(`Rasio aspek diubah ke ${ratio} untuk semua scene!`);
  };

  // Handle duration change
  const handleDurationClick = (dur: DurationOption) => {
    setIsCustomDuration(false);
    onUpdateProject((prev) => ({
      ...prev,
      durationOption: dur,
      targetDurationSeconds: typeof dur === 'number' ? dur * prev.scenes.length : prev.targetDurationSeconds,
      scenes: prev.scenes.map((s) => ({
        ...s,
        durationSeconds: typeof dur === 'number' ? dur : s.durationSeconds,
      })),
    }));
  };

  const handleCustomDurationSubmit = (val: string) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      onUpdateProject((prev) => ({
        ...prev,
        durationOption: num,
        customDurationSeconds: num,
        targetDurationSeconds: num * prev.scenes.length,
        scenes: prev.scenes.map((s) => ({
          ...s,
          durationSeconds: num,
        })),
      }));
      onShowToast(`Durasi disetel ke ${num} detik per scene`);
    }
  };

  // Duration runtime calculation
  const currentDurationPerScene =
    typeof project.durationOption === 'number'
      ? project.durationOption
      : null;
  const totalDurationSeconds =
    currentDurationPerScene !== null ? totalScenes * currentDurationPerScene : null;

  return (
    <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 sm:p-4 mb-4 backdrop-blur-sm shadow-lg space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Rasio & Durasi */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Rasio Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              Rasio:
            </span>
            <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
              {RATIO_OPTIONS.map((ratio) => {
                const isActive = project.aspectRatio === ratio;
                return (
                  <button
                    key={ratio}
                    onClick={() => handleRatioClick(ratio)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                    }`}
                  >
                    {ratio}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Durasi Selector (Only relevant for video) */}
          {isVideo && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Durasi:
              </span>
              <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
                {DURATION_BUTTONS.map((dur) => {
                  const isActive = !isCustomDuration && project.durationOption === dur;
                  const label = dur === 'auto' ? 'Otomatis' : `${dur}s`;
                  return (
                    <button
                      key={String(dur)}
                      onClick={() => handleDurationClick(dur)}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-cyan-500 text-zinc-950 shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}

                {/* Custom duration button / input */}
                {!isCustomDuration ? (
                  <button
                    onClick={() => setIsCustomDuration(true)}
                    className="px-2 py-1 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                    title="Kustom durasi detik"
                  >
                    Kustom
                  </button>
                ) : (
                  <div className="flex items-center gap-1 px-1">
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={customDurInput}
                      onChange={(e) => {
                        setCustomDurInput(e.target.value);
                        handleCustomDurationSubmit(e.target.value);
                      }}
                      className="w-12 px-1.5 py-0.5 text-xs text-center font-bold bg-zinc-800 border border-cyan-500/50 rounded text-cyan-300 focus:outline-none"
                    />
                    <span className="text-[11px] text-zinc-400">s</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Mode & Bahasa */}
        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
          {/* Mode Switch (Video | Gambar) */}
          <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => onUpdateProject((p) => ({ ...p, mediaMode: 'video' }))}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                project.mediaMode === 'video'
                  ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Video className="h-3.5 w-3.5" />
              <span>Video</span>
            </button>
            <button
              onClick={() => onUpdateProject((p) => ({ ...p, mediaMode: 'image' }))}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                project.mediaMode === 'image'
                  ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Gambar</span>
            </button>
          </div>

          {/* Bahasa Prompt Single Toggle (ID | EN) */}
          <div className="flex items-center bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() =>
                onUpdateProject((p) => ({
                  ...p,
                  promptLanguage: p.promptLanguage === 'id' ? 'en' : 'id',
                }))
              }
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-emerald-500/30 transition-all active:scale-95"
              title="Ganti Bahasa Prompt Antara Indonesia dan English"
            >
              <span className={project.promptLanguage === 'id' ? 'text-white' : 'text-zinc-500'}>
                ID
              </span>
              <span className="text-zinc-600">|</span>
              <span className={project.promptLanguage === 'en' ? 'text-white' : 'text-zinc-500'}>
                EN
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Subtext info for total runtime if specific duration is active */}
      {isVideo && totalDurationSeconds !== null && (
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1 border-t border-zinc-900">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span>
              {totalScenes} scene × {currentDurationPerScene} dtk = total {totalDurationSeconds} detik
            </span>
          </div>
          <div className="text-zinc-500 hidden sm:block">
            Samakan juga rasio di generator Anda ({project.aspectRatio})
          </div>
        </div>
      )}

      {/* Confirmation Modal for Aspect Ratio */}
      {showRatioConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <SlidersHorizontal className="h-5 w-5" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Ubah Rasio Aspek
              </h4>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Terapkan rasio <span className="font-bold text-emerald-400">{showRatioConfirm}</span> ke semua scene di proyek ini?
            </p>

            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-400">
              <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>Penting: Samakan juga rasio di generator Anda ({showRatioConfirm}).</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setShowRatioConfirm(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={() => confirmApplyRatio(showRatioConfirm)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors shadow"
              >
                Terapkan ke Semua Scene
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
