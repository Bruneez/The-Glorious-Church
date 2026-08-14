import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { hasOpenModals } from '@/utils/modalStack';
import {
  DESKTOP_SIDEBAR_MEDIA_QUERY,
  getDesktopSidebarMatches,
  getInitialDesktopSidebarMatches,
  subscribeDesktopSidebar,
} from '@/utils/viewportLayout';

export const NAV_DRAWER_ID = 'app-nav-drawer';

/** Matches Tailwind `xl` — persistent sidebar begins at this width. */
export { DESKTOP_SIDEBAR_MEDIA_QUERY };

export function useIsDesktopSidebar() {
  const [isDesktopSidebar, setIsDesktopSidebar] = useState(getInitialDesktopSidebarMatches);

  useEffect(() => subscribeDesktopSidebar(setIsDesktopSidebar), []);

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
    return subscribeDesktopSidebar(() => {
      close();
    });
  }, [close]);

  useEffect(() => {
    if (!isOpen || getDesktopSidebarMatches()) {
      return undefined;
    }

    if (hasOpenModals()) {
      return undefined;
    }

    bodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        if (hasOpenModals()) return;
        event.preventDefault();
        close();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (!hasOpenModals()) {
        document.body.style.overflow = bodyOverflowRef.current;
      }
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen || getDesktopSidebarMatches()) {
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
      if (bodyOverflowRef.current !== '' && !hasOpenModals()) {
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
