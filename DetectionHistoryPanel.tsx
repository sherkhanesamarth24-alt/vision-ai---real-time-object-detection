import React from 'react';
import { History, Trash2, Download, Clock } from 'lucide-react';
import { DetectionHistoryItem } from '../types/vision';
import { formatClassName } from '../utils/cocoClasses';

interface DetectionHistoryPanelProps {
  history: DetectionHistoryItem[];
  onClearHistory: () => void;
}

export const DetectionHistoryPanel: React.FC<DetectionHistoryPanelProps> = ({
  history,
  onClearHistory,
}) => {
  const exportHistoryCSV = () => {
    if (history.length === 0) return;
    const headers = 'Class,Confidence_Percent,Timestamp\n';
    const rows = history
      .map(
        (h) =>
          `"${h.class}",${Math.round(h.score * 100)},"${h.timeFormatted}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vision-ai-history-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-[#090e1a]/90 backdrop-blur border border-blue-500/20 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-blue-500/10 flex items-center justify-between bg-[#070b16]/60">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-['Chakra_Petch',sans-serif] tracking-wider text-white">
              DETECTION HISTORY
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Session event log with timestamps
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <>
              <button
                onClick={exportHistoryCSV}
                title="Export session logs as CSV"
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClearHistory}
                title="Clear all detection history"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>CLEAR</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Log list */}
      <div className="p-4 flex-1 overflow-y-auto space-y-2 max-h-[380px] custom-scrollbar">
        {history.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
            <Clock className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-xs font-mono text-slate-400">
              No detection events recorded in this session yet.
            </p>
          </div>
        ) : (
          history.map((item) => {
            const confPct = Math.round(item.score * 100);
            return (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#0c1220] hover:bg-[#10182c] border border-slate-800/70 text-xs font-mono transition-colors"
              >
                {/* Left: Emoji + Name */}
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{item.emoji}</span>
                  <span className="font-medium text-slate-200">
                    {formatClassName(item.class)}
                  </span>
                </div>

                {/* Right: Confidence + Timestamp */}
                <div className="flex items-center gap-4">
                  <span
                    className="font-bold tracking-tight"
                    style={{ color: item.color || '#06b6d4' }}
                  >
                    {confPct}%
                  </span>
                  <span className="text-slate-400 text-[11px] font-mono">
                    {item.timeFormatted}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
