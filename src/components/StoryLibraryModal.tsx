import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Plus,
  Play,
  Trash2,
  Edit,
  Sparkles,
  Shield,
  Layers,
  Search,
  CheckCircle2
} from 'lucide-react';
import { ChatSession, Storyline } from '../types';

interface StoryLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  storylines: Storyline[];
  sessions: ChatSession[];
  activeStorylineId: string | null;
  activeSessionId: string | null;
  onSelectStoryline: (storyline: Storyline, playerName: string) => void;
  onSelectSession: (sessionId: string) => void;
  onEditStoryline: (storyline: Storyline) => void;
  onDeleteStoryline: (id: string) => void;
  onOpenComposer: () => void;
}

export const StoryLibraryModal: React.FC<StoryLibraryModalProps> = ({
  isOpen,
  onClose,
  storylines,
  sessions,
  activeStorylineId,
  activeSessionId,
  onSelectStoryline,
  onSelectSession,
  onEditStoryline,
  onDeleteStoryline,
  onOpenComposer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [playerNameInput, setPlayerNameInput] = useState('Pemain');
  const [selectedStoryForPlay, setSelectedStoryForPlay] = useState<Storyline | null>(null);
  const [selectedOpeningScenario, setSelectedOpeningScenario] = useState<string>('');

  if (!isOpen) return null;

  // Collect all unique tags across storylines
  const allTags = Array.from(
    new Set(storylines.flatMap(s => s.tags || []))
  );

  const filteredStorylines = storylines.filter(s => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag ? s.tags?.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  const handleSelectStoryForPlay = (storyline: Storyline) => {
    setSelectedStoryForPlay(storyline);
    setSelectedOpeningScenario(storyline.openingMessage);
  };

  const handleStartPlay = (storyline: Storyline) => {
    // Pass custom chosen opening message if user selected an alternative
    const storyToPlay: Storyline = {
      ...storyline,
      openingMessage: selectedOpeningScenario || storyline.openingMessage,
    };
    onSelectStoryline(storyToPlay, playerNameInput || 'Pemain');
    setSelectedStoryForPlay(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl text-slate-100 my-auto">
        {/* Modal Header */}
        <div className="p-5 border-b border-sky-400/30 flex items-center justify-between bg-[#0d101c]/95 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500/30 via-indigo-500/20 to-amber-300/30 border border-sky-400/50 flex items-center justify-center text-sky-300 blue-moon-glow">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-cinzel font-bold text-lg bg-gradient-to-r from-sky-300 via-amber-200 to-indigo-200 bg-clip-text text-transparent">
                  PUSTAKA GRIMOIRE & STORYLINE
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-950/80 text-sky-300 border border-sky-700/60">
                  物語ライブラリ
                </span>
              </div>
              <p className="text-xs text-slate-400">Pilih petualangan dunia Frieren atau storyline custom lainnya</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenComposer();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold transition shadow-lg shadow-pink-500/20 border border-pink-400/30"
            >
              <Plus className="w-4 h-4" />
              Buat Storyline
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Search Bar & Tag Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Cari judul cerita atau alur..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Genre Filter Pills */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-500 mr-1">Filter Genre:</span>
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className={`px-2.5 py-0.5 rounded-full text-xs transition ${
                    selectedTag === null
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 font-bold'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  Semua
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`px-2.5 py-0.5 rounded-full text-xs transition ${
                      selectedTag === tag
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 font-bold'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Player Name & Alternative Start Prompt when selecting story */}
          {selectedStoryForPlay && (
            <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-800/80 space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-900/60 pb-2">
                <h4 className="text-sm font-bold text-emerald-300">
                  Konfigurasi Awal: "{selectedStoryForPlay.title}"
                </h4>
                <button
                  onClick={() => setSelectedStoryForPlay(null)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Batal
                </button>
              </div>

              {/* Player Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Karakter Utama Kamu (Menggantikan tag <code className="text-emerald-400">{`{{user}}`}</code>):
                </label>
                <input
                  type="text"
                  value={playerNameInput}
                  onChange={e => setPlayerNameInput(e.target.value)}
                  placeholder="Misal: Renard / Viper / Arthur"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Alternative Openings / Starts Choice (FR-1.5) */}
              {selectedStoryForPlay.alternativeOpenings && selectedStoryForPlay.alternativeOpenings.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-cyan-300 mb-1.5">
                    Pilih Skenario Pembuka Cerita (Alternative Start FR-1.5):
                  </label>
                  <div className="space-y-2">
                    <label
                      className={`block p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                        selectedOpeningScenario === selectedStoryForPlay.openingMessage
                          ? 'bg-emerald-900/40 border-emerald-500 text-emerald-200'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold mb-1">
                        <input
                          type="radio"
                          name="openingChoice"
                          checked={selectedOpeningScenario === selectedStoryForPlay.openingMessage}
                          onChange={() => setSelectedOpeningScenario(selectedStoryForPlay.openingMessage)}
                          className="text-emerald-500 focus:ring-0"
                        />
                        Skenario Pembuka Utama
                      </div>
                      <p className="font-serif italic pl-5 line-clamp-2">{selectedStoryForPlay.openingMessage}</p>
                    </label>

                    {selectedStoryForPlay.alternativeOpenings.map((altOp, idx) => (
                      <label
                        key={idx}
                        className={`block p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                          selectedOpeningScenario === altOp
                            ? 'bg-emerald-900/40 border-emerald-500 text-emerald-200'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold mb-1">
                          <input
                            type="radio"
                            name="openingChoice"
                            checked={selectedOpeningScenario === altOp}
                            onChange={() => setSelectedOpeningScenario(altOp)}
                            className="text-emerald-500 focus:ring-0"
                          />
                          Skenario Alternatif #{idx + 2}
                        </div>
                        <p className="font-serif italic pl-5 line-clamp-2">{altOp}</p>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => handleStartPlay(selectedStoryForPlay)}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-950"
                >
                  <Play className="w-4 h-4" />
                  Mulai Petualangan Barumu
                </button>
              </div>
            </div>
          )}

          {/* Saved Sessions list if any */}
          {sessions.length > 0 && (
            <div>
              <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-3">
                Sesi Percakapan Aktif ({sessions.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sessions.map(s => {
                  const story = storylines.find(st => st.id === s.storylineId);
                  const isActive = s.id === activeSessionId;
                  return (
                    <div
                      key={s.id}
                      className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                        isActive
                          ? 'bg-emerald-950/30 border-emerald-500/60'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-semibold text-emerald-400">
                            Pemain: {s.playerName}
                          </span>
                          {isActive && (
                            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                              <CheckCircle2 className="w-3 h-3" /> Sedang Dimainkan
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-slate-100 mb-1">
                          {story?.title || s.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {story?.summary || 'Sesi roleplay novel interaktif'}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                        <span>
                          {s.chapterSummaries?.length > 0
                            ? `${s.chapterSummaries.length} Bab Diringkas`
                            : 'Awal Cerita'}
                        </span>
                        <button
                          onClick={() => {
                            onSelectSession(s.id);
                            onClose();
                          }}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
                        >
                          <Play className="w-3 h-3 text-emerald-400" />
                          Lanjutkan Sesi
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Storylines Library */}
          <div>
            <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-3">
              Koleksi Storyline ({filteredStorylines.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStorylines.map(story => {
                const isActive = story.id === activeStorylineId;
                return (
                  <div
                    key={story.id}
                    className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                      isActive
                        ? 'bg-slate-850 border-emerald-500/50 shadow-lg'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                          {story.ratingTag}
                        </span>
                        {story.gameSheet?.enabled && (
                          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800">
                            <Shield className="w-3 h-3" /> GM RPG Mode
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-base text-slate-100 mb-2">
                        {story.title}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-3">
                        {story.summary || story.plotUser}
                      </p>

                      {story.characters && story.characters.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-400 mb-2">
                          <span className="font-semibold text-slate-500">NPC:</span>
                          {story.characters.map(c => (
                            <span
                              key={c.id}
                              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                            >
                              {c.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditStoryline(story)}
                          className="p-1.5 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition"
                          title="Edit Storyline"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {story.isCustom && (
                          <button
                            onClick={() => onDeleteStoryline(story.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition"
                            title="Hapus Storyline Custom"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedStoryForPlay(story)}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Mainkan Storyline Ini
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
