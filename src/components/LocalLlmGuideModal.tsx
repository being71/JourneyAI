import React, { useState } from 'react';
import {
  X,
  Laptop,
  Terminal,
  Check,
  Copy,
  ExternalLink,
  HelpCircle,
  Zap,
  ShieldCheck,
  Search,
  BookOpen,
  Sparkles
} from 'lucide-react';

interface LocalLlmGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDetectNow: () => void;
}

export const LocalLlmGuideModal: React.FC<LocalLlmGuideModalProps> = ({
  isOpen,
  onClose,
  onDetectNow,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                Panduan Pemasangan & Konfigurasi LLM Lokal
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-mono">
                  Ollama / LM Studio
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Jalankan AI Novel di perangkat komputer lokal secara privat, tanpa batasan kuota & internet!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200 text-sm leading-relaxed">
          {/* Quick Notice Banner */}
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-emerald-300">Mengapa Menggunakan LLM Lokal?</p>
              <p className="text-emerald-200/90">
                LLM lokal memproses narasi novel 100% di GPU/RAM komputermu. Tidak ada batasan rate limit/kuota,
                privasi data terjamin, dan dapat digunakan secara offline.
              </p>
            </div>
          </div>

          {/* 8GB VRAM SPECIFIC GPU INTEGRATION GUIDE */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/50 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2">
              <h4 className="font-bold text-emerald-300 flex items-center gap-2 text-base">
                <Zap className="w-5 h-5 text-emerald-400" />
                Panduan Integrasi & Optimasi GPU 8GB VRAM
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-200 border border-emerald-600 font-mono">
                  KHUSUS LLM LOKAL
                </span>
              </h4>
            </div>

            <div className="space-y-3 text-xs text-slate-200">
              <p className="leading-relaxed">
                GPU dengan <strong className="text-emerald-300">8GB VRAM</strong> (seperti RTX 3060 12GB/8GB, RTX 4060, RTX 2070/3070, RX 6600/7600) adalah <strong className="text-amber-300">sweet spot sempurna</strong> untuk menjalankan LLM lokal 7B–9B dengan quant 4-bit (Q4_K_M) secara 100% di VRAM tanpa bottleneck CPU.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-emerald-400 block text-[11px]">1. Model Pilihan Utama (Sesuai VRAM 8GB):</span>
                  <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                    <li><code className="text-cyan-300 font-mono">llama3.1:8b</code> (~4.9 GB VRAM) — Roleplay imersif.</li>
                    <li><code className="text-cyan-300 font-mono">qwen2.5:7b</code> (~4.7 GB VRAM) — Pemahaman B.Indo terbaik.</li>
                    <li><code className="text-cyan-300 font-mono">deepseek-r1:8b</code> (~4.9 GB VRAM) — Penalaran takdir cerita.</li>
                    <li><code className="text-cyan-300 font-mono">gemma2:9b</code> (~5.4 GB VRAM) — Bahasa estetik & halus.</li>
                  </ul>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-amber-300 block text-[11px]">2. Formula Context Window (8GB VRAM):</span>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Model 7B Q4 memakan ~4.8 GB VRAM. Sisa ~2.5 GB VRAM digunakan untuk KV Cache context:
                  </p>
                  <ul className="text-[11px] text-slate-300 space-y-1">
                    <li>⚡ <strong>4096 Tokens (Default Aplikasi)</strong>: Pemakaian VRAM ~6.2 GB total (100% Lancar di GPU).</li>
                    <li>🧠 <strong>8192 Tokens</strong>: Pemakaian VRAM ~7.5 GB total (Maksimal VRAM 8GB).</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="font-bold text-slate-200 block text-[11px]">Command Cepat Unduh Model 8GB VRAM (Ollama):</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300">
                    <span>ollama run llama3.1:8b</span>
                    <button
                      onClick={() => copyToClipboard('ollama run llama3.1:8b', 101)}
                      className="text-slate-400 hover:text-slate-100 text-[10px] flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-700"
                    >
                      {copiedIndex === 101 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300">
                    <span>ollama run qwen2.5:7b</span>
                    <button
                      onClick={() => copyToClipboard('ollama run qwen2.5:7b', 102)}
                      className="text-slate-400 hover:text-slate-100 text-[10px] flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-700"
                    >
                      {copiedIndex === 102 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300">
                    <span>ollama run deepseek-r1:8b</span>
                    <button
                      onClick={() => copyToClipboard('ollama run deepseek-r1:8b', 103)}
                      className="text-slate-400 hover:text-slate-100 text-[10px] flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-700"
                    >
                      {copiedIndex === 103 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300">
                    <span>ollama run gemma2:9b</span>
                    <button
                      onClick={() => copyToClipboard('ollama run gemma2:9b', 104)}
                      className="text-slate-400 hover:text-slate-100 text-[10px] flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-700"
                    >
                      {copiedIndex === 104 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* OLLAMA GUIDE */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-slate-100 flex items-center gap-2 text-base">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">1</span>
                Ollama (Rekomendasi Utama)
              </h4>
              <a
                href="https://ollama.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Unduh Ollama <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <ol className="list-decimal list-inside space-y-3 text-xs text-slate-300">
              <li>
                <strong className="text-slate-100">Unduh & Install Ollama:</strong> Buka{' '}
                <a href="https://ollama.com" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                  ollama.com
                </a>{' '}
                lalu pasang di Windows, macOS, atau Linux.
              </li>
              <li>
                <strong className="text-slate-100">Unduh Model Pilihan di Terminal / CMD:</strong>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300">
                    <span>ollama run llama3.2</span>
                    <button
                      onClick={() => copyToClipboard('ollama run llama3.2', 1)}
                      className="text-slate-400 hover:text-slate-100 text-[10px] flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded"
                    >
                      {copiedIndex === 1 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedIndex === 1 ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300">
                    <span>ollama run qwen2.5</span>
                    <button
                      onClick={() => copyToClipboard('ollama run qwen2.5', 2)}
                      className="text-slate-400 hover:text-slate-100 text-[10px] flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded"
                    >
                      {copiedIndex === 2 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedIndex === 2 ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>
                </div>
              </li>
              <li className="space-y-1">
                <strong className="text-amber-300">⚠️ PENTING (Izin Akses CORS Browser):</strong>
                <p className="text-slate-400 leading-normal">
                  Agar web browser diizinkan mengakses Ollama lokal, kamu perlu mengaktifkan header CORS di Ollama:
                </p>
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 block font-semibold">Windows (PowerShell):</span>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-amber-500/40 font-mono text-[11px] text-amber-200">
                    <span>$env:OLLAMA_ORIGINS="*"; ollama serve</span>
                    <button
                      onClick={() => copyToClipboard('$env:OLLAMA_ORIGINS="*"; ollama serve', 3)}
                      className="text-amber-400 hover:text-amber-200 text-[10px] flex items-center gap-1 bg-amber-950 px-2 py-0.5 rounded border border-amber-800"
                    >
                      {copiedIndex === 3 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedIndex === 3 ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400 block font-semibold">Linux / macOS (Terminal):</span>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-amber-500/40 font-mono text-[11px] text-amber-200">
                    <span>OLLAMA_ORIGINS="*" ollama serve</span>
                    <button
                      onClick={() => copyToClipboard('OLLAMA_ORIGINS="*" ollama serve', 4)}
                      className="text-amber-400 hover:text-amber-200 text-[10px] flex items-center gap-1 bg-amber-950 px-2 py-0.5 rounded border border-amber-800"
                    >
                      {copiedIndex === 4 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedIndex === 4 ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>
                </div>
              </li>
            </ol>
          </div>

          {/* LM STUDIO GUIDE */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-slate-100 flex items-center gap-2 text-base">
                <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 font-mono text-xs flex items-center justify-center font-bold">2</span>
                LM Studio
              </h4>
              <a
                href="https://lmstudio.ai"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-purple-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Unduh LM Studio <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300">
              <li>Unduh LM Studio dari <a href="https://lmstudio.ai" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">lmstudio.ai</a>.</li>
              <li>Cari dan unduh model GGUF (misal: Llama 3.1 8B, Qwen 2.5, Mistral, Stheno).</li>
              <li>Buka tab <strong className="text-slate-100">Local Server</strong> (ikon <code className="bg-slate-800 px-1 rounded">&lt;-&gt;</code>) di sidebar kiri LM Studio.</li>
              <li>Pilih model yang sudah diunduh, centang <strong className="text-emerald-400">"Enable CORS"</strong>.</li>
              <li>Klik <strong className="text-purple-300">"Start Server"</strong> (Server default berjalan di Port 1234).</li>
            </ol>
          </div>

          {/* JAN / KOBOLDCPP / OTHERS */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <h4 className="font-bold text-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-xs flex items-center justify-center font-bold">3</span>
              Jan.ai / KoboldCPP / LocalAI
            </h4>
            <p className="text-slate-400">
              Pastikan server OpenAI-Compatible di aplikasi lokalmu aktif di port 1337, 8080, atau 5001 dengan fitur CORS diaktifkan.
            </p>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-400 hidden sm:block">
            Setelah server lokal aktif, klik tombol deteksi untuk mendeteksi model secara otomatis.
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                onClose();
                onDetectNow();
              }}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <Search className="w-4 h-4" />
              Deteksi LLM Lokal Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
