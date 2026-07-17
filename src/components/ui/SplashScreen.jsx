import { useEffect, useState } from 'react';
import churchLogo from '@/assets/The GC Official Logo.png';

const FADE_OUT_MS = 400;

export default function SplashScreen({ active = false }) {
  const [mounted, setMounted] = useState(active);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (active) {
      setMounted(true);
      setExiting(false);
      return undefined;
    }

    if (!mounted) {
      return undefined;
    }

    setExiting(true);
    const timer = window.setTimeout(() => {
      setMounted(false);
      setExiting(false);
    }, FADE_OUT_MS);

    return () => window.clearTimeout(timer);
  }, [active, mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`splash-screen${exiting ? ' splash-screen--exit' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy={active ? 'true' : 'false'}
    >
      <div className="splash-screen__backdrop" aria-hidden="true">
        <div className="splash-screen__glow splash-screen__glow--purple" />
        <div className="splash-screen__glow splash-screen__glow--blue" />
        <div className="splash-screen__glow splash-screen__glow--indigo" />
      </div>

      <div className="splash-screen__content">
        <div className="splash-screen__logo-wrap">
          <div className="splash-screen__logo-glow" aria-hidden="true" />
          <img
            src={churchLogo}
            alt="The Glorious Church official logo"
            className="splash-screen__logo"
          />
        </div>

        <h1 className="splash-screen__title">THE GLORIOUS CHURCH</h1>
        <p className="splash-screen__subtitle">Church Management System</p>

        <div className="splash-screen__loader" aria-hidden="true">
          <span className="splash-screen__dot" />
          <span className="splash-screen__dot" />
          <span className="splash-screen__dot" />
        </div>

        <p className="splash-screen__message">Preparing your experience...</p>
        <span className="sr-only">Loading application, please wait.</span>
      </div>
    </div>
  );
}
