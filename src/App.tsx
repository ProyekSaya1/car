import { useState, useEffect, useRef } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Toast } from './components/ui/Toast';
import { NewProjectModal, OpenProjectModal, RenameProjectModal } from './components/modals/ProjectModals';
import { ReferenceWorkspaceModal } from './components/modals/ReferenceWorkspaceModal';
import { WorkspaceView } from './components/workspace/WorkspaceView';
import { DashboardView } from './components/views/DashboardView';
import { VehicleSetupView } from './components/views/VehicleSetupView';
import { CharacterSetupView } from './components/views/CharacterSetupView';
import { LocationSetupView } from './components/views/LocationSetupView';
import { CameraControlView } from './components/views/CameraControlView';
import { StoryboardView } from './components/views/StoryboardView';
import { PromptGeneratorView } from './components/views/PromptGeneratorView';
import { ExportCenterView } from './components/views/ExportCenterView';
import { INITIAL_PROJECTS, createBlankProject, createBlankScene, createBlankCharacter } from './data/initialData';
import {
  CameraConfig,
  CharacterConfig,
  LocationConfig,
  ProjectState,
  StoryboardScene,
  VehicleCategory,
  VehicleConfig,
  ViewMode,
} from './types';
import { migrateProjectsImagesToIDB } from './utils/imageStore';
import { downloadProjectZip } from './utils/zipExporter';
import { AlertCircle, Download } from 'lucide-react';

const STORAGE_PROJECTS_KEY = 'car_scene_engine_universal_v2';
const STORAGE_ACTIVE_ID_KEY = 'car_scene_engine_universal_active_id_v2';
const CURRENT_SCHEMA_VERSION = 2;

