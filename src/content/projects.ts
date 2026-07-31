import type { Project } from '../types/resume';

// PLACEHOLDER — edit before launch. Both entries are scaffolding for the
// Projects Workshop: the first is the spec's worked example, the second is
// this site itself. Replace/extend with real project write-ups.

export const projects: Project[] = [
  {
    id: 'self-hosted-ai-platform',
    name: 'Self-Hosted AI Platform',
    tagline: 'A deployable private LLM environment on AWS.',
    description:
      'PLACEHOLDER — A reference deployment for running private large-language-model workloads inside a customer-owned AWS account, with authenticated access and reusable infrastructure.',
    problem:
      'PLACEHOLDER — Teams want LLM capability without sending data to third-party APIs, but standing up secure, scalable in-house model hosting is nontrivial.',
    solution:
      'PLACEHOLDER — Infrastructure-as-code deployment of a vLLM serving stack on EKS behind API Gateway and Cognito, provisioned end to end with AWS CDK.',
    technologies: ['React', 'AWS CDK', 'EKS', 'vLLM', 'FastAPI', 'Cognito'],
    outcomes: [
      'Validated practical in-house model hosting',
      'Created reusable infrastructure',
      'Demonstrated secure authenticated access',
    ],
    status: 'Prototype',
    featured: true,
  },
  {
    id: 'interactive-resume',
    name: 'Interactive Resume World',
    tagline: 'This site — a playable 3D resume island.',
    description:
      'A personal resume presented as a small stylized 3D island. Visitors walk a character between themed landmarks and open resume sections through in-world interactions, with a fully accessible HTML fallback.',
    problem:
      'A resume needs to be memorable to stand out, but novelty usually costs usability, accessibility, and SEO.',
    solution:
      'React Three Fiber world layered under conventional HTML panels and routes: every section is reachable by keyboard, deep link, and screen reader, and the whole resume renders without WebGL.',
    architecture: [
      'Vite + React + TypeScript single-page app',
      'React Three Fiber scene with custom 2D XZ collision (no physics engine)',
      'Route-driven content panels; Zustand stores split by concern',
      'Procedural pixel-art textures generated in code — no binary art assets',
    ],
    technologies: ['React', 'TypeScript', 'Three.js', 'React Three Fiber', 'React Router', 'Zustand', 'Tailwind CSS', 'Vercel'],
    outcomes: [
      'Resume fully usable without 3D, JavaScript-only fallback for no-WebGL devices',
      'Every section deep-linkable with correct browser-back behavior',
    ],
    repositoryUrl: 'https://github.com/Domt301',
    status: 'Live',
    featured: true,
  },
];

export const projectById = (id: string) => projects.find((p) => p.id === id);
