const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extracts raw text from PDF buffer
 * @param {Buffer} buffer 
 * @returns {Promise<string>}
 */
async function parsePdf(buffer) {
  try {
    if (pdfParse && pdfParse.PDFParse) {
      const uint8 = new Uint8Array(buffer);
      const parser = new pdfParse.PDFParse(uint8);
      const res = await parser.getText();
      return res?.text || '';
    } else if (typeof pdfParse === 'function') {
      const data = await pdfParse(buffer);
      return data.text || '';
    } else {
      throw new Error('Unsupported pdf-parse interface');
    }
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

/**
 * Extracts raw text from DOCX buffer
 * @param {Buffer} buffer 
 * @returns {Promise<string>}
 */
async function parseDocx(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } catch (error) {
    throw new Error(`Failed to parse DOCX: ${error.message}`);
  }
}

/**
 * Normalizes and cleans extracted resume text
 * @param {string} text 
 * @returns {string}
 */
function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \u00a0]+/g, ' ') // normalize spaces and non-breaking spaces
    .replace(/\n{3,}/g, '\n\n') // collapse multiple blank lines
    .trim();
}

/**
 * Basic heuristic section parser to detect sections in a resume
 * @param {string} text 
 * @returns {object}
 */
function detectSections(text) {
  const sections = {
    contact: '',
    summary: '',
    skills: '',
    experience: '',
    education: '',
    projects: '',
    certifications: '',
    raw: text
  };

  const lines = text.split('\n');
  let currentSection = 'summary';

  // Heuristic keywords
  const sectionKeywords = [
    { key: 'summary', regex: /^(professional\s+summary|summary|profile|about\s+me|objective)/i },
    { key: 'skills', regex: /^(skills|technical\s+skills|core\s+competencies|technologies|expertise)/i },
    { key: 'experience', regex: /^(experience|work\s+experience|employment\s+history|professional\s+experience)/i },
    { key: 'education', regex: /^(education|academic\s+background|degrees)/i },
    { key: 'projects', regex: /^(projects|personal\s+projects|key\s+projects)/i },
    { key: 'certifications', regex: /^(certifications|licenses|courses)/i }
  ];

  // Try extracting email & phone
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/);

  const contactInfo = {
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0] : null
  };

  const sectionBuffers = {
    summary: [],
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: []
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let matchedSection = null;
    for (const { key, regex } of sectionKeywords) {
      if (regex.test(trimmed) && trimmed.length < 40) {
        matchedSection = key;
        break;
      }
    }

    if (matchedSection) {
      currentSection = matchedSection;
    } else if (sectionBuffers[currentSection]) {
      sectionBuffers[currentSection].push(trimmed);
    }
  }

  for (const key of Object.keys(sectionBuffers)) {
    sections[key] = sectionBuffers[key].join('\n');
  }

  return {
    sections,
    contactInfo,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    characterCount: text.length
  };
}

module.exports = {
  parsePdf,
  parseDocx,
  cleanText,
  detectSections
};
