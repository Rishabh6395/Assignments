'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import JobDescriptionInput from '../components/JobDescriptionInput';
import ResumeUploader from '../components/ResumeUploader';
import CustomizationOptions from '../components/CustomizationOptions';
import MetricsBar from '../components/MetricsBar';
import ResumeDisplay from '../components/ResumeDisplay';
import DiffViewer from '../components/DiffViewer';
import AtsBreakdown from '../components/AtsBreakdown';
import CoverLetterModal from '../components/CoverLetterModal';
import SettingsModal from '../components/SettingsModal';
import { checkHealth, fetchSampleData, customizeResume } from '../utils/api';
import {
  Sparkles,
  Wand2,
  GitCompare,
  FileText,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RotateCcw
} from 'lucide-react';

export default function Home() {
  // Input states
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);

  // Customization settings
  const [selectedSections, setSelectedSections] = useState(['summary', 'skills', 'experience', 'projects']);
  const [tone, setTone] = useState('impact-driven');
  const [focusKeywords, setFocusKeywords] = useState('');

  // Sample data & backend health
  const [sampleJds, setSampleJds] = useState([]);
  const [sampleResumes, setSampleResumes] = useState([]);
  const [isBackendReady, setIsBackendReady] = useState(false);

  // Customization results
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customizationStep, setCustomizationStep] = useState(0);
  const [customResult, setCustomResult] = useState(null);
  const [diffData, setDiffData] = useState(null);
  const [atsEvaluation, setAtsEvaluation] = useState(null);

  // Active Output Tab
  const [activeTab, setActiveTab] = useState('resume'); // 'resume' | 'diff' | 'ats'

  // Modals & Feedback
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [jdError, setJdError] = useState('');
  const [resumeError, setResumeError] = useState('');

  // Load sample data & check health on initial mount
  useEffect(() => {
    async function init() {
      try {
        const health = await checkHealth();
        if (health && health.status === 'ok') {
          setIsBackendReady(true);
        }
        const samples = await fetchSampleData();
        if (samples) {
          setSampleJds(samples.jobDescriptions || []);
          setSampleResumes(samples.resumes || []);
        }
      } catch (e) {
        console.warn('Initialization notice:', e);
      }
    }
    init();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleToggleSection = (sectionId) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const handleClearAll = () => {
    setJobDescription('');
    setResumeText('');
    setFileName('');
    setFileSize(0);
    setCustomResult(null);
    setDiffData(null);
    setAtsEvaluation(null);
    setJdError('');
    setResumeError('');
    showToast('Workflow cleared.');
  };

  const handleCustomize = async () => {
    let hasError = false;
    setJdError('');
    setResumeError('');

    if (!jobDescription || jobDescription.trim().length < 50) {
      setJdError('Please provide a job description of at least 50 characters.');
      hasError = true;
    }

    if (!resumeText || resumeText.trim().length < 50) {
      setResumeError('Please upload a resume or select a sample resume.');
      hasError = true;
    }

    if (hasError) return;

    try {
      setIsCustomizing(true);
      setCustomizationStep(1);

      // Multi-step animated progress simulation for rich UX
      const timer1 = setTimeout(() => setCustomizationStep(2), 700);
      const timer2 = setTimeout(() => setCustomizationStep(3), 1500);

      const response = await customizeResume({
        jobDescription,
        resumeText,
        sectionsToCustomize: selectedSections,
        tone,
        focusKeywords
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      setCustomizationStep(4);

      setCustomResult(response.customized);
      setDiffData(response.diff);
      setAtsEvaluation(response.atsEvaluation);
      setActiveTab('resume');
      showToast('Resume successfully customized & optimized!');

      // Scroll smoothly to results
      setTimeout(() => {
        const resElem = document.getElementById('results-section');
        if (resElem) resElem.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (err) {
      console.error(err);
      showToast('Customization failed: ' + err.message);
    } finally {
      setIsCustomizing(false);
      setCustomizationStep(0);
    }
  };

  return (
    <>
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        isBackendReady={isBackendReady}
      />

      <main className="main-container">
        {/* Hero Section */}
        <section className="hero-section no-print">
          <div className="badge-pill">
            <Sparkles size={14} />
            <span>Next-Gen Career Intelligence</span>
          </div>
          <h1 className="hero-title">
            Tailor Your Resume to Any <span className="brand-text-accent">Job Description</span>
          </h1>
          <p className="hero-subtitle">
            Upload your resume, paste the target role, and let AI rewrite your summary, align skills, optimize impact bullets, and maximize ATS compatibility in seconds.
          </p>
        </section>

        {/* Workflow Grid (Inputs) */}
        <section className="workflow-grid no-print">
          <JobDescriptionInput
            value={jobDescription}
            onChange={(val) => {
              setJobDescription(val);
              if (jdError) setJdError('');
            }}
            onSelectSample={(sampleText) => {
              setJobDescription(sampleText);
              if (jdError) setJdError('');
              showToast('Sample job description loaded!');
            }}
            sampleJds={sampleJds}
            error={jdError}
          />

          <ResumeUploader
            resumeText={resumeText}
            fileName={fileName}
            fileSize={fileSize}
            onParsed={(data) => {
              setResumeText(data.text);
              setFileName(data.fileName);
              setFileSize(data.fileSize);
              if (resumeError) setResumeError('');
              showToast(`Loaded ${data.fileName}`);
            }}
            onClear={() => {
              setResumeText('');
              setFileName('');
              setFileSize(0);
            }}
            sampleResumes={sampleResumes}
            error={resumeError}
            onError={setResumeError}
          />
        </section>

        {/* Customization Options Bar */}
        <section className="no-print">
          <CustomizationOptions
            selectedSections={selectedSections}
            onToggleSection={handleToggleSection}
            tone={tone}
            onToneChange={setTone}
            focusKeywords={focusKeywords}
            onFocusKeywordsChange={setFocusKeywords}
          />
        </section>

        {/* Primary Action Button */}
        <section className="cta-container no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              id="customize-resume-btn"
              onClick={handleCustomize}
              disabled={isCustomizing}
              className="btn-primary"
            >
              <Wand2 size={20} className={isCustomizing ? 'animate-spin' : ''} />
              <span>{isCustomizing ? 'Analyzing & Tailoring Resume...' : 'Customize Resume with AI'}</span>
            </button>

            {(jobDescription || resumeText) && (
              <button
                onClick={handleClearAll}
                className="btn-ghost"
                title="Reset all inputs"
                style={{ fontSize: '0.9rem' }}
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </section>

        {/* Multi-stage Progress Stepper */}
        {isCustomizing && (
          <section className="stepper-banner no-print">
            <div className="stepper-header">
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>AI Customization Pipeline</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)' }}>Processing...</span>
            </div>
            <div className="stepper-track">
              <div className={`step-card ${customizationStep >= 1 ? (customizationStep > 1 ? 'completed' : 'active') : ''}`}>
                <span>1. Parsing JD & Extracting Keywords</span>
              </div>
              <div className={`step-card ${customizationStep >= 2 ? (customizationStep > 2 ? 'completed' : 'active') : ''}`}>
                <span>2. Aligning Candidate Skills & Summary</span>
              </div>
              <div className={`step-card ${customizationStep >= 3 ? (customizationStep > 3 ? 'completed' : 'active') : ''}`}>
                <span>3. Rephrasing Impact Bullets (X-Y-Z)</span>
              </div>
              <div className={`step-card ${customizationStep >= 4 ? 'active' : ''}`}>
                <span>4. Computing ATS Score & Diff Analysis</span>
              </div>
            </div>
          </section>
        )}

        {/* Results Section */}
        {customResult && (
          <section id="results-section" className="results-container">
            {/* Top Metrics Bar */}
            <div className="no-print">
              <MetricsBar
                matchScore={customResult.matchScore}
                atsEvaluation={atsEvaluation}
              />
            </div>

            {/* Navigation Tabs Header */}
            <div className="tabs-header no-print">
              <div className="tabs-group">
                <button
                  id="tab-tailored-resume"
                  className={`tab-btn ${activeTab === 'resume' ? 'active' : ''}`}
                  onClick={() => setActiveTab('resume')}
                >
                  <FileText size={16} />
                  <span>Tailored Resume</span>
                </button>

                <button
                  id="tab-diff-view"
                  className={`tab-btn ${activeTab === 'diff' ? 'active' : ''}`}
                  onClick={() => setActiveTab('diff')}
                >
                  <GitCompare size={16} />
                  <span>Diff View ({diffData?.stats?.totalChanges || 0} Changes)</span>
                </button>

                <button
                  id="tab-ats-audit"
                  className={`tab-btn ${activeTab === 'ats' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ats')}
                >
                  <ShieldCheck size={16} />
                  <span>ATS Readiness Breakdown</span>
                </button>
              </div>

              <button
                id="generate-cover-letter-btn"
                onClick={() => setIsCoverLetterOpen(true)}
                className="btn-secondary"
                style={{
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
                  borderColor: 'rgba(168, 85, 247, 0.4)',
                  color: '#e9d5ff'
                }}
              >
                <Mail size={16} />
                <span>Generate Cover Letter</span>
              </button>
            </div>

            {/* Tab 1: Tailored Resume View */}
            {activeTab === 'resume' && (
              <ResumeDisplay
                customizedData={customResult}
                originalText={resumeText}
                onShowToast={showToast}
              />
            )}

            {/* Tab 2: Diff View */}
            {activeTab === 'diff' && (
              <DiffViewer diffData={diffData} />
            )}

            {/* Tab 3: ATS Audit Breakdown */}
            {activeTab === 'ats' && (
              <AtsBreakdown atsEvaluation={atsEvaluation} />
            )}
          </section>
        )}
      </main>

      {/* Cover Letter Generator Modal */}
      <CoverLetterModal
        isOpen={isCoverLetterOpen}
        onClose={() => setIsCoverLetterOpen(false)}
        resumeText={resumeText}
        jobDescription={jobDescription}
        customizedResume={customResult?.fullCustomizedResumeMarkdown}
        defaultCompany={customResult?.companyName}
        onShowToast={showToast}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onShowToast={showToast}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-msg">
          <CheckCircle2 size={18} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
