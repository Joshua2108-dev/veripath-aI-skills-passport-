import {
  ActiveSession,
  BillingState,
  CandidateProfile,
  PartnerContactRequest,
  PublicPassportPayload,
} from '../types/veripath';
import {
  DEFAULT_BILLING,
  DEFAULT_SESSION,
  SEED_CANDIDATES,
  SEED_REQUESTS,
} from '../data/seedData';

export const STORAGE_KEYS = {
  REGISTRY: 'veripath_registry',
  REQUESTS: 'veripath_requests',
  SESSION: 'veripath_active_session',
  BILLING: 'veripath_billing',
} as const;

export function safeReadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function safeWriteStorage<T>(key: string, value: T): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`[VeriPath] localStorage write failed for ${key}:`, err);
    return false;
  }
}

export function loadInitialRegistry(): CandidateProfile[] {
  const existing = safeReadStorage<CandidateProfile[] | null>(STORAGE_KEYS.REGISTRY, null);
  if (!existing || !Array.isArray(existing) || existing.length === 0) {
    safeWriteStorage(STORAGE_KEYS.REGISTRY, SEED_CANDIDATES);
    return SEED_CANDIDATES;
  }
  return existing;
}

export function loadInitialRequests(): PartnerContactRequest[] {
  const existing = safeReadStorage<PartnerContactRequest[] | null>(STORAGE_KEYS.REQUESTS, null);
  if (!existing || !Array.isArray(existing)) {
    safeWriteStorage(STORAGE_KEYS.REQUESTS, SEED_REQUESTS);
    return SEED_REQUESTS;
  }
  return existing;
}

export function loadInitialSession(): ActiveSession {
  const existing = safeReadStorage<ActiveSession | null>(STORAGE_KEYS.SESSION, null);
  if (!existing) {
    safeWriteStorage(STORAGE_KEYS.SESSION, DEFAULT_SESSION);
    return DEFAULT_SESSION;
  }
  return existing;
}

export function loadInitialBilling(): BillingState {
  const existing = safeReadStorage<BillingState | null>(STORAGE_KEYS.BILLING, null);
  if (!existing) {
    safeWriteStorage(STORAGE_KEYS.BILLING, DEFAULT_BILLING);
    return DEFAULT_BILLING;
  }
  return existing;
}

/**
 * Generates a lightweight (<20KB) thumbnail for uploaded images so QuotaExceededError never occurs.
 * Returns undefined for PDFs or unreadable files while preserving a session blob URL in memory.
 */
export async function createLightweightThumbnail(file: File): Promise<string | undefined> {
  if (!file.type.startsWith('image/')) return undefined;

  return new Promise((resolve) => {
    const img = new Image();
    const tempUrl = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const maxDim = 420;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(tempUrl);
          resolve(undefined);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.55);
        URL.revokeObjectURL(tempUrl);
        resolve(dataUrl.length < 40000 ? dataUrl : undefined);
      } catch {
        URL.revokeObjectURL(tempUrl);
        resolve(undefined);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(tempUrl);
      resolve(undefined);
    };
    img.src = tempUrl;
  });
}

export function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return '***@***.org';
  const [local, domain] = parts;
  const domainParts = domain.split('.');
  const tld = domainParts.length > 1 ? domainParts[domainParts.length - 1] : 'org';
  return `${local.slice(0, 1)}***@***.${tld}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\s+/g, '');
  if (digits.length < 6) return '+*** *** ***';
  return `${digits.slice(0, 4)} *** *** ${digits.slice(-3)}`;
}

export function isPartnerApprovedForCandidate(
  candidateId: string,
  requests: PartnerContactRequest[],
  partnerEmail?: string
): boolean {
  return requests.some(
    (r) =>
      r.candidateId === candidateId &&
      r.status === 'approved' &&
      (!partnerEmail || r.partnerEmail.toLowerCase() === partnerEmail.toLowerCase())
  );
}

/**
 * Strips all sensitive displacement manifest IDs, documents, and personal contact details
 * before encoding a public shareable passport URL (#passport=<base64>).
 */
export function encodePublicPassportPayload(candidate: CandidateProfile): string {
  const payload: PublicPassportPayload = {
    credentialId: candidate.credentialId,
    fullName: candidate.fullName,
    location: candidate.location,
    sectorLabel: candidate.sectorLabel,
    targetRole: candidate.targetRole,
    issueDate: candidate.issueDate,
    overallScore: candidate.overallScore,
    competencyTier: candidate.competencyTier,
    displacementStatus: candidate.displacementStatus,
    availability: candidate.availability,
    equivalences: candidate.equivalences,
    scorecards: candidate.scorecards.map((s) => ({
      domain: s.domain,
      score: s.score,
      bridgingRecommendation: s.bridgingRecommendation,
    })),
    sdgTags: candidate.sdgTags,
  };

  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

export function decodePublicPassportPayload(hashFragment: string): PublicPassportPayload | null {
  try {
    const clean = hashFragment.replace(/^#passport=/, '').trim();
    if (!clean) return null;
    const binary = atob(decodeURIComponent(clean));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as PublicPassportPayload;
    if (!parsed || !parsed.credentialId || !parsed.fullName) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function exportSanitizedPipelineCsv(
  candidates: CandidateProfile[],
  requests: PartnerContactRequest[],
  partnerEmail?: string
): void {
  const headers = [
    'Credential ID',
    'Full Name',
    'Location',
    'Sector',
    'Target Role',
    'Competency Tier',
    'Overall Score (%)',
    'Displacement Status',
    'Equivalence Summary',
    'Availability',
    'Pipeline Stage',
    'Contact Access',
    'Approved Email',
    'Approved WhatsApp',
  ];

  const escapeCsv = (val: string | number) => {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = candidates.map((c) => {
    const approved = isPartnerApprovedForCandidate(c.id, requests, partnerEmail);
    return [
      c.credentialId,
      c.fullName,
      c.location,
      c.sectorLabel,
      c.targetRole,
      c.competencyTier,
      c.overallScore,
      c.displacementStatus,
      c.equivalences.map((e) => `${e.framework}: ${e.level}`).join(' | '),
      c.availability.join(' / '),
      c.pipelineStage,
      approved ? 'Approved' : 'Masked (Approval Required)',
      approved ? c.email : 'MASKED',
      approved ? c.whatsapp : 'MASKED',
    ]
      .map(escapeCsv)
      .join(',');
  });

  const csvContent = [headers.map(escapeCsv).join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `veripath_talent_pipeline_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
