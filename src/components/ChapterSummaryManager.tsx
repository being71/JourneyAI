import React, { useState } from 'react';
import {
  X,
  Layers,
  Sparkles,
  Edit,
  Check,
  Plus,
  BookOpen,
  Minimize2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { ArcSummary, ChapterSummary, ChatMessage, ChatSession, Storyline } from '../types';

interface ChapterSummaryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  storyline: Storyline;
  session: ChatSession;
  messages: ChatMessage[];
  onTriggerSummarize: () => void;
  onUpdateChapterSummary: (summaryId: string, newText: string, newTitle: string) => void;
  onCreateArcSummary: (title: string, summaryText: string, chapterIds: string[]) => void;
}

export const ChapterSummaryManager: React.FC<ChapterSummaryManagerProps> = ({
  isOpen,
  onClose,
  storyline,
  session,
  messages,
  onTriggerSummarize,
  onUpdateChapterSummary,
  onCreateArcSummary,
}) => {
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editText, setEditText] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  if (!isOpen) return null;

  const handleStartEdit = (ch: ChapterSummary) => {
    setEditingChapterId(ch.id);
    setEditTitle(ch.title);
    setEditText(ch.summaryText);
  };

  const handleSaveEdit = (id: string) => {
    if (!editTitle.trim() || !editText.trim()) return;
    onUpdateChapterSummary(id, editText.trim(), editTitle.trim());
    setEditingChapterId(null);
  };

  const handleManualSummarizeClick = async () => {
    setIsSummarizing(true);
    await onTriggerSummarize();
    setIsSummarizing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-lg h-full flex flex-col shadow-2xl text-slate-100 p-6 overflow-y-auto">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Manajemen Memori Bab & Arc</h3>
              <p className="text-xs text-slate-400">Penghematan token & ingatan jangka panjang</p>
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
          {/* Action Header */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-200 block mb-0.5">
                Meringkas Pesan Lama
              </span>
              <span className="text-[11px] text-slate-400">
                Pesan mentah ({messages.length}) diringkas otomatis per 12-16 pesan.
              </span>
            </div>
            <button
              onClick={handleManualSummarizeClick}
              disabled={isSummarizing || messages.length < 4}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-bold transition shrink-0 shadow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isSummarizing ? 'Meringkas...' : 'Ringkas Sekarang'}
            </button>
          </div>

          {/* Arc Summaries Section (FR-5.5) */}
          {session.arcSummaries && session.arcSummaries.length > 0 && (
            <div>
              <h4 className="text-xs font-bold tracking-wider text-purple-400 uppercase mb-3 flex items-center gap-1.5">
                <Minimize2 className="w-4 h-4" />
                Ringkasan Arc (Memori Sangat Jangka Panjang)
              </h4>
              <div className="space-y-3">
                {session.arcSummaries.map(arc => (
                  <div key={arc.id} className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/60">
                    <h5 className="font-bold text-sm text-purple-200 mb-1">
                      Arc {arc.arcNumber}: {arc.title}
                    </h5>
                    <p className="text-xs text-purple-100/80 leading-relaxed font-serif whitespace-pre-wrap">
                      {arc.summaryText}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chapter Summaries Section (FR-5.1, FR-5.3, FR-5.6) */}
          <div>
            <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-3 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Daftar Bab Diringkas ({session.chapterSummaries.length})
            </h4>

            {session.chapterSummaries.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-500 text-xs italic space-y-1">
                <p>Belum ada Bab diringkas.</p>
                <p>Sistem akan otomatis meringkas percakapan lama setelah pesan terkumpul, atau kamu dapat mengeklik tombol "Ringkas Sekarang" di atas.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {session.chapterSummaries.map(ch => {
                  const isEditing = editingChapterId === ch.id;
                  return (
                    <div
                      key={ch.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 font-bold"
                          />
                          <textarea
                            rows={5}
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-100 font-serif leading-relaxed"
                          />
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              onClick={() => setEditingChapterId(null)}
                              className="px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs"
                            >
                              Batal
                            </button>
                            <button
                              onClick={() => handleSaveEdit(ch.id)}
                              className="px-3 py-1 rounded bg-emerald-600 text-white text-xs font-bold"
                            >
                              Simpan
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-indigo-300 text-sm">
                              Bab {ch.chapterNumber}: {ch.title}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded bg-slate-900">
                                {ch.sourceMessageCount} Pesan
                              </span>
                              <button
                                onClick={() => handleStartEdit(ch)}
                                className="p-1 text-slate-400 hover:text-slate-200 rounded transition"
                                title="Edit Ringkasan Manual (FR-5.6)"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-slate-300 leading-relaxed font-serif whitespace-pre-wrap">
                            {ch.summaryText}
                          </p>

                          {ch.isEdited && (
                            <span className="text-[10px] text-emerald-400 italic block">
                              ✓ Ditingkatkan/Diedit secara manual oleh pengguna
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
