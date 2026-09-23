import React from 'react';
import { Camera, Settings, Volume2, VolumeX, ShieldCheck, Eye } from 'lucide-react';
import { CameraStatus, ModelStatus } from '../types/vision';

interface HeaderProps {
  cameraStatus: CameraStatus;
  modelStatus: ModelStatus;
  fps: number;
  audioFeedback: boolean;
  onToggleAudio: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cameraStatus,
  modelStatus,
  fps,
  audioFeedback,
  onToggleAudio,
  onOpenSettings,
}) => {
  const isLive = cameraStatus === 'active' && modelStatus === 'detecting';

  return (
    <header className="w-full bg-[#070b14]/80 backdrop-blur-md border-b border-cyan-500/20 px-4 py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Eye className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-wider font-['Chakra_Petch',sans-serif] bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                VISION AI
              </h1>
              <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                v2.4 Core
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono hidden sm:block">
              Real-Time Client-Side Object Detection
            </p>
          </div>
        </div>

        {/* Center: Live Engine Telemetry (Desktop) */}
        <div className="hidden md:flex items-center gap-3 font-mono text-xs">
          {isLive ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold tracking-wider">● LIVE DETECTION</span>
              <span className="text-slate-400">|</span>
              <span className="text-emerald-300 font-bold">{fps} FPS</span>
            </div>
          ) : cameraStatus === 'active' ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>CAMERA ACTIVE (PREPARING)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span>STANDBY MODE</span>
            </div>
          )}

          <div className="hidden lg:flex items-center gap-1.5 text-slate-400 text-[11px] px-2 py-1 rounded bg-slate-900/40 border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>100% Client-Side Privacy</span>
          </div>
        </div>

        {/* Right: Quick Controls & Settings */}
        <div className="flex items-center gap-2">
          {/* Audio Feedback Toggle */}
          <button
            onClick={onToggleAudio}
            title={audioFeedback ? 'Mute detection sound' : 'Enable detection sound'}
            className={`p-2 rounded-lg border transition-all duration-200 ${
              audioFeedback
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
            aria-label="Toggle Detection Audio"
          >
            {audioFeedback ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 hover:border-cyan-500/40 text-slate-200 hover:text-cyan-300 text-xs font-mono transition-all duration-200 shadow-sm"
            aria-label="Open Vision AI Settings"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
