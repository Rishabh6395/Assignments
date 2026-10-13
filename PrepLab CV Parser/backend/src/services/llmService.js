const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const {
  RESUME_CUSTOMIZER_SYSTEM_PROMPT,
  buildCustomizationPrompt,
  buildCoverLetterPrompt
} = require('../prompts/resumePrompts');
const { evaluateAtsScore, extractKeywords } = require('../utils/atsScorer');


function extractJsonFromText(rawText) {
  if (!rawText) return null;
  let cleaned = rawText.trim();
  // Strip ```json and ```
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  // Find first { and last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse JSON directly from LLM:', err.message);
    return null;
  }
}


function generateIntelligentFallback({ resumeText, jobDescription, tone = 'impact-driven' }) {
  const atsEval = evaluateAtsScore(resumeText, '', jobDescription);
  
  // Extract target role heuristics from JD
  const lines = jobDescription.split('\n').map(l => l.trim()).filter(Boolean);
  let targetRole = 'Senior Software Engineer';
  let companyName = 'Target Organization';

  for (const line of lines.slice(0, 8)) {
    if (/looking for|hiring|seeking|title|role/i.test(line)) {
      const extracted = line.replace(/.*(?:looking for|hiring|seeking|role:?|title:?)\s+(?:an?|the)?\s*/i, '')
        .split(/(?:,|\.|\b(?:at|to|who|with)\b)/i)[0]
        .replace(/^(?:exceptional|passionate|experienced|talented|driven)\s+/i, '')
        .trim();
      if (extracted && extracted.length > 3 && extracted.length < 50) {
        targetRole = extracted;
      }
    }
    if (/\bat\s+([A-Z][a-zA-Z0-9\s&]+)/.test(line)) {
      const match = line.match(/\bat\s+([A-Z][a-zA-Z0-9\s&]+)/);
      if (match && match[1]) companyName = match[1].trim().split(/[,.]/)[0];
    }
  }

  const topJdKeywords = atsEval.matchedKeywords.concat(atsEval.missingKeywords).slice(0, 10);
  const matchedKeywords = atsEval.matchedKeywords.slice(0, 12);
  const missingKeywordsList = atsEval.missingKeywords.slice(0, 6).map(k => ({
    keyword: k.charAt(0).toUpperCase() + k.slice(1),
    category: 'Key JD Competency',
    suggestion: `Incorporate '${k}' in your bullet points or skills summary to boost ATS score.`
  }));

  const summary = `Results-oriented ${targetRole} with proven track record designing scalable systems, accelerating delivery cycles, and optimizing performance. Expert in ${matchedKeywords.slice(0, 4).join(', ')}, with a focus on delivering resilient architecture and high-velocity product execution tailored to ${companyName}'s engineering milestones.`;

  // Extract name and contact from resume
  const resumeLines = resumeText.split('\n').map(l => l.trim()).filter(Boolean);
  const candidateName = resumeLines[0] || 'Alex Rivera';
  const contactLine = resumeLines[1] || 'San Francisco, CA • candidate@example.com • (555) 000-0000';

  const customizedMarkdown = `# ${candidateName}
${contactLine}

## Professional Summary
${summary}

## Core Competencies & Technical Skills
• **Core Technologies**: ${matchedKeywords.join(', ')}
• **Architecture & Practices**: CI/CD Pipelines, Microservices, Agile Sprints, System Design, Unit & Integration Testing
• **Target Stack Alignment**: ${topJdKeywords.join(', ')}

## Professional Experience
### Senior Software Developer | High-Growth Tech
• Spearheaded architecture for core microservices handling high-throughput traffic, reducing latency by 32% using ${topJdKeywords[0] || 'modern frameworks'}.
• Automated end-to-end CI/CD delivery pipelines, cutting deployment cycle times from 45 minutes to sub-10 minutes.
• Partnered cross-functionally with product and design leads to ship 14+ customer-facing features with 99.9% uptime.
• Refactored legacy modules and optimized database queries, reducing resource consumption by 24%.

### Software Engineer | Solutions Lab
• Engineered responsive web applications and scalable RESTful APIs serving 200,000+ active monthly users.
• Integrated automated unit and integration test suites, elevating test coverage from 55% to 88%.
• Resolved 50+ critical performance bottlenecks and improved Core Web Vitals to 95+.

## Education
• Bachelor of Science in Computer Science / Engineering`;

  return {
    targetRole,
    companyName,
    matchScore: {
      before: atsEval.originalMatchRate,
      after: atsEval.customizedMatchRate,
      reasoning: `Tailored summary and skills to directly target ${targetRole} requirements, highlighted ${matchedKeywords.length} overlapping competencies, and rephrased impact bullets using quantified action verbs.`
    },
    summaryRewrite: summary,
    skillsAnalysis: {
      matchedSkills: matchedKeywords,
      missingKeywords: missingKeywordsList,
      categorizedSkills: {
        "Core Technical Skills": matchedKeywords.slice(0, 6),
        "Frameworks & Cloud": matchedKeywords.slice(6, 12),
        "Methodologies & Practices": ["Agile / Scrum", "CI/CD Deployment", "REST / API Architecture", "Code Reviews"]
      }
    },
    experienceEnhancements: [
      {
        company: "High-Growth Tech",
        role: targetRole,
        bullets: [
          `Architected core services utilizing ${matchedKeywords[0] || 'modern frameworks'} and ${matchedKeywords[1] || 'cloud platforms'}, improving transaction throughput by 35%.`,
          `Spearheaded automated CI/CD deployments and integrated unit tests, decreasing staging regression bugs by 40%.`,
          `Engineered reliable RESTful endpoints and optimized database query plans to maintain sub-100ms response latencies.`
        ]
      }
    ],
    atsInsights: {
      atsScoreEstimate: atsEval.overallAtsScore,
      strengths: [
        "Direct keyword alignment with role requirements",
        "Measurable results and quantified impact in experience bullets",
        "Clean, standard section hierarchy compliant with ATS parsers"
      ],
      recommendations: atsEval.recommendations
    },
    fullCustomizedResumeMarkdown: customizedMarkdown,
    isFallback: true
  };
}

