import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const services = [
  {
    n: "01",
    title: "Creative Design",
    desc: "Posters, campaigns and social content that give your message the spotlight it deserves.",
    tags: ["Posters", "Campaigns", "Social"],
    img: "/assets/works/work-1.webp",
  },
  {
    n: "02",
    title: "Brand Identity",
    desc: "We don't just design logos. We build visual systems that show who you are and why you'll be remembered.",
    tags: ["Logo", "Visual system", "Guidelines"],
    img: "/assets/visual/brand.webp",
  },
  {
    n: "03",
    title: "Web Development",
    desc: "Websites that explain what you do, attract customers and help people trust you.",
    tags: ["Websites", "Ecommerce", "SEO"],
    img: "/assets/works/work-web.webp",
  },
  {
    n: "04",
    title: "Mobile Apps",
    desc: "We build marketplaces and tools for focused audiences, including products like Campus Mart.",
    tags: ["iOS & Android", "Marketplaces", "UX"],
    img: "/assets/works/work-app.webp",
  },
];

export default function Services() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 22 });
  const sy = useSpring(y, { stiffness: 180, damping: 22 });

  const onMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  };

  return (
    <section id="services" className="px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] uppercase text-[#131311]/50">
              What we do
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
              Four crafts,
              <br />
              one <em className="font-serif-accent font-normal italic text-[#C79A00]">obsession.</em>
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-[#131311]/60">
            Everything your brand needs to look sharp and grow, from the
            first sketch to the finished product.
          </p>
        </div>

        <div
          ref={ref}
          onMouseMove={onMove}
          onMouseLeave={() => setActive(null)}
          className="relative border-t border-[#131311]/12"
        >
          {/* floating preview */}
          <AnimatePresence>
            {active !== null && (
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.7, rotate: -6 }}
                animate={{ opacity: 1, scale: 1, rotate: 3 }}
                exit={{ opacity: 0, scale: 0.7, rotate: 6 }}
                transition={{ duration: 0.25 }}
                style={{ x: sx, y: sy }}
                className="pointer-events-none absolute top-0 left-0 z-20 hidden lg:block"
              >
                <img
                  src={services[active].img}
                  alt=""
                  className="h-56 w-44 -translate-x-1/2 -translate-y-1/2 rounded-2xl object-cover shadow-2xl ring-4 ring-[#FFC700]"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {services.map((s, i) => (
            <motion.a
              key={s.n}
              href="#contact"
              onMouseEnter={() => setActive(i)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.07, duration: 0.55 }}
              className={`group relative grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-[#131311]/12 px-2 py-8 transition-colors duration-300 md:grid-cols-[80px_1fr_1fr_auto] md:gap-8 md:px-6 md:py-10 ${
                active === i ? "bg-[#131311] text-[#F6F4EE]" : "hover:bg-[#131311]/[0.03]"
              }`}
            >
              <span
                className={`font-display text-sm font-semibold ${
                  active === i ? "text-[#FFC700]" : "text-[#131311]/40"
                }`}
              >
                {s.n}
              </span>
              <h3 className="font-display text-2xl font-bold tracking-tight md:text-4xl">
                {s.title}
              </h3>
              <div className="col-span-3 md:col-span-1">
                <p className={`text-sm leading-relaxed ${active === i ? "text-[#F6F4EE]/70" : "text-[#131311]/55"}`}>
                  {s.desc}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {s.tags.map((t) => (
                    <span
                      key={t}
                      className={`rounded-full border px-3 py-1 text-[11px] font-medium ${
                        active === i
                          ? "border-[#F6F4EE]/25 text-[#F6F4EE]/80"
                          : "border-[#131311]/15 text-[#131311]/60"
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <span
                className={`grid size-11 place-items-center rounded-full border transition-all duration-300 ${
                  active === i
                    ? "rotate-45 border-[#FFC700] bg-[#FFC700] text-[#131311]"
                    : "border-[#131311]/20"
                }`}
              >
                <ArrowUpRight className="size-5" />
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
