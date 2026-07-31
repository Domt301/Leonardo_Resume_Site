import type { Cert } from './types';

// The 14 sigils — spec §13.1. AWS-family sigils share a hex silhouette;
// no AWS badge artwork, typography, or logos are copied. Lapsed: 6, 9, 13.
export const certs: Cert[] = [
  {
    id: 'aws-cloud-practitioner',
    name: 'AWS Cloud Practitioner',
    issuer: 'Amazon Web Services',
    shape: 'hex',
    ramp: 'stone',
    glyph: 'cloud',
    status: 'active',
    blurb:
      'Validates foundational fluency across the AWS platform — core services, billing, and the shared-responsibility model. The baseline literacy behind every customer conversation at the Cloud Citadel.',
  },
  {
    id: 'aws-ai-practitioner',
    name: 'AWS AI Practitioner',
    issuer: 'Amazon Web Services',
    shape: 'hex',
    ramp: 'stone',
    glyph: 'neural net',
    status: 'active',
    blurb:
      'Certifies working knowledge of AI and generative-AI services on AWS. Underpins the AI prototyping and AI-augmented UI work at Travelers.',
  },
  {
    id: 'aws-sa-associate',
    name: 'AWS Solutions Architect – Associate',
    issuer: 'Amazon Web Services',
    shape: 'hex',
    ramp: 'royal',
    glyph: 'drafting triangle',
    status: 'active',
    blurb:
      'Certifies the ability to design resilient, cost-optimized architectures on AWS. The formal credential behind the end-to-end architecture ownership during AWS engagements.',
  },
  {
    id: 'aws-ml-associate',
    name: 'AWS ML Engineer – Associate',
    issuer: 'Amazon Web Services',
    shape: 'hex',
    ramp: 'royal',
    glyph: 'gear + node',
    status: 'active',
    blurb:
      'Validates building, deploying, and operationalizing machine-learning workloads on AWS. Extends the architecture practice into ML delivery.',
  },
  {
    id: 'aws-ml-associate-early',
    name: 'AWS ML Engineer – Assoc. Early Adopter',
    issuer: 'Amazon Web Services',
    shape: 'hex-ribbon',
    ramp: 'royal',
    glyph: 'gear + sparkle',
    status: 'active',
    blurb:
      'Awarded for certifying in the exam’s early-adopter window. Marks a habit of staying at the front edge of the AWS credential path.',
  },
  {
    id: 'aws-devops-pro',
    name: 'AWS DevOps Engineer – Professional',
    issuer: 'Amazon Web Services',
    shape: 'hex',
    ramp: 'teal',
    glyph: 'infinity',
    status: 'active',
    blurb:
      'Professional-level certification in CI/CD, infrastructure as code, and operational automation on AWS. The credential behind the pipeline and IaC work across roles.',
  },
  {
    id: 'aws-genai-pro',
    name: 'AWS GenAI Developer – Professional',
    issuer: 'Amazon Web Services',
    shape: 'hex',
    ramp: 'teal',
    glyph: 'starburst',
    status: 'active',
    blurb:
      'Professional-level certification in building generative-AI applications on AWS. The formal counterpart to the AI application prototyping at Travelers.',
  },
  {
    id: 'aws-genai-pro-early',
    name: 'AWS GenAI Dev Pro Early Adopter',
    issuer: 'Amazon Web Services',
    shape: 'hex-ribbon',
    ramp: 'teal',
    glyph: 'starburst + sparkle',
    status: 'active',
    blurb:
      'Awarded for certifying in the generative-AI professional exam’s early-adopter window. Another marker of being early to a new AWS credential.',
  },
  {
    id: 'aws-security-specialty',
    name: 'AWS Security – Specialty',
    issuer: 'Amazon Web Services',
    shape: 'hex',
    ramp: 'violet',
    glyph: 'padlock',
    status: 'lapsed',
    blurb:
      'Specialty certification in securing AWS workloads — identity, encryption, and network controls. A lapsed seal is not a lost skill; it is a renewal not yet scheduled.',
  },
  {
    id: 'aws-partner-accredited',
    name: 'AWS Partner: Business Accredited',
    issuer: 'Amazon Web Services',
    shape: 'octagon',
    ramp: 'bone',
    glyph: 'rising arrow',
    status: 'active',
    blurb:
      'Accreditation in the business value of AWS adoption — how to position and defend cloud investment. The business-facing complement to the technical certifications.',
  },
  {
    id: 'azure-fundamentals',
    name: 'Microsoft Azure Fundamentals',
    issuer: 'Microsoft',
    shape: 'shield',
    ramp: 'royal',
    glyph: 'four-point star',
    status: 'active',
    blurb:
      'Certifies foundational knowledge of Azure services and cloud concepts. The credential behind the Azure Functions and Dynamics 365 work at Rent Ready and nCourt.',
  },
  {
    id: 'ms-exam-480',
    name: 'MS Exam 480 — HTML5/JS/CSS3',
    issuer: 'Microsoft',
    shape: 'circle',
    ramp: 'bone',
    glyph: '< >',
    status: 'active',
    blurb:
      'Certifies programming in HTML5 with JavaScript and CSS3. The formal front-end foundation under years of SPA and web work.',
  },
  {
    id: 'comptia-security-plus',
    name: 'CompTIA Security+ ce',
    issuer: 'CompTIA',
    shape: 'circle',
    ramp: 'crimson',
    glyph: '+',
    status: 'lapsed',
    blurb:
      'Vendor-neutral certification in core security principles and practices. A lapsed seal is not a lost skill; it is a renewal not yet scheduled.',
  },
  {
    id: 'ckad',
    name: 'Kubernetes CKAD',
    issuer: 'The Linux Foundation / CNCF',
    shape: 'heptagon',
    ramp: 'royal',
    glyph: "ship's wheel",
    status: 'active',
    blurb:
      'Hands-on certification in designing and deploying applications on Kubernetes. The credential behind the container and orchestration work.',
  },
];

export const activeCerts = () => certs.filter((c) => c.status === 'active');
export const lapsedCerts = () => certs.filter((c) => c.status === 'lapsed');
export const certById = (id: string) => certs.find((c) => c.id === id);
