import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type Ref,
} from "react";

/**
 * Minimal prop surface we actually pass to the polymorphic tag. Casting `Tag` to this
 * instead of `any` keeps the render call type-checked while still allowing `as="section"`,
 * `as="li"`, etc.
 */
type PolymorphicProps = {
  ref?: Ref<HTMLElement>;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

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
    case "up":
      return `translateY(${distance}px)`;
    case "down":
      return `translateY(-${distance}px)`;
    case "left":
      return `translateX(${distance}px)`;
    case "right":
      return `translateX(-${distance}px)`;
    case "scale":
      return `scale(0.93)`;
    case "none":
      return "none";
  }
}

export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
  direction = "up",
  distance = 44,
  duration = 850,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const ease = "cubic-bezier(0.16, 1, 0.3, 1)";
  const Component = Tag as React.ComponentType<PolymorphicProps>;

  if (reducedMotion) {
    return (
      <Component ref={ref} className={className}>
        {children}
      </Component>
    );
  }

  return (
    <Component
      ref={ref}
      style={{
        transition: `opacity ${duration}ms ${ease}, transform ${duration}ms ${ease}, filter ${duration}ms ${ease}`,
        transitionDelay: `${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(0) translateX(0) scale(1)"
          : direction === "scale"
            ? "scale(0.92)"
            : `${getInitialTransform(direction, distance)} scale(0.98)`,
        filter: visible ? "blur(0px)" : "blur(8px)",
        willChange: "opacity, transform, filter",
      }}
      className={className}
    >
      {children}
    </Component>
  );
}
