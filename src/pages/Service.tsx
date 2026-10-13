import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react';
import Nav from '@/sections/Nav';
import Footer from '@/sections/Footer';
import { enquiryLink, type ServicePage } from '@/lib/services';

export default function Service({ service }: { service: ServicePage }) {
  return <div className="min-h-screen"><Nav projectPage /><main className="px-5 pt-32 pb-20 md:px-10 md:pt-40"><div className="mx-auto max-w-7xl">
    <a href="/#services" className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-[#131311]/60 hover:text-[#131311]"><ArrowLeft className="size-4" />All services</a>
    <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="grid gap-12 lg:grid-cols-2">
      <div><p className="mb-5 text-xs font-semibold tracking-[0.2em] uppercase text-[#131311]/50">Yoo360 services</p><h1 className="font-display text-5xl leading-[1.02] font-bold tracking-[-0.03em] md:text-7xl">{service.title}</h1><p className="mt-6 max-w-lg text-base leading-relaxed text-[#131311]/65">{service.intro}</p></div>
      <div className="rounded-3xl border border-[#131311]/15 p-7 md:p-10"><h2 className="font-display text-2xl font-bold">What we can work on</h2><ul className="mt-6 space-y-4">{service.outputs.map(output => <li key={output} className="flex items-start gap-3 text-sm leading-relaxed"><Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#A17A00]" />{output}</li>)}</ul><p className="mt-8 text-sm leading-relaxed text-[#131311]/65">Your quote follows the agreed scope. Share your brief, features or production needs to get started.</p><a href={enquiryLink(service.service)} className="group mt-7 inline-flex items-center gap-2 rounded-full bg-[#131311] px-6 py-3 text-sm font-semibold text-[#F6F4EE] transition-colors hover:bg-[#FFC700] hover:text-[#131311]">{service.next}<ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" /></a></div>
    </motion.div>
    <div className="mt-14 border-t border-[#131311]/15 pt-7"><a href="/marketing-partnerships" className="inline-flex items-center gap-2 text-sm font-medium underline decoration-[#FFC700] decoration-2 underline-offset-8">Build With Us<ArrowUpRight className="size-4" /></a></div>
  </div></main><Footer subpage /></div>;
}
