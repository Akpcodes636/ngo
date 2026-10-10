"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

type Animation = "fade-up" | "fade-in" | "fade-left" | "fade-right";

export function AnimateIn({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 650,
  threshold = 0.1,
  className,
}: {
  children: React.ReactNode;
  animation?: Animation;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={clsx(className)}
      style={
        visible
          ? { animation: `${animation} ${duration}ms ease-out ${delay}ms both` }
          : { opacity: 0 }
      }
    >
      {children}
    </div>
  );
}
