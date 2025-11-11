import { useEffect, useState } from 'react';

declare global {
  interface Window {
    initGoogleMaps: () => void;
    google: typeof google;
  }
}

interface UseGoogleMapsReturn {
  isLoaded: boolean;
  loadError: Error | null;
}

let isLoadingStarted = false;
let isLoaded = false;
let loadError: Error | null = null;
const callbacks: Array<() => void> = [];

export function useGoogleMaps(): UseGoogleMapsReturn {
  const [state, setState] = useState({
    isLoaded,
    loadError,
  });

  useEffect(() => {
    if (isLoaded) {
      setState({ isLoaded: true, loadError: null });
      return;
    }

    if (loadError) {
      setState({ isLoaded: false, loadError });
      return;
    }

    let mounted = true;

    const callback = () => {
      if (!mounted) return;
      setState({ isLoaded: isLoaded, loadError });
    };

    callbacks.push(callback);

    if (!isLoadingStarted) {
      isLoadingStarted = true;
      loadGoogleMapsScript();
    }

    return () => {
      mounted = false;
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    };
  }, []);

  return state;
}

function runCallbacksAndClear() {
  const pending = callbacks.splice(0, callbacks.length);
  pending.forEach((cb) => cb());
}

function loadGoogleMapsScript() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  if (!apiKey) {
    loadError = new Error('Google Maps API key is missing');
    runCallbacksAndClear();
    return;
  }

  if (typeof window !== 'undefined' && typeof window.google !== 'undefined' && (window.google as any).maps) {
    isLoaded = true;
    runCallbacksAndClear();
    return;
  }

  const existing = document.querySelector('script[data-google-maps]');
  if (existing) return;

  const script = document.createElement('script');
  script.setAttribute('data-google-maps', '1');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initGoogleMaps`;
  script.async = true;
  script.defer = true;

  window.initGoogleMaps = () => {
    isLoaded = true;
    loadError = null;
    runCallbacksAndClear();
  };

  script.onerror = () => {
    loadError = new Error('Failed to load Google Maps script');
    runCallbacksAndClear();
  };

  document.head.appendChild(script);
}
