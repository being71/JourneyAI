import React, { useState } from 'react';
import { X, Sparkles, Check } from 'lucide-react';

interface GuidancePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGuidance: string;
  onSaveGuidance: (guidance: string) => void;
}

export const GuidancePromptModal: React.FC<GuidancePromptModalProps> = ({
  isOpen,
  onClose,
  currentGuidance,
  onSaveGuidance,
}) => {
  const [guidance, setGuidance] = useState(currentGuidance || '');

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveGuidance(guidance.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-100 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-base">Guidance Prompt Pemain (FR-2.8)</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Petunjuk kustom milik pemain ini akan disisipkan ke pesan pemain untuk mengarahkan gaya narasi atau fokus aksi (berbeda dari AI Reminder milik pembuat cerita).
        </p>

        <textarea
          rows={4}
          value={guidance}
          onChange={e => setGuidance(e.target.value)}
          placeholder="Misal: Fokus pada elemen strategi perang dan negosiasi diplomatik..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
        />

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => {
              setGuidance('');
              onSaveGuidance('');
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
          >
            Hapus Guidance
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow"
          >
            <Check className="w-4 h-4" />
            Simpan Petunjuk
          </button>
        </div>
      </div>
    </div>
  );
};
