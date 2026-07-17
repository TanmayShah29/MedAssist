"use client";

import { useEffect, useRef, useState } from "react";

function CountUp({
  to,
  suffix = "",
  duration = 1500,
  start,
}: {
  to: number;
  suffix?: string;
  duration?: number;
  start: boolean;
}) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!start || to === 0) return;
    let raf: number;
    const startTime = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // cubic ease-out
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, to, duration]);

  if (to === 0) return <>Free</>;
  return (
    <>
      {val}
      {suffix}
    </>
  );
}

const STATS = [
  { to: 35, suffix: "+", label: "Biomarkers tracked", color: "text-sky-500" },
  { to: 20, suffix: "s", label: "Analysis time", color: "text-emerald-500" },
  { to: 100, suffix: "%", label: "Private & encrypted", color: "text-violet-500" },
  { to: 0, suffix: "", label: "Cost to start", color: "text-amber-500" },
];

export function StatsCounter() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {STATS.map((s, i) => (
        <div
          key={s.label}
          className="text-center landing-reveal"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className={`font-display text-4xl font-bold ${s.color} mb-1 tabular-nums`}>
            <CountUp
              to={s.to}
              suffix={s.suffix}
              start={started}
              duration={1400 + i * 150}
            />
          </div>
          <div className="text-[12px] font-medium text-[#64748B] uppercase tracking-wider">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
