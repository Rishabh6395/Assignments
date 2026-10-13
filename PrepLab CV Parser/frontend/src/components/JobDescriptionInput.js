'use client';

import React from 'react';
import { Briefcase, Trash2, Wand2 } from 'lucide-react';

export default function JobDescriptionInput({
  value,
  onChange,
  onSelectSample,
  sampleJds = [],
  error = ''
}) {
  const charCount = value ? value.length : 0;
  const wordCount = value ? value.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="card-header-bar">
        <div className="card-title-group">
          <div className="card-icon-pill">
            <Briefcase size={18} />
          </div>
          <div>
            <h3 className="card-title">1. Target Job Description</h3>
            <p className="card-subtitle">Paste the full role description, responsibilities & requirements</p>
          </div>
        </div>

        {value && (
          <button
            onClick={() => onChange('')}
            className="btn-ghost"
            title="Clear job description"
            style={{ color: '#f87171' }}
          >
            <Trash2 size={14} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Sample Quick Fills */}
      {sampleJds.length > 0 && (
        <div className="sample-bar">
          <span className="sample-label">Try Sample:</span>
          {sampleJds.map((jd) => (
            <button
              key={jd.id}
              onClick={() => onSelectSample(jd.text)}
              className="sample-chip"
              type="button"
            >
              {jd.title} ({jd.company.split(' ')[0]})
            </button>
          ))}
        </div>
      )}

      {/* Textarea */}
      <textarea
        id="job-description-textarea"
        className="custom-textarea"
        placeholder="Paste the target job description here... e.g.
About the Role:
We are seeking a Senior Full-Stack Software Engineer to build scalable microservices and customer portals using React, Node.js, and AWS...
Responsibilities:
- Build resilient APIs
- Optimize database performance..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={12}
      />

      <div className="input-footer">
        <div>
          {error ? (
            <span style={{ color: '#f87171', fontWeight: 600 }}>{error}</span>
          ) : charCount < 50 && charCount > 0 ? (
            <span style={{ color: '#fbbf24' }}>
              Minimum 50 characters recommended for accurate keyword matching ({50 - charCount} more needed)
            </span>
          ) : (
            <span>Ready for AI tailoring</span>
          )}
        </div>
        <div>
          {wordCount} words • {charCount} chars
        </div>
      </div>
    </div>
  );
}
