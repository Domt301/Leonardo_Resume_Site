import type { Certification } from '../types/resume';

// 15 certifications: 13 active, 2 lapsed.

export const certifications: Certification[] = [
  {
    id: 'aws-cloud-practitioner',
    name: 'AWS Cloud Practitioner',
    issuer: 'Amazon Web Services',
    status: 'active',
    description:
      'Validates foundational fluency across the AWS platform — core services, billing, and the shared-responsibility model. The baseline literacy behind every customer conversation as a Cloud Application Architect.',
  },
  {
    id: 'aws-ai-practitioner',
    name: 'AWS AI Practitioner',
    issuer: 'Amazon Web Services',
    status: 'active',
    description:
      'Certifies working knowledge of AI and generative-AI services on AWS. Underpins the AI prototyping and AI-augmented UI work at Travelers.',
  },
  {
    id: 'aws-sa-associate',
    name: 'AWS Solutions Architect – Associate',
    issuer: 'Amazon Web Services',
    status: 'active',
    description:
      'Certifies the ability to design resilient, cost-optimized architectures on AWS. The formal credential behind the end-to-end architecture ownership during AWS engagements.',
  },
  {
    id: 'aws-ml-associate',
    name: 'AWS ML Engineer – Associate',
    issuer: 'Amazon Web Services',
    status: 'active',
    description:
      'Validates building, deploying, and operationalizing machine-learning workloads on AWS. Extends the architecture practice into ML delivery.',
  },
  {
    id: 'aws-ml-associate-early',
    name: 'AWS ML Engineer – Assoc. Early Adopter',
    issuer: 'Amazon Web Services',
    status: 'active',
    description:
      "Awarded for certifying in the exam's early-adopter window. Marks a habit of staying at the front edge of the AWS credential path.",
  },
  {
    id: 'aws-devops-pro',
    name: 'AWS DevOps Engineer – Professional',
    issuer: 'Amazon Web Services',
    status: 'active',
    description:
      'Professional-level certification in CI/CD, infrastructure as code, and operational automation on AWS. The credential behind the pipeline and IaC work across roles.',
  },
  {
    id: 'aws-genai-pro',
    name: 'AWS GenAI Developer – Professional',
    issuer: 'Amazon Web Services',
    status: 'active',
    description:
      'Professional-level certification in building generative-AI applications on AWS. The formal counterpart to the AI application prototyping at Travelers.',
  },
  {
    id: 'aws-genai-pro-early',
    name: 'AWS GenAI Dev Pro Early Adopter',
    issuer: 'Amazon Web Services',
    status: 'active',
    description:
      "Awarded for certifying in the generative-AI professional exam's early-adopter window. Another marker of being early to a new AWS credential.",
  },
  {
    id: 'aws-security-specialty',
    name: 'AWS Security – Specialty',
    issuer: 'Amazon Web Services',
    status: 'lapsed',
    description:
      'Specialty certification in securing AWS workloads — identity, encryption, and network controls. A lapsed credential is not a lost skill; it is a renewal not yet scheduled.',
  },
  {
    id: 'aws-partner-accredited',
    name: 'AWS Partner: Business Accredited',
    issuer: 'Amazon Web Services',
    status: 'active',
    description:
      'Accreditation in the business value of AWS adoption — how to position and defend cloud investment. The business-facing complement to the technical certifications.',
  },
  {
    id: 'azure-fundamentals',
    name: 'Microsoft Azure Fundamentals',
    issuer: 'Microsoft',
    status: 'active',
    description:
      'Certifies foundational knowledge of Azure services and cloud concepts. The credential behind the Azure Functions and Dynamics 365 work at Rent Ready and nCourt.',
  },
  {
    id: 'ms-exam-480',
    name: 'MS Exam 480 — HTML5/JS/CSS3',
    issuer: 'Microsoft',
    status: 'active',
    description:
      'Certifies programming in HTML5 with JavaScript and CSS3. The formal front-end foundation under years of SPA and web work.',
  },
  {
    id: 'comptia-security-plus',
    name: 'CompTIA Security+ ce',
    issuer: 'CompTIA',
    status: 'lapsed',
    description:
      'Vendor-neutral certification in core security principles and practices. A lapsed credential is not a lost skill; it is a renewal not yet scheduled.',
  },
  {
    id: 'ckad',
    name: 'Kubernetes CKAD',
    issuer: 'The Linux Foundation / CNCF',
    status: 'active',
    description:
      'Hands-on certification in designing and deploying applications on Kubernetes. The credential behind the container and orchestration work.',
  },
  {
    id: 'claude-certified-architect-foundations',
    name: 'Claude Certified Architect (Foundations)',
    issuer: 'Anthropic',
    issuedDate: '2026-08-07',
    status: 'active',
    description:
      'Foundational certification in architecting applications on Anthropic’s Claude platform — prompt design, tool use, and agent workflows. The credential behind the AI-first prototyping and Claude-powered features I build.',
  },
];

export const activeCertifications = () => certifications.filter((c) => c.status === 'active');
export const lapsedCertifications = () => certifications.filter((c) => c.status === 'lapsed');
