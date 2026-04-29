import { useState, useEffect } from 'react';
import { Key, Save, Trash2, Check, X, Loader2, Shield, ExternalLink, Cpu, Zap, Globe } from 'lucide-react';
import { getApiConfig, saveApiConfig, clearApiConfig, testApiConnection, PROVIDERS, isApiConfigured } from '../services/apiService';

const PROVIDER_OPTIONS = [
  {
    id: 'zai_glm',
    label: 'Z.ai (GLM-5)',
    description: 'Zhipu AI GLM-5 model — powerful multilingual AI',
    icon: <Zap size={18} />,
    color: 'from-blue-500 to-indigo-600',
    defaultModel: 'glm-5-plus',
    defaultUrl: 'https://open.bigmodel.cn/api/paas/v4',
    helpUrl: 'https://open.bigmodel.cn/',
    helpText: 'Get your API key at open.bigmodel.cn',
  },
  {
    id: 'codebuddy',
    label: 'CodeBuddy AI',
    description: 'CodeBuddy AI chat model — optimized for code & analysis',
    icon: <Cpu size={18} />,
    color: 'from-teal-500 to-emerald-600',
    defaultModel: 'codebuddy-chat',
    defaultUrl: 'https://api.codebuddy.ai/v1',
    helpUrl: 'https://www.codebuddy.ai',
    helpText: 'Get your API key from CodeBuddy dashboard',
  },
  {
    id: 'openai_compatible',
    label: 'OpenAI Compatible',
    description: 'Any provider with an OpenAI-style chat/completions endpoint',
    icon: <Globe size={18} />,
    color: 'from-purple-500 to-pink-600',
    defaultModel: '',
    defaultUrl: '',
    helpUrl: '#',
    helpText: 'Enter your custom base URL and model name',
  },
];

