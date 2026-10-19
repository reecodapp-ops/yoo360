import { z } from 'zod';
export const CATALOG_VERSION = '2026-10-12';
export const LOGO_CENTS = 14999;
export const IDENTITY_CENTS = 49999;
export const ARTWORK_CENTS = 4000;
export const ARTWORK_EXTRAS = { print: 2000, message: 2000, priority: 1900 };
export const ADDONS = [
    { id: 'card', name: 'Business card design', cents: 3500, icon: 'card' },
    { id: 'colors', name: 'Brand colors and fonts', cents: 3500, icon: 'colors' },
    { id: 'social', name: 'Social media profile and cover designs', cents: 3500, icon: 'social' },
    { id: 'templates', name: 'Three social media templates', cents: 6000, icon: 'templates' },
    { id: 'sign', name: 'Shop signboard design', cents: 3500, icon: 'sign' },
    { id: 'letter', name: 'Branded letterhead design', cents: 3000, icon: 'letter' },
    { id: 'voice', name: 'Tagline and messaging essentials', cents: 3500, icon: 'voice' },
    { id: 'layouts', name: 'Additional logo layouts', cents: 2500, icon: 'layouts' },
    { id: 'guide', name: 'Visual branding guide', cents: 3500, icon: 'guide' },
    { id: 'source', name: 'Editable logo source file', cents: 2500, icon: 'source' },
] as const;
export const COUNTRIES = [
    { id: 'RWA', name: 'Rwanda', prefix: '250', currency: 'RWF', pattern: /^2507\d{8}$/ },
    { id: 'UGA', name: 'Uganda', prefix: '256', currency: 'UGX', pattern: /^2567\d{8}$/ },
    { id: 'COD', name: 'DR Congo', prefix: '243', currency: 'CDF', pattern: /^243[89]\d{8}$/ },
    { id: 'TZA', name: 'Tanzania', prefix: '255', currency: 'TZS', pattern: /^255[67]\d{8}$/ },
] as const;
export const STATUSES = ['Awaiting payment', 'Awaiting project brief', 'Ready to start', 'In progress', 'Awaiting client feedback', 'Awaiting final balance', 'Completed'];
export const artworkSchema = z.object({ id: z.string().uuid(), name: z.string().max(90), print: z.boolean(), message: z.boolean(), priority: z.boolean() });
export const cartSchema = z.object({ catalogVersion: z.string().max(40).optional(), service: z.enum(['logo', 'graphics']), mode: z.enum(['bundle', 'basic']), addons: z.array(z.enum(ADDONS.map(x => x.id) as [
        string,
        ...string[]
    ])).max(10), artworks: z.array(artworkSchema).min(1).max(100), production: z.object({ enabled: z.boolean(), location: z.string().max(100), item: z.string().max(500), quantity: z.string().max(100), material: z.string().max(300), notes: z.string().max(1000) }) }).superRefine((c, ctx) => { if (new Set(c.addons).size !== c.addons.length || new Set(c.artworks.map(a => a.id)).size !== c.artworks.length)
    ctx.addIssue({ code: 'custom', message: 'Selections must be unique.' }); });
export type Cart = z.infer<typeof cartSchema>;
export type Artwork = z.infer<typeof artworkSchema>;
export type Customer = {
    name: string;
    email?: string;
    business: string;
    individual: boolean;
    country: string;
    provider: string;
    phone: string;
    priceDiscussion?: boolean;
    budget?: string;
};
// Keep legacy identity fields for existing orders; checkout only needs payment details.
export const customerSchema = z.object({ name: z.string().trim().max(100).default(''), business: z.string().trim().max(150).default(''), individual: z.boolean().default(false), country: z.enum(['RWA', 'UGA', 'COD', 'TZA']), provider: z.string().max(100), phone: z.string().min(9).max(30) }).superRefine((c, ctx) => { const country = COUNTRIES.find(x => x.id === c.country)!; if (!country.pattern.test(normalizePhone(c.phone, c.country)))
    ctx.addIssue({ code: 'custom', message: `Enter a valid Mobile Money number for ${country.name}.` }); });
