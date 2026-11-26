import { QuizQuestion, SectorId } from '../types/veripath';

export interface SectorDefinition {
  id: SectorId;
  label: string;
  shortLabel: string;
  roles: string[];
  sdgTags: string[];
  keywords: string[];
  complianceTerms: string[];
  scorecardDomains: [string, string, string];
  bridgingHints: [string, string, string];
}

export const SECTORS: Record<SectorId, SectorDefinition> = {
  tech: {
    id: 'tech',
    label: 'Tech & Digital',
    shortLabel: 'Tech',
    roles: [
      'Senior Full-Stack Cloud Engineer',
      'Backend API & Systems Engineer',
      'Frontend TypeScript Engineer',
      'DevOps & Site Reliability Specialist',
      'Data & Analytics Engineer',
    ],
    sdgTags: ['SDG 8: Decent Work', 'SDG 10: Reduced Inequalities', 'SDG 17: Partnerships'],
    keywords: [
      'typescript', 'react', 'node', 'python', 'aws', 'gcp', 'docker', 'kubernetes',
      'terraform', 'postgres', 'postgresql', 'graphql', 'rest', 'ci/cd', 'microservices',
      'oauth', 'tls', 'encryption', 'redis', 'linux', 'api', 'serverless', 'cloud',
    ],
    complianceTerms: [
      'owasp', 'gdpr', 'iso 27001', 'soc2', 'rbac', 'encryption', 'tls', 'zero-trust',
      'accessibility', 'wcag', 'audit', 'rate limit', 'sanitization', 'pii', 'security',
    ],
    scorecardDomains: [
      'Distributed Systems & Cloud Architecture',
      'Code Quality, Testing & Delivery Reliability',
      'Security, Data Privacy & Operational Compliance',
    ],
    bridgingHints: [
      'Complete AWS Solutions Architect Associate or CNCF Kubernetes Bridge Exam.',
      'Document production incident postmortems using SRE error-budget templates.',
      'Validate OWASP ASVS Level 2 security controls for cross-border remote roles.',
    ],
  },
  education: {
    id: 'education',
    label: 'Education & Youth',
    shortLabel: 'Education',
    roles: [
      'CBC Educator',
      'Secondary Subject Teacher',
      'Adult Literacy',
      'SEL/PSS Coordinator',
      'TVET Trainer',
    ],
    sdgTags: ['SDG 4: Quality Education', 'SDG 10: Reduced Inequalities', 'SDG 16: Strong Institutions'],
    keywords: [
      'cbc', 'curriculum', 'lesson plan', 'pedagogy', 'literacy', 'numeracy', 'psychosocial',
      'sel', 'pss', 'assessment', 'rubric', 'differentiated', 'scaffolding', 'tvet',
      'classroom', 'learner', 'cohort', 'mentorship', 'bilingual', 'trauma-informed',
    ],
    complianceTerms: [
      'inee', 'safeguarding', 'child protection', 'unicef', 'code of conduct', 'consent',
      'inclusive', 'disability', 'knec', 'tsc', 'confidentiality', 'attendance', 'ethics',
    ],
    scorecardDomains: [
      'Curriculum Design & Learner Assessment',
      'Psychosocial Support (PSS) & Inclusive Pedagogy',
      'Child Safeguarding & Institutional Standards',
    ],
    bridgingHints: [
      'Complete KNEC Competency-Based Curriculum (CBC) regional conversion workshop.',
      'Obtain INEE Minimum Standards in Emergencies digital micro-credential.',
      'Submit 2 bilingual formative rubric samples for TSC equivalency endorsement.',
    ],
  },
  healthcare: {
    id: 'healthcare',
    label: 'Healthcare & Public Health',
    shortLabel: 'Health',
    roles: [
      'Clinical Officer',
      'Registered Nurse',
      'Midwife',
      'Community Health Worker',
      'Lab Tech',
    ],
    sdgTags: ['SDG 8: Decent Work', 'SDG 10: Reduced Inequalities', 'SDG 17: Partnerships'],
    keywords: [
      'triage', 'trauma', 'clinical', 'iv', 'cannulation', 'vitals', 'sepsis', 'maternal',
      'antenatal', 'immunization', 'malaria', 'cholera', 'diagnostic', 'pharmacology',
      'cold chain', 'emr', 'dhis2', 'epidemiology', 'suture', 'sterile', 'stabilization',
    ],
    complianceTerms: [
      'who', 'ipc', 'infection prevention', 'ppe', 'consent', 'informed consent',
      'hipaa', 'confidentiality', 'biosafety', 'sharps', 'sterilization', 'protocol', 'nck',
    ],
    scorecardDomains: [
      'Acute Clinical Triage & Patient Management',
      'Infection Prevention, Biosafety & WHO Protocols',
      'Health Informatics, Records & Community Outreach',
    ],
    bridgingHints: [
      'Sit Nursing Council / Clinical Officers Council practical OSCE bridge assessment.',
      'Complete WHO Emergency Triage Assessment and Treatment (ETAT) refresher.',
      'Verify cold-chain & antimicrobial stewardship compliance logbooks.',
    ],
  },
  trades: {
    id: 'trades',
    label: 'Engineering & Skilled Trades',
    shortLabel: 'Trades',
    roles: [
      'Solar PV Installer',
      'Electrical/Civil Tech',
      'Automotive Specialist',
      'Construction Lead',
    ],
    sdgTags: ['SDG 8: Decent Work', 'SDG 10: Reduced Inequalities', 'SDG 17: Partnerships'],
    keywords: [
      'solar', 'photovoltaic', 'mppt', 'inverter', 'lithium', 'battery', 'multimeter',
      'wiring', 'earthing', 'grounding', 'circuit', 'breaker', 'load calculation',
      'blueprint', 'cad', 'diagnostics', 'obd', 'hydraulic', 'welding', 'concrete', 'hvac',
    ],
    complianceTerms: [
      'epra', 'iec', 'nec', 'osha', 'ppe', 'lockout', 'tagout', 'loto', 'harness',
      'insulated', 'code compliance', 'inspection', 'safety', 'fire', 'permit',
    ],
    scorecardDomains: [
      'Technical Sizing, Installation & Fault Diagnostics',
      'Site Safety, Lockout/Tagout & Regulatory Codes',
      'Preventive Maintenance & Commissioning Handover',
    ],
    bridgingHints: [
      'Complete EPRA T2/T3 Solar PV Licensing practical sign-off.',
      'Verify OSHA 30-hour / site hazard & Lockout-Tagout safety competency.',
      'Document 3 commissioning test sheets with open-circuit voltage & earthing logs.',
    ],
  },
  business: {
    id: 'business',
    label: 'Business, Finance & Administration',
    shortLabel: 'Business',
    roles: [
      'Bookkeeper/Accountant',
      'Supply Chain Lead',
      'NGO Program Officer',
      'Operations Specialist',
    ],
    sdgTags: ['SDG 8: Decent Work', 'SDG 16: Strong Institutions', 'SDG 17: Partnerships'],
    keywords: [
      'reconciliation', 'ledger', 'ifrs', 'quickbooks', 'xero', 'erp', 'sap', 'procurement',
      'tender', 'inventory', 'logistics', 'budget', 'variance', 'grant', 'donor', 'kpi',
      'payroll', 'cashflow', 'audit', 'forecasting', 'vendor', 'me&l', 'monitoring',
    ],
    complianceTerms: [
      'ifrs', 'anti-fraud', 'kyc', 'aml', 'procurement policy', 'three-way match',
      'segregation of duties', 'gdpr', 'tax compliance', 'donor compliance', 'audit trail',
    ],
    scorecardDomains: [
      'Financial Controls, Reconciliation & Grant Accounting',
      'Procurement, Supply Chain & Donor Compliance',
      'Operational Reporting & Stakeholder Coordination',
    ],
    bridgingHints: [
      'Complete IFRS for SMEs or ACCA Foundations regional tax bridge module.',
      'Validate humanitarian procurement & 3-way match compliance workflow.',
      'Build automated monthly budget-vs-actual variance dashboard template.',
    ],
  },
  agriculture: {
    id: 'agriculture',
    label: 'Agriculture & Livelihoods',
    shortLabel: 'Agriculture',
    roles: [
      'Agronomist',
      'Food Security Lead',
      'Legal Aid Officer',
      'Artisan Lead',
    ],
    sdgTags: ['SDG 4: Quality Education', 'SDG 8: Decent Work', 'SDG 10: Reduced Inequalities'],
    keywords: [
      'agronomy', 'drip irrigation', 'soil', 'ph', 'compost', 'hydroponic', 'drought',
      'yield', 'post-harvest', 'cold storage', 'cooperative', 'extension', 'food security',
      'legal aid', 'mediation', 'documentation', 'artisan', 'textile', 'quality control',
    ],
    complianceTerms: [
      'fao', 'globalgap', 'pesticide safety', 'ppe', 'organic', 'traceability',
      'land tenure', 'confidentiality', 'do no harm', 'safeguarding', 'iso', 'hygiene',
    ],
    scorecardDomains: [
      'Climate-Smart Production & Livelihood Execution',
      'Standards Traceability, Safety & Do-No-Harm Ethics',
      'Cooperative Training & Market Yield Optimization',
    ],
    bridgingHints: [
      'Complete FAO Climate-Smart Agriculture / GlobalG.A.P. practitioner orientation.',
      'Obtain regional cooperative extension facilitation certification.',
      'Document post-harvest loss reduction metrics across 2 seasonal cycles.',
    ],
  },
};

