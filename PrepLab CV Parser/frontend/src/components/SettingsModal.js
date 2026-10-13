'use client';

import React, { useState, useEffect } from 'react';
import { Settings, X, Key, Check, Info, ExternalLink } from 'lucide-react';
import { getSavedApiSettings, saveApiSettings } from '../utils/api';

export default function SettingsModal({ isOpen, onClose, onShowToast }) {
  const [provider, setProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const saved = getSavedApiSettings();
      setProvider(saved.provider || 'gemini');
      setApiKey(saved.apiKey || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveApiSettings({ provider, apiKey: apiKey.trim() });
    onShowToast('LLM API settings saved successfully!');
    onClose();
  };

  const handleClear = () => {
    setApiKey('');
    saveApiSettings({ provider, apiKey: '' });
    onShowToast('Custom API key cleared. Using server defaults or demo engine.');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="card-icon-pill" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
              <Key size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>LLM Provider Settings</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Configure your API key or model preferences
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn-ghost" style={{ padding: 6 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Info Banner */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#818cf8', fontWeight: 600, marginBottom: 4 }}>
              <Info size={16} />
              <span>Multi-Provider Ready</span>
            </div>
            You can configure your key in <code>backend/.env</code> OR enter it below. If no key is set, the built-in intelligent heuristic engine provides full analysis and diffs automatically.
          </div>

          {/* Provider selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
              Select LLM Provider
            </label>
            <select
              className="select-control"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            >
              <option value="gemini">Google Gemini (Recommended - Fast & Accurate)</option>
              <option value="openai">OpenAI (GPT-4o Mini / GPT-4o)</option>
              <option value="groq">Groq (Llama 3.3 70B High Speed)</option>
            </select>
          </div>

          {/* API Key Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {provider === 'gemini' ? 'Google Gemini API Key' : provider === 'openai' ? 'OpenAI API Key' : 'Groq API Key'}
              </label>
              {provider === 'gemini' && (
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.78rem', color: '#06b6d4', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  Get free Gemini key <ExternalLink size={12} />
                </a>
              )}
            </div>
            <input
              type="password"
              className="select-control"
              placeholder={`Paste your ${provider} API key here...`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Keys are stored securely in your browser session and only sent to your backend for requests.
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
            <button onClick={handleClear} className="btn-ghost" style={{ color: '#f87171' }}>
              Clear Saved Key
            </button>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleSave} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
                <Check size={16} />
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
