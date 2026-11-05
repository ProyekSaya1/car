import { ProjectState, StoryboardScene } from '../../types';
import { ProjectSettingsBar } from './ProjectSettingsBar';
import { UploadBoxes } from './UploadBoxes';
import { RefinerCard } from './RefinerCard';
import { SwitchPanels } from './SwitchPanels';
import { ResultColumn } from './ResultColumn';

interface WorkspaceViewProps {
  project: ProjectState;
  onUpdateProject: (updater: (prev: ProjectState) => ProjectState) => void;
  onSelectScene: (sceneId: string) => void;
  onAddScene: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

export function WorkspaceView({
  project,
  onUpdateProject,
  onSelectScene,
  onAddScene,
  onShowToast,
}: WorkspaceViewProps) {
  const activeScene =
    project.scenes.find((s) => s.id === project.activeSceneId) || project.scenes[0];

  const handleUpdateActiveScene = (updated: StoryboardScene) => {
    onUpdateProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => (s.id === updated.id ? updated : s)),
    }));
  };

  return (
    <div className="max-w-7xl mx-auto w-full pb-16">
      {/* 1. Global Project Settings Bar (Ratio, Duration, Mode, Language) */}
      <ProjectSettingsBar
        project={project}
        onUpdateProject={onUpdateProject}
        onShowToast={onShowToast}
      />

      {/* 2. Responsive 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Uploads + Refiner + Switch Panels (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Two Big Dashed Upload Boxes: Mobil & Karakter */}
          <UploadBoxes
            activeScene={activeScene}
            onUpdateScene={handleUpdateActiveScene}
            onShowToast={onShowToast}
          />

          {/* Refiner Card: Ceritakan Adegannya, Lokasi & Cuaca Switch, Camera Chips */}
          <RefinerCard
            activeScene={activeScene}
            onUpdateScene={handleUpdateActiveScene}
            onShowToast={onShowToast}
          />

          {/* 6 Switch Panels Bar: Detail Mobil, Karakter, Kamera Pro, Detail Lokasi, Aksi Kendaraan, Custom */}
          <SwitchPanels
            activeScene={activeScene}
            onUpdateScene={handleUpdateActiveScene}
            onShowToast={onShowToast}
            targetDurationSeconds={
              typeof project.durationOption === 'number'
                ? project.durationOption
                : activeScene.durationSeconds || 4
            }
          />
        </div>

        {/* Right Column: HASIL Prompts List (5 cols on lg, sticky on desktop) */}
        <div className="lg:col-span-5 lg:sticky lg:top-20">
          <ResultColumn
            project={project}
            onUpdateProject={onUpdateProject}
            onSelectScene={onSelectScene}
            onAddScene={onAddScene}
            onShowToast={onShowToast}
          />
        </div>
      </div>
    </div>
  );
}
