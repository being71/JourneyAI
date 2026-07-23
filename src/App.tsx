/**
 * Ledger — Interactive AI Novel Chat Engine
 * Main React Application
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ChatSession,
  ChatMessage,
  Storyline,
  TokenStats,
  GameSheet,
  ChapterSummary
} from './types';
import {
  loadStorylines,
  saveStorylines,
  addOrUpdateStoryline,
  deleteStoryline,
  loadSessions,
  saveSession,
  deleteSession,
  getActiveSessionId,
  setActiveSessionId,
  getSessionMessages,
  saveSessionMessages,
  loadReaderSettings,
  saveReaderSettings,
  ReaderSettings
} from './utils/storage';
import {
  estimateTokenCount,
  calculateEstimatedCost,
  buildPromptCacheStatus
} from './utils/tokenCalculator';

import { Navbar } from './components/Navbar';
import { ChatView } from './components/ChatView';
import { StoryComposerModal } from './components/StoryComposerModal';
import { StoryLibraryModal } from './components/StoryLibraryModal';
import { TokenSummaryDrawer } from './components/TokenSummaryDrawer';
import { ChapterSummaryManager } from './components/ChapterSummaryManager';
import { GameSheetDrawer } from './components/GameSheetDrawer';
import { SettingsDrawer } from './components/SettingsDrawer';
import { BranchingModal } from './components/BranchingModal';
import { ImportExportModal } from './components/ImportExportModal';
import { GuidancePromptModal } from './components/GuidancePromptModal';
import { LocalLlmGuideModal } from './components/LocalLlmGuideModal';
import { queryLocalLlmDirectly } from './utils/localLlmDetector';

export default function App() {
  // --- Persistent States ---
  const [storylines, setStorylines] = useState<Storyline[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [activeStoryline, setActiveStoryline] = useState<Storyline | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [readerSettings, setReaderSettings] = useState<ReaderSettings>(loadReaderSettings());

  // --- UI Modals & Drawers ---
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isTokenDrawerOpen, setIsTokenDrawerOpen] = useState(false);
  const [isChapterManagerOpen, setIsChapterManagerOpen] = useState(false);
  const [isGameSheetOpen, setIsGameSheetOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBranchingOpen, setIsBranchingOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isGuidanceModalOpen, setIsGuidanceModalOpen] = useState(false);
  const [isLocalLlmGuideOpen, setIsLocalLlmGuideOpen] = useState(false);
  const [editingStoryline, setEditingStoryline] = useState<Storyline | null>(null);

  // --- Chat Loading State ---
  const [isLoading, setIsLoading] = useState(false);
  const [lastEditTimestamp, setLastEditTimestamp] = useState<number | undefined>(undefined);

  // --- Token Stats State ---
  const [tokenStats, setTokenStats] = useState<TokenStats>({
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    cachedTokens: 0,
    isCacheActive: false,
    estimatedCostUsd: 0,
  });

  // Load initial datasets on mount
  useEffect(() => {
    const loadedStories = loadStorylines();
    setStorylines(loadedStories);

    const loadedSess = loadSessions();
    setSessions(loadedSess);

    const activeSessId = getActiveSessionId();
    if (activeSessId) {
      const sess = loadedSess.find(s => s.id === activeSessId);
      if (sess) {
        const story = loadedStories.find(st => st.id === sess.storylineId);
        if (story) {
          setActiveSession(sess);
          setActiveStoryline(story);
          const msgs = getSessionMessages(sess.id);
          setMessages(msgs);
          return;
        }
      }
    }

    // Default to first storyline if no active session
    if (loadedStories.length > 0) {
      handleSelectStoryline(loadedStories[0], 'Renard');
    }
  }, []);

  // Recalculate estimated tokens whenever messages, session, or storyline change
  useEffect(() => {
    if (!activeStoryline || !activeSession) return;

    const storylineTokens = estimateTokenCount(activeStoryline.plotAI || activeStoryline.plotUser);
    const messagesTokens = messages.reduce((acc, m) => acc + estimateTokenCount(m.content), 0);
    const chapterTokens = (activeSession.chapterSummaries || []).reduce(
      (acc, c) => acc + estimateTokenCount(c.summaryText),
      0
    );

    const inputEst = storylineTokens + messagesTokens + chapterTokens + 250; // System instructions overhead
    const outputEst = tokenStats.outputTokens || 200;

    const cacheInfo = buildPromptCacheStatus(inputEst, lastEditTimestamp);
    const cost = calculateEstimatedCost(inputEst, outputEst, activeSession.selectedModel);

    setTokenStats({
      inputTokens: inputEst,
      outputTokens: outputEst,
      totalTokens: inputEst + outputEst,
      cachedTokens: cacheInfo.cachedTokens,
      isCacheActive: cacheInfo.isCacheActive,
      cacheInvalidatedReason: cacheInfo.message,
      estimatedCostUsd: cost,
    });
  }, [messages, activeStoryline, activeSession, lastEditTimestamp]);

  // --- Start New Session for a Storyline ---
  const handleSelectStoryline = (storyline: Storyline, playerName: string) => {
    const formattedOpening = storyline.openingMessage.replace(/\{\{user\}\}/gi, playerName);

    const initialMsg: ChatMessage = {
      id: `msg-opening-${Date.now()}`,
      sessionId: `session-${Date.now()}`,
      role: 'assistant',
      content: formattedOpening,
      timestamp: Date.now(),
    };

    const newSession: ChatSession = {
      id: initialMsg.sessionId,
      storylineId: storyline.id,
      title: `${storyline.title} (${playerName})`,
      playerName,
      activeBranchId: 'main-branch',
      creativity: 'Seimbang',
      responseLength: 'Sedang',
      promptMode: 'Naratif Bebas (V1)',
      selectedModel: 'gemini-3.6-flash',
      contextLimitTokens: 16000,
      gameSheet: storyline.gameSheet,
      chapterSummaries: [],
      arcSummaries: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setActiveStoryline(storyline);
    setActiveSession(newSession);
    setMessages([initialMsg]);

    saveSession(newSession);
    setActiveSessionId(newSession.id);
    saveSessionMessages(newSession.id, [initialMsg]);

    const updatedSessList = loadSessions();
    setSessions(updatedSessList);
  };

  // --- Switch to an existing session ---
  const handleSelectSession = (sessionId: string) => {
    const sess = sessions.find(s => s.id === sessionId);
    if (!sess) return;
    const story = storylines.find(st => st.id === sess.storylineId);
    if (!story) return;

    setActiveSession(sess);
    setActiveStoryline(story);
    setActiveSessionId(sess.id);

    const msgs = getSessionMessages(sess.id);
    setMessages(msgs);
  };

  // --- Send Message & Query Gemini AI Engine ---
  const handleSendMessage = async (
    text: string,
    isOOC = false,
    diceResult?: ChatMessage['diceRoll']
  ) => {
    if (!activeStoryline || !activeSession || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sessionId: activeSession.id,
      role: 'user',
      content: text,
      isOOC,
      diceRoll: diceResult,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    saveSessionMessages(activeSession.id, updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyline: activeStoryline,
          session: activeSession,
          messages: updatedMessages,
          userPrompt: text,
          isOOC,
          diceResult,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error');
      }

      const data = await response.json();

      let assistantText = data.text;

      // Handle Client-side fallback if Local LLM endpoint is on user's machine
      if (data.fallbackToClient) {
        try {
          assistantText = await queryLocalLlmDirectly({
            endpoint: data.localEndpoint,
            provider: data.provider,
            modelName: data.localModel,
            systemInstruction: data.systemInstruction,
            messages: data.messagesFormatted,
            temperature: data.temperature,
          });
        } catch (localErr: any) {
          throw new Error(`Tidak dapat terhubung ke LLM Lokal (${data.localEndpoint}). Pastikan Ollama / LM Studio berjalan dengan CORS (*): ${localErr.message}`);
        }
      }

      const assistantMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sessionId: activeSession.id,
        role: 'assistant',
        content: assistantText,
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);
      saveSessionMessages(activeSession.id, finalMessages);

      // Check threshold for automatic chapter summarization (FR-5.1)
      const unsummarizedCount = finalMessages.length - (activeSession.chapterSummaries.reduce((acc, c) => acc + c.sourceMessageCount, 0));
      if (unsummarizedCount >= 12) {
        triggerAutoChapterSummary(finalMessages, activeSession.chapterSummaries.length + 1);
      }
    } catch (err: any) {
      console.error('Failed to send message:', err);
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sessionId: activeSession.id,
        role: 'assistant',
        content: `⚠️ Maaf, terjadi kesalahan saat menghubungi AI Engine: ${err.message}. Silakan coba lagi.`,
        timestamp: Date.now(),
      };
      setMessages([...updatedMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Trigger Auto / Manual Chapter Summary (FR-5.1, FR-5.4) ---
  const triggerAutoChapterSummary = async (currentMsgs: ChatMessage[], chapNum: number) => {
    if (!activeStoryline || !activeSession) return;

    try {
      const resp = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storylineTitle: activeStoryline.title,
          chapterNumber: chapNum,
          messagesToSummarize: currentMsgs.slice(-12),
        }),
      });

      if (!resp.ok) return;
      const data = await resp.json();

      const newChap: ChapterSummary = {
        id: `chap-${Date.now()}`,
        chapterNumber: data.chapterNumber,
        title: data.title,
        summaryText: data.summaryText,
        sourceMessageCount: 12,
        startMessageId: currentMsgs[Math.max(0, currentMsgs.length - 12)].id,
        endMessageId: currentMsgs[currentMsgs.length - 1].id,
        createdAt: Date.now(),
      };

      const updatedSummaries = [...activeSession.chapterSummaries, newChap];
      const updatedSess = { ...activeSession, chapterSummaries: updatedSummaries };
      setActiveSession(updatedSess);
      saveSession(updatedSess);
    } catch (err) {
      console.error('Failed auto summarization:', err);
    }
  };

  // --- Regenerate Last AI Response (FR-2.4) ---
  const handleRegenerateLastResponse = async () => {
    if (messages.length < 2 || isLoading) return;

    // Find last user message
    const lastUserIdx = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserIdx === -1) return;

    const actualIdx = messages.length - 1 - lastUserIdx;
    const truncated = messages.slice(0, actualIdx + 1);
    const lastUserMsg = messages[actualIdx];

    setMessages(truncated);
    saveSessionMessages(activeSession!.id, truncated);

    // Call chat endpoint again
    handleSendMessage(lastUserMsg.content, lastUserMsg.isOOC, lastUserMsg.diceRoll);
  };

  // --- Edit User Message (FR-2.5, FR-4.4) ---
  const handleEditMessage = (messageId: string, newContent: string) => {
    if (!activeSession) return;

    const msgIdx = messages.findIndex(m => m.id === messageId);
    if (msgIdx === -1) return;

    // Update message content and slice downstream messages
    const updated = [...messages];
    updated[msgIdx] = { ...updated[msgIdx], content: newContent, timestamp: Date.now() };

    const sliced = updated.slice(0, msgIdx + 1);
    setMessages(sliced);
    saveSessionMessages(activeSession.id, sliced);
    setLastEditTimestamp(Date.now()); // Triggers cache invalidation warning

    // If edited message was from user, generate new AI response
    if (updated[msgIdx].role === 'user') {
      handleSendMessage(newContent, updated[msgIdx].isOOC, updated[msgIdx].diceRoll);
    }
  };

  // --- Delete Message ---
  const handleDeleteMessage = (messageId: string) => {
    if (!activeSession) return;
    const filtered = messages.filter(m => m.id !== messageId);
    setMessages(filtered);
    saveSessionMessages(activeSession.id, filtered);
  };

  // --- Create Branch from Message (FR-2.6) ---
  const handleCreateBranch = (branchName: string, forkMessageId: string) => {
    if (!activeStoryline || !activeSession) return;

    const forkIdx = messages.findIndex(m => m.id === forkMessageId);
    if (forkIdx === -1) return;

    const branchedMessages = messages.slice(0, forkIdx + 1);

    const newSess: ChatSession = {
      ...activeSession,
      id: `session-branch-${Date.now()}`,
      title: `${activeStoryline.title} (${branchName})`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setActiveSession(newSess);
    setMessages(branchedMessages);
    saveSession(newSess);
    setActiveSessionId(newSess.id);
    saveSessionMessages(newSess.id, branchedMessages);

    setSessions(loadSessions());
  };

  // --- Roll Dice (FR-6.1) ---
  const handleRollDice = async (diceType: string, modifier: number, statChecked: string) => {
    try {
      const resp = await fetch('/api/roll-dice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diceType, modifier, statChecked }),
      });
      const data = await resp.json();

      const diceInfo = {
        diceType: data.diceType,
        rollValue: data.rollValue,
        modifier: data.modifier,
        total: data.total,
        statChecked: data.statChecked,
      };

      const actionPrompt = `[PEMAIN MEMUTUSKAN UNTUK MELAKUKAN UJI AKSI DENGAN LEMPARAN DADU ${diceType.toUpperCase()}]: Hasil total: ${data.total} (${data.rollValue} + mod ${data.modifier}).`;
      handleSendMessage(actionPrompt, false, diceInfo);
    } catch (err) {
      console.error('Dice roll error:', err);
    }
  };

  // --- Storyline Management ---
  const handleSaveStoryline = (newStoryline: Storyline) => {
    const updatedList = addOrUpdateStoryline(newStoryline);
    setStorylines(updatedList);
    // Automatically start or switch to this storyline
    handleSelectStoryline(newStoryline, 'Pemain');
  };

  const handleDeleteStorylineCustom = (id: string) => {
    const updated = deleteStoryline(id);
    setStorylines(updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <Navbar
        activeStoryline={activeStoryline}
        activeSession={activeSession}
        readerSettings={readerSettings}
        onUpdateReaderSettings={s => {
          setReaderSettings(s);
          saveReaderSettings(s);
        }}
        onOpenComposer={() => {
          setEditingStoryline(null);
          setIsComposerOpen(true);
        }}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTokenDrawer={() => setIsTokenDrawerOpen(true)}
        onOpenGameSheet={() => setIsGameSheetOpen(true)}
        onOpenChapterManager={() => setIsChapterManagerOpen(true)}
        onOpenBranching={() => setIsBranchingOpen(true)}
        onOpenImportExport={() => setIsImportExportOpen(true)}
      />

      {/* Main Interactive Novel Chat View */}
      {activeStoryline && activeSession ? (
        <ChatView
          storyline={activeStoryline}
          session={activeSession}
          messages={messages}
          readerSettings={readerSettings}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onRegenerateLastResponse={handleRegenerateLastResponse}
          onEditMessage={handleEditMessage}
          onDeleteMessage={handleDeleteMessage}
          onBranchFromMessage={mId => handleCreateBranch('Cabang Baru', mId)}
          onRollDice={handleRollDice}
          onOpenGuidanceModal={() => setIsGuidanceModalOpen(true)}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
          <p className="text-base mb-4">Silakan pilih atau buat storyline untuk mulai membaca & meroleplay.</p>
          <button
            onClick={() => setIsLibraryOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
          >
            Buka Pustaka Storyline
          </button>
        </div>
      )}

      {/* --- Modals & Drawers --- */}

      {/* Story Composer Modal */}
      <StoryComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onSaveStoryline={handleSaveStoryline}
        existingStoryline={editingStoryline}
      />

      {/* Story Library Modal */}
      <StoryLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        storylines={storylines}
        sessions={sessions}
        activeStorylineId={activeStoryline?.id || null}
        activeSessionId={activeSession?.id || null}
        onSelectStoryline={handleSelectStoryline}
        onSelectSession={handleSelectSession}
        onEditStoryline={story => {
          setEditingStoryline(story);
          setIsLibraryOpen(false);
          setIsComposerOpen(true);
        }}
        onDeleteStoryline={handleDeleteStorylineCustom}
        onOpenComposer={() => {
          setEditingStoryline(null);
          setIsLibraryOpen(false);
          setIsComposerOpen(true);
        }}
      />

      {/* Token Transparency Drawer */}
      {activeSession && (
        <TokenSummaryDrawer
          isOpen={isTokenDrawerOpen}
          onClose={() => setIsTokenDrawerOpen(false)}
          tokenStats={tokenStats}
          session={activeSession}
          onUpdateContextLimit={limit => {
            const updated = { ...activeSession, contextLimitTokens: limit };
            setActiveSession(updated);
            saveSession(updated);
          }}
        />
      )}

      {/* Chapter Summary Manager Drawer */}
      {activeStoryline && activeSession && (
        <ChapterSummaryManager
          isOpen={isChapterManagerOpen}
          onClose={() => setIsChapterManagerOpen(false)}
          storyline={activeStoryline}
          session={activeSession}
          messages={messages}
          onTriggerSummarize={() => triggerAutoChapterSummary(messages, activeSession.chapterSummaries.length + 1)}
          onUpdateChapterSummary={(sId, text, title) => {
            const updatedChaps = activeSession.chapterSummaries.map(c =>
              c.id === sId ? { ...c, summaryText: text, title, isEdited: true } : c
            );
            const updated = { ...activeSession, chapterSummaries: updatedChaps };
            setActiveSession(updated);
            saveSession(updated);
          }}
          onCreateArcSummary={(title, text, cIds) => {
            const newArc = {
              id: `arc-${Date.now()}`,
              arcNumber: (activeSession.arcSummaries?.length || 0) + 1,
              title,
              summaryText: text,
              includedChapterIds: cIds,
              createdAt: Date.now(),
            };
            const updated = {
              ...activeSession,
              arcSummaries: [...(activeSession.arcSummaries || []), newArc],
            };
            setActiveSession(updated);
            saveSession(updated);
          }}
        />
      )}

      {/* Game Sheet Drawer */}
      {activeSession && (
        <GameSheetDrawer
          isOpen={isGameSheetOpen}
          onClose={() => setIsGameSheetOpen(false)}
          session={activeSession}
          onUpdateGameSheet={newSheet => {
            const updated = { ...activeSession, gameSheet: newSheet };
            setActiveSession(updated);
            saveSession(updated);
          }}
          onRollDice={handleRollDice}
        />
      )}

      {/* Settings Drawer */}
      {activeSession && (
        <SettingsDrawer
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          session={activeSession}
          readerSettings={readerSettings}
          onUpdateSessionSettings={fields => {
            const updated = { ...activeSession, ...fields };
            setActiveSession(updated);
            saveSession(updated);
          }}
          onUpdateReaderSettings={s => {
            const updated = { ...readerSettings, ...s };
            setReaderSettings(updated);
            saveReaderSettings(updated);
          }}
          onOpenLocalLlmGuide={() => setIsLocalLlmGuideOpen(true)}
        />
      )}

      {/* Timeline Branching Modal */}
      {activeSession && (
        <BranchingModal
          isOpen={isBranchingOpen}
          onClose={() => setIsBranchingOpen(false)}
          session={activeSession}
          messages={messages}
          onCreateBranch={handleCreateBranch}
        />
      )}

      {/* Import / Export Modal */}
      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        activeStoryline={activeStoryline}
        activeSession={activeSession}
        messages={messages}
        onImportStoryline={imported => {
          handleSaveStoryline(imported);
        }}
      />

      {/* Guidance Prompt Modal */}
      {activeSession && (
        <GuidancePromptModal
          isOpen={isGuidanceModalOpen}
          onClose={() => setIsGuidanceModalOpen(false)}
          currentGuidance={activeSession.guidancePrompt || ''}
          onSaveGuidance={g => {
            const updated = { ...activeSession, guidancePrompt: g };
            setActiveSession(updated);
            saveSession(updated);
          }}
        />
      )}

      {/* Local LLM Installation & Configuration Guide Modal */}
      <LocalLlmGuideModal
        isOpen={isLocalLlmGuideOpen}
        onClose={() => setIsLocalLlmGuideOpen(false)}
        onDetectNow={() => setIsSettingsOpen(true)}
      />
    </div>
  );
}
