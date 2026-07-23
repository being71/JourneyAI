import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini AI instance
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set in environment variables.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Resilient Gemini Generator with automatic model fallback for 429 Rate Limit / Quota Exceeded
async function generateGeminiWithFallback(params: {
  model: string;
  contents: any;
  config?: any;
}) {
  const ai = getGenAI();
  const primaryModel = params.model || 'gemini-2.5-flash';

  const candidateModels = Array.from(
    new Set([
      primaryModel,
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-2.5-pro',
    ])
  );

  let lastError: any = null;

  for (const modelCandidate of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelCandidate,
        contents: params.contents,
        config: params.config,
      });
      if (response && response.text) {
        return { response, modelUsed: modelCandidate };
      }
    } catch (err: any) {
      lastError = err;
      const errStr = String(err?.message || err);
      const isQuotaOrRateLimit =
        errStr.includes('429') ||
        errStr.includes('RESOURCE_EXHAUSTED') ||
        errStr.includes('quota') ||
        errStr.includes('limit') ||
        errStr.includes('not found');

      if (isQuotaOrRateLimit) {
        console.warn(`[Gemini Fallback] Model '${modelCandidate}' hit quota/rate limit or model unavailable, trying next candidate...`);
        await new Promise((r) => setTimeout(r, 1000));
      } else {
        console.warn(`[Gemini Fallback] Model '${modelCandidate}' error:`, errStr);
      }
    }
  }

  throw lastError;
}

// API Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Server-side Dice Roller (FR-6.1)
app.post('/api/roll-dice', (req, res) => {
  const { diceType = 'd20', modifier = 0, statChecked = 'General' } = req.body;
  const sidesMap: Record<string, number> = {
    d4: 4,
    d6: 6,
    d8: 8,
    d10: 10,
    d12: 12,
    d20: 20,
    d100: 100,
  };
  const sides = sidesMap[diceType] || 20;
  const rawRoll = Math.floor(Math.random() * sides) + 1;
  const total = rawRoll + Number(modifier);

  res.json({
    diceType,
    rollValue: rawRoll,
    modifier: Number(modifier),
    total,
    statChecked,
    isNatural20: diceType === 'd20' && rawRoll === 20,
    isNatural1: diceType === 'd20' && rawRoll === 1,
  });
});