export default function App() {
  const mainContentRef = useRef<HTMLElement>(null);

  // State: Save Status Indicator
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [storageQuotaError, setStorageQuotaError] = useState(false);

  // Load projects from localStorage safely
  const [projects, setProjects] = useState<ProjectState[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROJECTS_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((p: ProjectState) => ({
              ...p,
              schemaVersion: p.schemaVersion || CURRENT_SCHEMA_VERSION,
              aspectRatio: p.aspectRatio || '16:9',
              durationOption: p.durationOption !== undefined ? p.durationOption : 'auto',
              mediaMode: p.mediaMode || 'video',
              promptLanguage: p.promptLanguage || 'id',
              targetDurationSeconds: p.targetDurationSeconds || 15,
              scenes: p.scenes.map((sc, sIdx) => ({
                ...sc,
                characters:
                  Array.isArray(sc.characters) && sc.characters.length > 0
                    ? sc.characters
                    : sc.character
                    ? [sc.character]
                    : [],
              })),
            }));
          }
        } catch (parseErr) {
          const backupKey = `car_scene_engine_corrupted_backup_${Date.now()}`;
          console.error('Data localStorage korup! Menyimpan salinan ke:', backupKey, parseErr);
          try {
            localStorage.setItem(backupKey, saved);
          } catch (bErr) {}
        }
      }
    } catch (e) {
      console.warn('Gagal membaca dari localStorage:', e);
    }
    return INITIAL_PROJECTS;
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_ACTIVE_ID_KEY);
      if (savedId) return savedId;
    } catch (e) {}
    return INITIAL_PROJECTS[0].id;
  });

  const [activeView, setActiveView] = useState<ViewMode>('workspace');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [openProjectModalOpen, setOpenProjectModalOpen] = useState(false);
  const [renameProjectModalOpen, setRenameProjectModalOpen] = useState(false);
  const [referenceWorkspaceOpen, setReferenceWorkspaceOpen] = useState(false);

  const [toast, setToast] = useState<{ message: string; visible: boolean; type?: 'success' | 'info' | 'error' }>({
    message: '',
    visible: false,
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, visible: true, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2800);
  };

  // Automatic Migration: move any legacy base64 images to IndexedDB on mount
  useEffect(() => {
    let isMounted = true;
    migrateProjectsImagesToIDB(projects).then(({ projects: migrated, migratedCount }) => {
      if (isMounted && migratedCount > 0) {
        setProjects(migrated);
        showToast(
          `Migrasi Otomatis: ${migratedCount} foto dipindahkan ke IndexedDB berkapasitas tinggi!`
        );
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-sync projects to localStorage
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        const payload = JSON.stringify(
          projects.map((p) => ({
            ...p,
            schemaVersion: CURRENT_SCHEMA_VERSION,
          }))
        );
        localStorage.setItem(STORAGE_PROJECTS_KEY, payload);
        setSaveStatus('saved');
        setStorageQuotaError(false);
      } catch (e) {
        console.error('Gagal menyimpan ke localStorage:', e);
        setSaveStatus('error');
        setStorageQuotaError(true);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [projects]);

  // Auto-sync activeProjectId to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVE_ID_KEY, activeProjectId);
    } catch (e) {}
  }, [activeProjectId]);

  // Scroll main viewport to top on view transition
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeView]);

  const project = projects.find((p) => p.id === activeProjectId) || projects[0];

  const updateCurrentProject = (updater: (prev: ProjectState) => ProjectState) => {
    setProjects((prevProjects) =>
      prevProjects.map((p) => (p.id === project.id ? updater(p) : p))
    );
  };

  const activeScene =
    project.scenes.find((s) => s.id === project.activeSceneId) || project.scenes[0];

  const handleSelectScene = (sceneId: string) => {
    updateCurrentProject((prev) => ({ ...prev, activeSceneId: sceneId }));
  };

  // Emergency Project Export if Quota Fails
  const handleEmergencyExport = () => {
    downloadProjectZip(project);
    showToast('Paket cadangan ZIP proyek berhasil diunduh!');
  };

  // Handler for New Project
  const handleCreateProject = (name: string) => {
    const newProject = createBlankProject(name);
    setProjects((prev) => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
    showToast(`Proyek baru "${name}" berhasil dibuat dengan pengaturan kosong!`);
  };

  // Handler for Renaming Project
  const handleRenameProject = (newName: string) => {
    updateCurrentProject((prev) => ({ ...prev, projectName: newName }));
    showToast(`Nama proyek berhasil diubah menjadi "${newName}"`);
  };

  // Handler for Switching Project
  const handleSelectProject = (id: string) => {
    setActiveProjectId(id);
    const target = projects.find((p) => p.id === id);
    if (target) {
      showToast(`Membuka proyek: ${target.projectName}`);
    }
  };

  // Handler for Deleting Project
  const handleDeleteProject = (id: string) => {
    if (projects.length <= 1) {
      showToast('Tidak dapat menghapus satu-satunya proyek tersisa', 'info');
      return;
    }
    const filtered = projects.filter((p) => p.id !== id);
    setProjects(filtered);
    if (activeProjectId === id) {
      setActiveProjectId(filtered[0].id);
    }
    showToast('Proyek berhasil dihapus');
  };

  const handleUpdateProjectName = (projectName: string) => {
    updateCurrentProject((prev) => ({ ...prev, projectName }));
  };

  const handleUpdateTargetDuration = (targetDurationSeconds: number) => {
    updateCurrentProject((prev) => ({ ...prev, targetDurationSeconds }));
  };

  const handleUpdateVehicleGeneric = (vehicleName: string, make: string, model: string) => {
    updateCurrentProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.id === prev.activeSceneId
          ? {
              ...s,
              promptNeedsReview: Boolean(s.isPromptManuallyEdited),
              vehicle: {
                ...s.vehicle,
                name: vehicleName,
                make,
                model,
              },
            }
          : s
      ),
    }));
  };

  const handleAddScene = () => {
    const nextNumber = project.scenes.length + 1;
    const newScene = createBlankScene(nextNumber);
    newScene.title = `Scene 0${nextNumber}`;
    // Inherit active vehicle to maintain continuity
    newScene.vehicle = { ...activeScene.vehicle, id: `v-${Date.now()}` };

    updateCurrentProject((prev) => ({
      ...prev,
      activeSceneId: newScene.id,
      scenes: [...prev.scenes, newScene],
    }));
    showToast(`Scene 0${nextNumber} berhasil ditambahkan!`);
  };

  const handleDuplicateScene = (id: string) => {
    const target = project.scenes.find((s) => s.id === id);
    if (!target) return;

    const nextNumber = project.scenes.length + 1;
    const cloned: StoryboardScene = {
      ...target,
      id: `scene-${Date.now()}`,
      sceneNumber: nextNumber,
      title: `${target.title} (Alternatif Angle)`,
      vehicle: JSON.parse(JSON.stringify(target.vehicle)),
      characters: JSON.parse(JSON.stringify(target.characters || [])),
      drivingAction: target.drivingAction ? JSON.parse(JSON.stringify(target.drivingAction)) : undefined,
      location: JSON.parse(JSON.stringify(target.location)),
      camera: JSON.parse(JSON.stringify(target.camera)),
    };

    updateCurrentProject((prev) => ({
      ...prev,
      activeSceneId: cloned.id,
      scenes: [...prev.scenes, cloned],
    }));
    showToast(`Scene digandakan menjadi Scene #${nextNumber}!`);
  };

  const handleDeleteScene = (id: string) => {
    if (project.scenes.length <= 1) {
      showToast('Tidak dapat menghapus scene satu-satunya di storyboard', 'info');
      return;
    }

    const filtered = project.scenes.filter((s) => s.id !== id);
    const reindexed = filtered.map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));
    const nextActive = reindexed[0]?.id || '';

    updateCurrentProject((prev) => ({
      ...prev,
      activeSceneId: nextActive,
      scenes: reindexed,
    }));
    showToast('Scene berhasil dihapus dari storyboard');
  };

  const handleMoveScene = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= project.scenes.length) return;

    const list = [...project.scenes];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    const reindexed = list.map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));

    updateCurrentProject((prev) => ({
      ...prev,
      scenes: reindexed,
    }));
    showToast('Urutan scene berhasil diatur');
  };

  const handleUpdateScene = (updated: StoryboardScene) => {
    updateCurrentProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => (s.id === updated.id ? updated : s)),
    }));
  };

  const handleUpdateVehicle = (vehicle: VehicleConfig) => {
    updateCurrentProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.id === prev.activeSceneId
          ? {
              ...s,
              vehicle,
              promptNeedsReview: Boolean(s.isPromptManuallyEdited),
            }
          : s
      ),
    }));
  };

  const handleApplyVehicleToAll = (vehicle: VehicleConfig) => {
    updateCurrentProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => ({
        ...s,
        vehicle: JSON.parse(JSON.stringify(vehicle)),
        promptNeedsReview: Boolean(s.isPromptManuallyEdited),
      })),
    }));
  };

  const handleUpdateCharacter = (character: CharacterConfig) => {
    updateCurrentProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.id === prev.activeSceneId
          ? {
              ...s,
              characters: [character, ...(s.characters || []).slice(1)],
              promptNeedsReview: Boolean(s.isPromptManuallyEdited),
            }
          : s
      ),
    }));
  };

  const handleUpdateCharacters = (characters: CharacterConfig[]) => {
    updateCurrentProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.id === prev.activeSceneId
          ? {
              ...s,
              characters,
              promptNeedsReview: Boolean(s.isPromptManuallyEdited),
            }
          : s
      ),
    }));
  };

  const handleApplyCharactersToAll = (chars: CharacterConfig[] | CharacterConfig) => {
    const list = Array.isArray(chars) ? chars : [chars];
    updateCurrentProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => ({
        ...s,
        characters: JSON.parse(JSON.stringify(list)),
        promptNeedsReview: Boolean(s.isPromptManuallyEdited),
      })),
    }));
  };

  const handleUpdateLocation = (location: LocationConfig) => {
    updateCurrentProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.id === prev.activeSceneId
          ? {
              ...s,
              location,
              promptNeedsReview: Boolean(s.isPromptManuallyEdited),
            }
          : s
      ),
    }));
  };

  const handleApplyLocationToAll = (location: LocationConfig) => {
    updateCurrentProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => ({
        ...s,
        location: JSON.parse(JSON.stringify(location)),
        promptNeedsReview: Boolean(s.isPromptManuallyEdited),
      })),
    }));
  };

  const handleUpdateCamera = (camera: CameraConfig) => {
    updateCurrentProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.id === prev.activeSceneId
          ? {
              ...s,
              camera,
              promptNeedsReview: Boolean(s.isPromptManuallyEdited),
            }
          : s
      ),
    }));
  };

  const handleApplyCameraToAll = (camera: CameraConfig) => {
    updateCurrentProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => ({
        ...s,
        camera: JSON.parse(JSON.stringify(camera)),
        promptNeedsReview: Boolean(s.isPromptManuallyEdited),
      })),
    }));
  };

  const handleUpdateNotes = (directorNotes: string) => {
    updateCurrentProject((prev) => ({ ...prev, directorNotes }));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Sticky Storage Quota Warning Banner */}
      {storageQuotaError && (
        <div className="sticky top-0 z-50 bg-rose-600 text-white px-4 py-3 flex items-center justify-between shadow-2xl animate-pulse">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-white shrink-0" />
            <div className="text-xs sm:text-sm font-semibold">
              Peringatan: Penyimpanan browser penuh! Segera unduh arsip ZIP proyek agar data tidak hilang.
            </div>
          </div>
          <button
            onClick={handleEmergencyExport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-rose-700 text-xs font-bold hover:bg-zinc-100 transition-colors shadow"
          >
            <Download className="h-4 w-4" />
            <span>Unduh ZIP Darurat</span>
          </button>
        </div>
      )}

      {/* Header */}
      <Header
        project={project}
        saveStatus={saveStatus}
        onNewProject={() => setNewProjectModalOpen(true)}
        onOpenProject={() => setOpenProjectModalOpen(true)}
        onRenameProject={() => setRenameProjectModalOpen(true)}
        onDeleteProject={() => handleDeleteProject(project.id)}
        onShowToast={showToast}
        onToggleMobileMenu={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex w-full">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeView={activeView}
          onNavigate={(view) => setActiveView(view)}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          totalScenes={project.scenes.length}
        />

        {/* Viewport Content with Ref for Auto-Scroll Reset */}
        <main
          ref={mainContentRef}
          className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-4rem)]"
        >
          {/* PRIMARY WORKSPACE STUDIO (2-COLUMN LAYOUT) */}
          {activeView === 'workspace' && (
            <WorkspaceView
              project={project}
              onUpdateProject={updateCurrentProject}
              onSelectScene={handleSelectScene}
              onAddScene={handleAddScene}
              onShowToast={showToast}
            />
          )}

          {activeView === 'dashboard' && (
            <DashboardView
              project={project}
              totalProjects={projects.length}
              totalStoryboards={projects.length}
              onNavigate={(view) => setActiveView(view)}
              onSelectScene={handleSelectScene}
              onAddScene={handleAddScene}
              onUpdateScene={handleUpdateScene}
              onUpdateNotes={handleUpdateNotes}
              onUpdateProjectName={handleUpdateProjectName}
              onOpenNewProjectModal={() => setNewProjectModalOpen(true)}
              onOpenOpenProjectModal={() => setOpenProjectModalOpen(true)}
              onUpdateVehicleGeneric={handleUpdateVehicleGeneric}
              onShowToast={showToast}
            />
          )}

          {activeView === 'vehicle' && (
            <VehicleSetupView
              activeScene={activeScene}
              onUpdateVehicle={handleUpdateVehicle}
              onApplyToAllScenes={handleApplyVehicleToAll}
              onShowToast={showToast}
              onNavigate={(view) => setActiveView(view)}
            />
          )}

          {activeView === 'character' && (
            <CharacterSetupView
              activeScene={activeScene}
              onUpdateCharacter={handleUpdateCharacter}
              onUpdateCharacters={handleUpdateCharacters}
              onApplyToAllScenes={handleApplyCharactersToAll}
              onShowToast={showToast}
              onNavigate={(view) => setActiveView(view)}
            />
          )}

          {activeView === 'location' && (
            <LocationSetupView
              activeScene={activeScene}
              onUpdateLocation={handleUpdateLocation}
              onApplyToAllScenes={handleApplyLocationToAll}
              onShowToast={showToast}
              onNavigate={(view) => setActiveView(view)}
            />
          )}

          {activeView === 'camera' && (
            <CameraControlView
              activeScene={activeScene}
              onUpdateCamera={handleUpdateCamera}
              onApplyToAllScenes={handleApplyCameraToAll}
              onShowToast={showToast}
              onNavigate={(view) => setActiveView(view)}
            />
          )}

          {activeView === 'storyboard' && (
            <StoryboardView
              scenes={project.scenes}
              activeSceneId={project.activeSceneId}
              targetDurationSeconds={project.targetDurationSeconds || 15}
              onUpdateTargetDuration={handleUpdateTargetDuration}
              onSelectScene={handleSelectScene}
              onAddScene={handleAddScene}
              onDuplicateScene={handleDuplicateScene}
              onDeleteScene={handleDeleteScene}
              onMoveScene={handleMoveScene}
              onUpdateScene={handleUpdateScene}
              onNavigate={(view) => setActiveView(view)}
              onShowToast={showToast}
            />
          )}

          {activeView === 'prompts' && (
            <PromptGeneratorView
              activeScene={activeScene}
              allScenes={project.scenes}
              onUpdateScene={handleUpdateScene}
              onShowToast={showToast}
              onNavigate={(view) => setActiveView(view)}
            />
          )}

          {activeView === 'export' && (
            <ExportCenterView
              project={project}
              onShowToast={showToast}
              onNavigate={(view) => setActiveView(view)}
            />
          )}
        </main>
      </div>

      {/* Reference Workspace Modal */}
      <ReferenceWorkspaceModal
        isOpen={referenceWorkspaceOpen}
        onClose={() => setReferenceWorkspaceOpen(false)}
        project={project}
        onUpdateProject={updateCurrentProject}
        onShowToast={showToast}
      />

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={newProjectModalOpen}
        onClose={() => setNewProjectModalOpen(false)}
        onCreate={handleCreateProject}
      />

      {/* Open Project Modal */}
      <OpenProjectModal
        isOpen={openProjectModalOpen}
        onClose={() => setOpenProjectModalOpen(false)}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={handleSelectProject}
        onDeleteProject={handleDeleteProject}
      />

      {/* Rename Project Modal */}
      <RenameProjectModal
        isOpen={renameProjectModalOpen}
        currentName={project.projectName}
        onClose={() => setRenameProjectModalOpen(false)}
        onRename={handleRenameProject}
      />

      {/* Global Toast */}
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </div>
  );
}
