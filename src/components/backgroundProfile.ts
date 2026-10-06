export type DeviceProfile = {
  isMobile: boolean;
  useCSSFallback: boolean;
  isPageVisible: boolean;
};

type NetworkInformation = EventTarget & { saveData?: boolean };
type NavigatorCapabilities = Navigator & {
  deviceMemory?: number;
  connection?: NetworkInformation;
};

export const getBackgroundProfile = (): DeviceProfile => {
  if (typeof window === 'undefined') {
    return { isMobile: false, useCSSFallback: false, isPageVisible: true };
  }

  const capabilities = navigator as NavigatorCapabilities;
  const isMobile = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveDataEnabled = capabilities.connection?.saveData === true;
  const limitedMemory = (capabilities.deviceMemory ?? 8) <= 2;
  const limitedCPU = (navigator.hardwareConcurrency || 8) <= 2;

  return {
    isMobile,
    useCSSFallback: prefersReducedMotion || saveDataEnabled || limitedMemory || limitedCPU,
    isPageVisible: document.visibilityState !== 'hidden',
  };
};

export const subscribeToBackgroundProfile = (onChange: () => void) => {
  const viewportQuery = window.matchMedia('(max-width: 767px), (pointer: coarse)');
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = (navigator as NavigatorCapabilities).connection;

  window.addEventListener('resize', onChange, { passive: true });
  viewportQuery.addEventListener('change', onChange);
  motionQuery.addEventListener('change', onChange);
  document.addEventListener('visibilitychange', onChange);
  connection?.addEventListener('change', onChange);

  return () => {
    window.removeEventListener('resize', onChange);
    viewportQuery.removeEventListener('change', onChange);
    motionQuery.removeEventListener('change', onChange);
    document.removeEventListener('visibilitychange', onChange);
    connection?.removeEventListener('change', onChange);
  };
};
