const { getStore } = require('../store');

const POLISH_PROMPT = `你是一個文字編輯助手。請將以下語音轉錄的文字潤飾為自然、專業的書面文字。

規則：
1. 移除口語贅詞（嗯、呃、那個、就是、然後、對、這個）
2. 修正文法和語序
3. 加入適當的標點符號
4. 保持原意不變，不要添加新內容
5. 如果原文是中文，輸出繁體中文
6. 只輸出潤飾後的文字，不要加任何說明

語音轉錄原文：`;

// 使用 OpenAI GPT 潤飾文字
async function polishWithOpenAI(rawText) {
  const store = getStore();
  const apiKey = store.get('openaiApiKey');
  if (!apiKey) throw new Error('未設定 OpenAI API Key');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: POLISH_PROMPT },
        { role: 'user', content: rawText },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI LLM 錯誤 (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

// 使用 Groq LLM 潤飾文字
async function polishWithGroq(rawText) {
  const store = getStore();
  const apiKey = store.get('groqApiKey');
  if (!apiKey) throw new Error('未設定 Groq API Key');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: POLISH_PROMPT },
        { role: 'user', content: rawText },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq LLM 錯誤 (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

// 統一潤飾入口
async function polishText(rawText) {
  const store = getStore();
  const enabled = store.get('enablePolish');
  if (!enabled) return rawText;

  const provider = store.get('polishProvider') || 'openai';
  if (provider === 'groq') {
    return polishWithGroq(rawText);
  }
  return polishWithOpenAI(rawText);
}

module.exports = { polishText, polishWithOpenAI, polishWithGroq };
