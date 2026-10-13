'use client';

import React from 'react';
import { Sliders, CheckSquare, Square, Zap } from 'lucide-react';

export default function CustomizationOptions({
  selectedSections,
  onToggleSection,
  tone,
  onToneChange,
  focusKeywords,
  onFocusKeywordsChange
}) {
  const sections = [
    { id: 'summary', label: 'Summary / Objective' },
    { id: 'skills', label: 'Core & Technical Skills' },
    { id: 'experience', label: 'Experience Bullets' },
    { id: 'projects', label: 'Projects & Highlights' }
  ];

  return (
    <div className="options-bar">
      {/* Section Selection */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Sliders size={16} color="#818cf8" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tailor Sections:</span>
        </div>
        <div className="section-toggle-group">
          {sections.map((sec) => {
            const isActive = selectedSections.includes(sec.id);
            return (
              <button
                key={sec.id}
                type="button"
                className={`toggle-pill ${isActive ? 'active' : ''}`}
                onClick={() => onToggleSection(sec.id)}
              >
                {isActive ? '✓ ' : '+ '}
                {sec.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tone Selection */}
      <div>
        <label
          htmlFor="tone-select"
          style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}
        >
          Writing Tone:
        </label>
        <select
          id="tone-select"
          className="select-control"
          value={tone}
          onChange={(e) => onToneChange(e.target.value)}
        >
          <option value="impact-driven">Impact-Driven (Google X-Y-Z)</option>
          <option value="technical">Technical Depth & Architecture</option>
          <option value="executive">Executive & Leadership Focus</option>
        </select>
      </div>

      {/* Priority Keywords */}
      <div>
        <label
          htmlFor="focus-keywords-input"
          style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}
        >
          Extra Focus Keywords:
        </label>
        <input
          id="focus-keywords-input"
          type="text"
          className="select-control"
          placeholder="e.g. Next.js, Kubernetes"
          value={focusKeywords}
          onChange={(e) => onFocusKeywordsChange(e.target.value)}
        />
      </div>
    </div>
  );
}
