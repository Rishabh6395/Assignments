# PrepLab AI Resume Customizer & ATS Matcher

> An intelligent, production-ready web application that takes a Job Description (JD) and a candidate's resume (PDF or DOCX), analyzes semantic overlap and keyword density using LLMs, and tailors the resume with high-impact bullets, optimized skills, and ATS alignment.

---

## 🌟 Overview & Key Highlights

Job seekers frequently struggle to customize resumes for different roles, leading to low response rates from Applicant Tracking Systems (ATS) and recruiters. **PrepLab Resume Customizer** solves this with an end-to-end pipeline:

1. **Job Description Parsing & Keyword Extraction**: Extracts role expectations, technical proficiencies, and domain competencies.
2. **Deep Resume Ingestion**: Parses raw text and structured data from **PDF** and **DOCX** files with metadata detection (contact info, sections, word counts).
3. **LLM-Powered Tailoring Engine**:
   - Rewrites professional summaries to directly target the role.
   - Highlights and categorizes overlapping core skills.
   - Reorders and rephrases experience bullets using the **Google X-Y-Z formula** (*Accomplished [X] measured by [Y] by doing [Z]*).
   - Uncovers missing keywords from the JD and suggests contextual placement.
4. **Interactive Diff Analysis**: Visual word-level and line-level diff highlighting changes made to the resume.
5. **ATS Compatibility Audit**: 100-point scoring model evaluating section headers, contact credentials, keyword density, and quantifiable metrics.
6. **AI Cover Letter Generator**: Generates a tailored cover letter customized to the specific company and role.
7. **Multi-Format Export**: One-click download as clean **Print-to-PDF**, **Microsoft Word (.docx)**, or **Plain Text (.txt)**.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Next.js Frontend                     │
│  - Modern obsidian glassmorphism UI & micro-animations │
│  - JD input with sample quick-load chips               │
│  - Drag-and-drop PDF & DOCX upload zone                │
│  - Real-time multi-stage pipeline animation            │
│  - Visual Match Gauge & ATS Audit dashboard            │
│  - Word & Line Diff Viewer                             │
│  - Export Toolbar (Print-ready PDF, DOCX, TXT)         │
│  - Cover Letter generator & LLM Settings modal         │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ REST API calls (JSON & Multipart)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Express Backend                      │
│  - Multer memory storage file ingestion (10MB limit)   │
│  - PDF parsing (pdf-parse v2) & DOCX (mammoth)         │
│  - Prompt Engineering & JSON schema enforcement        │
│  - Multi-Provider LLM orchestration (Gemini, OpenAI)   │
│  - Algorithmic fallback & simulation engine            │
│  - Diff analysis engine (diff)                         │
│  - 100-point ATS Heuristic Scorer (atsScorer.js)       │
│  - Dynamic Word DOCX generator (docx)                  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                     LLM Layer                          │
│  - Google Gemini (gemini-1.5-flash / gemini-2.0-flash) │
│  - OpenAI (gpt-4o-mini / gpt-4o)                       │
│  - Groq (llama-3.3-70b-versatile)                      │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **Next.js (React 19)** | App Router, modern SSR & client components, Lucide icons |
| **Styling** | **Vanilla CSS Design System** | Obsidian dark theme, glassmorphism, responsive CSS variables, print-to-PDF stylesheets |
| **Backend** | **Node.js + Express** | RESTful API, CORS, body parsers, file upload pipeline |
| **Resume Parsing** | **pdf-parse** & **mammoth** | High-reliability text extraction from PDF and DOCX |
| **Document Export** | **docx** | Programmatic generation of formatted Microsoft Word resumes |
| **Diff Engine** | **diff** | Word-level and line-level diff computation between original and tailored resume |
| **LLM Providers** | **Google Gemini** | Primary default (`gemini-1.5-flash`), with OpenAI & Groq support + algorithmic fallback |

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- **Node.js**: v18.0 or higher (v20+ recommended)
- **npm**: v9.0 or higher
- **Git**