export const SECTOR_QUIZZES: Record<SectorId, QuizQuestion[]> = {
  tech: [
    {
      id: 'tech-q1',
      question:
        'When integrating a candidate verification API that processes sensitive identity records, which approach best protects PII at rest and in transit?',
      options: [
        'Store raw Base64 document scans inside client localStorage for offline speed',
        'Enforce TLS 1.3 in transit, isolate raw documents in encrypted server storage, and return only masked tokens to public endpoints',
        'Pass full national ID numbers inside URL query parameters for stateless caching',
      ],
      correctIndex: 1,
      rationale:
        'OWASP and GDPR data minimization require TLS in transit, encrypted access-controlled storage for raw IDs, and strict exclusion of PII from public URLs or browser storage.',
    },
    {
      id: 'tech-q2',
      question:
        'An external dependency API returns HTTP 429 (Rate Limit Exceeded) during a live candidate verification workflow. What is the resilient production pattern?',
      options: [
        'Block form submission indefinitely until the third-party API resets',
        'Throw an unhandled exception and clear the user’s entered evidence',
        'Log the transient state, apply bounded retry/backoff, and fall back to verified local evaluation heuristics without blocking the user',
      ],
      correctIndex: 2,
      rationale:
        'Graceful degradation with explicit fallback telemetry keeps critical verification workflows operational under rate-limiting or low-connectivity conditions.',
    },
    {
      id: 'tech-q3',
      question:
        'Under SFIA Level 4 (Enable) and EQF Level 6 benchmarks, what differentiates a Senior Practitioner from an Entry-level contributor?',
      options: [
        'Autonomously designing resilient systems, mentoring peers, and owning end-to-end operational outcomes',
        'Memorizing syntax without writing automated tests or architectural documentation',
        'Deploying directly to production without peer review or rollback plans',
      ],
      correctIndex: 0,
      rationale:
        'SFIA Level 4 emphasizes autonomy, architectural judgment, mentoring, and accountability for measurable system reliability.',
    },
  ],
  healthcare: [
    {
      id: 'health-q1',
      question:
        'During emergency triage in a high-volume cross-border clinic, a patient presents with altered mental status, BP 82/50 mmHg, and fever. What is the immediate priority?',
      options: [
        'Schedule a routine outpatient follow-up in 48 hours',
        'Initiate immediate ABCDE stabilization, two wide-bore IV access lines, sepsis screening, and continuous vitals monitoring',
        'Wait for full historical paper medical records before taking vital signs',
      ],
      correctIndex: 1,
      rationale:
        'Hypotension with altered mental status and fever signals potential septic shock; WHO ETAT/acute care protocols mandate immediate ABCDE stabilization and fluid/sepsis intervention.',
    },
    {
      id: 'health-q2',
      question:
        'Which Infection Prevention & Control (IPC) practice is mandatory when handling blood-borne specimen collection in a resource-constrained clinic?',
      options: [
        'Recapping needles manually before placing them in general waste',
        'Proper PPE, single-use sterile equipment, immediate disposal into puncture-proof sharps containers without recapping, and hand hygiene',
        'Reusing gloves between patients after wiping with dry gauze',
      ],
      correctIndex: 1,
      rationale:
        'WHO IPC guidelines strictly prohibit needle recapping and glove reuse; puncture-proof sharps disposal and hand hygiene prevent healthcare-associated transmission.',
    },
    {
      id: 'health-q3',
      question:
        'When recording patient data in DHIS2 or EMR systems for displaced populations, how must patient confidentiality be maintained?',
      options: [
        'Share unredacted patient names and camp manifest IDs in public WhatsApp groups for faster referrals',
        'Use de-identified aggregate codes for public health reporting and obtain informed consent for clinical referrals',
        'Leave physical triage charts unlocked at the clinic entrance',
      ],
      correctIndex: 1,
      rationale:
        'Medical ethics and humanitarian protection standards require informed consent for referrals and anonymized/de-identified data for epidemiological reporting.',
    },
  ],
  education: [
    {
      id: 'edu-q1',
      question:
        'In a multi-lingual Competency-Based Curriculum (CBC) classroom with newly arrived displaced learners, which instructional practice best supports equity?',
      options: [
        'Assess every learner exclusively with timed written essays in an unfamiliar language',
        'Use visual scaffolding, formative rubrics, peer pairing, and home-language bridges while tracking individual mastery',
        'Exclude learners who lack prior report cards from practical group projects',
      ],
      correctIndex: 1,
      rationale:
        'CBC and INEE standards prioritize differentiated scaffolding and formative competency observation so language barriers do not mask true cognitive mastery.',
    },
    {
      id: 'edu-q2',
      question:
        'A student exhibits sudden withdrawal and distress during a classroom activity. According to INEE Psychosocial Support (PSS) and Safeguarding guidelines, what is the educator’s role?',
      options: [
        'Press the child publicly in front of peers to explain their trauma',
        'Provide calm psychological first aid, maintain classroom safety, document privately, and refer through the designated Child Protection focal point',
        'Promise absolute secrecy even if there is an active risk of harm',
      ],
      correctIndex: 1,
      rationale:
        'Teachers offer Level 1–2 psychosocial support (safety, calm, structure) and escalate protection concerns strictly through trained safeguarding referral pathways.',
    },
    {
      id: 'edu-q3',
      question:
        'What defines a valid CBC formative assessment artifact under ISCED Level 5 & KNQF teaching benchmarks?',
      options: [
        'A single end-of-term rank order without feedback',
        'Criterion-referenced observation checklists paired with actionable learner feedback and work samples',
        'Attendance sheets alone without skill evidence',
      ],
      correctIndex: 1,
      rationale:
        'Competency-based education requires criterion-referenced rubrics and demonstrable learner artifacts showing skill progression.',
    },
  ],
  trades: [
    {
      id: 'trades-q1',
      question:
        'Before servicing a 48V off-grid Solar PV battery bank and hybrid inverter array, what is the mandatory first safety step?',
      options: [
        'Disconnect DC/AC breakers, apply Lockout/Tagout (LOTO) tags, verify zero voltage with a calibrated multimeter, and wear insulated PPE',
        'Begin loosening battery terminals immediately while the array is under load',
        'Short-circuit the PV terminals to test if current is flowing',
      ],
      correctIndex: 0,
      rationale:
        'EPRA, NEC, and OSHA electrical standards require full isolation, Lockout/Tagout verification with a multimeter, and PPE to prevent arc-flash and electrocution.',
    },
    {
      id: 'trades-q2',
      question:
        'When sizing a Solar PV off-grid system for a rural health clinic, why must inverter surge capacity and cable voltage drop (<3%) be calculated?',
      options: [
        'To reduce the physical weight of solar panels on the roof',
        'To ensure inductive medical loads (vaccine fridges/centrifuges) start reliably without tripping or overheating conductors',
        'Voltage drop calculations are optional for DC circuits under 100V',
      ],
      correctIndex: 1,
      rationale:
        'Low-voltage DC systems carry high current; excessive voltage drop causes thermal fire hazards and compressor failure on critical medical refrigeration.',
    },
    {
      id: 'trades-q3',
      question:
        'Upon completing an installation, what documentation proves IEC / EPRA commissioning compliance?',
      options: [
        'A verbal assurance to the client',
        'Signed commissioning sheet recording Voc, Isc, insulation resistance, earthing resistance, and polarity checks',
        'A receipt for raw cables only',
      ],
      correctIndex: 1,
      rationale:
        'Formal test-and-commissioning logs provide verifiable proof of code compliance and safe handover.',
    },
  ],
  business: [
    {
      id: 'biz-q1',
      question:
        'In NGO and institutional grant procurement, what does the "Three-Way Match" internal control verify before releasing vendor payment?',
      options: [
        'Three staff members verbally agree on the supplier name',
        'Purchase Order, Goods Received Note (GRN), and Vendor Invoice all match in quantity, price, and authorization',
        'The invoice is paid first and verified after the fiscal year closes',
      ],
      correctIndex: 1,
      rationale:
        'Three-way matching prevents duplicate payments, phantom deliveries, and procurement fraud under IFRS and UN/NGO donor audit standards.',
    },
    {
      id: 'biz-q2',
      question:
        'A monthly bank reconciliation reveals an unrecorded mobile money disbursement and a $420 grant variance. What is the correct accounting action?',
      options: [
        'Plug the $420 difference into miscellaneous expenses to close the month quickly',
        'Trace the transaction reference in the ledger, obtain supporting voucher documentation, record an adjusting entry with audit trail, and flag variance to budget holder',
        'Delete the bank statement line from the spreadsheet',
      ],
      correctIndex: 1,
      rationale:
        'Auditability requires every reconciling item to be traced to primary evidence and documented with a clear variance explanation.',
    },
    {
      id: 'biz-q3',
      question:
        'Why is Segregation of Duties (SoD) mandatory in finance and supply chain operations?',
      options: [
        'It ensures no single person can initiate a purchase, approve receipt, and execute payment without independent oversight',
        'It slows down reporting so fewer transactions occur',
        'It only applies to organizations with over 10,000 employees',
      ],
      correctIndex: 0,
      rationale:
        'Segregation of duties reduces error and fraud risk by splitting authorization, custody, and reconciliation across distinct roles.',
    },
  ],
  agriculture: [
    {
      id: 'agri-q1',
      question:
        'When introducing drip irrigation and soil amendments to smallholder farmer cooperatives in arid displacement-affected zones, which metric best validates agronomic impact?',
      options: [
        'Total liters of water pumped regardless of crop survival',
        'Water-use efficiency (yield per cubic meter), soil moisture retention, and post-harvest loss percentage across the season',
        'Number of brochures printed at the start of the project',
      ],
      correctIndex: 1,
      rationale:
        'Climate-smart agronomy measures yield per unit of scarce water alongside soil health and post-harvest retention.',
    },
    {
      id: 'agri-q2',
      question:
        'Under FAO and GlobalG.A.P. crop protection standards, what is required before applying any biological or chemical crop input?',
      options: [
        'Apply maximum concentration during midday wind to cover adjacent plots',
        'Verify pest threshold (IPM), use calibrated PPE, respect Pre-Harvest Intervals (PHI), and log batch traceability',
        'Mix unmarked leftover containers to save time',
      ],
      correctIndex: 1,
      rationale:
        'Integrated Pest Management (IPM), PPE, Pre-Harvest Intervals, and traceability logs safeguard worker health, food safety, and market eligibility.',
    },
    {
      id: 'agri-q3',
      question:
        'For Legal Aid & Livelihoods Officers supporting displaced artisans or farmers, what does the humanitarian "Do No Harm" principle require?',
      options: [
        'Publish beneficiary land or dispute details publicly to pressure local authorities',
        'Maintain strict client confidentiality, informed consent, and conflict-sensitive mediation that avoids escalating host-community tensions',
        'Charge informal facilitation fees for referrals',
      ],
      correctIndex: 1,
      rationale:
        'Conflict-sensitive practice and strict confidentiality protect vulnerable clients and foster durable host-community coexistence.',
    },
  ],
};
