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
    isLoaded: isLoaded,
    loadError: loadError,
  });

  useEffect(() => {
    // If already loaded
    if (isLoaded) {
      setState({ isLoaded: true, loadError: null });
      return;
    }

    // If there was an error
    if (loadError) {
      setState({ isLoaded: false, loadError });
      return;
    }

    // Add this component to callbacks
    const callback = () => {
      setState({ isLoaded: true, loadError: null });
    };
    callbacks.push(callback);

    // If already loading, just wait for callback
    if (isLoadingStarted) {
      return;
    }

    // Start loading
    isLoadingStarted = true;
    loadGoogleMapsScript();

    return () => {
      // Remove callback on unmount
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }, []);

  return state;
}

function loadGoogleMapsScript() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  if (!apiKey) {
    const error = new Error('Google Maps API key is missing');
    loadError = error;
    callbacks.forEach((cb) => cb());
    return;
  }

  // Check if already loaded
  if (typeof google !== 'undefined' && google.maps) {
    isLoaded = true;
    callbacks.forEach((cb) => cb());
    return;
  }

  // Create script tag
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initGoogleMaps`;
  script.async = true;
  script.defer = true;

  // Set up callback
  window.initGoogleMaps = () => {
    isLoaded = true;
    callbacks.forEach((cb) => cb());
  };

  // Handle errors
  script.onerror = () => {
    loadError = new Error('Failed to load Google Maps script');
    callbacks.forEach((cb) => cb());
  };

  document.head.appendChild(script);
}

