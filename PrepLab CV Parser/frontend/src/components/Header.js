'use client';

import React from 'react';
import { Sparkles, Settings, FileText, CheckCircle2 } from 'lucide-react';

export default function Header({ onOpenSettings, isBackendReady }) {
  return (
    <header className="header-nav">
      <div className="header-container">
        <div className="brand-logo">
          <div className="logo-badge">
            <Sparkles size={20} />
          </div>
          <div>
            PrepLab <span className="brand-text-accent">CV Customizer</span>
          </div>
        </div>

        <div className="header-actions">
          <div
            className="badge-pill"
            style={{
              marginBottom: 0,
              fontSize: '0.75rem',
              padding: '4px 10px',
              color: isBackendReady ? '#34d399' : '#fbbf24',
              borderColor: isBackendReady ? 'rgba(52, 211, 153, 0.3)' : 'rgba(251, 191, 36, 0.3)'
            }}
          >
            <CheckCircle2 size={12} />
            {isBackendReady ? 'AI Engine Ready' : 'Connecting...'}
          </div>

          <button
            id="settings-modal-btn"
            onClick={onOpenSettings}
            className="btn-secondary"
            title="Configure LLM API Key (Gemini, OpenAI, Groq)"
          >
            <Settings size={16} />
            <span>LLM Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
}
