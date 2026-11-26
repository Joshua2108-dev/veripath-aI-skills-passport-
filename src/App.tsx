import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ActiveSession,
  BillingState,
  CandidateProfile,
  DisplacementVerificationStatus,
  PartnerContactRequest,
  ToastMessage,
  UserRole,
} from './types/veripath';
import { SEED_CANDIDATES } from './data/seedData';
import {
  STORAGE_KEYS,
  decodePublicPassportPayload,
  loadInitialBilling,
  loadInitialRegistry,
  loadInitialRequests,
  loadInitialSession,
  safeWriteStorage,
} from './utils/storage';
import { Header } from './components/Header';
import { CandidateWorkspace } from './components/CandidateWorkspace';
import { EmployerPortal } from './components/EmployerPortal';
import { AdminPortal } from './components/AdminPortal';
import { PublicPassportView } from './components/PublicPassportView';
import { ToastContainer } from './components/Toast';

export default function App() {
  const [registry, setRegistry] = useState<CandidateProfile[]>(() => loadInitialRegistry());
  const [requests, setRequests] = useState<PartnerContactRequest[]>(() => loadInitialRequests());
  const [session, setSession] = useState<ActiveSession>(() => loadInitialSession());
  const [billing, setBilling] = useState<BillingState>(() => loadInitialBilling());

  const [isBlankDraft, setIsBlankDraft] = useState<boolean>(false);
  const [hashString, setHashString] = useState<string>(() => window.location.hash);
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist state slices safely
  useEffect(() => {
    safeWriteStorage(STORAGE_KEYS.REGISTRY, registry);
  }, [registry]);

  useEffect(() => {
    safeWriteStorage(STORAGE_KEYS.REQUESTS, requests);
  }, [requests]);

  useEffect(() => {
    safeWriteStorage(STORAGE_KEYS.SESSION, session);
  }, [session]);

  useEffect(() => {
    safeWriteStorage(STORAGE_KEYS.BILLING, billing);
  }, [billing]);

  // Listen for hash changes for standalone #passport=... verification view
  useEffect(() => {
    const onHashChange = () => setHashString(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const notify = useCallback(
    (
      title: string,
      variant: ToastMessage['variant'] = 'info',
      description?: string
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { id, title, description, variant }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const registerBlobUrl = useCallback((candidateKey: string, url: string) => {
    setBlobUrls((prev) => ({ ...prev, [candidateKey]: url }));
  }, []);

  const handleSwitchRole = (role: UserRole) => {
    setSession((prev) => ({ ...prev, activeRole: role }));
  };

  const handleLoadSample = (sector: 'tech' | 'healthcare' | 'education') => {
    const seedMatch = SEED_CANDIDATES.find((s) => s.sectorId === sector);
    if (!seedMatch) return;

    // Ensure the sample exists in registry (preserve admin updates if already present)
    let targetId = seedMatch.id;
    const existing = registry.find((c) => c.id === seedMatch.id || c.sectorId === sector);
    if (existing) {
      targetId = existing.id;
    } else {
      setRegistry((prev) => [seedMatch, ...prev]);
    }

    setIsBlankDraft(false);
    setSession((prev) => ({
      ...prev,
      activeRole: 'candidate',
      activeCandidateId: targetId,
    }));

    const labels = {
      tech: 'Tech & Digital Sample Loaded',
      healthcare: 'Healthcare & Public Health Sample Loaded',
      education: 'Education & Youth Sample Loaded',
    };
    notify(labels[sector], 'info', `${seedMatch.fullName} (${seedMatch.credentialId})`);
  };

  const handleResetNewCandidate = () => {
    setIsBlankDraft(true);
    setSession((prev) => ({
      ...prev,
      activeRole: 'candidate',
      activeCandidateId: null,
    }));
    notify(
      'New Candidate Intake Ready',
      'info',
      'Form cleared for a fresh submission. Existing saved registry profiles were preserved.'
    );
  };

  const handleSaveCandidate = (candidate: CandidateProfile, isNew: boolean) => {
    setRegistry((prev) => {
      if (isNew) {
        return [candidate, ...prev];
      }
      return prev.map((c) => (c.id === candidate.id ? candidate : c));
    });
    setIsBlankDraft(false);
    setSession((prev) => ({
      ...prev,
      activeCandidateId: candidate.id,
    }));
  };

  const handleUpdateCandidate = (updated: CandidateProfile) => {
    setRegistry((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleCreateContactRequest = (
    payload: Omit<PartnerContactRequest, 'id' | 'status' | 'createdAt'>
  ) => {
    const newReq: PartnerContactRequest = {
      ...payload,
      id: `req-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setRequests((prev) => [newReq, ...prev]);
    notify(
      'Contact Request Submitted',
      'success',
      `Pending Admin Verifier approval for ${payload.candidateName}.`
    );
  };

  const handleVerifyDisplacement = (
    candidateId: string,
    status: DisplacementVerificationStatus,
    reason?: string
  ) => {
    setRegistry((prev) =>
      prev.map((c) => {
        if (c.id !== candidateId) return c;
        const updatedVoucher = c.voucher
          ? {
              ...c.voucher,
              status:
                status === 'Verified'
                  ? ('Active' as const)
                  : status === 'Rejected'
                  ? ('Suspended' as const)
                  : ('Provisional' as const),
            }
          : null;

        return {
          ...c,
          displacementStatus: status,
          displacementAdminNote: status === 'Rejected' ? reason : undefined,
          voucher: updatedVoucher,
        };
      })
    );

    const target = registry.find((c) => c.id === candidateId);
    if (status === 'Verified') {
      notify(
        'Displacement Status Verified',
        'success',
        `${target?.fullName || 'Candidate'} badge turned Green and any bridging vouchers are now Active.`
      );
    } else {
      notify(
        'Re-upload Requested',
        'warning',
        `${target?.fullName || 'Candidate'} marked Rejected: ${reason || 'Check document quality.'}`
      );
    }
  };

  const handleResolveContactRequest = (
    requestId: string,
    decision: 'approved' | 'rejected',
    note?: string
  ) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: decision,
              adminNote: note,
              reviewedAt: new Date().toISOString(),
            }
          : r
      )
    );
    const req = requests.find((r) => r.id === requestId);
    if (decision === 'approved') {
      notify(
        'Partner Contact Approved',
        'success',
        `${req?.organization || 'Partner'} can now view unmasked contact details for ${
          req?.candidateName || 'the candidate'
        }.`
      );
    } else {
      notify(
        'Partner Contact Rejected',
        'warning',
        `Contact details remain masked for ${req?.candidateName || 'the candidate'}.`
      );
    }
  };

  const pendingAdminCount = useMemo(() => {
    const pendingDisp = registry.filter(
      (c) => c.displacementStatus === 'Pending Review'
    ).length;
    const pendingReq = requests.filter((r) => r.status === 'pending').length;
    return pendingDisp + pendingReq;
  }, [registry, requests]);

  const activeCandidate = useMemo(() => {
    if (isBlankDraft || !session.activeCandidateId) return null;
    return registry.find((c) => c.id === session.activeCandidateId) || registry[0] || null;
  }, [registry, session.activeCandidateId, isBlankDraft]);

  // Standalone Public Verification View (#passport=...)
  if (hashString.startsWith('#passport=')) {
    const payload = decodePublicPassportPayload(hashString);
    return (
      <PublicPassportView
        payload={payload}
        onReturnToPlatform={() => {
          window.history.replaceState(
            null,
            '',
            window.location.pathname + window.location.search
          );
          setHashString('');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9] text-slate-900">
      <Header
        activeRole={session.activeRole}
        onSwitchRole={handleSwitchRole}
        pendingAdminCount={pendingAdminCount}
        onLoadSample={handleLoadSample}
        onResetNewCandidate={handleResetNewCandidate}
      />

      <main className="flex-1">
        {session.activeRole === 'candidate' && (
          <CandidateWorkspace
            activeCandidate={activeCandidate}
            isBlankDraft={isBlankDraft}
            onSaveCandidate={handleSaveCandidate}
            onUpdateCandidate={handleUpdateCandidate}
            onLoadSample={handleLoadSample}
            onPreviewPublicLink={(hash) => {
              window.location.hash = hash;
              setHashString(hash);
            }}
            onNotify={notify}
            blobUrls={blobUrls}
            onRegisterBlobUrl={registerBlobUrl}
          />
        )}

        {session.activeRole === 'employer' && (
          <EmployerPortal
            registry={registry}
            requests={requests}
            session={session}
            billing={billing}
            onUpdateCandidate={handleUpdateCandidate}
            onCreateContactRequest={handleCreateContactRequest}
            onUpdateSessionPartner={(partnerProfile) =>
              setSession((prev) => ({ ...prev, partnerProfile }))
            }
            onUpdateBilling={setBilling}
            onNotify={notify}
          />
        )}

        {session.activeRole === 'admin' && (
          <AdminPortal
            registry={registry}
            requests={requests}
            blobUrls={blobUrls}
            onVerifyDisplacement={handleVerifyDisplacement}
            onResolveContactRequest={handleResolveContactRequest}
            onUpdateCandidate={handleUpdateCandidate}
            onNotify={notify}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-6 lg:px-8 print:hidden">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            VeriPath · Skill Passport &amp; Credential Equivalence Engine · Free Forever for
            Displaced Professionals &amp; Workers
          </span>
          <span>
            Cross-Border Benchmarks: SFIA · EQF · UNESCO ISCED · KNQF · WHO · INEE
          </span>
        </div>
      </footer>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
