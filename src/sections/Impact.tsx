import { useEffect, useRef } from "react";
import { motion, useInView, animate } from "framer-motion";
import { Trophy } from "lucide-react";

const stats = [
  { value: 72, suffix: "", label: "Projects completed" },
  { value: 92, suffix: "%", label: "Smiles after service" },
  { value: 8, suffix: "+", label: "International collaborations" },
  { value: 5, suffix: "", label: "Products under development" },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, value, suffix]);

  return (
    <span ref={ref} className="font-display text-6xl font-bold tracking-tight md:text-7xl">
      {typeof window === "undefined" ? value : 0}{suffix}
    </span>
  );
}

export default function Impact() {
  return (
    <section id="impact" className="px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] uppercase text-[#131311]/50">
            Our impact
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
            Numbers that <em className="font-serif-accent font-normal italic text-[#C79A00]">smile back.</em>
          </h2>
        </div>

        <div className="grid gap-px overflow-hidden rounded-3xl border border-[#131311]/12 bg-[#131311]/12 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group flex flex-col gap-3 bg-[#F6F4EE] p-8 transition-colors duration-300 hover:bg-[#FFC700] md:p-10"
            >
              <Counter value={s.value} suffix={s.suffix} />
              <p className="text-sm font-medium text-[#131311]/60">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 flex items-center gap-5 rounded-3xl bg-[#131311] p-8 text-[#F6F4EE] md:p-10"
        >
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#FFC700] text-[#131311]">
            <Trophy className="size-7" />
          </span>
          <div>
            <p className="font-display text-xl font-bold md:text-2xl">
              DRC SPNCK Creative Award Winner
            </p>
            <p className="mt-1 text-sm text-[#F6F4EE]/55">
              Recognized for creative excellence on a national stage.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
