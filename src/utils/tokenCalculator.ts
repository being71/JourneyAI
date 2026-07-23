/**
 * Token Calculator & Cost Estimator Utility
 */

import { ModelProvider, TokenStats } from '../types';

// Rough token estimator: ~4 characters per token in English/Indonesian
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  const cleanText = text.trim();
  // Standard approximation: word count * 1.33 or length / 4
  const words = cleanText.split(/\s+/).length;
  const chars = cleanText.length;
  return Math.ceil(Math.max(words * 1.35, chars / 3.8));
}

export function calculateEstimatedCost(inputTokens: number, outputTokens: number, model: ModelProvider): number {
  // Estimated pricing per million tokens
  let inputRate = 0.075 / 1000000; // $0.075 / 1M for Gemini 3.6 Flash
  let outputRate = 0.30 / 1000000; // $0.30 / 1M for Gemini 3.6 Flash

  if (model === 'gemini-3.1-pro-preview') {
    inputRate = 1.25 / 1000000;
    outputRate = 5.00 / 1000000;
  } else if (model === 'gemini-3.1-flash-lite') {
    inputRate = 0.0375 / 1000000;
    outputRate = 0.15 / 1000000;
  } else if (model === 'sao10k/llama-3.1-8b-stheno-v3.4') {
    inputRate = 0.06 / 1000000;
    outputRate = 0.06 / 1000000;
  }

  return (inputTokens * inputRate) + (outputTokens * outputRate);
}

export function formatTokenDisplay(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(2)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}k`;
  }
  return tokens.toString();
}

export function buildPromptCacheStatus(
  inputTokens: number,
  lastEditTimestamp?: number
): { isCacheActive: boolean; cachedTokens: number; message: string; savingsPercent: number } {
  // If input payload is > 1000 tokens, Gemini prompt caching can trigger
  const eligibleForCache = inputTokens >= 1024;
  
  if (!eligibleForCache) {
    return {
      isCacheActive: false,
      cachedTokens: 0,
      message: 'Konteks < 1024 token (Belum memenuhi ambang Caching)',
      savingsPercent: 0
    };
  }

  // Cache is active if last edit wasn't in the past 1 minute
  const now = Date.now();
  const timeSinceEdit = lastEditTimestamp ? now - lastEditTimestamp : 600000;
  
  if (timeSinceEdit < 10000) {
    return {
      isCacheActive: false,
      cachedTokens: 0,
      message: 'Cache Diperbarui (Dibatalkan karena editan pesan terbaru)',
      savingsPercent: 0
    };
  }

  // Approx 75% of static prefix tokens cached
  const cachedTokens = Math.floor(inputTokens * 0.75);
  const savingsPercent = Math.round((cachedTokens / inputTokens) * 100);

  return {
    isCacheActive: true,
    cachedTokens,
    message: `Prompt Cache Aktif (${savingsPercent}% Hemat Token)`,
    savingsPercent
  };
}
