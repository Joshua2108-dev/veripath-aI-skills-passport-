import { X, ShieldAlert, FileText, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import {
  DisplacementDocumentType,
  DisplacementPathway,
  DisplacementVerificationStatus,
  DocumentMetadata,
} from '../types/veripath';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  pathway: DisplacementPathway;
  documentType: DisplacementDocumentType;
  referenceNumber: string;
  displacementStatus: DisplacementVerificationStatus;
  documentMeta: DocumentMetadata | null;
  liveBlobUrl?: string;
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  candidateName,
  pathway,
  documentType,
  referenceNumber,
  displacementStatus,
  documentMeta,
  liveBlobUrl,
}: DocumentPreviewModalProps) {
  if (!isOpen || !documentMeta) return null;

  const activePreviewUrl = liveBlobUrl || documentMeta.previewUrl;
  const isImage =
    documentMeta.fileType.startsWith('image/') &&
    Boolean(activePreviewUrl) &&
    !documentMeta.isSampleDoc;
  const isPdfWithBlob =
    documentMeta.fileType === 'application/pdf' &&
    Boolean(liveBlobUrl) &&
    !documentMeta.isSampleDoc;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 print:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-preview-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-2xl w-full overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileText className="w-5 h-5 text-[#1E3A5F] shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <h3 id="doc-preview-title" className="text-base font-semibold text-slate-900 truncate">
                Restricted Identity Document Inspection
              </h3>
              <p className="text-xs text-slate-600 truncate">
                Visible only to Candidate &amp; Admin Verifier · Never shared with employers
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close document preview"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition-colors focus-visible:outline-2 focus-visible:outline-[#2A7B88]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Metadata Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-[#F4F6F9] border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Holder</span>
              <span className="font-semibold text-slate-900">{candidateName || 'Draft Candidate'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Reference / Manifest</span>
              <span className="font-mono font-semibold text-[#1E3A5F] tabular-nums">
                {referenceNumber || 'UNSPECIFIED'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">File Info</span>
              <span className="font-medium text-slate-800 truncate block">
                {documentMeta.fileName} ({formatSize(documentMeta.fileSize)})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Review State</span>
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  displacementStatus === 'Verified'
                    ? 'text-[#16A34A]'
                    : displacementStatus === 'Rejected'
                    ? 'text-red-700'
                    : 'text-[#D97706]'
                }`}
              >
                {displacementStatus === 'Verified' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {displacementStatus === 'Pending Review' && <Clock className="w-3.5 h-3.5" />}
                {displacementStatus === 'Rejected' && <AlertTriangle className="w-3.5 h-3.5" />}
                {displacementStatus}
              </span>
            </div>
          </div>

          {/* Preview Area */}
          {isImage && activePreviewUrl ? (
            <div className="rounded-lg border border-slate-200 bg-slate-950/5 p-3 flex flex-col items-center">
              <img
                src={activePreviewUrl}
                alt={`Uploaded verification document for ${candidateName}`}
                className="max-h-80 w-auto rounded border border-slate-200 object-contain bg-white"
                referrerPolicy="no-referrer"
              />
              <p className="text-xs text-slate-500 mt-2">
                In-session preview · Persisted via lightweight thumbnail metadata only
              </p>
            </div>
          ) : isPdfWithBlob && liveBlobUrl ? (
            <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-100">
              <iframe
                title="PDF Document Preview"
                src={liveBlobUrl}
                className="w-full h-80 bg-white"
              />
            </div>
          ) : (
            /* Crisp simulated official document sheet for sample docs or post-reload PDF metadata */
            <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-xs">
              <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-4">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-[#2A7B88]">
                    OFFICIAL HUMANITARIAN &amp; CIVIL REGISTRATION RECORD
                  </p>
                  <h4 className="text-lg font-bold text-[#1E3A5F] mt-0.5">{documentType}</h4>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Document Reference</span>
                  <span className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                    {referenceNumber || 'REF-ID-PENDING'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div className="sm:col-span-1 flex items-center justify-center p-4 rounded-lg bg-[#F4F6F9] border border-slate-200">
                  <svg
                    viewBox="0 0 120 120"
                    className="w-24 h-24 text-[#1E3A5F]"
                    aria-hidden="true"
                  >
                    <rect
                      x="6"
                      y="6"
                      width="108"
                      height="108"
                      rx="10"
                      fill="#FFFFFF"
                      stroke="#CBD5E1"
                      strokeWidth="2"
                    />
                    <circle cx="60" cy="44" r="18" fill="#E2E8F0" />
                    <path
                      d="M30 94 C30 74, 90 74, 90 94"
                      fill="#CBD5E1"
                    />
                    <rect x="20" y="98" width="80" height="6" rx="3" fill="#2A7B88" opacity="0.35" />
                  </svg>
                </div>

                <div className="sm:col-span-2 space-y-2.5 text-sm">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Registered Name</span>
                    <span className="font-semibold text-slate-900">
                      {candidateName || 'Applicant Record'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Protection Pathway</span>
                    <span className="font-medium text-slate-800 text-right max-w-xs">{pathway}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Upload Timestamp</span>
                    <span className="font-mono text-xs text-slate-700 tabular-nums">
                      {documentMeta.uploadDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Archive Artifact</span>
                    <span className="font-mono text-xs text-slate-700">{documentMeta.fileName}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <ShieldAlert className="w-4 h-4 text-[#1E3A5F] shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              <strong>Privacy &amp; Quota Protection:</strong> Only lightweight document metadata is
              stored in browser storage. Raw national IDs and manifest numbers are automatically
              stripped from Employer views and public <code className="font-mono">#passport=</code>{' '}
              links.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
