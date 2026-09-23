import React from 'react';
import { X, Sliders, Cpu, Camera, Volume2, Sparkles, FlipHorizontal, Eye } from 'lucide-react';
import { AppSettings, CameraDeviceInfo, QualityMode } from '../types/vision';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  availableCameras: CameraDeviceInfo[];
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onSelectCamera: (deviceId: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  availableCameras,
  onClose,
  onUpdateSettings,
  onSelectCamera,
}) => {
  if (!isOpen) return null;

  const thresholdPercent = Math.round(settings.confidenceThreshold * 100);
  const thresholdPresets = [30, 40, 50, 60, 70, 80];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#090e1a] border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between bg-[#070b16]/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-['Chakra_Petch',sans-serif] tracking-wider text-white">
                DETECTION SETTINGS
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Configure neural model and camera parameters
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar font-mono text-xs">
          {/* 1. CONFIDENCE THRESHOLD */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-slate-200 font-semibold tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                CONFIDENCE THRESHOLD
              </label>
              <span className="px-2.5 py-1 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-sm">
                {thresholdPercent}%
              </span>
            </div>

            <input
              type="range"
              min="0.30"
              max="0.90"
              step="0.05"
              value={settings.confidenceThreshold}
              onChange={(e) =>
                onUpdateSettings({ confidenceThreshold: parseFloat(e.target.value) })
              }
              className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />

            {/* Presets: 30% — 40% — 50% — 60% — 70% — 80% */}
            <div className="flex items-center justify-between gap-1.5 pt-1">
              {thresholdPresets.map((val) => (
                <button
                  key={val}
                  onClick={() => onUpdateSettings({ confidenceThreshold: val / 100 })}
                  className={`flex-1 py-1.5 rounded-md border text-center font-mono transition-all ${
                    thresholdPercent === val
                      ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 font-bold shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Only predictions meeting or exceeding {thresholdPercent}% confidence are visualized and counted.
            </p>
          </div>

          <div className="h-px bg-slate-800/80" />

          {/* 2. DETECTION QUALITY */}
          <div className="space-y-3">
            <label className="text-slate-200 font-semibold tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              DETECTION QUALITY
            </label>

            <div className="grid grid-cols-3 gap-2">
              {(['performance', 'balanced', 'accuracy'] as QualityMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onUpdateSettings({ qualityMode: mode })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    settings.qualityMode === mode
                      ? 'bg-blue-500/20 border-blue-500/60 text-blue-300 font-bold shadow-sm'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="uppercase font-bold tracking-wider">{mode}</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {mode === 'performance' && 'Lite MobileNet'}
                    {mode === 'balanced' && 'Standard Model'}
                    {mode === 'accuracy' && 'Deep Inference'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-800/80" />

          {/* 3. CAMERA SOURCE SELECTION */}
          <div className="space-y-3">
            <label className="text-slate-200 font-semibold tracking-wider flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              CAMERA INPUT DEVICE
            </label>

            {availableCameras.length > 0 ? (
              <select
                value={settings.selectedCameraId}
                onChange={(e) => {
                  onUpdateSettings({ selectedCameraId: e.target.value });
                  onSelectCamera(e.target.value);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs"
              >
                {availableCameras.map((cam) => (
                  <option key={cam.deviceId} value={cam.deviceId}>
                    {cam.label}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-[11px] text-slate-500">
                Default system camera active. Available devices will appear here once camera permission is granted.
              </p>
            )}
          </div>

          <div className="h-px bg-slate-800/80" />

          {/* 4. TOGGLES & DISPLAY OPTIONS */}
          <div className="space-y-3">
            <span className="text-slate-200 font-semibold tracking-wider block">
              DISPLAY & AUDIO PREFERENCES
            </span>

            <div className="space-y-2">
              {/* Sound toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-slate-200 font-medium">Detection Sound</div>
                    <div className="text-[10px] text-slate-500">
                      Soft harmonic chirp when new objects appear
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.audioFeedback}
                  onChange={(e) => onUpdateSettings({ audioFeedback: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </label>

              {/* Tactical HUD Reticles toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-slate-200 font-medium">Tactical Corner Reticles</div>
                    <div className="text-[10px] text-slate-500">
                      Surveillance-style corner brackets & crosshairs
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.tacticalHud}
                  onChange={(e) => onUpdateSettings({ tacticalHud: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </label>

              {/* Front Camera Mirror toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                <div className="flex items-center gap-2.5">
                  <FlipHorizontal className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-slate-200 font-medium">Mirror Front Camera</div>
                    <div className="text-[10px] text-slate-500">
                      Flip selfie/webcam horizontally like a natural mirror
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.mirrorFrontCamera}
                  onChange={(e) => onUpdateSettings({ mirrorFrontCamera: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </label>

              {/* Confidence badge toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                <div className="flex items-center gap-2.5">
                  <Eye className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-slate-200 font-medium">Show Confidence Percentage</div>
                    <div className="text-[10px] text-slate-500">
                      Render percentage on bounding box badges
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showConfidence}
                  onChange={(e) => onUpdateSettings({ showConfidence: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-cyan-500/20 bg-[#070b16]/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs tracking-wider transition-colors shadow-sm"
          >
            APPLY & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