---

### Step 1: Clone the Repository
```bash
git clone <YOUR_REPO_URL>
cd "PrepLab CV Parser"
```

---

### Step 2: Backend Setup
```bash
cd backend
npm install
```

Configure your environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your API key (at least one):
```env
PORT=5000

# Google Gemini API Key (Get a free key from https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional Alternative Providers
OPENAI_API_KEY=
GROQ_API_KEY=
```

> **Note**: Even if no API key is set initially, the application features an intelligent heuristic fallback analyzer so all parsing, match scores, diff comparisons, and DOCX exports run smoothly for evaluation! You can also enter an API key directly in the frontend UI via **LLM Settings**.

Start the backend server:
```bash
npm start
# Server runs on http://localhost:5000
```

---

### Step 3: Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```

Start the Next.js development server:
```bash
npm run dev
# Frontend runs on http://localhost:3000
```

Open your browser and navigate to `http://localhost:3000`.

---

## 💡 How to Use the Application

1. **Paste Job Description**:
   - Paste the target job description into the left card, or click one of the pre-loaded **Try Sample** chips (e.g. *Senior Full Stack* or *Lead DevOps*).
2. **Upload Resume**:
   - Drag and drop your `.pdf` or `.docx` resume into the right card, or click one of the **Load Sample** chips (*Alex Rivera* or *Marcus Vance*).
3. **Select Customization Preferences**:
   - Toggle which sections to tailor (*Summary*, *Skills*, *Experience*, *Projects*).
   - Select your desired tone (*Impact-Driven*, *Technical*, or *Executive*).
   - Optionally add high-priority focus keywords.
4. **Click "Customize Resume with AI"**:
   - Watch the multi-stage pipeline process your resume.
5. **Inspect & Download**:
   - View the **Match Score** and **ATS Compatibility Grade**.
   - Review missing keyword suggestions.
   - Switch between **Tailored Resume**, **Diff View**, and **ATS Breakdown** tabs.
   - Export as **Download PDF**, **Download DOCX**, or **Plain Text**.
   - Click **Generate Cover Letter** to create a tailored letter.

---

## 📦 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check and configured LLM provider status |
| `GET` | `/api/sample-data` | Retrieves pre-loaded sample JDs and sample resumes |
| `POST` | `/api/parse-resume` | Multipart upload for PDF/DOCX; extracts text, sections, and contact info |
| `POST` | `/api/customize` | Tailors resume against JD; returns structured resume, match score, diffs, and ATS audit |
| `POST` | `/api/generate-cover-letter` | Generates a targeted cover letter for the role and company |
| `POST` | `/api/export-docx` | Generates a styled Microsoft Word `.docx` file for download |

---

## 🌐 Deployment Guidelines

### Option A: Frontend on Vercel & Backend on Render / Railway
1. **Frontend (Vercel)**:
   - Root directory: `frontend`
   - Framework preset: Next.js
   - Environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`
2. **Backend (Render / Railway / GCP Cloud Run)**:
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment variables: `PORT=5000`, `GEMINI_API_KEY=your_key`

---

## ⚖️ Known Limitations & Trade-Offs

1. **Scanned PDF Documents**:
   - Resumes uploaded as pure raster images (scanned photocopies without OCR text layers) require an OCR engine (e.g. Tesseract) to extract text. Searchable vector PDFs work natively.
2. **LLM Rate Limits & Quotas**:
   - Free-tier API keys on Google AI Studio or OpenAI may face RPM (requests per minute) rate limits. The app handles this gracefully with built-in retry fallbacks and an algorithmic backup engine.
3. **Deterministic vs. Generative Scoring**:
   - ATS score is computed using a hybrid model: strict algorithmic parsing for keywords and section verification combined with LLM semantic qualification scoring for accurate assessment.

---

## 📄 License
MIT License. Built for PrepLab Career Intelligence Assignment.
