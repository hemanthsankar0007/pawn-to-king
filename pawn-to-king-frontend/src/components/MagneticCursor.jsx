import { useEffect, useRef } from "react";

const MAGNETIC_SELECTOR = "a, button, [role='button'], .magnetic-target";

const hasTouchPointer = () => {
  if (typeof window === "undefined") {
    return true;
  }

  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  return coarsePointer || navigator.maxTouchPoints > 0 || "ontouchstart" in window;
};

function MagneticCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || hasTouchPointer()) {
      return undefined;
    }

    const cursor = cursorRef.current;
    if (!cursor) {
      return undefined;
    }

    let pointerX = window.innerWidth * 0.5;
    let pointerY = window.innerHeight * 0.5;
    let cursorX = pointerX;
    let cursorY = pointerY;
    let activeTarget = null;
    let isHoveringAction = false;
    let moveFrame = 0;
    let rafId = 0;
    let queuedPoint = null;

    const resetTarget = () => {
      if (activeTarget) {
        activeTarget.style.translate = "0px 0px";
        activeTarget.style.willChange = "auto";
      }
      activeTarget = null;
      isHoveringAction = false;
      cursor.dataset.active = "false";
    };

    const onMouseMove = (event) => {
      queuedPoint = { x: event.clientX, y: event.clientY };

      if (!moveFrame) {
        moveFrame = window.requestAnimationFrame(() => {
          if (queuedPoint) {
            pointerX = queuedPoint.x;
            pointerY = queuedPoint.y;
            queuedPoint = null;
          }
          moveFrame = 0;
        });
      }
    };

    const onPointerOver = (event) => {
      const target = event.target.closest(MAGNETIC_SELECTOR);
      if (!target) {
        return;
      }

      if (activeTarget && activeTarget !== target) {
        activeTarget.style.translate = "0px 0px";
        activeTarget.style.willChange = "auto";
      }

      activeTarget = target;
      activeTarget.style.willChange = "transform";
      isHoveringAction = true;
      cursor.dataset.active = "true";
    };

    const onPointerOut = (event) => {
      if (!activeTarget) {
        return;
      }

      const related = event.relatedTarget;
      if (related && activeTarget.contains(related)) {
        return;
      }

      resetTarget();
    };

    const onWindowLeave = () => {
      cursor.style.opacity = "0";
    };

    const onWindowEnter = () => {
      cursor.style.opacity = "1";
    };

    const animate = () => {
      cursorX += (pointerX - cursorX) * 0.17;
      cursorY += (pointerY - cursorY) * 0.17;

      const scale = isHoveringAction ? 1.28 : 1;
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%) scale(${scale})`;

      if (activeTarget) {
        const rect = activeTarget.getBoundingClientRect();
        const deltaX = pointerX - (rect.left + rect.width * 0.5);
        const deltaY = pointerY - (rect.top + rect.height * 0.5);
        const limitX = Math.min(14, rect.width * 0.08);
        const limitY = Math.min(14, rect.height * 0.08);
        const magnetX = Math.max(-limitX, Math.min(limitX, deltaX * 0.18));
        const magnetY = Math.max(-limitY, Math.min(limitY, deltaY * 0.18));
        activeTarget.style.translate = `${magnetX}px ${magnetY}px`;
      }

      rafId = window.requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("pointerover", onPointerOver);
    document.addEventListener("pointerout", onPointerOut);
    window.addEventListener("mouseleave", onWindowLeave);
    window.addEventListener("mouseenter", onWindowEnter);

    rafId = window.requestAnimationFrame(animate);

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      if (moveFrame) {
        window.cancelAnimationFrame(moveFrame);
      }

      resetTarget();
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
      window.removeEventListener("mouseleave", onWindowLeave);
      window.removeEventListener("mouseenter", onWindowEnter);
    };
  }, []);

  return <div ref={cursorRef} className="magnetic-cursor" data-active="false" aria-hidden="true" />;
}

export default MagneticCursor;
