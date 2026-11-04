/**
 * Site-Wide Asset & Data Preloader Hook (`useSitePreloader`)
 *
 * Synchronizes three readiness signals before opening the Entrance Gate:
 * 1. Firestore Realtime Data Snapshot (`!dataLoading`)
 * 2. Web Font Readiness (`document.fonts.ready`)
 * 3. Critical Image Decoding (`HTMLImageElement.decode()` for Hero Portrait & primary covers)
 *
 * Produces a smooth 0 -> 100 progress readout and guarantees completion via a safety timeout.
 */
import { useEffect, useState } from 'react';

//To Determine if Image has been loaded
function preloadAndDecodeImage(src) {
  return new Promise((resolve) => {
    if (!src || typeof src !== 'string') {
      resolve();
      return;
    }

    const img = new Image();
    img.src = src;

    const finish = () => resolve();

    if (img.complete) {
      if (typeof img.decode === 'function') {
        img.decode().then(finish).catch(finish);
      } else {
        finish();
      }
    } else {
      img.onload = () => {
        if (typeof img.decode === 'function') {
          img.decode().then(finish).catch(finish);
        } else {
          finish();
        }
      };
      img.onerror = finish;
    }
  });
}

export function useSitePreloader({
  dataLoading = false,
  imageUrls = [],
  minHoldMs = 650,
  maxTimeoutMs = 3800,
} = {}) {
  const [fontsLoaded, setFontsLoaded] = useState(
    () => !(typeof document !== 'undefined' && document.fonts?.ready)
  );
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [minHoldElapsed, setMinHoldElapsed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [progress, setProgress] = useState(0);

  // 1. Minimum cinematic hold & hard safety timeout
  useEffect(() => {
    const holdTimer = setTimeout(() => {
      setMinHoldElapsed(true);
    }, minHoldMs);

    const safetyTimer = setTimeout(() => {
      setTimedOut(true);
    }, maxTimeoutMs);

    //always clean up timers upon rerendering
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(safetyTimer);
    };
  }, [minHoldMs, maxTimeoutMs]);

  // 2. Web Fonts readiness
  useEffect(() => {
    if (fontsLoaded) return undefined;
    let active = true;
    document.fonts.ready
      .then(() => {
        if (active) setFontsLoaded(true);
      })
      .catch(() => {
        if (active) setFontsLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [fontsLoaded]);

  // 3. Critical images preload & decode once data is available
  const urlsKey = Array.isArray(imageUrls)
    ? imageUrls.filter(Boolean).slice(0, 4).join('|')
    : '';

  useEffect(() => {
    if (dataLoading) return undefined;

    let active = true;
    const validUrls = urlsKey ? urlsKey.split('|').filter(Boolean) : [];

    Promise.allSettled(validUrls.map((url) => preloadAndDecodeImage(url))).then(
      () => {
        if (active) {
          setImagesLoaded(true);
        }
      }
    );

    return () => {
      active = false;
    };
  }, [dataLoading, urlsKey]);

  const allAssetsReady =
    timedOut || (!dataLoading && fontsLoaded && imagesLoaded && minHoldElapsed);

  // Target progress based on completed subsystems
  const targetProgress = allAssetsReady
    ? 100
    : Math.min(
      94,
      (!dataLoading ? 35 : 12) +
      (fontsLoaded ? 25 : 5) +
      (imagesLoaded ? 34 : 0)
    );

  // 4. Smoothly interpolate displayed progress toward targetProgress
  useEffect(() => {
    if (progress >= targetProgress) return undefined;

    const rafId = requestAnimationFrame(() => {
      setProgress((prev) => {
        if (prev >= targetProgress) return prev;
        const delta =
          targetProgress === 100
            ? Math.max(2.5, (100 - prev) * 0.28)
            : Math.max(0.6, (targetProgress - prev) * 0.12);
        const next = Math.min(targetProgress, prev + delta);
        return Math.round(next * 10) / 10;
      });
    });

    return () => cancelAnimationFrame(rafId);
  }, [progress, targetProgress]);

  const roundedProgress = Math.min(100, Math.floor(progress));
  const isReady = allAssetsReady && roundedProgress >= 100;

  return {
    progress: roundedProgress,
    isReady,
  };
}
