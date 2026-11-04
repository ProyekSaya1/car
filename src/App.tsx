import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Toast } from './components/ui/Toast';
import { NewProjectModal, OpenProjectModal } from './components/modals/ProjectModals';
import { DashboardView } from './components/views/DashboardView';
import { VehicleSetupView } from './components/views/VehicleSetupView';
import { CharacterSetupView } from './components/views/CharacterSetupView';
import { LocationSetupView } from './components/views/LocationSetupView';
import { CameraControlView } from './components/views/CameraControlView';
import { StoryboardView } from './components/views/StoryboardView';
import { PromptGeneratorView } from './components/views/PromptGeneratorView';
import { ExportCenterView } from './components/views/ExportCenterView';
import { INITIAL_PROJECTS, createBlankProject, createBlankScene } from './data/initialData';
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

const STORAGE_PROJECTS_KEY = 'car_scene_engine_universal_v2';
const STORAGE_ACTIVE_ID_KEY = 'car_scene_engine_universal_active_id_v2';

export default function App() {
  const [projects, setProjects] = useState<ProjectState[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROJECTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure parsed does not contain legacy drift/Nissan demo projects
        if (Array.isArray(parsed) && parsed.length > 0) {
          const isLegacy = JSON.stringify(parsed).toLowerCase().includes('nissan') ||
            JSON.stringify(parsed).toLowerCase().includes('touge') ||
            JSON.stringify(parsed).toLowerCase().includes('nightfall');
          if (!isLegacy) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Gagal memuat data dari localStorage, menggunakan initial data:', e);
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

  const [activeView, setActiveView] = useState<ViewMode>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [openProjectModalOpen, setOpenProjectModalOpen] = useState(false);

  const [toast, setToast] = useState<{ message: string; visible: boolean; type?: 'success' | 'info' }>({
    message: '',
    visible: false,
    type: 'success',
  });

  // Auto-sync projects to localStorage with quota overflow handling
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
    } catch (e) {
      console.warn('Penyimpanan lokal penuh atau tidak diizinkan:', e);
    }
  }, [projects]);

  // Auto-sync activeProjectId to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVE_ID_KEY, activeProjectId);
    } catch (e) {}
  }, [activeProjectId]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, visible: true, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2800);
  };

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

  // Handler for New Project - Universal Blank Project
  const handleCreateProject = (name: string, notes: string, initialVehicleCategory: VehicleCategory) => {
    const newProject = createBlankProject(name);
    newProject.directorNotes = notes || 'Catatan arahan visual otomotif untuk proyek baru.';
    if (newProject.scenes[0]) {
      newProject.scenes[0].vehicle.category = initialVehicleCategory;
    }

    setProjects((prev) => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
    showToast(`Proyek baru "${name}" berhasil dibuat dengan pengaturan kosong!`);
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

  const handleUpdateVehicleGeneric = (vehicleName: string, make: string, model: string) => {
    updateCurrentProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.id === prev.activeSceneId
          ? {
              ...s,
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
    newScene.title = `Scene 0${nextNumber}: Sekuens Visual`;
    newScene.description = 'Tentukan pergerakan kendaraan, pencahayaan, dan komposisi sudut pandang kamera.';
    // Inherit active vehicle to maintain continuity
    newScene.vehicle = { ...activeScene.vehicle, id: `v-${Date.now()}` };

    updateCurrentProject((prev) => ({
      ...prev,
      activeSceneId: newScene.id,
      scenes: [...prev.scenes, newScene],
    }));
    showToast(`Scene #${nextNumber} berhasil ditambahkan!`);
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
      vehicle: { ...target.vehicle },
      character: { ...target.character },
      location: { ...target.location },
      camera: { ...target.camera },
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
      scenes: prev.scenes.map((s) => (s.id === prev.activeSceneId ? { ...s, vehicle } : s)),
    }));
  };

  const handleApplyVehicleToAll = (vehicle: VehicleConfig) => {
    updateCurrentProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => ({ ...s, vehicle: { ...vehicle } })),
    }));
  };

  const handleUpdateCharacter = (character: CharacterConfig) => {
    updateCurrentProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => (s.id === prev.activeSceneId ? { ...s, character } : s)),
    }));
  };

  const handleApplyCharacterToAll = (character: CharacterConfig) => {
    updateCurrentProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => ({ ...s, character: { ...character } })),
    }));
  };

  const handleUpdateLocation = (location: LocationConfig) => {
    updateCurrentProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => (s.id === prev.activeSceneId ? { ...s, location } : s)),
    }));
  };

  const handleApplyLocationToAll = (location: LocationConfig) => {
    updateCurrentProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => ({ ...s, location: { ...location } })),
    }));
  };

  const handleUpdateCamera = (camera: CameraConfig) => {
    updateCurrentProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => (s.id === prev.activeSceneId ? { ...s, camera } : s)),
    }));
  };

  const handleApplyCameraToAll = (camera: CameraConfig) => {
    updateCurrentProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => ({ ...s, camera: { ...camera } })),
    }));
  };

  const handleUpdateNotes = (directorNotes: string) => {
    updateCurrentProject((prev) => ({ ...prev, directorNotes }));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        project={project}
        activeView={activeView}
        onNavigate={(view) => setActiveView(view)}
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        onSelectScene={handleSelectScene}
        onQuickGenerate={() => setActiveView('prompts')}
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

        {/* Viewport Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {activeView === 'dashboard' && (
            <DashboardView
              project={project}
              totalProjects={projects.length}
              totalStoryboards={projects.length}
              onNavigate={(view) => setActiveView(view)}
              onSelectScene={handleSelectScene}
              onAddScene={handleAddScene}
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
            />
          )}

          {activeView === 'character' && (
            <CharacterSetupView
              activeScene={activeScene}
              onUpdateCharacter={handleUpdateCharacter}
              onApplyToAllScenes={handleApplyCharacterToAll}
              onShowToast={showToast}
            />
          )}

          {activeView === 'location' && (
            <LocationSetupView
              activeScene={activeScene}
              onUpdateLocation={handleUpdateLocation}
              onApplyToAllScenes={handleApplyLocationToAll}
              onShowToast={showToast}
            />
          )}

          {activeView === 'camera' && (
            <CameraControlView
              activeScene={activeScene}
              onUpdateCamera={handleUpdateCamera}
              onApplyToAllScenes={handleApplyCameraToAll}
              onShowToast={showToast}
            />
          )}

          {activeView === 'storyboard' && (
            <StoryboardView
              scenes={project.scenes}
              activeSceneId={project.activeSceneId}
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
            />
          )}

          {activeView === 'export' && (
            <ExportCenterView project={project} onShowToast={showToast} />
          )}
        </main>
      </div>

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

      {/* Global Toast */}
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </div>
  );
}
