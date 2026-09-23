import React, { useRef, useEffect, useState } from 'react';
import {
  Play,
  Square,
  SwitchCamera,
  Camera as CameraIcon,
  Maximize2,
  Minimize2,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Shield,
  Crosshair,
  Sparkles,
} from 'lucide-react';
import { CameraStatus, ModelStatus, DetectionResult } from '../types/vision';
import { drawDetections, captureDetectionImage } from '../utils/canvasRenderer';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraStatus: CameraStatus;
  modelStatus: ModelStatus;
  cameraError: string | null;
  modelError: string | null;
  facingMode: 'user' | 'environment';
  activeCameraLabel: string;
  detections: DetectionResult[];
  tacticalHud: boolean;
  showLabels: boolean;
  showConfidence: boolean;
  mirrorFrontCamera: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onSwitchCamera: () => void;
  onRetryModel: () => void;
  onCaptureSnapshot: (dataUrl: string) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  cameraStatus,
  modelStatus,
  cameraError,
  modelError,
  facingMode,
  activeCameraLabel,
  detections,
  tacticalHud,
  showLabels,
  showConfidence,
  mirrorFrontCamera,
  onStartCamera,
  onStopCamera,
  onSwitchCamera,
  onRetryModel,
  onCaptureSnapshot,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // Monitor fullscreen state changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen error:', err);
    }
  };

  // Synchronize canvas resolution and render detections overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas) return;

    if (cameraStatus !== 'active' || !video) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // Match canvas coordinate buffer exactly to actual video dimensions
    const vidW = video.videoWidth || 1280;
    const vidH = video.videoHeight || 720;
    if (canvas.width !== vidW || canvas.height !== vidH) {
      canvas.width = vidW;
      canvas.height = vidH;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const shouldMirror = mirrorFrontCamera && facingMode === 'user';
    drawDetections(ctx, detections, vidW, vidH, {
      tacticalHud,
      showLabels,
      showConfidence,
      isMirrored: shouldMirror,
    });
  }, [
    detections,
    cameraStatus,
    videoRef,
    tacticalHud,
    showLabels,
    showConfidence,
    mirrorFrontCamera,
    facingMode,
  ]);

  // Handle snapshot capture
  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || cameraStatus !== 'active') return;

    setIsCapturing(true);
    const shouldMirror = mirrorFrontCamera && facingMode === 'user';
    const snapshotUrl = captureDetectionImage(video, detections, {
      tacticalHud,
      showLabels,
      showConfidence,
      isMirrored: shouldMirror,
    });

    onCaptureSnapshot(snapshotUrl);

    setTimeout(() => {
      setIsCapturing(false);
    }, 400);
  };

  const isLive = cameraStatus === 'active' && modelStatus === 'detecting';

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden bg-[#060a14] border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)] flex flex-col ${
        isFullscreen ? 'h-screen p-4 justify-between bg-black' : ''
      }`}
    >
      {/* Visual Camera Stage */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] max-h-[70vh] bg-[#04060c] flex items-center justify-center overflow-hidden">
        {/* Flash animation during snapshot capture */}
        {isCapturing && (
          <div className="absolute inset-0 z-50 bg-white/80 animate-ping pointer-events-none" />
        )}

        {/* Video feed element */}
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          className={`w-full h-full object-contain ${
            mirrorFrontCamera && facingMode === 'user' ? 'scale-x-[-1]' : ''
          } ${cameraStatus === 'active' ? 'block' : 'hidden'}`}
        />

        {/* Real-time bounding box canvas overlay */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full object-contain pointer-events-none z-10 ${
            cameraStatus === 'active' ? 'block' : 'hidden'
          }`}
        />

        {/* Active HUD Overlays (Top corners) */}
        {cameraStatus === 'active' && (
          <>
            {/* Top-Left Telemetry */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="truncate max-w-[180px] sm:max-w-[280px]">
                {activeCameraLabel}
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300 uppercase">{facingMode}</span>
            </div>

            {/* Top-Right Reticle Indicator */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur border border-slate-700/80 text-[11px] font-mono text-slate-300">
              <Crosshair className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
              <span>
                {detections.length} {detections.length === 1 ? 'OBJECT' : 'OBJECTS'} IN VIEW
              </span>
            </div>

            {/* Tactical Grid Corner Brackets */}
            <div className="absolute inset-4 pointer-events-none border border-cyan-500/10 rounded-xl">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
            </div>
          </>
        )}

        {/* 1. STATE: Model Loading Overlay */}
        {cameraStatus === 'active' && modelStatus === 'loading' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-6 text-center">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin flex items-center justify-center" />
              <Sparkles className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <h3 className="text-lg font-bold font-['Chakra_Petch',sans-serif] tracking-wider text-white mb-1">
              Loading AI Model...
            </h3>
            <p className="text-xs text-slate-400 font-mono max-w-sm">
              Initializing TensorFlow.js neural network and downloading COCO weights directly to your browser memory.
            </p>
            <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
            </div>
          </div>
        )}

        {/* 2. STATE: Model Error State */}
        {modelStatus === 'error' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm p-6 text-center">
            <div className="p-3 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 mb-3">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold font-['Chakra_Petch',sans-serif] text-white mb-1">
              Unable to load the AI model
            </h3>
            <p className="text-xs text-slate-300 font-mono max-w-md mb-4">
              {modelError || 'Network or browser error during TensorFlow model initialization.'}
            </p>
            <button
              onClick={onRetryModel}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold tracking-wider transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              <RefreshCw className="w-4 h-4" />
              RETRY MODEL
            </button>
          </div>
        )}

        {/* 3. STATE: Camera Error State */}
        {cameraStatus === 'error' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-6 text-center">
            <div className="p-3 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 mb-3">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold font-['Chakra_Petch',sans-serif] text-white mb-1">
              Camera Access Failed
            </h3>
            <p className="text-sm text-slate-300 font-mono max-w-md mb-4">
              {cameraError || 'Camera permission is required for real-time detection.'}
            </p>
            <button
              onClick={onStartCamera}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold tracking-wider transition-colors shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              <RefreshCw className="w-4 h-4" />
              TRY AGAIN
            </button>
          </div>
        )}

        {/* 4. STATE: Camera Requesting Permission State */}
        {cameraStatus === 'requesting' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm p-6 text-center">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-3" />
            <h3 className="text-lg font-bold font-['Chakra_Petch',sans-serif] text-white mb-1">
              Requesting Camera Access
            </h3>
            <p className="text-xs text-slate-400 font-mono max-w-sm">
              Please grant camera permissions when prompted by your browser.
            </p>
          </div>
        )}

        {/* 5. STATE: Empty State (Camera Off) */}
        {cameraStatus === 'idle' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#080d1a] via-[#05070e] to-[#04060b]">
            {/* Cybernetic HUD Graphic */}
            <div className="relative w-28 h-28 mb-5 flex items-center justify-center">
              {/* Outer rotating ring */}
              <div className="absolute inset-0 rounded-full border border-cyan-500/20 border-dashed animate-spin-slow" />
              {/* Inner glowing ring */}
              <div className="absolute inset-2 rounded-full border border-cyan-500/40" />
              {/* Center icon */}
              <div className="w-16 h-16 rounded-full bg-cyan-950/40 border border-cyan-500/60 flex items-center justify-center text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                <CameraIcon className="w-8 h-8" />
              </div>
              {/* Corner crosshairs */}
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />
            </div>

            <h2 className="text-2xl font-bold font-['Chakra_Petch',sans-serif] tracking-wider text-white mb-2">
              AI Vision Ready
            </h2>
            <p className="text-sm text-slate-400 font-mono max-w-md mb-6 leading-relaxed">
              Start your laptop webcam or mobile camera to begin real-time object detection with live neural bounding boxes.
            </p>

            {/* Primary START CAMERA CTA */}
            <button
              onClick={onStartCamera}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold tracking-wider text-sm transition-all duration-300 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-white" />
              START CAMERA
            </button>

            {/* Privacy Reassurance Note */}
            <div className="mt-8 flex items-center gap-2 text-xs font-mono text-slate-500 max-w-lg">
              <Shield className="w-4 h-4 text-cyan-500/70 shrink-0" />
              <span>
                Camera processing happens locally in your browser whenever supported. Camera access is used only for detection.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar (Per prompt: START CAMERA | STOP | SWITCH | CAPTURE | FULLSCREEN) */}
      <div className="w-full bg-[#080d19] border-t border-cyan-500/20 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 z-30">
        {/* Left / Center Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {cameraStatus !== 'active' ? (
            <button
              onClick={onStartCamera}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs tracking-wider transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <Play className="w-4 h-4 fill-current" />
              START CAMERA
            </button>
          ) : (
            <button
              onClick={onStopCamera}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-mono font-bold text-xs tracking-wider transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)]"
            >
              <Square className="w-4 h-4 fill-current" />
              STOP CAMERA
            </button>
          )}

          {/* Switch Camera button */}
          <button
            onClick={onSwitchCamera}
            disabled={cameraStatus !== 'active'}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-mono text-xs border transition-all ${
              cameraStatus === 'active'
                ? 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-cyan-500/50'
                : 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
            title="Switch front / rear camera"
          >
            <SwitchCamera className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">SWITCH CAMERA</span>
            <span className="sm:hidden">SWITCH</span>
          </button>

          {/* Capture Snapshot button */}
          <button
            onClick={handleCapture}
            disabled={cameraStatus !== 'active'}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-mono text-xs border transition-all ${
              cameraStatus === 'active'
                ? 'bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-200 border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                : 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
            title="Capture current camera frame with bounding boxes"
          >
            <CameraIcon className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">CAPTURE DETECTION</span>
            <span className="sm:hidden">CAPTURE</span>
          </button>
        </div>

        {/* Right Actions: Fullscreen & Status Info */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 font-mono text-xs transition-colors"
            title="Toggle full screen view"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span className="hidden md:inline">EXIT FULLSCREEN</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span className="hidden md:inline">FULL SCREEN</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
