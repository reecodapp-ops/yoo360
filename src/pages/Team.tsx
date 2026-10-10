import { motion, useReducedMotion } from "framer-motion";
import Nav from "@/sections/Nav";
import Footer from "@/sections/Footer";
import TeamPortrait from "@/components/TeamPortrait";
import { teamMembers, teamMemberPath } from "@/lib/team";

export default function Team() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-white">
      <Nav projectPage />
      <main id="top" className="mx-auto max-w-7xl px-5 pt-32 pb-20 md:px-10 md:pt-40 md:pb-28">
        <motion.div className="mx-auto max-w-[846px]" initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.6, ease: "easeOut" }}>
          <h1 className="max-w-4xl font-display text-5xl leading-[1.02] font-bold tracking-[-0.04em] md:text-7xl">The Founding Team</h1>
          <h2 className="mt-6 text-xs font-semibold tracking-[0.2em] uppercase text-[#131311]/50">YOO360 LEADERSHIP</h2>
        </motion.div>

        <ul id="founding-team-cards" aria-label="Founding team profiles" className="mx-auto mt-9 grid max-w-[846px] grid-cols-1 justify-items-center gap-10 md:grid-cols-3 md:gap-12">
          {teamMembers.map((member, index) => (
            <motion.li key={member.slug} initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduceMotion ? 0 : index * 0.08, duration: reduceMotion ? 0 : 0.6, ease: "easeOut" }} className="w-full max-w-[250px] min-w-0">
              <a href={teamMemberPath(member)} className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A17A00]" aria-label={`View ${member.name}'s profile`}>
                <TeamPortrait member={member} priority={index === 0} />
                <div className="flex min-h-[148px] flex-col pt-4">
                  <h3 className="font-display text-2xl leading-tight font-bold tracking-[-0.025em] transition-colors group-hover:text-[#A17A00]">{member.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#131311]/60">{member.role}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-semibold text-[#A17A00]">View Profile <span aria-hidden="true">→</span></span>
                </div>
              </a>
            </motion.li>
          ))}
        </ul>
      </main>
      <Footer subpage />
    </div>
  );
}
