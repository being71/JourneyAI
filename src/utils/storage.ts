/**
 * Local Storage Persistence Manager for Ledger
 */

import { ChatMessage, ChatSession, Storyline } from '../types';
import { DEFAULT_STORYLINES } from '../data/defaultStorylines';

const STORAGE_KEYS = {
  STORYLINES: 'ledger_storylines_v2',
  SESSIONS: 'ledger_sessions_v1',
  MESSAGES: 'ledger_messages_v1',
  ACTIVE_SESSION_ID: 'ledger_active_session_id_v1',
  READER_SETTINGS: 'ledger_reader_settings_v1',
};

export interface ReaderSettings {
  theme: 'frieren-grimoire' | 'bunga-blue-moon' | 'anime-dark' | 'sakura-pink' | 'dark' | 'sepia' | 'light';
  fontFamily: 'gpt-proto' | 'proto-mono' | 'isekai' | 'cinzel' | 'serif' | 'sans';
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
}

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  theme: 'frieren-grimoire',
  fontFamily: 'gpt-proto',
  fontSize: 'md'
};

// --- Storylines ---
export function loadStorylines(): Storyline[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STORYLINES);
    if (!raw) {
      saveStorylines(DEFAULT_STORYLINES);
      return DEFAULT_STORYLINES;
    }
    const parsed: Storyline[] = JSON.parse(raw);
    if (!parsed || parsed.length === 0) {
      saveStorylines(DEFAULT_STORYLINES);
      return DEFAULT_STORYLINES;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load storylines:', err);
    return DEFAULT_STORYLINES;
  }
}

export function saveStorylines(storylines: Storyline[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STORYLINES, JSON.stringify(storylines));
  } catch (err) {
    console.error('Failed to save storylines:', err);
  }
}

export function addOrUpdateStoryline(storyline: Storyline): Storyline[] {
  const current = loadStorylines();
  const existingIdx = current.findIndex(s => s.id === storyline.id);
  let updated: Storyline[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = storyline;
  } else {
    updated = [storyline, ...current];
  }
  saveStorylines(updated);
  return updated;
}

export function deleteStoryline(id: string): Storyline[] {
  const current = loadStorylines();
  const updated = current.filter(s => s.id !== id);
  saveStorylines(updated);
  return updated;
}

// --- Chat Sessions ---
export function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load sessions:', err);
    return [];
  }
}

export function saveSessions(sessions: ChatSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (err) {
    console.error('Failed to save sessions:', err);
  }
}

export function saveSession(session: ChatSession): ChatSession[] {
  const sessions = loadSessions();
  const idx = sessions.findIndex(s => s.id === session.id);
  let updated: ChatSession[];
  if (idx >= 0) {
    updated = [...sessions];
    updated[idx] = session;
  } else {
    updated = [session, ...sessions];
  }
  saveSessions(updated);
  return updated;
}

export function deleteSession(sessionId: string): ChatSession[] {
  const sessions = loadSessions().filter(s => s.id !== sessionId);
  saveSessions(sessions);
  // Also clean up messages for this session
  const allMessages = loadAllMessages();
  const filteredMessages = allMessages.filter(m => m.sessionId !== sessionId);
  saveAllMessages(filteredMessages);
  return sessions;
}

// --- Active Session ---
export function getActiveSessionId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION_ID);
}

export function setActiveSessionId(id: string | null): void {
  if (id) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION_ID, id);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION_ID);
  }
}

// --- Messages ---
export function loadAllMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load messages:', err);
    return [];
  }
}

export function saveAllMessages(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  } catch (err) {
    console.error('Failed to save messages:', err);
  }
}

export function getSessionMessages(sessionId: string): ChatMessage[] {
  const all = loadAllMessages();
  return all.filter(m => m.sessionId === sessionId).sort((a, b) => a.timestamp - b.timestamp);
}

export function saveSessionMessages(sessionId: string, newSessionMessages: ChatMessage[]): void {
  const all = loadAllMessages();
  const otherMessages = all.filter(m => m.sessionId !== sessionId);
  saveAllMessages([...otherMessages, ...newSessionMessages]);
}

// --- Reader Settings ---
export function loadReaderSettings(): ReaderSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.READER_SETTINGS);
    if (!raw) return DEFAULT_READER_SETTINGS;
    return { ...DEFAULT_READER_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    return DEFAULT_READER_SETTINGS;
  }
}

export function saveReaderSettings(settings: ReaderSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.READER_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save reader settings:', err);
  }
}
