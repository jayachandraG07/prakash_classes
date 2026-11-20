import React, { useEffect, useRef, useState } from "react";

export function Reveal({ children, className = "", as: Tag = "section", delay = 0, style, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? "in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function SectionHeading({ eyebrow, title }) {
  return (
    <Reveal as="div" className="mb-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">{eyebrow}</p>
      <h2 className="font-display mt-2 text-3xl font-bold tracking-tight text-[#1C1917] sm:text-4xl">{title}</h2>
      <span className="mt-4 block h-1 w-16 rounded-full bg-yellow-400" />
    </Reveal>
  );
}
