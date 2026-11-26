import {
  ActiveSession,
  BillingState,
  CandidateProfile,
  PartnerContactRequest,
} from '../types/veripath';

export const SEED_CANDIDATES: CandidateProfile[] = [
  {
    id: 'cand-tech-001',
    credentialId: 'VP-2026-4108',
    issueDate: '2026-10-18',
    fullName: 'Tariq Al-Mansoor',
    location: 'Nairobi, Kenya (Originally Damascus, Syria)',
    availability: ['Remote', 'Relocation'],
    priorQualification:
      'B.Sc. in Computer Science, Damascus University (2018) — physical transcripts lost during transit',
    email: 'tariq.mansoor.dev@example.org',
    whatsapp: '+254 712 409 812',
    published: true,
    featured: true,
    displacementPathway: 'Refugee / Asylum Seeker',
    documentType: 'Refugee Identity Card',
    referenceNumber: 'REF-ID-849201',
    documentMeta: {
      fileName: 'tariq_refugee_id_verified.pdf',
      fileType: 'application/pdf',
      fileSize: 284120,
      uploadDate: '2026-10-16',
      isSampleDoc: true,
    },
    displacementStatus: 'Verified',
    evidenceMode: 'tech',
    sectorId: 'tech',
    sectorLabel: 'Tech & Digital',
    targetRole: 'Senior Full-Stack Cloud Engineer',
    githubUsername: 'tariq-cloud-sys',
    githubEvidence: {
      username: 'tariq-cloud-sys',
      reposCount: 5,
      estimatedCommits: 142,
      primaryLanguages: ['TypeScript', 'Python'],
      usedFallback: false,
      repositories: [
        {
          name: 'tariq-cloud-sys/relief-mesh-api',
          language: 'TypeScript',
          stars: 38,
          description: 'Multi-tenant Node.js & PostgreSQL logistics API serving 14 field clinics with 99.94% uptime.',
          updatedAt: '2026-10-12',
        },
        {
          name: 'tariq-cloud-sys/oauth-zero-trust-proxy',
          language: 'TypeScript',
          stars: 24,
          description: 'OWASP-hardened OAuth2 + RBAC proxy with TLS 1.3 and PII audit-log redaction.',
          updatedAt: '2026-09-29',
        },
        {
          name: 'tariq-cloud-sys/terraform-aws-ha',
          language: 'TypeScript',
          stars: 19,
          description: 'Automated AWS ECS, Docker, and CI/CD deployment modules with canary rollbacks.',
          updatedAt: '2026-09-04',
        },
        {
          name: 'tariq-cloud-sys/dhis2-sync-worker',
          language: 'Python',
          stars: 16,
          description: 'Offline-first Python synchronization queue for intermittent camp connectivity.',
          updatedAt: '2026-08-21',
        },
        {
          name: 'tariq-cloud-sys/accessible-intake-ui',
          language: 'TypeScript',
          stars: 14,
          description: 'React & WCAG AAA multilingual intake components reducing triage latency by 42%.',
          updatedAt: '2026-07-18',
        },
      ],
    },
    workSampleText:
      '1. Architected a fault-tolerant cloud logistics platform using TypeScript, React, Node.js, PostgreSQL, Docker, and AWS ECS. 2. Implemented automated CI/CD pipelines with canary rollbacks, reducing deployment failure rates by 68% and maintaining 99.94% uptime across 14 regional clinics. 3. Enforced OWASP security controls, RBAC authorization, TLS encryption, and strict PII sanitization for GDPR compliance, cutting intake latency by 42% for 12,000+ monthly records.',
    overallScore: 93,
    competencyTier: 'Verified Practitioner',
    rubricBreakdown: {
      toolDensity: 95,
      workflowMethodology: 92,
      safetyCompliance: 91,
      measurableImpact: 94,
    },
    equivalences: [
      {
        framework: 'SFIA (Skills Framework for the Information Age)',
        level: 'Level 4 — Enable',
        plainEnglish: 'Works autonomously on complex systems, designs scalable solutions, and guides peers.',
      },
      {
        framework: 'EQF (European Qualifications Framework)',
        level: 'Level 6 — Bachelor Equivalence',
        plainEnglish: 'Advanced theoretical and practical mastery across software architecture and delivery.',
      },
      {
        framework: 'UNESCO ISCED 2011',
        level: 'Level 6 — Tertiary Professional',
        plainEnglish: 'Comparable to accredited university engineering & applied computing output.',
      },
    ],
    scorecards: [
      {
        id: 'tech-d1',
        domain: 'Distributed Systems & Cloud Architecture',
        score: 94,
        evidenceSummary:
          'Demonstrated applied fluency across TypeScript, React, Node.js, AWS, PostgreSQL, and Docker with 5 linked repositories (142 commits).',
        detectedSignals: ['typescript', 'react', 'aws', 'postgresql', 'docker'],
        bridgingRecommendation: 'Complete AWS Solutions Architect Associate or CNCF Kubernetes Bridge Exam.',
      },
      {
        id: 'tech-d2',
        domain: 'Code Quality, Testing & Delivery Reliability',
        score: 93,
        evidenceSummary:
          'Verified operational ownership (architected, implemented, deployed) backed by 99.94% uptime and 68% fewer deployment regressions.',
        detectedSignals: ['architected', 'implemented', 'ci/cd', '99.94% uptime'],
        bridgingRecommendation: 'Document production incident postmortems using SRE error-budget templates.',
      },
      {
        id: 'tech-d3',
        domain: 'Security, Data Privacy & Operational Compliance',
        score: 91,
        evidenceSummary:
          'Explicit adherence to sector safeguards: OWASP controls, RBAC, TLS encryption, and PII sanitization under GDPR.',
        detectedSignals: ['owasp', 'rbac', 'encryption', 'gdpr'],
        bridgingRecommendation: 'Validate OWASP ASVS Level 2 security controls for cross-border remote roles.',
      },
    ],
    sdgTags: ['SDG 8: Decent Work', 'SDG 10: Reduced Inequalities', 'SDG 17: Partnerships'],
    voucher: {
      code: 'STIPEND-70412',
      issuedAt: '2026-10-18',
      quizScore: 3,
      quizTotal: 3,
      status: 'Active',
      amountUsd: 150,
    },
    trialMatch: {
      requested: false,
    },
    pipelineStage: 'Interview Scheduled',
    shortlisted: true,
  },
  {
    id: 'cand-health-002',
    credentialId: 'VP-2026-5824',
    issueDate: '2026-10-24',
    fullName: 'Amina Hassan Garang',
    location: 'Eldoret, Kenya (Cross-Border from Juba, South Sudan)',
    availability: ['Local', 'Relocation'],
    priorQualification:
      'Diploma in Clinical Medicine & Trauma Nursing, Juba College of Health Sciences (2019) — official seal destroyed in clinic fire',
    email: 'amina.garang.clinical@example.org',
    whatsapp: '+254 723 891 340',
    published: true,
    featured: true,
    displacementPathway: 'Cross-Border Migrant / Displaced Professional',
    documentType: 'UNHCR Proof of Registration / Household Manifest',
    referenceNumber: 'UNHCR-KEN-2026-48219',
    documentMeta: {
      fileName: 'amina_unhcr_manifest_scan.png',
      fileType: 'image/png',
      fileSize: 412800,
      uploadDate: '2026-10-22',
      isSampleDoc: true,
    },
    displacementStatus: 'Verified',
    evidenceMode: 'practitioner',
    sectorId: 'healthcare',
    sectorLabel: 'Healthcare & Public Health',
    targetRole: 'Clinical Officer',
    workSampleText:
      '1. Triaged and stabilized 45+ daily trauma and acute pediatric patients in a high-volume cross-border emergency unit using WHO ETAT protocols, IV cannulation, pulse oximetry, and DHIS2 reporting. 2. Coordinated sterile wound suturing, sepsis bundles, and maternal emergency referrals, cutting triage-to-stabilization time by 31%. 3. Enforced strict Infection Prevention & Control (IPC), PPE donning/doffing, biosafety sharps disposal, informed consent, and patient confidentiality with zero healthcare-acquired outbreaks across 18 months.',
    overallScore: 91,
    competencyTier: 'Verified Practitioner',
    rubricBreakdown: {
      toolDensity: 92,
      workflowMethodology: 90,
      safetyCompliance: 94,
      measurableImpact: 89,
    },
    equivalences: [
      {
        framework: 'KNQF (Kenya National Qualifications Framework)',
        level: 'Level 6 — Diploma / Senior Practitioner',
        plainEnglish: 'Independent operational execution, safety governance, and team supervision.',
      },
      {
        framework: 'EQF (European Qualifications Framework)',
        level: 'Level 6 — Senior Applied Equivalence',
        plainEnglish: 'Complex problem-solving and autonomous accountability in high-stakes environments.',
      },
      {
        framework: 'WHO Global Clinical Competency Tier',
        level: 'Tier 3 — Full Operational Readiness',
        plainEnglish: 'Verified compliance with international safety, ethics, and field quality protocols.',
      },
    ],
    scorecards: [
      {
        id: 'health-d1',
        domain: 'Acute Clinical Triage & Patient Management',
        score: 91,
        evidenceSummary:
          'Demonstrated applied fluency across emergency triage, trauma stabilization, IV cannulation, sepsis management, and DHIS2 informatics.',
        detectedSignals: ['triage', 'trauma', 'iv', 'sepsis', 'dhis2'],
        bridgingRecommendation: 'Sit Nursing Council / Clinical Officers Council practical OSCE bridge assessment.',
      },
      {
        id: 'health-d2',
        domain: 'Infection Prevention, Biosafety & WHO Protocols',
        score: 94,
        evidenceSummary:
          'Explicit adherence to WHO ETAT protocols, IPC, PPE, sharps biosafety, informed consent, and patient confidentiality.',
        detectedSignals: ['who', 'ipc', 'ppe', 'biosafety', 'consent'],
        bridgingRecommendation: 'Complete WHO Emergency Triage Assessment and Treatment (ETAT) refresher.',
      },
      {
        id: 'health-d3',
        domain: 'Health Informatics, Records & Community Outreach',
        score: 89,
        evidenceSummary:
          'Verified operational ownership (triaged, stabilized, coordinated) with 31% faster triage response across 45+ daily cases.',
        detectedSignals: ['45+ daily patients', '31% faster triage', '0 outbreaks'],
        bridgingRecommendation: 'Verify cold-chain & antimicrobial stewardship compliance logbooks.',
      },
    ],
    sdgTags: ['SDG 8: Decent Work', 'SDG 10: Reduced Inequalities', 'SDG 17: Partnerships'],
    voucher: null,
    trialMatch: {
      requested: true,
      referenceCode: 'TRIAL-2026-5824',
      requestedAt: '2026-10-26',
    },
    pipelineStage: 'Trial Requested',
    shortlisted: false,
  },
  {
    id: 'cand-edu-003',
    credentialId: 'VP-2026-6391',
    issueDate: '2026-11-04',
    fullName: 'Samuel Nkurunziza',
    location: 'Kakuma / Turkana, Kenya (Originally Bujumbura, Burundi)',
    availability: ['Local', 'Remote'],
    priorQualification:
      'Higher Diploma in Primary Pedagogy, Institut Pédagogique (2020) — awaiting regional equivalency verification',
    email: 'samuel.nkurunziza.edu@example.org',
    whatsapp: '+254 790 554 218',
    published: true,
    featured: false,
    displacementPathway: 'Refugee / Asylum Seeker',
    documentType: 'Asylum Seeker Certificate / Letter of Recognition',
    referenceNumber: 'ASY-KEN-2026-1042',
    documentMeta: {
      fileName: 'samuel_asylum_recognition_letter.pdf',
      fileType: 'application/pdf',
      fileSize: 196500,
      uploadDate: '2026-11-03',
      isSampleDoc: true,
    },
    displacementStatus: 'Pending Review',
    evidenceMode: 'practitioner',
    sectorId: 'education',
    sectorLabel: 'Education & Youth',
    targetRole: 'CBC Educator',
    workSampleText:
      '1. Designed and facilitated Competency-Based Curriculum (CBC) literacy and numeracy lesson plans for a cohort of 64 multilingual primary learners using differentiated scaffolding and formative assessment rubrics. 2. Delivered trauma-informed Psychosocial Support (PSS) and SEL circles aligned with INEE Minimum Standards, improving learner attendance by 28% over 2 terms. 3. Upheld UNICEF child protection and safeguarding code of conduct, maintaining confidential referral logs with 100% safeguarding compliance.',
    overallScore: 84,
    competencyTier: 'Proficient',
    rubricBreakdown: {
      toolDensity: 83,
      workflowMethodology: 85,
      safetyCompliance: 88,
      measurableImpact: 81,
    },
    equivalences: [
      {
        framework: 'KNQF (Kenya National Qualifications Framework)',
        level: 'Level 5 — Craft / Specialized Certificate',
        plainEnglish: 'Reliable field execution following established safety and quality workflows.',
      },
      {
        framework: 'EQF (European Qualifications Framework)',
        level: 'Level 5 — Specialized Vocational',
        plainEnglish: 'Applies specialized tools and methods independently in routine and variable contexts.',
      },
      {
        framework: 'INEE / UNESCO ISCED Level 5',
        level: 'ISCED 5 — INEE Certified Educator',
        plainEnglish: 'Strong practical foundation; recommended for targeted local licensing bridge.',
      },
    ],
    scorecards: [
      {
        id: 'edu-d1',
        domain: 'Curriculum Design & Learner Assessment',
        score: 84,
        evidenceSummary:
          'Demonstrated applied fluency across CBC lesson planning, differentiated scaffolding, literacy/numeracy, and formative rubrics.',
        detectedSignals: ['cbc', 'curriculum', 'rubric', 'scaffolding', 'literacy'],
        bridgingRecommendation: 'Complete KNEC Competency-Based Curriculum (CBC) regional conversion workshop.',
      },
      {
        id: 'edu-d2',
        domain: 'Psychosocial Support (PSS) & Inclusive Pedagogy',
        score: 83,
        evidenceSummary:
          'Verified classroom delivery for 64 learners with 28% attendance improvement using trauma-informed SEL circles.',
        detectedSignals: ['pss', 'sel', 'trauma-informed', '64 learners', '+28% attendance'],
        bridgingRecommendation: 'Obtain INEE Minimum Standards in Emergencies digital micro-credential.',
      },
      {
        id: 'edu-d3',
        domain: 'Child Safeguarding & Institutional Standards',
        score: 88,
        evidenceSummary:
          'Explicit adherence to INEE standards, UNICEF child protection, safeguarding code of conduct, and confidential referrals.',
        detectedSignals: ['inee', 'safeguarding', 'child protection', 'unicef'],
        bridgingRecommendation: 'Submit 2 bilingual formative rubric samples for TSC equivalency endorsement.',
      },
    ],
    sdgTags: ['SDG 4: Quality Education', 'SDG 10: Reduced Inequalities', 'SDG 16: Strong Institutions'],
    voucher: {
      code: 'STIPEND-63910',
      issuedAt: '2026-11-04',
      quizScore: 3,
      quizTotal: 3,
      status: 'Provisional',
      amountUsd: 120,
    },
    trialMatch: {
      requested: false,
    },
    pipelineStage: 'Reviewed',
    shortlisted: false,
  },
];

