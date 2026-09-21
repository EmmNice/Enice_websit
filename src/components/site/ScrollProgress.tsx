import { useEffect, useState } from "react";

/**
 * The reading-progress hairline at the very top of the viewport.
 *
 * Scroll work is rAF-throttled: the previous version wrote state on every scroll event, which on
 * a long page meant a React render per event and a layout read (`scrollHeight`) inside it. The
 * bar is also warm rather than the old navy, and is scaled rather than re-widthed so the browser
 * can keep it on the compositor.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(1, Math.max(0, el.scrollTop / total)) : 0);
    };

    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-px">
      <div
        className="h-full origin-left"
        style={{
          transform: `scaleX(${progress})`,
          background: "linear-gradient(to right, #a8702f, #d8a45c)",
        }}
      />
    </div>
  );
}
