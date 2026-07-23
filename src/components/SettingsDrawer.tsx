import React from 'react';
import {
  X,
  Settings,
  Sliders,
  Type,
  Cpu,
  Sparkles,
  BookOpen,
  Check,
  Zap,
  Info
} from 'lucide-react';
import { ChatSession, CreativityLevel, ModelProvider, PromptMode, ResponseLength } from '../types';
import { ReaderSettings } from '../utils/storage';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  session: ChatSession;
  readerSettings: ReaderSettings;
  onUpdateSessionSettings: (updatedFields: Partial<ChatSession>) => void;
  onUpdateReaderSettings: (updatedFields: Partial<ReaderSettings>) => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  session,
  readerSettings,
  onUpdateSessionSettings,
  onUpdateReaderSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl text-slate-100 p-6 overflow-y-auto">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Pengaturan Gaya & AI Engine</h3>
              <p className="text-xs text-slate-400">Kontrol granular respons AI & Tampilan Pembaca</p>
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
          {/* 1. Kreativitas AI / Temperature (FR-3.1) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Tingkat Kreativitas AI</span>
              <span className="text-purple-400 font-mono">{session.creativity}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Hati-hati', 'Seimbang', 'Liar'] as CreativityLevel[]).map(level => (
                <button
                  key={level}
                  onClick={() => onUpdateSessionSettings({ creativity: level })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center ${
                    session.creativity === level
                      ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              {session.creativity === 'Hati-hati' && 'Respons logis, konsisten, patuh pada alur utama.'}
              {session.creativity === 'Seimbang' && 'Keseimbangan ideal antara narasi teratur dan improvisasi.'}
              {session.creativity === 'Liar' && 'Improvisasi tinggi, plot twist tak terduga, adegan eksplosif.'}
            </p>
          </div>

          {/* 2. Target Panjang Respons (FR-3.2) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Target Panjang Respons AI
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Pendek', 'Sedang', 'Panjang'] as ResponseLength[]).map(len => (
                <button
                  key={len}
                  onClick={() => onUpdateSessionSettings({ responseLength: len })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center ${
                    session.responseLength === len
                      ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200 shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              {session.responseLength === 'Pendek' && '~100-150 kata (Cepat, tanggap singkat)'}
              {session.responseLength === 'Sedang' && '~250-400 kata (Standar novel interaktif)'}
              {session.responseLength === 'Panjang' && '~600+ kata (Deskripsi novel ekspansif & panca indra)'}
            </p>
          </div>

          {/* 3. Mode Prompt / Aturan Narasi (FR-3.3) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Mode Prompt AI
            </label>
            <div className="space-y-2">
              {(['Naratif Bebas (V1)', 'Roleplay Terstruktur (V2)'] as PromptMode[]).map(pm => (
                <button
                  key={pm}
                  onClick={() => onUpdateSessionSettings({ promptMode: pm })}
                  className={`w-full p-3 rounded-xl text-left border transition flex items-center justify-between ${
                    session.promptMode === pm
                      ? 'bg-cyan-950/40 border-cyan-500/70 text-cyan-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">{pm}</span>
                    <span className="text-[11px] text-slate-400">
                      {pm === 'Naratif Bebas (V1)'
                        ? 'Alur novel imersif, gaya cerita bebas mengalir'
                        : 'Patuhi aturan persona & konsekuensi taktis secara ketat'}
                    </span>
                  </div>
                  {session.promptMode === pm && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Penyedia Model AI (FR-3.4, FR-3.5) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Pilih Model LLM (Gemini API)
            </label>
            <div className="space-y-2">
              {[
                {
                  id: 'gemini-3.6-flash' as ModelProvider,
                  name: 'Gemini 3.6 Flash',
                  tag: 'Rekomendasi (Default)',
                  desc: 'Sangat cepat, sangat cerdas, ideal untuk cerita interaktif berkecepatan tinggi.',
                },
                {
                  id: 'sao10k/llama-3.1-8b-stheno-v3.4' as ModelProvider,
                  name: 'Sao10K/Llama-3.1-8B-Stheno-v3.4',
                  tag: 'Hugging Face / RP Special',
                  desc: 'Fine-tune Llama 3.1 8B legendaris dari Sao10K untuk roleplay imersif & penulisan novel tak terbatas.',
                },
                {
                  id: 'gemini-3.1-pro-preview' as ModelProvider,
                  name: 'Gemini 3.1 Pro',
                  tag: 'Penalaran Dalam',
                  desc: 'Penalaran kompleks tinggi untuk plot konspirasi rumit & intrik politik.',
                },
                {
                  id: 'gemini-3.1-flash-lite' as ModelProvider,
                  name: 'Gemini 3.1 Flash Lite',
                  tag: 'Super Hemat & Ringan',
                  desc: 'Latensi terendah, cocok untuk sesi santai dengan biaya minimal.',
                },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => onUpdateSessionSettings({ selectedModel: m.id })}
                  className={`w-full p-3 rounded-xl text-left border transition ${
                    session.selectedModel === m.id
                      ? 'bg-emerald-950/40 border-emerald-500/70 text-emerald-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-100">{m.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-semibold">
                      {m.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 5. Tampilan Reader & Tipografi */}
          <div className="pt-4 border-t border-slate-800">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-amber-400" />
              Pengaturan Tampilan Novel (Tipografi)
            </label>

            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-400 block mb-1">Tema Tampilan Canvas</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onUpdateReaderSettings({ theme: 'frieren-grimoire' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      readerSettings.theme === 'frieren-grimoire'
                        ? 'bg-sky-950/80 border-sky-400 text-sky-200 shadow-md shadow-sky-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    ✨ Frieren Grimoire
                  </button>
                  <button
                    onClick={() => onUpdateReaderSettings({ theme: 'bunga-blue-moon' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      readerSettings.theme === 'bunga-blue-moon'
                        ? 'bg-indigo-950/80 border-sky-300 text-sky-200 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    🌸 Bunga Blue Moon
                  </button>
                  <button
                    onClick={() => onUpdateReaderSettings({ theme: 'anime-dark' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      readerSettings.theme === 'anime-dark'
                        ? 'bg-pink-950/60 border-pink-500 text-pink-200 shadow-md shadow-pink-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    🔮 Cyber Neon
                  </button>
                  <button
                    onClick={() => onUpdateReaderSettings({ theme: 'sakura-pink' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      readerSettings.theme === 'sakura-pink'
                        ? 'bg-pink-100 border-pink-400 text-pink-900 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    🌸 Sakura Light Novel
                  </button>
                  <button
                    onClick={() => onUpdateReaderSettings({ theme: 'dark' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      readerSettings.theme === 'dark'
                        ? 'bg-purple-950/50 border-purple-500 text-purple-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    🌙 Dark Slate
                  </button>
                  <button
                    onClick={() => onUpdateReaderSettings({ theme: 'sepia' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      readerSettings.theme === 'sepia'
                        ? 'bg-amber-950/50 border-amber-500 text-amber-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    📜 Sepia Parchment
                  </button>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">Jenis Font Tipografi Canvas</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onUpdateReaderSettings({ fontFamily: 'gpt-proto' })}
                    className={`py-2 px-3 rounded-xl text-xs font-gpt-proto font-bold border transition ${
                      readerSettings.fontFamily === 'gpt-proto'
                        ? 'bg-sky-950/90 border-sky-400 text-sky-200 shadow-md shadow-sky-500/25 ring-1 ring-sky-400/50'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    🤖 GPT Proto (Grotesk)
                  </button>
                  <button
                    onClick={() => onUpdateReaderSettings({ fontFamily: 'proto-mono' })}
                    className={`py-2 px-3 rounded-xl text-xs font-proto-mono border transition ${
                      readerSettings.fontFamily === 'proto-mono'
                        ? 'bg-sky-950/80 border-sky-400 text-sky-200 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    💻 Proto Mono (Code)
                  </button>
                  <button
                    onClick={() => onUpdateReaderSettings({ fontFamily: 'isekai' })}
                    className={`py-2 px-3 rounded-xl text-xs font-isekai border transition ${
                      readerSettings.fontFamily === 'isekai'
                        ? 'bg-sky-950/80 border-sky-400 text-sky-200 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    ✨ Isekai Zero (Gothic)
                  </button>
                  <button
                    onClick={() => onUpdateReaderSettings({ fontFamily: 'cinzel' })}
                    className={`py-2 px-3 rounded-xl text-xs font-cinzel border transition ${
                      readerSettings.fontFamily === 'cinzel'
                        ? 'bg-indigo-950/80 border-sky-300 text-sky-200 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    👑 Re:Zero Classic
                  </button>
                  <button
                    onClick={() => onUpdateReaderSettings({ fontFamily: 'serif' })}
                    className={`py-2 px-3 rounded-xl text-xs font-jp-serif border transition ${
                      readerSettings.fontFamily === 'serif'
                        ? 'bg-amber-950/50 border-amber-500 text-amber-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    📜 Japanese Mincho
                  </button>
                  <button
                    onClick={() => onUpdateReaderSettings({ fontFamily: 'sans' })}
                    className={`py-2 px-3 rounded-xl text-xs font-sans border transition ${
                      readerSettings.fontFamily === 'sans'
                        ? 'bg-slate-900 border-slate-700 text-slate-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    ⚡ Modern Sans
                  </button>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">Ukuran Teks Tampilan</span>
                <div className="grid grid-cols-4 gap-2">
                  {(['sm', 'md', 'lg', 'xl'] as ReaderSettings['fontSize'][]).map(sz => (
                    <button
                      key={sz}
                      onClick={() => onUpdateReaderSettings({ fontSize: sz })}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                        readerSettings.fontSize === sz
                          ? 'bg-amber-950/50 border-amber-500 text-amber-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {sz.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