export const SEED_REQUESTS: PartnerContactRequest[] = [
  {
    id: 'req-init-001',
    candidateId: 'cand-health-002',
    candidateName: 'Amina Hassan Garang',
    candidateCredentialId: 'VP-2026-5824',
    partnerName: 'Dr. Grace Muthoni',
    organization: 'East Africa Relief Medical Network',
    partnerEmail: 'talent@earmn-health.org',
    proposedRoleDetails: '6-Week Paid Clinical Officer Trial Placement (Eldoret Trauma Wing)',
    message:
      'We reviewed Ms. Garang’s WHO Tier 3 / KNQF Level 6 equivalence passport and would like to initiate a paid 6-week clinical bridging trial.',
    status: 'pending',
    createdAt: '2026-11-24T09:30:00Z',
  },
];

export const DEFAULT_SESSION: ActiveSession = {
  activeRole: 'candidate',
  activeCandidateId: 'cand-tech-001',
  partnerProfile: {
    partnerName: 'Dr. Grace Muthoni',
    organization: 'East Africa Relief Medical Network',
    workEmail: 'talent@earmn-health.org',
  },
};

export const DEFAULT_BILLING: BillingState = {
  selectedTier: 'employer_saas',
  paymentRail: 'stripe',
  organizationName: 'East Africa Relief Medical Network',
  billingEmail: 'finance@earmn-health.org',
};
