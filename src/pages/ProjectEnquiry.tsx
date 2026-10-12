import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Check, Send } from "lucide-react";
import { partnershipPlans } from '@/lib/services';
import Nav from "@/sections/Nav";
import { ENQUIRY_API, ORDERS_URL } from "@/lib/links";
import { sendProjectEnquiry } from "@/lib/project-enquiry";

const fieldStyle = "w-full rounded-2xl border border-[#131311]/20 bg-transparent px-5 py-3.5 text-base placeholder:text-[#131311]/35 focus:border-[#C79A00] focus:outline-none focus:ring-2 focus:ring-[#FFC700]/30";
const labelStyle = "mb-2 block text-sm font-medium";

export default function ProjectEnquiry() {
  const params = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search);
  const services = { brand: 'Brand Strategy & Identity', campaigns: 'Campaigns & Market Launches', partnerships: 'Marketing Partnerships', digital: 'Websites & Digital Products', video: 'Video & Motion Production', 'not-sure': 'Not sure yet' };
  const initialService = params.get('service') || 'not-sure';
  const [service, setService] = useState(Object.hasOwn(services, initialService) ? initialService : 'not-sure');
  const initialPlan = partnershipPlans.find(plan => plan.slug === params.get('plan'))?.slug || '';
  const [projectType, setProjectType] = useState(initialPlan || params.get('type') === 'monthly' ? 'monthly' : 'one-time');
  const [plan, setPlan] = useState(initialPlan);
  const [availability, setAvailability] = useState<boolean | null>(null);
  const [contactEmail, setContactEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const request = useRef<{ fingerprint: string; key: string } | null>(null);
  const confirmation = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(ENQUIRY_API, { signal: controller.signal, credentials: "omit" })
      .then(async response => {
        if (!response.ok) throw new Error();
        const config = await response.json();
        setAvailability(config.ready === true);
        if (typeof config.contactEmail === "string") setContactEmail(config.contactEmail);
      })
      .catch(() => { if (!controller.signal.aborted) setAvailability(false); });
    return () => { controller.abort(); };
  }, []);

  useEffect(() => { if (sent) confirmation.current?.focus(); }, [sent]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const fingerprint = JSON.stringify(values);
    if (request.current?.fingerprint !== fingerprint)
      request.current = { fingerprint, key: crypto.randomUUID() };
    setBusy(true);
    setError("");
    try {
      await sendProjectEnquiry(ENQUIRY_API, { ...values, requestKey: request.current.key });
      setSent(true);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Your enquiry could not be sent. Please try again.");
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen">
      <Nav projectPage />
      <main className="relative overflow-hidden px-5 pt-32 pb-20 md:px-10 md:pt-40">
        <div className="pointer-events-none absolute -top-24 -right-24 size-[420px] rounded-full bg-[#FFC700]/25 blur-3xl" />
        <div className="relative mx-auto max-w-3xl">
          <a href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-[#131311]/60 transition-colors hover:text-[#131311]"><ArrowLeft className="size-4" />Back to Yoo360</a>
          <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <p className="mb-5 text-xs font-semibold tracking-[0.2em] uppercase text-[#131311]/50">Brand & marketing partnerships</p>
            <h1 className="font-display text-5xl leading-[1.02] font-bold tracking-[-0.03em] md:text-7xl">Discuss a <em className="font-serif-accent font-normal italic text-[#C79A00]">project.</em></h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-[#131311]/65">Share your goals and what you need. We’ll review the scope and prepare a proposal.</p>
          </motion.div>

          {sent ? (
            <div ref={confirmation} tabIndex={-1} role="status" className="mt-12 rounded-3xl border border-[#131311]/15 p-8 focus:outline-none focus:ring-2 focus:ring-[#FFC700]">
              <span className="mb-5 grid size-12 place-items-center rounded-full bg-[#FFC700]"><Check className="size-6" /></span>
              <h2 className="font-display text-3xl font-bold">Enquiry received.</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#131311]/65">Your request is saved for the Yoo360 team. We’ll reply by email after reviewing your brief.</p>
              <a href="/" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold">Back to Yoo360 <ArrowUpRight className="size-4" /></a>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-12 grid gap-6 border-t border-[#131311]/15 pt-9 sm:grid-cols-2">
              <div><label htmlFor="enquiry-name" className={labelStyle}>Name</label><input id="enquiry-name" name="name" autoComplete="name" required maxLength={120} className={fieldStyle} /></div>
              <div><label htmlFor="enquiry-company" className={labelStyle}>Company <span className="text-[#131311]/45">(optional)</span></label><input id="enquiry-company" name="company" autoComplete="organization" maxLength={160} className={fieldStyle} /></div>
              <div><label htmlFor="enquiry-email" className={labelStyle}>Email</label><input id="enquiry-email" name="email" type="email" autoComplete="email" required maxLength={254} className={fieldStyle} /></div>
              <div><label htmlFor="enquiry-type" className={labelStyle}>Project type</label><select id="enquiry-type" name="projectType" required value={projectType} onChange={event => setProjectType(event.target.value)} className={fieldStyle}><option value="" disabled>Select an option</option><option value="one-time">Single project</option><option value="monthly">Monthly support</option><option value="not-sure">Not sure yet</option></select></div>
              <div><label htmlFor="enquiry-service" className={labelStyle}>Service</label><select id="enquiry-service" name="service" value={service} onChange={event => setService(event.target.value)} className={fieldStyle}>{Object.entries(services).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
              <div><label htmlFor="enquiry-deadline" className={labelStyle}>Preferred timing <span className="text-[#131311]/45">(optional)</span></label><input id="enquiry-deadline" name="deadline" maxLength={100} placeholder="Launch date or timeframe" className={fieldStyle} /></div>
              {projectType === 'monthly' && <div className="sm:col-span-2"><label htmlFor="enquiry-plan" className={labelStyle}>Partnership plan <span className="text-[#131311]/45">(optional)</span></label><select id="enquiry-plan" name="plan" value={plan} onChange={event => setPlan(event.target.value)} className={fieldStyle}><option value="">Help me choose</option>{partnershipPlans.map(item => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select></div>}
              <div className="sm:col-span-2"><label htmlFor="enquiry-message" className={labelStyle}>Briefly tell us what you need</label><textarea id="enquiry-message" name="message" required minLength={10} maxLength={3000} rows={5} placeholder={service === "digital" ? "What should your website or app do? Include key features and any existing website." : service === "video" ? "Tell us the video type, intended use, length, locations and whether footage already exists." : "Your business goal, audience and the work you need."} className={fieldStyle + " resize-y"} /></div>
              <div className="hidden" aria-hidden="true"><label htmlFor="enquiry-website">Leave this empty</label><input id="enquiry-website" name="website" tabIndex={-1} autoComplete="off" /></div>
              <div className="sm:col-span-2" aria-live="polite">
                {availability === false && <p className="mb-5 text-sm leading-relaxed text-[#131311]/65">Enquiries are temporarily unavailable. Please try again later{contactEmail ? " or email us below." : "."}</p>}
                {error && <p role="alert" className="mb-5 text-sm text-red-800">{error}</p>}
                <div className="flex flex-wrap items-center gap-6">
                  <button type="submit" disabled={busy || availability !== true} className="group inline-flex items-center gap-2 rounded-full bg-[#131311] px-7 py-3.5 text-sm font-semibold text-[#F6F4EE] transition-colors hover:bg-[#FFC700] hover:text-[#131311] disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Sending…" : "Send project enquiry"}<Send className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" /></button>
                  {contactEmail && <a href={"mailto:" + contactEmail} className="text-sm font-medium underline decoration-[#FFC700] decoration-2 underline-offset-8">Email us instead</a>}
                </div>
              </div>
            </form>
          )}

          <div className="mt-14 border-t border-[#131311]/15 pt-7 text-sm text-[#131311]/60">Need a logo or individual artwork? <a href={ORDERS_URL} className="ml-1 font-semibold text-[#131311] underline decoration-[#FFC700] decoration-2 underline-offset-4">Order a design</a></div>
        </div>
      </main>
    </div>
  );
}
