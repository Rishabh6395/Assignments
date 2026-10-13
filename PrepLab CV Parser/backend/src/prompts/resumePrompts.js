/**
 * System and User Prompts for Resume Customization and Cover Letter Generation
 */

const RESUME_CUSTOMIZER_SYSTEM_PROMPT = `You are an elite Executive Career Strategist and Senior Technical Recruiter with 15+ years of experience placing candidates at Fortune 500 companies and high-growth tech startups.
Your specialty is tailoring candidate resumes to perfectly align with specific Job Descriptions (JDs) while preserving absolute honesty and authenticity (never inventing fake jobs, degrees, or false credentials).

When tailoring a resume:
1. TARGETED SUMMARY: Write an impactful 3-4 line professional summary tailored specifically to the target role and company mentioned in the JD.
2. RELEVANT SKILLS: Curate and organize skills into clean categories (e.g. Core Languages, Frameworks & Libraries, Cloud & DevOps, Architecture & Methodologies). Highlight skills from the candidate's background that directly match the JD.
3. BULLET POINT ENHANCEMENT: Rephrase and reorder experience bullet points using the Google X-Y-Z formula ("Accomplished [X] measured by [Y] by doing [Z]"). Weave in relevant keywords, methodologies, and terminology from the JD naturally without keyword stuffing.
4. MISSING KEYWORDS & SKILLS: Identify 4-8 keywords from the JD that are not currently in the resume, along with constructive advice on where the candidate could legitimately incorporate them if they have relevant experience.
5. MATCH SCORE ESTIMATION: Estimate match rate (%) before and after customization based on keyword and semantic qualification alignment.
6. ATS COMPATIBILITY: Ensure the formatting uses clean standard markdown without complex tables or graphics that trip up ATS parsers.

You MUST respond strictly with a valid JSON object matching the requested schema. No markdown code blocks around the JSON if possible, or clean standard JSON.`;

/**
 * Builds user prompt for resume customization
 */
function buildCustomizationPrompt({
  resumeText,
  jobDescription,
  sectionsToCustomize = ['summary', 'skills', 'experience', 'projects'],
  tone = 'impact-driven', // 'impact-driven' | 'technical' | 'executive'
  focusKeywords = ''
}) {
  return `JOB DESCRIPTION:
"""
${jobDescription.trim()}
"""

CANDIDATE'S ORIGINAL RESUME:
"""
${resumeText.trim()}
"""

CUSTOMIZATION DIRECTIVES:
- Tone Style: ${tone} (use crisp, action-oriented verbs, strong metric indicators, and professional tone).
- Sections to prioritize customizing: ${sectionsToCustomize.join(', ')}.
${focusKeywords ? `- Prioritize matching these specific keywords: ${focusKeywords}` : ''}

Please analyze both documents and return a JSON object with EXACTLY the following structure:
{
  "targetRole": "Extracted target job title from JD",
  "companyName": "Extracted target company name (or 'Target Company' if unspecified)",
  "matchScore": {
    "before": 58,
    "after": 92,
    "reasoning": "Brief 1-2 sentence explanation of why the match score improved."
  },
  "summaryRewrite": "The customized, compelling 3-4 sentence professional summary tailored to the JD.",
  "skillsAnalysis": {
    "matchedSkills": ["skill1", "skill2", "skill3"],
    "missingKeywords": [
      { "keyword": "Keyword Name", "category": "Technical | Soft Skill | Tool", "suggestion": "Where and how to add it if candidate has experience" }
    ],
    "categorizedSkills": {
      "Core Competencies": ["skill A", "skill B"],
      "Technologies & Tools": ["tech 1", "tech 2"],
      "Leadership & Practices": ["practice 1"]
    }
  },
  "experienceEnhancements": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "bullets": [
        "Rephrased bullet point with strong action verb and quantified outcome.",
        "Second optimized bullet point highlighting JD keyword."
      ]
    }
  ],
  "atsInsights": {
    "atsScoreEstimate": 94,
    "strengths": ["Clear section headers", "Strong action verbs", "High keyword density for target role"],
    "recommendations": ["Recommendation 1", "Recommendation 2"]
  },
  "fullCustomizedResumeMarkdown": "# Full Candidate Name\\nCity, State • email@example.com • (555) 000-0000 • linkedin.com/in/profile\\n\\n## Professional Summary\\n...\\n\\n## Core Skills\\n...\\n\\n## Professional Experience\\n...\\n\\n## Education & Certifications\\n..."
}

Ensure all JSON keys exist and the JSON is strictly valid.`;
}

/**
 * Builds prompt for Cover Letter generation
 */
function buildCoverLetterPrompt({
  resumeText,
  jobDescription,
  customizedResume = '',
  hiringManager = 'Hiring Team',
  companyName = ''
}) {
  return `You are an expert career advisor. Write a compelling, highly personalized, and persuasive Cover Letter for the candidate applying to the following position.

JOB DESCRIPTION:
"""
${jobDescription.trim()}
"""

CANDIDATE RESUME / BACKGROUND:
"""
${(customizedResume || resumeText).trim()}
"""

DETAILS:
- Hiring Manager: ${hiringManager || 'Hiring Manager'}
- Target Company: ${companyName || 'the hiring organization'}

GUIDELINES:
1. Professional format (Opening hook, 2-3 body paragraphs highlighting relevant achievements that solve the company's stated challenges, and confident closing call-to-action).
2. Avoid generic clichés like "I am writing to express my interest". Start with an engaging narrative or value-driven hook.
3. Incorporate key metrics, methodologies, and technical competencies from their resume that address the JD's requirements.
4. Output standard Markdown format ready to copy or download.`;
}

module.exports = {
  RESUME_CUSTOMIZER_SYSTEM_PROMPT,
  buildCustomizationPrompt,
  buildCoverLetterPrompt
};
