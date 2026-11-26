import { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ShieldCheck,
  Users,
  MailCheck,
  SlidersHorizontal,
  AlertTriangle,
} from 'lucide-react';
import {
  CandidateProfile,
  DisplacementVerificationStatus,
  PartnerContactRequest,
} from '../types/veripath';
import { DocumentPreviewModal } from './DocumentPreviewModal';

interface AdminPortalProps {
  registry: CandidateProfile[];
  requests: PartnerContactRequest[];
  blobUrls: Record<string, string>;
  onVerifyDisplacement: (
    candidateId: string,
    status: DisplacementVerificationStatus,
    reason?: string
  ) => void;
  onResolveContactRequest: (
    requestId: string,
    decision: 'approved' | 'rejected',
    note?: string
  ) => void;
  onUpdateCandidate: (candidate: CandidateProfile) => void;
  onNotify: (
    title: string,
    variant: 'success' | 'info' | 'warning' | 'error',
    description?: string
  ) => void;
}

export function AdminPortal({
  registry,
  requests,
  blobUrls,
  onVerifyDisplacement,
  onResolveContactRequest,
  onUpdateCandidate,
  onNotify,
}: AdminPortalProps) {
  const [activeQueue, setActiveQueue] = useState<'displacement' | 'contacts' | 'moderation'>(
    'displacement'
  );
  const [statusFilter, setStatusFilter] = useState<'all' | DisplacementVerificationStatus>('all');
  const [previewCandidate, setPreviewCandidate] = useState<CandidateProfile | null>(null);

  // Reject displacement modal state
  const [rejectTarget, setRejectTarget] = useState<CandidateProfile | null>(null);
  const [rejectReason, setRejectReason] = useState('Illegible scan — please re-upload clear copy');

  const pendingDisplacementCount = registry.filter(
    (c) => c.displacementStatus === 'Pending Review'
  ).length;
  const pendingRequestCount = requests.filter((r) => r.status === 'pending').length;

  const filteredQueueCandidates = registry.filter((c) =>
    statusFilter === 'all' ? true : c.displacementStatus === statusFilter
  );

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTarget) return;
    onVerifyDisplacement(
      rejectTarget.id,
      'Rejected',
      rejectReason.trim() || 'Illegible scan or mismatched manifest reference'
    );
    setRejectTarget(null);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1E3A5F]">
            Admin Verifier &amp; Approvals Console
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Role-gated verification of displacement manifests, partner contact disclosures, and
            public registry moderation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 p-1 rounded-lg bg-[#F4F6F9] border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveQueue('displacement')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              activeQueue === 'displacement'
                ? 'bg-[#1E3A5F] text-white'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Displacement Queue</span>
            <span className="font-mono tabular-nums px-1.5 py-0.5 rounded bg-amber-500 text-white text-[11px]">
              {pendingDisplacementCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveQueue('contacts')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              activeQueue === 'contacts'
                ? 'bg-[#1E3A5F] text-white'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <MailCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Partner Contact Queue</span>
            <span className="font-mono tabular-nums px-1.5 py-0.5 rounded bg-amber-500 text-white text-[11px]">
              {pendingRequestCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveQueue('moderation')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              activeQueue === 'moderation'
                ? 'bg-[#1E3A5F] text-white'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Registry Moderation ({registry.length})</span>
          </button>
        </div>
      </div>

      {/* Queue 1: Displacement & Manifest Verification Queue */}
      {activeQueue === 'displacement' && (
        <section
          aria-label="Displacement and Manifest Verification Queue"
          className="bg-white border border-slate-200 rounded-xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#1E3A5F]">
                Displacement &amp; Manifest Verification Queue
              </h2>
              <p className="text-xs text-slate-600">
                Approving status turns the candidate’s passport badge green and unlocks any
                provisional bridging stipend vouchers.
              </p>
            </div>
            <select
              aria-label="Filter queue by verification status"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'all' | DisplacementVerificationStatus)
              }
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-800"
            >
              <option value="all">All Records ({registry.length})</option>
              <option value="Pending Review">Pending Review ({pendingDisplacementCount})</option>
              <option value="Verified">Verified</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F4F6F9] border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Pathway &amp; Document Type</th>
                  <th className="py-3 px-4">Reference Number</th>
                  <th className="py-3 px-4">Document Proof</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredQueueCandidates.map((cand) => (
                  <tr key={cand.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">{cand.fullName}</span>
                      <span className="font-mono text-[11px] text-slate-500">
                        {cand.credentialId} · {cand.targetRole}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="font-medium text-slate-800 block">
                        {cand.documentType}
                      </span>
                      <span className="text-slate-500 block truncate">
                        {cand.displacementPathway}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#1E3A5F] tabular-nums whitespace-nowrap">
                      {cand.referenceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      {cand.documentMeta ? (
                        <button
                          type="button"
                          onClick={() => setPreviewCandidate(cand)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-[#1E3A5F] whitespace-nowrap"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#2A7B88]" aria-hidden="true" />
                          <span>Inspect Document</span>
                        </button>
                      ) : (
                        <span className="text-slate-400">No file attached</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {cand.displacementStatus === 'Verified' && (
                        <span className="inline-flex items-center gap-1 font-semibold text-[#16A34A]">
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Verified</span>
                        </span>
                      )}
                      {cand.displacementStatus === 'Pending Review' && (
                        <span className="inline-flex items-center gap-1 font-semibold text-[#D97706]">
                          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Pending Review</span>
                        </span>
                      )}
                      {cand.displacementStatus === 'Rejected' && (
                        <div>
                          <span className="inline-flex items-center gap-1 font-semibold text-red-700">
                            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Rejected</span>
                          </span>
                          {cand.displacementAdminNote && (
                            <span className="block text-[11px] text-slate-500 max-w-[180px] truncate">
                              {cand.displacementAdminNote}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onVerifyDisplacement(cand.id, 'Verified')}
                          disabled={cand.displacementStatus === 'Verified'}
                          className="px-3 py-1.5 rounded-md bg-[#16A34A] hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold transition-colors"
                        >
                          Approve Status
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRejectTarget(cand);
                            setRejectReason(
                              cand.displacementAdminNote ||
                                'Illegible scan — please re-upload clear copy'
                            );
                          }}
                          className="px-3 py-1.5 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors"
                        >
                          Reject / Re-upload
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Queue 2: Partner Contact Request Queue */}
      {activeQueue === 'contacts' && (
        <section
          aria-label="Partner Contact Request Queue"
          className="bg-white border border-slate-200 rounded-xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-base font-bold text-[#1E3A5F]">
              Partner Contact Request Queue
            </h2>
            <p className="text-xs text-slate-600">
              Approving a request unmasks the candidate’s direct email and WhatsApp in the Employer
              Portal for that partner.
            </p>
          </div>

          {requests.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-600">
              No partner contact requests submitted yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F4F6F9] border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                    <th className="py-3 px-4">Requesting Partner</th>
                    <th className="py-3 px-4">Target Candidate</th>
                    <th className="py-3 px-4">Proposed Trial Details</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block">
                          {req.partnerName}
                        </span>
                        <span className="text-slate-600 block">{req.organization}</span>
                        <span className="font-mono text-[11px] text-slate-500">
                          {req.partnerEmail}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#1E3A5F] block">
                          {req.candidateName}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">
                          {req.candidateCredentialId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <span className="font-medium text-slate-800 block">
                          {req.proposedRoleDetails}
                        </span>
                        <p className="text-slate-600 mt-0.5 line-clamp-2">{req.message}</p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {req.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 font-semibold text-[#16A34A]">
                            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Approved (Unmasked)</span>
                          </span>
                        )}
                        {req.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 font-semibold text-[#D97706]">
                            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Pending Approval</span>
                          </span>
                        )}
                        {req.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 font-semibold text-red-700">
                            <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Rejected (Masked)</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onResolveContactRequest(req.id, 'approved')}
                            disabled={req.status === 'approved'}
                            className="px-3 py-1.5 rounded-md bg-[#16A34A] hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold transition-colors"
                          >
                            Approve Contact
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onResolveContactRequest(
                                req.id,
                                'rejected',
                                'Partner verification incomplete'
                              )
                            }
                            disabled={req.status === 'rejected'}
                            className="px-3 py-1.5 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-40 text-red-700 text-xs font-semibold transition-colors"
                          >
                            Reject Contact
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Queue 3: Candidate Registry Moderation */}
      {activeQueue === 'moderation' && (
        <section
          aria-label="Candidate Registry Moderation"
          className="bg-white border border-slate-200 rounded-xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#1E3A5F]">
                Candidate Registry Moderation
              </h2>
              <p className="text-xs text-slate-600">
                Publish, unpublish, or feature profiles in the Employer &amp; NGO Partner
                directory.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Users className="w-4 h-4 text-[#2A7B88]" aria-hidden="true" />
              <span className="tabular-nums">
                {registry.filter((c) => c.published).length} / {registry.length} Published
              </span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F4F6F9] border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                  <th className="py-3 px-4">Credential ID</th>
                  <th className="py-3 px-4">Candidate &amp; Role</th>
                  <th className="py-3 px-4">Score &amp; Tier</th>
                  <th className="py-3 px-4">Directory Visibility</th>
                  <th className="py-3 px-4">Featured</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {registry.map((cand) => (
                  <tr key={cand.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#1E3A5F] tabular-nums">
                      {cand.credentialId}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">{cand.fullName}</span>
                      <span className="text-slate-500">
                        {cand.targetRole} · {cand.sectorLabel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono tabular-nums">
                      <span className="font-bold text-[#1E3A5F]">{cand.overallScore}%</span> ·{' '}
                      <span className="text-slate-700">{cand.competencyTier}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateCandidate({ ...cand, published: !cand.published });
                          onNotify(
                            cand.published ? 'Profile Unpublished' : 'Profile Published',
                            'info',
                            `${cand.fullName} (${cand.credentialId})`
                          );
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                          cand.published
                            ? 'bg-emerald-50 border-emerald-200 text-[#16A34A]'
                            : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {cand.published ? 'Published in Directory' : 'Hidden (Private Draft)'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateCandidate({ ...cand, featured: !cand.featured });
                          onNotify(
                            cand.featured ? 'Removed from Featured' : 'Marked as Featured',
                            'info',
                            cand.fullName
                          );
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                          cand.featured
                            ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white'
                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {cand.featured ? 'Featured' : 'Standard'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Document Inspection Modal */}
      {previewCandidate && (
        <DocumentPreviewModal
          isOpen={Boolean(previewCandidate)}
          onClose={() => setPreviewCandidate(null)}
          candidateName={previewCandidate.fullName}
          pathway={previewCandidate.displacementPathway}
          documentType={previewCandidate.documentType}
          referenceNumber={previewCandidate.referenceNumber}
          displacementStatus={previewCandidate.displacementStatus}
          documentMeta={previewCandidate.documentMeta}
          liveBlobUrl={blobUrls[previewCandidate.id]}
        />
      )}

      {/* Reject Reason Modal */}
      {rejectTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-modal-title"
        >
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full p-5 space-y-4">
            <h3 id="reject-modal-title" className="text-base font-bold text-[#1E3A5F]">
              Reject &amp; Request Document Re-upload
            </h3>
            <p className="text-xs text-slate-600">
              Candidate: <strong>{rejectTarget.fullName}</strong> (
              <code className="font-mono">{rejectTarget.referenceNumber}</code>). Rejecting
              prevents unauthorized bridging stipend voucher release.
            </p>
            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Admin Verification Note
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-[#2A7B88] focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectTarget(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
