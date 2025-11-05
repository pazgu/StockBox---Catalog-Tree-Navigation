import * as React from "react";

export function useBlockBrowserZoom(ref: React.RefObject<HTMLElement>) {
  const isOverRef = React.useRef(false); // are we inside the element?

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // --- helpers
    const markOver = () => (isOverRef.current = true);
    const markOut = () => (isOverRef.current = false);

    // wheel pinch (Chrome/Edge)
    const onWheel = (e: WheelEvent) => {
      if (!isOverRef.current) return;
      // ctrlKey or metaKey indicates zoom gesture on most platforms
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    // Safari pinch (non-standard gesture events)
    const onGesture = (e: Event) => {
      if (!isOverRef.current) return;
      e.preventDefault();
    };

    // iOS Safari: 2-finger move also tries to zoom/scroll
    const onTouchMove = (e: TouchEvent) => {
      if (!isOverRef.current) return;
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Keyboard zoom (⌘/Ctrl + + / - / 0) while inside the element
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isOverRef.current) return;
      if ((e.ctrlKey || e.metaKey) && ["=", "+", "-", "0"].includes(e.key)) {
        e.preventDefault();
      }
    };

    // Track enter/leave with both mouse and pointer (covers touch pen)
    el.addEventListener("mouseenter", markOver, { passive: true });
    el.addEventListener("mouseleave", markOut, { passive: true });
    el.addEventListener("pointerenter", markOver, { passive: true });
    el.addEventListener("pointerleave", markOut, { passive: true });

    // The important ones: must be passive:false to allow preventDefault
    el.addEventListener("wheel", onWheel, { passive: false, capture: true });
    el.addEventListener("gesturestart", onGesture as any, { passive: false });
    el.addEventListener("gesturechange", onGesture as any, { passive: false });
    el.addEventListener("gestureend", onGesture as any, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });

    // Keyboard on the whole document, but only blocks when we're "over"
    document.addEventListener("keydown", onKeyDown, { passive: false, capture: true });

    return () => {
      el.removeEventListener("mouseenter", markOver);
      el.removeEventListener("mouseleave", markOut);
      el.removeEventListener("pointerenter", markOver);
      el.removeEventListener("pointerleave", markOut);

      el.removeEventListener("wheel", onWheel as any, true);
      el.removeEventListener("gesturestart", onGesture as any);
      el.removeEventListener("gesturechange", onGesture as any);
      el.removeEventListener("gestureend", onGesture as any);
      el.removeEventListener("touchmove", onTouchMove as any, true);

      document.removeEventListener("keydown", onKeyDown as any, true);
    };
  }, [ref]);
}

export default useBlockBrowserZoom;
