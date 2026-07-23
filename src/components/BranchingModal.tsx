import React from 'react';
import {
  X,
  GitBranch,
  Play,
  Plus,
  Clock,
  Sparkles,
  GitCommit
} from 'lucide-react';
import { ChatMessage, ChatSession } from '../types';

interface BranchingModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ChatSession;
  messages: ChatMessage[];
  onCreateBranch: (branchName: string, forkMessageId: string) => void;
}

export const BranchingModal: React.FC<BranchingModalProps> = ({
  isOpen,
  onClose,
  session,
  messages,
  onCreateBranch,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl text-slate-100 my-auto">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Manajemen Cabang Cerita (Timeline Branching)</h3>
              <p className="text-xs text-slate-400">Pilih titik percakapan untuk mencoba pilihan alur yang berbeda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
            💡 Fitur Cabang Cerita memungkinkan kamu bercabang ke linimasa alternatif dari pesan mana pun tanpa menimpa pesan utama.
          </p>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pesan Riwayat Terakhir ({messages.length})
            </h4>

            {messages.slice(-8).map((msg, index) => (
              <div
                key={msg.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${msg.role === 'user' ? 'text-emerald-400' : 'text-purple-400'}`}>
                      {msg.role === 'user' ? session.playerName : 'AI Narator'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-300 line-clamp-2 font-serif italic">
                    "{msg.content}"
                  </p>
                </div>

                <button
                  onClick={() => {
                    const bName = prompt('Masukkan nama cabang baru (misal: "Pilihan Alternatif - Cabang Lari"):', 'Cabang Alternatif');
                    if (bName) {
                      onCreateBranch(bName, msg.id);
                      onClose();
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs font-semibold shrink-0 transition"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  Bercabang Dari Sini
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
