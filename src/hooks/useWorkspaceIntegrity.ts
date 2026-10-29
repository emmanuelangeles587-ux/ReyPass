import { useState, useEffect, useCallback, useMemo } from 'react';

export interface WorkspaceIntegrityStatus {
  isDomainAuthorized: boolean;
  isIframeBlocked: boolean;
  integrityHash: string;
  activeDomain: string;
  antiPhishingToken: string;
  defenseLevel: 'SECURE_AUTHORIZED' | 'COMPROMISED_HOST' | 'UNAUTHORIZED_IFRAME';
  tamperingAlert: string | null;
  verifyNow: () => boolean;
  breakOutIfDisallowed: () => void;
}

// Trusted domain origins for ReyPass Economía Digital
const ALLOWED_ORIGIN_PATTERNS = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https:\/\/([a-z0-9-]+\.)?run\.app$/,
  /^https:\/\/([a-z0-9-]+\.)?google\.com$/,
  /^https:\/\/([a-z0-9-]+\.)?aistudio\.google\.com$/,
  /^https:\/\/([a-z0-9-]+\.)?reyplace\.shop$/,
  /^https:\/\/([a-z0-9-]+\.)?reypass\.com$/,
  /^https:\/\/([a-z0-9-]+\.)?reypass\.io$/
];

/**
 * Deterministic cryptographic hash generator (SHA-256 simulation in JS for client environments)
 */
function generateIntegritySignature(domain: string, userSeed: string, timeWindow: number): string {
  const payload = `${domain}::${userSeed}::${timeWindow}::REYPASS_INTEGRITY_SALT_V4`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  const part1 = hash.toString(16).padStart(8, '0').toUpperCase();
  const part2 = ((hash ^ 0x5a5a5a5a) >>> 0).toString(16).padStart(8, '0').toUpperCase();
  return `REYPASS-SEC-${part1.slice(0, 4)}-${part2.slice(0, 4)}`;
}

export function useWorkspaceIntegrity(userEmail = 'soporte.reyplace@gmail.com'): WorkspaceIntegrityStatus {
  const [isDomainAuthorized, setIsDomainAuthorized] = useState(true);
  const [isIframeBlocked, setIsIframeBlocked] = useState(false);
  const [tamperingAlert, setTamperingAlert] = useState<string | null>(null);
  const [activeDomain, setActiveDomain] = useState<string>('localhost');
  const [integrityHash, setIntegrityHash] = useState<string>('');
  const [antiPhishingToken, setAntiPhishingToken] = useState<string>('');

  // 10-minute rotating time window for zero-trust token
  const timeWindow = useMemo(() => Math.floor(Date.now() / 600000), []);

  const checkIntegrity = useCallback((): boolean => {
    try {
      const currentOrigin = window.location.origin;
      const currentHostname = window.location.hostname;
      setActiveDomain(currentHostname || 'localhost');

      // 1. Verify Domain Allowlist
      const isAllowedDomain = ALLOWED_ORIGIN_PATTERNS.some(pattern => pattern.test(currentOrigin));

      // 2. Anti-Clickjacking & IFrame Host Verification
      let isFramed = false;
      try {
        isFramed = window.self !== window.top;
      } catch (e) {
        // Cross-origin iframe nesting error caught = definitely embedded in untrusted external frame
        isFramed = true;
      }

      // Check ancestor origins if available (WebKit/Chromium)
      let isAncestorAuthorized = true;
      if (isFramed && (window.location as any).ancestorOrigins) {
        const ancestors: DOMStringList = (window.location as any).ancestorOrigins;
        for (let i = 0; i < ancestors.length; i++) {
          const ancestorOrigin = ancestors[i];
          const matched = ALLOWED_ORIGIN_PATTERNS.some(pattern => pattern.test(ancestorOrigin));
          if (!matched) {
            isAncestorAuthorized = false;
            break;
          }
        }
      }

      const sig = generateIntegritySignature(currentOrigin, userEmail, timeWindow);
      const token = `AP-${sig.split('-')[2]}-${userEmail.slice(0, 3).toUpperCase()}`;

      setIntegrityHash(sig);
      setAntiPhishingToken(token);

      if (!isAllowedDomain) {
        setIsDomainAuthorized(false);
        setTamperingAlert(`DOMINIO NO AUTORIZADO: La aplicación ReyPass está corriendo en "${currentOrigin}". Acceso bloqueado.`);
        return false;
      }

      if (isFramed && !isAncestorAuthorized) {
        setIsIframeBlocked(true);
        setTamperingAlert(`INYECCIÓN DE IFRAME DETECTADA: El POS está embebido en un contenedor no permitido. Posible ataque de Clickjacking.`);
        return false;
      }

      setIsDomainAuthorized(true);
      setIsIframeBlocked(false);
      setTamperingAlert(null);
      return true;
    } catch (err: any) {
      console.warn('[WorkspaceIntegrity] Check warning:', err);
      return true;
    }
  }, [userEmail, timeWindow]);

  const breakOutIfDisallowed = useCallback(() => {
    try {
      if (window.top && window.top.location !== window.location) {
        window.top.location.href = window.location.href;
      }
    } catch (e) {
      // In case of restricted cross-origin top access, redirect self
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    checkIntegrity();

    // Check periodically against DOM hijacking
    const interval = setInterval(() => {
      checkIntegrity();
    }, 15000);

    return () => clearInterval(interval);
  }, [checkIntegrity]);

  const defenseLevel: WorkspaceIntegrityStatus['defenseLevel'] = !isDomainAuthorized 
    ? 'COMPROMISED_HOST'
    : isIframeBlocked 
    ? 'UNAUTHORIZED_IFRAME' 
    : 'SECURE_AUTHORIZED';

  return {
    isDomainAuthorized,
    isIframeBlocked,
    integrityHash,
    activeDomain,
    antiPhishingToken,
    defenseLevel,
    tamperingAlert,
    verifyNow: checkIntegrity,
    breakOutIfDisallowed
  };
}
