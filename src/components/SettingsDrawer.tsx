import React, { useState } from 'react';
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
  Info,
  Laptop,
  Cloud,
  Search,
  HelpCircle,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { ChatSession, CreativityLevel, ModelProvider, PromptMode, ResponseLength } from '../types';
import { ReaderSettings } from '../utils/storage';
import { detectLocalLlms, DetectedLocalModel } from '../utils/localLlmDetector';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  session: ChatSession;
  readerSettings: ReaderSettings;
  onUpdateSessionSettings: (updatedFields: Partial<ChatSession>) => void;
  onUpdateReaderSettings: (updatedFields: Partial<ReaderSettings>) => void;
  onOpenLocalLlmGuide: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  session,
  readerSettings,
  onUpdateSessionSettings,
  onUpdateReaderSettings,
  onOpenLocalLlmGuide,
}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedModels, setDetectedModels] = useState<DetectedLocalModel[]>([]);
  const [detectionRan, setDetectionRan] = useState(false);
  const [customEndpoint, setCustomEndpoint] = useState(session.localLlmEndpoint || 'http://localhost:11434');
  const [customModelName, setCustomModelName] = useState(session.localLlmModelName || 'llama3.2');

  if (!isOpen) return null;

  const handleRunDetection = async () => {
    setIsDetecting(true);
    setDetectionRan(true);
    try {
      const models = await detectLocalLlms([customEndpoint]);
      setDetectedModels(models);
    } catch (err) {
      console.error('Detection failed:', err);
    } finally {
      setIsDetecting(false);
    }
  };

  const isCurrentModelLocal = Boolean(session.isLocalLlm);

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
              <p className="text-xs text-slate-400">Pilih Cloud API atau LLM Lokal di perangkatmu</p>
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
          {/* Active LLM Type Indicator Badge */}
          <div className={`p-3.5 rounded-2xl border transition flex items-center justify-between ${
            isCurrentModelLocal
              ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200'
              : 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200'
          }`}>
            <div className="flex items-center gap-2.5">
              {isCurrentModelLocal ? (
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Laptop className="w-4 h-4" />
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Cloud className="w-4 h-4" />
                </div>
              )}
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                  Status Engine Aktif:
                </span>
                <span className="text-xs font-bold flex items-center gap-1.5">
                  {isCurrentModelLocal ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Lokal LLM ({session.localLlmModelName || session.selectedModel})
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      Cloud API ({session.selectedModel})
                    </>
                  )}
                </span>
              </div>
            </div>

            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
              isCurrentModelLocal
                ? 'bg-emerald-900/80 text-emerald-300 border-emerald-600'
                : 'bg-cyan-900/80 text-cyan-300 border-cyan-600'
            }`}>
              {isCurrentModelLocal ? '💻 LOKAL' : '☁️ CLOUD API'}
            </span>
          </div>

          {/* SECTION: CHOICE BETWEEN CLOUD API & LOCAL LLM */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Pilih Jenis Engine Model AI
              </label>
              <button
                onClick={onOpenLocalLlmGuide}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline font-medium"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Guide LLM Lokal
              </button>
            </div>

            {/* Local LLM Detector Button */}
            <div className="space-y-2 mb-4">
              <button
                onClick={handleRunDetection}
                disabled={isDetecting}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 border border-emerald-400/40"
              >
                {isDetecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    Mendeteksi Server LLM Lokal (Ollama / LM Studio)...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Mendeteksi LLM Lokal Saja (Scan Ports)
                  </>
                )}
              </button>

              {/* Detected Models List */}
              {detectionRan && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-1.5">
                    <span className="font-bold text-slate-200">Hasil Deteksi Server Lokal:</span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {detectedModels.length} Model Ditemukan
                    </span>
                  </div>

                  {detectedModels.length > 0 ? (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {detectedModels.map(dm => (
                        <button
                          key={dm.id}
                          onClick={() => {
                            onUpdateSessionSettings({
                              isLocalLlm: true,
                              selectedModel: `local:${dm.name}`,
                              localLlmEndpoint: dm.endpoint,
                              localLlmProvider: dm.provider,
                              localLlmModelName: dm.name,
                            });
                          }}
                          className={`w-full p-2 rounded-lg text-left border text-xs transition flex items-center justify-between ${
                            session.isLocalLlm && session.localLlmModelName === dm.name
                              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-emerald-600/60'
                          }`}
                        >
                          <div>
                            <span className="font-bold block text-slate-100 flex items-center gap-1.5">
                              <Laptop className="w-3.5 h-3.5 text-emerald-400" />
                              {dm.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {dm.endpoint} {dm.size ? `• ${dm.size}` : ''}
                            </span>
                          </div>
                          <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-semibold uppercase">
                            {dm.provider}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200/90 text-xs space-y-1">
                      <p className="font-bold flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        Tidak Ada LLM Lokal Terdeteksi
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Pastikan Ollama / LM Studio berjalan di komputermu dengan fitur CORS diaktifkan.
                      </p>
                      <button
                        onClick={onOpenLocalLlmGuide}
                        className="text-[11px] text-amber-300 underline font-bold mt-1 block"
                      >
                        Buka Panduan & Salin Perintah CORS Ollama →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Custom Local LLM Manual Setup */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 mb-4">
              <span className="text-xs font-bold text-slate-200 block flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-emerald-400" />
                Konfigurasi Manual Endpoint Local LLM
              </span>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Base Endpoint URL:</label>
                  <input
                    type="text"
                    value={customEndpoint}
                    onChange={e => setCustomEndpoint(e.target.value)}
                    placeholder="http://localhost:11434 atau http://localhost:1234/v1"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Nama Model Local:</label>
                  <input
                    type="text"
                    value={customModelName}
                    onChange={e => setCustomModelName(e.target.value)}
                    placeholder="llama3.2, mistral, qwen2.5, dll."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  onClick={() => {
                    onUpdateSessionSettings({
                      isLocalLlm: true,
                      selectedModel: `local:${customModelName}`,
                      localLlmEndpoint: customEndpoint,
                      localLlmProvider: customEndpoint.includes('1234') ? 'lmstudio' : 'ollama',
                      localLlmModelName: customModelName,
                    });
                  }}
                  className="w-full py-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/80 font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Gunakan LLM Lokal Ini
                </button>
              </div>
            </div>

            {/* 8GB VRAM OPTIMIZATION & PRESET CARD (Khusus Local LLM) */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/60 to-slate-950 border border-emerald-500/40 space-y-3 mb-4 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  Optimasi Integrasi GPU 8GB VRAM
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-200 border border-emerald-600 font-mono font-bold">
                  8GB VRAM READY
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-normal">
                Khusus LLM lokal! Mengkonfigurasi alokasi VRAM GPU, membatasi context window (num_ctx), dan mengaktifkan offloading GPU 100% agar model 7B/8B (Llama 3.1, Qwen 2.5, DeepSeek R1) berjalan mulus tanpa lag.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onUpdateSessionSettings({
                      isLocalLlm: true,
                      localLlmVramPreset: '8gb',
                      localLlmNumCtx: 4096,
                      contextLimitTokens: 4096,
                    });
                  }}
                  className={`p-2.5 rounded-lg border text-left text-xs transition ${
                    session.localLlmVramPreset === '8gb' && (session.localLlmNumCtx || 4096) === 4096
                      ? 'bg-emerald-900/90 border-emerald-400 text-emerald-100 font-bold shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-emerald-600'
                  }`}
                >
                  <span className="font-bold block text-emerald-300 text-[11px]">⚡ 8GB VRAM (4K Context)</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Kecepatan tinggi, GPU load 100% mulus</span>
                </button>

                <button
                  onClick={() => {
                    onUpdateSessionSettings({
                      isLocalLlm: true,
                      localLlmVramPreset: '8gb',
                      localLlmNumCtx: 8192,
                      contextLimitTokens: 8192,
                    });
                  }}
                  className={`p-2.5 rounded-lg border text-left text-xs transition ${
                    session.localLlmVramPreset === '8gb' && session.localLlmNumCtx === 8192
                      ? 'bg-emerald-900/90 border-emerald-400 text-emerald-100 font-bold shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-emerald-600'
                  }`}
                >
                  <span className="font-bold block text-emerald-300 text-[11px]">🧠 8GB VRAM (8K Context)</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Memori panjang untuk arc cerita besar</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-1 font-semibold">Rekomendasi Model 8GB VRAM:</span>
                <div className="flex flex-wrap gap-1">
                  {['llama3.1:8b', 'qwen2.5:7b', 'deepseek-r1:8b', 'gemma2:9b', 'mistral:7b'].map(mName => (
                    <button
                      key={mName}
                      onClick={() => {
                        setCustomModelName(mName);
                        onUpdateSessionSettings({
                          isLocalLlm: true,
                          selectedModel: `local:${mName}`,
                          localLlmModelName: mName,
                          localLlmEndpoint: customEndpoint,
                          localLlmProvider: 'ollama',
                          localLlmVramPreset: '8gb',
                          localLlmNumCtx: session.localLlmNumCtx || 4096,
                        });
                      }}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-900 hover:bg-emerald-950 border border-slate-700 hover:border-emerald-500 text-slate-200 font-mono transition"
                    >
                      {mName}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Standard Cloud API Models List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                Model Cloud API (Online / Default)
              </span>

              {[
                {
                  id: 'gemini-3.6-flash' as ModelProvider,
                  name: 'Gemini 3.6 Flash',
                  tag: '☁️ Cloud API (Default)',
                  desc: 'Sangat cepat, sangat cerdas, ideal untuk cerita interaktif berkecepatan tinggi.',
                },
                {
                  id: 'sao10k/llama-3.1-8b-stheno-v3.4' as ModelProvider,
                  name: 'Sao10K/Llama-3.1-8B-Stheno-v3.4',
                  tag: '☁️ Cloud Stheno',
                  desc: 'Fine-tune Llama 3.1 8B legendaris dari Sao10K untuk roleplay imersif & penulisan novel tak terbatas.',
                },
                {
                  id: 'gemini-3.1-pro-preview' as ModelProvider,
                  name: 'Gemini 3.1 Pro',
                  tag: '☁️ Cloud Pro',
                  desc: 'Penalaran kompleks tinggi untuk plot konspirasi rumit & intrik politik.',
                },
                {
                  id: 'gemini-3.1-flash-lite' as ModelProvider,
                  name: 'Gemini 3.1 Flash Lite',
                  tag: '☁️ Cloud Lite',
                  desc: 'Latensi terendah, cocok untuk sesi santai dengan biaya minimal.',
                },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() =>
                    onUpdateSessionSettings({
                      isLocalLlm: false,
                      selectedModel: m.id,
                    })
                  }
                  className={`w-full p-3 rounded-xl text-left border transition ${
                    !session.isLocalLlm && session.selectedModel === m.id
                      ? 'bg-cyan-950/50 border-cyan-500/70 text-cyan-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-100">{m.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-semibold">
                      {m.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 1. Kreativitas AI / Temperature */}
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
          </div>

          {/* 2. Target Panjang Respons */}
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
          </div>

          {/* 3. Mode Prompt */}
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

          {/* 4. Tampilan Reader & Tipografi */}
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
