import React, { useState } from 'react';
import {
  X,
  Download,
  Upload,
  FileJson,
  FileText,
  Check,
  AlertCircle
} from 'lucide-react';
import { ChatMessage, ChatSession, Storyline } from '../types';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStoryline: Storyline | null;
  activeSession: ChatSession | null;
  messages: ChatMessage[];
  onImportStoryline: (importedStory: Storyline) => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  activeStoryline,
  activeSession,
  messages,
  onImportStoryline,
}) => {
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    if (!activeStoryline) return;
    const exportData = {
      version: '1.0',
      storyline: activeStoryline,
      session: activeSession,
      messages,
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-${activeStoryline.title.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    if (!activeStoryline) return;
    let md = `# ${activeStoryline.title}\n\n`;
    md += `> **Rating**: ${activeStoryline.ratingTag}\n`;
    md += `> **Pemain**: ${activeSession?.playerName || 'Pemain'}\n\n`;
    md += `## Plot & Latar Belakang\n${activeStoryline.plotUser}\n\n`;
    md += `---\n\n## Naskah Percakapan\n\n`;

    messages.forEach(m => {
      const sender = m.role === 'user' ? activeSession?.playerName || 'Pemain' : 'AI Narator';
      md += `### ${sender}${m.isOOC ? ' [OOC]' : ''}\n${m.content}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-novel-${activeStoryline.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleProcessImport = () => {
    try {
      if (!importJsonText.trim()) {
        setImportError('Silakan tempel teks JSON storyline.');
        return;
      }
      const parsed = JSON.parse(importJsonText);
      const storyToImport: Storyline = parsed.storyline || parsed;

      if (!storyToImport.title || !storyToImport.openingMessage) {
        setImportError('Format JSON tidak valid: Judul & Pesan Pembuka wajib ada.');
        return;
      }

      storyToImport.id = `story-imported-${Date.now()}`;
      onImportStoryline(storyToImport);
      setImportError(null);
      setImportJsonText('');
      onClose();
    } catch (err: any) {
      setImportError(`Gagal membaca JSON: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl text-slate-100 my-auto">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Ekspor & Impor Storyline</h3>
              <p className="text-xs text-slate-400">Bagikan cerita sebagai file JSON atau naskah Markdown</p>
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Export Section */}
          {activeStoryline && (
            <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Ekspor Storyline & Naskah Saat Ini
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleExportJSON}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold border border-slate-700 transition"
                >
                  <FileJson className="w-4 h-4 text-amber-400" />
                  Unduh JSON
                </button>

                <button
                  onClick={handleExportMarkdown}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold border border-slate-700 transition"
                >
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Unduh Markdown (.md)
                </button>
              </div>
            </div>
          )}

          {/* Import Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-emerald-400" />
              Impor Storyline dari JSON
            </h4>

            {importError && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            <textarea
              rows={5}
              value={importJsonText}
              onChange={e => setImportJsonText(e.target.value)}
              placeholder="Tempel teks JSON storyline di sini..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
            />

            <button
              onClick={handleProcessImport}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow"
            >
              Impor Storyline Ke Pustaka
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
