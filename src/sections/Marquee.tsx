const items = [
  "Brand Identity",
  "Web Development",
  "Mobile Apps",
  "Creative Design",
  "Campaigns",
  "Strategy",
];

export default function Marquee() {
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-[#131311]/10 bg-[#FFC700] py-3.5 -rotate-1 scale-[1.02]">
      <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-8 font-display text-sm font-bold tracking-[0.2em] uppercase">
            {item}
            <span className="text-lg leading-none">✺</span>
          </span>
        ))}
      </div>
    </div>
  );
}