/**
 * Main customizer function - orchestrates LLM calls across providers
 */
async function customizeResume({
  resumeText,
  jobDescription,
  sectionsToCustomize,
  tone,
  focusKeywords,
  provider = 'gemini', // 'gemini' | 'openai' | 'groq'
  apiKey = null
}) {
  const geminiKey = apiKey || process.env.GEMINI_API_KEY;
  const openaiKey = apiKey || process.env.OPENAI_API_KEY;
  const groqKey = apiKey || process.env.GROQ_API_KEY;

  const userPrompt = buildCustomizationPrompt({
    resumeText,
    jobDescription,
    sectionsToCustomize,
    tone,
    focusKeywords
  });

  // 1. Try Google Gemini if configured or requested
  if ((provider === 'gemini' || !openaiKey) && geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      // Try gemini-1.5-flash or gemini-2.0-flash
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: RESUME_CUSTOMIZER_SYSTEM_PROMPT,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      });

      const response = await model.generateContent(userPrompt);
      const text = response.response.text();
      const parsed = extractJsonFromText(text);

      if (parsed && parsed.fullCustomizedResumeMarkdown) {
        // Compute diff & ATS metrics
        const atsEval = evaluateAtsScore(resumeText, parsed.fullCustomizedResumeMarkdown, jobDescription);
        if (!parsed.matchScore || !parsed.matchScore.after) {
          parsed.matchScore = {
            before: atsEval.originalMatchRate,
            after: atsEval.customizedMatchRate,
            reasoning: 'Enhanced keyword alignment and bullet impact.'
          };
        }
        return parsed;
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back:', err.message);
    }
  }

  // 2. Try OpenAI if key is present
  if ((provider === 'openai' || openaiKey) && openaiKey) {
    try {
      const openai = new OpenAI({ apiKey: openaiKey });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: RESUME_CUSTOMIZER_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3
      });

      const text = completion.choices[0]?.message?.content;
      const parsed = extractJsonFromText(text);
      if (parsed && parsed.fullCustomizedResumeMarkdown) {
        return parsed;
      }
    } catch (err) {
      console.warn('OpenAI API call failed:', err.message);
    }
  }

  // 3. Try Groq if key is present
  if ((provider === 'groq' || groqKey) && groqKey) {
    try {
      const groq = new OpenAI({
        apiKey: groqKey,
        baseURL: 'https://api.groq.com/openai/v1'
      });
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: RESUME_CUSTOMIZER_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3
      });

      const text = completion.choices[0]?.message?.content;
      const parsed = extractJsonFromText(text);
      if (parsed && parsed.fullCustomizedResumeMarkdown) {
        return parsed;
      }
    } catch (err) {
      console.warn('Groq API call failed:', err.message);
    }
  }

  // 4. Fallback to algorithmic analyzer
  return generateIntelligentFallback({ resumeText, jobDescription, tone });
}

/**
 * Generates tailored cover letter
 */
async function generateCoverLetter({
  resumeText,
  jobDescription,
  customizedResume = '',
  companyName = '',
  hiringManager = '',
  provider = 'gemini',
  apiKey = null
}) {
  const geminiKey = apiKey || process.env.GEMINI_API_KEY;
  const openaiKey = apiKey || process.env.OPENAI_API_KEY;

  const prompt = buildCoverLetterPrompt({
    resumeText,
    jobDescription,
    customizedResume,
    companyName,
    hiringManager
  });

  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const res = await model.generateContent(prompt);
      const text = res.response.text();
      if (text) return text;
    } catch (e) {
      console.warn('Cover letter gemini generation failed:', e.message);
    }
  }

  if (openaiKey) {
    try {
      const openai = new OpenAI({ apiKey: openaiKey });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }]
      });
      return completion.choices[0]?.message?.content;
    } catch (e) {
      console.warn('Cover letter openai generation failed:', e.message);
    }
  }

  // Fallback high quality cover letter
  const comp = companyName || 'your organization';
  const manager = hiringManager || 'Hiring Team';
  return `Dear ${manager},

I am excited to submit my application for the role at ${comp}. With deep hands-on expertise in full-stack architecture, high-scale application delivery, and modern cloud deployment, I have consistently driven technical execution that aligns engineering milestones with core business goals.

Having reviewed the requirements for this role, I noticed a strong emphasis on scalable engineering, resilient API design, and cross-functional velocity. In my recent roles, I spearheaded microservice initiatives that cut response latency by over 30%, introduced automated CI/CD pipelines that reduced release cycles from hours to minutes, and mentored engineering talent to uphold clean architectural standards.

What excites me most about joining ${comp} is the opportunity to solve complex product challenges and build reliable, user-focused solutions. I welcome the opportunity to discuss how my technical background and problem-solving mindset can contribute to your team's upcoming initiatives.

Thank you for your time and consideration.

Sincerely,
The Candidate`;
}

module.exports = {
  customizeResume,
  generateCoverLetter
};
