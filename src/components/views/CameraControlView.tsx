import { useState } from 'react';
import {
  Video,
  Sparkles,
  Layers,
  Check,
  Film,
  Camera,
  Activity,
  Sliders,
  Eye,
  Aperture,
  Compass,
  Lightbulb,
} from 'lucide-react';
import { CameraConfig, StoryboardScene, ViewMode } from '../../types';
import { ModuleHeader } from '../layout/ModuleHeader';

interface CameraControlViewProps {
  activeScene: StoryboardScene;
  onUpdateCamera: (updated: CameraConfig) => void;
  onApplyToAllScenes: (cam: CameraConfig) => void;
  onShowToast: (msg: string) => void;
  onNavigate?: (view: ViewMode) => void;
}

const UNIVERSAL_CAMERA_RIGS: Array<{ name: string; config: Partial<CameraConfig> }> = [
  {
    name: 'Pelacakan Sinematik Sejajar',
    config: {
      cameraAngle: 'Eye Level (Sejajar Mobil)',
      cameraShot: 'Medium Shot',
      rigType: 'Rig Kamera Tracking Halus',
      focalLength: '35mm Sinematik Standar',
      depthOfField: 'Medium Bokeh f/2.8',
      lighting: 'Pencahayaan Alami dengan Rim Light Bodi',
      cinematicComposition: 'Rule of Thirds',
      cameraMotion: 'Pelacakan sejajar bergerak halus di samping bodi kendaraan',
      aspectRatio: '16:9 Standar',
      shutterMotionBlur: 'Alami 1/48s (Blur Sinematik)',
      colorGrading: 'Sinematik Netral Bersih',
    },
  },
  {
    name: 'Sudut Tiga Perempat Rendah Dinamis',
    config: {
      cameraAngle: 'Low Angle (Sudut Rendah)',
      cameraShot: 'Wide Shot Tiga Perempat',
      rigType: 'Kamera Rendah Tiga Perempat',
      focalLength: '24mm Sudut Lebar',
      depthOfField: 'Deep Focus f/8',
      lighting: 'Golden Hour Rim Lighting',
      cinematicComposition: 'Dynamic Diagonal',
      cameraMotion: 'Pelacakan rendah menonjolkan siluet dan pelek kendaraan',
      aspectRatio: '2.39:1 Anamorphic',
      shutterMotionBlur: 'Alami 1/48s (Blur Sinematik)',
      colorGrading: 'Kontras Hangat Sinematik',
    },
  },
  {
    name: 'Sudut Pandang Kokpit (Interior POV)',
    config: {
      cameraAngle: 'Over-the-Shoulder Pengemudi',
      cameraShot: 'Medium Close-Up Kokpit',
      rigType: 'Kamera Kokpit Bahu Pengemudi',
      focalLength: '28mm Lensa Lebar Kokpit',
      depthOfField: 'Shallow Bokeh f/2.0',
      lighting: 'Cahaya Masuk Lewat Kaca Depan',
      cinematicComposition: 'Leading Lines Kaca Depan',
      cameraMotion: 'Kamera stabil di dalam kabin menangkap setir dan pemandangan luar',
      aspectRatio: '16:9 Standar',
      shutterMotionBlur: 'Alami 1/48s (Blur Sinematik)',
      colorGrading: 'Natural Alami',
    },
  },
  {
    name: 'Close-Up Detail Kendaraan (Makro)',
    config: {
      cameraAngle: 'Eye Level Sejajar Bagian',
      cameraShot: 'Extreme Close-Up (Makro)',
      rigType: 'Lensa Makro Detail',
      focalLength: '85mm Telephoto Kompresi',
      depthOfField: 'Ultra-Shallow Bokeh f/1.4',
      lighting: 'Studio Spotlighting Fokus',
      cinematicComposition: 'Center Framed Detail',
      cameraMotion: 'Panci lambat menyorot emblem, pelek, atau lampu kendaraan',
      aspectRatio: '16:9 Standar',
      shutterMotionBlur: '1/96s Shutter Cepat Tajam',
      colorGrading: 'Studio Bersih Kontras Tinggi',
    },
  },
  {
    name: 'Bidikan Statis Sudut Lebar Menanti',
    config: {
      cameraAngle: 'Eye Level Rendah',
      cameraShot: 'Extreme Wide Shot',
      rigType: 'Tripod Statis Sinematik',
      focalLength: '50mm Perspektif Mata Manusia',
      depthOfField: 'Deep Focus f/11',
      lighting: 'Pencahayaan Alami Lanskap',
      cinematicComposition: 'Center Symmetrical',
      cameraMotion: 'Kamera statis membiarkan kendaraan melintas melintasi frame',
      aspectRatio: '16:9 Standar',
      shutterMotionBlur: 'Alami 1/48s (Blur Sinematik)',
      colorGrading: 'Sinematik Netral Bersih',
    },
  },
  {
    name: 'Kamera Udara Lembut (Aerial Drone)',
    config: {
      cameraAngle: 'Bird Eye / Top-Down Menukik',
      cameraShot: 'High Angle Wide Shot',
      rigType: 'Drone Sinematik Halus',
      focalLength: '24mm Sudut Lebar',
      depthOfField: 'Deep Focus f/8',
      lighting: 'Cahaya Pagi Merata',
      cinematicComposition: 'Leading Lines Jalan',
      cameraMotion: 'Pergerakan meluncur lembut dari atas mengikuti rute kendaraan',
      aspectRatio: '16:9 Standar',
      shutterMotionBlur: 'Alami 1/48s (Blur Sinematik)',
      colorGrading: 'Sinematik Netral Bersih',
    },
  },
];