// Chat Engine Endpoint (FR-2.1, FR-2.3, FR-2.7, FR-3.1, FR-3.2, FR-3.3)
app.post('/api/chat', async (req, res) => {
  try {
    const {
      storyline,
      session,
      messages = [],
      userPrompt = '',
      isOOC = false,
      diceResult = null,
    } = req.body;

    if (!storyline || !session) {
      return res.status(400).json({ error: 'Missing storyline or session payload' });
    }

    const playerName = session.playerName || 'Pemain';
    const replaceUserTag = (str: string) => (str || '').replace(/\{\{user\}\}/gi, playerName);

    // Map temperature based on Creativity level
    let temperature = 0.7;
    if (session.creativity === 'Hati-hati') temperature = 0.3;
    if (session.creativity === 'Liar') temperature = 1.1;

    // Response length guideline
    let lengthGuideline = 'Targetkan panjang balasan sekitar 250-400 kata dengan deskripsi atmosferik dan dialog tajam.';
    if (session.responseLength === 'Pendek') {
      lengthGuideline = 'Targetkan balasan singkat & padat (~100-150 kata). Alur bergerak cepat.';
    } else if (session.responseLength === 'Panjang') {
      lengthGuideline = 'Targetkan prose novel ekspansif & kaya (~500-700+ kata), gambarkan detail emosi, panca indra, serta suasana lingkungan secara mendalam.';
    }

    // Prompt mode guideline
    let modeInstruction = '';
    if (session.promptMode === 'Roleplay Terstruktur (V2)') {
      modeInstruction = `MODE ROLEPLAY TERSTRUKTUR:
1. Patuhi persona NPC dengan sangat ketat dan konsisten.
2. Setiap kali aksi berisiko dilakukan, sebutkan perubahan situasi atau konsekuensi logis secara lugas.
3. Jaga jarak narasi: hanya narasikan reaksi lingkungan dan NPC. JANGAN PERNAH membuat keputusan atau kata-kata untuk ${playerName}.`;
    } else {
      modeInstruction = `MODE NARATIF BEBAS:
1. Narasikan cerita seperti novel interaktif yang mengalir imersif.
2. Berikan kebebasan eksplorasi penuh pada ${playerName}.
3. Reaksi NPC harus terasa hidup dan manusiawi. JANGAN PERNAH menuliskan dialog atau tindakan untuk ${playerName}.`;
    }

    // Build Character reference string with standalone entity details (FR-1.6, FR-1.7, FR-1.8, FR-1.9)
    const charactersList = (storyline.characters || [])
      .map((c: any) => {
        const desc = c.aiDescription || c.description || c.publicDescription || '';
        const tagsStr = c.tags && c.tags.length > 0 ? ` [Sifat: ${c.tags.join(', ')}]` : '';
        const ageRace = [c.age, c.raceOrSpecies, c.occupation].filter(Boolean).join(' | ');
        const details = [
          ageRace ? `(${ageRace})` : '',
          desc ? `Deskripsi/Rahasia: ${desc}` : '',
          c.personality ? `Kepribadian: ${c.personality}` : '',
          c.speakingStyle ? `Gaya Bicara: ${c.speakingStyle}` : '',
          c.likes ? `Suka: ${c.likes}` : '',
          c.dislikes ? `Benci: ${c.dislikes}` : '',
          c.fears ? `Takut: ${c.fears}` : '',
          c.reminder ? `⚠️ Aturan Trait Karakter: ${c.reminder}` : '',
        ].filter(Boolean).join(' | ');

        return `- ${c.name} (${c.role})${tagsStr}: ${details}`;
      })
      .join('\n');

    // Build Chapter & Arc Summary memory block (FR-5.1, FR-5.2)
    let memoryContext = '';
    if (session.arcSummaries && session.arcSummaries.length > 0) {
      memoryContext += '--- RINGKASAN ARC CERITA (MEMORI SANGAT JANGKA PANJANG) ---\n';
      session.arcSummaries.forEach((arc: any) => {
        memoryContext += `[Arc ${arc.arcNumber}: ${arc.title}]\n${arc.summaryText}\n\n`;
      });
    }

    if (session.chapterSummaries && session.chapterSummaries.length > 0) {
      memoryContext += '--- RINGKASAN BAB CERITA SEBELUMNYA (MEMORI JANGKA PANJANG) ---\n';
      session.chapterSummaries.forEach((chap: any) => {
        memoryContext += `[Bab ${chap.chapterNumber}: ${chap.title}]\n${chap.summaryText}\n\n`;
      });
    }

    // Game Sheet / RPG Status Context
    let gameSheetContext = '';
    if (session.gameSheet?.enabled) {
      const statsStr = (session.gameSheet.stats || []).map((s: any) => `${s.key}: ${s.value}${s.max ? `/${s.max}` : ''}`).join(', ');
      const invStr = (session.gameSheet.inventory || []).map((i: any) => `${i.name} (x${i.quantity})`).join(', ');
      gameSheetContext = `\n--- STATUS KARAKTER & ITEM (${session.gameSheet.characterName || playerName}) ---\nStatistik: ${statsStr || 'Tidak ada'}\nInventori: ${invStr || 'Kosong'}\nStatus Efek: ${(session.gameSheet.statusEffects || []).join(', ') || 'Normal'}\n`;
    }

    // Assemble System Instruction
    const systemInstruction = `Kamu adalah Mesin Narasi & Game Master AI untuk Novel Interaktif "Ledger".

JUDUL CERITA: ${replaceUserTag(storyline.title)}
RATING: ${storyline.ratingTag || '13+'}

DESKRIPSI PLOT & DUNIA:
${replaceUserTag(storyline.plotAI || storyline.plotUser)}

${storyline.guideline ? `PANDUAN GAYA PENULISAN:\n${replaceUserTag(storyline.guideline)}\n` : ''}
${charactersList ? `DAFTAR KARAKTER NPC:\n${charactersList}\n` : ''}
${gameSheetContext}
${memoryContext}

ATURAN KRITIS (PERINGATAN AI REMINDER SEPANJANG WAKTU):
1. ${replaceUserTag(storyline.aiReminder || 'Jaga konsistensi cerita dan reaksi NPC.')}
2. KARAKTER PEMAIN ADALAH "${playerName}". JANGAN PERNAH MENULISKAN DIALOG, TINDAKAN, ATAU PIKIRAN UNTUK ${playerName}.
3. Hanya tuliskan tanggapan lingkungan, narasi adegan, dan dialog/tindakan NPC.
4. ${lengthGuideline}
5. ${modeInstruction}
6. OPSI PILIH TAKDIR: Di bagian paling akhir balasanmu (kecuali mode OOC), tuliskan header "\n\n**PILIH TAKDIR:**\n" diikuti tepat 3 baris opsi aksi bertanda angka (misal: "1. Aku berjalan mendekati...", "2. Sambil mengamati sekeliling, aku...", "3. "Bagaimana menurutmu...", tanyaku..."). JANGAN menyisipkan kata 'PILIH TAKDIR:' atau 'OPSI TAKDIR:' di dalam teks nomor opsi tersebut.

${session.guidancePrompt ? `PETUNJUK KUSTOM DARI PEMAIN: "${replaceUserTag(session.guidancePrompt)}"` : ''}`;

    // Handling OOC (Out Of Character)
    let finalUserPrompt = replaceUserTag(userPrompt);
    if (isOOC) {
      finalUserPrompt = `[OOC - OUT OF CHARACTER QUERY FROM PLAYER]: ${finalUserPrompt}\n(Instruksi khusus AI: Pengguna mengirim pesan Out-Of-Character. Jawablah langsung sebagai AI Asisten / Game Master di luar narasi cerita. Jelaskan fakta cerita, status hubungan NPC, atau mekanisme cerita tanpa menuliskan narasi novel atau memajukan alur waktu cerita.)`;
    } else if (diceResult) {
      finalUserPrompt = `[AKSI PEMAIN DENGAN LEMPARAN DADU ${diceResult.diceType.toUpperCase()}]: ${finalUserPrompt}\nHasil Dadu: ${diceResult.rollValue} + Modifier ${diceResult.modifier} = TOTAL ${diceResult.total} (Uji Stat: ${diceResult.statChecked}).\nNarasikan hasil aksi ini sesuai skor lemparan dadu tersebut secara dramatis.`;
    }

    // Build chat history array for Gemini API
    // Filter messages after the latest chapter summary or recent window
    const recentMessages = (messages || []).slice(-16);
    const contents: any[] = [];

    for (const msg of recentMessages) {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      let contentText = replaceUserTag(msg.content);
      if (msg.isOOC) {
        contentText = `[OOC]: ${contentText}`;
      }
      contents.push({
        role,
        parts: [{ text: contentText }],
      });
    }

    // Append current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: finalUserPrompt }],
    });

    const modelName = session.selectedModel || 'gemini-3.6-flash';

    let replyText = '';
    let inputTokens = 0;
    let outputTokens = 0;

    // Handle Local LLM Requests (Ollama / LM Studio / OpenAI-Compatible)
    if (session.isLocalLlm || modelName.startsWith('local:')) {
      const localEndpoint = (session.localLlmEndpoint || 'http://localhost:11434').replace(/\/$/, '');
      const localModel = session.localLlmModelName || modelName.replace(/^local:/, '') || 'llama3.2';
      const provider = session.localLlmProvider || 'ollama';

      let handledLocal = false;

      try {
        if (provider === 'ollama' && !localEndpoint.endsWith('/v1')) {
          const ollamaMessages = [
            { role: 'system', content: systemInstruction },
            ...contents.map(c => ({
              role: c.role === 'model' ? 'assistant' : 'user',
              content: c.parts?.[0]?.text || '',
            })),
          ];

          const numCtx = session.localLlmNumCtx || 4096;

          const resLocal = await fetch(`${localEndpoint}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: localModel,
              messages: ollamaMessages,
              stream: false,
              options: {
                temperature,
                num_ctx: numCtx,
                num_gpu: 99, // Offload layers to GPU
              },
            }),
          });

          if (resLocal.ok) {
            const dataLocal = await resLocal.json();
            replyText = dataLocal.message?.content || '';
            if (replyText) handledLocal = true;
          }
        } else {
          const openAiUrl = localEndpoint.endsWith('/v1')
            ? `${localEndpoint}/chat/completions`
            : `${localEndpoint}/v1/chat/completions`;

          const apiMessages = [
            { role: 'system', content: systemInstruction },
            ...contents.map(c => ({
              role: c.role === 'model' ? 'assistant' : 'user',
              content: c.parts?.[0]?.text || '',
            })),
          ];

          const resLocal = await fetch(openAiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: localModel,
              messages: apiMessages,
              temperature,
            }),
          });

          if (resLocal.ok) {
            const dataLocal = await resLocal.json();
            replyText = dataLocal.choices?.[0]?.message?.content || '';
            if (replyText) handledLocal = true;
          }
        }
      } catch (err: any) {
        console.warn(`[Local LLM] Server-side fetch to ${localEndpoint} failed:`, err.message);
      }

      if (handledLocal) {
        inputTokens = Math.ceil((systemInstruction.length + JSON.stringify(contents).length) / 4);
        outputTokens = Math.ceil(replyText.length / 4);
        return res.json({
          text: replyText,
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
          modelUsed: `Local LLM (${localModel})`,
          isLocalLlm: true,
        });
      }

      // If server-side fetch failed, instruct client to fetch directly from browser
      return res.json({
        fallbackToClient: true,
        localEndpoint,
        localModel,
        provider,
        systemInstruction,
        messagesFormatted: contents.map(c => ({
          role: c.role === 'model' ? 'assistant' : 'user',
          content: c.parts?.[0]?.text || '',
        })),
        temperature,
      });
    }

    if (modelName === 'sao10k/llama-3.1-8b-stheno-v3.4') {
      const apiKey = process.env.OPENROUTER_API_KEY || process.env.HF_TOKEN;
      let handledExternally = false;

      if (apiKey) {
        try {
          const isOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);
          const endpoint = isOpenRouter
            ? 'https://openrouter.ai/api/v1/chat/completions'
            : 'https://router.huggingface.co/v1/chat/completions';

          const externalModel = isOpenRouter
            ? 'sao10k/l3-stheno-8b'
            : 'sao10k/llama-3.1-8b-stheno-v3.4';

          const hfMessages = [
            { role: 'system', content: systemInstruction },
            ...contents.map(c => ({
              role: c.role === 'model' ? 'assistant' : c.role,
              content: c.parts?.[0]?.text || '',
            })),
          ];

          const hfRes = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: externalModel,
              messages: hfMessages,
              temperature,
              max_tokens: session.responseLength === 'Pendek' ? 300 : session.responseLength === 'Panjang' ? 1200 : 750,
            }),
          });

          if (hfRes.ok) {
            const hfData = await hfRes.json();
            replyText = hfData.choices?.[0]?.message?.content || '';
            if (replyText) {
              handledExternally = true;
              inputTokens = hfData.usage?.prompt_tokens || Math.ceil((systemInstruction.length + JSON.stringify(contents).length) / 4);
              outputTokens = hfData.usage?.completion_tokens || Math.ceil(replyText.length / 4);
            }
          } else {
            console.log('[Info] External model endpoint unavailable, activating Gemini Stheno emulation mode.');
          }
        } catch (err) {
          console.log('[Info] Failed calling external model endpoint, activating Gemini Stheno emulation mode.');
        }
      }

      // Fallback to Gemini with Sao10K Stheno-v3.4 Roleplay Emulation system prompt
      if (!handledExternally) {
        const sthenoEmulationPrompt = `${systemInstruction}\n\n[DIRECTIVE KHUSUS GAYA MODEL SAO10K STHENO-V3.4]:
Emulasikan karakter gaya penulisan model Llama 3.1 8B Stheno-v3.4 karya Sao10K: narasi roleplay sangat emosional, estetika tinggi, sensori kaya, interaksi NPC realistis dan penuh kepribadian unik, serta kebebasan eksplorasi tanpa batas.`;

        const { response, modelUsed } = await generateGeminiWithFallback({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            systemInstruction: sthenoEmulationPrompt,
            temperature,
          },
        });

        replyText = response.text || 'Maaf, narasi tidak dapat dihasilkan.';
        const usage = response.usageMetadata || {};
        inputTokens = usage.promptTokenCount || Math.ceil((sthenoEmulationPrompt.length + JSON.stringify(contents).length) / 4);
        outputTokens = usage.candidatesTokenCount || Math.ceil(replyText.length / 4);
      }
    } else {
      const { response, modelUsed } = await generateGeminiWithFallback({
        model: modelName,
        contents,
        config: {
          systemInstruction,
          temperature,
        },
      });

      replyText = response.text || 'Maaf, narasi tidak dapat dihasilkan. Silakan coba lagi.';
      const usage = response.usageMetadata || {};
      inputTokens = usage.promptTokenCount || Math.ceil((systemInstruction.length + JSON.stringify(contents).length) / 4);
      outputTokens = usage.candidatesTokenCount || Math.ceil(replyText.length / 4);
    }

    res.json({
      text: replyText,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      modelUsed: modelName,
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    const errStr = String(error?.message || error);
    if (errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('quota')) {
      return res.status(200).json({
        text: '⚠️ Kuota API Gemini saat ini sedang penuh (Rate Limit). Mohon tunggu sekitar 10-15 detik lalu klik kirim ulang.',
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        modelUsed: 'rate-limit-notice',
      });
    }
    res.status(500).json({
      error: error.message || 'Gagal menghasilkan percakapan AI.',
    });
  }
});

// Summarization Endpoint (FR-5.1 - Tiered Chapter Summaries)
app.post('/api/summarize', async (req, res) => {
  try {
    const { storylineTitle, chapterNumber, messagesToSummarize } = req.body;

    if (!messagesToSummarize || messagesToSummarize.length === 0) {
      return res.status(400).json({ error: 'No messages provided to summarize' });
    }

    const conversationText = messagesToSummarize
      .map((m: any) => `${m.role === 'user' ? 'PEMAIN' : 'NARATOR/NPC'}: ${m.content}`)
      .join('\n\n');

    const prompt = `Kamu adalah Editor Ringkasan Cerita untuk Novel Interaktif "${storylineTitle || 'Ledger'}".
Tugasmu adalah membuat ringkasan bab yang padat & akurat dari percakapan berikut ini (Bab ${chapterNumber || 1}).

PERSYARATAN RINGKASAN:
1. Ringkas poin-poin utama perkembangan alur, lokasi saat ini, keputusan penting yang diambil pemain, dan perubahan hubungan/status NPC.
2. Jika ada item yang didapatkan/hilang atau luka/status karakter, sebutkan secara jelas.
3. Buat ringkasan dalam 150-250 kata dalam Bahasa Indonesia.
4. Buat Judul Bab yang singkat & menarik di baris pertama (format: "Judul: [Judul Bab]").

PERCAKAPAN LENGKAP BAB INI:
${conversationText}`;

    const { response } = await generateGeminiWithFallback({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.4,
      },
    });

    const fullText = response.text || '';
    let title = `Bab ${chapterNumber}: Perkembangan Alur`;
    let summaryText = fullText;

    const titleMatch = fullText.match(/^Judul:\s*(.+)$/m);
    if (titleMatch) {
      title = titleMatch[1].trim();
      summaryText = fullText.replace(/^Judul:\s*.+$/m, '').trim();
    }

    res.json({
      chapterNumber: chapterNumber || 1,
      title,
      summaryText,
    });
  } catch (error: any) {
    console.error('Error in /api/summarize:', error);
    const errStr = String(error?.message || error);
    if (errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('quota')) {
      return res.json({
        chapterNumber: req.body.chapterNumber || 1,
        title: `Bab ${req.body.chapterNumber || 1}: Ringkasan Sementara`,
        summaryText: 'Ringkasan bab belum dapat dibuat saat ini karena kuota API sementara terlampaui. Silakan coba lagi beberapa saat.',
      });
    }
    res.status(500).json({ error: error.message || 'Gagal membuat ringkasan bab.' });
  }
});

// Setup Vite / Static Server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Ledger App] Server running at http://localhost:${PORT}`);
  });
}

startServer();
