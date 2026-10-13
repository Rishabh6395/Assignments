require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const { parsePdf, parseDocx, cleanText, detectSections } = require('./services/parserService');
const { customizeResume, generateCoverLetter } = require('./services/llmService');
const { computeDiff } = require('./utils/diffHelper');
const { evaluateAtsScore } = require('./utils/atsScorer');
const { generateDocx } = require('./services/exportService');
const { SAMPLE_JOB_DESCRIPTIONS, SAMPLE_RESUMES } = require('./data/samples');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-provider']
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Multer memory storage configuration (10MB limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.pdf', '.docx'];
    if (allowed.includes(ext) || file.mimetype.includes('pdf') || file.mimetype.includes('word')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX documents are supported.'));
    }
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    configuredProviders: {
      gemini: !!process.env.GEMINI_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      groq: !!process.env.GROQ_API_KEY
    }
  });
});

// Get Sample Data (for instant testing)
app.get('/api/sample-data', (req, res) => {
  res.json({
    jobDescriptions: SAMPLE_JOB_DESCRIPTIONS,
    resumes: SAMPLE_RESUMES
  });
});

// Parse Resume Endpoint (PDF / DOCX)
app.post('/api/parse-resume', upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a resume file (PDF or DOCX).' });
    }

    const { originalname, size, buffer, mimetype } = req.file;
    const ext = path.extname(originalname).toLowerCase();

    let rawText = '';
    if (ext === '.pdf' || mimetype.includes('pdf')) {
      rawText = await parsePdf(buffer);
    } else if (ext === '.docx' || mimetype.includes('word') || mimetype.includes('officedocument')) {
      rawText = await parseDocx(buffer);
    } else {
      return res.status(400).json({ error: 'Unsupported file extension. Please provide .pdf or .docx' });
    }

    const cleanedText = cleanText(rawText);

    if (!cleanedText || cleanedText.length < 30) {
      return res.status(422).json({
        error: 'Unable to extract legible text from this file. Ensure the PDF contains searchable text rather than scanned images.'
      });
    }

    const parsedDetails = detectSections(cleanedText);

    return res.json({
      success: true,
      fileName: originalname,
      fileSize: size,
      text: cleanedText,
      ...parsedDetails
    });
  } catch (err) {
    next(err);
  }
});

// Resume Customization Endpoint
app.post('/api/customize', async (req, res, next) => {
  try {
    const {
      resumeText,
      jobDescription,
      sectionsToCustomize = ['summary', 'skills', 'experience', 'projects'],
      tone = 'impact-driven',
      focusKeywords = '',
      provider,
      apiKey
    } = req.body;

    // Validation
    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ error: 'Resume text is required and must be at least 50 characters.' });
    }
    if (!jobDescription || jobDescription.trim().length < 50) {
      return res.status(400).json({ error: 'Job description is required and must be at least 50 characters.' });
    }

    // Call LLM customizer
    const customResult = await customizeResume({
      resumeText,
      jobDescription,
      sectionsToCustomize,
      tone,
      focusKeywords,
      provider: provider || req.headers['x-provider'] || 'gemini',
      apiKey: apiKey || req.headers['x-api-key'] || null
    });

    // Evaluate ATS & keyword match metrics
    const atsEvaluation = evaluateAtsScore(
      resumeText,
      customResult.fullCustomizedResumeMarkdown || '',
      jobDescription
    );

    // Compute exact diffs between original and customized
    const diff = computeDiff(
      resumeText,
      customResult.fullCustomizedResumeMarkdown || ''
    );

    // Merge match score if not provided
    if (!customResult.matchScore) {
      customResult.matchScore = {
        before: atsEvaluation.originalMatchRate,
        after: atsEvaluation.customizedMatchRate,
        reasoning: 'Realigned candidate experience bullets with target JD keywords and quantified achievements.'
      };
    }

    // Return comprehensive customized package
    return res.json({
      success: true,
      customized: customResult,
      diff,
      atsEvaluation,
      metadata: {
        timestamp: new Date().toISOString(),
        originalLength: resumeText.length,
        customizedLength: (customResult.fullCustomizedResumeMarkdown || '').length
      }
    });
  } catch (err) {
    next(err);
  }
});

// Cover Letter Generator Endpoint
app.post('/api/generate-cover-letter', async (req, res, next) => {
  try {
    const {
      resumeText,
      jobDescription,
      customizedResume,
      companyName,
      hiringManager,
      provider,
      apiKey
    } = req.body;

    if (!jobDescription || jobDescription.trim().length < 30) {
      return res.status(400).json({ error: 'A job description is required to generate a cover letter.' });
    }

    const coverLetter = await generateCoverLetter({
      resumeText,
      jobDescription,
      customizedResume,
      companyName,
      hiringManager,
      provider: provider || req.headers['x-provider'] || 'gemini',
      apiKey: apiKey || req.headers['x-api-key'] || null
    });

    return res.json({
      success: true,
      coverLetter
    });
  } catch (err) {
    next(err);
  }
});

// DOCX Export Endpoint
app.post('/api/export-docx', async (req, res, next) => {
  try {
    const resumeData = req.body;
    const docBuffer = await generateDocx(resumeData);

    const filename = `${(resumeData.candidateName || 'Tailored_Resume').replace(/\s+/g, '_')}_Tailored.docx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(docBuffer);
  } catch (err) {
    next(err);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds 10MB limit. Please upload a smaller file.' });
    }
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  }
  return res.status(err.status || 500).json({
    error: err.message || 'Internal server error occurred.'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
});
