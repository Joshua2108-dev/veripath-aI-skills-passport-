import { useState, useEffect, ChangeEvent } from 'react';
import {
  ShieldCheck,
  Clock,
  AlertTriangle,
  Upload,
  FileCheck2,
  Eye,
  Lock,
  Github,
  Briefcase,
  Printer,
  Link2,
  Bookmark,
  CheckCircle2,
  Award,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Loader2,
  Ticket,
  Globe2,
} from 'lucide-react';
import {
  AvailabilityOption,
  CandidateProfile,
  DisplacementDocumentType,
  DisplacementPathway,
  DocumentMetadata,
  EvidenceMode,
  GitHubEvidence,
  SectorId,
} from '../types/veripath';
import { SECTORS, SECTOR_QUIZZES } from '../data/sectorsAndQuizzes';
import {
  evaluatePracticalEvidence,
  fetchGitHubEvidence,
  validateReferenceNumber,
} from '../utils/evaluationEngine';
import {
  createLightweightThumbnail,
  encodePublicPassportPayload,
} from '../utils/storage';
import { DocumentPreviewModal } from './DocumentPreviewModal';

interface CandidateWorkspaceProps {
  activeCandidate: CandidateProfile | null;
  isBlankDraft: boolean;
  onSaveCandidate: (candidate: CandidateProfile, isNew: boolean) => void;
  onUpdateCandidate: (candidate: CandidateProfile) => void;
  onLoadSample: (sector: 'tech' | 'healthcare' | 'education') => void;
  onPreviewPublicLink: (hash: string) => void;
  onNotify: (
    title: string,
    variant: 'success' | 'info' | 'warning' | 'error',
    description?: string
  ) => void;
  blobUrls: Record<string, string>;
  onRegisterBlobUrl: (candidateKey: string, url: string) => void;
}

const PATHWAYS: DisplacementPathway[] = [
  'Refugee / Asylum Seeker',
  'Cross-Border Migrant / Displaced Professional',
  'Undocumented / Pending Registration (CBO / NGO Caseworker Attestation)',
];

const DOCUMENT_TYPES: DisplacementDocumentType[] = [
  'Refugee Identity Card',
  'UNHCR Proof of Registration / Household Manifest',
  'Asylum Seeker Certificate / Letter of Recognition',
  'Alien ID / Foreign National Registration',
  'Accredited CBO/NGO Partner Referral Attestation',
];

const AVAILABILITY_OPTIONS: AvailabilityOption[] = ['Remote', 'Local', 'Relocation'];

