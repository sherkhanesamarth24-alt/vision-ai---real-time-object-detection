import React from 'react';
import { Layers, Scan, ArrowUpRight } from 'lucide-react';
import { GroupedDetection } from '../types/vision';
import { formatClassName } from '../utils/cocoClasses';

interface DetectedObjectsPanelProps {
  groupedDetections: GroupedDetection[];
  isDetecting: boolean;
}

export const DetectedObjectsPanel: React.FC<DetectedObjectsPanelProps> = ({
  groupedDetections,
  isDetecting,
}) => {
  return (
    <div className="flex flex-col h-full rounded-2xl bg-[#090e1a]/90 backdrop-blur border border-cyan-500/20 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-cyan-500/10 flex items-center justify-between bg-[#070b16]/60">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-['Chakra_Petch',sans-serif] tracking-wider text-white">
              DETECTED OBJECTS
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Active targets grouped by neural class
            </p>
          </div>
        </div>

        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          {groupedDetections.length} {groupedDetections.length === 1 ? 'class' : 'classes'}
        </span>
      </div>

      {/* List content */}
      <div className="p-4 flex-1 overflow-y-auto space-y-2.5 max-h-[380px] custom-scrollbar">
        {groupedDetections.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
            <Scan className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
            <p className="text-xs font-mono text-slate-400">
              {isDetecting
                ? 'Scanning scene... No objects meeting confidence threshold.'
                : 'Camera inactive. Start camera to detect objects.'}
            </p>
          </div>
        ) : (
          groupedDetections.map((group) => {
            const confidencePct = Math.round(group.highestScore * 100);
            return (
              <div
                key={group.class}
                className="group relative flex items-center justify-between p-3 rounded-xl bg-[#0d1424] hover:bg-[#111a2f] border border-slate-800 hover:border-cyan-500/40 transition-all duration-200"
              >
                {/* Left: Emoji + Class Name */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-lg shrink-0 shadow-sm">
                    {group.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-100 font-mono tracking-wide">
                        {formatClassName(group.class)}
                      </span>
                      {/* Count badge (e.g. × 2) */}
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-xs">
                        × {group.count}
                      </span>
                    </div>

                    {/* Progress visual */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${confidencePct}%`,
                            backgroundColor: group.color || '#06b6d4',
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        Peak: {confidencePct}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Confidence readout */}
                <div className="text-right">
                  <span
                    className="text-base font-bold font-mono tracking-tight"
                    style={{ color: group.color || '#06b6d4' }}
                  >
                    {confidencePct}%
                  </span>
                  <div className="text-[10px] uppercase font-mono text-slate-500">
                    Confidence
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
