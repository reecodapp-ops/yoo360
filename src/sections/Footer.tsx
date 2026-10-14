import { motion } from "framer-motion";
import { ArrowUpRight, Dribbble, Instagram, Linkedin, Twitter } from "lucide-react";

export default function Footer({ subpage = false }: { subpage?: boolean }) {
  return (
    <footer id="contact" className="relative overflow-hidden bg-[#131311] text-[#F6F4EE]">
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-[#FFC700]/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 pt-24 pb-10 md:px-10 md:pt-32">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl font-display text-[clamp(2.55rem,9.3vw,4.75rem)] leading-[1.08] font-bold tracking-[-0.03em] md:text-7xl"
        >
          <span className="block md:inline">We help brands</span>{" "}
          <span className="block md:inline">that do good,</span>{" "}
          <em className="block font-serif-accent font-normal italic text-[#FFC700] md:inline-block">look good.</em>
        </motion.h2>

        <div className="mt-12 flex flex-col justify-between gap-10 border-t border-[#F6F4EE]/12 pt-10 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-sm text-[#F6F4EE]/55">
              Have a project in mind? Tell us what you need.
            </p>
            <a href="/discuss-a-project" className="group inline-flex items-center gap-2 rounded-full bg-[#FFC700] px-6 py-3 text-sm font-bold text-[#131311] transition-transform hover:scale-105">
              Discuss a project <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
            </a>
          </div>

          <a
            href="/marketing-partnerships"
            className="group inline-flex items-center gap-2 self-start font-display text-lg font-semibold md:self-auto"
          >
            Build With Us
            <span className="grid size-12 place-items-center rounded-full bg-[#FFC700] text-[#131311] transition-transform duration-300 group-hover:rotate-45">
              <ArrowUpRight className="size-5" />
            </span>
          </a>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-[#F6F4EE]/12 pt-8 md:flex-row md:items-center">
          <a href={subpage ? "/#top" : "#top"} className="flex shrink-0 items-center" aria-label="Yoo360 home">
            <img src="/brand/yoo360-primary-white.webp" alt="Yoo360" width={2013} height={354} className="block h-auto w-32 object-contain" />
          </a>

          <div className="flex items-center gap-3">
            {[Linkedin, Dribbble, Instagram, Twitter].map((Icon, i) => (
              <a
                key={i}
                href="#top"
                aria-label="Social link"
                className="grid size-10 place-items-center rounded-full border border-[#F6F4EE]/15 text-[#F6F4EE]/70 transition-all hover:border-[#FFC700] hover:bg-[#FFC700] hover:text-[#131311]"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>

          <p className="text-xs text-[#F6F4EE]/40">
            © {new Date().getFullYear()} Yoo360. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
