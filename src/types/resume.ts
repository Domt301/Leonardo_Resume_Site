// ─────────────────────────────────────────────────────────────────────────────
// Resume content types (spec §14.1). The single source of truth consumed by
// BOTH the 3D world and the HTML panels/fallback. This module imports NOTHING
// from three, React, or the stores.
// ─────────────────────────────────────────────────────────────────────────────

export interface Profile {
  name: string;
  /** Professional role, e.g. "Cloud Application Architect". */
  headline: string;
  /** Identity-board tagline: "Engineer. Leader. Builder." */
  tagline: string;
  /** One-line HUD summary shown in the bottom info bar. */
  heroLine: string;
  location: string;
  email: string;
  phone: string;
  languages: string;
  linkedinUrl: string;
  githubUrl: string;
  resumeUrl: string;
  /** Multi-paragraph professional summary. */
  summary: string[];
}

export interface ExperienceEntry {
  id: string;
  company: string;
  title: string;
  startDate: string;
  /** Omitted for the current role ("Present"). */
  endDate?: string;
  location?: string;
  achievements: string[];
  technologies: string[];
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  problem: string;
  solution: string;
  architecture?: string[];
  technologies: string[];
  outcomes: string[];
  image?: string;
  demoUrl?: string;
  repositoryUrl?: string;
  featured?: boolean;
  status?: string;
}

export type CertificationStatus = 'active' | 'lapsed';

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issuedDate?: string;
  credentialUrl?: string;
  status: CertificationStatus;
  /** Two sentences: what it validates and how it was used. */
  description: string;
}

export interface EducationEntry {
  id: string;
  name: string;
  institution: string;
  /** Optional year or range. */
  year?: string;
  blurb: string;
}

export interface SkillCategory {
  name: string;
  items: string[];
}

/** The six openable resume sections (routes and world landmarks). */
export type ResumeSection =
  | 'experience'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'about'
  | 'contact';

export const RESUME_SECTIONS: readonly ResumeSection[] = [
  'experience',
  'skills',
  'projects',
  'certifications',
  'about',
  'contact',
] as const;
