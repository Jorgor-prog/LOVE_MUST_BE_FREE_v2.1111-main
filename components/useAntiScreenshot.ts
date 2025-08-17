'use client';
import { useEffect, useRef, useState } from 'react';

export default function useAntiScreenshot(ms: number = 6000) {
  const [blurred, setBlurred] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const arm = (dur = ms) => {
    if (t.current) clearTimeout(t.current as any);
    setBlurred(true);
    t.current = setTimeout(() => setBlurred(false), dur);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key?.toLowerCase();
      if (k === 'printscreen') { arm(); return; }
      if ((e.metaKey || (e as any).windowsKey) && e.shiftKey && (k === 's' || k === 'screenshot')) { arm(); return; }
      if (e.metaKey && e.shiftKey && (k === '3' || k === '4' || k === '5')) { arm(); return; }
    };
    const onBlur = () => arm(4000);
    window.addEventListener('blur', onBlur);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('keydown', onKey);
      if (t.current) clearTimeout(t.current as any);
    };
  }, [ms]);
  return blurred;
}