export function CandidateWorkspace({
  activeCandidate,
  isBlankDraft,
  onSaveCandidate,
  onUpdateCandidate,
  onLoadSample,
  onPreviewPublicLink,
  onNotify,
  blobUrls,
  onRegisterBlobUrl,
}: CandidateWorkspaceProps) {
  // Intake form state
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState<AvailabilityOption[]>(['Remote']);
  const [priorQualification, setPriorQualification] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [published, setPublished] = useState(false);

  // Displacement verification gate state
  const [displacementPathway, setDisplacementPathway] = useState<DisplacementPathway>(
    'Refugee / Asylum Seeker'
  );
  const [documentType, setDocumentType] = useState<DisplacementDocumentType>(
    'UNHCR Proof of Registration / Household Manifest'
  );
  const [referenceNumber, setReferenceNumber] = useState('');
  const [documentMeta, setDocumentMeta] = useState<DocumentMetadata | null>(null);

  // Talent evidence state
  const [evidenceMode, setEvidenceMode] = useState<EvidenceMode>('tech');
  const [sectorId, setSectorId] = useState<SectorId>('healthcare');
  const [targetRole, setTargetRole] = useState('Clinical Officer');
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [useCustomRole, setUseCustomRole] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [workSampleText, setWorkSampleText] = useState('');

  // UI & Async states
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [pendingBlobUrl, setPendingBlobUrl] = useState<string | undefined>(undefined);
  const [lastShareUrl, setLastShareUrl] = useState<string | null>(null);

  // Quiz state (keyed per active candidate ID)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Sync form state whenever activeCandidate or isBlankDraft changes
  useEffect(() => {
    if (isBlankDraft || !activeCandidate) {
      setFullName('');
      setLocation('');
      setAvailability(['Remote']);
      setPriorQualification('');
      setEmail('');
      setWhatsapp('');
      setPublished(false);
      setDisplacementPathway('Refugee / Asylum Seeker');
      setDocumentType('UNHCR Proof of Registration / Household Manifest');
      setReferenceNumber('');
      setDocumentMeta(null);
      setEvidenceMode('tech');
      setSectorId('healthcare');
      setTargetRole(SECTORS.healthcare.roles[0]);
      setCustomRoleInput('');
      setUseCustomRole(false);
      setGithubUsername('');
      setWorkSampleText('');
      setFormError(null);
      setPendingBlobUrl(undefined);
      setLastShareUrl(null);
      setQuizAnswers({});
      setQuizSubmitted(false);
      return;
    }

    setFullName(activeCandidate.fullName);
    setLocation(activeCandidate.location);
    setAvailability(activeCandidate.availability);
    setPriorQualification(activeCandidate.priorQualification);
    setEmail(activeCandidate.email);
    setWhatsapp(activeCandidate.whatsapp);
    setPublished(activeCandidate.published);
    setDisplacementPathway(activeCandidate.displacementPathway);
    setDocumentType(activeCandidate.documentType);
    setReferenceNumber(activeCandidate.referenceNumber);
    setDocumentMeta(activeCandidate.documentMeta);
    setEvidenceMode(activeCandidate.evidenceMode);

    if (activeCandidate.sectorId === 'tech') {
      setSectorId('healthcare');
      setTargetRole(SECTORS.healthcare.roles[0]);
      setUseCustomRole(false);
      setCustomRoleInput('');
    } else {
      setSectorId(activeCandidate.sectorId);
      const knownRoles = SECTORS[activeCandidate.sectorId].roles;
      if (knownRoles.includes(activeCandidate.targetRole)) {
        setTargetRole(activeCandidate.targetRole);
        setUseCustomRole(false);
        setCustomRoleInput('');
      } else {
        setUseCustomRole(true);
        setCustomRoleInput(activeCandidate.targetRole);
      }
    }

    setGithubUsername(activeCandidate.githubUsername || '');
    setWorkSampleText(activeCandidate.workSampleText);
    setFormError(null);
    setLastShareUrl(null);
    setQuizAnswers({});
    setQuizSubmitted(Boolean(activeCandidate.voucher));
  }, [activeCandidate?.id, isBlankDraft]);

  const refValidation = validateReferenceNumber(referenceNumber, documentType);
  const currentBlobUrl =
    (activeCandidate && blobUrls[activeCandidate.id]) || pendingBlobUrl;

  const toggleAvailability = (opt: AvailabilityOption) => {
    setAvailability((prev) => {
      if (prev.includes(opt)) {
        return prev.length > 1 ? prev.filter((item) => item !== opt) : prev;
      }
      return [...prev, opt];
    });
  };

  const handleSectorChange = (newSector: SectorId) => {
    setSectorId(newSector);
    setUseCustomRole(false);
    setCustomRoleInput('');
    setTargetRole(SECTORS[newSector].roles[0]);
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      onNotify(
        'Unsupported file format',
        'warning',
        'Please upload a JPG, PNG, or PDF verification document.'
      );
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPendingBlobUrl(objectUrl);
    if (activeCandidate) {
      onRegisterBlobUrl(activeCandidate.id, objectUrl);
    }

    const lightThumb = await createLightweightThumbnail(file);
    const meta: DocumentMetadata = {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadDate: new Date().toISOString().slice(0, 10),
      previewUrl: lightThumb,
      isSampleDoc: false,
    };
    setDocumentMeta(meta);
    onNotify('Verification document attached', 'success', `${file.name} ready for review.`);
  };

  const handleLoadSampleDocument = () => {
    const sampleRef =
      referenceNumber.trim() ||
      (documentType === 'Refugee Identity Card'
        ? 'REF-ID-772410'
        : documentType === 'Asylum Seeker Certificate / Letter of Recognition'
        ? 'ASY-KEN-2026-3391'
        : documentType === 'Alien ID / Foreign National Registration'
        ? 'ALIEN-KEN-881204'
        : documentType === 'Accredited CBO/NGO Partner Referral Attestation'
        ? 'CBO-ATT-2026-109'
        : 'UNHCR-KEN-2026-59204');

    setReferenceNumber(sampleRef);
    setDocumentMeta({
      fileName: 'sample_unhcr_manifest_verified.pdf',
      fileType: 'application/pdf',
      fileSize: 245760,
      uploadDate: new Date().toISOString().slice(0, 10),
      isSampleDoc: true,
    });
    setPendingBlobUrl(undefined);
    onNotify(
      'Sample displacement document loaded',
      'info',
      `Attached reference ${sampleRef} for quick evaluation.`
    );
  };

  const handlePublishToggle = () => {
    const nextPublished = !published;
    setPublished(nextPublished);
    if (activeCandidate && !isBlankDraft) {
      onUpdateCandidate({
        ...activeCandidate,
        published: nextPublished,
      });
      onNotify(
        nextPublished ? 'Published to Talent Registry' : 'Saved as Private Draft',
        'info',
        nextPublished
          ? 'Masked profile is now searchable in the Employer & NGO Partner directory.'
          : 'Profile hidden from employer searches while preserving your passport.'
      );
    }
  };

  const handleGeneratePassport = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError('Please enter the candidate’s full name.');
      return;
    }
    if (!location.trim()) {
      setFormError('Please enter the current city and country.');
      return;
    }
    if (!refValidation.valid) {
      setFormError(refValidation.message);
      return;
    }
    if (!documentMeta) {
      setFormError(
        'Please upload a displacement verification document or click "Load Sample Document".'
      );
      return;
    }
    if (evidenceMode === 'tech' && !githubUsername.trim() && workSampleText.trim().length < 40) {
      setFormError(
        'Enter a GitHub username or provide at least 40 characters in your technical summary.'
      );
      return;
    }
    if (workSampleText.trim().length < 40) {
      setFormError(
        'Practical Work Sample must be at least 40 characters describing tools, workflow, safety/ethics, and measurable outcomes.'
      );
      return;
    }

    const effectiveSector: SectorId = evidenceMode === 'tech' ? 'tech' : sectorId;
    const effectiveRole =
      evidenceMode === 'tech'
        ? 'Senior Full-Stack Cloud Engineer'
        : useCustomRole && customRoleInput.trim()
        ? customRoleInput.trim()
        : targetRole;

    setIsEvaluating(true);

    let githubEvidence: GitHubEvidence | undefined;
    if (evidenceMode === 'tech') {
      githubEvidence = await fetchGitHubEvidence(githubUsername || 'displaced-engineer');
    }

    const evaluation = evaluatePracticalEvidence({
      evidenceMode,
      sectorId: effectiveSector,
      targetRole: effectiveRole,
      workSampleText,
      githubEvidence,
    });

    const isUpdatingExisting = Boolean(activeCandidate && !isBlankDraft);
    const id = isUpdatingExisting && activeCandidate ? activeCandidate.id : `cand-${Date.now()}`;
    const credentialId =
      isUpdatingExisting && activeCandidate
        ? activeCandidate.credentialId
        : `VP-2026-${Math.floor(1000 + Math.random() * 8999)}`;

    if (pendingBlobUrl) {
      onRegisterBlobUrl(id, pendingBlobUrl);
    }

    const displacementStatus =
      isUpdatingExisting && activeCandidate ? activeCandidate.displacementStatus : 'Pending Review';

    const newProfile: CandidateProfile = {
      id,
      credentialId,
      issueDate: new Date().toISOString().slice(0, 10),
      fullName: fullName.trim(),
      location: location.trim(),
      availability,
      priorQualification:
        priorQualification.trim() || 'Practical competency verified without physical paper records',
      email: email.trim() || 'candidate@veripath-member.org',
      whatsapp: whatsapp.trim() || '+254 700 000 000',
      published,
      featured: activeCandidate?.featured ?? false,
      displacementPathway,
      documentType,
      referenceNumber: referenceNumber.trim().toUpperCase(),
      documentMeta,
      displacementStatus,
      displacementAdminNote: activeCandidate?.displacementAdminNote,
      evidenceMode,
      sectorId: effectiveSector,
      sectorLabel: SECTORS[effectiveSector].label,
      targetRole: effectiveRole,
      customRole: useCustomRole ? customRoleInput.trim() : undefined,
      githubUsername: evidenceMode === 'tech' ? githubUsername.trim() : undefined,
      githubEvidence,
      workSampleText: workSampleText.trim(),
      overallScore: evaluation.overallScore,
      competencyTier: evaluation.competencyTier,
      rubricBreakdown: evaluation.rubricBreakdown,
      equivalences: evaluation.equivalences,
      scorecards: evaluation.scorecards,
      sdgTags: evaluation.sdgTags,
      voucher: activeCandidate?.voucher ?? null,
      trialMatch: activeCandidate?.trialMatch ?? { requested: false },
      pipelineStage: activeCandidate?.pipelineStage ?? 'Reviewed',
      shortlisted: activeCandidate?.shortlisted ?? false,
    };

    setIsEvaluating(false);
    onSaveCandidate(newProfile, !isUpdatingExisting);
    onNotify(
      `Skill Passport ${credentialId} Generated`,
      'success',
      `Evaluated at ${evaluation.overallScore}% (${evaluation.competencyTier}).`
    );
  };

  const handleCopyShareLink = async () => {
    if (!activeCandidate) return;
    const encoded = encodePublicPassportPayload(activeCandidate);
    const hash = `#passport=${encoded}`;
    const fullUrl = `${window.location.origin}${window.location.pathname}${hash}`;
    setLastShareUrl(hash);

    try {
      await navigator.clipboard.writeText(fullUrl);
      onNotify(
        'Public verification link copied',
        'success',
        'Sensitive documents, manifest IDs, and personal contact info were automatically stripped.'
      );
    } catch {
      onNotify(
        'Shareable link generated',
        'info',
        'Use "Preview Public Certificate" below to open the read-only view.'
      );
    }
  };

  const handleToggleShortlist = () => {
    if (!activeCandidate) return;
    const next = !activeCandidate.shortlisted;
    onUpdateCandidate({
      ...activeCandidate,
      shortlisted: next,
    });
    onNotify(
      next ? 'Added to Partner Shortlist' : 'Removed from Partner Shortlist',
      'success',
      `${activeCandidate.fullName} (${activeCandidate.credentialId})`
    );
  };

  const handleRequestTrialMatch = () => {
    if (!activeCandidate) return;
    if (activeCandidate.trialMatch.requested) {
      onNotify(
        'Paid Trial Match already active',
        'info',
        `Reference: ${activeCandidate.trialMatch.referenceCode}`
      );
      return;
    }
    const refCode = `TRIAL-2026-${activeCandidate.credentialId.slice(-4)}`;
    onUpdateCandidate({
      ...activeCandidate,
      trialMatch: {
        requested: true,
        referenceCode: refCode,
        requestedAt: new Date().toISOString().slice(0, 10),
      },
      pipelineStage:
        activeCandidate.pipelineStage === 'Reviewed'
          ? 'Trial Requested'
          : activeCandidate.pipelineStage,
    });
    onNotify(
      'Paid Trial Match Requested',
      'success',
      `Matching reference ${refCode} assigned and synced to Employer Portal.`
    );
  };

  const handleSubmitQuiz = () => {
    if (!activeCandidate) return;
    const questions = SECTOR_QUIZZES[activeCandidate.sectorId];
    const answeredCount = questions.filter((q) => quizAnswers[q.id] !== undefined).length;
    if (answeredCount < questions.length) {
      onNotify(
        'Complete all 3 questions',
        'warning',
        'Answer every scenario before grading your micro-assessment.'
      );
      return;
    }

    const score = questions.reduce(
      (acc, q) => (quizAnswers[q.id] === q.correctIndex ? acc + 1 : acc),
      0
    );
    setQuizSubmitted(true);

    if (score >= 2) {
      const voucherStatus =
        activeCandidate.displacementStatus === 'Verified'
          ? 'Active'
          : activeCandidate.displacementStatus === 'Rejected'
          ? 'Suspended'
          : 'Provisional';
      const code =
        activeCandidate.voucher?.code ||
        `STIPEND-${activeCandidate.credentialId.slice(-4)}${Math.floor(1 + Math.random() * 8)}`;

      onUpdateCandidate({
        ...activeCandidate,
        voucher: {
          code,
          issuedAt: new Date().toISOString().slice(0, 10),
          quizScore: score,
          quizTotal: questions.length,
          status: voucherStatus,
          amountUsd: activeCandidate.sectorId === 'tech' ? 150 : 120,
        },
      });
      onNotify(
        `Passed Micro-Assessment (${score}/${questions.length})`,
        'success',
        voucherStatus === 'Active'
          ? `Bridging Exam Fee Waiver Voucher ${code} is now active.`
          : `Voucher ${code} issued as Provisional — unlocks upon Admin ID verification.`
      );
    } else {
      onNotify(
        `Score ${score}/${questions.length} — Review rationales and retry`,
        'warning',
        'Score 2/3 or higher to unlock your Bridging Exam Fee Waiver Voucher.'
      );
    }
  };

  const activeQuestions = activeCandidate ? SECTOR_QUIZZES[activeCandidate.sectorId] : [];
  const charCount = workSampleText.trim().length;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: Submit Practical Evidence */}
        <section
          aria-label="Candidate Evidence Intake"
          className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-6 print:hidden"
        >
          <div className="border-b border-slate-200 pb-4">
            <h1 className="text-xl font-bold text-[#1E3A5F]">Submit Practical Evidence</h1>
            <p className="text-sm text-slate-600 mt-1">
              Build an internationally mapped Skill Passport without requiring lost paper degrees.
            </p>
          </div>

          <form onSubmit={handleGeneratePassport} className="space-y-6" noValidate>
            {/* 1. Candidate Profile & Privacy Controls */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-bold text-[#1E3A5F] pb-1 border-b border-slate-100 w-full">
                01. Candidate Profile &amp; Privacy Controls
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="vp-fullname"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="vp-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Tariq Al-Mansoor"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-[#2A7B88] focus:outline-none focus:ring-2 focus:ring-[#2A7B88]/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="vp-location"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Current Location (City, Country) <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="vp-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Nairobi, Kenya"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-[#2A7B88] focus:outline-none focus:ring-2 focus:ring-[#2A7B88]/20"
                  />
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Work Availability
                </span>
                <div className="flex flex-wrap gap-2">
                  {AVAILABILITY_OPTIONS.map((opt) => {
                    const selected = availability.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleAvailability(opt)}
                        aria-pressed={selected}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#2A7B88] ${
                          selected
                            ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                            : 'bg-[#F4F6F9] text-slate-700 border-slate-200 hover:bg-slate-200/70'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="vp-prior-qual"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Prior / Foreign Qualification Note
                </label>
                <input
                  id="vp-prior-qual"
                  type="text"
                  value={priorQualification}
                  onChange={(e) => setPriorQualification(e.target.value)}
                  placeholder="e.g. B.Sc. Computer Science, Damascus Univ. — physical degree lost in transit"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-[#2A7B88] focus:outline-none focus:ring-2 focus:ring-[#2A7B88]/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="vp-email"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="vp-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.org"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-[#2A7B88] focus:outline-none focus:ring-2 focus:ring-[#2A7B88]/20"
                  />
                </div>
                <div>
                  <label
                    htmlFor="vp-whatsapp"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    WhatsApp / Phone
                  </label>
                  <input
                    id="vp-whatsapp"
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+254 712 000 000"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-[#2A7B88] focus:outline-none focus:ring-2 focus:ring-[#2A7B88]/20"
                  />
                </div>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-slate-600">
                <Lock className="w-3.5 h-3.5 text-[#2A7B88] shrink-0" aria-hidden="true" />
                <span>
                  Masked from employers by default. Disclosed only upon approved interview request.
                </span>
              </p>

              <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#F4F6F9] border border-slate-200">
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-900 block">
                    Publish to Employer &amp; Partner Talent Registry
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    {published
                      ? 'Visible to verified hiring partners (contact masked)'
                      : 'Private Draft — only you and Admin Verifiers can view'}
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={published}
                  aria-label="Publish to Employer and Partner Talent Registry"
                  onClick={handlePublishToggle}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#2A7B88] ${
                    published ? 'bg-[#16A34A]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-150 ${
                      published ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </fieldset>

            {/* 2. Displacement & Cross-Border Status Verification Gate */}
            <fieldset className="space-y-4 pt-2 border-t border-slate-200">
              <legend className="text-sm font-bold text-[#1E3A5F] pb-1 w-full">
                02. Displacement &amp; Cross-Border Status Verification Gate
              </legend>

              <div>
                <label
                  htmlFor="vp-pathway"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Protection / Displacement Pathway
                </label>
                <select
                  id="vp-pathway"
                  value={displacementPathway}
                  onChange={(e) => setDisplacementPathway(e.target.value as DisplacementPathway)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-[#2A7B88] focus:outline-none focus:ring-2 focus:ring-[#2A7B88]/20"
                >
                  {PATHWAYS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="vp-doctype"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Document Type
                  </label>
                  <select
                    id="vp-doctype"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as DisplacementDocumentType)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-[#2A7B88] focus:outline-none focus:ring-2 focus:ring-[#2A7B88]/20"
                  >
                    {DOCUMENT_TYPES.map((dt) => (
                      <option key={dt} value={dt}>
                        {dt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="vp-refnum"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Reference / Manifest Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="vp-refnum"
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="UNHCR-KEN-2026-48219"
                    className={`w-full px-3 py-2 text-sm font-mono rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 ${
                      referenceNumber && !refValidation.valid
                        ? 'border-amber-500 focus:ring-amber-500/20'
                        : 'border-slate-300 focus:border-[#2A7B88] focus:ring-[#2A7B88]/20'
                    }`}
                  />
                </div>
              </div>
              {referenceNumber && (
                <p
                  className={`text-xs ${
                    refValidation.valid ? 'text-[#16A34A]' : 'text-[#D97706]'
                  }`}
                >
                  {refValidation.message}
                </p>
              )}

              <div className="p-3.5 rounded-lg bg-[#F4F6F9] border border-slate-200 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-800">
                    Document Proof Upload (JPG, PNG, PDF)
                  </span>
                  <button
                    type="button"
                    onClick={handleLoadSampleDocument}
                    className="text-xs font-semibold text-[#2A7B88] hover:text-[#1E3A5F] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-[#2A7B88]"
                  >
                    Load Sample Document
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-800 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#1E3A5F]" aria-hidden="true" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileUpload}
                      className="sr-only"
                    />
                  </label>

                  {documentMeta && (
                    <button
                      type="button"
                      onClick={() => setPreviewModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs font-medium text-[#1E3A5F] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                      <span className="truncate max-w-[180px]">{documentMeta.fileName}</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Encrypted privacy notice: Only lightweight document metadata is persisted locally
                  for Admin verification. Never exposed in Employer searches or public share links.
                </p>
              </div>
            </fieldset>

            {/* 3. Talent Pathway Selector */}
            <fieldset className="space-y-4 pt-2 border-t border-slate-200">
              <legend className="text-sm font-bold text-[#1E3A5F] pb-1 w-full">
                03. Practical Evidence Mode
              </legend>

              <div
                role="tablist"
                aria-label="Talent Pathway Mode"
                className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#F4F6F9] border border-slate-200"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={evidenceMode === 'tech'}
                  onClick={() => setEvidenceMode('tech')}
                  className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                    evidenceMode === 'tech'
                      ? 'bg-[#1E3A5F] text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <Github className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Tech &amp; Digital Talent</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={evidenceMode === 'practitioner'}
                  onClick={() => setEvidenceMode('practitioner')}
                  className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                    evidenceMode === 'practitioner'
                      ? 'bg-[#1E3A5F] text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>All Professions &amp; Trades</span>
                </button>
              </div>

              {evidenceMode === 'tech' ? (
                <div className="space-y-3.5">
                  <div>
                    <label
                      htmlFor="vp-github"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      GitHub Username
                    </label>
                    <input
                      id="vp-github"
                      type="text"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="e.g. torvalds or tariq-cloud-sys"
                      className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-[#2A7B88] focus:outline-none focus:ring-2 focus:ring-[#2A7B88]/20"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Queries public GitHub repositories with automatic deterministic fallback if
                      offline or rate-limited.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="vp-work-sample"
                        className="block text-xs font-semibold text-slate-700"
                      >
                        Architecture &amp; Technical Summary <span className="text-red-600">*</span>
                      </label>
                      <span
                        className={`text-[11px] font-mono tabular-nums ${
                          charCount >= 40 ? 'text-[#16A34A]' : 'text-slate-500'
                        }`}
                      >
                        {charCount}/40 min chars
                      </span>
                    </div>
                    <textarea
                      id="vp-work-sample"
                      rows={5}
                      value={workSampleText}
                      onChange={(e) => setWorkSampleText(e.target.value)}
                      placeholder="Describe stack/tools (TypeScript, AWS, Docker), sequential architecture steps, security/OWASP/GDPR safeguards, and measurable outcomes (uptime %, latency reduction, users served)..."
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-[#2A7B88] focus:outline-none focus:ring-2 focus:ring-[#2A7B88]/20"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label
                        htmlFor="vp-sector"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Sector
                      </label>
                      <select
                        id="vp-sector"
                        value={sectorId}
                        onChange={(e) => handleSectorChange(e.target.value as SectorId)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-[#2A7B88] focus:outline-none focus:ring-2 focus:ring-[#2A7B88]/20"
                      >
                        {(['education', 'healthcare', 'trades', 'business', 'agriculture'] as SectorId[]).map(
                          (sid) => (
                            <option key={sid} value={sid}>
                              {SECTORS[sid].label}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="vp-role"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Target Role
                      </label>
                      <select
                        id="vp-role"
                        value={useCustomRole ? '__custom__' : targetRole}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setUseCustomRole(true);
                          } else {
                            setUseCustomRole(false);
                            setTargetRole(e.target.value);
                          }
                        }}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-[#2A7B88] focus:outline-none focus:ring-2 focus:ring-[#2A7B88]/20"
                      >
                        {SECTORS[sectorId].roles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                        <option value="__custom__">Custom Role...</option>
                      </select>
                    </div>
                  </div>

                  {useCustomRole && (
                    <div>
                      <label
                        htmlFor="vp-custom-role"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Specify Custom Role Title
                      </label>
                      <input
                        id="vp-custom-role"
                        type="text"
                        value={customRoleInput}
                        onChange={(e) => setCustomRoleInput(e.target.value)}
                        placeholder="e.g. Pediatric Midwife or Cold-Chain Logistics Tech"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-[#2A7B88] focus:outline-none focus:ring-2 focus:ring-[#2A7B88]/20"
                      />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="vp-practitioner-sample"
                        className="block text-xs font-semibold text-slate-700"
                      >
                        Practical Work Sample <span className="text-red-600">*</span>
                      </label>
                      <span
                        className={`text-[11px] font-mono tabular-nums ${
                          charCount >= 40 ? 'text-[#16A34A]' : 'text-slate-500'
                        }`}
                      >
                        {charCount}/40 min chars
                      </span>
                    </div>
                    <textarea
                      id="vp-practitioner-sample"
                      rows={5}
                      value={workSampleText}
                      onChange={(e) => setWorkSampleText(e.target.value)}
                      placeholder="Detail: (1) Tools/instruments used, (2) Step-by-step workflow execution, (3) Safety/ethics standards (WHO, PPE, CBC, IFRS, ISO), and (4) Measurable outcomes (patients, learners, % reduction)..."
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-[#2A7B88] focus:outline-none focus:ring-2 focus:ring-[#2A7B88]/20"
                    />
                  </div>
                </div>
              )}
            </fieldset>

            {formError && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-800 flex items-start gap-2"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" aria-hidden="true" />
                <span>{formError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isEvaluating}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#1E3A5F] hover:bg-[#162C49] disabled:opacity-60 text-white text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2A7B88]"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Evaluating Evidence &amp; Mapping Equivalences...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  <span>Verify Skills &amp; Generate Passport</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* RIGHT PANEL: Verified Skill Passport & Bridging Roadmap */}
        <section aria-label="Verified Skill Passport Preview" className="lg:col-span-7 space-y-5">
          {isBlankDraft || !activeCandidate ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 text-center">
              <div className="mx-auto w-28 h-28 rounded-2xl bg-[#F4F6F9] border border-slate-200 flex items-center justify-center mb-6">
                <svg
                  viewBox="0 0 96 96"
                  className="w-16 h-16"
                  aria-hidden="true"
                >
                  <rect
                    x="18"
                    y="12"
                    width="60"
                    height="72"
                    rx="6"
                    fill="#FFFFFF"
                    stroke="#1E3A5F"
                    strokeWidth="2.5"
                  />
                  <circle cx="48" cy="38" r="11" fill="#2A7B88" opacity="0.2" stroke="#2A7B88" strokeWidth="2" />
                  <path
                    d="M43 38 L46.5 41.5 L54 34"
                    fill="none"
                    stroke="#1E3A5F"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line x1="30" y1="58" x2="66" y2="58" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
                  <line x1="34" y1="67" x2="62" y2="67" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#1E3A5F] text-balance">
                Ready to Build a Verified Skill Passport
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
                Submit evidence on the left or click &lsquo;Load Sample Profile&rsquo; to preview a
                verified passport.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onLoadSample('tech')}
                  className="px-4 py-2 rounded-lg bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold transition-colors"
                >
                  Preview Tech Sample
                </button>
                <button
                  type="button"
                  onClick={() => onLoadSample('healthcare')}
                  className="px-4 py-2 rounded-lg bg-[#2A7B88] hover:bg-[#22646F] text-white text-xs font-semibold transition-colors"
                >
                  Preview Healthcare Sample
                </button>
                <button
                  type="button"
                  onClick={() => onLoadSample('education')}
                  className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors"
                >
                  Preview Education Sample
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Action Toolbar (hidden when printing) */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 print:hidden">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    <Printer className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Print / Save PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    <Link2 className="w-3.5 h-3.5 text-[#2A7B88]" aria-hidden="true" />
                    <span>Shareable Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleShortlist}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      activeCandidate.shortlisted
                        ? 'bg-teal-50 border-[#2A7B88] text-[#1E3A5F]'
                        : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${
                        activeCandidate.shortlisted ? 'fill-[#2A7B88] text-[#2A7B88]' : ''
                      }`}
                      aria-hidden="true"
                    />
                    <span>
                      {activeCandidate.shortlisted ? 'Shortlisted' : 'Save to Partner Shortlist'}
                    </span>
                  </button>
                </div>

                {lastShareUrl && (
                  <button
                    type="button"
                    onClick={() => onPreviewPublicLink(lastShareUrl)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#2A7B88] hover:text-[#1E3A5F] underline underline-offset-2 whitespace-nowrap shrink-0"
                  >
                    <span>Preview Public Certificate</span>
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* PRINTABLE PASSPORT CARD */}
              <article
                id="veripath-passport-card"
                className="bg-white border border-slate-200 rounded-xl overflow-hidden"
              >
                {/* Passport Header */}
                <div className="bg-[#1E3A5F] text-white p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#2A7B88] text-white text-xs font-semibold">
                          <Award className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{activeCandidate.competencyTier}</span>
                        </span>

                        {activeCandidate.displacementStatus === 'Verified' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#16A34A] text-white text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Displacement Status Verified</span>
                          </span>
                        )}
                        {activeCandidate.displacementStatus === 'Pending Review' && (
                          <span
                            title="Awaiting Admin Verifier review of displacement document before bridging stipend unlocks."
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#D97706] text-white text-xs font-semibold cursor-help"
                          >
                            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Status Review Pending</span>
                          </span>
                        )}
                        {activeCandidate.displacementStatus === 'Rejected' && (
                          <span
                            title={
                              activeCandidate.displacementAdminNote ||
                              'Document requires re-upload in verification gate.'
                            }
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-600 text-white text-xs font-semibold"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Re-upload Required</span>
                          </span>
                        )}
                      </div>

                      <h2 className="text-2xl font-bold text-white leading-tight">
                        {activeCandidate.fullName}
                      </h2>
                      <p className="text-sm text-teal-100 font-medium mt-1">
                        {activeCandidate.targetRole} · {activeCandidate.sectorLabel}
                      </p>
                      <p className="text-xs text-slate-200 mt-1">
                        {activeCandidate.location} · Availability:{' '}
                        {activeCandidate.availability.join(' / ')}
                      </p>
                    </div>

                    <div className="bg-white/10 border border-white/15 rounded-lg p-3.5 text-right shrink-0">
                      <span className="text-[11px] text-slate-200 block">Credential ID</span>
                      <span className="font-mono text-base font-bold text-white tabular-nums block">
                        {activeCandidate.credentialId}
                      </span>
                      <span className="text-[11px] text-slate-300 font-mono tabular-nums block mt-1">
                        Issued {activeCandidate.issueDate}
                      </span>
                      <span className="text-xs font-semibold text-teal-200 font-mono tabular-nums block mt-1.5">
                        Composite Score: {activeCandidate.overallScore}%
                      </span>
                    </div>
                  </div>

                  {activeCandidate.priorQualification && (
                    <p className="mt-4 pt-3 border-t border-white/15 text-xs text-slate-200">
                      <span className="font-semibold text-white">Prior Qualification Record:</span>{' '}
                      {activeCandidate.priorQualification}
                    </p>
                  )}

                  {activeCandidate.displacementStatus === 'Rejected' &&
                    activeCandidate.displacementAdminNote && (
                      <div className="mt-3 p-2.5 rounded-lg bg-red-950/50 border border-red-400/40 text-xs text-red-100">
                        <strong>Admin Verifier Note:</strong>{' '}
                        {activeCandidate.displacementAdminNote}
                      </div>
                    )}
                </div>

                {/* GitHub Evidence Strip (if Tech mode) */}
                {activeCandidate.evidenceMode === 'tech' && activeCandidate.githubEvidence && (
                  <div className="px-6 py-4 bg-[#F4F6F9] border-b border-slate-200 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#1E3A5F]">
                        <Github className="w-4 h-4" aria-hidden="true" />
                        <span>
                          Verified Engineering Portfolio (@{activeCandidate.githubEvidence.username})
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-700 tabular-nums">
                        {activeCandidate.githubEvidence.reposCount} Repos ·{' '}
                        {activeCandidate.githubEvidence.estimatedCommits} Commits ·{' '}
                        {activeCandidate.githubEvidence.primaryLanguages.join(', ')}
                      </span>
                    </div>

                    {activeCandidate.githubEvidence.usedFallback && (
                      <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-1.5">
                        {activeCandidate.githubEvidence.fallbackReason}
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {activeCandidate.githubEvidence.repositories.slice(0, 4).map((repo) => (
                        <div
                          key={repo.name}
                          className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-semibold text-[#1E3A5F] truncate">
                              {repo.name}
                            </span>
                            <span className="text-slate-500 font-mono shrink-0">
                              {repo.language}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1 line-clamp-1">{repo.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Credential Equivalence Crosswalk */}
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-[#1E3A5F] mb-3">
                    International Credential Equivalence Crosswalk
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {activeCandidate.equivalences.map((eq) => (
                      <div
                        key={eq.framework}
                        className="p-3.5 rounded-lg bg-[#F4F6F9] border border-slate-200"
                      >
                        <span className="text-[11px] font-semibold text-[#2A7B88] block">
                          {eq.framework}
                        </span>
                        <span className="text-sm font-bold text-[#1E3A5F] block mt-0.5">
                          {eq.level}
                        </span>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          {eq.plainEnglish}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Domain Competency Scorecards */}
                <div className="p-6 border-b border-slate-200 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-[#1E3A5F]">
                      Domain Competency Scorecards
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-mono tabular-nums">
                      <span>Tools {activeCandidate.rubricBreakdown.toolDensity}%</span>
                      <span>·</span>
                      <span>Workflow {activeCandidate.rubricBreakdown.workflowMethodology}%</span>
                      <span>·</span>
                      <span>Safety {activeCandidate.rubricBreakdown.safetyCompliance}%</span>
                      <span>·</span>
                      <span>Impact {activeCandidate.rubricBreakdown.measurableImpact}%</span>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
                    {activeCandidate.scorecards.map((card) => (
                      <div key={card.id} className="p-4 space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-semibold text-slate-900">
                            {card.domain}
                          </span>
                          <span className="font-mono text-sm font-bold text-[#1E3A5F] tabular-nums shrink-0">
                            {card.score}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#2A7B88] transition-all duration-300"
                            style={{ width: `${card.score}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {card.evidenceSummary}
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                          <span className="text-slate-500">
                            Signals: {card.detectedSignals.join(' · ')}
                          </span>
                          <span className="text-[#1E3A5F] font-medium">
                            Bridge: {card.bridgingRecommendation}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Readiness Cards & Paid Trial Match */}
                <div className="p-6 bg-[#F4F6F9]">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-xs font-semibold text-slate-500 block">
                        Work Authorization Readiness
                      </span>
                      <span className="text-sm font-bold text-[#1E3A5F] mt-1 block">
                        {activeCandidate.displacementStatus === 'Verified'
                          ? 'Verified Protection Pathway'
                          : activeCandidate.displacementStatus === 'Rejected'
                          ? 'Re-verification Required'
                          : 'Awaiting Admin Sign-off'}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-xs font-semibold text-slate-500 block">
                        Regulatory &amp; Safety Compliance
                      </span>
                      <span className="text-sm font-bold text-[#16A34A] mt-1 block tabular-nums">
                        {activeCandidate.rubricBreakdown.safetyCompliance}% Protocol Alignment
                      </span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-xs font-semibold text-slate-500 block">
                        UN SDG Alignment
                      </span>
                      <span className="text-xs font-semibold text-[#2A7B88] mt-1 block leading-snug">
                        {activeCandidate.sdgTags.join(' · ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 print:hidden">
                    <div className="text-xs text-slate-600">
                      {activeCandidate.trialMatch.requested ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-[#16A34A]">
                          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                          <span>
                            Paid Trial Match Active · Reference{' '}
                            <code className="font-mono">
                              {activeCandidate.trialMatch.referenceCode}
                            </code>
                          </span>
                        </span>
                      ) : (
                        <span>
                          Opt into a 4–6 week compensated employer trial placement using this
                          passport.
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleRequestTrialMatch}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        activeCandidate.trialMatch.requested
                          ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                          : 'bg-[#2A7B88] hover:bg-[#22646F] text-white'
                      }`}
                    >
                      <span>
                        {activeCandidate.trialMatch.requested
                          ? 'Trial Match Requested'
                          : 'Request Paid Trial Match'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>

              {/* Interactive Micro-Assessment & Bridging Voucher (outside print card or interactive) */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 print:hidden">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#1E3A5F] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#2A7B88]" aria-hidden="true" />
                      <span>
                        Interactive Micro-Assessment &amp; Bridging Stipend Voucher (
                        {activeCandidate.sectorLabel})
                      </span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Score 2/3 or higher on this sector scenario check to generate an official
                      Bridging Exam Fee Waiver Voucher.
                    </p>
                  </div>
                  {activeCandidate.voucher && (
                    <div className="text-right">
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        Issued Voucher
                      </span>
                      <span className="font-mono text-sm font-bold text-[#1E3A5F] tabular-nums">
                        {activeCandidate.voucher.code}
                      </span>
                    </div>
                  )}
                </div>

                {/* Active / Provisional Voucher Banner */}
                {activeCandidate.voucher && (
                  <div
                    className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${
                      activeCandidate.voucher.status === 'Active'
                        ? 'bg-emerald-50 border-emerald-200'
                        : activeCandidate.voucher.status === 'Provisional'
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Ticket
                        className={`w-5 h-5 shrink-0 mt-0.5 ${
                          activeCandidate.voucher.status === 'Active'
                            ? 'text-[#16A34A]'
                            : activeCandidate.voucher.status === 'Provisional'
                            ? 'text-[#D97706]'
                            : 'text-red-600'
                        }`}
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Bridging Exam Fee Waiver Voucher:{' '}
                          <span className="font-mono">{activeCandidate.voucher.code}</span> ($
                          {activeCandidate.voucher.amountUsd} USD Value)
                        </p>
                        <p className="text-xs text-slate-700 mt-0.5">
                          {activeCandidate.voucher.status === 'Active'
                            ? 'Active — Verified displacement status confirmed. Redeemable with accredited licensing bodies.'
                            : activeCandidate.voucher.status === 'Provisional'
                            ? 'Provisional — Unlocks upon Admin ID verification in the Admin Approvals queue.'
                            : 'Suspended — Pending displacement document re-verification.'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        activeCandidate.voucher.status === 'Active'
                          ? 'bg-[#16A34A] text-white'
                          : activeCandidate.voucher.status === 'Provisional'
                          ? 'bg-[#D97706] text-white'
                          : 'bg-red-600 text-white'
                      }`}
                    >
                      {activeCandidate.voucher.status}
                    </span>
                  </div>
                )}

                {/* 3-Question Scenario Quiz */}
                <div className="space-y-4">
                  {activeQuestions.map((q, qIdx) => {
                    const chosen = quizAnswers[q.id];
                    return (
                      <div
                        key={q.id}
                        className="p-4 rounded-lg bg-[#F4F6F9] border border-slate-200 space-y-2.5"
                      >
                        <p className="text-sm font-semibold text-slate-900">
                          {qIdx + 1}. {q.question}
                        </p>
                        <div className="space-y-1.5">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = chosen === oIdx;
                            const isCorrect = q.correctIndex === oIdx;
                            let optionStyle =
                              'bg-white border-slate-200 text-slate-800 hover:border-[#2A7B88]';
                            if (quizSubmitted) {
                              if (isCorrect) {
                                optionStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-medium';
                              } else if (isSelected && !isCorrect) {
                                optionStyle = 'bg-red-50 border-red-300 text-red-900';
                              }
                            } else if (isSelected) {
                              optionStyle = 'bg-teal-50 border-[#2A7B88] text-[#1E3A5F] font-medium';
                            }

                            return (
                              <label
                                key={opt}
                                className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${optionStyle}`}
                              >
                                <input
                                  type="radio"
                                  name={q.id}
                                  checked={isSelected}
                                  onChange={() => {
                                    setQuizAnswers((prev) => ({ ...prev, [q.id]: oIdx }));
                                    if (quizSubmitted) setQuizSubmitted(false);
                                  }}
                                  className="mt-0.5 accent-[#1E3A5F]"
                                />
                                <span>{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                        {quizSubmitted && (
                          <p className="text-xs text-slate-700 bg-white border border-slate-200 rounded-md p-2.5 leading-relaxed">
                            <strong className="text-[#1E3A5F]">Rationale:</strong> {q.rationale}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-[#2A7B88]" aria-hidden="true" />
                    <span>Aligned with SDG 4, SDG 8 &amp; SDG 10</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold transition-colors"
                  >
                    <FileCheck2 className="w-4 h-4" aria-hidden="true" />
                    <span>Grade Micro-Assessment &amp; Unlock Voucher</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <DocumentPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        candidateName={fullName || activeCandidate?.fullName || 'Candidate Draft'}
        pathway={displacementPathway}
        documentType={documentType}
        referenceNumber={referenceNumber}
        displacementStatus={activeCandidate?.displacementStatus || 'Pending Review'}
        documentMeta={documentMeta}
        liveBlobUrl={currentBlobUrl}
      />
    </div>
  );
}
