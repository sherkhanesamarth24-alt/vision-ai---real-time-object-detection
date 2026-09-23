import React from 'react';
import { X, Download, Camera, Check } from 'lucide-react';

interface CaptureModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const CaptureModal: React.FC<CaptureModalProps> = ({ imageUrl, onClose }) => {
  const [downloaded, setDownloaded] = React.useState(false);

  if (!imageUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `vision-ai-detection-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#090e1a] border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between bg-[#070b16]/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-['Chakra_Petch',sans-serif] tracking-wider text-white">
                DETECTION SNAPSHOT CAPTURED
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Frame snapshot with neural bounding boxes & confidence overlay
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

        {/* Snapshot Image Preview */}
        <div className="p-4 bg-black/60 flex items-center justify-center max-h-[60vh] overflow-hidden">
          <img
            src={imageUrl}
            alt="AI Detection Snapshot"
            className="max-h-[55vh] w-auto max-w-full rounded-xl border border-cyan-500/30 shadow-2xl object-contain"
          />
        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 border-t border-cyan-500/20 bg-[#070b16]/90 flex items-center justify-between gap-4">
          <div className="text-xs font-mono text-slate-400">
            Image format: PNG • Native Sensor Resolution
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors"
            >
              CLOSE
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs tracking-wider transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              {downloaded ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  SAVED!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  DOWNLOAD IMAGE
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
