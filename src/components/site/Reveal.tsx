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
  /** How many px the element travels. Default: 20 */
  distance?: number;
  /** Duration in ms. Default: 700 */
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
  distance = 20,
  duration = 700,
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

    // Reveal once, then stop observing.
    //
    // This used to mirror `isIntersecting` in both directions, so content hid again whenever it
    // left the viewport. Hidden content is translated downward, which on an element sitting at the
    // edge of the screen moves it *out* of the observed area, which hides it, which moves it back
    // in — a feedback loop that made blocks visibly shake and blur at the bottom of a phone
    // screen. A one-shot reveal cannot oscillate.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.01, rootMargin: "0px 0px -24px 0px" },
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
        transition: `opacity ${duration}ms ${ease}, transform ${duration}ms ${ease}`,
        transitionDelay: `${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(0) translateX(0) scale(1)"
          : direction === "scale"
            ? "scale(0.92)"
            : getInitialTransform(direction, distance),
        // Only hint the compositor while the transition can still run.
        willChange: visible ? undefined : "opacity, transform",
      }}
      className={className}
    >
      {children}
    </Component>
  );
}
