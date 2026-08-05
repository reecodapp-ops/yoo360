const clients = [
  "Avittal", "Borah", "Buricare", "Doliflex", "M_Lutete",
  "Maarifa1", "Omis_Visual", "Saveur", "Sc4ever", "Vanguard_Lab",
];

const names: Record<string, string> = {
  M_Lutete: "M. Lutete",
  Maarifa1: "Maarifa",
  Omis_Visual: "Omis Visual",
  Sc4ever: "SC4Ever",
  Vanguard_Lab: "Vanguard Lab",
};

export default function Clients() {
  const row = [...clients, ...clients];
  return (
    <section className="border-y border-[#131311]/10 py-14">
      <p className="mb-8 text-center text-xs font-semibold tracking-[0.2em] uppercase text-[#131311]/45">
        Trusted by happy clients
      </p>
      <div className="marquee-paused overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="animate-marquee-fast flex w-max items-center gap-14 px-7">
          {row.map((c, i) => (
            <div key={i} className="flex items-center gap-3 opacity-80 transition-opacity hover:opacity-100">
              <img
                src={`/assets/clients/${c}.png`}
                alt={names[c] ?? c}
                loading="lazy"
                className="h-9 w-auto object-contain grayscale transition-all hover:grayscale-0"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
