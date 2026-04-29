/**
 * Unified API Service Layer
 * Supports: CodeBuddy.ai, Z.ai (GLM), and any OpenAI-compatible provider
 */

// ── Provider Configurations ──

const PROVIDERS = {
  codebuddy: {
    name: 'CodeBuddy AI',
    baseUrl: 'https://api.codebuddy.ai/v1',
    model: 'codebuddy-chat',
    authHeader: (key) => `Bearer ${key}`,
  },
  zai_glm: {
    name: 'Z.ai GLM',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-5-plus',
    authHeader: (key) => `Bearer ${key}`,
  },
  openai_compatible: {
    name: 'OpenAI Compatible',
    baseUrl: '', // User provides full URL
    model: '', // User provides model name
    authHeader: (key) => `Bearer ${key}`,
  },
};

// ── System Prompt for Credit Coach ──

const COACH_SYSTEM_PROMPT = `You are Aria, an expert AI Credit Coach specializing in helping Micro, Small & Medium Enterprises (MSMEs) improve their creditworthiness. You are warm, encouraging, professional, and data-driven.

Your role:
- Analyze a user's credit score breakdown across 4 pillars: Financial Health, Operational Stability, Alternative Data, Psychometric Indicators
- Provide specific, actionable advice to help them reach "Credit Ready" status (75+ score)
- Answer questions about loans, business registration, digital presence, savings, debt management
- Always reference actual numbers from the user's assessment when available
- Use markdown formatting (**bold**, bullet points) for readability
- End each response with 2-3 short follow-up suggestion questions as "suggestions"
- Be concise — aim for 150-250 words per response unless user asks for detail

Tone guidelines:
- Encouraging but honest about gaps
- Practical with concrete steps
- Avoid jargon; explain financial concepts simply
- Use emojis sparingly for emphasis (📊 🎯 ✅ ⚠️ 🔴 💡 ⏱)

When no assessment data is available, guide users through the onboarding process.`;

// ── Core Functions ──

function getStoredConfig() {
  try {
    const raw = localStorage.getItem('msme_api_config');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredConfig(config) {
  localStorage.setItem('msme_api_config', JSON.stringify(config));
}

/**
 * Build the system prompt with user-specific context injected
 */
export function buildContextMessage(assessmentData) {
  if (!assessmentData) {
    return { role: 'system', content: COACH_SYSTEM_PROMPT };
  }

  const pillars = Object.entries(assessmentData.pillars || {})
    .map(([k, p]) => `${p.label}: ${p.score}/100 (weight ${p.weight}%)`)
    .join('\n');

  const gaps = [];
  if (assessmentData.pillars) {
    Object.entries(assessmentData.pillars).forEach(([k, p]) => {
      gaps.push(`${p.label}: ${p.score}/100`);
    });
  }

  const context = COACH_SYSTEM_PROMPT + `\n\n## Current User Assessment Context:\n` +
    `- **Overall Score:** ${assessmentData.scoreTotal}/100 (${assessmentData.band?.label || 'Unknown'})\n` +
    `- **Pillar Scores:**\n${pillars}\n` +
    `- **Gaps Summary:** ${gaps.join('; ')}`;

  return { role: 'system', content: context };
}

/**
 * Send a chat completion request to the configured provider
 * Returns { text: string, suggestions: string[] }
 */
export async function sendChatRequest(userMessage, assessmentData, options = {}) {
  const config = getStoredConfig();
  
  // No config → use fallback immediately
  if (!config || !config.apiKey || !config.provider) {
    throw new Error('NO_CONFIG');
  }

  const provider = PROVIDERS[config.provider];
  if (!provider) {
    throw new Error('UNKNOWN_PROVIDER');
  }

  const baseUrl = config.customBaseUrl || provider.baseUrl;
  const modelName = config.customModel || provider.model;

  const messages = [
    buildContextMessage(assessmentData),
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': provider.authHeader(config.apiKey),
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('INVALID_KEY');
      if (response.status === 403) throw new Error('FORBIDDEN');
      if (response.status === 429) throw new Error('RATE_LIMITED');
      throw new Error(`API_ERROR_${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'API_ERROR');
    }

    const rawText = data.choices?.[0]?.message?.content || '';

    // Parse suggestions from the response (look for lines starting with "Suggestion:" or similar)
    const suggestions = parseSuggestions(rawText);
    const cleanText = stripSuggestions(rawText);

    return { text: cleanText.trim(), suggestions };

  } catch (err) {
    // Re-throw our known error codes
    if (['NO_CONFIG', 'UNKNOWN_PROVIDER', 'INVALID_KEY', 'FORBIDDEN', 'RATE_LIMITED'].includes(err.message)) {
      throw err;
    }
    // Network or other errors
    console.error('[API Service] Request failed:', err);
    throw new Error('NETWORK_ERROR');
  }
}

/**
 * Test API connection by sending a minimal message
 */
export async function testApiConnection(config) {
  const provider = PROVIDERS[config.provider];
  if (!provider) throw new Error(`Unknown provider: ${config.provider}`);

  const baseUrl = config.customBaseUrl || provider.baseUrl;
  const modelName = config.customModel || provider.model;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': provider.authHeader(config.apiKey),
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: 'Reply with exactly: OK' },
        { role: 'user', content: 'test' },
      ],
      temperature: 0,
      max_tokens: 10,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}${errBody ? ': ' + errBody.slice(0, 100) : ''}`);
  }

  return true;
}

// ── Config Management ──

export function getApiConfig() {
  return getStoredConfig();
}

export function saveApiConfig(config) {
  setStoredConfig({ ...getStoredConfig(), ...config });
}

export function clearApiConfig() {
  localStorage.removeItem('msme_api_config');
}

export function isApiConfigured() {
  const cfg = getStoredConfig();
  return !!(cfg && cfg.provider && cfg.apiKey);
}

export { PROVIDERS };

// ── Internal Helpers ──

/**
 * Extract suggestion-like lines from AI response
 */
function parseSuggestions(text) {
  const suggestions = [];

  // Pattern 1: Lines ending with "?" that look like follow-up questions
  const questionLines = text.match(/^(?:\d+\.\s*)?[^*\n]+\?$/gm) || [];
  const filteredQuestions = questionLines
    .filter(l => l.length > 8 && l.length < 80)
    .slice(-3)
    .map(s => s.replace(/^\d+\.\s*/, '').trim());

  suggestions.push(...filteredQuestions);

  // Pattern 2: Explicitly marked suggestions
  const explicitMatch = text.match(/(?:Suggested|Follow-up|Try asking)[:\s]*\n((?:[•\-]\s*.+\n?)+)/i);
  if (explicitMatch) {
    const items = explicitMatch[1].split('\n')
      .filter(l => l.trim())
      .map(l => l.replace(/[•\-]\s*/, '').trim());
    suggestions.push(...items);
  }

  // Deduplicate and limit to 4
  return [...new Set(suggestions)].slice(0, 4);
}

/**
 * Remove explicit suggestion sections from displayed text
 */
function stripSuggestions(text) {
  return text
    .replace(/\n*(?:Suggested|Follow-up|Try asking)[:\s]*(\n(?:[•\-]\s*.+)*)+/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
