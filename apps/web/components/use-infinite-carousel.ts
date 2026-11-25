"use client";

import { useEffect, useRef, type HTMLAttributes, type RefObject } from "react";

export function useInfiniteCarousel(): HTMLAttributes<HTMLDivElement> & { ref: RefObject<HTMLDivElement | null> } {
  const ribbonRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, x: 0, scroll: 0, moved: false });
  const pauseUntil = useRef(0);

  useEffect(() => {
    const ribbon = ribbonRef.current;
    if (!ribbon) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let previous = 0;
    let fractionalScroll = 0;
    const wrap = () => {
      const track = ribbon.firstElementChild as HTMLElement | null;
      if (!track || reducedMotion.matches) return;
      const width = track.scrollWidth / 2;
      if (width && ribbon.scrollLeft >= width) ribbon.scrollLeft -= width;
    };
    const tick = (now: number) => {
      const elapsed = previous ? Math.min(now - previous, 50) : 0;
      previous = now;
      if (!reducedMotion.matches && !drag.current.active && now > pauseUntil.current && !ribbon.matches(":focus-visible, :has(:focus-visible)")) {
        fractionalScroll += elapsed * 0.025;
        const pixels = Math.floor(fractionalScroll);
        fractionalScroll -= pixels;
        ribbon.scrollLeft += pixels;
        wrap();
      }
      frame = requestAnimationFrame(tick);
    };
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || ribbon.scrollWidth <= ribbon.clientWidth) return;
      event.preventDefault();
      pauseUntil.current = performance.now() + 2500;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const amount = delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? ribbon.clientWidth : 1);
      if (amount < 0 && ribbon.scrollLeft <= 0 && !reducedMotion.matches) ribbon.scrollLeft = (ribbon.firstElementChild as HTMLElement).scrollWidth / 2;
      ribbon.scrollLeft += amount;
      wrap();
    };
    ribbon.addEventListener("wheel", wheel, { passive: false });
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); ribbon.removeEventListener("wheel", wheel); };
  }, []);

  return {
    ref: ribbonRef,
    onPointerDown: (event) => {
      pauseUntil.current = performance.now() + 2500;
      drag.current.moved = false;
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      drag.current = { active: true, x: event.clientX, scroll: event.currentTarget.scrollLeft, moved: false };
    },
    onPointerMove: (event) => {
      if (!drag.current.active) return;
      const distance = event.clientX - drag.current.x;
      if (Math.abs(distance) > 5) {
        drag.current.moved = true;
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      event.currentTarget.scrollLeft = drag.current.scroll - distance;
    },
    onPointerUp: () => { drag.current.active = false; pauseUntil.current = performance.now() + 2500; },
    onPointerCancel: () => { drag.current.active = false; },
    onLostPointerCapture: () => { drag.current.active = false; },
    onPointerLeave: () => { if (!drag.current.moved) drag.current.active = false; },
    onClickCapture: (event) => { if (drag.current.moved) { event.preventDefault(); event.stopPropagation(); drag.current.moved = false; } },
  };
}
