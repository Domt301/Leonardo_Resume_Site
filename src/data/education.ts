import type { Education } from './types';

// The Academy — spec §14. Five reading stations.
export const education: Education[] = [
  {
    id: 'hbs-negotiation',
    name: 'Negotiation Mastery',
    institution: 'Harvard Business School Online',
    blurb:
      'Negotiation strategy, value creation, and managing agreements — applied to scoping and defending technical work with business stakeholders.',
    usedAt: 'travelers',
  },
  {
    id: 'hbs-ai-leaders',
    name: 'AI for Leaders',
    institution: 'Harvard Business School Online',
    year: '2026',
    blurb:
      'Framing AI capability as an organizational decision rather than a tooling one; the leadership counterpart to the AI prototyping at Travelers.',
    usedAt: 'travelers',
  },
  {
    id: 'ecornell-tech-leadership',
    name: 'Technology Leadership Certificate',
    institution: 'eCornell',
    year: '2024',
    blurb:
      'Leading technical teams; the practice behind the team-lead roles at Cox Automotive and Travelers.',
    usedAt: 'cox',
  },
  {
    id: 'medix-emt',
    name: 'EMT Paramedic Certificate',
    institution: 'Medix Technical College',
    blurb: 'The credential behind six years of critical care.',
    usedAt: 'ruralmetro',
  },
  {
    id: 'mdc-business',
    name: 'Business Administration',
    institution: 'Miami Dade College',
    year: '2002–2004',
    blurb: 'Where the business vocabulary came from.',
    usedAt: 'merrill',
  },
];

export const educationById = (id: string) => education.find((e) => e.id === id);
