// src/hooks/useHorizontalScroll.ts
import { useRef, useEffect } from 'react';

/**
 * Hook untuk mengaktifkan scroll horizontal penuh & responsif:
 * 1. Mouse wheel (roda mouse vertikal/horizontal langsung menggeser konten)
 * 2. Klik & Tarik (Click & Drag / Pan) mouse desktop di seluruh layar
 * 3. Tetap mendukung sentuhan mobile alami (touch-pan-x)
 */
export function useHorizontalScroll<T extends HTMLElement = HTMLDivElement>() {
  const elRef = useRef<T | null>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    let isDown = false;
    let startClientX = 0;
    let initialScrollLeft = 0;

    // 1. Dukungan Mouse Wheel
    const handleWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta !== 0) {
        const canScroll = el.scrollWidth > el.clientWidth;
        if (canScroll) {
          e.preventDefault();
          el.scrollLeft += delta;
        }
      }
    };

    // 2. Dukungan Klik & Tarik (Drag to Scroll)
    const handleMouseDown = (e: MouseEvent) => {
      // Abaikan jika klik berasal dari tombol interaktif
      if ((e.target as HTMLElement).closest('button, a, input, select')) return;

      isDown = true;
      startClientX = e.clientX;
      initialScrollLeft = el.scrollLeft;
      el.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    };

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const deltaX = e.clientX - startClientX;
      el.scrollLeft = initialScrollLeft - deltaX * 1.2;
    };

    const handleWindowMouseUp = () => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = '';
      document.body.style.removeProperty('user-select');
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      document.body.style.removeProperty('user-select');
    };
  }, []);

  return elRef;
}
