import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Users,
  Shield,
  HelpCircle,
  AlertCircle,
  Plus,
  Trash2,
  FileText,
  Sliders,
  Check
} from 'lucide-react';
import { CharacterProfile, RatingTag, Storyline } from '../types';
import { DEFAULT_STORYLINES } from '../data/defaultStorylines';

interface StoryComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveStoryline: (storyline: Storyline) => void;
  existingStoryline?: Storyline | null;
}

export const StoryComposerModal: React.FC<StoryComposerModalProps> = ({
  isOpen,
  onClose,
  onSaveStoryline,
  existingStoryline,
}) => {
  const [mode, setMode] = useState<'basic' | 'advanced'>(
    existingStoryline?.guideline ? 'advanced' : 'basic'
  );

  const [title, setTitle] = useState(existingStoryline?.title || '');
  const [summary, setSummary] = useState(existingStoryline?.summary || '');
  const [plotUser, setPlotUser] = useState(existingStoryline?.plotUser || '');
  const [plotAI, setPlotAI] = useState(existingStoryline?.plotAI || '');
  const [guideline, setGuideline] = useState(existingStoryline?.guideline || '');
  const [openingMessage, setOpeningMessage] = useState(existingStoryline?.openingMessage || '');
  const [alternativeOpenings, setAlternativeOpenings] = useState<string[]>(
    existingStoryline?.alternativeOpenings || []
  );
  const [aiReminder, setAiReminder] = useState(existingStoryline?.aiReminder || '');
  const [ratingTag, setRatingTag] = useState<RatingTag>(existingStoryline?.ratingTag || '13+');
  const [tags, setTags] = useState<string[]>(
    existingStoryline?.tags || ['Fantasy', 'Roleplay']
  );
  const [tagInput, setTagInput] = useState('');
  const [characters, setCharacters] = useState<CharacterProfile[]>(
    existingStoryline?.characters || []
  );
  const [recommendedPersona, setRecommendedPersona] = useState<string>(
    existingStoryline?.recommendedPersonaCharacterId || ''
  );

  // Game Master RPG Sheet config
  const [enableGameSheet, setEnableGameSheet] = useState(
    existingStoryline?.gameSheet?.enabled || false
  );

  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (presetId: string) => {
    const preset = DEFAULT_STORYLINES.find(s => s.id === presetId);
    if (!preset) return;
    setTitle(preset.title);
    setSummary(preset.summary);
    setPlotUser(preset.plotUser);
    setPlotAI(preset.plotAI);
    setGuideline(preset.guideline || '');
    setOpeningMessage(preset.openingMessage);
    setAlternativeOpenings(preset.alternativeOpenings || []);
    setAiReminder(preset.aiReminder || '');
    setRatingTag(preset.ratingTag);
    setTags(preset.tags || ['Fantasy']);
    setCharacters(preset.characters || []);
    setRecommendedPersona(preset.recommendedPersonaCharacterId || '');
    setEnableGameSheet(preset.gameSheet?.enabled || false);
    setValidationError(null);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleAddAltOpening = () => {
    setAlternativeOpenings([...alternativeOpenings, '']);
  };

  const handleUpdateAltOpening = (index: number, val: string) => {
    const updated = [...alternativeOpenings];
    updated[index] = val;
    setAlternativeOpenings(updated);
  };

  const handleRemoveAltOpening = (index: number) => {
    setAlternativeOpenings(alternativeOpenings.filter((_, i) => i !== index));
  };

  const handleAddCharacter = () => {
    const newChar: CharacterProfile = {
      id: `char-${Date.now()}`,
      name: '',
      role: 'NPC Utama',
      age: '',
      raceOrSpecies: '',
      description: '',
      publicDescription: '',
      aiDescription: '',
      isAiDescriptionDifferent: false,
      personality: '',
      speakingStyle: '',
      likes: '',
      dislikes: '',
      fears: '',
      reminder: '',
      tags: [],
    };
    setCharacters([...characters, newChar]);
  };

  const handleUpdateCharacter = (id: string, updates: Partial<CharacterProfile>) => {
    setCharacters(characters.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  const handleRemoveCharacter = (id: string) => {
    setCharacters(characters.filter(c => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setValidationError('Judul Storyline wajib diisi.');
      return;
    }
    if (!plotUser.trim() && !plotAI.trim()) {
      setValidationError('Ringkasan Alur / Prompt Plot wajib diisi.');
      return;
    }
    if (!openingMessage.trim()) {
      setValidationError('Pesan Pembuka (Opening Scenario) wajib diisi.');
      return;
    }

    if (mode === 'basic' && plotUser.length < 30) {
      setValidationError('Alur cerita terlalu pendek. Buat minimal 30 karakter agar AI paham konteks.');
      return;
    }

    const finalPlotAI = mode === 'basic' ? plotUser : plotAI || plotUser;

    const newStoryline: Storyline = {
      id: existingStoryline?.id || `story-${Date.now()}`,
      title: title.trim(),
      summary: summary.trim() || plotUser.slice(0, 150) + '...',
      plotUser: plotUser.trim(),
      plotAI: finalPlotAI.trim(),
      guideline: mode === 'advanced' ? guideline.trim() : undefined,
      openingMessage: openingMessage.trim(),
      alternativeOpenings: alternativeOpenings.filter(o => o.trim().length > 0),
      aiReminder: aiReminder.trim() || undefined,
      ratingTag,
      tags,
      characters,
      recommendedPersonaCharacterId: recommendedPersona || undefined,
      gameSheet: enableGameSheet
        ? existingStoryline?.gameSheet || {
            enabled: true,
            characterName: 'Pemain {{user}}',
            stats: [
              { id: 's1', key: 'HP', value: 100, max: 100 },
              { id: 's2', key: 'Kekuatan', value: 10 }
            ],
            inventory: [],
            statusEffects: ['Normal']
          }
        : { enabled: false, characterName: '{{user}}', stats: [], inventory: [], statusEffects: [] },
      isCustom: true,
      createdAt: existingStoryline?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    onSaveStoryline(newStoryline);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl text-slate-100 my-auto">
        {/* Modal Header */}
        <div className="p-5 border-b border-pink-500/20 flex items-center justify-between bg-slate-950/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500/30 via-purple-500/20 to-cyan-500/30 border border-pink-500/40 flex items-center justify-center text-pink-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-lg bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                  {existingStoryline ? 'Edit Storyline Novel' : 'Komposer Storyline Light Novel'}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-950/80 text-pink-300 border border-pink-700/60">
                  ライトノベル
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Atur dunia, plot, karakter NPC, dan instruksi khusus AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="bg-slate-800 p-1 rounded-lg flex items-center gap-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setMode('basic')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  mode === 'basic'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Basic Mode
              </button>
              <button
                type="button"
                onClick={() => setMode('advanced')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  mode === 'advanced'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Advanced Mode
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Preset Inspirasi */}
          {!existingStoryline && (
            <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 bg-slate-800/40">
              <span className="text-xs font-semibold text-slate-400 block mb-2">
                ⚡ Inspirasi Instan (Gunakan Preset):
              </span>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_STORYLINES.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition"
                  >
                    + {preset.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {validationError && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Placeholder Help Pill */}
          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/60 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                Gunakan tag <code className="bg-emerald-900/80 px-1.5 py-0.5 rounded text-white font-mono">{`{{user}}`}</code> untuk mewakili nama karakter pemain.
              </span>
            </div>
          </div>

          {/* Basic Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Judul Storyline <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Misal: Kerajaan Aethelgard: Pangeran Terbuang"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ringkasan Singkat (User-facing Summary)
              </label>
              <input
                type="text"
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="Deskripsi singkat yang tampil di pustaka cerita..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Genre / Theme Tags (FR-1.9) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tag Genre & Tema (FR-1.9)
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-300 text-xs border border-slate-700"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Tambah tag genre (mis. Fantasy, Isekai, Cyberpunk, Mystery)..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs border border-slate-700 font-semibold"
                >
                  + Tag
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Rating Konten
              </label>
              <div className="flex gap-2">
                {(['Semua Umur', '13+', '18+', 'Dark Fantasy'] as RatingTag[]).map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setRatingTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      ratingTag === tag
                        ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Plot Field */}
            {mode === 'basic' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alur Cerita & Latar Belakang (Dipakai Pengguna & AI) <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  value={plotUser}
                  onChange={e => {
                    setPlotUser(e.target.value);
                    setPlotAI(e.target.value);
                  }}
                  placeholder="Gambarkan latar belakang dunia, konflik utama, dan situasi awal yang dialami {{user}}..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Plot Tampilan Pengguna (Plot User)
                  </label>
                  <textarea
                    rows={4}
                    value={plotUser}
                    onChange={e => setPlotUser(e.target.value)}
                    placeholder="Deskripsi plot yang dapat dibaca oleh pemain..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Prompt Plot & Instruksi AI (AI-facing Prompt)
                  </label>
                  <textarea
                    rows={4}
                    value={plotAI}
                    onChange={e => setPlotAI(e.target.value)}
                    placeholder="Instruksi tersembunyi untuk AI: rahasia dunia, aturan sihir, plot twist..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            {mode === 'advanced' && (
              <div>
                <label className="block text-xs font-semibold text-purple-300 mb-1">
                  Panduan Gaya Penulisan (Writing Guideline)
                </label>
                <input
                  type="text"
                  value={guideline}
                  onChange={e => setGuideline(e.target.value)}
                  placeholder="Misal: Gunakan bahasa noir cyberpunk tajam, atmosferik, penuh detail sensorik..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            {/* AI Reminder (FR-1.4) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-amber-300">
                  AI Reminder (Instruksi Kritis Storyline)
                </label>
                <span className="text-[10px] text-slate-400">Selalu disisipkan ke AI</span>
              </div>
              <input
                type="text"
                value={aiReminder}
                onChange={e => setAiReminder(e.target.value)}
                placeholder="Misal: Lyra protektif tapi tegas. Malakor selalu berusaha merebut pedang {{user}}."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-amber-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Default Opening Message (FR-2.2) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Pesan Pembuka Utama (Opening Scenario) <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                value={openingMessage}
                onChange={e => setOpeningMessage(e.target.value)}
                placeholder="Pesan pertama yang langsung ditampilkan saat cerita dimulai..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-serif leading-relaxed"
              />
            </div>

            {/* Alternative Openings / Alternative Starts (FR-1.5) */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">
                    Pesan Pembuka Alternatif / Alternative Starts (FR-1.5)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Opsi skenario awal lain yang bisa dipilih pemain saat memulai sesi cerita baru.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddAltOpening}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Opsi Pembuka
                </button>
              </div>

              {alternativeOpenings.map((alt, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <textarea
                    rows={2}
                    value={alt}
                    onChange={e => handleUpdateAltOpening(idx, e.target.value)}
                    placeholder={`Skenario Pembuka Alternatif #${idx + 2}...`}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-serif"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAltOpening(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Standalone Linked Character Profiles (FR-1.6, FR-1.7, FR-1.8) */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-200">Profil Karakter (Standalone Character Profiles)</h3>
              </div>
              <button
                type="button"
                onClick={handleAddCharacter}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition"
              >
                <Plus className="w-3.5 h-3.5" />Tambah Karakter
              </button>
            </div>

            {characters.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Belum ada profil karakter. Tambahkan agar AI menjaga kepribadian NPC secara konsisten.</p>
            ) : (
              <div className="space-y-4">
                {characters.map((char) => (
                  <div key={char.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
                        <input
                          type="text"
                          value={char.name}
                          onChange={e => handleUpdateCharacter(char.id, { name: e.target.value })}
                          placeholder="Nama (mis. Lyra Vance)"
                          className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 font-bold"
                        />
                        <input
                          type="text"
                          value={char.role}
                          onChange={e => handleUpdateCharacter(char.id, { role: e.target.value })}
                          placeholder="Peran (mis. NPC Utama / Antagonis)"
                          className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={char.age || ''}
                            onChange={e => handleUpdateCharacter(char.id, { age: e.target.value })}
                            placeholder="Usia (mis. 24 thn)"
                            className="w-1/2 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200"
                          />
                          <input
                            type="text"
                            value={char.raceOrSpecies || ''}
                            onChange={e => handleUpdateCharacter(char.id, { raceOrSpecies: e.target.value })}
                            placeholder="Ras/Spesies"
                            className="w-1/2 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCharacter(char.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Public vs Secret AI Description Toggle (FR-1.7) */}
                    <div className="space-y-2 pt-1 border-t border-slate-900">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300">Deskripsi & Rahasia Tersembunyi</span>
                        <label className="flex items-center gap-1.5 text-[11px] text-purple-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={char.isAiDescriptionDifferent || false}
                            onChange={e => handleUpdateCharacter(char.id, { isAiDescriptionDifferent: e.target.checked })}
                            className="rounded border-slate-700 text-purple-600 focus:ring-0"
                          />
                          Bedakan Deskripsi Publik vs AI-Facing (Rahasia NPC)
                        </label>
                      </div>

                      {char.isAiDescriptionDifferent ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-0.5">Deskripsi Publik (Tampil ke Pemain):</span>
                            <textarea
                              rows={2}
                              value={char.publicDescription || char.description}
                              onChange={e => handleUpdateCharacter(char.id, { publicDescription: e.target.value, description: e.target.value })}
                              placeholder="Deskripsi fisik & yang diketahui umum..."
                              className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-purple-400 block mb-0.5">Deskripsi AI-Facing (Motif & Rahasia):</span>
                            <textarea
                              rows={2}
                              value={char.aiDescription || ''}
                              onChange={e => handleUpdateCharacter(char.id, { aiDescription: e.target.value })}
                              placeholder="Rahasia, motif tersembunyi, atau misi rahasia karakter..."
                              className="w-full bg-slate-900 border border-purple-900/60 rounded p-2 text-xs text-purple-200"
                            />
                          </div>
                        </div>
                      ) : (
                        <textarea
                          rows={2}
                          value={char.description}
                          onChange={e => handleUpdateCharacter(char.id, { description: e.target.value })}
                          placeholder="Deskripsi fisik, latar belakang, & kepribadian..."
                          className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200"
                        />
                      )}
                    </div>

                    {/* Additional Traits: Likes, Dislikes, Fears, Character Reminder (FR-1.8) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={char.likes || ''}
                        onChange={e => handleUpdateCharacter(char.id, { likes: e.target.value })}
                        placeholder="Suka: (mis. Teh hangat, pedang)"
                        className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                      />
                      <input
                        type="text"
                        value={char.dislikes || ''}
                        onChange={e => handleUpdateCharacter(char.id, { dislikes: e.target.value })}
                        placeholder="Benci: (mis. Pengkhianat)"
                        className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                      />
                      <input
                        type="text"
                        value={char.fears || ''}
                        onChange={e => handleUpdateCharacter(char.id, { fears: e.target.value })}
                        placeholder="Ketakutan: (mis. Kehilangan {{user}})"
                        className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                      />
                    </div>

                    {/* Character-level Reminder (FR-1.8) */}
                    <div>
                      <input
                        type="text"
                        value={char.reminder || ''}
                        onChange={e => handleUpdateCharacter(char.id, { reminder: e.target.value })}
                        placeholder="AI Character Guideline / Reminder: (mis. Karakter ini tidak pernah mundur dari pertempuran)"
                        className="w-full bg-slate-900 border border-amber-900/50 rounded px-2.5 py-1 text-xs text-amber-200 placeholder-slate-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Game Master RPG Mode Toggle (FR-6.1) */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  Aktifkan Mode Game Master & Lembar Stat (RPG Mechanics)
                </span>
                <span className="text-[11px] text-slate-400">
                  Mendukung lemparan dadu virtual, HP/Mana, dan inventori dalam bentuk teks.
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enableGameSheet}
                onChange={e => setEnableGameSheet(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-slate-900 py-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-950/50"
            >
              <Check className="w-4 h-4" />
              Simpan & Mainkan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
