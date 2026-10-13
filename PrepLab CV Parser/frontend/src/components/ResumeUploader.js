'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Eye, Trash2 } from 'lucide-react';
import { uploadResumeFile } from '../utils/api';

export default function ResumeUploader({
  resumeText,
  fileName,
  fileSize,
  onParsed,
  onClear,
  sampleResumes = [],
  error = '',
  onError
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (ext !== '.pdf' && ext !== '.docx') {
      onError('Please upload a PDF (.pdf) or Word (.docx) document.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onError('File size exceeds the 10MB limit. Please upload a smaller document.');
      return;
    }

    try {
      setIsParsing(true);
      onError('');
      const result = await uploadResumeFile(file);
      onParsed({
        text: result.text,
        fileName: result.fileName,
        fileSize: result.fileSize
      });
    } catch (err) {
      onError(err.message || 'Failed to parse resume');
    } finally {
      setIsParsing(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="card-header-bar">
        <div className="card-title-group">
          <div className="card-icon-pill" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
            <FileText size={18} />
          </div>
          <div>
            <h3 className="card-title">2. Candidate Resume</h3>
            <p className="card-subtitle">Upload your current resume in PDF or DOCX format</p>
          </div>
        </div>

        {resumeText && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="btn-ghost"
              title="Toggle preview of parsed resume text"
            >
              <Eye size={14} />
              <span>{showPreview ? 'Hide Text' : 'View Text'}</span>
            </button>
            <button
              onClick={onClear}
              className="btn-ghost"
              style={{ color: '#f87171' }}
              title="Remove resume"
            >
              <Trash2 size={14} />
              <span>Remove</span>
            </button>
          </div>
        )}
      </div>

      {/* Sample Resumes for 1-Click Testing */}
      {sampleResumes.length > 0 && (
        <div className="sample-bar">
          <span className="sample-label">Or Load Sample:</span>
          {sampleResumes.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                onParsed({
                  text: s.text,
                  fileName: s.fileName,
                  fileSize: s.text.length * 2
                });
                onError('');
              }}
              className="sample-chip"
              type="button"
            >
              {s.name} ({s.targetRole.split(' ')[0]})
            </button>
          ))}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Upload Dropzone */}
      {!resumeText ? (
        <div
          id="resume-dropzone"
          className={`dropzone-container ${isDragging ? 'is-dragover' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          <div className="dropzone-icon">
            <UploadCloud size={28} />
          </div>
          <h4 className="dropzone-title">
            {isParsing ? 'Parsing Document Text...' : 'Click or Drag & Drop Resume Here'}
          </h4>
          <p className="dropzone-hint">
            Supports PDF and DOCX files (up to 10MB)
          </p>
          {isParsing && (
            <div style={{ marginTop: 14, color: '#06b6d4', fontSize: '0.85rem' }}>
              Extracting candidate sections and work history...
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="file-preview-card">
            <div className="file-meta-group">
              <div className="file-type-icon">
                {fileName.endsWith('.docx') ? 'DOCX' : 'PDF'}
              </div>
              <div>
                <div className="file-info-name">{fileName}</div>
                <div className="file-info-size">
                  {formatFileSize(fileSize)} • {resumeText.split(/\s+/).filter(Boolean).length} words parsed
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  color: '#34d399',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                <CheckCircle2 size={16} /> Parsed Successfully
              </span>
              <button
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                Change File
              </button>
            </div>
          </div>

          {/* Collapsible Text Preview */}
          {showPreview && (
            <div
              className="hide-scrollbar"
              style={{
                background: '#090d16',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                maxHeight: '220px',
                overflowY: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6
              }}
            >
              {resumeText}
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, color: '#f87171', fontSize: '0.85rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
