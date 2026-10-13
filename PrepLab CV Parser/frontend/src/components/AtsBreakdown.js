'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Lightbulb, TrendingUp } from 'lucide-react';

export default function AtsBreakdown({ atsEvaluation }) {
  if (!atsEvaluation) return null;

  const {
    overallAtsScore = 85,
    checklist = [],
    recommendations = [],
    matchedKeywords = [],
    missingKeywords = [],
    metricsFound = 0,
    actionVerbsFound = 0
  } = atsEvaluation;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Checklist */}
      <div className="glass-card">
        <div className="card-header-bar">
          <div className="card-title-group">
            <div className="card-icon-pill" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="card-title">ATS Readiness Audit</h3>
              <p className="card-subtitle">Automated Applicant Tracking System parse & scoring check</p>
            </div>
          </div>
          <span
            style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#06b6d4'
            }}
          >
            {overallAtsScore} / 100
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
          {checklist.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {item.passed ? (
                  <CheckCircle2 size={18} color="#34d399" />
                ) : (
                  <XCircle size={18} color="#f87171" />
                )}
                <span style={{ fontSize: '0.9rem', color: item.passed ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {item.label}
                </span>
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {item.score} / {item.max} pts
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations & Action Items */}
      {recommendations.length > 0 && (
        <div className="glass-card">
          <div className="card-header-bar">
            <div className="card-title-group">
              <div className="card-icon-pill" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                <Lightbulb size={18} />
              </div>
              <div>
                <h3 className="card-title">Actionable Optimization Recommendations</h3>
                <p className="card-subtitle">Expert suggestions to maximize recruiter callbacks</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(245, 158, 11, 0.06)',
                  border: '1px solid rgba(245, 158, 11, 0.2)'
                }}
              >
                <div style={{ color: '#fbbf24', marginTop: 2 }}>•</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {rec}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
