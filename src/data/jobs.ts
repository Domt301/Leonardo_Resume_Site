import type { Job } from './types';

// Résumé content from spec §12.2–12.9. The inferred `⚠️ ADDED` elaborations were
// reviewed and approved by Leonardo, so no bullets carry `unverified: true`.
// No metrics, dollar figures, percentages, team sizes, or client names invented.

export const jobs: Job[] = [
  {
    id: 'travelers',
    company: 'Travelers Insurance',
    role: 'Sr Developer / Team Lead',
    location: 'Atlanta, GA',
    dates: 'March 2024 – Present',
    startYear: 2024,
    island: "The Insurer's Keep",
    guildmaster: 'Warden Marsh',
    signLine: "We insure what people can't afford to lose. The code has to hold.",
    bullets: [
      { prop: 'terminal', text: 'Building domain APIs using Node.js and API Gateway.' },
      { prop: 'altar', text: 'Prototyping AI applications and AI-augmented UI experiences.' },
      {
        prop: 'scrollRack',
        text: 'Contributing to the codebase and documentation to ensure continuity and code quality.',
      },
      {
        prop: 'draftingTable',
        text: 'Participating in design and implementation conversations around deliverables for business stakeholders.',
      },
      {
        prop: 'dummy',
        text: 'Mentoring developers through code review and pairing, with an emphasis on API contract design.',      },
      {
        prop: 'map',
        text: 'Partnering with product and business stakeholders to turn ambiguous requirements into scoped, deliverable API work.',      },
    ],
    plaque: ['Node.js', 'AWS API Gateway', 'TypeScript', 'REST', 'Generative AI prototyping', 'Agile'],
    mark: {
      name: 'Mark of the Warden',
      quote: 'You held the line on quality when the deadline pushed back.',
    },
  },
  {
    id: 'cox',
    company: 'Cox Automotive',
    role: 'Sr Developer / Team Lead',
    location: 'Atlanta, GA',
    dates: 'Jul 2023 – Mar 2024',
    startYear: 2023,
    island: 'Motorworks Foundry',
    guildmaster: 'Foreman Kade',
    signLine: 'Everything here moves. Your job was to make the parts fit.',
    bullets: [
      { prop: 'terminal', text: 'Building RESTful APIs using .NET Core and containers.' },
      { prop: 'workbench', text: 'Implementing single-spa micro frontends using React.' },
      { prop: 'draftingTable', text: 'Leading team discussions on architecture and coding standards.' },
      {
        prop: 'forge',
        text: 'Containerizing services and standardizing local development so the team could run the stack end to end.',      },
      {
        prop: 'scrollRack',
        text: 'Documenting frontend module boundaries so independently deployed apps could compose without collisions.',      },
    ],
    plaque: ['.NET Core', 'C#', 'React', 'single-spa', 'Docker', 'REST'],
    mark: {
      name: 'Mark of the Foreman',
      quote: 'You made independent parts run as one machine.',
    },
  },
  {
    id: 'aws',
    company: 'Amazon Web Services',
    role: 'Cloud Application Architect',
    location: 'Atlanta, GA',
    dates: 'Aug 2021 – Jun 2023',
    startYear: 2021,
    island: 'The Cloud Citadel',
    guildmaster: 'Archon Vela',
    signLine: "You didn't just build here. You taught others how to build.",
    bullets: [
      {
        prop: 'draftingTable',
        text: 'Owning end-to-end architecture and development during customer engagements.',
      },
      { prop: 'map', text: 'Participating in pre-sales meetings and design sessions to fit customer needs.' },
      {
        prop: 'altar',
        text: 'Meeting with customers to explain AWS offerings in depth and make tailored recommendations for cloud migration and adoption.',
      },
      {
        prop: 'workbench',
        text: 'Assisting customers during and after migration — lift-and-shift through full rewrites of on-prem architecture.',
      },
      {
        prop: 'terminal',
        text: 'Building solutions across AWS services: Lambda, API Gateway, S3, Step Functions, DynamoDB, Aurora RDS, and VPC.',
      },
      {
        prop: 'dummy',
        text: 'Running working sessions and enablement for customer engineering teams so they could operate what we built after handoff.',      },
      {
        prop: 'ledger',
        text: 'Translating technical architecture into terms business sponsors could fund and defend.',      },
    ],
    plaque: [
      'AWS Lambda',
      'API Gateway',
      'S3',
      'Step Functions',
      'DynamoDB',
      'Aurora RDS',
      'VPC',
      'CloudFormation',
      'IaC',
    ],
    mark: {
      name: 'Mark of the Archon',
      quote: 'You left customers able to build without you.',
    },
  },
  {
    id: 'rentready',
    company: 'Rent Ready',
    role: 'Cloud / Dynamics 365 Developer',
    location: 'Charlotte, NC',
    dates: '2019 – Aug 2021',
    startYear: 2019,
    island: 'Dynamics Manor',
    guildmaster: 'Steward Bell',
    signLine: 'An old house with new wiring. Someone had to run the conduit.',
    bullets: [
      {
        prop: 'terminal',
        text: 'Documenting and developing Azure Functions, web apps, and APIs to extend Dynamics 365 across the organization.',
      },
      {
        prop: 'cabinet',
        text: 'Creating and maintaining plug-ins, workflows, and web resources that drive business processes inside Dynamics 365.',
      },
      {
        prop: 'workbench',
        text: 'Implementing Service Bus queues to manage messages from Dynamics and trigger downstream Azure Functions.',
      },
      {
        prop: 'forge',
        text: 'Creating CI/CD build and release pipelines for Azure Functions, releasing to deployment slots by environment and trigger.',
      },
      {
        prop: 'draftingTable',
        text: "Making architecture decisions in Azure to fit the company's needs — moving apps from dedicated App Service to Consumption, converting apps to Durable Functions, deploying a static Vue.js site to blob storage, and creating non-interactive users in D365.",
      },
      {
        prop: 'crate',
        text: 'Creating micro-service applications that act as endpoints or interface with PowerApps and Logic Apps.',
      },
      {
        prop: 'ledger',
        text: 'Reducing hosting cost by matching each workload to the right Azure compute model instead of a single default.',      },
    ],
    plaque: [
      'Azure Functions',
      'Durable Functions',
      'Service Bus',
      'Dynamics 365',
      'PowerApps',
      'Logic Apps',
      'Vue.js',
      'Blob Storage',
      'Azure DevOps',
    ],
    mark: {
      name: 'Mark of the Steward',
      quote: 'You rewired the house without turning off the lights.',
    },
  },
  {
    id: 'ncourt',
    company: 'nCourt',
    role: 'Mid-Level Web Developer',
    location: 'Kennesaw, GA',
    dates: '2018 – 2019',
    startYear: 2018,
    island: 'Kennesaw Courthouse',
    guildmaster: 'Clerk Odell',
    signLine: 'Records, procedures, and a great deal of legacy. Modernize it carefully.',
    bullets: [
      {
        prop: 'cabinet',
        text: 'Initiated the transition from on-prem TFS version control to Git repositories in Azure DevOps.',
      },
      {
        prop: 'terminal',
        text: 'Created and maintained frontend applications in Vue.js while building the REST APIs behind them in .NET Core.',
      },
      {
        prop: 'ledger',
        text: 'Migrated existing stored procedures and database schema to Entity Framework Core using the fluent API.',
      },
      {
        prop: 'forge',
        text: 'Created CI/CD build and release pipelines for legacy applications and new development, targeting on-prem or cloud.',
      },
      {
        prop: 'crate',
        text: 'Converted local DLLs and libraries into NuGet packages hosted on Azure DevOps.',
      },
      {
        prop: 'workbench',
        text: 'Migrated legacy applications from VB.NET to C# on .NET Standard, introducing unit testing, regression testing, abstraction, and ORM data access.',
      },
    ],
    plaque: ['Vue.js', '.NET Core', '.NET Standard', 'Entity Framework Core', 'Azure DevOps', 'NuGet', 'Git', 'TFS'],
    mark: {
      name: 'Mark of the Clerk',
      quote: 'You moved the archive without losing a page.',
    },
  },
  {
    id: 'atlantic',
    company: 'Atlantic American Corporation',
    role: 'Web Developer',
    location: 'Atlanta, GA',
    dates: '2015 – 2018',
    startYear: 2015,
    island: 'Atlantic Guildhall',
    guildmaster: 'Master Rell',
    signLine: 'Where you learned to ship on the day you said you would.',
    bullets: [
      {
        prop: 'workbench',
        text: 'Developed, designed, and published projects to staging and production for public clients and internal users, with 100% on-time delivery.',
      },
      {
        prop: 'terminal',
        text: 'Created web, console, and REST API applications using .NET Core 2.0 and the .NET Core CLI.',
      },
      {
        prop: 'draftingTable',
        text: 'Built single-page applications with the Angular CLI and Webpack, integrating Angular projects into existing MVC 5 applications while preserving CI/CD pipelines.',
      },
      { prop: 'map', text: 'Collaborated with the CTO and marketing on project parameters and design.' },
      {
        prop: 'dummy',
        text: 'Wrote unit tests to verify expected outcomes, identified bugs in existing code, and implemented enhancements to improve speed and functionality.',
      },
      {
        prop: 'cabinet',
        text: 'Assisted the transition from SVN to a Git-based system in Visual Studio Online, including a CI/CD build and release pipeline.',
      },
      {
        prop: 'ledger',
        text: 'Maintained and created reports for business users using SSRS and SSIS packages.',
      },
    ],
    plaque: ['.NET Core 2.0', 'Angular', 'Webpack', 'MVC 5', 'SSRS', 'SSIS', 'SVN → Git'],
    mark: {
      name: 'Mark of the Guild',
      quote: 'Every promise kept, on the day it was due.',
    },
  },
  {
    id: 'ruralmetro',
    company: 'Rural Metro Ambulance',
    role: 'Critical Care Paramedic',
    location: 'Atlanta, GA',
    dates: '2009 – 2015',
    startYear: 2009,
    island: "The Healer's Camp",
    guildmaster: 'Medic Ives',
    signLine: 'Before the code, there were worse deadlines.',
    bullets: [
      {
        prop: 'altar',
        text: 'Diagnosed disease processes accurately and efficiently to provide treatment in high-stress settings.',
      },
      { prop: 'dummy', text: 'Participated in community education initiatives.' },
      {
        prop: 'map',
        text: 'Six years of making irreversible decisions with incomplete information under time pressure — the habit that still shapes how I run an incident or a launch.',      },
    ],
    plaque: ['Critical care transport', 'Triage', 'Community education', 'Crisis decision-making'],
    mark: {
      name: 'Mark of the Healer',
      quote: 'Calm is a skill. You learned it somewhere that mattered.',
    },
  },
  {
    id: 'merrill',
    company: 'Merrill Lynch / Princeton Retirement Group',
    role: 'Retirement Resource Representative',
    location: 'Atlanta, GA',
    dates: '2006 – 2009',
    startYear: 2006,
    island: 'The Coin Vault',
    guildmaster: 'Keeper Solis',
    signLine:
      'You explained hard things to worried people, then built the system that did it in two languages.',
    bullets: [
      { prop: 'ledger', text: 'Asset retention specialist, with over $25 million retained in 2007.' },
      { prop: 'altar', text: 'Co-architect of a Spanish-language voice response system.' },
      {
        prop: 'cabinet',
        text: 'Counseled Spanish- and English-speaking participants on fund options, withdrawal procedures, tax consequences, and loan modeling across more than 100 different 401(k) plans, and educated them on plan rules.',
      },
    ],
    plaque: ['Bilingual client service (ES/EN)', 'IVR system design', 'Retirement plan administration'],
    mark: {
      name: 'Mark of the Keeper',
      quote: 'The first system you ever designed spoke Spanish.',
    },
  },
];

export const jobById = (id: string): Job | undefined => jobs.find((j) => j.id === id);
