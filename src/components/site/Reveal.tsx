import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "scale" | "none";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
  /** Animation direction. Default: "up" */
  direction?: Direction;
  /** How many px the element travels. Default: 24 */
  distance?: number;
  /** Duration in ms. Default: 750 */
  duration?: number;
}

function getInitialTransform(direction: Direction, distance: number): string {
  switch (direction) {
    case "up":    return `translateY(${distance}px)`;
    case "down":  return `translateY(-${distance}px)`;
    case "left":  return `translateX(${distance}px)`;
    case "right": return `translateX(-${distance}px)`;
    case "scale": return `scale(0.93)`;
    case "none":  return "none";
  }
}

export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
  direction = "up",
  distance = 24,
  duration = 750,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setVisible(true); return; }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); io.disconnect(); }
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const ease = "cubic-bezier(0.16, 1, 0.3, 1)";
  const Component = Tag as any;

  return (
    <Component
      ref={ref as any}
      style={{
        transition: `opacity ${duration}ms ${ease}, transform ${duration}ms ${ease}, filter ${duration}ms ${ease}`,
        transitionDelay: `${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? (direction === "scale" ? "scale(1)" : "none") : getInitialTransform(direction, distance),
        filter: visible ? "blur(0px)" : "blur(4px)",
        willChange: "opacity, transform, filter",
      }}
      className={className}
    >
      {children}
    </Component>
  );
}
