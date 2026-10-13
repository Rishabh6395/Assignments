import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1
};

export const metadata = {
  title: "PrepLab Resume Customizer | AI-Powered JD Matcher & ATS Optimizer",
  description: "Intelligently tailor your resume to any job description. Instant ATS keyword matching, impact bullet rewriting, cover letter generation, and side-by-side diff analysis.",
  keywords: ["resume customizer", "ATS optimizer", "job description matcher", "AI resume builder", "career tools"],
  authors: [{ name: "PrepLab AI" }]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="app-shell">
          {children}
        </div>
      </body>
    </html>
  );
}
