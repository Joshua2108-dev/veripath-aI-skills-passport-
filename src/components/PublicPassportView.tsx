import {
  ShieldCheck,
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Printer,
  Lock,
} from 'lucide-react';
import { PublicPassportPayload } from '../types/veripath';

interface PublicPassportViewProps {
  payload: PublicPassportPayload | null;
  onReturnToPlatform: () => void;
}

export function PublicPassportView({ payload, onReturnToPlatform }: PublicPassportViewProps) {
  if (!payload) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-md w-full text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-[#D97706] mx-auto" aria-hidden="true" />
          <h1 className="text-xl font-bold text-[#1E3A5F]">Invalid Verification Link</h1>
          <p className="text-sm text-slate-600">
            This public VeriPath certificate link appears malformed or incomplete.
          </p>
          <button
            type="button"
            onClick={onReturnToPlatform}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>View Full Platform</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Public Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <span className="text-base font-bold text-[#1E3A5F]">
              VeriPath Public Verification Certificate
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800"
            >
              <Printer className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Print Certificate</span>
            </button>
            <button
              type="button"
              onClick={onReturnToPlatform}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>View Full Platform</span>
            </button>
          </div>
        </div>

        {/* Read-Only Certificate */}
        <article
          id="veripath-passport-card"
          className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs"
        >
          <div className="bg-[#1E3A5F] text-white p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#2A7B88] text-white text-xs font-semibold">
                    <Award className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{payload.competencyTier}</span>
                  </span>

                  {payload.displacementStatus === 'Verified' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#16A34A] text-white text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Displacement Status Verified</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#D97706] text-white text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{payload.displacementStatus}</span>
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-white">{payload.fullName}</h1>
                <p className="text-sm text-teal-100 font-medium mt-1">
                  {payload.targetRole} · {payload.sectorLabel}
                </p>
                <p className="text-xs text-slate-200 mt-1">
                  {payload.location} · Availability: {payload.availability.join(' / ')}
                </p>
              </div>

              <div className="bg-white/10 border border-white/15 rounded-lg p-3.5 text-right shrink-0">
                <span className="text-[11px] text-slate-200 block">Credential ID</span>
                <span className="font-mono text-base font-bold text-white tabular-nums block">
                  {payload.credentialId}
                </span>
                <span className="text-[11px] text-slate-300 font-mono tabular-nums block mt-1">
                  Issued {payload.issueDate}
                </span>
                <span className="text-xs font-semibold text-teal-200 font-mono tabular-nums block mt-1.5">
                  Verified Score: {payload.overallScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Equivalence Tiers */}
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-sm font-bold text-[#1E3A5F] mb-3">
              Accredited Equivalence Tiers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {payload.equivalences.map((eq) => (
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
                  <p className="text-xs text-slate-600 mt-1">{eq.plainEnglish}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Competency Badges */}
          <div className="p-6 border-b border-slate-200 space-y-3">
            <h2 className="text-sm font-bold text-[#1E3A5F]">Verified Competency Badges</h2>
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
              {payload.scorecards.map((sc) => (
                <div key={sc.domain} className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-slate-900 block">
                      {sc.domain}
                    </span>
                    <span className="text-xs text-slate-600 block mt-0.5">
                      Next Bridge: {sc.bridgingRecommendation}
                    </span>
                  </div>
                  <span className="font-mono text-sm font-bold text-[#1E3A5F] tabular-nums shrink-0">
                    {sc.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Stripping Notice */}
          <div className="px-6 py-4 bg-[#F4F6F9] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#1E3A5F]" aria-hidden="true" />
              <span>
                Zero-PII Public Certificate: All displacement documents, manifest numbers, and
                personal contact info are stripped.
              </span>
            </span>
            <span className="font-semibold text-[#2A7B88]">
              {payload.sdgTags.join(' · ')}
            </span>
          </div>
        </article>
      </div>
    </div>
  );
}
