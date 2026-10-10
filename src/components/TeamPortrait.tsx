import type { TeamMember } from "@/lib/team";

export default function TeamPortrait({ member, priority = false, profile = false }: { member: TeamMember; priority?: boolean; profile?: boolean }) {
  return (
    <div className={`relative w-full overflow-hidden rounded-2xl bg-[#F0EEE8] ${profile ? "h-[350px] lg:h-full lg:max-h-[480px]" : "aspect-[4/5]"}`}>
      {member.portrait ? (
        <img
          src={member.portrait}
          alt={member.name}
          width={800}
          height={1000}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.025]"
          style={{ objectPosition: member.portraitPosition || "center" }}
        />
      ) : (
        <div role="img" aria-label={`Portrait of ${member.name} to be added`} className="grid h-full place-items-center">
          <span aria-hidden="true" className="font-display text-[5rem] font-semibold tracking-[-0.06em] text-[#131311]/20">{member.initials}</span>
        </div>
      )}
    </div>
  );
}
