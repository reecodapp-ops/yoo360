import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const works = [
  {
    img: "/assets/works/work-2.webp",
    title: "Borderless: Campaign Series",
    tag: "Creative Design",
    span: "md:col-span-7",
    ratio: "aspect-[4/3]",
  },
  {
    img: "/assets/works/work-app.webp",
    title: "Campus Mart: Student Marketplace",
    tag: "Mobile App",
    span: "md:col-span-5",
    ratio: "aspect-[4/3]",
  },
  {
    img: "/assets/works/work-web.webp",
    title: "Travel & Tour Websites",
    tag: "Web Development",
    span: "md:col-span-5",
    ratio: "aspect-[4/3]",
  },
  {
    img: "/assets/works/work-3.webp",
    title: "Product & Promo Posters",
    tag: "Creative Design",
    span: "md:col-span-7",
    ratio: "aspect-[4/3]",
  },
];

export default function Work() {
  return (
    <section id="work" className="bg-[#131311] px-5 py-24 text-[#F6F4EE] md:px-10 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] uppercase text-[#F6F4EE]/40">
              Selected work
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
              Work that <em className="font-serif-accent font-normal italic text-[#FFC700]">works.</em>
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-[#F6F4EE]/55">
            A snapshot of campaigns, identities, websites and apps we've
            shipped for brands that do good.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-12 md:gap-6">
          {works.map((w, i) => (
            <motion.figure
              key={w.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: (i % 2) * 0.12, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative cursor-pointer overflow-hidden rounded-3xl bg-[#1d1d1a] ${w.span} ${w.ratio}`}
            >
              <img
                src={w.img}
                alt={w.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#131311]/85 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95" />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                <div>
                  <span className="mb-2 inline-block rounded-full bg-[#FFC700] px-3 py-1 text-[11px] font-bold tracking-wide text-[#131311] uppercase">
                    {w.tag}
                  </span>
                  <h3 className="font-display text-xl font-bold md:text-2xl">{w.title}</h3>
                </div>
                <span className="grid size-11 shrink-0 translate-y-2 place-items-center rounded-full bg-[#F6F4EE] text-[#131311] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <ArrowUpRight className="size-5" />
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
