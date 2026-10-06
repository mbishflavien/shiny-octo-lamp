import { useEffect, useRef } from 'react';

const INTERACTIVE_SELECTOR = '[data-cursor], a[href], button:not(:disabled), [role="button"]';
const TEXT_CONTROL_SELECTOR = 'input:not([type="button"]):not([type="submit"]):not([type="reset"]), textarea, select, [contenteditable="true"]';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const finePointer = window.matchMedia('(pointer: fine) and (hover: hover)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!cursor || !finePointer.matches || reducedMotion.matches) return;

    const root = document.documentElement;
    root.classList.add('has-custom-cursor');

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== 'mouse') return;

      const target = event.target instanceof Element ? event.target : null;
      const textControl = target?.closest(TEXT_CONTROL_SELECTOR) ?? null;
      const interactive = target?.closest<HTMLElement>(INTERACTIVE_SELECTOR) ?? null;
      const isNativeCursorTarget = Boolean(textControl);

      root.classList.toggle('has-native-cursor', isNativeCursorTarget);
      cursor.classList.toggle('is-native', isNativeCursorTarget);
      cursor.classList.toggle('is-active', Boolean(interactive) && !isNativeCursorTarget);
      cursor.classList.add('is-visible');
      cursor.style.setProperty('--cursor-x', `${event.clientX}px`);
      cursor.style.setProperty('--cursor-y', `${event.clientY}px`);

      if (labelRef.current) {
        const label = interactive?.dataset.cursor
          ?? (interactive?.matches('a[href]') ? 'OPEN' : interactive ? 'SELECT' : '');
        labelRef.current.textContent = label.toUpperCase();
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!event.pointerType || event.pointerType === 'mouse') {
        cursor.classList.add('is-pressed');
      }
    };

    const handlePointerUp = () => cursor.classList.remove('is-pressed');
    const handlePointerLeave = () => {
      cursor.classList.remove('is-visible', 'is-pressed');
      root.classList.remove('has-native-cursor');
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('blur', handlePointerLeave);
    document.documentElement.addEventListener('mouseleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('blur', handlePointerLeave);
      document.documentElement.removeEventListener('mouseleave', handlePointerLeave);
      root.classList.remove('has-custom-cursor', 'has-native-cursor');
    };
  }, []);

  return (
    <div ref={cursorRef} className="custom-cursor" aria-hidden="true">
      <span className="custom-cursor-dot" />
      <span className="custom-cursor-ring">
        <span ref={labelRef} className="custom-cursor-label" />
      </span>
    </div>
  );
}
