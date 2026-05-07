/**
 * Mobile detection and responsive utilities
 */

/**
 * Detect if device is mobile based on viewport width
 */
export function isMobileView(maxWidth: number = 768): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= maxWidth;
}

/**
 * Get responsive breakpoint
 */
export function getBreakpoint(): 'xs' | 'sm' | 'md' | 'lg' | 'xl' {
  if (typeof window === 'undefined') return 'md';
  
  const width = window.innerWidth;
  
  if (width < 480) return 'xs';
  if (width < 640) return 'sm';
  if (width < 768) return 'md';
  if (width < 1024) return 'lg';
  return 'xl';
}

/**
 * Hook for responsive detection
 */
import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

/**
 * Custom hook for breakpoint detection
 */
export function useResponsive() {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  return { isMobile, isTablet, isDesktop };
}

/**
 * Get touch target size (should be at least 48px)
 */
export function getTouchTargetSize(): number {
  return isMobileView() ? 48 : 40;
}

/**
 * Detect if device supports touch
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    (typeof window !== 'undefined' && 'ontouchstart' in window) ||
    (typeof navigator !== 'undefined' && 'maxTouchPoints' in navigator && navigator.maxTouchPoints > 0)
  );
}

/**
 * Detect if device is iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
}

/**
 * Detect if device is Android
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android/.test(navigator.userAgent);
}

/**
 * Get viewport dimensions
 */
export function getViewportDimensions() {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
    vw: window.innerWidth / 100,
    vh: window.innerHeight / 100
  };
}
