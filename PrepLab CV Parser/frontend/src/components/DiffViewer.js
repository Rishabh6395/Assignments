'use client';

import React, { useState } from 'react';
import { GitCompare, PlusCircle, MinusCircle, RefreshCw } from 'lucide-react';

export default function DiffViewer({ diffData }) {
  const [diffMode, setDiffMode] = useState('word'); // 'word' | 'line'

  if (!diffData) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--text-muted)' }}>No diff data available. Please customize your resume first.</p>
      </div>
    );
  }

  const { changes = [], wordChanges = [], stats = {} } = diffData;

  return (
    <div className="diff-container">
      {/* Stats Bar */}
      <div className="diff-stats-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <GitCompare size={16} color="#818cf8" />
          <span style={{ fontWeight: 600 }}>Diff Analysis:</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="diff-badge-added">
            +{stats.addedLines || 0} Lines Enhanced
          </span>
          <span className="diff-badge-removed">
            -{stats.removedLines || 0} Lines Rephrased
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            {stats.unchangedLines || 0} Lines Unchanged
          </span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button
            className={`btn-ghost ${diffMode === 'word' ? 'active' : ''}`}
            onClick={() => setDiffMode('word')}
            style={{
              padding: '4px 10px',
              fontSize: '0.8rem',
              background: diffMode === 'word' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: diffMode === 'word' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            Word Diff
          </button>
          <button
            className={`btn-ghost ${diffMode === 'line' ? 'active' : ''}`}
            onClick={() => setDiffMode('line')}
            style={{
              padding: '4px 10px',
              fontSize: '0.8rem',
              background: diffMode === 'line' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: diffMode === 'line' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            Line Diff
          </button>
        </div>
      </div>

      {/* Diff Box */}
      <div className="diff-box">
        {diffMode === 'word' ? (
          <div>
            {wordChanges.map((part, index) => {
              if (part.added) {
                return (
                  <span key={index} className="diff-part-added">
                    {part.value}
                  </span>
                );
              }
              if (part.removed) {
                return (
                  <span key={index} className="diff-part-removed">
                    {part.value}
                  </span>
                );
              }
              return <span key={index}>{part.value}</span>;
            })}
          </div>
        ) : (
          <div>
            {changes.map((part, index) => {
              const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
              const color = part.added ? '#34d399' : part.removed ? '#f87171' : 'var(--text-secondary)';
              const bg = part.added ? 'rgba(16, 185, 129, 0.1)' : part.removed ? 'rgba(244, 63, 94, 0.1)' : 'transparent';

              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: bg,
                    color: color,
                    padding: '2px 8px',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {prefix}{part.value}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
