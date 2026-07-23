/**
 * Ledger - Interactive AI Novel Chat Engine
 * TypeScript Data Definitions
 */

export type RatingTag = 'Semua Umur' | '13+' | '18+' | 'Dark Fantasy';

export type ResponseLength = 'Pendek' | 'Sedang' | 'Panjang';

export type CreativityLevel = 'Hati-hati' | 'Seimbang' | 'Liar'; // 0.3, 0.7, 1.1

export type PromptMode = 'Naratif Bebas (V1)' | 'Roleplay Terstruktur (V2)';

export type ModelProvider =
  | 'gemini-3.6-flash'
  | 'gemini-3.1-pro-preview'
  | 'gemini-3.1-flash-lite'
  | 'sao10k/llama-3.1-8b-stheno-v3.4'
  | string;

export interface CharacterProfile {
  id: string;
  name: string;
  role: string; // e.g. 'NPC Utama', 'Antagonis', 'Pendamping'
  age?: string;
  raceOrSpecies?: string;
  occupation?: string;
  description: string; // Fallback or general description
  publicDescription?: string; // Player-facing description (FR-1.7)
  aiDescription?: string; // Secret AI-facing description (e.g. hidden motives) (FR-1.7)
  isAiDescriptionDifferent?: boolean;
  personality?: string;
  speakingStyle?: string;
  likes?: string;
  dislikes?: string;
  fears?: string;
  hobbies?: string;
  backstory?: string;
  reminder?: string; // Character trait reminder (FR-1.8)
  tags?: string[]; // Trait tags e.g. Tsundere, Extrovert (FR-1.9)
  avatarIcon?: string;
}

export interface StatItem {
  id: string;
  key: string; // e.g. 'HP', 'Mana', 'Reputasi', 'Koin Emas'
  value: number | string;
  max?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
}

export interface GameSheet {
  enabled: boolean;
  characterName: string;
  stats: StatItem[];
  inventory: InventoryItem[];
  statusEffects: string[];
}

export interface Storyline {
  id: string;
  title: string;
  summary: string; // User-facing summary
  plotUser: string; // Basic plot shown to player
  plotAI: string; // Full AI prompt plot & world rules
  guideline?: string; // Writing style guideline
  openingMessage: string; // Default first message
  alternativeOpenings?: string[]; // Alternative Start scenarios (FR-1.5)
  aiReminder?: string; // Injected into every AI prompt (FR-1.4)
  ratingTag: RatingTag;
  tags?: string[]; // Genre/Theme tags (FR-1.9)
  characters: CharacterProfile[];
  recommendedPersonaCharacterId?: string; // Player persona recommendation (FR-1.10)
  gameSheet?: GameSheet;
  isCustom?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ChapterSummary {
  id: string;
  chapterNumber: number;
  title: string;
  summaryText: string;
  sourceMessageCount: number;
  startMessageId: string;
  endMessageId: string;
  createdAt: number;
  isEdited?: boolean;
}

export interface ArcSummary {
  id: string;
  arcNumber: number;
  title: string;
  summaryText: string;
  includedChapterIds: string[];
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  parentMessageId?: string | null; // For branching
  role: 'user' | 'assistant' | 'system';
  content: string;
  isOOC?: boolean; // Out Of Character message
  diceRoll?: {
    diceType: string; // e.g. 'd20'
    rollValue: number;
    modifier: number;
    total: number;
    statChecked?: string;
    description?: string;
  };
  timestamp: number;
  tokenCount?: number;
  isRegenerated?: boolean;
}

export interface StoryBranch {
  id: string;
  name: string;
  parentBranchId?: string;
  forkMessageId: string; // The message ID where this branch diverged
  createdAt: number;
}

export interface ChatSession {
  id: string;
  storylineId: string;
  title: string;
  playerName: string; // {{user}} replacement name
  activeBranchId: string;
  guidancePrompt?: string; // Player custom steering instruction (FR-2.8)
  
  // Settings per session
  creativity: CreativityLevel; // 'Hati-hati' | 'Seimbang' | 'Liar'
  responseLength: ResponseLength; // 'Pendek' | 'Sedang' | 'Panjang'
  promptMode: PromptMode;
  selectedModel: ModelProvider;
  contextLimitTokens: number; // Override limit, e.g., 16000
  
  // Local LLM Config
  isLocalLlm?: boolean;
  localLlmEndpoint?: string; // e.g. 'http://localhost:11434' or 'http://localhost:1234/v1'
  localLlmProvider?: 'ollama' | 'lmstudio' | 'openai-compatible' | 'koboldcpp';
  localLlmModelName?: string;
  localLlmVramPreset?: '8gb' | '4gb' | '16gb' | 'custom';
  localLlmNumCtx?: number; // Context window for 8GB VRAM optimization (default 4096)
  
  // Game Sheet state
  gameSheet?: GameSheet;
  
  // Summaries
  chapterSummaries: ChapterSummary[];
  arcSummaries: ArcSummary[];
  
  createdAt: number;
  updatedAt: number;
}

export interface TokenStats {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cachedTokens: number;
  isCacheActive: boolean;
  cacheExpiresAt?: number; // timestamp
  cacheInvalidatedReason?: string;
  estimatedCostUsd: number;
}

export interface ChatGenerationOptions {
  storyline: Storyline;
  session: ChatSession;
  messages: ChatMessage[];
  userPrompt: string;
  isOOC?: boolean;
  diceResult?: ChatMessage['diceRoll'];
}
