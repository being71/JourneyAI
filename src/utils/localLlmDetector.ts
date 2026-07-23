/**
 * Local LLM Detector and Direct Client Query Utility
 * Supports Ollama, LM Studio, LocalAI, Jan.ai, KoboldCPP, and OpenAI-compatible endpoints
 */

export interface DetectedLocalModel {
  id: string;
  name: string;
  provider: 'ollama' | 'lmstudio' | 'openai-compatible' | 'koboldcpp';
  endpoint: string;
  size?: string;
  status: 'active' | 'offline';
  details?: string;
}

const DEFAULT_ENDPOINTS = [
  { url: 'http://localhost:11434', provider: 'ollama' as const },
  { url: 'http://127.0.0.1:11434', provider: 'ollama' as const },
  { url: 'http://localhost:1234', provider: 'lmstudio' as const },
  { url: 'http://127.0.0.1:1234', provider: 'lmstudio' as const },
  { url: 'http://localhost:8080', provider: 'openai-compatible' as const },
  { url: 'http://localhost:1337', provider: 'openai-compatible' as const },
  { url: 'http://localhost:5001', provider: 'koboldcpp' as const },
];

/**
 * Scans local machine ports for active Local LLM servers
 */
export async function detectLocalLlms(customUrls: string[] = []): Promise<DetectedLocalModel[]> {
  const discoveredModels: DetectedLocalModel[] = [];

  const candidateUrls = Array.from(
    new Set([
      ...DEFAULT_ENDPOINTS.map(e => e.url),
      ...customUrls.filter(Boolean),
    ])
  );

  const fetchWithTimeout = async (url: string, timeoutMs = 2500) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  for (const baseUrl of candidateUrls) {
    const cleanUrl = baseUrl.replace(/\/$/, '');

    // 1. Try Ollama Native Tags API
    try {
      const res = await fetchWithTimeout(`${cleanUrl}/api/tags`, 2000);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.models)) {
          for (const m of data.models) {
            const sizeGb = m.size ? `${(m.size / (1024 * 1024 * 1024)).toFixed(1)} GB` : undefined;
            discoveredModels.push({
              id: `ollama:${m.name}`,
              name: m.name,
              provider: 'ollama',
              endpoint: cleanUrl,
              size: sizeGb,
              status: 'active',
              details: `Ollama (${m.details?.parameter_size || 'Local Model'})`,
            });
          }
          continue; // Ollama detected successfully for this port
        }
      }
    } catch {
      // Not Ollama native or unreachable
    }

    // 2. Try OpenAI-Compatible /v1/models (LM Studio, Ollama OpenAI, Jan, LocalAI)
    try {
      const res = await fetchWithTimeout(`${cleanUrl}/v1/models`, 2000);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.data)) {
          const providerType = cleanUrl.includes('1234') ? 'lmstudio' : 'openai-compatible';
          for (const m of data.data) {
            const modelId = m.id || m.name || 'local-model';
            discoveredModels.push({
              id: `${providerType}:${modelId}`,
              name: modelId,
              provider: providerType,
              endpoint: `${cleanUrl}/v1`,
              status: 'active',
              details: providerType === 'lmstudio' ? 'LM Studio Local Server' : 'OpenAI-Compatible Local API',
            });
          }
          continue;
        }
      }
    } catch {
      // Not OpenAI compatible or unreachable
    }

    // 3. Try KoboldCPP API
    try {
      const res = await fetchWithTimeout(`${cleanUrl}/api/v1/model`, 2000);
      if (res.ok) {
        const data = await res.json();
        if (data && data.result) {
          discoveredModels.push({
            id: `kobold:${data.result}`,
            name: data.result,
            provider: 'koboldcpp',
            endpoint: cleanUrl,
            status: 'active',
            details: 'KoboldCPP Local Server',
          });
        }
      }
    } catch {
      // Not KoboldCPP
    }
  }

  return discoveredModels;
}

/**
 * Direct Client-side LLM Fetch for Local LLM
 * Used as fallback or direct fetch from user's browser to localhost
 */
export async function queryLocalLlmDirectly(options: {
  endpoint: string;
  provider: 'ollama' | 'lmstudio' | 'openai-compatible' | 'koboldcpp';
  modelName: string;
  systemInstruction: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
}): Promise<string> {
  const { endpoint, provider, modelName, systemInstruction, messages, temperature = 0.7 } = options;
  const cleanEndpoint = endpoint.replace(/\/$/, '');

  // 1. Ollama Native API format
  if (provider === 'ollama' && !cleanEndpoint.endsWith('/v1')) {
    const ollamaMessages = [
      { role: 'system', content: systemInstruction },
      ...messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    ];

    const res = await fetch(`${cleanEndpoint}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelName,
        messages: ollamaMessages,
        stream: false,
        options: { temperature },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Ollama Error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data.message?.content || 'Model lokal tidak mengembalikan jawaban.';
  }

  // 2. OpenAI-Compatible format (LM Studio, Ollama /v1, LocalAI)
  const openAiEndpoint = cleanEndpoint.endsWith('/v1')
    ? `${cleanEndpoint}/chat/completions`
    : `${cleanEndpoint}/v1/chat/completions`;

  const apiMessages = [
    { role: 'system', content: systemInstruction },
    ...messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })),
  ];

  const res = await fetch(openAiEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: modelName,
      messages: apiMessages,
      temperature,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Local LLM Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'Model lokal tidak mengembalikan jawaban.';
}
