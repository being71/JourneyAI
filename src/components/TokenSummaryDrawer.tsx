import React from 'react';
import {
  X,
  Cpu,
  Zap,
  Clock,
  ShieldAlert,
  Sliders,
  DollarSign,
  Info
} from 'lucide-react';
import { ChatSession, TokenStats } from '../types';
import { formatTokenDisplay } from '../utils/tokenCalculator';

interface TokenSummaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tokenStats: TokenStats;
  session: ChatSession;
  onUpdateContextLimit: (limit: number) => void;
}

export const TokenSummaryDrawer: React.FC<TokenSummaryDrawerProps> = ({
  isOpen,
  onClose,
  tokenStats,
  session,
  onUpdateContextLimit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl text-slate-100 p-6 overflow-y-auto">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Transparansi Token & Prompt Cache</h3>
              <p className="text-xs text-slate-400">Status penggunaan konteks real-time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 flex-1">
          {/* Prompt Caching Status Banner (FR-4.2, FR-4.3) */}
          <div
            className={`p-4 rounded-xl border ${
              tokenStats.isCacheActive
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                : 'bg-slate-850 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className={`w-4 h-4 ${tokenStats.isCacheActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {tokenStats.isCacheActive ? 'Prompt Cache Active' : 'Cache Status'}
                </span>
              </div>
              {tokenStats.isCacheActive && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200 font-bold">
                  {tokenStats.cachedTokens > 0
                    ? `~${Math.round((tokenStats.cachedTokens / tokenStats.inputTokens) * 100)}% Hemat`
                    : 'Siap'}
                </span>
              )}
            </div>
            <p className="text-xs leading-relaxed">{tokenStats.cacheInvalidatedReason || 'Prompt Caching otomatis aktif saat konteks melebihi 1024 token untuk menghemat latensi dan biaya pemrosesan.'}</p>
          </div>

          {/* Token Breakdown Cards (FR-4.1) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                Input Tokens (Konteks)
              </span>
              <span className="text-xl font-mono font-bold text-cyan-400">
                {formatTokenDisplay(tokenStats.inputTokens)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                Sistem + Ringkasan + Pesan
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                Output Tokens (Respons AI)
              </span>
              <span className="text-xl font-mono font-bold text-purple-400">
                {formatTokenDisplay(tokenStats.outputTokens)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                Generasi terakhir
              </span>
            </div>
          </div>

          {/* Total & Cost Estimate */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Total Akumulasi Token:</span>
              <span className="font-mono font-bold text-slate-200">
                {formatTokenDisplay(tokenStats.totalTokens)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Model Aktif:</span>
              <span className="font-mono font-semibold text-emerald-400">
                {session.selectedModel}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
              <span className="text-slate-400 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Estimasi Biaya Pesan Ini:
              </span>
              <span className="font-mono font-bold text-emerald-400">
                ${tokenStats.estimatedCostUsd.toFixed(6)} USD
              </span>
            </div>
          </div>

          {/* Context Limit Override Slider (FR-4.5) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Batas Maksimal Konteks (Context Limit)
              </label>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {formatTokenDisplay(session.contextLimitTokens)}
              </span>
            </div>

            <input
              type="range"
              min="4000"
              max="32000"
              step="2000"
              value={session.contextLimitTokens}
              onChange={e => onUpdateContextLimit(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Sistem akan otomatis memotong pesan terlama jika total token melebihi batas ini. Pesan yang terlampaui akan otomatis diringkas menjadi Bab.
            </p>
          </div>

          {/* Informational Note */}
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-400 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Catatan: Mengedit pesan lama (FR-4.4) akan membatalkan cache dari titik tersebut untuk menjamin konsistensi alur cerita baru.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
