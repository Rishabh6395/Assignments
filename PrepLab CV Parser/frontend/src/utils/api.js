const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
  : (typeof window !== 'undefined' ? '/backend-api' : 'http://localhost:5000/api');

/**
 * Retrieves API key & provider settings from localStorage if stored
 */
export function getSavedApiSettings() {
  if (typeof window === 'undefined') return { provider: 'gemini', apiKey: '' };
  try {
    const saved = localStorage.getItem('preplab_api_settings');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load api settings', e);
  }
  return { provider: 'gemini', apiKey: '' };
}

export function saveApiSettings(settings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('preplab_api_settings', JSON.stringify(settings));
}

/**
 * Health check
 */
export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  } catch (err) {
    console.error('Health check failed:', err);
    return { status: 'error', message: err.message };
  }
}

/**
 * Fetch sample JDs and Resumes
 */
export async function fetchSampleData() {
  const res = await fetch(`${API_BASE}/sample-data`);
  if (!res.ok) throw new Error('Failed to fetch sample data');
  return await res.json();
}

/**
 * Upload and parse resume file (PDF or DOCX)
 */
export async function uploadResumeFile(file) {
  const formData = new FormData();
  formData.append('resume', file);

  const res = await fetch(`${API_BASE}/parse-resume`, {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to parse resume file');
  }
  return data;
}

/**
 * Customize resume with LLM & ATS optimizer
 */
export async function customizeResume(payload) {
  const { provider, apiKey } = getSavedApiSettings();

  const res = await fetch(`${API_BASE}/customize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'x-api-key': apiKey } : {}),
      ...(provider ? { 'x-provider': provider } : {})
    },
    body: JSON.stringify({
      ...payload,
      provider: payload.provider || provider,
      apiKey: payload.apiKey || apiKey
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to customize resume');
  }
  return data;
}

/**
 * Generate tailored cover letter
 */
export async function generateCoverLetter(payload) {
  const { provider, apiKey } = getSavedApiSettings();

  const res = await fetch(`${API_BASE}/generate-cover-letter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'x-api-key': apiKey } : {}),
      ...(provider ? { 'x-provider': provider } : {})
    },
    body: JSON.stringify({
      ...payload,
      provider: payload.provider || provider,
      apiKey: payload.apiKey || apiKey
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to generate cover letter');
  }
  return data;
}

/**
 * Export customized resume as DOCX
 */
export async function downloadDocx(resumeData) {
  const res = await fetch(`${API_BASE}/export-docx`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(resumeData)
  });

  if (!res.ok) throw new Error('Failed to download DOCX document');

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(resumeData.targetRole || 'Customized_Resume').replace(/\s+/g, '_')}.docx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
