'use client';

import React, { useState } from 'react';
import { Mail, X, Copy, Check, Download, Sparkles, RefreshCw } from 'lucide-react';
import { generateCoverLetter } from '../utils/api';

export default function CoverLetterModal({
  isOpen,
  onClose,
  resumeText,
  jobDescription,
  customizedResume,
  defaultCompany = '',
  onShowToast
}) {
  const [companyName, setCompanyName] = useState(defaultCompany || '');
  const [hiringManager, setHiringManager] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      const res = await generateCoverLetter({
        resumeText,
        jobDescription,
        customizedResume,
        companyName,
        hiringManager
      });
      setCoverLetter(res.coverLetter);
    } catch (err) {
      console.error(err);
      onShowToast('Failed to generate cover letter. ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    onShowToast('Cover letter copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([coverLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${(companyName || 'Target_Company').replace(/\s+/g, '_')}_Cover_Letter.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    onShowToast('Cover letter downloaded!');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="card-icon-pill" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc' }}>
              <Mail size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>AI Cover Letter Generator</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Personalized cover letter tailored to this job description and your resume
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn-ghost" style={{ padding: 6 }}>
            <X size={20} />
          </button>
        </div>

        {/* Inputs row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>
              Target Company Name
            </label>
            <input
              type="text"
              className="select-control"
              placeholder="e.g. Stripe, Acme Corp"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>
              Hiring Manager / Team (Optional)
            </label>
            <input
              type="text"
              className="select-control"
              placeholder="e.g. Engineering Hiring Manager"
              value={hiringManager}
              onChange={(e) => setHiringManager(e.target.value)}
            />
          </div>
        </div>

        {!coverLetter && (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <button
              onClick={handleGenerate}
              className="btn-primary"
              disabled={isLoading}
            >
              <Sparkles size={18} />
              <span>{isLoading ? 'Generating Tailored Letter...' : 'Generate Cover Letter'}</span>
            </button>
          </div>
        )}

        {coverLetter && (
          <div>
            <textarea
              className="custom-textarea"
              style={{ minHeight: '320px', fontSize: '0.92rem', lineHeight: 1.7 }}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
              <button
                onClick={handleGenerate}
                className="btn-secondary"
                disabled={isLoading}
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                <span>Regenerate</span>
              </button>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleDownload} className="btn-secondary">
                  <Download size={15} />
                  <span>Download .txt</span>
                </button>
                <button onClick={handleCopy} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copied ? 'Copied!' : 'Copy Letter'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
