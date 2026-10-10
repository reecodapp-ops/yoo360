import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Globe, Instagram, Linkedin } from "lucide-react";
import Nav from "@/sections/Nav";
import Footer from "@/sections/Footer";
import TeamPortrait from "@/components/TeamPortrait";
import type { TeamMember } from "@/lib/team";

const icons = { Instagram, LinkedIn: Linkedin, Website: Globe };

export default function TeamProfile({ member }: { member: TeamMember }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="min-h-screen bg-white">
      <Nav projectPage />
      <main id="top" className="mx-auto max-w-6xl px-5 pt-28 pb-20 md:px-10 md:pt-36 md:pb-28">
        <a href="/team" className="mb-10 inline-flex items-center gap-2 rounded-full border border-[#131311]/15 px-5 py-3 text-sm font-medium transition-colors hover:border-[#FFC700] hover:bg-[#FFC700] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A17A00]">
          <ArrowLeft className="size-4" /> Back to Team
        </a>
        <motion.article initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.6, ease: "easeOut" }} className="grid items-center gap-8 lg:grid-cols-[minmax(0,384px)_minmax(0,1fr)] lg:gap-16">
          {/* On desktop the biography determines the row height; the portrait centers within it. */}
          <div className="relative mx-auto w-full max-w-[280px] lg:mx-0 lg:max-w-none lg:self-stretch">
            <div className="lg:absolute lg:inset-0 lg:flex lg:items-center">
              <TeamPortrait member={member} priority profile />
            </div>
          </div>
          <div className="mx-auto w-full min-w-0 max-w-xl lg:mx-0">
            <h1 className="font-display text-5xl leading-[1.04] font-bold tracking-[-0.04em] md:text-6xl lg:text-7xl">{member.name}</h1>
            <h2 className="mt-4 font-display text-xl leading-snug font-semibold text-[#A17A00] md:text-2xl">{member.role}</h2>
            <p className="mt-8 text-base leading-[1.85] text-[#131311]/70 md:text-lg">{member.bio}</p>
            {member.connections.length > 0 && (
              <section aria-labelledby="connect-heading" className="mt-9 border-t border-[#131311]/10 pt-7">
                <h3 id="connect-heading" className="text-xs font-semibold tracking-[0.18em] uppercase text-[#131311]/50">Connect</h3>
                <div className="mt-4 flex items-center gap-3">
                  {member.connections.map(connection => {
                    const Icon = icons[connection.platform];
                    return (
                      <a key={connection.platform} href={connection.url} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on ${connection.platform} (opens in a new tab)`} title={connection.platform} className="grid size-12 place-items-center rounded-full border border-[#131311]/15 text-[#A17A00] transition-colors hover:border-[#FFC700] hover:bg-[#FFC700] hover:text-[#131311] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A17A00]">
                        <Icon className="size-5" aria-hidden="true" />
                      </a>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </motion.article>
      </main>
      <Footer subpage />
    </div>
  );
}
