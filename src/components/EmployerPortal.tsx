import { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Bookmark,
  Send,
  X,
  CreditCard,
  Smartphone,
  FileSpreadsheet,
  ShieldCheck,
  Award,
  ExternalLink,
} from 'lucide-react';
import {
  ActiveSession,
  AvailabilityOption,
  BillingState,
  BillingTierId,
  CandidateProfile,
  CompetencyTier,
  PartnerContactRequest,
  PaymentRailId,
  PipelineStage,
  SectorId,
} from '../types/veripath';
import {
  exportSanitizedPipelineCsv,
  isPartnerApprovedForCandidate,
  maskEmail,
  maskPhone,
} from '../utils/storage';

interface EmployerPortalProps {
  registry: CandidateProfile[];
  requests: PartnerContactRequest[];
  session: ActiveSession;
  billing: BillingState;
  onUpdateCandidate: (candidate: CandidateProfile) => void;
  onCreateContactRequest: (
    request: Omit<PartnerContactRequest, 'id' | 'status' | 'createdAt'>
  ) => void;
  onUpdateSessionPartner: (partner: ActiveSession['partnerProfile']) => void;
  onUpdateBilling: (billing: BillingState) => void;
  onNotify: (
    title: string,
    variant: 'success' | 'info' | 'warning' | 'error',
    description?: string
  ) => void;
}

const PIPELINE_STAGES: PipelineStage[] = [
  'Reviewed',
  'Trial Requested',
  'Interview Scheduled',
  'Placed',
];

const BILLING_TIERS: Array<{
  id: BillingTierId;
  name: string;
  price: string;
  audience: string;
  limits: string[];
}> = [
  {
    id: 'employer_saas',
    name: 'Employer SaaS',
    price: '$99/mo',
    audience: 'For scaling hiring teams & regional employers',
    limits: [
      'Up to 25 active candidate contact unlocks / mo',
      'Sanitized CSV pipeline & trial match tracking',
      'Instant VP-2026 credential verification lookup',
    ],
  },
  {
    id: 'institutional_api',
    name: 'Institutional Verification API',
    price: '$249/mo',
    audience: 'For universities, licensing councils & HRIS platforms',
    limits: [
      'Unlimited automated credential equivalence queries',
      'SFIA, EQF, KNQF & UNESCO ISCED JSON crosswalks',
      'Dedicated compliance audit logs & webhook alerts',
    ],
  },
  {
    id: 'ngo_cohort',
    name: 'NGO Cohort Sponsorship',
    price: '$499/cohort',
    audience: 'For humanitarian agencies, CBOs & donor programs',
    limits: [
      'Sponsors 50 displaced professionals end-to-end',
      'Funds bridging exam fee waiver stipends',
      'Co-branded SDG 4 / 8 / 10 / 17 donor impact ledger',
    ],
  },
];

const PAYMENT_RAILS: Array<{
  id: PaymentRailId;
  label: string;
  detail: string;
  icon: typeof CreditCard;
}> = [
  {
    id: 'stripe',
    label: 'Global Card / Stripe',
    detail: 'Visa, Mastercard, Corporate Amex & SEPA',
    icon: CreditCard,
  },
  {
    id: 'mobile_money',
    label: 'Regional Mobile Money (M-Pesa / Paystack)',
    detail: 'Kenya M-Pesa Till, MTN MoMo, Airtel Money',
    icon: Smartphone,
  },
  {
    id: 'un_po',
    label: 'Invoicing / UN Purchase Orders',
    detail: 'Net-30 institutional PO & UNHCR / NGO disbursement',
    icon: FileSpreadsheet,
  },
];

