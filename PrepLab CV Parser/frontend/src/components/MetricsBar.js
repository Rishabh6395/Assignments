'use client';

import React from 'react';
import { Target, ShieldCheck, Tag, TrendingUp, AlertTriangle } from 'lucide-react';

export default function MetricsBar({ matchScore, atsEvaluation, onInsertKeyword }) {
  const beforeScore = matchScore?.before || 50;
  const afterScore = matchScore?.after || 88;
  const delta = Math.max(afterScore - beforeScore, 0);

  const atsScore = atsEvaluation?.overallAtsScore || 90;
  const matchedKeywords = atsEvaluation?.matchedKeywords || [];
  const missingKeywords = atsEvaluation?.missingKeywords || [];

  return (
    <div>
      {/* 3 Metric Cards */}
      <div className="metrics-grid">
        {/* Match Score Card */}
        <div className="metric-card">
          <div
            className="metric-circle-gauge"
            style={{
              '--gauge-percent': `${afterScore}%`,
              background: `conic-gradient(#10b981 ${afterScore * 3.6}deg, rgba(255, 255, 255, 0.08) 0)`
            }}
          >
            <span className="metric-circle-value" style={{ color: '#10b981' }}>
              {afterScore}%
            </span>
          </div>

          <div className="metric-info">
            <h4>JD Match Alignment</h4>
            <div className="metric-value-row">
              <span className="metric-main-val">{afterScore}%</span>
              <span className="metric-delta-badge">+{delta}% Lift</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Original: {beforeScore}% → Tailored: {afterScore}%
            </p>
          </div>
        </div>

        {/* ATS Readiness Score */}
        <div className="metric-card">
          <div
            className="metric-circle-gauge"
            style={{
              '--gauge-percent': `${atsScore}%`,
              background: `conic-gradient(#06b6d4 ${atsScore * 3.6}deg, rgba(255, 255, 255, 0.08) 0)`
            }}
          >
            <span className="metric-circle-value" style={{ color: '#06b6d4' }}>
              {atsScore}
            </span>
          </div>

          <div className="metric-info">
            <h4>ATS Compatibility</h4>
            <div className="metric-value-row">
              <span className="metric-main-val">{atsScore}/100</span>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#06b6d4',
                  background: 'rgba(6, 182, 212, 0.15)',
                  padding: '2px 8px',
                  borderRadius: '9999px'
                }}
              >
                Grade A
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Parser-friendly formatting & headers
            </p>
          </div>
        </div>

        {/* Keyword Intelligence */}
        <div className="metric-card">
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Tag size={28} />
          </div>

          <div className="metric-info">
            <h4>Keyword Integration</h4>
            <div className="metric-value-row">
              <span className="metric-main-val" style={{ color: '#818cf8' }}>
                {matchedKeywords.length}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Matched Terms
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
              {missingKeywords.length} suggested opportunities
            </p>
          </div>
        </div>
      </div>

      {/* Missing Keywords Suggestion Drawer */}
      {missingKeywords.length > 0 && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            marginBottom: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fbbf24', fontSize: '0.88rem', fontWeight: 600 }}>
            <AlertTriangle size={16} />
            <span>Recommended Missing Keywords from Job Description:</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 10px' }}>
            The JD emphasizes these terms. If you have relevant exposure, consider weaving them into your experience bullets:
          </p>
          <div className="keyword-tags-container">
            {missingKeywords.map((kw, idx) => (
              <span key={idx} className="keyword-tag missing">
                + {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
