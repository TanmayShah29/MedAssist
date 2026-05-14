"use client";

import { useEffect, useRef, useState } from "react";

type Stat = {
  value: number;
  suffix?: string;
  label: string;
  color: string;
};

const stats: Stat[] = [
  { value: 35, suffix: "+", label: "Biomarkers tracked", color: "text-sky-500" },
  { value: 20, suffix: "s", label: "Analysis time", color: "text-emerald-500" },
  { value: 100, suffix: "%", label: "Private & encrypted", color: "text-violet-500" },
  { value: 0, label: "Cost to start", color: "text-amber-500" },
];

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    let frame = 0;
    let start: number | null = null;
    const duration = 1100;

    const tick = (timestamp: number) => {
      start ??= timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setValue(Math.round(target * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target]);

  return value;
}

function CounterTile({ stat, delay }: { stat: Stat; delay: number }) {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const value = useCountUp(stat.value, active);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-[16px] border border-[#E8E6DF] bg-white/78 p-5 text-center shadow-sm landing-reveal"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/70 to-transparent" />
      <div className={`font-display text-4xl font-bold ${stat.color} mb-1 landing-breathe`}>
        {value}
        {stat.suffix}
      </div>
      <div className="text-[12px] font-medium text-[#A8A29E] uppercase tracking-wider">{stat.label}</div>
    </div>
  );
}

export function StatsCounter() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {stats.map((stat, i) => (
        <CounterTile key={stat.label} stat={stat} delay={i * 80} />
      ))}
    </div>
  );
}
