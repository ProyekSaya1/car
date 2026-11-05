import {
  Gauge,
  Activity,
  ShieldCheck,
  Disc,
  Zap,
  Wind,
  Layers,
  Sparkles,
  Volume2,
  Radio,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import { StoryboardScene, VehicleDrivingAction, ViewMode } from '../../types';

interface VehicleActionSectionProps {
  activeScene: StoryboardScene;
  onUpdateAction: (action: VehicleDrivingAction) => void;
  onApplyToAllScenes?: (action: VehicleDrivingAction) => void;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
  onNavigate?: (view: ViewMode) => void;
}

export function VehicleActionSection({
  activeScene,
  onUpdateAction,
  onApplyToAllScenes,
  onShowToast,
}: VehicleActionSectionProps) {
  const currentAction: VehicleDrivingAction = activeScene.drivingAction || {
    engineStatus: 'Idle (Mesin Menyala)',
    seatbelt: 'Terpasang',
    activeGear: 'D (Drive)',
    parkingBrakeState: 'Nonaktif',
    maneuver: 'Melaju lurus stabil',
    estimatedSpeed: '40 km/h (Perkotaan)',
    headlights: 'Lampu Dekat',
    turnSignal: 'Mati',
    wipers: 'Mati',
    cabinClimate: 'AC Aktif',
    audioInfotainment: 'Layar Navigasi Aktif',
    windows: 'Tertutup Penuh',
  };

  const v = activeScene.vehicle;
  const isEV =
    v.category === 'Mobil Listrik (EV)' ||
    v.engineType === 'Motor Listrik (EV)' ||
    v.transmission === 'Direct Drive EV';
  const isManual = v.transmission === 'Manual (MT)';
  const isEPB =
    v.parkingBrake === 'Electronic Parking Brake (EPB)' ||
    v.parkingBrake === 'Electronic Parking Brake + Auto-Hold';

  const handleChange = <K extends keyof VehicleDrivingAction>(
    field: K,
    val: VehicleDrivingAction[K]
  ) => {
    onUpdateAction({
      ...currentAction,
      [field]: val,
    });
  };

  // Tailored options based on vehicle specs
  const engineStatusOptions = isEV
    ? [
        'Sistem Mati (Power OFF)',
        'Sistem Siaga (READY Mode)',
        'Meluncur Tenang (Silent Cruise)',
        'Akselerasi Instant EV Torque',
        'Regenerative Braking Aktif',
        'Pengereman Keras (Emergency Stop)',
        'Parkir Tenang',
      ]
    : [
        'Mesin Mati (Off)',
        'Kontak Aksesori ON (Panel Nyala)',
        'Idle Halus (Mesin Menyala)',
        'Akselerasi Bertenaga (High RPM)',
        'Deselerasi (Engine Braking)',
        'Pengereman Keras (Hard Braking)',
        'Manuver Belok Tajam / Cornering',
        'Parkir Netral',
      ];

  const gearOptions = isEV
    ? [
        'P (Parkir)',
        'R (Mundur / Reverse)',
        'N (Netral)',
        'D (Drive / Maju)',
        'One-Pedal Drive Mode',
        'B / Max Regenerative',
      ]
    : isManual
    ? [
        'Netral (N)',
        'Gigi 1 (Mulai Jalan)',
        'Gigi 2 (Kecepatan Rendah)',
        'Gigi 3 (Akselerasi Kota)',
        'Gigi 4 (Jelajah Sedang)',
        'Gigi 5 (Kecepatan Tinggi)',
        'Gigi 6 (Cruising Jalan Tol)',
        'Mundur (Reverse / R)',
      ]
    : [
        'P (Park)',
        'R (Reverse)',
        'N (Neutral)',
        'D (Drive Otomatis)',
        'S (Sport / Manual Mode)',
        'Paddle Shift (+/-)',
        'L / Low Gear (Tanjakan)',
      ];

  const parkingBrakeOptions = isEPB
    ? [
        'EPB Aktif (Switch Ditarik / Terkunci)',
        'EPB Rilis (Switch Ditekan / Nonaktif)',
        'Auto-Hold Aktif Siaga',
      ]
    : [
        'Rem Tangan Manual Ditarik Terkunci',
        'Rem Tangan Dirilis (Diturunkan)',
        'Tarik Sebagian',
      ];

  const maneuverOptions = [
    'Melaju lurus stabil di lajur',
    'Belok ke kiri dengan sudut halus',
    'Belok ke kanan dengan sudut halus',
    'Menyalip kendaraan di depan (Overtaking)',
    'Putar balik (U-Turn) terkendali',
    'Berhenti halus di lampu merah / persimpangan',
    'Melambat memasuki tikungan tajam',
    'Keluar dari tikungan dengan traksi mantap',
    'Manuver parkir paralel / mundur',
    'Melintasi tanjakan curam',
    'Melintasi turunan panjang',
    'Jelajah santai menikmati pemandangan',
  ];

  const speedOptions = [
    { label: '0 km/h (Diam / Berhenti)', desc: 'Kendaraan berhenti total di tempat' },
    { label: '20-40 km/h (Kecepatan Rendah)', desc: 'Lalu lintas perkotaan, parkir, gang sempit' },
    { label: '60-80 km/h (Kecepatan Menengah)', desc: 'Jalan arteri luar kota, boulevard luas' },
    { label: '100+ km/h (Kecepatan Tinggi)', desc: 'Jalan tol bebas hambatan, trek terbuka' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Activity className="h-4 w-4" />
            <span>AKSI KENDARAAN // STATUS REALISTIS PER SCENE</span>
          </div>
          <h3 className="text-base font-bold text-white mt-0.5">
            Aksi & Status Operasional Kendaraan
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Spesifikasi menyesuaikan mobil aktif:{' '}
            <strong className="text-emerald-400">
              {v.make || 'Mobil'} {v.model || ''} ({v.transmission}, {v.parkingBrake})
            </strong>
          </p>
        </div>

        {onApplyToAllScenes && (
          <button
            onClick={() => {
              onApplyToAllScenes(currentAction);
              onShowToast('Aksi kendaraan berhasil disalin ke seluruh scene!', 'success');
            }}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-colors shrink-0"
            title="Terapkan status aksi ini ke semua scene"
          >
            <Layers className="h-3.5 w-3.5 text-emerald-400" />
            <span>Terapkan ke Semua Scene</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Status Mesin & Kontak */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Zap className="h-4 w-4 text-emerald-400" />
            <span>Status Kontak & Penggerak</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            {isEV ? 'Status sistem motor listrik baterai' : 'Status putaran mesin & starter'}
          </p>
          <div className="space-y-1.5">
            {engineStatusOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => handleChange('engineStatus', opt)}
                className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all ${
                  currentAction.engineStatus === opt
                    ? 'border-emerald-500 bg-emerald-500/15 text-white font-semibold'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Transmisi & Gigi */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <span>Posisi Transmisi ({v.transmission || 'Standar'})</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            {isEV
              ? 'Mode kendali motor listrik (Single Speed)'
              : isManual
              ? 'Posisi tuas gigi manual 1-6 / R'
              : 'Posisi tuas shifter otomatis PRND'}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {gearOptions.map((gear) => (
              <button
                key={gear}
                onClick={() => handleChange('activeGear', gear)}
                className={`p-2.5 rounded-xl border text-left text-xs truncate transition-all ${
                  currentAction.activeGear === gear
                    ? 'border-cyan-500 bg-cyan-500/15 text-white font-semibold'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
                title={gear}
              >
                {gear}
              </button>
            ))}
          </div>

          {/* Rem Tangan */}
          <div className="pt-2 border-t border-zinc-800/80">
            <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Disc className="h-3.5 w-3.5 text-emerald-400" />
              Rem Parkir ({isEPB ? 'EPB' : 'Manual Tarik'})
            </label>
            <div className="space-y-1">
              {parkingBrakeOptions.map((pb) => (
                <button
                  key={pb}
                  onClick={() => handleChange('parkingBrakeState', pb)}
                  className={`w-full p-2 rounded-lg border text-left text-xs transition-all ${
                    currentAction.parkingBrakeState === pb
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-medium'
                      : 'border-zinc-800/80 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {pb}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Kecepatan Estimasi & Sabuk */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Gauge className="h-4 w-4 text-emerald-400" />
            <span>Estimasi Kecepatan Kendaraan</span>
          </div>
          <div className="space-y-1.5">
            {speedOptions.map((spd) => (
              <button
                key={spd.label}
                onClick={() => handleChange('estimatedSpeed', spd.label)}
                className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all ${
                  currentAction.estimatedSpeed === spd.label
                    ? 'border-emerald-500 bg-emerald-500/15 text-white font-semibold'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className="font-medium">{spd.label}</div>
                <div className="text-[10px] text-zinc-500">{spd.desc}</div>
              </button>
            ))}
          </div>

          {/* Sabuk Pengaman */}
          <div className="pt-2 border-t border-zinc-800/80">
            <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
              Sabuk Pengaman Kabin
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Terpasang', 'Belum Terpasang'].map((sb) => (
                <button
                  key={sb}
                  onClick={() => handleChange('seatbelt', sb)}
                  className={`p-2 rounded-lg border text-center text-xs transition-all ${
                    currentAction.seatbelt === sb
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300 font-semibold'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {sb}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Manuver Kendaraan & Fitur Kabin */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Manuver Pergerakan */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span>Manuver & Pola Pergerakan Scene</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {maneuverOptions.map((mnv) => (
              <button
                key={mnv}
                onClick={() => handleChange('maneuver', mnv)}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                  currentAction.maneuver === mnv
                    ? 'border-emerald-500 bg-emerald-500/15 text-white font-semibold'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <span>{mnv}</span>
                {currentAction.maneuver === mnv && (
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 ml-1.5" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Kontrol Kabin Aktif */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Radio className="h-4 w-4 text-cyan-400" />
            <span>Instrumen & Kelistrikan Kabin</span>
          </div>

          {/* Lampu Utama */}
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">Lampu Eksterior</label>
            <div className="grid grid-cols-2 gap-1.5">
              {['Mati', 'DRL (Siang)', 'Lampu Dekat', 'Lampu Jauh'].map((l) => (
                <button
                  key={l}
                  onClick={() => handleChange('headlights', l)}
                  className={`p-1.5 rounded-lg border text-center text-xs truncate ${
                    currentAction.headlights === l
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300 font-semibold'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Lampu Sein */}
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">Lampu Sein</label>
            <div className="grid grid-cols-4 gap-1.5">
              {['Mati', 'Kiri', 'Kanan', 'Hazard'].map((s) => (
                <button
                  key={s}
                  onClick={() => handleChange('turnSignal', s)}
                  className={`p-1.5 rounded-lg border text-center text-xs ${
                    currentAction.turnSignal === s
                      ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-semibold'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Wiper & Jendela */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Wiper Kaca</label>
              <select
                value={currentAction.wipers}
                onChange={(e) => handleChange('wipers', e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="Mati">Mati</option>
                <option value="Pelan (Intermittent)">Pelan (Intermittent)</option>
                <option value="Cepat">Cepat</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Kaca Jendela</label>
              <select
                value={currentAction.windows}
                onChange={(e) => handleChange('windows', e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="Tertutup Penuh">Tertutup Penuh</option>
                <option value="Terbuka Sedikit">Terbuka Sedikit</option>
                <option value="Terbuka Setengah">Terbuka Setengah</option>
                <option value="Terbuka Penuh">Terbuka Penuh</option>
              </select>
            </div>
          </div>

          {/* AC & Infotainment */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Pendingin Kabin</label>
              <select
                value={currentAction.cabinClimate}
                onChange={(e) => handleChange('cabinClimate', e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="AC Aktif (Hembusan Dingin)">AC Aktif</option>
                <option value="AC Mati">AC Mati</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Head Unit Layar</label>
              <select
                value={currentAction.audioInfotainment}
                onChange={(e) => handleChange('audioInfotainment', e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="Layar Navigasi Peta Aktif">Layar Peta Aktif</option>
                <option value="Audio Musik Menyala">Audio Menyala</option>
                <option value="Layar Mati (Standby)">Layar Standby</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
