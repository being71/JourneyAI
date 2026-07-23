import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  RotateCcw,
  Edit2,
  GitBranch,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  Dices,
  Sparkles,
  HelpCircle,
  MessageSquare,
  Shield,
  Layers,
  AlertTriangle,
  Check,
  Feather
} from 'lucide-react';
import { ChapterSummary, ChatMessage, ChatSession, Storyline } from '../types';
import { ReaderSettings } from '../utils/storage';

/**
 * Strips out trailing "PILIH TAKDIR" or numbered options block from the narration display text,
 * since those options are presented as interactive choice cards at the bottom.
 */
function cleanNarrationText(content: string): string {
  if (!content) return '';

  // 1. Strip trailing "PILIH TAKDIR" / "OPSI TAKDIR" header and everything following it
  let cleaned = content.replace(/(?:\r?\n){1,2}(?:\*\*|__|\*|#)?\s*(?:OPSI\s+|PILIHAN\s+)?(?:PILIH\s+)?TAKDIR\s*:?\s*(?:\*\*|__|\*)?[\s\S]*$/i, '');

  // 2. Also strip any remaining trailing block of numbered choices if at the end of the text
  cleaned = cleaned.replace(/(?:\r?\n){1,2}(?:[1-4][\.\)]\s+[\s\S]+)$/i, '');

  return cleaned.trim();
}

/**
 * Formats narrative text where dialogue inside double quotes "..." (or “...” or 「...」)
 * is styled with an orange color, while monologue / narrative text remains default text color.
 */
function renderFormattedText(content: string, isAssistantMessage: boolean = false) {
  if (!content) return null;

  const textToRender = isAssistantMessage ? cleanNarrationText(content) : content;

  // Split by double quote dialogue patterns
  const parts = textToRender.split(/("[^"]*"|“[^”]*”|「[^」]*」)/g);

  return parts.map((part, idx) => {
    if (!part) return null;

    const isDialogue =
      (part.startsWith('"') && part.endsWith('"')) ||
      (part.startsWith('“') && part.endsWith('”')) ||
      (part.startsWith('「') && part.endsWith('」'));

    if (isDialogue) {
      return (
        <span
          key={idx}
          className="text-orange-400 font-semibold drop-shadow-[0_0_6px_rgba(251,146,60,0.25)]"
        >
          {part}
        </span>
      );
    }

    return <span key={idx}>{part}</span>;
  });
}

/**
 * Dynamically generates context-aware quick action choices tailored to the active storyline,
 * NPC characters, inventory items, or explicit choices parsed from the last AI message.
 */
function getDynamicActionChoices(storyline: Storyline, session: ChatSession, messages: ChatMessage[]): string[] {
  // 1. Check if the last AI message contains explicit numbered/bullet options
  const lastAiMessage = [...messages].reverse().find(m => m.role === 'assistant');
  if (lastAiMessage && lastAiMessage.content) {
    const text = lastAiMessage.content;
    const lines = text.split('\n');
    const parsedChoices: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      // Skip lines that are purely headers like "**PILIH TAKDIR:**" or "*PILIH TAKDIR:*"
      if (/^(?:\*|_|#|\s)*(?:OPSI\s+|PILIHAN\s+)?(?:PILIH\s+)?TAKDIR\s*:?\s*(?:\*|_|#|\s)*$/i.test(trimmed)) {
        continue;
      }

      const match = trimmed.match(/^(?:[1-4A-D1-4][\.\)]|\[[1-4]\]|\([1-4]\)|[\-*•]|Opsi [1-4]:?|Pilihan [1-4]:?)[ ]?["'“]?(.*?)["'”]?$/i);
      if (match && match[1]) {
        let choiceText = match[1].trim();

        // Strip inline headers or leftover markdown tags
        choiceText = choiceText
          .replace(/^[\*\#_`\s]+/g, '')
          .replace(/^(?:OPSI\s+|PILIHAN\s+)?(?:PILIH\s+)?TAKDIR\s*:?\s*/i, '')
          .replace(/^(?:OPSI\s+AKSI|PILIHAN\s+AKSI)\s*:?\s*/i, '')
          .replace(/^[\*\#_`\s]+/g, '')
          .replace(/^["'“]|["'”]$/g, '')
          .trim();

        if (
          choiceText.length >= 5 &&
          choiceText.length <= 250 &&
          !choiceText.toLowerCase().startsWith('catatan') &&
          !choiceText.toLowerCase().startsWith('note') &&
          !choiceText.toLowerCase().startsWith('pilih takdir') &&
          !choiceText.toLowerCase().startsWith('opsi takdir')
        ) {
          parsedChoices.push(choiceText);
        }
      }
    }

    if (parsedChoices.length >= 2) {
      return parsedChoices.slice(0, 3);
    }
  }

  // 2. Otherwise generate rich dynamic "Pilih Takdir" narrative choices
  const activePlayerName = (session.playerName || 'Pemain').trim().toLowerCase();
  const activePlayerFirstName = activePlayerName.split(' ')[0];

  // Filter out any character profile that belongs to the player character
  const companionNpcs = (storyline.characters || []).filter(c => {
    if (!c || !c.name) return false;
    const charNameLower = c.name.trim().toLowerCase();
    const charFirstNameLower = charNameLower.split(' ')[0];

    // Exclude if character name matches active player name
    if (
      charNameLower === activePlayerName ||
      charFirstNameLower === activePlayerFirstName ||
      activePlayerName.includes(charNameLower) ||
      charNameLower.includes(activePlayerName)
    ) {
      return false;
    }

    // Exclude if set as recommended player persona
    if (storyline.recommendedPersonaCharacterId && storyline.recommendedPersonaCharacterId === c.id) {
      return false;
    }

    // Exclude if role indicates player/protagonist
    const roleLower = (c.role || '').toLowerCase();
    if (
      roleLower.includes('pemain') ||
      roleLower.includes('player') ||
      roleLower.includes('protagonis') ||
      roleLower.includes('pemeran utama') ||
      roleLower.includes('karakter utama')
    ) {
      return false;
    }

    return true;
  });

  const companion = companionNpcs.length > 0 ? companionNpcs[0] : null;
  const companionFirstName = companion ? companion.name.split(' ')[0] : '';
  const item = storyline.gameSheet?.inventory && storyline.gameSheet.inventory.length > 0 ? storyline.gameSheet.inventory[0] : null;
  const titleLower = (storyline.title + ' ' + storyline.summary).toLowerCase();

  const choices: string[] = [];

  if (titleLower.includes('cyber') || titleLower.includes('neon')) {
    choices.push(
      companion
        ? `Aku melangkah menyusuri lorong berlampu neon, mengamati sensor HUD-ku. "${companionFirstName}, bagaimana status kawasan di depan kita?" tanyaku.`
        : `Aku melangkah menyusuri lorong berlampu neon, merapatkan jubah sambil memeriksa status sensor HUD & indikator peretas implan-ku.`
    );
    choices.push(`Sambil berdiri mengamati pergerakan kamera pengawas & penjaga di sekitar, aku menyandarkan tubuh di dinding beton untuk memikirkan taktik.`);
    choices.push(
      item
        ? `Aku memeriksa ${item.name} di perbekalanku, memastikan semuanya siap tempur sebelum mengambil tindakan cepat.`
        : `Tanpa membuang waktu, aku melangkah cepat mengambil posisi taktis dengan senjata siap di genggaman.`
    );
  } else if (titleLower.includes('sihir') || titleLower.includes('akademi')) {
    choices.push(
      companion
        ? `Aku berjalan mendekati deretan grimoire kuno di sudut ruangan. "${companionFirstName}, apakah kamu yakin tempat ini aman dari pengawasan?" bisikku pelan.`
        : `Aku berjalan mendekati rak buku tua, mengamati pendaran tulisan mantra dan riak aura sihir di sekitarku.`
    );
    choices.push(`Sambil memegangi tongkat sihirku, aku meresapi konsentrasi aura di udara untuk memastikan tidak ada jebakan segel rahasia.`);
    choices.push(`Aku menyandarkan tubuh sejenak di dekat meja kayu oak, mengatur fokus pikiran dan napas sebelum menentukan langkah selanjutnya.`);
  } else {
    choices.push(
      companion
        ? `Aku berjalan perlahan mengamati sekeliling, lalu berpaling menatap ${companionFirstName}. "${companionFirstName}, menurutmu apa langkah terbaik kita sekarang?" tanyaku.`
        : `Aku berjalan perlahan mengamati sekeliling, mencerna setiap detail suasana sambil memikirkan keputusan terbaik yang harus kuambil.`
    );
    choices.push(`Sambil memegang erat tempat senjata di pinggangku, aku melangkah mendekati area sekitar untuk memeriksa situasi dengan cermat.`);
    choices.push(
      item
        ? `Aku memeriksa ${item.name} dalam perbekalanku, memastikan semuanya dalam kondisi siap pakai sebelum melangkah maju.`
        : `Aku mengambil napas dalam-dalam, mengatur pikiran yang berkecamuk, lalu bersiap mengambil tindakan selanjutnya.`
    );
  }

  return choices;
}

interface ChatViewProps {
  storyline: Storyline;
  session: ChatSession;
  messages: ChatMessage[];
  readerSettings: ReaderSettings;
  isLoading: boolean;
  onSendMessage: (text: string, isOOC?: boolean, diceResult?: ChatMessage['diceRoll']) => void;
  onRegenerateLastResponse: () => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onBranchFromMessage: (messageId: string) => void;
  onRollDice: (diceType: string, modifier: number, statChecked: string) => void;
  onOpenGuidanceModal: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  storyline,
  session,
  messages,
  readerSettings,
  isLoading,
  onSendMessage,
  onRegenerateLastResponse,
  onEditMessage,
  onDeleteMessage,
  onBranchFromMessage,
  onRollDice,
  onOpenGuidanceModal,
}) => {
  const [inputText, setInputText] = useState('');
  const [isOOCMode, setIsOOCMode] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showEditCacheWarning, setShowEditCacheWarning] = useState(false);

  // Expanded Chapter Summaries state
  const [expandedChapterIds, setExpandedChapterIds] = useState<Record<string, boolean>>({});

  // Dice selector popover
  const [showDiceMenu, setShowDiceMenu] = useState(false);
  const [selectedDiceType, setSelectedDiceType] = useState('d20');
  const [diceModifier, setDiceModifier] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim(), isOOCMode);
    setInputText('');
    setIsOOCMode(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStartEdit = (msg: ChatMessage) => {
    setEditingMessageId(msg.id);
    setEditContent(msg.content);
    setShowEditCacheWarning(true);
  };

  const handleConfirmEdit = (msgId: string) => {
    if (!editContent.trim()) return;
    onEditMessage(msgId, editContent.trim());
    setEditingMessageId(null);
    setShowEditCacheWarning(false);
  };

  const handleTriggerDiceRoll = () => {
    onRollDice(selectedDiceType, diceModifier, 'Pilihan Aksi');
    setShowDiceMenu(false);
  };

  const toggleChapterExpand = (id: string) => {
    setExpandedChapterIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Theme styling classes
  let themeBg = 'frieren-sky-bg text-slate-100';
  let cardBg = 'frieren-grimoire-card grimoire-corner-frame text-sky-100';
  let userCardBg = 'bg-sky-950/60 border-sky-500/40 text-sky-100 shadow-[0_0_15px_rgba(56,189,248,0.15)]';
  
  if (readerSettings.theme === 'bunga-blue-moon') {
    themeBg = 'bg-gradient-to-b from-sky-950 via-slate-900 to-indigo-950 text-slate-100';
    cardBg = 'bg-slate-900/90 border-sky-400/40 text-sky-100 blue-moon-glow';
    userCardBg = 'bg-indigo-950/70 border-indigo-500/50 text-indigo-100';
  } else if (readerSettings.theme === 'anime-dark') {
    themeBg = 'bg-[#0f0c1b] text-slate-100';
    cardBg = 'vn-dialogue-box border-pink-500/30 text-slate-100';
    userCardBg = 'bg-purple-950/40 border-purple-800/60 text-purple-100';
  } else if (readerSettings.theme === 'sakura-pink') {
    themeBg = 'bg-[#fff0f5] text-slate-900';
    cardBg = 'sakura-pink-box border-pink-300 text-slate-900';
    userCardBg = 'bg-pink-100/90 border-pink-300 text-pink-950';
  } else if (readerSettings.theme === 'sepia') {
    themeBg = 'bg-[#1a1815] text-[#e8dfd1]';
    cardBg = 'bg-[#24201c] border-[#38322c] text-[#e8dfd1]';
    userCardBg = 'bg-[#2e2822] border-[#443c34] text-[#f2e9dc]';
  } else if (readerSettings.theme === 'light') {
    themeBg = 'bg-slate-50 text-slate-900';
    cardBg = 'bg-white border-slate-200 text-slate-900 shadow-sm';
    userCardBg = 'bg-slate-100 border-slate-300 text-slate-900';
  } else if (readerSettings.theme === 'dark') {
    themeBg = 'bg-slate-950 text-slate-100';
    cardBg = 'bg-slate-900 border-slate-800 text-slate-100';
    userCardBg = 'bg-slate-900/90 border-slate-700 text-slate-100';
  }

  // Quick VN choices generated dynamically based on active story, characters, and context
  const dynamicVnChoices = getDynamicActionChoices(storyline, session, messages);

  // Font styling
  let fontStyle = 'font-gpt-proto tracking-tight';
  if (readerSettings.fontFamily === 'proto-mono') fontStyle = 'font-proto-mono';
  if (readerSettings.fontFamily === 'isekai') fontStyle = 'font-isekai tracking-wide';
  if (readerSettings.fontFamily === 'cinzel') fontStyle = 'font-cinzel tracking-wide';
  if (readerSettings.fontFamily === 'serif') fontStyle = 'font-jp-serif';
  if (readerSettings.fontFamily === 'sans') fontStyle = 'font-sans';
  
  let fontSizeClass = 'text-sm leading-relaxed';
  if (readerSettings.fontSize === 'sm') fontSizeClass = 'text-xs leading-relaxed';
  if (readerSettings.fontSize === 'lg') fontSizeClass = 'text-base leading-relaxed';
  if (readerSettings.fontSize === 'xl') fontSizeClass = 'text-lg leading-relaxed';

  return (
    <div className={`flex-1 flex flex-col h-[calc(100vh-4rem)] ${themeBg} transition-colors duration-200`}>
      {/* Scrollable Story Reader Canvas */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
        {/* Story Intro Header */}
        <div className={`p-6 rounded-2xl border ${cardBg} space-y-3`}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              {storyline.ratingTag}
            </span>
            <span className="text-xs text-slate-400">
              Pemain: <strong className="text-emerald-400">{session.playerName}</strong>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-isekai font-extrabold tracking-wide text-sky-300">
            {storyline.title}
          </h1>

          <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-emerald-500/60 pl-3">
            {storyline.plotUser}
          </p>

          {/* AI Reminder Indicator */}
          {storyline.aiReminder && (
            <div className="pt-2 text-[11px] text-amber-300/90 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>AI Reminder Aktif: "{storyline.aiReminder}"</span>
            </div>
          )}
        </div>

        {/* Render Chapter Summaries Inline (FR-5.3) */}
        {session.chapterSummaries && session.chapterSummaries.length > 0 && (
          <div className="space-y-3">
            {session.chapterSummaries.map(ch => {
              const isExpanded = !!expandedChapterIds[ch.id];
              return (
                <div key={ch.id} className="rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-indigo-200 overflow-hidden text-xs">
                  <button
                    onClick={() => toggleChapterExpand(ch.id)}
                    className="w-full p-3 flex items-center justify-between font-bold text-left hover:bg-indigo-900/30 transition"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      <span>Bab {ch.chapterNumber}: {ch.title}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-indigo-900/80 text-indigo-300 font-mono">
                        {ch.sourceMessageCount} Pesan Diringkas
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isExpanded && (
                    <div className="p-4 border-t border-indigo-800/50 bg-indigo-950/60 font-serif leading-relaxed text-slate-200">
                      {renderFormattedText(ch.summaryText)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Message Stream */}
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          const isEditing = editingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`group relative rounded-2xl p-5 border transition-all ${
                isUser
                  ? `${userCardBg} ml-4 sm:ml-12 shadow-sm`
                  : `${cardBg} mr-4 sm:mr-12 shadow-md`
              }`}
            >
              {/* Message Sender Header */}
              <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  {/* Speaker Orb Avatar */}
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                      isUser
                        ? 'bg-gradient-to-tr from-cyan-500 to-emerald-500 text-white shadow-sm'
                        : 'bg-gradient-to-tr from-pink-500 to-purple-500 text-white shadow-sm animate-pulse'
                    }`}
                  >
                    {isUser ? 'P' : 'AI'}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-display font-bold text-xs tracking-wider uppercase ${
                        isUser ? 'text-cyan-400' : 'text-pink-400'
                      }`}
                    >
                      {isUser ? session.playerName : 'AI Narator'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400/80">
                      {isUser ? '• プレイヤー' : '• 語り手'}
                    </span>
                  </div>

                  {msg.isOOC && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800 font-mono">
                      [OOC / メタ]
                    </span>
                  )}

                  {msg.diceRoll && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800 flex items-center gap-1 font-mono">
                      <Dices className="w-3 h-3 text-amber-400" />
                      {msg.diceRoll.diceType.toUpperCase()}: Total {msg.diceRoll.total}
                    </span>
                  )}
                </div>

                <span className="text-[10px] text-slate-400/80 font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Message Content */}
              {isEditing ? (
                <div className="space-y-3 pt-2">
                  {showEditCacheWarning && (
                    <div className="p-2.5 rounded-lg bg-amber-950/70 border border-amber-800 text-amber-200 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>
                        Mengedit pesan ini akan memperbarui alur cerita & membatalkan cache dari titik ini (FR-4.4).
                      </span>
                    </div>
                  )}
                  <textarea
                    rows={4}
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 font-serif leading-relaxed focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingMessageId(null)}
                      className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleConfirmEdit(msg.id)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                    >
                      Simpan & Perbarui Alur
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`${fontStyle} ${fontSizeClass} space-y-3 whitespace-pre-wrap leading-relaxed`}>
                  {renderFormattedText(msg.content, msg.role === 'assistant')}
                </div>
              )}

              {/* Message Hover Actions */}
              {!isEditing && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-3 -bottom-3 bg-slate-800 border border-slate-700 rounded-lg p-1 flex items-center gap-1 shadow-lg z-10">
                  <button
                    onClick={() => navigator.clipboard.writeText(msg.content)}
                    className="p-1.5 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-700 transition"
                    title="Salin Teks"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onBranchFromMessage(msg.id)}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 rounded hover:bg-slate-700 transition"
                    title="Bercabang dari Pesan Ini (FR-2.6)"
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                  </button>

                  {isUser && (
                    <button
                      onClick={() => handleStartEdit(msg)}
                      className="p-1.5 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-700 transition"
                      title="Edit Pesan (FR-2.5)"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {!isUser && index === messages.length - 1 && (
                    <button
                      onClick={onRegenerateLastResponse}
                      className="p-1.5 text-slate-400 hover:text-purple-400 rounded hover:bg-slate-700 transition"
                      title="Ulangi Respons AI (FR-2.4)"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteMessage(msg.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-700 transition"
                    title="Hapus Pesan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className={`p-5 rounded-2xl border ${cardBg} mr-12 space-y-2 animate-pulse`}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
              <span className="text-xs font-bold text-purple-400">AI Narator sedang menulis...</span>
            </div>
            <div className="h-4 bg-slate-800 rounded w-3/4"></div>
            <div className="h-4 bg-slate-800 rounded w-1/2"></div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Control Bar */}
      <div className={`p-4 border-t ${cardBg} backdrop-blur-md`}>
        <div className="max-w-4xl mx-auto space-y-2.5">
          {/* Visual Novel / Fate Choices (Pilih Takdir) */}
          {!isLoading && dynamicVnChoices.length > 0 && (
            <div className="space-y-1.5 pt-1 border-b border-slate-800/60 pb-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-pink-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  Pilih Takdir / Saran Aksi Naratif:
                </span>
                <span className="text-[10px] text-slate-500 hidden sm:inline">Klik opsi untuk mengisi narasi aksi</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {dynamicVnChoices.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => setInputText(choice)}
                    className="group text-left text-xs p-2.5 rounded-xl bg-slate-900/90 hover:bg-pink-950/40 border border-slate-800 hover:border-pink-500/60 text-slate-200 hover:text-pink-100 transition shadow-sm flex items-start gap-2 leading-relaxed"
                  >
                    <span className="w-5 h-5 rounded-full bg-pink-950/80 text-pink-400 border border-pink-800/60 flex items-center justify-center font-bold text-[10px] shrink-0 group-hover:scale-110 transition">
                      {i + 1}
                    </span>
                    <span className="flex-1 font-serif line-clamp-3 italic">"{choice}"</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Toolbar */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              {/* User Tag Badge */}
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-bold flex items-center gap-1">
                <Feather className="w-3 h-3 text-emerald-400" />
                {session.playerName}
              </span>

              {/* OOC Toggle Button (FR-2.7) */}
              <button
                onClick={() => setIsOOCMode(!isOOCMode)}
                className={`px-3 py-1 rounded-lg font-semibold border transition flex items-center gap-1 ${
                  isOOCMode
                    ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="Kirim pesan di luar narasi cerita untuk bertanya/mengklarifikasi ke AI"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>[OOC] {isOOCMode ? 'Mode Aktif' : 'Out-of-Character'}</span>
              </button>

              {/* Guidance Prompt Toggle (FR-2.8) */}
              <button
                onClick={onOpenGuidanceModal}
                className={`px-3 py-1 rounded-lg font-semibold border transition flex items-center gap-1 ${
                  session.guidancePrompt
                    ? 'bg-purple-950 text-purple-300 border-purple-700'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="Petunjuk pengarah kustom milik pemain"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Guidance Prompt {session.guidancePrompt ? '✓' : ''}</span>
              </button>

              {/* Dice Roller Toggle (FR-6.1) */}
              {session.gameSheet?.enabled && (
                <div className="relative">
                  <button
                    onClick={() => setShowDiceMenu(!showDiceMenu)}
                    className="px-3 py-1 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-800/80 hover:bg-amber-900/60 font-semibold transition flex items-center gap-1"
                  >
                    <Dices className="w-3.5 h-3.5 text-amber-400" />
                    <span>Lempar Dadu</span>
                  </button>

                  {showDiceMenu && (
                    <div className="absolute left-0 bottom-10 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl z-30 w-56 space-y-2 text-slate-100">
                      <span className="text-[11px] font-bold text-amber-300 block">Pilih Dadu Virtual</span>
                      <div className="grid grid-cols-3 gap-1">
                        {['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'].map(d => (
                          <button
                            key={d}
                            onClick={() => setSelectedDiceType(d)}
                            className={`py-1 rounded text-xs font-bold border ${
                              selectedDiceType === d
                                ? 'bg-amber-600 text-white border-amber-500'
                                : 'bg-slate-800 border-slate-700 text-slate-300'
                            }`}
                          >
                            {d.toUpperCase()}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[11px] text-slate-400">Mod:</span>
                        <input
                          type="number"
                          value={diceModifier}
                          onChange={e => setDiceModifier(Number(e.target.value))}
                          className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-100"
                        />
                        <button
                          onClick={handleTriggerDiceRoll}
                          className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold py-1 rounded"
                        >
                          Roll!
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Regenerate Action */}
            {messages.length > 1 && (
              <button
                onClick={onRegenerateLastResponse}
                disabled={isLoading}
                className="text-slate-400 hover:text-purple-300 text-xs flex items-center gap-1 transition"
                title="Ulangi balasan AI terakhir"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Re-roll AI</span>
              </button>
            )}
          </div>

          {/* Text Input Box */}
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <textarea
              rows={2}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isOOCMode
                  ? "Tanyakan sesuatu ke AI Asisten di luar narasi (misal: 'Jelaskan status hubungan Lyra saat ini')..."
                  : `Ketik tindakan, dialog, atau keputusan ${session.playerName}...`
              }
              className={`w-full bg-slate-950 border rounded-xl p-3 pr-12 text-sm text-slate-100 focus:outline-none transition resize-none ${
                isOOCMode
                  ? 'border-amber-600/80 focus:border-amber-500'
                  : 'border-slate-800 focus:border-emerald-500'
              }`}
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`absolute right-3 bottom-3 p-2 rounded-xl transition ${
                inputText.trim() && !isLoading
                  ? isOOCMode
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
