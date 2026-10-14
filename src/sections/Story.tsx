import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const chapters = [
  {
    era: "2021 to 2022",
    title: "The spark",
    desc: "It began with freelancing, side gigs and creative ideas from campus dorms.",
  },
  {
    era: "2022 to 2024",
    title: "The growth",
    desc: "The YoographiX era. Teamwork, real client growth, and finding our creative rhythm.",
  },
  {
    era: "2025 to today",
    title: "The shift & the rise",
    desc: "A bold rebrand. Yoo360 is born with a wider vision, sharper strategy and renewed purpose.",
  },
];

export default function Story() {
  return (
    <section id="studio" className="px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-2">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] uppercase text-[#131311]/50">
              The studio
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
              Behind every Yoo,
              <br />
              there's a <em className="font-serif-accent font-normal italic text-[#C79A00]">why.</em>
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-[#131311]/65">
              We help businesses understand their customers, shape their brands
              and bring their products to market. Our designers, filmmakers,
              strategists and developers work together across brand identity,
              campaigns, ongoing marketing and digital products.
            </p>
            <a href="/about" className="mt-6 block text-sm font-semibold underline decoration-[#FFC700] decoration-2 underline-offset-8">About Yoo360</a>
            <a href="/team" className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[#131311] px-6 py-3 text-sm font-semibold text-[#F6F4EE] transition-colors hover:bg-[#FFC700] hover:text-[#131311] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A17A00]">
              Meet the team <ArrowUpRight aria-hidden="true" className="size-4 transition-transform duration-300 motion-reduce:transition-none group-hover:rotate-45" />
            </a>
          </div>

          <ol className="relative space-y-2 border-l border-[#131311]/15 pl-8">
            {chapters.map((c, i) => (
              <motion.li
                key={c.title}
                initial={{ opacity: 0, x: 32 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group relative rounded-2xl p-6 transition-colors hover:bg-[#131311] hover:text-[#F6F4EE]"
              >
                <span className="absolute top-9 -left-[41px] size-4 rounded-full border-4 border-[#F6F4EE] bg-[#FFC700] transition-transform group-hover:scale-125" />
                <p className="text-xs font-bold tracking-[0.18em] uppercase text-[#C79A00] group-hover:text-[#FFC700]">
                  {c.era}
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold md:text-3xl">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#131311]/60 group-hover:text-[#F6F4EE]/65">
                  {c.desc}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