export function normalizePhone(phone: string, country: string) { let p = phone.replace(/[^0-9]/g, ''); const c = COUNTRIES.find(x => x.id === country); if (p.startsWith('0') && c)
    p = c.prefix + p.slice(1); return p; }
export function uuid() { const b = crypto.getRandomValues(new Uint8Array(16)); b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128; const h = Array.from(b, x => x.toString(16).padStart(2, '0')).join(''); return [h.slice(0, 8), h.slice(8, 12), h.slice(12, 16), h.slice(16, 20), h.slice(20)].join('-'); }
export function newArtwork(): Artwork { return { id: uuid(), name: '', print: false, message: false, priority: false }; }
export function initialCart(): Cart { return { catalogVersion: CATALOG_VERSION, service: 'logo', mode: 'bundle', addons: [], artworks: [newArtwork()], production: { enabled: false, location: 'Kampala', item: '', quantity: '', material: '', notes: '' } }; }
export function artworkPrice(a: Artwork) { return ARTWORK_CENTS + (a.print ? ARTWORK_EXTRAS.print : 0) + (a.message ? ARTWORK_EXTRAS.message : 0) + (a.priority ? ARTWORK_EXTRAS.priority : 0); }
export function price(c: Cart) { return c.service === 'logo' ? (c.mode === 'bundle' ? IDENTITY_CENTS : LOGO_CENTS + ADDONS.filter(a => c.addons.includes(a.id)).reduce((s, a) => s + a.cents, 0)) : c.artworks.reduce((s, a) => s + artworkPrice(a), 0); }
// Integer USD cents, half-up to the nearest cent. Balance = total minus due.
export function amounts(total: number, share: number) { const due = Math.round(total * share / 100); return { total, due, balance: total - due }; }
export const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
export function lines(c: Cart) { if (c.service === 'logo')
    return c.mode === 'bundle' ? [{ name: 'Complete Visual Identity', cents: IDENTITY_CENTS, detail: 'Logo + 10 branding deliverables' }] : [{ name: 'Basic logo', cents: LOGO_CENTS, detail: 'PNG, JPG, PDF · color variations · 2 revisions' }, ...ADDONS.filter(a => c.addons.includes(a.id)).map(a => ({ name: a.name, cents: a.cents, detail: '' }))]; return c.artworks.map((a, i) => ({ name: a.name.trim() || `Design Project ${i + 1}`, cents: artworkPrice(a), detail: ['Digital design', a.print && 'High-Res Print Files', a.message && 'Ad Copy & Slogans', a.priority && 'Rush Delivery (Under 6 hours)'].filter(Boolean).join(' · ') })); }

// Catalogue versions are immutable. Accepted orders without a version used the original catalogue.
export function orderLines(c: Cart) {
    if (c.catalogVersion === CATALOG_VERSION) return lines(c);
    const oldPrices: Record<string, number> = { card: 2000, colors: 2500, social: 2000, templates: 4500, sign: 3500, letter: 3000, voice: 3000, layouts: 2000, guide: 2990, source: 1500 };
    const oldNames: Record<string, string> = { colors: 'Business colors and fonts', voice: 'Brand voice, tagline, communication style' };
    if (c.service === 'logo') return c.mode === 'bundle'
        ? [{ name: 'Complete Branding Package', cents: 19990, detail: 'Logo + 10 branding deliverables' }]
        : [{ name: 'Basic logo', cents: 3000, detail: 'PNG, JPG, PDF · color variations · 1 revision' }, ...ADDONS.filter(a => c.addons.includes(a.id)).map(a => ({ name: oldNames[a.id] || a.name, cents: oldPrices[a.id], detail: '' }))];
    return lines(c).map((line, i) => ({ ...line, cents: 1500 + 500 * (Number(c.artworks[i].print) + Number(c.artworks[i].message) + Number(c.artworks[i].priority)) }));
}
