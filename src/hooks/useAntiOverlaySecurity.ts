import { useState, useEffect, useCallback, useRef } from 'react';

export interface SecurityThreat {
  id: string;
  type: 'UNAUTHORIZED_IFRAME' | 'HIGH_ZINDEX_OVERLAY' | 'HIT_TEST_OCCLUSION' | 'DOM_INJECTION' | 'FRAME_ANCESTOR_MISMATCH';
  message: string;
  elementTag?: string;
  timestamp: string;
}

export interface SecurityIntegrityState {
  isIntegrityIntact: boolean;
  overlayDetected: boolean;
  domTampered: boolean;
  unauthorizedIframeDetected: boolean;
  hitTestOccluded: boolean;
  workspaceSignature: string;
  signatureColors: [string, string];
  securityTimestamp: string;
  threats: SecurityThreat[];
  verifyIntegrityNow: () => boolean;
  clearThreats: () => void;
}

/**
 * useAntiOverlaySecurity - Advanced Anti-UI-Spoofing & Clickjacking Defense Hook
 * Detects unauthorized iframes, obscuring transparent/opaque layers, DOM tampering,
 * and verifies that hit-testing on the main application container is untampered.
 */
export function useAntiOverlaySecurity(
  userEmail: string = 'soporte.reyplace@gmail.com',
  targetContainerId: string = 'root'
): SecurityIntegrityState {
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [overlayDetected, setOverlayDetected] = useState(false);
  const [domTampered, setDomTampered] = useState(false);
  const [unauthorizedIframeDetected, setUnauthorizedIframeDetected] = useState(false);
  const [hitTestOccluded, setHitTestOccluded] = useState(false);
  const [securityTimestamp, setSecurityTimestamp] = useState('');
  
  const lastThreatTimeRef = useRef<number>(0);

  // Compute deterministic cryptographic signature and visual color seed
  const computeSignature = useCallback((input: string) => {
    let hash1 = 5381;
    let hash2 = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash1 = ((hash1 << 5) + hash1) ^ char;
      hash2 = Math.imul(hash2 ^ char, 0x01000193);
    }
    const sigHex = (Math.abs(hash1 ^ hash2) >>> 0).toString(16).toUpperCase().padStart(8, '0');
    
    // Generate two distinct hue values for visual verification gradient
    const hue1 = (Math.abs(hash1) % 360);
    const hue2 = (hue1 + 45) % 360;
    const color1 = `hsl(${hue1}, 80%, 55%)`;
    const color2 = `hsl(${hue2}, 85%, 60%)`;

    return {
      sig: `REY-${sigHex.slice(0, 4)}-${sigHex.slice(4, 8)}`,
      colors: [color1, color2] as [string, string]
    };
  }, []);

  const { sig: workspaceSignature, colors: signatureColors } = computeSignature(userEmail);

  // Deep inspection routine
  const inspectDOMAndOcclusion = useCallback(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return true;

    const detectedThreats: SecurityThreat[] = [];
    const now = new Date().toISOString();

    // 1. Scan for unauthorized iframes in document
    const iframes = document.querySelectorAll('iframe:not([data-rey-shield])');
    if (iframes.length > 0) {
      iframes.forEach((frame, idx) => {
        detectedThreats.push({
          id: `threat_iframe_${Date.now()}_${idx}`,
          type: 'UNAUTHORIZED_IFRAME',
          message: 'Se detectó un iframe no autenticado embebido en el DOM.',
          elementTag: (frame as HTMLElement).tagName,
          timestamp: now
        });
      });
    }

    // 2. Scan for suspicious high z-index overlay elements
    const allElements = document.querySelectorAll('body > *');
    allElements.forEach((el, idx) => {
      if (el instanceof HTMLElement && !el.hasAttribute('data-rey-shield') && el.id !== targetContainerId) {
        const style = window.getComputedStyle(el);
        const zIndex = parseInt(style.zIndex, 10);
        const isFixedOrAbs = style.position === 'fixed' || style.position === 'absolute';
        
        if (isFixedOrAbs && zIndex >= 9999) {
          const rect = el.getBoundingClientRect();
          // Check if it covers a significant part of the viewport (> 40%)
          const coversArea = (rect.width * rect.height) > (window.innerWidth * window.innerHeight * 0.35);
          if (coversArea) {
            detectedThreats.push({
              id: `threat_overlay_${Date.now()}_${idx}`,
              type: 'HIGH_ZINDEX_OVERLAY',
              message: `Capa superpuesta sospechosa detectada con z-index ${zIndex}.`,
              elementTag: el.tagName,
              timestamp: now
            });
          }
        }
      }
    });

    // 3. Pointer Hit-Test Occlusion Check on Central Workspace Coordinates
    const targetEl = document.getElementById(targetContainerId);
    if (targetEl && window.innerWidth > 0 && window.innerHeight > 0) {
      const samplePoints = [
        { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 },
        { x: window.innerWidth * 0.3, y: window.innerHeight * 0.3 },
        { x: window.innerWidth * 0.7, y: window.innerHeight * 0.7 }
      ];

      for (const pt of samplePoints) {
        const elAtPoint = document.elementFromPoint(pt.x, pt.y);
        if (elAtPoint && !targetEl.contains(elAtPoint) && !elAtPoint.hasAttribute('data-rey-shield')) {
          const style = window.getComputedStyle(elAtPoint);
          if (style.pointerEvents !== 'none' && style.opacity !== '0') {
            detectedThreats.push({
              id: `threat_hittest_${Date.now()}`,
              type: 'HIT_TEST_OCCLUSION',
              message: 'El contenedor principal de la aplicación está siendo interceptado en eventos de puntero.',
              elementTag: elAtPoint.tagName,
              timestamp: now
            });
            break;
          }
        }
      }
    }

    // State update based on detections
    const hasIframe = detectedThreats.some(t => t.type === 'UNAUTHORIZED_IFRAME');
    const hasOverlay = detectedThreats.some(t => t.type === 'HIGH_ZINDEX_OVERLAY');
    const hasOcclusion = detectedThreats.some(t => t.type === 'HIT_TEST_OCCLUSION');

    setUnauthorizedIframeDetected(hasIframe);
    setOverlayDetected(hasOverlay);
    setHitTestOccluded(hasOcclusion);
    setDomTampered(detectedThreats.length > 0);

    if (detectedThreats.length > 0) {
      // Prevent flood
      const currentTime = Date.now();
      if (currentTime - lastThreatTimeRef.current > 3000) {
        lastThreatTimeRef.current = currentTime;
        setThreats(prev => [...detectedThreats, ...prev].slice(0, 10));
      }
      return false;
    }

    return true;
  }, [targetContainerId]);

  const verifyIntegrityNow = useCallback(() => {
    return inspectDOMAndOcclusion();
  }, [inspectDOMAndOcclusion]);

  const clearThreats = useCallback(() => {
    setThreats([]);
    setOverlayDetected(false);
    setDomTampered(false);
    setUnauthorizedIframeDetected(false);
    setHitTestOccluded(false);
  }, []);

  useEffect(() => {
    // 1. Initial inspection
    inspectDOMAndOcclusion();

    // 2. MutationObserver on document body
    const observer = new MutationObserver((mutations) => {
      let shouldInspect = false;
      for (const m of mutations) {
        if (m.addedNodes.length > 0) {
          shouldInspect = true;
          break;
        }
      }
      if (shouldInspect) {
        inspectDOMAndOcclusion();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 3. Periodic micro-heartbeat for live timestamps & focus verification
    const timer = setInterval(() => {
      setSecurityTimestamp(new Date().toISOString().slice(11, 23) + ' UTC');
    }, 250);

    // 4. Periodic background scan
    const scanInterval = setInterval(() => {
      inspectDOMAndOcclusion();
    }, 4000);

    const handleFocus = () => inspectDOMAndOcclusion();
    window.addEventListener('focus', handleFocus);
    window.addEventListener('resize', handleFocus);

    return () => {
      observer.disconnect();
      clearInterval(timer);
      clearInterval(scanInterval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('resize', handleFocus);
    };
  }, [inspectDOMAndOcclusion]);

  const isIntegrityIntact = !overlayDetected && !domTampered && !unauthorizedIframeDetected && !hitTestOccluded;

  return {
    isIntegrityIntact,
    overlayDetected,
    domTampered,
    unauthorizedIframeDetected,
    hitTestOccluded,
    workspaceSignature,
    signatureColors,
    securityTimestamp,
    threats,
    verifyIntegrityNow,
    clearThreats
  };
}
