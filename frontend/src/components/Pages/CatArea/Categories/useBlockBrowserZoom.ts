import * as React from "react";

export function useBlockBrowserZoom(ref: React.RefObject<HTMLElement>) {
  const isOverRef = React.useRef(false); 

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const markOver = () => (isOverRef.current = true);
    const markOut = () => (isOverRef.current = false);

    const onWheel = (e: WheelEvent) => {
      if (!isOverRef.current) return;

      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    const onGesture = (e: Event) => {
      if (!isOverRef.current) return;
      e.preventDefault();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isOverRef.current) return;
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!isOverRef.current) return;
      if ((e.ctrlKey || e.metaKey) && ["=", "+", "-", "0"].includes(e.key)) {
        e.preventDefault();
      }
    };

    el.addEventListener("mouseenter", markOver, { passive: true });
    el.addEventListener("mouseleave", markOut, { passive: true });
    el.addEventListener("pointerenter", markOver, { passive: true });
    el.addEventListener("pointerleave", markOut, { passive: true });

    el.addEventListener("wheel", onWheel, { passive: false, capture: true });
    el.addEventListener("gesturestart", onGesture as any, { passive: false });
    el.addEventListener("gesturechange", onGesture as any, { passive: false });
    el.addEventListener("gestureend", onGesture as any, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });

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
