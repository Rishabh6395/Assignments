/**
 * Curated Sample Resumes and Job Descriptions for instant testing
 */

const SAMPLE_JOB_DESCRIPTIONS = [
  {
    id: 'jd-fullstack',
    title: 'Senior Full Stack Engineer',
    company: 'Fintech Pulse Inc.',
    location: 'Remote / San Francisco',
    text: `About Fintech Pulse:
Fintech Pulse is a high-growth financial infrastructure platform serving over 4 million businesses worldwide. We are looking for an exceptional Senior Full Stack Engineer to lead architecture across our core customer portal and payment automation microservices.

Key Responsibilities:
• Architect, build, and maintain mission-critical web applications using React, Next.js, TypeScript, and Node.js (Express/Fastify).
• Design scalable RESTful and GraphQL APIs integrated with PostgreSQL, Redis caching, and Stripe payment gateways.
• Spearhead automated CI/CD deployment pipelines using GitHub Actions, Docker, and AWS ECS/Lambda.
• Improve application performance, security, and web vital scores (target sub-100ms API response latency).
• Collaborate with product managers, UX designers, and compliance officers in an agile sprint environment.
• Mentor junior engineers and champion engineering best practices, automated testing (Jest, Cypress), and clean code.

Requirements & Qualifications:
• 4+ years of professional full-stack software development experience.
• Strong mastery of modern JavaScript/TypeScript, React 18+, Next.js, and Node.js.
• Experience with relational databases (PostgreSQL/MySQL) and query optimization.
• Solid understanding of cloud infrastructure (AWS or GCP), containerization (Docker), and automated testing.
• Strong communication skills and a user-centric mindset.`
  },
  {
    id: 'jd-devops',
    title: 'Lead DevOps & Cloud Engineer',
    company: 'CloudScale Systems',
    location: 'Remote / New York',
    text: `CloudScale Systems builds ultra-reliable observability and cloud orchestration platforms. We are seeking a Lead DevOps & Cloud Engineer to scale our multi-region Kubernetes clusters.

Key Responsibilities:
• Design, automate, and manage enterprise infrastructure on AWS/GCP using Terraform, Ansible, and Helm.
• Build rock-solid Kubernetes (EKS) clusters supporting 99.99% uptime for multi-tenant SaaS services.
• Implement enterprise-grade CI/CD pipelines with GitLab CI/GitHub Actions, ArgoCD, and automated vulnerability scanning (Trivy/SonarQube).
• Architect centralized monitoring, alerting, and logging using Prometheus, Grafana, Datadog, and OpenTelemetry.
• Implement robust zero-trust security postures, IAM policies, and disaster recovery strategies.

Requirements & Qualifications:
• 5+ years of DevOps / SRE / Cloud Engineering experience.
• Deep expertise in Kubernetes, Docker, and infrastructure-as-code (Terraform).
• Strong scripting abilities in Python, Bash, or Go.
• Proven track record of architecting scalable AWS cloud networks (VPC, Route53, ALB, RDS, S3).
• Certified Kubernetes Administrator (CKA) or AWS Certified Solutions Architect preferred.`
  },
  {
    id: 'jd-ai-pm',
    title: 'Senior AI & LLM Product Manager',
    company: 'PrepLab AI',
    location: 'Remote / Austin, TX',
    text: `PrepLab AI is pioneering next-generation intelligent career automation tools. We are hiring a Senior AI Product Manager to lead our generative AI resume and interview prep product line.

Key Responsibilities:
• Define product roadmap and vision for AI-assisted candidate evaluation and resume customization.
• Partner with ML engineering teams to benchmark and integrate LLM models (Gemini, Claude, GPT-4) with prompt engineering and RAG pipelines.
• Conduct user research, customer interviews, and competitive analysis to discover high-impact friction points.
• Define KPIs (activation rate, retention, user satisfaction, latency) and run continuous A/B tests to optimize user conversion.
• Partner with go-to-market teams to launch enterprise B2B features for hiring managers.

Requirements:
• 4+ years of technical product management experience, preferably in SaaS or AI-driven products.
• Strong familiarity with modern LLM capabilities, token economics, latency trade-offs, and prompt optimization.
• Data-driven analytical approach with SQL proficiency and experimentation metrics.
• Exceptional cross-functional leadership and written communication.`
  }
];

