import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { CameraView } from './components/CameraView';
import { StatsCards } from './components/StatsCards';
import { DetectedObjectsPanel } from './components/DetectedObjectsPanel';
import { DetectionHistoryPanel } from './components/DetectionHistoryPanel';
import { SettingsModal } from './components/SettingsModal';
import { CaptureModal } from './components/CaptureModal';
import { useCamera } from './hooks/useCamera';
import { useObjectDetector } from './hooks/useObjectDetector';
import { AppSettings } from './types/vision';
import { Cpu, Eye, ShieldCheck, Terminal, HelpCircle } from 'lucide-react';

const DEFAULT_SETTINGS: AppSettings = {
  confidenceThreshold: 0.50, // 50% default per specification
  qualityMode: 'balanced',
  audioFeedback: false,
  mirrorFrontCamera: true,
  tacticalHud: true,
  showLabels: true,
  showConfidence: true,
  selectedCameraId: '',
};

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('vision_ai_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [showTechInfo, setShowTechInfo] = useState(false);

  // Save settings updates
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('vision_ai_settings', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Camera Management Hook
  const {
    videoRef,
    status: cameraStatus,
    errorMessage: cameraError,
    facingMode,
    activeCameraLabel,
    availableCameras,
    startCamera,
    stopCamera,
    switchCamera,
    selectCamera,
  } = useCamera({
    preferredFacingMode: 'environment',
    preferredDeviceId: settings.selectedCameraId || undefined,
  });

  // Object Detector Hook
  const {
    modelStatus,
    modelError,
    detections,
    groupedDetections,
    history,
    fps,
    avgConfidence,
    loadModel,
    startDetectionLoop,
    stopDetectionLoop,
    clearHistory,
  } = useObjectDetector({
    confidenceThreshold: settings.confidenceThreshold,
    qualityMode: settings.qualityMode,
    audioFeedback: settings.audioFeedback,
  });

  // Start Camera and automatically attach detection loop
  const handleStartCamera = useCallback(async () => {
    await startCamera();
  }, [startCamera]);

  // Stop Camera and clear detection loop
  const handleStopCamera = useCallback(() => {
    stopDetectionLoop();
    stopCamera();
  }, [stopDetectionLoop, stopCamera]);

  // Handle Switch Camera
  const handleSwitchCamera = useCallback(async () => {
    stopDetectionLoop();
    await switchCamera();
  }, [stopDetectionLoop, switchCamera]);

  // When camera turns active and video element is ready, begin real-time detection
  useEffect(() => {
    if (cameraStatus === 'active' && videoRef.current) {
      startDetectionLoop(videoRef.current);
    } else if (cameraStatus !== 'active') {
      stopDetectionLoop();
    }
  }, [cameraStatus, videoRef, startDetectionLoop, stopDetectionLoop]);

  // Reload model when qualityMode changes
  useEffect(() => {
    if (cameraStatus === 'active') {
      loadModel(settings.qualityMode).then((m) => {
        if (m && videoRef.current) {
          startDetectionLoop(videoRef.current);
        }
      });
    }
  }, [settings.qualityMode, cameraStatus, loadModel, startDetectionLoop, videoRef]);

  return (
    <div className="min-h-screen bg-[#05070d] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Application Header */}
      <Header
        cameraStatus={cameraStatus}
        modelStatus={modelStatus}
        fps={fps}
        audioFeedback={settings.audioFeedback}
        onToggleAudio={() =>
          handleUpdateSettings({ audioFeedback: !settings.audioFeedback })
        }
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
        {/* SECTION 1: Main Camera Feed Stage */}
        <section aria-label="Live Camera Detection Feed">
          <CameraView
            videoRef={videoRef}
            cameraStatus={cameraStatus}
            modelStatus={modelStatus}
            cameraError={cameraError}
            modelError={modelError}
            facingMode={facingMode}
            activeCameraLabel={activeCameraLabel}
            detections={detections}
            tacticalHud={settings.tacticalHud}
            showLabels={settings.showLabels}
            showConfidence={settings.showConfidence}
            mirrorFrontCamera={settings.mirrorFrontCamera}
            onStartCamera={handleStartCamera}
            onStopCamera={handleStopCamera}
            onSwitchCamera={handleSwitchCamera}
            onRetryModel={() => loadModel(settings.qualityMode)}
            onCaptureSnapshot={(url) => setCapturedImageUrl(url)}
          />
        </section>

        {/* SECTION 2: Statistics Cards */}
        <section aria-label="Real-Time Detection Metrics">
          <StatsCards
            totalObjects={detections.length}
            objectTypesCount={groupedDetections.length}
            fps={fps}
            avgConfidence={avgConfidence}
            cameraStatus={cameraStatus}
            modelStatus={modelStatus}
          />
        </section>

        {/* SECTION 3: Lower Dashboard (Left: Detected Objects | Right: Detection History) */}
        <section
          aria-label="Detection Analytics and History"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
        >
          {/* Left: Detected Objects Panel */}
          <DetectedObjectsPanel
            groupedDetections={groupedDetections}
            isDetecting={cameraStatus === 'active' && modelStatus === 'detecting'}
          />

          {/* Right: Detection History Panel */}
          <DetectionHistoryPanel
            history={history}
            onClearHistory={clearHistory}
          />
        </section>

        {/* SECTION 4: Architecture & Privacy Banner */}
        <section className="p-4 rounded-xl bg-[#080d19]/60 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              100% Client-Side Detection: No camera frames are ever transmitted to any external server or saved without your explicit command.
            </span>
          </div>

          <button
            onClick={() => setShowTechInfo(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition-colors shrink-0"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Architecture & Specs</span>
          </button>
        </section>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        availableCameras={availableCameras}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={handleUpdateSettings}
        onSelectCamera={selectCamera}
      />

      {/* Capture Snapshot Modal */}
      <CaptureModal
        imageUrl={capturedImageUrl}
        onClose={() => setCapturedImageUrl(null)}
      />

      {/* Technical Architecture Info Modal */}
      {showTechInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#090e1a] border border-cyan-500/30 p-6 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Cpu className="w-4 h-4" />
                <span>SYSTEM ARCHITECTURE & DEPLOYMENT</span>
              </div>
              <button
                onClick={() => setShowTechInfo(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-slate-300 leading-relaxed">
              <p>
                <strong className="text-cyan-300">Neural Engine:</strong> TensorFlow.js with COCO-SSD (MobileNet architecture). Performs continuous forward inference directly on the GPU/WebGL client pipeline.
              </p>
              <p>
                <strong className="text-cyan-300">Supported Classes:</strong> 80 distinct common object classes (Person, Laptop, Cell Phone, Bottle, Chair, Bicycle, Car, etc.).
              </p>
              <p>
                <strong className="text-cyan-300">Camera Pipeline:</strong> HTML5 MediaDevices API with dynamic device enumeration, aspect-ratio lock, and hardware acceleration.
              </p>
              <p>
                <strong className="text-cyan-300">Deployment Compatibility:</strong> Fully static, self-contained client app deployable to Vercel, Netlify, Cloud Run, or GitHub Pages. HTTPS is required by browser security policies for webcam access.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowTechInfo(false)}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-[#04060c] py-4 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>VISION AI Core • Browser Neural Computer Vision</span>
          <span>Powered by TensorFlow.js & React 19</span>
        </div>
      </footer>
    </div>
  );
}
