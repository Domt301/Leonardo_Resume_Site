import type { SkillCategory } from '../types/resume';

export const skills: SkillCategory[] = [
  { name: 'Languages', items: ['C#', 'TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'SQL', 'HTML'] },
  { name: 'Frameworks & runtimes', items: ['.NET', 'Angular', 'React', 'Vue.js', 'Node.js'] },
  { name: 'Cloud', items: ['AWS', 'Azure', 'DigitalOcean', 'Heroku'] },
  { name: 'Infrastructure as code', items: ['CloudFormation', 'Terraform', 'Pulumi'] },
  { name: 'Containers & orchestration', items: ['Docker', 'Kubernetes (CKAD)'] },
  { name: 'Version control', items: ['Git', 'TFS', 'SVN'] },
  { name: 'Spoken', items: ['English', 'Spanish (fluent)'] },
];
