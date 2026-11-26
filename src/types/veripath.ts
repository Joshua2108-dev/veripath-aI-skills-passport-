export type UserRole = 'candidate' | 'employer' | 'admin';

export type AvailabilityOption = 'Remote' | 'Local' | 'Relocation';

export type DisplacementPathway =
  | 'Refugee / Asylum Seeker'
  | 'Cross-Border Migrant / Displaced Professional'
  | 'Undocumented / Pending Registration (CBO / NGO Caseworker Attestation)';

export type DisplacementDocumentType =
  | 'Refugee Identity Card'
  | 'UNHCR Proof of Registration / Household Manifest'
  | 'Asylum Seeker Certificate / Letter of Recognition'
  | 'Alien ID / Foreign National Registration'
  | 'Accredited CBO/NGO Partner Referral Attestation';

export type DisplacementVerificationStatus = 'Verified' | 'Pending Review' | 'Rejected';

export type EvidenceMode = 'tech' | 'practitioner';

export type SectorId =
  | 'tech'
  | 'healthcare'
  | 'education'
  | 'trades'
  | 'business'
  | 'agriculture';

export type CompetencyTier = 'Emerging' | 'Proficient' | 'Verified Practitioner';

export type PipelineStage =
  | 'Reviewed'
  | 'Trial Requested'
  | 'Interview Scheduled'
  | 'Placed';

export interface DocumentMetadata {
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  previewUrl?: string;
  isSampleDoc: boolean;
}

export interface GitHubRepoSummary {
  name: string;
  language: string;
  stars: number;
  description: string;
  updatedAt: string;
}

export interface GitHubEvidence {
  username: string;
  reposCount: number;
  estimatedCommits: number;
  primaryLanguages: string[];
  usedFallback: boolean;
  fallbackReason?: string;
  repositories: GitHubRepoSummary[];
}

export interface EquivalenceMapping {
  framework: string;
  level: string;
  plainEnglish: string;
}

export interface CompetencyScorecard {
  id: string;
  domain: string;
  score: number;
  evidenceSummary: string;
  detectedSignals: string[];
  bridgingRecommendation: string;
}

export interface BridgingVoucher {
  code: string;
  issuedAt: string;
  quizScore: number;
  quizTotal: number;
  status: 'Active' | 'Provisional' | 'Suspended';
  amountUsd: number;
}

export interface TrialMatchInfo {
  requested: boolean;
  referenceCode?: string;
  requestedAt?: string;
}

export interface CandidateProfile {
  id: string;
  credentialId: string;
  issueDate: string;
  fullName: string;
  location: string;
  availability: AvailabilityOption[];
  priorQualification: string;
  email: string;
  whatsapp: string;
  published: boolean;
  featured?: boolean;

  // Displacement gate (strictly restricted to Candidate + Admin views)
  displacementPathway: DisplacementPathway;
  documentType: DisplacementDocumentType;
  referenceNumber: string;
  documentMeta: DocumentMetadata | null;
  displacementStatus: DisplacementVerificationStatus;
  displacementAdminNote?: string;

  // Evidence & Evaluation
  evidenceMode: EvidenceMode;
  sectorId: SectorId;
  sectorLabel: string;
  targetRole: string;
  customRole?: string;
  githubUsername?: string;
  githubEvidence?: GitHubEvidence;
  workSampleText: string;

  // Evaluation Output
  overallScore: number;
  competencyTier: CompetencyTier;
  rubricBreakdown: {
    toolDensity: number;
    workflowMethodology: number;
    safetyCompliance: number;
    measurableImpact: number;
  };
  equivalences: EquivalenceMapping[];
  scorecards: CompetencyScorecard[];
  sdgTags: string[];

  // Bridging & Pipeline
  voucher: BridgingVoucher | null;
  trialMatch: TrialMatchInfo;
  pipelineStage: PipelineStage;
  shortlisted: boolean;
}

export interface PartnerContactRequest {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateCredentialId: string;
  partnerName: string;
  organization: string;
  partnerEmail: string;
  proposedRoleDetails: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface ActiveSession {
  activeRole: UserRole;
  activeCandidateId: string | null;
  partnerProfile: {
    partnerName: string;
    organization: string;
    workEmail: string;
  };
}

export type BillingTierId = 'employer_saas' | 'institutional_api' | 'ngo_cohort';
export type PaymentRailId = 'stripe' | 'mobile_money' | 'un_po';

export interface BillingState {
  selectedTier: BillingTierId;
  paymentRail: PaymentRailId;
  organizationName: string;
  billingEmail: string;
  lastReceiptRef?: string;
  lastUpdated?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  rationale: string;
}

export interface PublicPassportPayload {
  credentialId: string;
  fullName: string;
  location: string;
  sectorLabel: string;
  targetRole: string;
  issueDate: string;
  overallScore: number;
  competencyTier: CompetencyTier;
  displacementStatus: DisplacementVerificationStatus;
  availability: AvailabilityOption[];
  equivalences: EquivalenceMapping[];
  scorecards: Array<{
    domain: string;
    score: number;
    bridgingRecommendation: string;
  }>;
  sdgTags: string[];
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'info' | 'warning' | 'error';
}
