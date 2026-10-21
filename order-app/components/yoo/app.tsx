'use client';
import React, { useEffect, useState, useRef } from 'react';
import { orderRoute, orderApi } from '@/lib/routes';
import { checkInitialPayment, retryInitialPayment, hasAcceptedPrompt } from '@/lib/payment-actions';
import { cartForOrderEntry } from '@/lib/order-entry';
import { Check, ChevronDown, ChevronLeft, Plus, Trash2, ShieldCheck, Smartphone, Info, Palette, Contact, LayoutTemplate, Image, Store, FileText, MessageCircle, Shapes, BookOpen, FolderCode, Upload, File, LoaderCircle, CheckCircle2, Clock3, XCircle, LockKeyhole, ExternalLink, Copy, Save, BriefcaseBusiness } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CATALOG_VERSION, LOGO_CENTS, IDENTITY_CENTS, ARTWORK_CENTS, ARTWORK_EXTRAS, orderLines, ADDONS, COUNTRIES, STATUSES, uuid, initialCart, newArtwork, cartSchema, price, money, amounts, lines, artworkPrice, normalizePhone, type Cart, type Customer, type Artwork } from '@/lib/catalog';
import { checkoutFingerprint, parseOrderProgress, matchingOrderProgress, type OrderProgress } from '@/lib/order-progress';
const icons: Record<string, React.ElementType> = { card: Contact, colors: Palette, social: Image, templates: LayoutTemplate, sign: Store, letter: FileText, voice: MessageCircle, layouts: Shapes, guide: BookOpen, source: FolderCode };
type RecordOrder = {
    id: string;
    reference: string;
    cart: Cart;
    customer: Customer;
    total: number;
    due: number;
    paid: number;
    share: number;
    test: boolean;
    paymentMode: string;
    paymentStatus: string;
    projectStatus: string;
    requestStatus: 'New' | 'Responded' | 'Accepted' | 'Declined';
    requestNote: string;
    briefStatus: string;
    brief: Record<string, Record<string, string>>;
    files: {
        id: string;
        name: string;
        size: number;
        artwork_id: string;
    }[];
    deliverables: {
        id: string;
        name: string;
        size: number;
    }[];
    payments: {
        id: string;
        purpose: string;
        usd_cents: number;
        amount: string;
        currency: string;
        status: string;
        created_at: string;
        promptAccepted: boolean;
    }[];
    activity: {
        id: string;
        message: string;
        created_at: string;
    }[];
    created_at: string;
    updated_at: string;
};
function projectName(order: RecordOrder) { return order.brief.logo?.brandName?.trim() || order.customer.business || order.customer.name; }
function draftFingerprint(cart: Cart, customer: Customer, share: number) { return checkoutFingerprint(cart, customer, share, normalizePhone(customer.phone, customer.country)); }
function persistDraft(cart: Cart, customer: Customer, share: number) { sessionStorage.setItem('yoo-order-draft', JSON.stringify({ cart, customer, share })); }
function rememberProgress(order: RecordOrder) { const progress: OrderProgress = { id: order.id, fingerprint: draftFingerprint(order.cart, order.customer, order.share), briefUnlocked: order.paymentMode === 'manual' || order.paid >= order.due }; sessionStorage.setItem('yoo-order-progress', JSON.stringify(progress)); return progress; }
function persistOrderDraft(order: RecordOrder) { persistDraft(order.cart, order.customer, order.share); rememberProgress(order); }
function BrandDefinitions() { return <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}><defs><filter id="yoo-illustration-alpha" colorInterpolationFilters="sRGB"><feComponentTransfer><feFuncA type="linear" slope="12" intercept="-8" /></feComponentTransfer></filter><filter id="yoo-paper-ink" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -.2126 -.7152 -.0722 0 1"/><feComponentTransfer result="ink"><feFuncA type="linear" slope="1.5"/></feComponentTransfer><feFlood floodColor="#fab206"/><feComposite operator="in" in2="ink"/></filter></defs></svg>; }
function BrandIllustration({ kind }: { kind: 'logo' | 'graphics' | 'money' | 'video' | 'partnership' }) {
    if (kind === 'video' || kind === 'partnership') return <span className="service-illustration" data-illustration={kind} aria-hidden="true"><img className="illustration-paper" src={`/brand/${kind}-illustration.png`} alt="" /></span>;
    const artwork = { logo: { width: 123.06, height: 123.06, left: -14.97, top: -15.70 }, graphics: { width: 122.10, height: 122.10, left: -12.42, top: -12.56 }, money: { width: 118.75, height: 178.89, left: -9.56, top: -40.80 } }[kind];
    return <span className={kind === 'money' ? 'money-illustration' : 'service-illustration'} data-illustration={kind} aria-hidden="true"><span className="illustration-ink" style={{ maskImage: `url(/brand/${kind}-illustration.webp)`, WebkitMaskImage: `url(/brand/${kind}-illustration.webp)`, width: artwork.width + '%', height: artwork.height + '%', left: artwork.left + '%', top: artwork.top + '%' }} /></span>;
}
export function getToken(id: string) { if (typeof window === 'undefined')
    return ''; const h = new URLSearchParams(window.location.hash.slice(1)); const key = h.get('key'); if (key) {
    sessionStorage.setItem('yoo-key-' + id, key);
    return key;
} return sessionStorage.getItem('yoo-key-' + id) || ''; }
function secureLink(path: string, id: string) { const key = getToken(id); return `${orderRoute(path)}/${id}${key ? '#key=' + key : ''}`; }
async function api(path: string, method = 'GET', body?: unknown, id?: string): Promise<any> { const r = await fetch(orderApi(path), { method, headers: { ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(id ? { Authorization: 'Bearer ' + getToken(id) } : {}) }, ...(body !== undefined ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}), cache: 'no-store' }); const data: any = await r.json(); if (!r.ok)
    throw new Error(data.error || 'Something went wrong. Please try again.'); return data; }
