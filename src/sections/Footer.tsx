import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Dribbble, Instagram, Linkedin, Send, X } from "lucide-react";

const socials = [
  { Icon: Linkedin, href: "https://www.linkedin.com/company/yoo360/?originalSubdomain=cd", label: "LinkedIn" },
  { Icon: Dribbble, href: "#top", label: "Dribbble" },
  { Icon: Instagram, href: "https://www.instagram.com/yoo360_/", label: "Instagram" },
  { Icon: X, href: "#top", label: "X" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
    setEmail("");
    setTimeout(() => setSent(false), 3500);
  };

  return (
    <footer id="contact" className="relative overflow-hidden bg-[#131311] text-[#F6F4EE]">
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-[#FFC700]/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 pt-24 pb-10 md:px-10 md:pt-32">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl font-display text-[11vw] leading-[1.02] font-bold tracking-[-0.03em] md:text-7xl"
        >
          We help brands that do good,{" "}
          <em className="font-serif-accent font-normal italic text-[#FFC700]">look good.</em>
        </motion.h2>

        <div className="mt-12 flex flex-col justify-between gap-10 border-t border-[#F6F4EE]/12 pt-10 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-sm text-[#F6F4EE]/55">
              Have a project in mind? Drop your email — we'll reach out.
            </p>
            <form onSubmit={submit} className="flex max-w-md items-center gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@brand.com"
                className="w-full rounded-full border border-[#F6F4EE]/20 bg-transparent px-5 py-3 text-sm placeholder:text-[#F6F4EE]/35 focus:border-[#FFC700] focus:outline-none"
              />
              <button
                type="submit"
                className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-[#FFC700] px-6 py-3 text-sm font-bold text-[#131311] transition-transform hover:scale-105"
              >
                {sent ? "Sent ✓" : "Send"}
                {!sent && <Send className="size-4 transition-transform group-hover:translate-x-0.5" />}
              </button>
            </form>
          </div>

          <a
            href="#top"
            className="group inline-flex items-center gap-2 self-start font-display text-lg font-semibold md:self-auto"
          >
            Start a project
            <span className="grid size-12 place-items-center rounded-full bg-[#FFC700] text-[#131311] transition-transform duration-300 group-hover:rotate-45">
              <ArrowUpRight className="size-5" />
            </span>
          </a>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-[#F6F4EE]/12 pt-8 md:flex-row md:items-center">
          <a href="#top" className="flex items-center">
            <img
              src="/logo-white.png"
              alt="Yoo360"
              className="h-6 w-auto md:h-7"
            />
          </a>

          <div className="flex items-center gap-3">
            {socials.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
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