export default function ApiSettings() {
  const [provider, setProvider] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [customBaseUrl, setCustomBaseUrl] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // null | 'success' | 'error'
  const [testMessage, setTestMessage] = useState('');
  const [saved, setSaved] = useState(false);

  // Load saved config on mount
  useEffect(() => {
    const cfg = getApiConfig();
    if (cfg) {
      setProvider(cfg.provider || '');
      setApiKey(cfg.apiKey || '');
      setCustomBaseUrl(cfg.customBaseUrl || '');
      setCustomModel(cfg.customModel || '');
    }
  }, []);

  const selectedOption = PROVIDER_OPTIONS.find(p => p.id === provider) || PROVIDER_OPTIONS[0];

  const handleSave = () => {
    if (!provider || !apiKey.trim()) return;

    saveApiConfig({
      provider,
      apiKey: apiKey.trim(),
      ...(customBaseUrl ? { customBaseUrl } : {}),
      ...(customModel ? { customModel } : {}),
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    if (!provider || !apiKey.trim()) return;

    setTesting(true);
    setTestResult(null);
    setTestMessage('');

    try {
      await testApiConnection({
        provider,
        apiKey: apiKey.trim(),
        ...(customBaseUrl ? { customBaseUrl } : {}),
        ...(customModel ? { customModel } : {}),
      });
      setTestResult('success');
      setTestMessage('Connection successful! Your AI coach is ready.');
    } catch (err) {
      setTestResult('error');
      setTestMessage(`Failed: ${err.message}`);
    }

    setTesting(false);
  };

  const handleClear = () => {
    clearApiConfig();
    setProvider('');
    setApiKey('');
    setCustomBaseUrl('');
    setCustomModel('');
    setSaved(false);
    setTestResult(null);
    setTestMessage('');
  };

  const canSave = provider && apiKey.trim().length > 5;
  const configExists = isApiConfigured();

  return (
    <div style={{ width: '100%', padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1e293b' }}>API Configuration</h2>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
          Connect an AI provider to enable real AI-powered coaching responses.
          Without configuration, Aria uses rule-based responses as fallback.
        </p>
        {/* Status badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, padding: '6px 12px', borderRadius: 8, background: configExists ? '#f0fdf4' : '#f8fafc', border: `1px solid ${configExists ? '#86efac' : '#e2e8f0'}` }}>
          {configExists ? (
            <>
              <Check size={14} color="#16a34a" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a' }}>AI Connected</span>
              <Key size={12} color="#94a3b8" />
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{PROVIDERS[getApiConfig()?.provider]?.name || getApiConfig()?.provider}</span>
            </>
          ) : (
            <>
              <Shield size={14} color="#94a3b8" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Not Configured</span>
            </>
          )}
        </div>
      </div>

      {/* Provider Selection */}
      <div className="space-y-3">
        <label style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Choose Provider</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {PROVIDER_OPTIONS.map(opt => (
            <button key={opt.id}
              onClick={() => {
                setProvider(opt.id);
                setCustomBaseUrl(opt.defaultUrl);
                setCustomModel(opt.defaultModel);
                setTestResult(null);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px',
                borderRadius: 14, border: `2px solid ${provider === opt.id ? '#0d9488' : '#e2e8f0'}`,
                background: provider === opt.id ? '#f0fdfa' : '#fff',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
              }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${opt.color.includes('from') ? '' : '#cbd5e1'})`, background: `linear-gradient(135deg, var(--tw-gradient-stops))`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: `linear-gradient(135deg, ${opt.id === 'zai_glm' ? '#3b82f6,#4f46e5' : opt.id === 'codebuddy' ? '#0d9488,#059669' : '#a855f7,#ec4899'})` }}>
                {opt.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{opt.label}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{opt.description}</div>
              </div>
              {provider === opt.id && (
                <Check size={16} color="#0d9488" style={{ marginLeft: 'auto', flexShrink: 0 }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* API Key */}
      <div className="space-y-2">
        <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Key size={14} /> API Key
        </label>
        <input type="password"
          value={apiKey}
          onChange={e => { setApiKey(e.target.value); setTestResult(null); }}
          placeholder={provider === 'openai_compatible' ? 'sk-... or your API key' : provider === 'zai_glm' ? 'Enter your Zhipu AI API key' : 'Enter your CodeBuddy API key'}
          style={{ width: '100%', padding: '12px 16px', border: `2px solid ${apiKey && !canSave ? '#fca5a5' : '#e2e8f0'}`, borderRadius: 12, fontSize: 14, outline: 'none', transition: 'border-color 0.15s' }}
          onFocus={e => e.target.style.borderColor = '#0d9488'}
          onBlur={e => e.target.style.borderColor = apiKey && !canSave ? '#fca5a5' : '#e2e8f0'}
        />
        <p style={{ fontSize: 11, color: '#94a3b8' }}>
          Stored locally in your browser only. Never shared with any third party except the selected provider's API.
        </p>
      </div>

      {/* Custom URL + Model (for openai_compatible) */}
      {(provider === 'openai_compatible' || true) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="space-y-2">
            <label style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Base URL</label>
            <input
              value={customBaseUrl}
              onChange={e => setCustomBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
              style={{ width: '100%', padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: 12, fontSize: 14, outline: 'none' }}
              onFocus={e => e.target.style.borderColor = '#0d9488'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div className="space-y-2">
            <label style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Model Name</label>
            <input
              value={customModel}
              onChange={e => setCustomModel(e.target.value)}
              placeholder="gpt-4o / glm-5-plus / etc."
              style={{ width: '100%', padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: 12, fontSize: 14, outline: 'none' }}
              onFocus={e => e.target.style.borderColor = '#0d9488'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
        </div>
      )}

      {/* Help link for current provider */}
      {selectedOption.helpUrl !== '#' && (
        <a href={selectedOption.helpUrl} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#0d9488', textDecoration: 'none' }}>
          <ExternalLink size={12} /> {selectedOption.helpText}
        </a>
      )}

      {/* Actions Row */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 4 }}>
        <button onClick={handleSave} disabled={!canSave}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px',
            borderRadius: 12, border: 'none', background: saved ? '#16a34a' : canSave ? '#0d9488' : '#cbd5e1',
            color: '#fff', fontWeight: 700, fontSize: 14, cursor: canSave ? 'pointer' : 'not-allowed', transition: 'all 0.15s'
          }}>
          {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Configuration</>}
        </button>

        <button onClick={handleTest} disabled={!canSave || testing}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px',
            borderRadius: 12, border: '2px solid #e2e8f0', background: '#fff',
            color: '#334155', fontWeight: 600, fontSize: 14, cursor: canSave ? 'pointer' : 'not-allowed',
          }}>
          {testing ? <><Loader2 size={16} className="animate-spin" /> Testing…</> : <>🔌 Test Connection</>}
        </button>

        {configExists && (
          <button onClick={handleClear}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px',
              borderRadius: 12, border: '2px solid #fecaca', background: '#fff',
              color: '#dc2626', fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}>
            <Trash2 size={16} /> Clear Keys
          </button>
        )}
      </div>

      {/* Test Result */}
      {testResult && (
        <div style={{
          padding: '14px 18px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10,
          background: testResult === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${testResult === 'success' ? '#86efac' : '#fecaca'}`
        }}>
          {testResult === 'success' ? (
            <><Check size={18} color="#16a34a" /><strong style={{ color: '#16a34a', fontSize: 14 }}>Success:</strong></>
          ) : (
            <><X size={18} color="#dc2626" /><strong style={{ color: '#dc2626', fontSize: 14 }}>Error:</strong></>
          )}
          <span style={{ fontSize: 13, color: testResult === 'success' ? '#166534' : '#991b1b' }}>{testMessage}</span>
        </div>
      )}

      {/* Info Box */}
      <div style={{ padding: '16px 18px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.7 }}>
          <strong>How it works:</strong> When you send a message to Aria, she first tries your configured AI API for a real-time intelligent response. If the API is unreachable or returns an error, she automatically falls back to the built-in rule-based engine. This ensures you always get a response, even offline.
        </p>
        <div style={{ marginTop: 10, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { icon: <Cpu size={14} />, text: 'AI Response', sub: 'Real LLM output', bg: '#ede9fe', color: '#7c3aed' },
            { icon: <Cpu size={14} />, text: 'Rule-based Fallback', sub: 'Pre-written responses', bg: '#ccfbf1', color: '#0d9488' },
            { icon: <Shield size={14} />, text: 'Local Storage Only', sub: 'Keys never leave browser', bg: '#fef3c7', color: '#d97706' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: item.bg }}>
              <span style={{ color: item.color }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: item.color }}>{item.text}</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