async function downloadFinalFile(id: string, file: { id: string; name: string }) {
    const response = await fetch(orderApi(`orders/${id}/deliverables/${file.id}`), { headers: { Authorization: 'Bearer ' + getToken(id) }, cache: 'no-store' });
    if (!response.ok) throw new Error('This file could not be downloaded. Please try again.');
    const href = URL.createObjectURL(await response.blob());
    const link = document.createElement('a'); link.href = href; link.download = file.name; document.body.appendChild(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(href), 60000);
}
function token() { return Array.from(crypto.getRandomValues(new Uint8Array(32)), x => x.toString(16).padStart(2, '0')).join(''); }
export function Picker({ value, onChange, options, label, disabled = false }: {
    value: string;
    onChange: (s: string) => void;
    options: {
        value: string;
        label: string;
    }[];
    label: string;
    disabled?: boolean;
}) { return <Select value={value} onValueChange={onChange} disabled={disabled}><SelectTrigger className="select-trigger" aria-label={label}><SelectValue placeholder={label}/></SelectTrigger><SelectContent className="select-popover" position="popper">{options.map(x => <SelectItem key={x.value} value={x.value}>{x.label}</SelectItem>)}</SelectContent></Select>; }
function Field({ label, id, value, onChange, placeholder = '', required = false, area = false, type = 'text', autoComplete, hint, showRequiredMarker = true }: {
    label: string;
    id: string;
    value: string;
    onChange: (s: string) => void;
    placeholder?: string;
    required?: boolean;
    area?: boolean;
    type?: string;
    autoComplete?: string;
    hint?: string;
    showRequiredMarker?: boolean;
}) { return <div className="field"><label htmlFor={id}>{label}{required && showRequiredMarker ? ' *' : ''}</label>{area ? <textarea className="textarea" id={id} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} maxLength={5000}/> : <input className="input" id={id} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} autoComplete={autoComplete} inputMode={type === 'tel' ? 'tel' : undefined} aria-describedby={hint ? id + '-hint' : undefined} maxLength={200}/>}{hint && <small className="muted" id={id + '-hint'}>{hint}</small>}</div>; }
export function Notice({ children, error = false, success = false }: {
    children: React.ReactNode;
    error?: boolean;
    success?: boolean;
}) { return <div className={`alert ${error ? 'error' : ''} ${success ? 'success' : ''}`} role={error ? 'alert' : 'status'}>{success ? <CheckCircle2 /> : <Info />}<div>{children}</div></div>; }
export function Header({ mode, canSaveDraft = false }: {
    mode?: string;
    canSaveDraft?: boolean;
}) { return <header className="header"><a href="/" className="wordmark" aria-label="Yoo360 home"><img className="brand-logo" src="/brand/yoo360-primary-white.webp" alt="Yoo360" width="2013" height="354" /></a><div className="header-right">{mode && mode !== 'live' && mode !== 'loading' && <span className="pill">{mode === 'demo' ? 'Preview · no charges' : mode === 'sandbox' ? 'Sandbox payments' : 'Payments unavailable'}</span>}{canSaveDraft && <button className="header-save" type="button" onClick={() => document.dispatchEvent(new Event('yoo:save-draft'))} title="Save project draft" aria-label="Save project draft"><Save size={18}/><span>Save draft</span></button>}</div></header>; }
export function Footer() { return <footer className="footer"><span>© {new Date().getFullYear()} Yoo360</span></footer>; }
function Steps({ step, cart, customer, share, order, onNavigate, busy = false }: {
    step: number; cart: Cart; customer: Customer; share: number; order?: RecordOrder; onNavigate?: () => void | boolean | Promise<void | boolean>; busy?: boolean;
}) {
    const [stored, setStored] = useState<OrderProgress | null>(null);
    useEffect(() => { setStored(order ? rememberProgress(order) : parseOrderProgress(sessionStorage.getItem('yoo-order-progress'))); }, [order]);
    const progress = order ? { id: order.id, fingerprint: draftFingerprint(order.cart, order.customer, order.share), briefUnlocked: order.paymentMode === 'manual' || order.paid >= order.due } : matchingOrderProgress(stored, draftFingerprint(cart, customer, share));
    const steps = [{ label: 'Design', href: orderRoute('/order/' + cart.service) }, { label: 'Request', href: progress ? secureLink('/order', progress.id) : orderRoute('/checkout') }, { label: 'Brief', href: progress?.briefUnlocked ? secureLink('/project-brief', progress.id) : undefined }];
    return <nav className="steps" aria-label="Order progress">{steps.map(({ label, href }, i) => {
        const className = `step ${i === step ? 'current' : i < step ? 'complete' : ''}`;
        const content = <><i>{i < step ? <Check size={12} /> : i + 1}</i>{label}</>;
        return <React.Fragment key={label}>{i > 0 && <span className="step-divider" aria-hidden="true" />}{!href || busy ? <span className={className} aria-current={i === step ? 'step' : undefined} aria-disabled={true} title={!href ? 'Send your request to open the project brief.' : undefined}>{content}</span> : <a className={className} href={href} aria-current={i === step ? 'step' : undefined} onClick={async e => { e.preventDefault(); if (order) persistOrderDraft(order); const result = await onNavigate?.(); if (result !== false) window.location.assign(href); }}>{content}</a>}</React.Fragment>;
    })}</nav>;
}
function Includes() { return <details><summary>All inclusions<ChevronDown size={15}/></summary><div className="included-list"><p><Check size={14}/>Logo design</p>{ADDONS.map(x => <p key={x.id}><Check size={14}/>{x.name}</p>)}<p><Check size={14}/>Complimentary branded-product mockups</p></div></details>; }
function Production({ cart, setCart }: {
    cart: Cart;
    setCart: (c: Cart) => void;
}) { const p = cart.production; const change = (k: string, v: string) => setCart({ ...cart, production: { ...p, [k]: v } }); return <section className="production"><label className="check-label"><Checkbox className="checkbox" checked={p.enabled} onCheckedChange={v => setCart({ ...cart, production: { ...p, enabled: v === true } })}/>Add Physical Printing Services</label>{p.enabled && <div className="production-fields fade-in"><div className="field"><label>Location</label><Picker value={p.location} onChange={v => change('location', v)} label="Production location" options={['Kampala', 'Kinshasa', 'Juba', 'Kigali', 'Dodoma', 'Nairobi', 'Gitega', 'Mogadishu', 'Goma', 'Dar es Salaam', 'Other'].map(x => ({ value: x, label: x }))}/></div><div className="two"><Field label="What needs to be produced?" id="production-item" value={p.item} onChange={v => change('item', v)} placeholder="Business cards, posters…"/><Field label="Estimated quantity" id="production-quantity" value={p.quantity} onChange={v => change('quantity', v)} placeholder="e.g. 200"/></div><Field label="Size and material, if known" id="production-material" value={p.material} onChange={v => change('material', v)} placeholder="e.g. A3, glossy paper"/><Field label="Special instructions (optional)" id="production-notes" value={p.notes} onChange={v => change('notes', v)} area/><Notice>Printing or production: quoted separately. Your design payment does not cover physical production.</Notice></div>}</section>; }
function Summary({ cart, checkout = false, share = 60, children, onReview }: {
    cart: Cart;
    checkout?: boolean;
    share?: number;
    children?: React.ReactNode;
    onReview?: () => void;
}) { const n = amounts(price(cart), share); return <aside className={`summary ${checkout ? 'checkout-summary' : ''}`}>{!checkout && <><div className="summary-label">Design total</div><div className="total mono" aria-live="polite">{money(n.total)}</div></>}{children || <a className="primary" href={orderRoute('/checkout')} onClick={onReview}>Review order</a>}<div className="summary-items">{checkout ? <><div className="summary-row"><span>Design total</span><strong>{money(n.total)}</strong></div><div className="summary-row"><span>Remaining balance</span><strong>{money(n.balance)}</strong></div></> : <><div className="summary-row"><span>{cart.service === 'logo' ? (cart.mode === 'bundle' ? 'Complete visual identity' : 'Basic logo') : `${cart.artworks.length} design project${cart.artworks.length === 1 ? '' : 's'}`}</span><strong>{cart.service === 'logo' && cart.mode === 'basic' && cart.addons.length > 0 ? `${cart.addons.length} extras` : ''}</strong></div></>}{cart.production.enabled && <div className="summary-row"><span>Printing / production</span><strong>Separate quote</strong></div>}</div><div className="summary-note"><ShieldCheck /><span>{checkout ? 'Your project brief opens after payment confirmation.' : 'Flexible Payment: Pay 60% to start.'}</span></div>{checkout && n.balance > 0 && <p className="note">The balance is due after your approval, before final files are released.</p>}</aside>; }
function Logo({ cart, setCart }: {
    cart: Cart;
    setCart: (c: Cart) => void;
}) { const basic = cart.mode === 'basic'; return <><div className="stack">{basic && <button className="switch-offer" onClick={() => setCart({ ...cart, mode: 'bundle' })}><span>Complete visual identity</span><b>{money(IDENTITY_CENTS)}</b></button>}<section className="panel offer" data-reveal key={cart.mode}><div className="offer-top"><div className="offer-heading"><h2>{basic ? 'Basic logo' : 'Complete visual identity'}</h2></div><div className="offer-pricing"><div className="price mono">{money(basic ? LOGO_CENTS : IDENTITY_CENTS)}</div></div></div><div className="offer-list">{(basic ? ['Logo design or refresh', 'PNG, JPG, PDF + color versions', '2 revisions'] : ['Logo & business essentials', 'Social designs & templates', 'Brand guide & editable files']).map(t => <p key={t}><Check />{t}</p>)}</div>{!basic && <Includes />}</section>{!basic && <button className="switch-offer basic-logo-option" data-reveal aria-label={'Basic logo, ' + money(LOGO_CENTS)} onClick={() => setCart({ ...cart, mode: 'basic' })}><span>Just the logo</span><span className="basic-price-tag mono" aria-hidden="true">{money(LOGO_CENTS)}</span></button>}</div>{basic && <><p className="section-label">Optional extras</p><div className="addon-grid">{ADDONS.map(a => { const Icon = icons[a.icon]; const selected = cart.addons.includes(a.id); return <label className={`addon ${selected ? 'selected' : ''}`} data-reveal key={a.id}><Icon /><span className="addon-copy">{a.name}<small>+{money(a.cents)}</small></span><Checkbox aria-label={a.name} className="checkbox" checked={selected} onCheckedChange={v => setCart({ ...cart, addons: v ? [...cart.addons, a.id] : cart.addons.filter(x => x !== a.id) })}/></label>; })}</div></>}<p className="note">Free product mockups included.</p><Production cart={cart} setCart={setCart}/></>; }
function Graphics({ cart, setCart }: {
    cart: Cart;
    setCart: (c: Cart) => void;
}) { const update = (id: string, patch: Partial<Artwork>) => setCart({ ...cart, artworks: cart.artworks.map(a => a.id === id ? { ...a, ...patch } : a) }); return <><div className="stack">{cart.artworks.map((a, i) => <section className="panel artwork" data-reveal key={a.id}><div className="artwork-top"><div className="artwork-label"><input className="artwork-name" id={'artwork-' + a.id} aria-label={`Design Project ${i + 1} name`} value={a.name} onChange={e => update(a.id, { name: e.target.value })} placeholder={`Design Project ${i + 1}`} maxLength={90} /></div><div className="artwork-price mono"><span aria-live="polite">{money(artworkPrice(a))}</span>{cart.artworks.length > 1 && <button className="icon-button" aria-label={`Remove design project ${i + 1}`} onClick={() => setCart({ ...cart, artworks: cart.artworks.filter(x => x.id !== a.id) })}><Trash2 size={17}/></button>}</div></div><div className="artwork-options">{[['print', 'High-Res Print Files'], ['message', 'Ad Copy & Slogans'], ['priority', 'Rush Delivery (Under 6 hours)']].map(([key, label]) => <label className="option-label" key={key}><Checkbox className="checkbox" checked={a[key as 'print']} onCheckedChange={v => update(a.id, { [key]: v === true })}/><span>{label}</span><small>+{money(ARTWORK_EXTRAS[key as keyof typeof ARTWORK_EXTRAS])}</small></label>)}</div></section>)}<button className="secondary add-artwork" onClick={() => setCart({ ...cart, artworks: [...cart.artworks, newArtwork()] })} disabled={cart.artworks.length >= 100}><Plus size={17}/>Add another design project</button></div><p className="note">Rush delivery starts after payment and receipt of your complete brief.</p><Production cart={cart} setCart={setCart}/></>; }
function RequestCheckout({ cart, customer, setCustomer, share }: { cart: Cart; customer: Customer; setCustomer: (c: Customer) => void; share: number }) {
    const [busy, setBusy] = useState(false), [error, setError] = useState('');
    const identity = useRef<{ fingerprint: string; requestKey: string; accessKey: string } | null>(null);
    const total = price(cart), due = amounts(total, share).due;
    const update = (key: keyof Customer, value: string) => setCustomer({ ...customer, [key]: value });
    async function submit(event: React.FormEvent) {
        event.preventDefault(); setError(''); setBusy(true);
        try {
            const fingerprint = JSON.stringify({ cart, customer, share });
            if (!identity.current || identity.current.fingerprint !== fingerprint) identity.current = { fingerprint, requestKey: uuid(), accessKey: token() };
            const data = await api('order-requests', 'POST', { cart, customer, share, requestKey: identity.current.requestKey, accessKey: identity.current.accessKey });
            sessionStorage.setItem('yoo-key-' + data.id, identity.current.accessKey);
            sessionStorage.setItem('yoo-order-progress', JSON.stringify({ id: data.id, fingerprint: draftFingerprint(cart, customer, share), briefUnlocked: true }));
            window.location.assign(`${orderRoute('/request-received')}/${data.id}#key=${identity.current.accessKey}`);
        } catch (reason) { setError((reason as Error).message); setBusy(false); }
    }
    return <>
        <Steps step={1} cart={cart} customer={customer} share={share} busy={busy} onNavigate={() => persistDraft(cart, customer, share)}/>
        <a className="back" href={orderRoute('/order/' + cart.service)}><ChevronLeft size={17}/>Edit your selection</a>
        <div className="page-head" data-reveal><h1>Confirm your request</h1><p>We’ll send payment details for your location after reviewing your request.</p></div>
        <form onSubmit={submit}><div className="work-grid"><div className="stack">
            <section className="panel checkout-panel" data-reveal>
                <h2 className="form-title">Your request</h2>
                <div className="checkout-lines">{lines(cart).map((line, index) => <div className="checkout-line" key={index}><div>{line.name}<small>{line.detail}</small></div><strong>{money(line.cents)}</strong></div>)}</div>
                <div className="rule"/>
                <div className="checkout-line"><span>Design total</span><strong>{money(total)}</strong></div>
                <div className="checkout-line" style={{ marginTop: 12 }}><span>60% to start</span><strong>{money(due)}</strong></div>
                {cart.production.enabled && <p className="note">Physical printing in {cart.production.location} needs a separate quote.</p>}
            </section>
            <section className="panel checkout-form" data-reveal>
                <h2 className="form-title">Your contact details</h2>
                <div className="two"><Field label="Your name" id="request-name" value={customer.name} onChange={value => update('name', value)} required autoComplete="name"/><Field label="Email" id="request-email" type="email" value={customer.email || ''} onChange={value => update('email', value)} required autoComplete="email"/></div>
                <div className="two"><Field label="Phone or WhatsApp (optional)" id="request-phone" type="tel" value={customer.phone} onChange={value => update('phone', value)} autoComplete="tel"/><Field label="Country" id="request-country" value={customer.country} onChange={value => update('country', value)} required autoComplete="country-name"/></div>
                <div className="price-discussion">
                    <label className="check-label"><Checkbox className="checkbox" checked={customer.priceDiscussion === true} onCheckedChange={value => setCustomer({ ...customer, priceDiscussion: value === true, budget: value === true ? customer.budget || '' : '' })}/>I’d like to discuss the price</label>
                    {customer.priceDiscussion && <div className="field price-budget"><label htmlFor="request-budget">What budget do you have in mind? (optional)</label><input className="input" id="request-budget" type="text" maxLength={100} value={customer.budget || ''} onChange={event => update('budget', event.target.value)} placeholder="e.g. $120"/><small className="note">We’ll review your request and discuss what fits before payment.</small></div>}
                </div>
            </section>
            {error && <Notice error>{error}</Notice>}
        </div><aside className="summary checkout-summary">
            <p className="summary-label">Request summary</p>
            <div className="summary-items"><div className="summary-row"><span>Design total</span><strong>{money(total)}</strong></div><div className="summary-row"><span>Deposit to start</span><strong>{money(due)}</strong></div></div>
            <p className="note" style={{ margin: '20px 0' }}>No payment is collected here. Yoo360 will send the payment contact for your country.</p>
            <button className="primary" type="submit" disabled={busy}>{busy ? <><LoaderCircle className="spin" size={17}/>Sending request…</> : 'Send request'}</button>
        </aside></div></form>
    </>;
}