export function EmployerPortal({
  registry,
  requests,
  session,
  billing,
  onUpdateCandidate,
  onCreateContactRequest,
  onUpdateSessionPartner,
  onUpdateBilling,
  onNotify,
}: EmployerPortalProps) {
  // Credential lookup state
  const [lookupInput, setLookupInput] = useState('');
  const [lookupResult, setLookupResult] = useState<CandidateProfile | null>(null);
  const [lookupNotFound, setLookupNotFound] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState<'all' | SectorId>('all');
  const [tierFilter, setTierFilter] = useState<'all' | CompetencyTier>('all');
  const [displacementFilter, setDisplacementFilter] = useState<
    'all' | 'Verified' | 'Pending Review'
  >('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | AvailabilityOption>('all');
  const [shortlistedOnly, setShortlistedOnly] = useState(false);

  // Partner Contact Request Slide-Over Drawer
  const [drawerCandidate, setDrawerCandidate] = useState<CandidateProfile | null>(null);
  const [partnerName, setPartnerName] = useState(session.partnerProfile.partnerName);
  const [organization, setOrganization] = useState(session.partnerProfile.organization);
  const [partnerEmail, setPartnerEmail] = useState(session.partnerProfile.workEmail);
  const [proposedRoleDetails, setProposedRoleDetails] = useState('');
  const [message, setMessage] = useState('');

  // Institutional Billing Modal
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [billingOrg, setBillingOrg] = useState(billing.organizationName);
  const [billingEmail, setBillingEmail] = useState(billing.billingEmail);
  const [poReference, setPoReference] = useState('');

  // Published directory (only published profiles appear in Employer talent directory)
  const publishedCandidates = useMemo(
    () => registry.filter((c) => c.published),
    [registry]
  );

  // Dynamic Impact Metrics computed directly from veripath_registry
  const kpis = useMemo(() => {
    const totalVerified = registry.length;
    const displacementVerified = registry.filter(
      (c) => c.displacementStatus === 'Verified'
    ).length;
    const stipendsUnlocked = registry.filter(
      (c) => c.voucher && c.voucher.status === 'Active'
    ).length;
    const trialMatches = registry.filter((c) => c.trialMatch.requested).length;
    const sdgSet = new Set<string>();
    registry.forEach((c) => c.sdgTags.forEach((tag) => sdgSet.add(tag.split(':')[0].trim())));
    return {
      totalVerified,
      displacementVerified,
      stipendsUnlocked,
      trialMatches,
      activeSdgCount: sdgSet.size,
    };
  }, [registry]);

  const filteredCandidates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return publishedCandidates.filter((c) => {
      if (sectorFilter !== 'all' && c.sectorId !== sectorFilter) return false;
      if (tierFilter !== 'all' && c.competencyTier !== tierFilter) return false;
      if (displacementFilter !== 'all' && c.displacementStatus !== displacementFilter) {
        return false;
      }
      if (availabilityFilter !== 'all' && !c.availability.includes(availabilityFilter)) {
        return false;
      }
      if (shortlistedOnly && !c.shortlisted) return false;
      if (q) {
        const haystack = [
          c.fullName,
          c.credentialId,
          c.targetRole,
          c.sectorLabel,
          c.location,
          c.workSampleText,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [
    publishedCandidates,
    sectorFilter,
    tierFilter,
    displacementFilter,
    availabilityFilter,
    shortlistedOnly,
    searchQuery,
  ]);

  const handleLookupSubmit = (e: React.FormEvent, overrideId?: string) => {
    e.preventDefault();
    const targetId = (overrideId ?? lookupInput).trim().toUpperCase();
    if (!targetId) return;
    if (overrideId) setLookupInput(overrideId);

    const found = registry.find((c) => c.credentialId.toUpperCase() === targetId);
    if (found) {
      setLookupResult(found);
      setLookupNotFound(false);
    } else {
      setLookupResult(null);
      setLookupNotFound(true);
    }
  };

  const openContactDrawer = (candidate: CandidateProfile) => {
    setDrawerCandidate(candidate);
    setProposedRoleDetails(`4–6 Week Paid Trial Match — ${candidate.targetRole}`);
    setMessage(
      `We verified credential ${candidate.credentialId} and would like to schedule an introductory technical/practical interview.`
    );
  };

  const handleSubmitContactRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawerCandidate) return;

    if (!partnerName.trim() || !organization.trim() || !partnerEmail.trim()) {
      onNotify(
        'Missing partner details',
        'warning',
        'Please provide your name, organization, and work email.'
      );
      return;
    }

    onUpdateSessionPartner({
      partnerName: partnerName.trim(),
      organization: organization.trim(),
      workEmail: partnerEmail.trim(),
    });

    onCreateContactRequest({
      candidateId: drawerCandidate.id,
      candidateName: drawerCandidate.fullName,
      candidateCredentialId: drawerCandidate.credentialId,
      partnerName: partnerName.trim(),
      organization: organization.trim(),
      partnerEmail: partnerEmail.trim(),
      proposedRoleDetails: proposedRoleDetails.trim(),
      message: message.trim(),
    });

    setDrawerCandidate(null);
  };

  const handleConfirmBilling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingOrg.trim() || !billingEmail.trim()) {
      onNotify(
        'Organization & billing email required',
        'warning',
        'Enter institutional billing details to generate your confirmation.'
      );
      return;
    }
    const receiptRef =
      billing.paymentRail === 'un_po'
        ? poReference.trim() || `UN-PO-${Math.floor(10000 + Math.random() * 89999)}`
        : `VP-INV-${Math.floor(10000 + Math.random() * 89999)}`;

    onUpdateBilling({
      ...billing,
      organizationName: billingOrg.trim(),
      billingEmail: billingEmail.trim(),
      lastReceiptRef: receiptRef,
      lastUpdated: new Date().toISOString().slice(0, 10),
    });

    setBillingModalOpen(false);
    onNotify(
      'Institutional Plan Activated',
      'success',
      `Confirmation ${receiptRef} saved under ${billingOrg.trim()}.`
    );
  };

  const activeTierObj =
    BILLING_TIERS.find((t) => t.id === billing.selectedTier) || BILLING_TIERS[0];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Impact Metrics Bar */}
      <section aria-label="Registry Impact Metrics">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <span className="text-xs font-medium text-slate-500 block">
              Total Verified Candidates
            </span>
            <span className="text-2xl font-bold text-[#1E3A5F] font-mono tabular-nums mt-1 block">
              {kpis.totalVerified}
            </span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <span className="text-xs font-medium text-slate-500 block">
              Displacement-Verified
            </span>
            <span className="text-2xl font-bold text-[#16A34A] font-mono tabular-nums mt-1 block">
              {kpis.displacementVerified}
            </span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <span className="text-xs font-medium text-slate-500 block">
              Bridging Stipends Unlocked
            </span>
            <span className="text-2xl font-bold text-[#2A7B88] font-mono tabular-nums mt-1 block">
              {kpis.stipendsUnlocked}
            </span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <span className="text-xs font-medium text-slate-500 block">
              Paid Trial Matches Requested
            </span>
            <span className="text-2xl font-bold text-[#1E3A5F] font-mono tabular-nums mt-1 block">
              {kpis.trialMatches}
            </span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 col-span-2 sm:col-span-1">
            <span className="text-xs font-medium text-slate-500 block">
              Active SDG Coverage
            </span>
            <span className="text-2xl font-bold text-[#1E3A5F] font-mono tabular-nums mt-1 block">
              {kpis.activeSdgCount} / 5 SDGs
            </span>
          </div>
        </div>
      </section>

      {/* 2. Instant Credential ID Lookup */}
      <section
        aria-label="Instant Credential Lookup"
        className="bg-white border border-slate-200 rounded-xl p-5"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-[#1E3A5F]">
              Instant Credential ID Verification Lookup
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Validate any candidate’s <code className="font-mono">VP-2026-XXXX</code> passport
              without exposing raw displacement records.
            </p>
          </div>

          <form onSubmit={(e) => handleLookupSubmit(e)} className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="text"
                value={lookupInput}
                onChange={(e) => {
                  setLookupInput(e.target.value);
                  setLookupNotFound(false);
                }}
                placeholder="Enter VP-2026-4108"
                aria-label="Lookup Credential ID"
                className="pl-9 pr-3 py-2 w-56 text-sm font-mono rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-[#2A7B88] focus:outline-none focus:ring-2 focus:ring-[#2A7B88]/20"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              Verify ID
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-1">
              <span>Try:</span>
              {registry.slice(0, 3).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={(e) => handleLookupSubmit(e, c.credentialId)}
                  className="font-mono text-[#2A7B88] hover:text-[#1E3A5F] underline underline-offset-2"
                >
                  {c.credentialId}
                </button>
              ))}
            </div>
          </form>
        </div>

        {lookupNotFound && (
          <p role="alert" className="mt-3 text-xs font-medium text-red-700">
            No credential matching <code className="font-mono">{lookupInput}</code> found in the
            VeriPath registry.
          </p>
        )}
      </section>

      {/* 3. Filterable Talent Pipeline Directory */}
      <section
        aria-label="Talent Pipeline Directory"
        className="bg-white border border-slate-200 rounded-xl p-5 space-y-5"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1E3A5F]">
              Verified Talent Pipeline Directory
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Showing {filteredCandidates.length} of {publishedCandidates.length} published
              candidates · Contact details remain masked until Admin approval.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShortlistedOnly((prev) => !prev)}
              aria-pressed={shortlistedOnly}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                shortlistedOnly
                  ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Shortlisted Only</span>
            </button>
            <button
              type="button"
              onClick={() => {
                exportSanitizedPipelineCsv(
                  filteredCandidates,
                  requests,
                  session.partnerProfile.workEmail
                );
                onNotify(
                  'Sanitized Pipeline Exported',
                  'success',
                  `Downloaded CSV for ${filteredCandidates.length} candidate(s) with unapproved PII & manifest IDs stripped.`
                );
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#2A7B88] hover:bg-[#22646F] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Export Pipeline (CSV)</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills, role, city..."
              aria-label="Filter talent by keyword"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-[#2A7B88] focus:outline-none"
            />
          </div>

          <select
            aria-label="Filter by Sector"
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value as 'all' | SectorId)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:border-[#2A7B88] focus:outline-none"
          >
            <option value="all">All Sectors</option>
            <option value="tech">Tech &amp; Digital</option>
            <option value="healthcare">Healthcare &amp; Public Health</option>
            <option value="education">Education &amp; Youth</option>
            <option value="trades">Engineering &amp; Skilled Trades</option>
            <option value="business">Business, Finance &amp; Admin</option>
            <option value="agriculture">Agriculture &amp; Livelihoods</option>
          </select>

          <select
            aria-label="Filter by Verification Tier"
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as 'all' | CompetencyTier)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:border-[#2A7B88] focus:outline-none"
          >
            <option value="all">All Competency Tiers</option>
            <option value="Verified Practitioner">Verified Practitioner</option>
            <option value="Proficient">Proficient</option>
            <option value="Emerging">Emerging</option>
          </select>

          <select
            aria-label="Filter by Displacement Status"
            value={displacementFilter}
            onChange={(e) =>
              setDisplacementFilter(e.target.value as 'all' | 'Verified' | 'Pending Review')
            }
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:border-[#2A7B88] focus:outline-none"
          >
            <option value="all">All Displacement Statuses</option>
            <option value="Verified">Verified Only</option>
            <option value="Pending Review">Pending Review</option>
          </select>

          <select
            aria-label="Filter by Availability"
            value={availabilityFilter}
            onChange={(e) =>
              setAvailabilityFilter(e.target.value as 'all' | AvailabilityOption)
            }
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:border-[#2A7B88] focus:outline-none"
          >
            <option value="all">All Availability</option>
            <option value="Remote">Remote</option>
            <option value="Local">Local</option>
            <option value="Relocation">Relocation</option>
          </select>
        </div>

        {/* Candidate Directory Grid */}
        {filteredCandidates.length === 0 ? (
          <div className="p-10 text-center rounded-xl bg-[#F4F6F9] border border-slate-200">
            <p className="text-sm font-semibold text-slate-800">
              No published candidates match the selected filters.
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Clear filters or ask a candidate to toggle &ldquo;Publish to Employer &amp; Partner
              Talent Registry&rdquo;.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCandidates.map((cand) => {
              const contactUnlocked = isPartnerApprovedForCandidate(
                cand.id,
                requests,
                session.partnerProfile.workEmail
              );
              const hasPendingRequest = requests.some(
                (r) =>
                  r.candidateId === cand.id &&
                  r.status === 'pending' &&
                  r.partnerEmail.toLowerCase() ===
                    session.partnerProfile.workEmail.toLowerCase()
              );

              return (
                <article
                  key={cand.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-[#1E3A5F] truncate">
                          {cand.fullName}
                        </h3>
                        <p className="text-xs font-semibold text-[#2A7B88] truncate">
                          {cand.targetRole}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {cand.location} · {cand.availability.join(' / ')}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums block">
                          {cand.credentialId}
                        </span>
                        <span className="font-mono text-sm font-bold text-[#1E3A5F] tabular-nums">
                          {cand.overallScore}%
                        </span>
                      </div>
                    </div>

                    {/* Verification & Displacement Status (explicit text + icon) */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 font-semibold text-[#1E3A5F]">
                        <Award className="w-3.5 h-3.5 text-[#2A7B88]" aria-hidden="true" />
                        <span>{cand.competencyTier}</span>
                      </span>
                      <span className="text-slate-300" aria-hidden="true">
                        ·
                      </span>
                      {cand.displacementStatus === 'Verified' ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-[#16A34A]">
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Status Verified</span>
                        </span>
                      ) : cand.displacementStatus === 'Pending Review' ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-[#D97706]">
                          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Review Pending</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-red-700">
                          <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Re-upload Pending</span>
                        </span>
                      )}
                    </div>

                    {/* Equivalence summary */}
                    <div className="p-3 rounded-lg bg-[#F4F6F9] border border-slate-200 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        Equivalence Benchmarks
                      </span>
                      {cand.equivalences.slice(0, 2).map((eq) => (
                        <p key={eq.framework} className="text-xs text-slate-800 truncate">
                          <strong className="text-[#1E3A5F]">{eq.framework.split(' ')[0]}:</strong>{' '}
                          {eq.level}
                        </p>
                      ))}
                    </div>

                    {/* Top Competencies */}
                    <div className="space-y-1.5">
                      {cand.scorecards.map((sc) => (
                        <div key={sc.id} className="flex items-center justify-between text-xs gap-2">
                          <span className="text-slate-700 truncate">{sc.domain}</span>
                          <span className="font-mono font-semibold text-[#1E3A5F] tabular-nums shrink-0">
                            {sc.score}%
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Masked vs Approved Contact Gate */}
                    <div
                      className={`p-3 rounded-lg border text-xs ${
                        contactUnlocked
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`inline-flex items-center gap-1.5 font-semibold ${
                            contactUnlocked ? 'text-[#16A34A]' : 'text-slate-700'
                          }`}
                        >
                          {contactUnlocked ? (
                            <>
                              <Unlock className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Approved Contact Disclosed</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5 text-[#D97706]" aria-hidden="true" />
                              <span>Contact Masked (Privacy Gate)</span>
                            </>
                          )}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] text-slate-700">
                        {contactUnlocked ? cand.email : maskEmail(cand.email)} ·{' '}
                        {contactUnlocked ? cand.whatsapp : maskPhone(cand.whatsapp)}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 border-t border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor={`stage-${cand.id}`}
                        className="text-xs font-medium text-slate-600 shrink-0"
                      >
                        Pipeline Stage:
                      </label>
                      <select
                        id={`stage-${cand.id}`}
                        value={cand.pipelineStage}
                        onChange={(e) => {
                          const stage = e.target.value as PipelineStage;
                          onUpdateCandidate({ ...cand, pipelineStage: stage });
                          onNotify(
                            'Pipeline stage updated',
                            'info',
                            `${cand.fullName} moved to ${stage}.`
                          );
                        }}
                        className="px-2.5 py-1.5 text-xs font-semibold rounded-md border border-slate-300 bg-white text-[#1E3A5F] focus:border-[#2A7B88] focus:outline-none"
                      >
                        {PIPELINE_STAGES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openContactDrawer(cand)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold transition-colors whitespace-nowrap"
                      >
                        <Send className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>
                          {contactUnlocked
                            ? 'Send New Interview Note'
                            : hasPendingRequest
                            ? 'Request Pending Admin'
                            : 'Request Contact for Interview'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLookupResult(cand)}
                        aria-label={`Inspect credential ${cand.credentialId}`}
                        className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onUpdateCandidate({ ...cand, shortlisted: !cand.shortlisted });
                          onNotify(
                            cand.shortlisted ? 'Removed from shortlist' : 'Shortlisted',
                            'info',
                            cand.fullName
                          );
                        }}
                        aria-label="Toggle shortlist"
                        aria-pressed={cand.shortlisted}
                        className={`p-2 rounded-lg border transition-colors ${
                          cand.shortlisted
                            ? 'bg-teal-50 border-[#2A7B88] text-[#2A7B88]'
                            : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${cand.shortlisted ? 'fill-[#2A7B88]' : ''}`}
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Institutional Billing & Sponsorship Plans */}
      <section
        aria-label="Institutional Billing and Sponsorship Plans"
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1E3A5F]">
              Institutional Billing &amp; Cohort Sponsorship
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Sustainable employer &amp; institutional access subsidizes verification and bridging
              stipends for displaced talent.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#16A34A] shrink-0">
            <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Free Forever for Displaced Professionals &amp; Workers</span>
          </div>
        </div>

        {/* Subscription Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BILLING_TIERS.map((tier) => {
            const isSelected = billing.selectedTier === tier.id;
            return (
              <div
                key={tier.id}
                className={`rounded-xl border p-5 flex flex-col justify-between gap-4 transition-colors ${
                  isSelected
                    ? 'border-[#2A7B88] bg-teal-50/30'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-[#1E3A5F]">{tier.name}</h3>
                      <p className="text-xs text-slate-600 mt-0.5">{tier.audience}</p>
                    </div>
                    <span className="font-mono text-lg font-bold text-[#1E3A5F] tabular-nums shrink-0">
                      {tier.price}
                    </span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                    {tier.limits.map((lim) => (
                      <li key={lim} className="flex items-start gap-2">
                        <CheckCircle2
                          className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{lim}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => onUpdateBilling({ ...billing, selectedTier: tier.id })}
                  className={`w-full py-2 px-4 rounded-lg text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'bg-[#1E3A5F] text-white'
                      : 'bg-[#F4F6F9] hover:bg-slate-200 text-slate-900 border border-slate-200'
                  }`}
                >
                  {isSelected ? 'Selected Plan' : `Select ${tier.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Payment Rails & Confirmation Trigger */}
        <div className="p-4 rounded-xl bg-[#F4F6F9] border border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#1E3A5F] block">
              Select Institutional Payment Rail
            </span>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_RAILS.map((rail) => {
                const Icon = rail.icon;
                const active = billing.paymentRail === rail.id;
                return (
                  <button
                    key={rail.id}
                    type="button"
                    onClick={() => onUpdateBilling({ ...billing, paymentRail: rail.id })}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                      active
                        ? 'bg-white border-[#2A7B88] text-[#1E3A5F] font-semibold shadow-2xs'
                        : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-[#2A7B88]" aria-hidden="true" />
                    <span>{rail.label}</span>
                  </button>
                );
              })}
            </div>
            {billing.lastReceiptRef && (
              <p className="text-xs text-[#16A34A] font-medium">
                Active Billing Reference: <code className="font-mono">{billing.lastReceiptRef}</code>{' '}
                ({billing.organizationName})
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setBillingModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#2A7B88] hover:bg-[#22646F] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <Building2 className="w-4 h-4" aria-hidden="true" />
            <span>
              {billing.paymentRail === 'un_po'
                ? 'Generate Invoice / UN PO'
                : `Confirm ${activeTierObj.name} (${activeTierObj.price})`}
            </span>
          </button>
        </div>
      </section>

      {/* Instant Credential Verification Modal */}
      {lookupResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lookup-modal-title"
        >
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-xl w-full overflow-hidden">
            <div className="bg-[#1E3A5F] text-white px-5 py-4 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-teal-200 block tabular-nums">
                  {lookupResult.credentialId} · Issued {lookupResult.issueDate}
                </span>
                <h3 id="lookup-modal-title" className="text-lg font-bold">
                  {lookupResult.fullName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLookupResult(null)}
                aria-label="Close credential lookup"
                className="p-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <p className="font-semibold text-slate-900">{lookupResult.targetRole}</p>
                  <p className="text-xs text-slate-600">
                    {lookupResult.sectorLabel} · {lookupResult.location}
                  </p>
                </div>
                <span className="font-mono text-base font-bold text-[#1E3A5F] tabular-nums">
                  {lookupResult.overallScore}% ({lookupResult.competencyTier})
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#1E3A5F]">Equivalence Standards</h4>
                {lookupResult.equivalences.map((eq) => (
                  <div
                    key={eq.framework}
                    className="p-2.5 rounded-lg bg-[#F4F6F9] border border-slate-200 text-xs"
                  >
                    <span className="font-semibold text-[#1E3A5F]">{eq.framework}:</span>{' '}
                    <span className="text-slate-800">{eq.level}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#1E3A5F]">Verified Competencies</h4>
                {lookupResult.scorecards.map((sc) => (
                  <div key={sc.id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-700">{sc.domain}</span>
                    <span className="font-mono font-bold text-[#2A7B88] tabular-nums">
                      {sc.score}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="text-xs text-slate-500">
                  Raw displacement documents are restricted to Admin Verifiers.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const c = lookupResult;
                    setLookupResult(null);
                    openContactDrawer(c);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#2A7B88] hover:bg-[#22646F] text-white text-xs font-semibold"
                >
                  Request Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partner Contact Request Slide-Over Drawer */}
      {drawerCandidate && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-drawer-title"
        >
          <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto">
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-xs font-semibold text-[#2A7B88] block">
                    Privacy-Gated Contact Request
                  </span>
                  <h3 id="contact-drawer-title" className="text-lg font-bold text-[#1E3A5F]">
                    {drawerCandidate.fullName}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {drawerCandidate.targetRole} ·{' '}
                    <span className="font-mono">{drawerCandidate.credentialId}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerCandidate(null)}
                  aria-label="Close contact request drawer"
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form id="contact-request-form" onSubmit={handleSubmitContactRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Partner Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-[#2A7B88] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Organization / NGO / Employer <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-[#2A7B88] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Work Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={partnerEmail}
                    onChange={(e) => setPartnerEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-[#2A7B88] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Proposed Role / Paid Trial Details
                  </label>
                  <input
                    type="text"
                    value={proposedRoleDetails}
                    onChange={(e) => setProposedRoleDetails(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-[#2A7B88] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Message to Candidate &amp; Admin Verifier
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-[#2A7B88] focus:outline-none"
                  />
                </div>

                <p className="text-xs text-slate-600 p-3 rounded-lg bg-[#F4F6F9] border border-slate-200">
                  Your request enters the <strong>Admin Approvals</strong> queue. Once approved,
                  the candidate’s unmasked email and WhatsApp number become visible on your partner
                  view.
                </p>
              </form>
            </div>

            <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDrawerCandidate(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="contact-request-form"
                className="px-4 py-2 rounded-lg bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold"
              >
                Submit Contact Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Institutional Billing & Invoice Modal */}
      {billingModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="billing-modal-title"
        >
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-5 py-4 bg-[#1E3A5F] text-white flex items-center justify-between">
              <div>
                <h3 id="billing-modal-title" className="text-base font-bold">
                  {activeTierObj.name} — {activeTierObj.price}
                </h3>
                <p className="text-xs text-teal-100">
                  {PAYMENT_RAILS.find((r) => r.id === billing.paymentRail)?.label}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBillingModalOpen(false)}
                aria-label="Close billing modal"
                className="p-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmBilling} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institution / Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={billingOrg}
                  onChange={(e) => setBillingOrg(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-[#2A7B88] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Finance / Billing Email
                </label>
                <input
                  type="email"
                  required
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-[#2A7B88] focus:outline-none"
                />
              </div>

              {billing.paymentRail === 'un_po' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    UN Purchase Order / Grant Reference (Optional)
                  </label>
                  <input
                    type="text"
                    value={poReference}
                    onChange={(e) => setPoReference(e.target.value)}
                    placeholder="e.g. UN-PO-2026-9941"
                    className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:border-[#2A7B88] focus:outline-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBillingModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-semibold"
                >
                  Confirm &amp; Issue Reference
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
