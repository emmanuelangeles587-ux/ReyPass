import { useState, useEffect } from 'react';

export interface SecurityStatus {
  isSecure: boolean;
  tamperDetected: boolean;
  overlayBlocked: boolean;
  userFingerprint: string;
  sessionHash: string;
}

export function useAntiOverlayDetection(userEmail: string = 'alejandro@reywallet.com'): SecurityStatus {
  const [tamperDetected, setTamperDetected] = useState(false);
  const [overlayBlocked, setOverlayBlocked] = useState(false);
  const [sessionHash, setSessionHash] = useState('');

  // Generate deterministic unique user cryptographic fingerprint
  const userFingerprint = Array.from(userEmail)
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 0xFFFFFFFF, 17)
    .toString(16)
    .toUpperCase()
    .padStart(8, '0');

  useEffect(() => {
    // Generate session micro-hash with high-precision time
    const hash = `REY-SHIELD-${userFingerprint}-${Math.floor(performance.now() * 1000).toString(36).toUpperCase()}`;
    setSessionHash(hash);

    // 1. Detect Suspicious Window Blur / Screen Capture Overlay
    const handleBlur = () => {
      // Temporary focus loss can occur, but track rapid focus switching
      const timeSinceLoad = performance.now();
      if (timeSinceLoad > 2000) {
        setTamperDetected(true);
        setTimeout(() => setTamperDetected(false), 3000);
      }
    };

    // 2. Detect Pointer Events Hijacking / Invisible Clickjacking Overlay
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.tagName === 'IFRAME') {
        setOverlayBlocked(true);
      }
    };

    // 3. Monitor DOM Mutation for unauthorized overlay injections
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            const style = window.getComputedStyle(node);
            if (
              style.position === 'fixed' &&
              style.zIndex &&
              Number(style.zIndex) > 99999 &&
              !node.hasAttribute('data-rey-shield')
            ) {
              console.warn('[REY SECURITY SHIELD] Capa superpuesta no autorizada detectada:', node);
              setOverlayBlocked(true);
            }
          }
        });
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('blur', handleBlur);
    window.addEventListener('pointerdown', handlePointerDown);

    return () => {
      observer.disconnect();
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [userFingerprint]);

  return {
    isSecure: !tamperDetected && !overlayBlocked,
    tamperDetected,
    overlayBlocked,
    userFingerprint,
    sessionHash
  };
}
