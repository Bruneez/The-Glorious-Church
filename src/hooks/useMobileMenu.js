import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const NAV_DRAWER_ID = 'app-nav-drawer';

/** Matches Tailwind `xl` — persistent sidebar begins at this width. */
export const DESKTOP_SIDEBAR_MEDIA_QUERY = '(min-width: 1280px)';

function getIsDesktopSidebar() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia(DESKTOP_SIDEBAR_MEDIA_QUERY).matches
  );
}

export function useIsDesktopSidebar() {
  const [isDesktopSidebar, setIsDesktopSidebar] = useState(getIsDesktopSidebar);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_SIDEBAR_MEDIA_QUERY);

    function handleChange(event) {
      setIsDesktopSidebar(event.matches);
    }

    setIsDesktopSidebar(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return isDesktopSidebar;
}

export function useMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const drawerRef = useRef(null);
  const wasOpenRef = useRef(false);
  const bodyOverflowRef = useRef('');
  const location = useLocation();
  const labelId = useId();

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    close();
  }, [location.pathname, close]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_SIDEBAR_MEDIA_QUERY);

    function handleBreakpointChange() {
      close();
    }

    mediaQuery.addEventListener('change', handleBreakpointChange);

    return () => {
      mediaQuery.removeEventListener('change', handleBreakpointChange);
    };
  }, [close]);

  useEffect(() => {
    if (!isOpen || getIsDesktopSidebar()) {
      return undefined;
    }

    bodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = bodyOverflowRef.current;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen || getIsDesktopSidebar()) {
      return undefined;
    }

    const drawer = drawerRef.current;
    if (!drawer) {
      return undefined;
    }

    const closeButton = drawer.querySelector('[data-nav-drawer-close]');
    const focusTarget = closeButton || drawer.querySelector('a[href], button:not([disabled])');
    focusTarget?.focus();

    function handleFocusTrap(event) {
      if (event.key !== 'Tab' || !drawerRef.current) {
        return;
      }

      const focusable = drawerRef.current.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleFocusTrap);

    return () => {
      document.removeEventListener('keydown', handleFocusTrap);
    };
  }, [isOpen]);

  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      menuButtonRef.current?.focus({ preventScroll: true });
    }

    wasOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (bodyOverflowRef.current !== '') {
        document.body.style.overflow = bodyOverflowRef.current;
        bodyOverflowRef.current = '';
      }
    };
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
    menuButtonRef,
    drawerRef,
    labelId,
  };
}