function useOrder(id: string) { const [order, setOrder] = useState<RecordOrder | null>(null), [error, setError] = useState(''), [loading, setLoading] = useState(true); async function reload() { try {
    getToken(id);
    const x = await api(`orders/${id}`, 'GET', undefined, id);
    setOrder(x);
    setError('');
    return x;
}
catch (e) {
    setError((e as Error).message);
}
finally {
    setLoading(false);
} } useEffect(() => { reload(); }, [id]); return { order, setOrder, error, setError, loading, reload }; }
function AccessLoading({ loading, error }: {
    loading: boolean;
    error: string;
}) { return loading ? <div className="loading"><LoaderCircle className="spin" style={{ margin: 'auto' }}/>Loading your order</div> : <div className="state-wrap"><Notice error>{error || 'This order is unavailable. Open your private order link to continue.'}</Notice><a className="secondary" href={orderRoute('/')} style={{ marginTop: 20 }}>Back to designs</a></div>; }
function ResumeLink({ id }: {
    id: string;
}) { const [copied, setCopied] = useState(false); return <div className="resume"><button className="text-button" onClick={async () => { const url = window.location.origin + secureLink('/order', id); try {
    await navigator.clipboard.writeText(url);
    setCopied(true);
}
catch {
    window.prompt('Copy your private order link', url);
} }}><Copy size={15}/>{copied ? 'Private link copied' : 'Copy private order link'}</button><p className="note">Keep this link safe. Anyone with it can access your order and brief.</p></div>; }
function RequestReceived({ id }: { id: string }) {
    const { order, error, loading } = useOrder(id);
    if (!order) return <AccessLoading loading={loading} error={error}/>;
    return <>
        <Steps step={1} cart={order.cart} customer={order.customer} share={order.share} order={order}/>
        <div className="state-wrap request-received fade-in">
            <div className="state-icon"><CheckCircle2 size={34}/></div>
            <div className="eyebrow">Request {order.reference} received</div>
            <h1>We’ve received your request</h1>
            <p>Thank you, {order.customer.name}. Your order has reached the Yoo360 team.</p>
            <p>Tell us about your project so we can prepare the right response. You can do that now or come back later.</p>
            <div className="actions"><a className="primary" href={secureLink('/project-brief', id)}>Tell us about your project</a><a className="secondary" href={secureLink('/order', id)}>I’ll do this later</a></div>
            <p className="note">No payment has been taken. We’ll contact you with the next steps.</p>
            <ResumeLink id={id}/>
        </div>
    </>;
}
function PaymentStatus({ id }: { id: string }) {
    const { order, error, loading, reload, setError, setOrder } = useOrder(id);
    const [action, setAction] = useState<'check' | 'resend' | null>(null);
    const [message, setMessage] = useState('');
    const requestActive = useRef(false);
    useEffect(() => {
        if (!order || order.paymentMode === 'demo' || order.paymentStatus !== 'PENDING' || order.paid >= order.due) return;
        let canceled = false;
        const check = async () => {
            if (requestActive.current || document.visibilityState === 'hidden') return;
            requestActive.current = true;
            try {
                await api(`orders/${id}/verify`, 'POST', {}, id);
                const next = await api(`orders/${id}`, 'GET', undefined, id);
                if (!canceled) { setOrder(next); setError(''); }
            } catch (e) { if (!canceled) setError((e as Error).message); }
            finally { requestActive.current = false; }
        };
        void check();
        const timer = setInterval(check, 5000);
        return () => { canceled = true; clearInterval(timer); };
    }, [order?.paymentStatus, order?.paymentMode, order?.paid, order?.due, id]);
    async function run(kind: 'check' | 'resend') {
        if (!order) return;
        if (requestActive.current) { setMessage('Checking the current payment request. Please try again in a moment.'); return; }
        requestActive.current = true; setAction(kind); setError(''); setMessage('');
        try {
            if (kind === 'check') {
                const next = await checkInitialPayment(api, id, order.paymentMode);
                setOrder(next);
                if (next.paid < next.due) setMessage(next.paymentStatus === 'PENDING' ? 'We’re still waiting for confirmation. This page will update automatically.' : 'Payment has not been confirmed. Please request a new prompt to try again.');
            } else {
                const result = await retryInitialPayment(api, id, q => window.confirm(`Authorize ${q.amount} ${q.currency} for this payment?`));
                setOrder(result.order as RecordOrder); setMessage(result.message);
            }
        } catch (e) { await reload(); setError((e as Error).message); }
        finally { requestActive.current = false; setAction(null); }
    }
    if (!order) return <AccessLoading loading={loading} error={error}/>;
    const simulation = order.paymentMode === 'demo', paid = order.paid >= order.due, pending = order.paymentStatus === 'PENDING';
    const accepted = hasAcceptedPrompt(order);
    const phone = '+' + normalizePhone(order.customer.phone, order.customer.country);
    return <><Steps step={1} cart={order.cart} customer={order.customer} share={order.share} order={order} busy={!!action}/><div className="state-wrap payment-wait fade-in"><div className="state-icon">{paid ? <CheckCircle2 size={34}/> : pending ? <Smartphone size={34}/> : <XCircle size={34}/>}</div><h1>{paid ? (simulation ? 'Preview Payment Completed' : order.test ? 'Sandbox Payment Confirmed' : 'Payment Confirmed') : pending || simulation ? 'Check Your Phone' : 'Payment Not Completed'}</h1>{paid ? <p>Your order is saved. Tell us about your project to get it ready for the Yoo360 team.</p> : simulation ? <><p className="payment-subheading">Previewing a payment to <span className="payment-phone">{phone}</span>.</p><p>No payment request was sent. Use the button below to simulate confirmation and continue to your project brief.</p></> : order.test && pending ? <><p className="payment-subheading">Sandbox request prepared for <span className="payment-phone">{phone}</span>.</p><p>No real money will be collected. This page will update when the sandbox provider confirms the transaction.</p></> : pending && accepted ? <><p className="payment-subheading">We’ve sent a payment request to <span className="payment-phone">{phone}</span>.</p><p>Please open the message on your phone and enter your PIN to authorize the transaction. The page will update automatically once confirmed.</p></> : pending ? <><p>We’re checking the payment request for <span className="payment-phone">{phone}</span>.</p><p>Your order is saved. If the prompt hasn’t arrived, use Resend Payment Prompt to retry safely.</p></> : <p>The payment was not completed. Request a new prompt to try again.</p>}<p className="payment-amount mono">Amount: {money(order.due)}</p>{order.test && <p className="preview-note" role="status">{simulation ? 'Preview mode · No money collected. Completion is simulated.' : 'Sandbox mode · No real money collected.'}</p>}{error && <Notice error>{error}</Notice>}{message && <p className="payment-feedback" role="status">{message}</p>}<div className="actions payment-actions">{paid ? <a className="primary" href={secureLink('/project-brief', id)}>Complete project brief</a> : <><button className="secondary" disabled={!!action} onClick={() => run('resend')}>{action === 'resend' ? <><LoaderCircle className="spin" size={17}/>Checking request…</> : 'Resend Payment Prompt'}</button><button className="primary" disabled={!!action} onClick={() => run('check')}>{action === 'check' ? <><LoaderCircle className="spin" size={17}/>Checking payment…</> : 'I have completed the payment'}</button></>}</div>{!paid && simulation && <small className="simulation-caption">“I have completed the payment” simulates a successful payment in this preview.</small>}<a className="payment-order-link" href={secureLink('/order', id)}>View order</a><ResumeLink id={id}/></div></>;
}
const basicLogoFields = [['brandName', 'What name should appear on the logo?', 'If the name is undecided, write ‘Not decided yet’.', true], ['businessDescription', 'What do you do?', 'A few words are enough. Personal projects are welcome.', true], ['audience', 'Who is it for? (optional)', 'Who should recognize or use it?', false]] as const;
const identityFields = [['goal', 'What do you want this brand to achieve? (optional)', 'Tell us what you want to change or launch.', false], ['difference', 'What makes your offer different? (optional)', 'Tell us if you know. We can explore this together.', false], ['communicate', 'How should people feel about your brand? (optional)', 'For example: confident, welcome or excited.', false], ['usage', 'Where will the identity appear first? (optional)', 'For example: packaging, a website or your shop.', false]] as const;
const artFields = [['purpose', 'What is this design for?', 'For example: an event, offer or announcement.', true], ['message', 'What must it include? (optional)', 'Names, dates, prices, contact details and any exact wording.', false], ['audience', 'Who should it speak to? (optional)', 'A few words about the people you want to reach.', false]] as const;
function FileUploads({ order, artworkId, onChange, onError }: {
    order: RecordOrder;
    artworkId: string;
    onChange: () => Promise<unknown>;
    onError: (s: string) => void;
}) { const [busy, setBusy] = useState(false); async function upload(files: FileList | null) { if (!files)
    return; setBusy(true); onError(''); try {
    for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024)
            throw new Error(`${file.name} is larger than 10 MB.`);
        const form = new FormData();
        form.append('file', file);
        form.append('artworkId', artworkId);
        await api(`orders/${order.id}/files`, 'POST', form, order.id);
    }
    await onChange();
}
catch (e) {
    onError((e as Error).message);
}
finally {
    setBusy(false);
} } return <div><label className="uploads"><Upload size={23}/><span>{busy ? 'Uploading…' : 'Add logos, images or references'}</span><small className="muted">JPG, PNG, WebP, PDF, DOCX or TXT · 10 MB per file</small><input type="file" aria-label={'Upload files for ' + artworkId} accept=".jpg,.jpeg,.png,.webp,.pdf,.docx,.txt" multiple disabled={busy} onChange={e => { upload(e.target.files); e.target.value = ''; }}/></label><div className="file-list" style={{ marginTop: 12 }}>{order.files.filter(f => f.artwork_id === artworkId).map(f => <div className="file-row" key={f.id}><a href={`${orderApi(`orders/${order.id}/files/${f.id}`)}?key=${getToken(order.id)}`} target="_blank" rel="noreferrer"><File size={16}/>{f.name}</a><button className="icon-button" aria-label={'Remove ' + f.name} onClick={async () => { try {
    await api(`orders/${order.id}/files/${f.id}`, 'DELETE', undefined, order.id);
    await onChange();
}
catch (e) {
    onError((e as Error).message);
} }}><Trash2 size={15}/></button></div>)}</div></div>; }
function ProjectBrief({ id, onDraftAvailability }: {
    id: string;
    onDraftAvailability: (available: boolean) => void;
}) {
    const { order, error, loading, reload, setError } = useOrder(id);
    const [brief, setBrief] = useState<Record<string, Record<string, string>>>({}), [ready, setReady] = useState(false), [busy, setBusy] = useState(false), [saved, setSaved] = useState('');
    useEffect(() => { if (order && !ready) {
        setBrief(order.brief || {});
        setReady(true);
    } }, [order, ready]);
    const update = (section: string, key: string, value: string) => { setBrief(b => ({ ...b, [section]: { ...b[section], [key]: value } })); setSaved('Unsaved changes'); };
    async function save(submit = false) { setBusy(true); setError(''); try {
        await api(`orders/${id}/brief`, 'PUT', { brief, submit }, id);
        setSaved(submit ? 'Brief submitted' : 'Draft saved');
        await reload();
        return true;
    }
    catch (e) {
        setError((e as Error).message);
        return false;
    }
    finally {
        setBusy(false);
    } }
    useEffect(() => {
        onDraftAvailability(!!order && order.requestStatus !== 'Declined' && order.briefStatus !== 'submitted' && (order.paymentMode === 'manual' || order.paid >= order.due));
        return () => onDraftAvailability(false);
    }, [order?.requestStatus, order?.briefStatus, order?.paymentMode, order?.paid, order?.due, onDraftAvailability]);
    useEffect(() => {
        const handleSave = () => { if (!busy && order?.requestStatus !== 'Declined' && order?.briefStatus !== 'submitted') void save(false); };
        document.addEventListener('yoo:save-draft', handleSave);
        return () => document.removeEventListener('yoo:save-draft', handleSave);
    }, [busy, brief, order?.requestStatus, order?.briefStatus, id]);
    if (!order)
        return <AccessLoading loading={loading} error={error}/>;
    if (order.paymentMode !== 'manual' && order.paid < order.due)
        return <div className="state-wrap"><Notice>Your project brief opens after payment confirmation.</Notice><a className="primary" href={secureLink('/payment-status', id)} style={{ marginTop: 20 }}>Go to payment</a></div>;
    if (order.requestStatus === 'Declined')
        return <div className="state-wrap"><h1>Request closed</h1><p>{order.requestNote || 'Yoo360 cannot take on this request.'}</p><a className="secondary" href={secureLink('/order', id)} style={{ marginTop: 20 }}>View your request</a></div>;
    if (order.briefStatus === 'submitted')
        return <><Steps step={2} cart={order.cart} customer={order.customer} share={order.share} order={order}/><div className="state-wrap"><div className="state-icon"><CheckCircle2 size={34}/></div><h1>Project brief submitted</h1><p>{order.paymentMode === 'manual' ? 'We have your project details. Yoo360 will review them and contact you with payment details. No payment has been made here.' : 'Your project details are saved. Your order is ready for the Yoo360 team to review.'}</p><div className="actions"><a className="primary" href={secureLink('/order', id)}>View project status</a></div>{order.test && <div style={{ marginTop: 24 }}><Notice>This is a test order. No paid project has been started.</Notice></div>}<ResumeLink id={id}/></div></>;
    const logo = brief.logo || {};
    return <><Steps step={2} cart={order.cart} customer={order.customer} share={order.share} order={order} busy={busy} onNavigate={() => saved === 'Unsaved changes' ? save(false) : undefined}/><div className="brief-container"><a className="back" href={secureLink('/order', id)}><ChevronLeft size={17}/>Your order</a><div className="page-head" data-reveal><div className="eyebrow">{order.reference}{order.test ? ' · TEST ORDER' : ''}</div><h1>Tell us about your project</h1><p>Answer what you know. We can work through the rest together. You can save and return later.</p></div>{new URLSearchParams(window.location.search).has('new') && <div style={{ marginBottom: 24 }}><Notice success>Request received. Tell us a little more about your project so we can prepare the right work.</Notice></div>}<form onSubmit={e => { e.preventDefault(); save(true); }}><div className="brief-sections">{order.cart.service === 'logo' ? <>
  <section className="panel brief-section" data-reveal>
    <h2 className="brief-heading">{order.cart.mode === 'bundle' ? 'Your brand' : 'Your logo'}</h2>
    {basicLogoFields.map(([key, label, placeholder, required]) => <Field key={key} id={'brief-' + key} label={label} value={logo[key] || ''} onChange={v => update('logo', key, v)} placeholder={placeholder} required={required} area={key === 'businessDescription'}/>)}
    {order.cart.mode !== 'bundle' && <Field id="brief-communicate" label="What feeling should it give? (optional)" value={logo.communicate || ''} onChange={v => update('logo', 'communicate', v)} placeholder="For example: friendly or bold."/>}
  </section>
  {order.cart.mode === 'bundle' && <section className="panel brief-section" data-reveal>
    <h2 className="brief-heading">The bigger picture</h2>
    {identityFields.map(([key, label, placeholder, required]) => <Field key={key} id={'brief-' + key} label={label} value={logo[key] || ''} onChange={v => update('logo', key, v)} placeholder={placeholder} required={required} area={key !== 'usage'}/>)}
  </section>}
  <section className="panel brief-section" data-reveal>
    <h2 className="brief-heading">Anything to show us?</h2>
    <div className="field"><label>Is this a new logo or an update?</label><Picker label="Logo project type" value={logo.logoType || 'new'} onChange={v => update('logo', 'logoType', v)} options={[{ value: 'new', label: 'A new logo' }, { value: 'improve', label: 'Improve an existing logo' }]}/></div>
    <Field id="brief-colors" label="Colors you like (optional)" value={logo.colors || ''} onChange={v => update('logo', 'colors', v)}/>
    {(order.cart.mode === 'bundle' || order.cart.addons.includes('voice')) && <Field id="brief-tagline" label="Words or a tagline to explore (optional)" value={logo.tagline || ''} onChange={v => update('logo', 'tagline', v)}/>}
    {(order.cart.mode === 'bundle' || order.cart.addons.some(a => ['card', 'social', 'sign', 'letter'].includes(a))) && <Field id="asset-details" label="Details for the extra items (optional)" value={logo.assetDetails || ''} onChange={v => update('logo', 'assetDetails', v)} placeholder="For example: contact details for a business card." area/>}
    <FileUploads order={order} artworkId="logo" onChange={reload} onError={setError}/>
  </section>
</> : order.cart.artworks.map((a, i) => { const section = brief[a.id] || {}; return <section className="panel brief-section" data-reveal key={a.id}><h2 className="brief-heading"><span className="number">{String(i + 1).padStart(2, '0')}</span>{a.name.trim() || 'Design Project ' + (i + 1)}</h2>{artFields.map(([key, label, placeholder, required]) => <Field id={a.id + '-' + key} key={key} label={key === 'message' && a.message ? 'What are you promoting, and what should people do? (optional)' : label} value={section[key] || ''} onChange={v => update(a.id, key, v)} placeholder={key === 'message' && a.message ? 'Share your offer and facts. We’ll help write the words.' : placeholder} required={required} area={key !== 'audience'}/>)}{a.print && <Field id={a.id + '-size'} label="Printed size, if known (optional)" value={section.size || ''} onChange={v => update(a.id, 'size', v)} placeholder="e.g. A4"/>}{a.priority && order.paymentMode === 'manual' && <Field id={a.id + '-deadline'} label="When do you need it? Include your time zone" value={section.deadline || ''} onChange={v => update(a.id, 'deadline', v)} placeholder="e.g. Today at 6pm EAT" required/>}<FileUploads order={order} artworkId={a.id} onChange={reload} onError={setError}/></section>; })}</div>{error && <div style={{ marginTop: 20 }}><Notice error>{error}</Notice></div>}<div className="brief-actions"><small role="status">{saved || 'Your draft is private'}</small><div className="actions"><button className="primary" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send Project Details'}</button></div></div></form><ResumeLink id={id}/></div></>;
}
function ReviseOrder({ order, onSaved }: { order: RecordOrder; onSaved: (notification: string) => Promise<unknown> }) {
    const [cart, setCart] = useState<Cart>({ ...order.cart, catalogVersion: CATALOG_VERSION });
    const [budget, setBudget] = useState(String((order.customer as Customer & { budget?: string }).budget || ''));
    const [discussPrice, setDiscussPrice] = useState(Boolean((order.customer as Customer & { priceDiscussion?: boolean }).priceDiscussion));
    const [busy, setBusy] = useState(false), [error, setError] = useState('');
    const previous = order.total;
    const proposed = price(cart);
    async function submit() {
        setBusy(true); setError('');
        try {
            const data = await api(`orders/${order.id}/revision`, 'PATCH', { cart, budget, priceDiscussion: discussPrice, updatedAt: order.updated_at }, order.id);
            await onSaved(data.notification);
        } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
    }
    return <section className="panel order-revision"><h2>Revise your request</h2><p className="note">Change what you need before Yoo360 accepts the project. Current prices apply. Nothing is charged here.</p>
        <div className="field"><label>Service</label><Picker label="Service" value={cart.service} onChange={value => setCart({ ...cart, service: value as 'logo' | 'graphics' })} options={[{ value: 'logo', label: 'Logo & Brand Visual Identity' }, { value: 'graphics', label: 'Marketing & Print Design' }]}/></div>
        {cart.service === 'logo' ? <Logo cart={cart} setCart={setCart}/> : <Graphics cart={cart} setCart={setCart}/>}
        <label className="option-label"><Checkbox className="checkbox" checked={discussPrice} onCheckedChange={value => setDiscussPrice(value === true)}/><span>I want to discuss the price</span></label>
        {discussPrice && <Field id="revised-budget" label="What price works for you? (optional)" value={budget} onChange={setBudget} placeholder="Tell us what you have in mind"/>}
        <div className="revision-totals"><span>Previous total <b>{money(previous)}</b></span><span>New listed total <b>{money(proposed)}</b></span></div>
        {previous !== proposed && <p className="note">The new total replaces your previous listed price. Yoo360 will review any price request separately.</p>}
        {error && <Notice error>{error}</Notice>}
        <button className="primary" type="button" disabled={busy || !cartSchema.safeParse(cart).success} onClick={submit}>{busy ? 'Saving…' : 'Save changes to this request'}</button>
    </section>;
}
function OrderStatus({ id }: {
    id: string;
}) { const { order, error, loading, reload, setError } = useOrder(id); const [busy, setBusy] = useState(false), [editing, setEditing] = useState(false), [revisionSuccess, setRevisionSuccess] = useState(''); useEffect(() => { if (!order || order.paymentMode === 'demo' || order.paymentStatus !== 'PENDING')
    return; const timer = setInterval(() => { api(`orders/${id}/verify`, 'POST', {}, id).then(reload).catch(e => setError(e.message)); }, 5000); return () => clearInterval(timer); }, [order?.paymentStatus, order?.paymentMode, id]); if (!order)
    return <AccessLoading loading={loading} error={error}/>; if (revisionSuccess) return <><Steps step={1} cart={order.cart} customer={order.customer} share={order.share} order={order}/><div className="state-wrap fade-in" role="status"><div className="state-icon"><CheckCircle2 size={34}/></div><h1>Your changes are saved</h1><p>{revisionSuccess}</p><div className="actions"><button className="primary" type="button" onClick={() => setRevisionSuccess('')}>View updated order</button></div><ResumeLink id={id}/></div></>; const at = STATUSES.indexOf(order.projectStatus); const adjustment = order.total - orderLines(order.cart).reduce((sum, line) => sum + line.cents, 0); async function balance() { if (!order)
    return; setBusy(true); try {
    const q = await api(`orders/${id}/balance-quote`, 'POST', {}, id);
    if (order.paymentMode !== 'demo' && !window.confirm(`Authorize ${q.amount} ${q.currency} to settle the remaining balance?`))
        return;
    await api(`orders/${id}/payment`, 'POST', { purpose: 'balance', quoteId: q.quoteId }, id);
    await reload();
}
catch (e) {
    setError((e as Error).message);
}
finally {
    setBusy(false);
} } return <><Steps step={order.paymentMode === 'manual' ? (order.briefStatus === 'submitted' ? 2 : 1) : order.paid >= order.due ? 2 : 1} cart={order.cart} customer={order.customer} share={order.share} order={order} busy={busy}/><div className="page-head" data-reveal><div className="eyebrow">{order.reference}{order.test ? ' · TEST ORDER' : ''}</div><h1>Your project</h1></div><div className="work-grid"><div className="stack"><section className="panel"><h2>{order.cart.service === 'logo' ? 'Logo & Brand Visual Identity' : 'Marketing & Print Design'}</h2>{projectName(order) && <p className="note">For {projectName(order)}</p>}<div className="rule"/><div className="checkout-lines">{orderLines(order.cart).map((l, i) => <div className="checkout-line" key={i}><div>{l.name}<small>{l.detail}</small></div><strong>{money(l.cents)}</strong></div>)}{adjustment !== 0 && <div className="checkout-line"><div>Agreed price adjustment<small>Confirmed with Yoo360</small></div><strong>{money(adjustment)}</strong></div>}</div></section>{order.paymentMode === 'manual' && !order.test && order.paid === 0 && ['New', 'Responded'].includes(order.requestStatus) && ['Awaiting payment', 'Awaiting project brief'].includes(order.projectStatus) && <>{editing ? <ReviseOrder key={order.updated_at} order={order} onSaved={async notification => { await reload(); setEditing(false); setRevisionSuccess(notification === 'email' ? 'We’ve received your updated selection and budget. Our team will review it and get back to you.' : 'Your updated selection and budget are on your project. Our team can see them and will get back to you.'); }}/> : <button className="secondary" type="button" onClick={() => setEditing(true)}>Edit services or discuss price</button>}</>}{order.requestStatus && order.requestStatus !== 'New' && <section className="panel"><h2>Yoo360’s response</h2><span className="status-chip">{order.requestStatus}</span>{order.requestNote && <p className="note" style={{ whiteSpace: 'pre-wrap', marginTop: 14 }}>{order.requestNote}</p>}</section>}{order.requestStatus !== 'Declined' && <section className="panel"><h2>Project status</h2><div className="timeline">{STATUSES.map((s, i) => <div key={s} className={`timeline-item ${i < at ? 'done' : i === at ? 'now' : ''}`}><div className="timeline-point"><span>{i < at ? <Check size={12}/> : i + 1}</span></div><span>{s}</span></div>)}</div></section>}{order.deliverables?.length > 0 && <section className="panel"><h2>Your final files</h2><p className="note">Your completed designs are ready to download.</p><div className="deliverable-list">{order.deliverables.map(file => <button className="secondary" key={file.id} onClick={() => downloadFinalFile(id, file).catch(reason => setError((reason as Error).message))}><File size={16}/><span>{file.name}</span><small>{Math.ceil(file.size / 1024)} KB</small></button>)}</div></section>}{order.cart.production.enabled && <section className="panel"><h3>Printing / production quotation</h3><p className="note">{order.cart.production.item || 'Details to confirm'} · {order.cart.production.location} · {order.cart.production.quantity || 'Quantity to confirm'}</p><p className="note">Quoted separately. No physical production has been paid for.</p></section>}{error && <Notice error>{error}</Notice>}</div><aside className="summary"><span className="summary-label">Design total</span><div className="total">{money(order.total)}</div><div className="summary-items"><div className="summary-row"><span>{order.paymentMode === 'manual' ? 'Payment' : order.test ? 'Test payment' : 'Verified payment'}</span><strong>{money(order.paid)}</strong></div><div className="summary-row"><span>Balance remaining</span><strong>{money(order.total - order.paid)}</strong></div><div className="summary-row"><span>Brief</span><strong>{order.briefStatus}</strong></div></div><div style={{ marginTop: 25 }}>{order.requestStatus === 'Declined' ? <p className="note">This request is closed. Reply to our email if you want to discuss another approach.</p> : order.paymentMode === 'manual' && order.briefStatus === 'submitted' ? <p className="note">Yoo360 will contact you with payment details for {order.customer.country}. Your request and brief are saved.</p> : order.paymentMode === 'manual' ? <a className="primary" href={secureLink('/project-brief', id)}>Tell us about your project</a> : order.paid < order.due ? <a className="primary" href={secureLink('/payment-status', id)}>Complete payment</a> : order.briefStatus !== 'submitted' ? <a className="primary" href={secureLink('/project-brief', id)}>Complete project brief</a> : <span className="status-chip">{order.projectStatus}</span>}</div>{order.projectStatus === 'Awaiting final balance' && order.total > order.paid && <button className="primary" disabled={busy} onClick={balance} style={{ marginTop: 20 }}>Pay remaining balance</button>}{order.paymentMode === 'demo' && order.payments.some(p => p.purpose === 'balance' && p.status === 'PENDING') && <button className="secondary" disabled={busy} style={{ marginTop: 15 }} onClick={async () => { await api(`orders/${id}/demo`, 'POST', { status: 'COMPLETED', purpose: 'balance' }, id); await reload(); }}>Complete test balance</button>}<ResumeLink id={id}/></aside></div></>; }
export function YooApp({ screen, id }: {
    screen: string;
    id?: string;
}) {
    const [cart, setCart] = useState<Cart>(() => ({ ...initialCart(), ...(screen === 'graphics' ? { service: 'graphics' as const } : {}) })), [customer, setCustomer] = useState<Customer>({ name: '', email: '', business: '', individual: false, country: '', provider: '', phone: '' }), [share, setShare] = useState(60), [loaded, setLoaded] = useState(false), [pricingUpdated, setPricingUpdated] = useState(false), [canSaveDraft, setCanSaveDraft] = useState(false);
    const cartRef = useRef(cart);
    cartRef.current = cart;
    useEffect(() => { let draftCart = initialCart(); try {
        const data = JSON.parse(sessionStorage.getItem('yoo-order-draft') || 'null');
        if (data) {
            const c = cartSchema.safeParse(data.cart);
            if (c.success) { draftCart = c.data; setPricingUpdated(c.data.catalogVersion !== CATALOG_VERSION); }
            if (data.customer)
                setCustomer(data.customer);
            if ([60, 100].includes(data.share))
                setShare(data.share);
        }
    }
    catch { } setCart(cartForOrderEntry(draftCart, screen, window.location.search, initialCart)); setLoaded(true); }, [screen]);
    useEffect(() => { if (loaded)
        sessionStorage.setItem('yoo-order-draft', JSON.stringify({ cart, customer, share })); }, [cart, customer, share, loaded]);
    useEffect(() => { const context = (document as any).modelContext; if (!context?.registerTool)
        return; const lifecycle = new AbortController(); const tool = (name: string, description: string, inputSchema: object, execute: (input: any) => any, readOnlyHint = false) => Promise.resolve(context.registerTool({ name, description, inputSchema, execute, annotations: { readOnlyHint, untrustedContentHint: false } }, { signal: lifecycle.signal })).catch(() => { }); tool('get_design_quote', 'Read the currently configured design total in USD. Does not initiate payment.', { type: 'object', properties: {}, additionalProperties: false }, () => ({ cart: cartRef.current, totalCents: price(cartRef.current) }), true); tool('stage_logo_order', 'Configure a logo order. Does not save an order or collect payment.', { type: 'object', properties: { mode: { enum: ['bundle', 'basic'] }, addons: { type: 'array', items: { enum: ADDONS.map(a => a.id) } } }, required: ['mode'], additionalProperties: false }, async (input) => { const candidate = cartSchema.parse({ ...cartRef.current, service: 'logo', mode: input.mode, addons: input.addons || [] }); setCart(candidate); await new Promise(requestAnimationFrame); return { totalCents: price(candidate), mode: candidate.mode }; }); tool('stage_artwork_order', 'Configure independent artwork names and extras. Does not save an order or collect payment.', { type: 'object', properties: { artworks: { type: 'array', minItems: 1, maxItems: 100, items: { type: 'object', properties: { name: { type: 'string' }, print: { type: 'boolean' }, message: { type: 'boolean' }, priority: { type: 'boolean' } }, required: ['name', 'print', 'message', 'priority'], additionalProperties: false } } }, required: ['artworks'], additionalProperties: false }, async (input) => { if (!Array.isArray(input.artworks))
        throw new Error('Provide at least one artwork.'); const candidate = cartSchema.parse({ ...cartRef.current, service: 'graphics', artworks: input.artworks.map((a: any) => ({ ...a, id: uuid() })) }); setCart(candidate); await new Promise(requestAnimationFrame); return { totalCents: price(candidate), artworks: candidate.artworks }; }); return () => lifecycle.abort(); }, []);
    function saveSelection() { persistDraft(cart, customer, share); }
    function choose(service: 'logo' | 'graphics') { setCart(c => ({ ...c, service })); sessionStorage.setItem('yoo-order-draft', JSON.stringify({ cart: { ...cart, service }, customer, share })); window.location.assign(orderRoute('/order/' + service)); }
    const selection = screen === 'logo' || screen === 'graphics';
    const showSelection = loaded || typeof window === 'undefined';
    return <div className={`shell ${screen === 'home' ? 'landing-shell' : selection ? 'with-mobile-bar' : ''}`}><BrandDefinitions/><Header canSaveDraft={canSaveDraft}/><main>{pricingUpdated && (selection || screen === 'checkout') && <Notice>Our design prices have been updated. Review your selections and total before continuing.</Notice>}{screen === 'home' ? <section className="entry"><div className="entry-content"><h1 data-reveal>What are we building <span className="accent">today?</span></h1><div className="service-grid"><a className="service-card" data-reveal aria-label={'Logo & Brand Visual Identity, from ' + money(LOGO_CENTS)} href={orderRoute('/order/logo')} onClick={event => { if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) { event.preventDefault(); choose('logo'); } }}><div className="service-card-head"><BrandIllustration kind="logo"/><div className="service-copy"><h2 className="service-title"><span>Logo &</span>{' '}<span>Brand Visual</span>{' '}<span>Identity</span></h2><span className="from"><BrandIllustration kind="money"/><span>FROM <b>{money(LOGO_CENTS)}</b></span></span></div></div></a><a className="service-card" data-reveal aria-label={'Marketing & Print Design, from ' + money(ARTWORK_CENTS)} href={orderRoute('/order/graphics')} onClick={event => { if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) { event.preventDefault(); choose('graphics'); } }}><div className="service-card-head"><BrandIllustration kind="graphics"/><div className="service-copy"><h2 className="service-title"><span>Marketing</span>{' '}<span>& Print</span>{' '}<span>Design</span></h2><span className="from"><BrandIllustration kind="money"/><span>FROM <b>{money(ARTWORK_CENTS)}</b></span></span></div></div></a><a className="service-card" data-reveal href="/discuss-a-project?service=video"><div className="service-card-head"><BrandIllustration kind="video"/><div className="service-copy"><h2 className="service-title"><span>Video &</span><span>Motion</span><span>Production</span></h2><span className="from">REQUEST A QUOTE</span></div></div></a><a className="service-card" data-reveal href="/marketing-partnerships"><div className="service-card-head"><BrandIllustration kind="partnership"/><div className="service-copy"><h2 className="service-title"><span>Marketing</span><span>Partnerships</span></h2><span className="from">MONTHLY PLANS</span></div></div></a></div><p className="other-enquiry" data-reveal>Need something different? <a href="/other-enquiry">Tell us what you have in mind.</a></p></div></section> : selection ? <><Steps step={0} cart={cart} customer={customer} share={share} onNavigate={saveSelection} busy={!loaded}/><a className="back" href={orderRoute('/')}><ChevronLeft size={17}/>All services</a><div className="page-head" data-reveal><h1>{screen === 'logo' ? 'Logo & Brand Visual Identity' : 'Marketing & Print Design'}</h1></div>{showSelection ? <div className="work-grid"><div>{screen === 'logo' ? <Logo cart={cart} setCart={setCart}/> : <Graphics cart={cart} setCart={setCart}/>}</div><Summary cart={cart} onReview={saveSelection}/></div> : <div className="loading">Loading your selections…</div>}{loaded && <div className="mobile-summary"><div><small>Design total</small><strong aria-live="polite">{money(price(cart))}</strong></div><a className="primary" href={orderRoute('/checkout')} onClick={saveSelection}>Review order</a></div>}</> : screen === 'checkout' ? (loaded ? <RequestCheckout cart={cart} customer={customer} setCustomer={setCustomer} share={share}/> : <div className="loading">Loading your order…</div>) : screen === 'received' && id ? <RequestReceived id={id}/> : screen === 'payment' && id ? <PaymentStatus id={id}/> : screen === 'brief' && id ? <ProjectBrief id={id} onDraftAvailability={setCanSaveDraft}/> : screen === 'status' && id ? <OrderStatus id={id}/> : null}</main>{screen !== 'home' && <Footer />}</div>;
}
type Enquiry = { id: string; name: string; company: string; email: string; projectType: string; service: string; plan: string; deadline: string; message: string; status: string; createdAt: number };
function EnquiryInbox() {
    const [items, setItems] = useState<Enquiry[]>([]), [error, setError] = useState(''), [loading, setLoading] = useState(true), [busy, setBusy] = useState('');
    async function reload() { try { const result = await api('admin/enquiries'); setItems(result.enquiries); setError(''); } catch (e) { setError((e as Error).message); } finally { setLoading(false); } }
    useEffect(() => { void reload(); }, []);
    async function update(id: string, status: string) { setBusy(id); try { await api('admin/enquiries/' + id, 'PATCH', { status }); await reload(); } catch (e) { setError((e as Error).message); } finally { setBusy(''); } }
    return <section aria-label="Project enquiries" style={{ marginTop: 36 }}><div className="admin-heading"><h2>Project enquiries</h2><button className="text-button" onClick={reload}>Refresh enquiries</button></div>{error && <Notice error>{error}</Notice>}<div className="stack" style={{ marginTop: 20 }}>{items.map(item => <article className="panel" key={item.id}><div className="eyebrow">{new Date(item.createdAt).toLocaleDateString()} · {item.service}{item.plan ? ' · ' + item.plan : ''}</div><h3>{item.name}{item.company ? ' · ' + item.company : ''}</h3><p className="note">{item.projectType}{item.deadline ? ' · Deadline: ' + item.deadline : ''}</p><p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', margin: '18px 0' }}>{item.message}</p><div className="actions"><a className="secondary" href={'mailto:' + item.email + '?subject=' + encodeURIComponent('Your Yoo360 project enquiry')}>Reply by email</a><Picker value={item.status} label="Enquiry status" disabled={busy === item.id} onChange={status => update(item.id, status)} options={['New', 'Reviewing', 'Replied'].map(value => ({ value, label: value }))}/></div></article>)}{!items.length && <p className="note">{loading ? 'Loading enquiries…' : 'No project enquiries yet.'}</p>}</div></section>;
}
export function AdminApp() { const [orders, setOrders] = useState<RecordOrder[]>([]), [selected, setSelected] = useState<RecordOrder | null>(null), [error, setError] = useState(''), [loading, setLoading] = useState(true), [filter, setFilter] = useState('all'), [busy, setBusy] = useState(false); const [status, setStatus] = useState(''); async function load() { try {
    const x = await api('admin/orders');
    setOrders(x.orders);
    setError('');
}
catch (e) {
    setError((e as Error).message);
}
finally {
    setLoading(false);
} } useEffect(() => { load(); }, []); async function open(id: string) { try {
    const o = await api('admin/orders/' + id);
    setSelected(o);
    setStatus(o.projectStatus);
    setError('');
}
catch (e) {
    setError((e as Error).message);
} } async function update() { if (!selected)
    return; setBusy(true); try {
    await api('admin/orders/' + selected.id, 'PATCH', { status });
    await open(selected.id);
    await load();
}
catch (e) {
    setError((e as Error).message);
}
finally {
    setBusy(false);
} } return <div className="shell"><Header /><main style={{ paddingTop: 40 }}><EnquiryInbox/><div className="admin-heading" style={{ marginTop: 40 }}><div><div className="eyebrow">Yoo360 team</div><h1 style={{ fontSize: '2.3rem' }}>Order workspace</h1></div><a className="secondary" href="/signout-with-chatgpt?return_to=/" target="_top">Sign out</a></div>{error && <div style={{ marginTop: 25 }}><Notice error>{error}</Notice></div>}{selected ? <><button className="back" style={{ marginTop: 25 }} onClick={() => setSelected(null)}><ChevronLeft size={17}/>All orders</button><div className="admin-detail"><div className="stack"><section className="panel"><div className="eyebrow">{selected.reference}{selected.test ? ' · TEST ORDER' : ''}</div><h2>{projectName(selected) || 'Design order'}</h2><p className="note">{selected.customer.name || 'Client'} · {selected.customer.phone ? '+' + normalizePhone(selected.customer.phone, selected.customer.country) : selected.customer.email}</p><div className="rule"/>{orderLines(selected.cart).map((l, i) => <div className="checkout-line" style={{ marginBottom: 15 }} key={i}><div>{l.name}<small>{l.detail}</small></div><strong>{money(l.cents)}</strong></div>)}</section><section className="panel"><h2>Project brief · {selected.briefStatus}</h2>{Object.entries(selected.brief).map(([id, fields]) => <div key={id}><h3 style={{ marginTop: 22 }}>{id === 'logo' ? 'Logo brief' : selected.cart.artworks.find(a => a.id === id)?.name || 'Design project brief'}</h3>{Object.entries(fields).map(([k, v]) => <div className="brief-response" key={k}><small>{k.replace(/([A-Z])/g, ' $1')}</small><p>{v}</p></div>)}</div>)}{selected.files.map(f => <div className="file-row" key={f.id}><a href={orderApi(`admin/orders/${selected.id}/files/${f.id}`)} target="_blank" rel="noreferrer"><File size={16}/>{f.name}</a><small>{Math.ceil(f.size / 1024)} KB</small></div>)}</section>{selected.cart.production.enabled && <section className="panel"><h2>Production quotation request</h2>{Object.entries(selected.cart.production).filter(([k]) => k !== 'enabled').map(([k, v]) => <div className="brief-response" key={k}><small>{k}</small><p>{String(v) || 'Not specified'}</p></div>)}</section>}<section className="panel"><h2>Payment history</h2>{selected.payments.map(p => <div className="brief-response" key={p.id}><small>{p.purpose} · {new Date(p.created_at).toLocaleString()}</small><p>{p.amount} {p.currency} · {p.status}{selected.test ? (selected.paymentMode === 'demo' ? ' · SIMULATED' : ' · SANDBOX') : ''}</p></div>)}</section></div><div className="stack"><section className="panel"><h3>Project status</h3><div style={{ margin: '18px 0' }}><Picker value={status} onChange={setStatus} label="Project status" options={STATUSES.map(s => ({ value: s, label: s }))}/></div><button className="primary" disabled={busy} onClick={update}>{busy ? 'Saving…' : 'Update status'}</button><div className="rule"/><div className="summary-row"><span>Total</span><strong>{money(selected.total)}</strong></div><div className="summary-row" style={{ marginTop: 12 }}><span>{selected.test ? (selected.paymentMode === 'demo' ? 'Simulated paid' : 'Sandbox paid') : 'Verified paid'}</span><strong>{money(selected.paid)}</strong></div><div className="summary-row" style={{ marginTop: 12 }}><span>Outstanding</span><strong>{money(selected.total - selected.paid)}</strong></div></section><section className="panel"><h3 style={{ marginBottom: 20 }}>Activity</h3><div className="activity">{selected.activity.map(a => <div key={a.id}><p>{a.message}</p><small>{new Date(a.created_at).toLocaleString()}</small></div>)}</div></section></div></div></> : <><div className="admin-stats"><div className="panel"><p>All orders</p><b>{orders.length}</b></div><div className="panel"><p>Ready to start</p><b>{orders.filter(o => o.projectStatus === 'Ready to start').length}</b></div><div className="panel"><p>Verified payments</p><b>{money(orders.filter(o => !o.test).reduce((s, o) => s + o.paid, 0))}</b></div></div><div className="admin-filters"><Picker value={filter} onChange={setFilter} label="Filter orders" options={[{ value: 'all', label: 'All statuses' }, ...STATUSES.map(s => ({ value: s, label: s }))]}/><button className="text-button" onClick={load}>Refresh</button></div><div className="order-table"><Table><TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Status</TableHead><TableHead>Total / balance</TableHead></TableRow></TableHeader><TableBody>{orders.filter(o => filter === 'all' || o.projectStatus === filter).map(o => <TableRow key={o.id}><TableCell><button className="text-button accent" onClick={() => open(o.id)}>{o.reference}</button><small>{o.test ? 'TEST · ' : ''}{o.cart.service === 'logo' ? 'Logo & identity' : 'Marketing & Print Design'}</small></TableCell><TableCell>{projectName(o) || 'Mobile Money customer'}<small>{o.customer.phone ? '+' + normalizePhone(o.customer.phone, o.customer.country) : o.customer.email}</small></TableCell><TableCell><span className="status-chip">{o.projectStatus}</span><small>{o.briefStatus} brief</small></TableCell><TableCell>{money(o.total)}<small>{money(o.total - o.paid)} remaining</small></TableCell></TableRow>)}</TableBody></Table>{!orders.length && <div className="empty">{loading ? 'Loading orders…' : 'No orders yet. Orders will appear here after checkout.'}</div>}</div></>}</main><Footer /></div>; }
