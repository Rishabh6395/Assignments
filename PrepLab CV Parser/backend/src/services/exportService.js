const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');

/**
 * Generates a clean, professionally formatted DOCX file from customized resume content
 * @param {object} resumeData 
 * @returns {Promise<Buffer>}
 */
async function generateDocx(resumeData) {
  const {
    candidateName = 'Candidate Name',
    contactLine = '',
    targetRole = '',
    summaryRewrite = '',
    skillsAnalysis = {},
    experienceEnhancements = [],
    fullCustomizedResumeMarkdown = ''
  } = resumeData;

  const docParagraphs = [];

  // Candidate Name Header
  docParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: candidateName.toUpperCase(),
          bold: true,
          size: 32, // 16pt
          color: '1E293B',
          font: 'Calibri'
        })
      ]
    })
  );

  // Contact Info
  if (contactLine) {
    docParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: contactLine,
            size: 20, // 10pt
            color: '64748B',
            font: 'Calibri'
          })
        ]
      })
    );
  }

  // Target Role Headline
  if (targetRole) {
    docParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: targetRole.toUpperCase(),
            bold: true,
            size: 22,
            color: '2563EB',
            font: 'Calibri'
          })
        ]
      })
    );
  }

  // Helper for Section Titles
  const addSectionTitle = (title) => {
    docParagraphs.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 24, // 12pt
            color: '0F172A',
            font: 'Calibri'
          })
        ]
      })
    );
  };

  // Professional Summary
  if (summaryRewrite) {
    addSectionTitle('Professional Summary');
    docParagraphs.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: summaryRewrite,
            size: 21,
            color: '334155',
            font: 'Calibri'
          })
        ]
      })
    );
  }

  // Skills
  if (skillsAnalysis && (skillsAnalysis.categorizedSkills || skillsAnalysis.matchedSkills)) {
    addSectionTitle('Core Competencies & Technical Skills');
    
    if (skillsAnalysis.categorizedSkills && Object.keys(skillsAnalysis.categorizedSkills).length > 0) {
      for (const [category, skills] of Object.entries(skillsAnalysis.categorizedSkills)) {
        if (Array.isArray(skills) && skills.length > 0) {
          docParagraphs.push(
            new Paragraph({
              spacing: { after: 80 },
              bullet: { level: 0 },
              children: [
                new TextRun({
                  text: `${category}: `,
                  bold: true,
                  size: 21,
                  color: '1E293B',
                  font: 'Calibri'
                }),
                new TextRun({
                  text: skills.join(', '),
                  size: 21,
                  color: '334155',
                  font: 'Calibri'
                })
              ]
            })
          );
        }
      }
    } else if (skillsAnalysis.matchedSkills && skillsAnalysis.matchedSkills.length > 0) {
      docParagraphs.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: skillsAnalysis.matchedSkills.join(' • '),
              size: 21,
              color: '334155',
              font: 'Calibri'
            })
          ]
        })
      );
    }
  }

  // Experience Enhancements
  if (experienceEnhancements && experienceEnhancements.length > 0) {
    addSectionTitle('Professional Experience');
    for (const exp of experienceEnhancements) {
      docParagraphs.push(
        new Paragraph({
          spacing: { before: 160, after: 60 },
          children: [
            new TextRun({
              text: exp.role || 'Software Engineer',
              bold: true,
              size: 22,
              color: '0F172A',
              font: 'Calibri'
            }),
            new TextRun({
              text: exp.company ? ` | ${exp.company}` : '',
              italics: true,
              size: 21,
              color: '475569',
              font: 'Calibri'
            })
          ]
        })
      );

      if (Array.isArray(exp.bullets)) {
        for (const bullet of exp.bullets) {
          docParagraphs.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 60 },
              children: [
                new TextRun({
                  text: bullet,
                  size: 21,
                  color: '334155',
                  font: 'Calibri'
                })
              ]
            })
          );
        }
      }
    }
  }

  // If there are additional sections in markdown that weren't parsed separately, or fallback
  if (docParagraphs.length <= 4 && fullCustomizedResumeMarkdown) {
    // Parse markdown lines directly
    const lines = fullCustomizedResumeMarkdown.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith('# ')) {
        docParagraphs.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [new TextRun({ text: trimmed.replace(/^#\s+/, ''), bold: true, size: 30, font: 'Calibri' })]
          })
        );
      } else if (trimmed.startsWith('## ')) {
        addSectionTitle(trimmed.replace(/^##\s+/, ''));
      } else if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        docParagraphs.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 60 },
            children: [new TextRun({ text: trimmed.replace(/^[\s•*-]+\s*/, ''), size: 21, font: 'Calibri' })]
          })
        );
      } else {
        docParagraphs.push(
          new Paragraph({
            spacing: { after: 100 },
            children: [new TextRun({ text: trimmed, size: 21, font: 'Calibri' })]
          })
        );
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 inch
              right: 720,
              bottom: 720,
              left: 720
            }
          }
        },
        children: docParagraphs
      }
    ]
  });

  return await Packer.toBuffer(doc);
}

module.exports = {
  generateDocx
};
