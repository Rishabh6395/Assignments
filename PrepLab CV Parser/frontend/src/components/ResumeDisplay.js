'use client';

import React, { useState } from 'react';
import { Download, FileDown, Copy, Check, Printer, FileText, Code2, Sparkles } from 'lucide-react';
import { downloadDocx } from '../utils/api';

export default function ResumeDisplay({ customizedData, originalText, onShowToast }) {
  const [viewMode, setViewMode] = useState('formatted'); // 'formatted' | 'markdown'
  const [copied, setCopied] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  const {
    targetRole = 'Software Engineer',
    companyName = '',
    summaryRewrite = '',
    skillsAnalysis = {},
    experienceEnhancements = [],
    fullCustomizedResumeMarkdown = ''
  } = customizedData || {};

  // Extract contact and name from original or markdown
  const lines = (fullCustomizedResumeMarkdown || originalText || '').split('\n').map(l => l.trim()).filter(Boolean);
  const candidateName = lines[0]?.replace(/^#+\s*/, '') || 'Alex Rivera';
  const contactLine = lines[1]?.includes('@') ? lines[1] : 'San Francisco, CA • email@example.com • (555) 000-0000';

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCustomizedResumeMarkdown || summaryRewrite);
    setCopied(true);
    onShowToast('Resume markdown copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([fullCustomizedResumeMarkdown || originalText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${candidateName.replace(/\s+/g, '_')}_Tailored_Resume.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    onShowToast('Plain text resume downloaded!');
  };

  const handleDownloadDocx = async () => {
    try {
      setIsExportingDocx(true);
      await downloadDocx({
        candidateName,
        contactLine,
        targetRole,
        summaryRewrite,
        skillsAnalysis,
        experienceEnhancements,
        fullCustomizedResumeMarkdown
      });
      onShowToast('Word (.docx) resume downloaded successfully!');
    } catch (err) {
      console.error(err);
      onShowToast('Failed to export DOCX. Please try again.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Action Toolbar */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '12px 18px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        {/* Toggle Mode */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className={`tab-btn ${viewMode === 'formatted' ? 'active' : ''}`}
            onClick={() => setViewMode('formatted')}
            style={{ borderRadius: 'var(--radius-sm)', padding: '6px 12px', fontSize: '0.85rem' }}
          >
            <FileText size={15} /> Formatted Resume
          </button>
          <button
            className={`tab-btn ${viewMode === 'markdown' ? 'active' : ''}`}
            onClick={() => setViewMode('markdown')}
            style={{ borderRadius: 'var(--radius-sm)', padding: '6px 12px', fontSize: '0.85rem' }}
          >
            <Code2 size={15} /> Markdown Text
          </button>
        </div>

        {/* Download Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            id="print-pdf-btn"
            onClick={handlePrintPdf}
            className="btn-secondary"
            title="Download or Print clean PDF"
          >
            <Printer size={15} />
            <span>Download PDF</span>
          </button>

          <button
            id="download-docx-btn"
            onClick={handleDownloadDocx}
            className="btn-secondary"
            disabled={isExportingDocx}
            title="Download formatted Microsoft Word DOCX"
          >
            <FileDown size={15} />
            <span>{isExportingDocx ? 'Generating...' : 'Download DOCX'}</span>
          </button>

          <button
            id="download-txt-btn"
            onClick={handleDownloadTxt}
            className="btn-secondary"
            title="Download as Plain Text file"
          >
            <Download size={15} />
            <span>Text (.txt)</span>
          </button>

          <button
            onClick={handleCopy}
            className="btn-secondary"
            title="Copy entire markdown to clipboard"
          >
            {copied ? <Check size={15} color="#34d399" /> : <Copy size={15} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Formatted Paper View */}
      {viewMode === 'formatted' ? (
        <div className="resume-paper-container" id="printable-resume-paper">
          {/* Header */}
          <div className="resume-paper-header">
            <h1 className="resume-name">{candidateName}</h1>
            <p className="resume-contactLine">{contactLine}</p>
            {targetRole && (
              <span className="resume-target-badge">
                Target Role: {targetRole} {companyName ? `• ${companyName}` : ''}
              </span>
            )}
          </div>

          {/* Professional Summary */}
          {summaryRewrite && (
            <div>
              <h2 className="resume-section-title">Professional Summary</h2>
              <p className="resume-text-body">{summaryRewrite}</p>
            </div>
          )}

          {/* Core Competencies & Skills */}
          {skillsAnalysis && (
            <div>
              <h2 className="resume-section-title">Core Competencies & Technical Skills</h2>
              {skillsAnalysis.categorizedSkills ? (
                Object.entries(skillsAnalysis.categorizedSkills).map(([cat, skills]) => (
                  <p key={cat} className="resume-text-body" style={{ marginBottom: 6 }}>
                    <strong>{cat}:</strong> {Array.isArray(skills) ? skills.join(', ') : skills}
                  </p>
                ))
              ) : skillsAnalysis.matchedSkills?.length > 0 ? (
                <p className="resume-text-body">
                  <strong>Key Competencies:</strong> {skillsAnalysis.matchedSkills.join(' • ')}
                </p>
              ) : null}
            </div>
          )}

          {/* Experience Enhancements */}
          {experienceEnhancements?.length > 0 && (
            <div>
              <h2 className="resume-section-title">Professional Experience</h2>
              {experienceEnhancements.map((exp, idx) => (
                <div key={idx} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <strong style={{ fontSize: '1.02rem', color: '#0f172a' }}>{exp.role || targetRole}</strong>
                    <span style={{ fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic' }}>
                      {exp.company || 'Technology Solutions'}
                    </span>
                  </div>
                  <ul className="resume-bullet-list" style={{ marginTop: 6 }}>
                    {Array.isArray(exp.bullets) &&
                      exp.bullets.map((b, bIdx) => <li key={bIdx}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* If raw markdown has additional content like Education */}
          {fullCustomizedResumeMarkdown?.includes('## Education') && (
            <div>
              <h2 className="resume-section-title">Education & Credentials</h2>
              <p className="resume-text-body">
                {fullCustomizedResumeMarkdown.split('## Education')[1]?.split('##')[0]?.trim()}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Markdown Raw View */
        <div className="glass-card">
          <textarea
            className="custom-textarea"
            style={{ minHeight: '520px', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}
            value={fullCustomizedResumeMarkdown}
            readOnly
          />
        </div>
      )}
    </div>
  );
}
