import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 * i, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function OrbitBadge() {
  const text = "CREATIVE TECH STUDIO • YOO360 • EST. 2021 • ";
  return (
    <div className="relative grid size-32 place-items-center md:size-40">
      <svg viewBox="0 0 100 100" className="absolute inset-0 animate-spin-slower">
        <defs>
          <path id="circlePath" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
        </defs>
        <text className="fill-[#131311] font-display text-[8.2px] font-semibold tracking-[0.16em]">
          <textPath href="#circlePath">{text}</textPath>
        </text>
      </svg>
      <a
        href="#work"
        className="grid size-14 place-items-center rounded-full bg-[#FFC700] transition-transform hover:scale-110 md:size-16"
        aria-label="Scroll to work"
      >
        <ArrowDown className="size-5" />
      </a>
    </div>
  );
}

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden px-5 pt-32 pb-16 md:px-10 md:pt-40 md:pb-20">
      {/* soft background flourishes */}
      <div className="pointer-events-none absolute -top-24 -right-24 size-[420px] rounded-full bg-[#FFC700]/25 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-40 size-[360px] rounded-full bg-[#FFC700]/15 blur-3xl" />

      <div className="mx-auto max-w-7xl">
        <h1 className="font-display text-[13vw] leading-[0.95] font-bold tracking-[-0.03em] sm:text-[11vw] lg:text-[7.5rem]">
          <motion.span variants={fadeUp} initial="hidden" animate="show" custom={1} className="block">
            We design what
          </motion.span>
          <motion.span variants={fadeUp} initial="hidden" animate="show" custom={2} className="block">
            <em className="font-serif-accent font-normal italic text-[#C79A00]">sells.</em> We build
          </motion.span>
          <motion.span variants={fadeUp} initial="hidden" animate="show" custom={3} className="block">
            what <span className="relative inline-block">
              <em className="font-serif-accent font-normal italic">matters.</em>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.9, duration: 0.6, ease: "easeOut" }}
                className="absolute -bottom-1 left-0 h-[0.14em] w-full origin-left rounded-full bg-[#FFC700] md:-bottom-2"
              />
            </span>
          </motion.span>
        </h1>

        <div className="mt-6 flex flex-col items-start justify-between gap-6 md:mt-8 md:flex-row">
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className="max-w-md">
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="/discuss-a-project"
                className="group inline-flex items-center gap-2 rounded-full bg-[#131311] px-7 py-3.5 text-sm font-semibold text-[#F6F4EE] transition-colors hover:bg-[#FFC700] hover:text-[#131311]"
              >
                Discuss a project
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
              </a>
              <a
                href="#work"
                className="group inline-flex items-center gap-2 rounded-full border border-[#131311]/20 px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-[#FFC700] hover:border-[#FFC700]"
              >
                Explore our work
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="self-end md:self-auto"
          >
            <OrbitBadge />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