export function CameraControlView({
  activeScene,
  onUpdateCamera,
  onApplyToAllScenes,
  onShowToast,
  onNavigate,
}: CameraControlViewProps) {
  const current = activeScene.camera;

  const handleChange = <K extends keyof CameraConfig>(field: K, value: CameraConfig[K]) => {
    onUpdateCamera({
      ...current,
      [field]: value,
    });
  };

  const handleLoadRig = (rigName: string, rigConfig: Partial<CameraConfig>) => {
    onUpdateCamera({
      ...current,
      ...rigConfig,
    });
    onShowToast(`Rig kamera dimuat: ${rigName}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Module Navigation Bar */}
      <ModuleHeader
        moduleNumber="MODUL 05"
        moduleTitle="Camera Control (Sinematografi Otomotif)"
        moduleDescription="Konfigurasi angle, shot, pergerakan kamera, fokal lensa, depth of field, tata cahaya, dan komposisi"
        currentView="camera"
        onNavigate={onNavigate}
        prevView={{ view: 'location', label: 'Location Setup' }}
        nextView={{ view: 'storyboard', label: 'Storyboard' }}
      />

      {/* Title & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Video className="h-4 w-4" />
            <span>MODUL 05 // SINEMATOGRAFI, RIG & LENSA KAMERA</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            Kontrol Rig Kamera & Optik Sinematik
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Sudut lensa, kedalaman ruang (DOF), tata cahaya, dan pergerakan kamera untuk <strong className="text-zinc-200">Scene #{activeScene.sceneNumber}: {activeScene.title || 'Scene Aktif'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onApplyToAllScenes(current);
              onShowToast('Pengaturan optik & sinematografi ini berhasil diterapkan ke semua scene!');
            }}
            className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 px-3.5 py-2 text-xs font-semibold text-cyan-300 transition-colors"
            title="Terapkan konfigurasi kamera ini ke seluruh storyboard"
          >
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>Terapkan ke Semua Scene</span>
          </button>
        </div>
      </div>

      {/* Pintasan Cepat Pencahayaan & Cuaca Sinkron (Tahap 4) */}
      {(activeScene.location.timeOfDay?.toLowerCase().includes('malam') ||
        activeScene.location.timeOfDay?.toLowerCase().includes('sore') ||
        activeScene.location.weather?.toLowerCase().includes('hujan')) && (
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <Lightbulb className="h-4 w-4 text-cyan-400 shrink-0" />
            <div>
              <strong className="text-white font-semibold">Pintasan Sinkronisasi Pencahayaan:</strong>{' '}
              <span className="text-cyan-200">
                Latar saat ini: <span className="font-mono underline text-white">{activeScene.location.timeOfDay} ({activeScene.location.weather})</span>. Kamera dapat disinkronkan untuk aperture dan exposure optimal.
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              const isNight = activeScene.location.timeOfDay?.toLowerCase().includes('malam');
              const isSunset = activeScene.location.timeOfDay?.toLowerCase().includes('sore');

              if (isNight) {
                onUpdateCamera({
                  ...current,
                  lighting: 'Pencahayaan Malam Hari Sinematik (Lampu Jalan & Rim Light Bodi)',
                  depthOfField: 'Aperture Lebar f/1.4 (Low-Light Bokeh)',
                  colorGrading: 'Moody Night Contrast & Deep Shadows',
                });
                onShowToast('Kamera disinkronkan dengan suasana Malam Hari (Aperture f/1.4)!');
              } else if (isSunset) {
                onUpdateCamera({
                  ...current,
                  lighting: 'Golden Hour Warm Rim Lighting & Siluet Bodi',
                  colorGrading: 'Kontras Hangat Sinematik Keemasan',
                });
                onShowToast('Kamera disinkronkan dengan Golden Hour!');
              } else {
                onUpdateCamera({
                  ...current,
                  lighting: 'Pencahayaan Dingin Difus dengan Pantulan Aspal Basah',
                  shutterMotionBlur: 'Shutter Cepat 1/120s (Bekukan Tetesan Hujan)',
                });
                onShowToast('Kamera disinkronkan dengan Cuaca Hujan!');
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-cyan-500 text-zinc-950 font-bold shrink-0 hover:bg-cyan-400 transition-colors shadow-sm"
          >
            Sinkronkan Kamera Otomatis
          </button>
        </div>
      )}

      {/* Preset Rig Kamera Universal */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
          Rig & Gaya Pengambilan Gambar Universal (Inspirasi Cepat)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {UNIVERSAL_CAMERA_RIGS.map((rig) => {
            const isMatch = current.rigType === rig.config.rigType;
            return (
              <button
                key={rig.name}
                onClick={() => handleLoadRig(rig.name, rig.config)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isMatch
                    ? 'border-cyan-500 bg-cyan-500/10 text-white shadow-sm'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="text-xs font-bold truncate text-zinc-100">{rig.name}</div>
                <div className="text-[10px] text-cyan-400 mt-1 font-mono truncate">
                  {rig.config.cameraShot} · {rig.config.focalLength}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono truncate">
                  {rig.config.cameraMotion}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Controls Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Bagian 1: Angle & Shot Type */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Eye className="h-4 w-4 text-emerald-400" />
              1. Camera Angle & Camera Shot
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Camera Angle (Sudut Kamera) <span className="text-emerald-400">*</span>
                </label>
                <select
                  value={current.cameraAngle || 'Eye Level (Sejajar Mobil)'}
                  onChange={(e) => handleChange('cameraAngle', e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none cursor-pointer"
                >
                  <option value="Eye Level (Sejajar Mata / Mobil)">Eye Level (Sejajar Mata / Mobil)</option>
                  <option value="Low Angle (Sudut Rendah Berwibawa)">Low Angle (Sudut Rendah Berwibawa)</option>
                  <option value="High Angle (Sudut Pandang Atas)">High Angle (Sudut Pandang Atas)</option>
                  <option value="Worm's Eye (Rendah Dekat Aspal)">Worm's Eye (Rendah Dekat Aspal)</option>
                  <option value="Bird's Eye / Top-Down Menukik">Bird's Eye / Top-Down Menukik</option>
                  <option value="Dutch Angle (Miring Dinamis)">Dutch Angle (Miring Dinamis)</option>
                  <option value="Over-the-Shoulder Pengemudi">Over-the-Shoulder Pengemudi (Kokpit)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Camera Shot (Ukuran Bidikan) <span className="text-emerald-400">*</span>
                </label>
                <select
                  value={current.cameraShot || 'Medium Shot'}
                  onChange={(e) => handleChange('cameraShot', e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none cursor-pointer"
                >
                  <option value="Extreme Wide Shot (Lanskap Penuh)">Extreme Wide Shot (Lanskap Penuh)</option>
                  <option value="Wide Shot (Seluruh Bodi Mobil)">Wide Shot (Seluruh Bodi Mobil)</option>
                  <option value="Medium Wide Shot Tiga Perempat">Medium Wide Shot Tiga Perempat</option>
                  <option value="Medium Shot (Kabin & Bodi Samping)">Medium Shot (Kabin & Bodi Samping)</option>
                  <option value="Close-Up (Lampu, Gril, Pelek, Wajah)">Close-Up (Lampu, Gril, Pelek, Wajah)</option>
                  <option value="Extreme Close-Up / Makro Detail">Extreme Close-Up / Makro Detail</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bagian 2: Lensa, Fokal, Depth of Field & Komposisi */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Aperture className="h-4 w-4 text-cyan-400" />
              2. Lensa, Depth of Field & Komposisi Sinematik
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Panjang Lensa (Focal Length)
                </label>
                <select
                  value={current.focalLength}
                  onChange={(e) => handleChange('focalLength', e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none cursor-pointer"
                >
                  <option value="16mm Ultra-Wide">16mm Ultra-Wide (Perspektif Luas Melengkung)</option>
                  <option value="24mm Sudut Lebar">24mm Sudut Lebar (Proporsi Bodi Dinamis)</option>
                  <option value="35mm Sinematik Standar">35mm Sinematik Standar (Alami & Seimbang)</option>
                  <option value="50mm Perspektif Mata Manusia">50mm Perspektif Mata Manusia</option>
                  <option value="85mm Telephoto Kompresi">85mm Telephoto (Kompresi Latar Belakang)</option>
                  <option value="135mm Super-Telephoto">135mm Super-Telephoto (Isolasi Fokus Penuh)</option>
                  <option value="Anamorphic 2x Lens">Anamorphic 2x Lens (Garis Cahaya Khas Film)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Depth of Field (Kedalaman Ruang)
                </label>
                <select
                  value={current.depthOfField || 'Medium Bokeh f/2.8'}
                  onChange={(e) => handleChange('depthOfField', e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none cursor-pointer"
                >
                  <option value="Ultra-Shallow Bokeh f/1.4">Ultra-Shallow Bokeh f/1.4 (Latar Blur Halus)</option>
                  <option value="Medium Bokeh f/2.8">Medium Bokeh f/2.8 (Separasi Sinematik)</option>
                  <option value="Moderate Depth f/5.6">Moderate Depth f/5.6 (Kabin & Eksterior Jelas)</option>
                  <option value="Deep Focus f/8 - f/11">Deep Focus f/8 - f/11 (Seluruh Latar Tajam)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Komposisi Sinematik
                </label>
                <select
                  value={current.cinematicComposition || 'Rule of Thirds'}
                  onChange={(e) => handleChange('cinematicComposition', e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none cursor-pointer"
                >
                  <option value="Rule of Thirds">Rule of Thirds (Aturan Sepertiga Klasik)</option>
                  <option value="Center Symmetrical">Center Symmetrical (Simetris di Tengah Frame)</option>
                  <option value="Leading Lines Jalan">Leading Lines (Garis Penunjuk Aspal Jalan)</option>
                  <option value="Dynamic Diagonal">Dynamic Diagonal (Sudut Garis Miring Bodi)</option>
                  <option value="Golden Ratio Spiral">Golden Ratio Spiral (Proporsi Keemasan)</option>
                  <option value="Negative Space Minimalist">Negative Space (Ruang Kosong Minimalis)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Rasio Aspek (Aspect Ratio)
                </label>
                <select
                  value={current.aspectRatio}
                  onChange={(e) => handleChange('aspectRatio', e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none cursor-pointer"
                >
                  <option value="16:9 Standar">16:9 Standar Bioskop / Layar Lebar</option>
                  <option value="2.39:1 Anamorphic">2.39:1 Anamorphic Sinematik Lebar</option>
                  <option value="9:16 Vertikal">9:16 Vertikal (Smartphone / Reels)</option>
                  <option value="4:3 Klasik">4:3 Klasik Retro</option>
                  <option value="1:1 Persegi">1:1 Persegi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bagian 3: Movement, Rig, Lighting & Shutter */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              3. Pergerakan Kamera (Movement), Rig & Tata Cahaya
            </h3>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Pergerakan Kamera (Camera Movement) <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                value={current.cameraMotion}
                onChange={(e) => handleChange('cameraMotion', e.target.value)}
                placeholder="Contoh: Pelacakan halus di samping bodi, Kamera meluncur mundur dari depan..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Jenis Rig / Penyangga
                </label>
                <input
                  type="text"
                  value={current.rigType}
                  onChange={(e) => handleChange('rigType', e.target.value)}
                  placeholder="Contoh: Rig Kamera Tracking Halus, Tripod Sinematik..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Tata Pencahayaan Kamera (Lighting)
                </label>
                <input
                  type="text"
                  value={current.lighting || ''}
                  onChange={(e) => handleChange('lighting', e.target.value)}
                  placeholder="Contoh: Rim light keemasan pada tepi bodi, Soft diffused light..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Shutter & Motion Blur
                </label>
                <select
                  value={current.shutterMotionBlur}
                  onChange={(e) => handleChange('shutterMotionBlur', e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none cursor-pointer"
                >
                  <option value="Alami 1/48s (Blur Sinematik)">Alami 1/48s (Blur Sinematik Standar)</option>
                  <option value="1/96s Shutter Cepat Tajam">1/96s Shutter Cepat Tajam</option>
                  <option value="1/250s Shutter Ekstrem">1/250s Shutter Ekstrem (Tanpa Blur)</option>
                  <option value="1/24s Slow Shutter">1/24s Slow Shutter (Streak Cahaya Panjang)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Gradasi Warna (Color Grading)
                </label>
                <select
                  value={current.colorGrading}
                  onChange={(e) => handleChange('colorGrading', e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none cursor-pointer"
                >
                  <option value="Sinematik Netral Bersih">Sinematik Netral Bersih</option>
                  <option value="Kontras Hangat Sinematik">Kontras Hangat Sinematik (Golden)</option>
                  <option value="Studio Bersih Kontras Tinggi">Studio Bersih Kontras Tinggi</option>
                  <option value="Nuansa Sejuk Dingin">Nuansa Sejuk Dingin</option>
                  <option value="Monokrom Hitam Putih">Monokrom Hitam Putih</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Token Ringkasan Kamera */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                Spesifikasi Kamera Scene
              </span>
            </div>
            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/80 font-mono text-xs text-zinc-300 leading-relaxed space-y-1">
              <p className="text-emerald-400 font-bold">
                {current.cameraShot || 'Medium Shot'} · {current.cameraAngle || 'Eye Level'}
              </p>
              <p className="text-zinc-300">
                Lensa: {current.focalLength} ({current.depthOfField || 'f/2.8'})
              </p>
              <p className="text-zinc-400 text-[11px]">
                Gerakan: {current.cameraMotion}
              </p>
              <p className="text-cyan-400 text-[11px]">
                Komposisi: {current.cinematicComposition || 'Rule of Thirds'} · Rasio: {current.aspectRatio}
              </p>
              {current.lighting && (
                <p className="text-amber-400 text-[11px]">
                  Cahaya: {current.lighting}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
