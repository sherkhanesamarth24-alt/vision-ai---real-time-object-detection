import React from 'react';
import { Target, Layers, Gauge, Award, Camera, Cpu } from 'lucide-react';
import { CameraStatus, ModelStatus } from '../types/vision';

interface StatsCardsProps {
  totalObjects: number;
  objectTypesCount: number;
  fps: number;
  avgConfidence: number;
  cameraStatus: CameraStatus;
  modelStatus: ModelStatus;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalObjects,
  objectTypesCount,
  fps,
  avgConfidence,
  cameraStatus,
  modelStatus,
}) => {
  // Format readable status text
  const getStatusDisplay = () => {
    if (cameraStatus === 'error') return { text: 'Camera Error', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
    if (modelStatus === 'error') return { text: 'Model Error', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
    if (cameraStatus === 'requesting') return { text: 'Starting...', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
    if (modelStatus === 'loading') return { text: 'Loading AI...', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' };
    if (cameraStatus === 'active' && modelStatus === 'detecting') {
      return { text: 'Detecting', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    }
    if (cameraStatus === 'active') return { text: 'Ready', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' };
    return { text: 'Camera Off', color: 'text-slate-400', bg: 'bg-slate-800/40 border-slate-700/50' };
  };

  const statusInfo = getStatusDisplay();

  return (
    <div className="w-full space-y-3">
      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* TOTAL OBJECTS */}
        <div className="relative overflow-hidden rounded-xl bg-[#090e1a]/80 backdrop-blur border border-cyan-500/20 p-4 shadow-lg hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
              Total Objects
            </span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white">
              {totalObjects}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {totalObjects === 1 ? 'target' : 'targets'}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <div
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                totalObjects > 0 ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'bg-slate-800'
              }`}
            />
          </div>
        </div>

        {/* OBJECT TYPES */}
        <div className="relative overflow-hidden rounded-xl bg-[#090e1a]/80 backdrop-blur border border-blue-500/20 p-4 shadow-lg hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
              Object Types
            </span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white">
              {objectTypesCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {objectTypesCount === 1 ? 'class' : 'classes'}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <div
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                objectTypesCount > 0 ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-slate-800'
              }`}
            />
          </div>
        </div>

        {/* FPS */}
        <div className="relative overflow-hidden rounded-xl bg-[#090e1a]/80 backdrop-blur border border-emerald-500/20 p-4 shadow-lg hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
              Inference Rate
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white">
              {fps}
            </span>
            <span className="text-xs text-emerald-400 font-mono font-bold">FPS</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <div
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                fps >= 24
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                  : fps > 10
                  ? 'bg-amber-500'
                  : 'bg-slate-800'
              }`}
            />
          </div>
        </div>

        {/* AVERAGE CONFIDENCE */}
        <div className="relative overflow-hidden rounded-xl bg-[#090e1a]/80 backdrop-blur border border-purple-500/20 p-4 shadow-lg hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
              Avg Confidence
            </span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white">
              {avgConfidence}
              <span className="text-xl sm:text-2xl font-normal text-purple-400">%</span>
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <div className="h-1 flex-1 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)] transition-all duration-300"
                style={{ width: `${avgConfidence}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Auxiliary Status Badges Row (Section 7 specs: STATUS & CAMERA) */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#080d18]/60 border border-slate-800/80 text-xs font-mono">
        <div className="flex items-center gap-4">
          {/* CAMERA STATUS */}
          <div className="flex items-center gap-2">
            <Camera className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">CAMERA:</span>
            <span
              className={`font-semibold ${
                cameraStatus === 'active' ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {cameraStatus === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* ENGINE STATUS */}
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">ENGINE:</span>
            <span className={`px-2 py-0.5 rounded border text-[11px] ${statusInfo.bg} ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 hidden sm:block">
          COCO-SSD • TensorFlow.js Browser Engine
        </div>
      </div>
    </div>
  );
};
