import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { ORDERS_URL } from "@/lib/links";

const links = [
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Impact", href: "#impact" },
  { label: "Studio", href: "#studio" },
];

export default function Nav({ projectPage = false }: { projectPage?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const homeLink = (href: string) => projectPage ? "/" + href : href;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#F6F4EE]/85 backdrop-blur-xl border-b border-[#131311]/8"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">
        <a href={homeLink("#top")} className="flex shrink-0 items-center" aria-label="Yoo360 home">
          <img src="/brand/yoo360-primary-white.png" alt="Yoo360" width={2013} height={354} className="block h-auto w-32 object-contain brightness-0 md:w-36" />
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={homeLink(l.href)}
                className="group relative text-sm font-medium text-[#131311]/70 transition-colors hover:text-[#131311]"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#131311] transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a href={ORDERS_URL} className="hidden text-sm font-medium text-[#131311]/70 transition-colors hover:text-[#131311] lg:inline-flex">
            Order a design
          </a>
          <a
            href="/discuss-a-project"
            className="group hidden items-center gap-1.5 rounded-full bg-[#131311] px-5 py-2.5 text-sm font-semibold text-[#F6F4EE] transition-colors hover:bg-[#FFC700] hover:text-[#131311] md:inline-flex"
          >
            Discuss a project
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
          </a>
          <button
            onClick={() => setOpen(!open)}
            className="grid size-10 place-items-center rounded-full border border-[#131311]/15 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            id="mobile-menu"
            className="overflow-hidden border-b border-[#131311]/8 bg-[#F6F4EE]/95 backdrop-blur-xl md:hidden"
          >
            <ul className="space-y-1 px-5 py-4">
              {links.map((l) => (
                <li key={l.label}>
                  <a
                    href={homeLink(l.href)}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-3 font-display text-2xl font-semibold"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <a href={ORDERS_URL} onClick={() => setOpen(false)} className="mb-4 block px-3 py-3 font-display text-2xl font-semibold">Order a design</a>
                <a
                  href="/discuss-a-project"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#FFC700] px-6 py-3 font-semibold"
                >
                  Discuss a project <ArrowUpRight className="size-4" />
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
