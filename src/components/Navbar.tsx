import React from 'react';
import {
  BookOpen,
  Sparkles,
  Settings,
  Cpu,
  Layers,
  Shield,
  Download,
  PlusCircle,
  GitBranch,
  Feather,
  Sun,
  Moon,
  Coffee,
  Bookmark,
  Laptop,
  Cloud
} from 'lucide-react';
import { ChatSession, Storyline } from '../types';
import { ReaderSettings } from '../utils/storage';

interface NavbarProps {
  activeStoryline: Storyline | null;
  activeSession: ChatSession | null;
  readerSettings: ReaderSettings;
  onUpdateReaderSettings: (settings: ReaderSettings) => void;
  onOpenComposer: () => void;
  onOpenLibrary: () => void;
  onOpenSettings: () => void;
  onOpenTokenDrawer: () => void;
  onOpenGameSheet: () => void;
  onOpenChapterManager: () => void;
  onOpenBranching: () => void;
  onOpenImportExport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeStoryline,
  activeSession,
  readerSettings,
  onUpdateReaderSettings,
  onOpenComposer,
  onOpenLibrary,
  onOpenSettings,
  onOpenTokenDrawer,
  onOpenGameSheet,
  onOpenChapterManager,
  onOpenBranching,
  onOpenImportExport,
}) => {
  const toggleTheme = () => {
    const themes: ReaderSettings['theme'][] = ['frieren-grimoire', 'bunga-blue-moon', 'anime-dark', 'sakura-pink', 'dark', 'sepia', 'light'];
    const nextIndex = (themes.indexOf(readerSettings.theme) + 1) % themes.length;
    onUpdateReaderSettings({ ...readerSettings, theme: themes[nextIndex] });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-sky-400/25 bg-[#0d101c]/90 backdrop-blur-md text-slate-100 shadow-[0_4px_25px_rgba(14,165,233,0.15)]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        {/* Left: App Logo & Active Story Info */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenLibrary}
            className="flex items-center gap-2.5 font-display font-bold text-lg text-sky-300 hover:text-sky-200 transition shrink-0 group"
            title="Buka Pustaka Storyline & Sesi Cerita"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500/30 via-indigo-500/20 to-amber-300/30 border border-sky-400/50 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform blue-moon-glow">
              <Sparkles className="w-5 h-5 text-sky-300 animate-pulse" />
            </div>
            <div className="flex flex-col text-left">
              <span className="tracking-wider text-base font-cinzel font-black bg-gradient-to-r from-sky-300 via-amber-200 to-indigo-200 bg-clip-text text-transparent">
                Ledger
              </span>
              <span className="text-[9px] font-mono tracking-widest text-sky-300/80 -mt-1 uppercase">
                物語 • GRIMOIRE AI NOVEL
              </span>
            </div>
          </button>

          <div className="h-5 w-px bg-sky-400/20 hidden sm:block shrink-0" />

          {activeStoryline ? (
            <div className="flex items-center gap-2 min-w-0 overflow-hidden">
              <button
                onClick={onOpenLibrary}
                className="text-xs sm:text-sm font-semibold truncate hover:text-pink-300 text-slate-200 text-left transition"
                title={activeStoryline.title}
              >
                {activeStoryline.title}
              </button>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-950/80 text-pink-300 border border-pink-700/60 shrink-0 hidden md:inline font-mono">
                {activeStoryline.ratingTag}
              </span>
              {activeSession && (
                <button
                  onClick={onOpenBranching}
                  className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-purple-950/70 text-purple-200 border border-purple-700/60 hover:bg-purple-900/80 transition shrink-0 font-medium"
                  title="Kelola Cabang Cerita (分岐)"
                >
                  <GitBranch className="w-3 h-3 text-pink-400" />
                  <span className="hidden lg:inline">{activeSession.playerName}</span>
                </button>
              )}
            </div>
          ) : (
            <span className="text-xs text-pink-300/70 italic font-mono">Pilih storyline...</span>
          )}
        </div>

        {/* Right: Quick Controls & Drawers */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {activeSession && (
            <>
              {/* Active Model Engine Badge (Cloud API vs Local LLM) */}
              <button
                onClick={onOpenSettings}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border transition ${
                  activeSession.isLocalLlm
                    ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/80 text-emerald-200 font-bold shadow-sm shadow-emerald-500/20'
                    : 'bg-cyan-950/60 hover:bg-cyan-900/80 border-cyan-600/70 text-cyan-200 font-medium'
                }`}
                title={
                  activeSession.isLocalLlm
                    ? `Engine Aktif: Local LLM (${activeSession.localLlmModelName || activeSession.selectedModel})`
                    : `Engine Aktif: Cloud API (${activeSession.selectedModel})`
                }
              >
                {activeSession.isLocalLlm ? (
                  <>
                    <Laptop className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="hidden lg:inline font-mono text-[11px] truncate max-w-[120px]">
                      {activeSession.localLlmModelName || activeSession.selectedModel.replace('local:', '')}
                    </span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="hidden lg:inline font-mono text-[11px] truncate max-w-[110px]">
                      {activeSession.selectedModel.replace('gemini-', '')}
                    </span>
                  </>
                )}
              </button>

              {/* Token Transparency Drawer Trigger */}
              <button
                onClick={onOpenTokenDrawer}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 transition"
                title="Transparansi Token & Cache"
              >
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline font-mono text-[11px]">Token</span>
              </button>

              {/* Game Sheet RPG Stat Trigger (if enabled) */}
              {activeSession.gameSheet?.enabled && (
                <button
                  onClick={onOpenGameSheet}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/70 border border-amber-700/70 text-amber-200 transition"
                  title="Lembar Karakter & Stat (ステータス)"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline font-semibold text-[11px]">Stat</span>
                </button>
              )}

              {/* Chapter Summaries Memory Trigger */}
              <button
                onClick={onOpenChapterManager}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/70 border border-indigo-700/70 text-indigo-200 transition"
                title="Memori Bab & Arc (記憶)"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden md:inline text-[11px]">Memori</span>
                {activeSession.chapterSummaries.length > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-pink-500 text-white text-[10px] font-bold">
                    {activeSession.chapterSummaries.length}
                  </span>
                )}
              </button>
            </>
          )}

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-400/50 text-slate-300 transition"
            title={`Tema Tampilan: ${readerSettings.theme.toUpperCase()}`}
          >
            {readerSettings.theme === 'frieren-grimoire' && <Sparkles className="w-4 h-4 text-sky-300 animate-pulse" />}
            {readerSettings.theme === 'bunga-blue-moon' && <Feather className="w-4 h-4 text-sky-400" />}
            {readerSettings.theme === 'anime-dark' && <Sparkles className="w-4 h-4 text-pink-400" />}
            {readerSettings.theme === 'sakura-pink' && <Bookmark className="w-4 h-4 text-pink-500" />}
            {readerSettings.theme === 'dark' && <Moon className="w-4 h-4 text-purple-400" />}
            {readerSettings.theme === 'sepia' && <Coffee className="w-4 h-4 text-amber-400" />}
            {readerSettings.theme === 'light' && <Sun className="w-4 h-4 text-amber-300" />}
          </button>

          {/* Export / Import Button */}
          <button
            onClick={onOpenImportExport}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-pink-500/50 text-slate-300 transition"
            title="Ekspor / Impor Storyline"
          >
            <Download className="w-4 h-4 text-cyan-400" />
          </button>

          {/* New Storyline Composer */}
          <button
            onClick={onOpenComposer}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold transition shadow-lg shadow-pink-500/20 border border-pink-400/30"
            title="Buat Storyline Baru (新規作成)"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Buat Storyline</span>
          </button>

          {/* Settings Drawer */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-slate-300 transition"
            title="Pengaturan Gaya & AI Engine"
          >
            <Settings className="w-4 h-4 text-purple-300" />
          </button>
        </div>
      </div>
    </header>
  );
};