const SAMPLE_RESUMES = [
  {
    id: 'resume-alex',
    name: 'Alex Rivera',
    targetRole: 'Full Stack Software Engineer',
    fileName: 'Alex_Rivera_Resume.pdf',
    text: `Alex Rivera
San Francisco, CA • alex.rivera@email.com • (555) 234-5678 • linkedin.com/in/alexrivera-dev • github.com/alexrivera

PROFESSIONAL SUMMARY
Software Engineer with 3+ years of experience building modern web applications. Proficient in React, JavaScript, Node.js, and database design. Passionate about creating responsive frontends and reliable REST APIs. Looking to leverage full-stack capabilities in a fast-paced fintech environment.

TECHNICAL SKILLS
• Languages & Frameworks: JavaScript (ES6+), TypeScript, React, HTML5, CSS3, Node.js, Express
• Databases & Tools: PostgreSQL, MongoDB, Git, GitHub, REST APIs, Jest
• Cloud & Systems: AWS basics (S3, EC2), Docker basics, Linux, Vercel

WORK EXPERIENCE
Full Stack Developer | NexaTech Solutions | June 2022 - Present
• Developed interactive dashboard components using React and styled-components, improving user workflow speed.
• Created RESTful API endpoints in Node.js/Express to handle user transaction records and account data.
• Implemented client-side and server-side validation, reducing erroneous submissions by 25%.
• Integrated PostgreSQL database schemas and optimized basic queries to improve page loading time.
• Collaborated in bi-weekly agile sprints with 6 engineers and participated in code reviews.

Junior Web Developer | Apex Software Labs | Aug 2021 - May 2022
• Maintained customer-facing client websites using HTML, CSS, JavaScript, and React.
• Fixed over 40 UI/UX bugs across mobile and desktop browser platforms.
• Built automated unit tests using Jest, achieving 70% test coverage on primary user flow modules.
• Assisted senior team members in migrating legacy jQuery scripts to modular modern React components.

EDUCATION
Bachelor of Science in Computer Science
University of California, Davis | Graduated 2021

PROJECTS
• Personal Expense Tracker: React, Node.js, PostgreSQL app for budgeting with visual charts.
• DevConnect Social: Community discussion board built with TypeScript, Express, and Redis.`
  },
  {
    id: 'resume-marcus',
    name: 'Marcus Vance',
    targetRole: 'Cloud DevOps Engineer',
    fileName: 'Marcus_Vance_DevOps_Resume.pdf',
    text: `Marcus Vance
New York, NY • marcus.vance@cloudmail.com • (555) 876-5432 • linkedin.com/in/marcus-vance • github.com/marcusvance

PROFESSIONAL SUMMARY
Dedicated Cloud & Systems Engineer with 4 years of experience implementing infrastructure as code, containerized applications, and automated deployments. Experienced with Docker, Linux systems, and cloud fundamentals.

TECHNICAL SKILLS
• Cloud & Containers: AWS (EC2, S3, RDS, IAM), Docker, Kubernetes (Basics), Terraform
• CI/CD & Automation: GitHub Actions, Jenkins, Bash scripting, Python
• Monitoring & Networking: CloudWatch, Grafana, Linux System Administration, NGINX

PROFESSIONAL EXPERIENCE
Cloud Infrastructure Engineer | ScaleLogic Corp | 2022 - Present
• Maintained cloud environments on AWS, managing EC2 instances and RDS databases.
• Configured Docker containers for backend microservices to ensure consistent local and staging environments.
• Built automated CI/CD pipelines in GitHub Actions, reducing deployment time from 45 minutes to 15 minutes.
• Configured alerts and dashboards in Grafana to monitor system resource utilization and error rates.

Systems Administrator | TierOne Data Systems | 2020 - 2022
• Managed 50+ Linux servers, ensuring 99.9% availability and resolving operational issues.
• Automated recurring system backup tasks using Bash scripts and cron jobs.
• Implemented firewall rules and SSH access policies to harden server security.

EDUCATION & CERTIFICATIONS
• B.S. in Information Technology, Rutgers University (2020)
• AWS Certified Cloud Practitioner`
  }
];

module.exports = {
  SAMPLE_JOB_DESCRIPTIONS,
  SAMPLE_RESUMES
};
