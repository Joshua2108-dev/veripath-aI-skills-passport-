import { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Globe2,
  Bell,
  UserCheck,
  Building2,
  Shield,
  RotateCcw,
  Cpu,
  HeartPulse,
  GraduationCap,
} from 'lucide-react';
import { UserRole } from '../types/veripath';

interface HeaderProps {
  activeRole: UserRole;
  onSwitchRole: (role: UserRole) => void;
  pendingAdminCount: number;
  onLoadSample: (sector: 'tech' | 'healthcare' | 'education') => void;
  onResetNewCandidate: () => void;
}

const SDG_COMMITMENTS = [
  {
    code: 'SDG 4',
    title: 'Quality Education',
    detail: 'Bridging displaced teachers & learners into accredited CBC and INEE pathways.',
  },
  {
    code: 'SDG 8',
    title: 'Decent Work & Economic Growth',
    detail: 'Paid trial placements and skill-based hiring without requiring lost paper degrees.',
  },
  {
    code: 'SDG 10',
    title: 'Reduced Inequalities',
    detail: 'Cross-border credential equivalence (SFIA, EQF, KNQF, ISCED) free forever for workers.',
  },
  {
    code: 'SDG 16',
    title: 'Peace, Justice & Strong Institutions',
    detail: 'Anti-misuse displacement verification gates with strict PII masking & audit trails.',
  },
  {
    code: 'SDG 17',
    title: 'Partnerships for the Goals',
    detail: 'Connecting CBOs, UNHCR-recognized talent, NGOs, and global employers.',
  },
];

export function Header({
  activeRole,
  onSwitchRole,
  pendingAdminCount,
  onLoadSample,
  onResetNewCandidate,
}: HeaderProps) {
  const [sdgOpen, setSdgOpen] = useState(false);
  const sdgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (sdgRef.current && !sdgRef.current.contains(e.target as Node)) {
        setSdgOpen(false);
      }
    }
    if (sdgOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [sdgOpen]);

  const roles: Array<{ id: UserRole; label: string; icon: typeof UserCheck }> = [
    { id: 'candidate', label: 'Candidate', icon: UserCheck },
    { id: 'employer', label: 'Employer / NGO Partner', icon: Building2 },
    { id: 'admin', label: 'Admin Verifier', icon: Shield },
  ];

  return (
    <div className="print:hidden">
      {/* Primary Navigation Bar */}
      <header className="bg-[#1E3A5F] text-white border-b border-[#162C49]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-[#2A7B88] flex items-center justify-center border border-white/15 shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap">
              VeriPath
            </span>
          </div>

          {/* Persona Switcher */}
          <nav
            aria-label="Active Persona Workspace Switcher"
            className="flex items-center gap-1 p-1 rounded-lg bg-[#152943] border border-white/10 overflow-x-auto"
          >
            {roles.map((r) => {
              const Icon = r.icon;
              const isActive = activeRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onSwitchRole(r.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-white ${
                    isActive
                      ? 'bg-[#2A7B88] text-white shadow-xs'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{r.label}</span>
                  {r.id === 'admin' && pendingAdminCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-[11px] font-mono font-semibold rounded bg-[#D97706] text-white tabular-nums">
                      {pendingAdminCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Global Controls: SDG Alignment + Admin Notification Counter */}
          <div className="flex items-center gap-2.5 shrink-0">
            {activeRole !== 'admin' && (
              <button
                type="button"
                onClick={() => onSwitchRole('admin')}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#152943] hover:bg-[#193354] border border-white/15 text-xs font-medium text-amber-200 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-white"
                title="Open Admin Approvals Dashboard"
              >
                <Bell className="w-3.5 h-3.5 text-[#D97706]" aria-hidden="true" />
                <span className="tabular-nums">
                  {pendingAdminCount} Pending {pendingAdminCount === 1 ? 'Review' : 'Reviews'}
                </span>
              </button>
            )}

            <div className="relative" ref={sdgRef}>
              <button
                type="button"
                onClick={() => setSdgOpen((prev) => !prev)}
                aria-expanded={sdgOpen}
                aria-haspopup="dialog"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-medium text-white transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-white"
              >
                <Globe2 className="w-3.5 h-3.5 text-teal-200" aria-hidden="true" />
                <span>UN SDG Aligned</span>
              </button>

              {sdgOpen && (
                <div
                  role="dialog"
                  aria-label="UN Sustainable Development Goals Alignment"
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white text-slate-900 border border-slate-200 shadow-xl p-4 z-50"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#1E3A5F]">
                        UN SDG Commitment Matrix
                      </h3>
                      <p className="text-xs text-slate-500">
                        Measurable global inclusion benchmarks
                      </p>
                    </div>
                    <span className="text-xs font-mono font-semibold text-[#2A7B88] tabular-nums">
                      5 Active SDGs
                    </span>
                  </div>
                  <ul className="space-y-2.5">
                    {SDG_COMMITMENTS.map((sdg) => (
                      <li key={sdg.code} className="text-xs leading-relaxed">
                        <span className="font-mono font-semibold text-[#1E3A5F] mr-1.5">
                          {sdg.code}
                        </span>
                        <span className="font-semibold text-slate-900">{sdg.title}:</span>{' '}
                        <span className="text-slate-600">{sdg.detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Workspace Descriptor & Quick-Demo Sample Toolbar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <p className="text-sm text-slate-700 font-medium">
            AI Skill Passport &amp; Credential Equivalence Engine —{' '}
            <span className="text-[#2A7B88] font-semibold">
              Proving Skills Without Paper Records
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500 mr-1 whitespace-nowrap">
              Quick Demo:
            </span>
            <button
              type="button"
              onClick={() => onLoadSample('tech')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-[#F4F6F9] hover:bg-slate-200/70 text-xs font-medium text-slate-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#2A7B88]"
            >
              <Cpu className="w-3.5 h-3.5 text-[#1E3A5F]" aria-hidden="true" />
              <span>Load Tech Sample</span>
            </button>
            <button
              type="button"
              onClick={() => onLoadSample('healthcare')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-[#F4F6F9] hover:bg-slate-200/70 text-xs font-medium text-slate-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#2A7B88]"
            >
              <HeartPulse className="w-3.5 h-3.5 text-[#2A7B88]" aria-hidden="true" />
              <span>Load Healthcare Sample</span>
            </button>
            <button
              type="button"
              onClick={() => onLoadSample('education')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-[#F4F6F9] hover:bg-slate-200/70 text-xs font-medium text-slate-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#2A7B88]"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#D97706]" aria-hidden="true" />
              <span>Load Education Sample</span>
            </button>
            <button
              type="button"
              onClick={onResetNewCandidate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#1E3A5F] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#2A7B88]"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset / New Candidate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
