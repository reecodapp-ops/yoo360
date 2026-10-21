import { useEffect, useRef, useState } from 'react';
import { orderApi } from '@/lib/routes';
import { money, orderLines, price, ADDONS, CATALOG_VERSION, newArtwork, type Cart } from '@/lib/catalog';
import { Trash2 } from 'lucide-react';
import './team-workspace.css';

type Decision = 'New' | 'Responded' | 'Accepted' | 'Declined';
type Moment = 'details' | 'accepted' | 'declined' | 'payment' | 'review' | 'delivered';
type Customer = { name: string; email: string; phone: string; business: string; country?: string; budget?: string; priceDiscussion?: boolean };
type Order = {
  id: string; reference: string; cart: Cart; customer: Customer; total: number; due: number; paid: number; share: number;
  projectStatus: string; requestStatus: Decision; requestNote: string; briefStatus: string;
  brief: Record<string, Record<string, string>>; files: { id: string; name: string }[];
  payments: { id: string; amount: string; currency: string; status: string; created_at: string }[];
  activity: { id: string; message: string; created_at: string }[];
  paymentInstructions: string; deliveryLink: string; clientNote: string; archivedAt: string | null;
  test: boolean; paymentMode: string;
};
type Draft = { cart: Cart; requestStatus: Decision; requestNote: string; projectStatus: string; totalCents: number; paymentInstructions: string; deliveryLink: string; clientNote: string; customer: Customer };
const stages = [
  ['Ready to start', 'Not started'], ['In progress', 'In progress'],
  ['Awaiting client feedback', 'Ready for review'], ['Completed', 'Delivered'],
] as const;
const moments: { value: Moment; label: string }[] = [
  { value: 'details', label: 'Ask for one more detail' },
  { value: 'accepted', label: 'Accept project and share payment details' },
  { value: 'declined', label: 'Decline request' },
  { value: 'payment', label: 'Confirm payment and progress' },
  { value: 'review', label: 'Ask for feedback' },
  { value: 'delivered', label: 'Deliver the project' },
];
async function api(path: string, method = 'GET', payload?: unknown) {
  const response = await fetch(orderApi('admin/' + path), { method, credentials: 'same-origin', cache: 'no-store',
    headers: payload === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'That did not save. Please try again.');
  return data;
}
function draftFor(o: Order): Draft { return {
  cart: o.cart, requestStatus: o.requestStatus || 'New', requestNote: o.requestNote || '', projectStatus: o.projectStatus,
  totalCents: o.total, paymentInstructions: o.paymentInstructions || '', deliveryLink: o.deliveryLink || '', clientNote: o.clientNote || '',
  customer: { name: o.customer.name || '', email: o.customer.email || '', phone: o.customer.phone || '', business: o.customer.business || '' },
}; }
function labelStage(stage: string) { return stages.find(s => s[0] === stage)?.[1] || 'Not started'; }
function activityLabel(message: string) {
  if (message.startsWith('Brief email accepted')) return 'Project brief received';
  if (message.startsWith('Request email accepted')) return 'Request confirmation sent';
  if (message.startsWith('Client request received')) return 'Client placed a request';
  if (message.startsWith('Manager saved order details')) return 'Project details updated';
  if (message.startsWith('Client update requested:')) return 'Client update prepared';
  if (message.startsWith('Client emailed:')) return 'Client email sent: ' + message.split(':').at(-1)?.trim();
  return message;
}
const needsQuestion = (body: string) => body.includes('[Write the exact question for this client here.');
function paymentLabel(order: Order) { return order.paid === 0 ? 'Unpaid' : order.paid >= order.total ? 'Paid in full' : 'Deposit received'; }

function GoogleSignIn({ clientId, onSuccess }: { clientId: string; onSuccess: () => void }) {
  const button = useRef<HTMLDivElement>(null);
  const success = useRef(onSuccess);
  success.current = onSuccess;
  const [error, setError] = useState('');
  useEffect(() => {
    if (!clientId || !button.current) return;
    let live = true;
    const render = () => {
      if (!live || !button.current) return;
      const google = (window as any).google;
      if (!google?.accounts?.id) { setError('Google sign-in could not load. Refresh the page and try again.'); return; }
      google.accounts.id.initialize({ client_id: clientId, callback: async ({ credential }: { credential: string }) => {
        try { setError(''); await api('session', 'POST', { credential }); success.current(); }
        catch (e) { setError((e as Error).message); }
      } });
      button.current.replaceChildren();
      google.accounts.id.renderButton(button.current, { type: 'standard', theme: 'filled_black', size: 'large', text: 'signin_with', width: 260 });
    };
    if ((window as any).google?.accounts?.id) render();
    else {
      const script = document.createElement('script'); script.src = 'https://accounts.google.com/gsi/client'; script.async = true;
      script.onload = render; script.onerror = () => setError('Google sign-in could not load. Refresh the page and try again.'); document.head.appendChild(script);
    }
    return () => { live = false; };
  }, [clientId]);
  return <div className="team-login"><img src="/brand/yoo360-primary-white.webp" alt="Yoo360"/><h1>Team workspace</h1>
    <p>Sign in with the Yoo360 Google account to manage projects.</p>
    {clientId ? <div ref={button} className="team-google-button"/> : <p className="team-error">Google sign-in is being configured.</p>}
    {error && <p className="team-error" role="alert">{error}</p>}
    <a href="/" className="team-link">Back to Yoo360</a></div>;
}

export function TeamWorkspace() {
  const [auth, setAuth] = useState<'loading' | 'signed-in' | 'signed-out'>('loading');
  const [clientId, setClientId] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [search, setSearch] = useState('');
  const [archived, setArchived] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<'list' | 'project' | 'payment' | 'message' | 'manage', string>>>({});
  const [notice, setNotice] = useState('');
  const [clientLink, setClientLink] = useState('');
  const [linkError, setLinkError] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [moment, setMoment] = useState<Moment>('accepted');
  const [preview, setPreview] = useState<{ subject: string; body: string } | null>(null);
  const [draftState, setDraftState] = useState<'idle' | 'updating' | 'ready' | 'error'>('idle');
  const [draftError, setDraftError] = useState('');
  const previewRun = useRef(0);
  const [sendKey, setSendKey] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentPurpose, setPaymentPurpose] = useState<'initial' | 'full' | 'balance'>('initial');
  async function loadOrders() { const result = await api('orders'); setOrders(result.orders); }
  async function loadSession() {
    try { const result = await api('session'); setClientId(result.clientId || ''); setAuth(result.signedIn ? 'signed-in' : 'signed-out');
      if (result.signedIn) { await loadOrders(); const id = location.pathname.split('/')[2]; if (/^[0-9a-f-]{36}$/.test(id || '')) await openOrder(id); }
    } catch (e) { setAuth('signed-out'); setErrors({ list: (e as Error).message }); }
  }
  useEffect(() => { void loadSession(); }, []);
  async function openOrder(id: string) {
    const order: Order = await api('orders/' + id);
    setSelected(order); setDraft(draftFor(order)); setClientLink(''); setLinkError('');
    api('orders/' + id + '/client-link').then(result => setClientLink(result.link)).catch(e => setLinkError((e as Error).message)); setPaymentPurpose(order.paid >= order.due ? 'balance' : 'initial');
    const acceptedEmailSent = order.activity?.some(a => a.message === 'Client emailed: accepted');
    setMoment(order.requestStatus === 'Declined' ? 'declined' : order.requestStatus === 'Responded' ? 'details' : order.requestStatus === 'Accepted' && acceptedEmailSent && order.paid > 0 ? 'payment' : 'accepted');
    setPreview(null); setSendKey(''); setErrors({});
    history.replaceState(null, '', '/team-workspace/' + id);
  }
  async function copyClientLink() { if (!clientLink) return; try { await navigator.clipboard.writeText(clientLink); setNotice('Private client project link copied. Send it only to this client.'); } catch { setLinkError('Could not copy automatically. Select the link below and copy it.'); } }
  function back() { setSelected(null); setDraft(null); setPreview(null); history.replaceState(null, '', '/team-workspace'); void loadOrders(); }
  async function run(area: 'list' | 'project' | 'payment' | 'message' | 'manage', action: () => Promise<void>) { setBusy(true); setErrors(current => ({ ...current, [area]: '' })); setNotice(''); try { await action(); } catch (e) { const message = (e as Error).message; const target = area === 'payment' && /declin|brief|work starts|project stage/i.test(message) ? 'project' : area; setErrors(current => ({ ...current, [target]: message })); } finally { setBusy(false); } }
  async function quickStage(order: Order, value: string) { await run('list', async () => { await api('orders/' + order.id, 'PATCH', { status: value }); await loadOrders(); setNotice('Stage saved. No email was sent.'); }); }
  async function save() { if (!selected || !draft) return; await run('payment', async () => {
    await api('orders/' + selected.id + '/manage', 'PATCH', draft);
    await openOrder(selected.id); await loadOrders(); setNotice('Saved. No email was sent.');
  }); }
  async function recordPayment() { if (!selected) return; await run('payment', async () => {
    await api('orders/' + selected.id + '/manual-payment', 'POST', { purpose: paymentPurpose, reference: paymentRef.trim() });
    setPaymentRef(''); await openOrder(selected.id); await loadOrders(); setNotice('Payment recorded. Review a client update when you are ready.');
  }); }
  useEffect(() => {
    if (!selected || !draft) return;
    const runId = ++previewRun.current;
    setDraftState('updating'); setDraftError(''); setPreview(null); setSendKey('');
    const timeout = window.setTimeout(async () => {
      try {
        const result = await api('orders/' + selected.id + '/client-update', 'POST', { moment, preview: true, draft });
        if (runId !== previewRun.current) return;
        setPreview({ subject: result.subject, body: result.body }); setSendKey(crypto.randomUUID()); setDraftState('ready');
      } catch (e) { if (runId === previewRun.current) { setDraftState('error'); setDraftError((e as Error).message); } }
    }, 400);
    return () => { window.clearTimeout(timeout); ++previewRun.current; };
  }, [selected?.id, draft, moment]);
  async function sendEmail() { if (!selected || !draft || !sendKey || !preview || draftState !== 'ready') return; await run('message', async () => {
    if (dirty) await api('orders/' + selected.id + '/manage', 'PATCH', draft);
    await api('orders/' + selected.id + '/client-update', 'POST', { moment, preview: false, requestKey: sendKey, edited: preview });
    setPreview(null); setSendKey(''); await openOrder(selected.id); setNotice(`Email sent to ${selected.customer.email}.`);
  }); }
  async function archiveOrder(value: boolean) { if (!selected) return; await run('manage', async () => {
    await api('orders/' + selected.id + '/archive', 'PATCH', { archived: value }); await openOrder(selected.id); await loadOrders(); setNotice(value ? 'Order archived.' : 'Order restored.');
  }); }
  async function deleteOrder() { if (!selected) return; await run('manage', async () => {
    await api('orders/' + selected.id, 'DELETE'); back(); setNotice('Order deleted.');
  }); }
  async function bulkAction(action: 'archive' | 'restore' | 'delete') { if (!selectedIds.length) return; await run('list', async () => {
    const result = await api('orders/bulk', 'POST', { ids: selectedIds, action });
    setSelectedIds([]); await loadOrders(); setNotice(`${result.updated} ${result.updated === 1 ? 'order' : 'orders'} ${action === 'delete' ? 'deleted' : action === 'archive' ? 'archived' : 'restored'}.`);
  }); }
  async function signOut() { await api('session', 'DELETE'); setAuth('signed-out'); setSelected(null); setOrders([]); }
  const dirty = !!selected && !!draft && JSON.stringify(draft) !== JSON.stringify(draftFor(selected));
  const shown = orders.filter(o => !!o.archivedAt === archived && `${o.reference} ${o.customer.name} ${o.customer.email} ${o.customer.business}`.toLowerCase().includes(search.toLowerCase()));
  const allShownSelected = shown.length > 0 && shown.every(o => selectedIds.includes(o.id));
  const selectedOrders = orders.filter(o => selectedIds.includes(o.id));
  if (auth === 'loading') return <main className="team-login"><p>Opening team workspace…</p></main>;
  if (auth === 'signed-out') return <GoogleSignIn clientId={clientId} onSuccess={() => void loadSession()}/>;
  return <div className="team-shell">
    <header className="team-header"><a href="/"><img src="/brand/yoo360-primary-white.webp" alt="Yoo360 home"/></a><button onClick={signOut} className="team-quiet">Sign out</button></header>
    <main className="team-main"><div className="team-title"><div><span className="team-kicker">YOO360 TEAM</span><h1>Order workspace</h1></div>{selected && <button onClick={back} className="team-quiet">← All orders</button>}</div>
      {notice && <div className="team-notice team-toast" role="status"><span>✓ {notice}</span><button type="button" aria-label="Dismiss confirmation" onClick={() => setNotice('')}>×</button></div>}
      {!selected ? <>
        <div className="team-toolbar"><input aria-label="Search orders" placeholder="Search by client or project number" value={search} onChange={e => setSearch(e.target.value)}/><button className="team-quiet" onClick={() => { setSelectedIds([]); setArchived(!archived); }}>{archived ? 'Active orders' : 'Archived orders'}</button><button className="team-quiet" onClick={() => void loadOrders()}>Refresh</button></div>
        <div className="team-bulk"><label><input type="checkbox" checked={allShownSelected} onChange={e => setSelectedIds(e.target.checked ? shown.map(o => o.id) : [])} aria-label="Select all visible orders"/> Select all</label>{selectedIds.length > 0 && <><strong>{selectedIds.length} selected</strong><button className="team-quiet" disabled={busy} onClick={() => void bulkAction(archived ? 'restore' : 'archive')}>{archived ? 'Restore' : 'Archive'}</button><button className="team-trash" type="button" title="Delete selected unpaid orders" aria-label="Delete selected unpaid orders" disabled={busy || selectedOrders.some(o => o.paid > 0)} onClick={() => void bulkAction('delete')}><Trash2 size={18}/></button></>}</div>
        {errors.list && <p className="team-error" role="alert">{errors.list}</p>}
        <div className="team-list" role="table" aria-label="Orders"><div className="team-row team-row-head" role="row"><span></span><span>Project</span><span>Client</span><span>Work</span><span>Payment</span><span>Action</span></div>
          {shown.map(o => <div className="team-row" role="row" key={o.id}>
            <label className="team-select"><input type="checkbox" aria-label={`Select ${o.reference}`} checked={selectedIds.includes(o.id)} onChange={e => setSelectedIds(current => e.target.checked ? [...current, o.id] : current.filter(id => id !== o.id))}/></label>
            <div><button className="team-link-button" onClick={() => void openOrder(o.id)}>{o.reference}</button><small>{o.cart.service === 'logo' ? 'Brand identity' : 'Marketing & Print Design'}{o.test ? ' · TEST' : ''}</small></div>
            <div><strong>{o.customer.name || o.customer.business || 'Client'}</strong><small>{o.customer.email}</small></div>
            <div><select aria-label={`Work stage for ${o.reference}`} disabled={busy || archived} value={stages.some(s => s[0] === o.projectStatus) ? o.projectStatus : ''} onChange={e => void quickStage(o, e.target.value)}><option value="" disabled>{labelStage(o.projectStatus)}</option>{stages.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div>
            <div><strong>{paymentLabel(o)}</strong><small>{money(o.total - o.paid)} remaining</small></div>
            <button className="team-quiet" onClick={() => void openOrder(o.id)}>Edit →</button>
          </div>)}
          {!shown.length && <p className="team-empty">No {archived ? 'archived' : 'active'} orders found.</p>}
        </div>
      </> : draft && <div className="team-detail">
        <section className="team-card team-summary"><div className="team-kicker">{selected.reference}{selected.test ? ' · TEST' : ''}</div><h2>{selected.customer.name || selected.customer.business || 'Design project'}</h2><p>{selected.customer.email}{selected.customer.phone ? ` · ${selected.customer.phone}` : ''}</p>
          <div className="team-client-link"><h3>Client project link</h3><p>Send this private link to the client to view or edit their request.</p><button className="team-quiet" type="button" disabled={!clientLink} onClick={() => void copyClientLink()}>Copy client link</button>{clientLink && <input aria-label="Private client project link" readOnly value={clientLink} onFocus={e => e.currentTarget.select()}/ >}{linkError && <p className="team-error" role="alert">{linkError}</p>}</div><div className="team-metrics"><div><small>Project total</small><strong>{money(selected.total)}</strong></div><div><small>Received</small><strong>{money(selected.paid)}</strong></div><div><small>Remaining</small><strong>{money(selected.total - selected.paid)}</strong></div></div>
          <details><summary>What the client ordered</summary>{orderLines(selected.cart).map((line, i) => <p key={i}>{line.name} · {money(line.cents)}</p>)}</details>
          <details><summary>Client brief · {selected.briefStatus}</summary>{Object.entries(selected.brief).map(([key, answers]) => <div key={key}><h3>{key === 'logo' ? 'Logo' : selected.cart.artworks.find(a => a.id === key)?.name || 'Design'}</h3>{Object.entries(answers).map(([question, answer]) => <p key={question}><b>{question.replace(/([A-Z])/g, ' $1')}:</b> {answer}</p>)}</div>)}</details>
          <section className="team-timeline" aria-label="Project timeline"><h3>Project timeline</h3><ol>{[...selected.activity].reverse().map(a => <li key={a.id}><time dateTime={a.created_at}>{new Date(a.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</time><span>{activityLabel(a.message)}</span></li>)}</ol>{selected.payments.length > 0 && <details><summary>Payment history</summary>{selected.payments.map(p => <p key={p.id}>{p.amount} {p.currency} · {p.status} · {new Date(p.created_at).toLocaleDateString()}</p>)}</details>}</section>
        </section>
        <div className="team-stack">
          <section className="team-card"><span className="team-section-label">01 / CLIENT</span><h2>Client information</h2><p>Who placed this request and where we can reach them.</p>
            <div className="team-grid"><label>Name<input value={draft.customer.name} onChange={e => setDraft({ ...draft, customer: { ...draft.customer, name: e.target.value } })}/></label><label>Email<input type="email" value={draft.customer.email} onChange={e => setDraft({ ...draft, customer: { ...draft.customer, email: e.target.value } })}/></label><label>Phone<input value={draft.customer.phone} onChange={e => setDraft({ ...draft, customer: { ...draft.customer, phone: e.target.value } })}/></label><label>Business<input value={draft.customer.business} onChange={e => setDraft({ ...draft, customer: { ...draft.customer, business: e.target.value } })}/></label></div>
          </section>
          <section className="team-card"><span className="team-section-label">02 / PROJECT</span><h2>Project progress</h2><p>Set the decision and the stage the client will see.</p>
            <div className="team-grid"><label>Request decision<select value={draft.requestStatus} onChange={e => { const status = e.target.value as Decision; setDraft({ ...draft, requestStatus: status }); if (status === 'Responded') setMoment('details'); if (status === 'Accepted') setMoment('accepted'); if (status === 'Declined') setMoment('declined'); }}>{(['New', 'Responded', 'Accepted', 'Declined'] as Decision[]).map(s => <option value={s} key={s}>{s === 'Responded' ? 'Need details' : s}</option>)}</select></label><label>Work stage<select value={draft.projectStatus} onChange={e => setDraft({ ...draft, projectStatus: e.target.value })}>{!stages.some(s => s[0] === draft.projectStatus) && <option value={draft.projectStatus}>{draft.projectStatus === 'Awaiting final balance' ? 'Ready, balance due' : 'Not started'}</option>}{stages.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label></div>
            {errors.project && <p className="team-error" role="alert">{errors.project}</p>}
          </section>
          {selected.paid === 0 && selected.paymentMode === 'manual' && !selected.test && ['New', 'Responded'].includes(selected.requestStatus) && ['Awaiting payment', 'Awaiting project brief'].includes(selected.projectStatus) && <section className="team-card team-selection"><span className="team-section-label">03 / ORDER SELECTION</span><h2>Services requested</h2><p>Update the selection the client meant to order. This recalculates the listed price; you can adjust the agreed price below.</p>
            <label>Service<select value={draft.cart.service} onChange={e => { const cart = { ...draft.cart, catalogVersion: CATALOG_VERSION, service: e.target.value as Cart['service'] }; setDraft({ ...draft, cart, totalCents: price(cart) }); }}><option value="logo">Logo & Brand Visual Identity</option><option value="graphics">Marketing & Print Design</option></select></label>
            {draft.cart.service === 'logo' ? <><label>Package<select value={draft.cart.mode} onChange={e => { const cart = { ...draft.cart, catalogVersion: CATALOG_VERSION, mode: e.target.value as Cart['mode'] }; setDraft({ ...draft, cart, totalCents: price(cart) }); }}><option value="basic">Basic logo</option><option value="bundle">Complete visual identity</option></select></label>{draft.cart.mode === 'basic' && <div className="team-options">{ADDONS.map(addon => <label key={addon.id}><input type="checkbox" checked={draft.cart.addons.includes(addon.id)} onChange={e => { const cart = { ...draft.cart, catalogVersion: CATALOG_VERSION, addons: e.target.checked ? [...draft.cart.addons, addon.id] : draft.cart.addons.filter(id => id !== addon.id) }; setDraft({ ...draft, cart, totalCents: price(cart) }); }}/>{addon.name} · {money(addon.cents)}</label>)}</div>}</> : <div className="team-artworks">{draft.cart.artworks.map((artwork, i) => <div className="team-artwork" key={artwork.id}><label>Design project {i + 1}<input value={artwork.name} onChange={e => { const cart = { ...draft.cart, catalogVersion: CATALOG_VERSION, artworks: draft.cart.artworks.map(a => a.id === artwork.id ? { ...a, name: e.target.value } : a) }; setDraft({ ...draft, cart, totalCents: price(cart) }); }}/></label>{(['print', 'message', 'priority'] as const).map(key => <label key={key}><input type="checkbox" checked={artwork[key]} onChange={e => { const cart = { ...draft.cart, catalogVersion: CATALOG_VERSION, artworks: draft.cart.artworks.map(a => a.id === artwork.id ? { ...a, [key]: e.target.checked } : a) }; setDraft({ ...draft, cart, totalCents: price(cart) }); }}/>{key === 'print' ? 'Print files' : key === 'message' ? 'Ad copy' : 'Rush delivery'}</label>)}{draft.cart.artworks.length > 1 && <button className="team-quiet" onClick={() => { const cart = { ...draft.cart, catalogVersion: CATALOG_VERSION, artworks: draft.cart.artworks.filter(a => a.id !== artwork.id) }; setDraft({ ...draft, cart, totalCents: price(cart) }); }}>Remove</button>}</div>)}<button className="team-quiet" disabled={draft.cart.artworks.length >= 100} onClick={() => { const cart = { ...draft.cart, catalogVersion: CATALOG_VERSION, artworks: [...draft.cart.artworks, newArtwork()] }; setDraft({ ...draft, cart, totalCents: price(cart) }); }}>Add design project</button></div>}
            <strong>Listed total: {money(price(draft.cart))}</strong><p className="team-hint">Save below to record the changes. The client project link will then show the new selection.</p>
          </section>}
          <section className="team-card"><span className="team-section-label">04 / PRICE AND PAYMENT</span><h2>Price and payment</h2><p>What this project costs and how the client can pay.</p>
            <div className="team-metrics"><div><small>Total</small><strong>{money(draft.totalCents)}</strong></div><div><small>Received</small><strong>{money(selected.paid)}</strong></div><div><small>Remaining</small><strong>{money(Math.max(0, draft.totalCents - selected.paid))}</strong></div></div>
            <label>Project price in USD<input type="number" min="1" step="0.01" value={(draft.totalCents / 100).toFixed(2)} onChange={e => setDraft({ ...draft, totalCents: Math.round(Number(e.target.value) * 100) })} disabled={selected.paid > 0 || selected.test || selected.paymentMode !== 'manual'}/></label>
            <label>Payment method and verified account details<textarea rows={3} value={draft.paymentInstructions} onChange={e => setDraft({ ...draft, paymentInstructions: e.target.value })} placeholder="For example: Send via Mobile Money to…"/></label>
            <button className="team-quiet" disabled={busy || !dirty} onClick={() => void save()}>Save without emailing</button>
            {selected.paymentMode === 'manual' && !selected.test && selected.paid < selected.total && <div className="team-record-payment"><h3>Record a payment</h3><p>Check your account first. Recording a payment does not email the client.</p><div className="team-grid"><label>Amount<select value={paymentPurpose} onChange={e => setPaymentPurpose(e.target.value as typeof paymentPurpose)}>{selected.paid === 0 && <><option value="initial">Deposit · {money(selected.due)}</option><option value="full">Full amount · {money(selected.total)}</option></>}{selected.paid >= selected.due && <option value="balance">Remaining · {money(selected.total - selected.paid)}</option>}</select></label><label>Transaction reference<input value={paymentRef} onChange={e => setPaymentRef(e.target.value)}/></label></div><button className="team-quiet" disabled={busy || paymentRef.trim().length < 4} onClick={() => void recordPayment()}>Record verified payment</button></div>}
            {errors.payment && <p className="team-error" role="alert">{errors.payment}</p>}
          </section>
          <section className="team-card team-email"><span className="team-section-label">05 / CLIENT MESSAGE</span><h2>What the client will receive</h2><p>This draft updates as you change the project. You can edit it before sending.</p><label>What’s the news?<select value={moment} onChange={e => setMoment(e.target.value as Moment)}>{moments.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</select></label>
            {draftState === 'updating' && <p role="status">Updating the email draft…</p>}
            {draftState === 'error' && <p className="team-draft-error" role="status">{draftError}</p>}
            {preview && <div className="team-preview"><label>Email subject<input aria-label="Email subject" value={preview.subject} maxLength={150} onChange={e => setPreview({ ...preview, subject: e.target.value })}/></label><label>Email message<textarea aria-label="Email message" rows={12} maxLength={4000} value={preview.body} onChange={e => setPreview({ ...preview, body: e.target.value })}/></label><small>The private project link appears in the draft when requesting details, and every email includes a project button.</small>{moment === 'details' && preview && needsQuestion(preview.body) && <p className="team-draft-error" role="alert">Replace the bracketed instruction with the exact question you want to ask this client.</p>}</div>}
            <div className="team-actions"><button className="team-primary" disabled={busy || !preview || draftState !== 'ready' || preview.subject.trim().length < 3 || preview.body.trim().length < 10 || (moment === 'details' && needsQuestion(preview.body))} onClick={() => void sendEmail()}>Confirm and send this email</button></div><small>We save your changes first. Nothing is emailed until you confirm.</small>
            {errors.message && <p className="team-error" role="alert">{errors.message}</p>}
          </section>
          <section className="team-card team-manage"><h2>Manage order</h2><div className="team-actions"><button className="team-quiet" disabled={busy} onClick={() => void archiveOrder(!selected.archivedAt)}>{selected.archivedAt ? 'Restore order' : 'Archive order'}</button>{selected.paid === 0 && <button className="team-trash" type="button" title="Delete this unpaid order" aria-label="Delete this unpaid order" disabled={busy} onClick={() => void deleteOrder()}><Trash2 size={18}/></button>}</div>{errors.manage && <p className="team-error" role="alert">{errors.manage}</p>}</section>
        </div>
      </div>}
    </main>
  </div>;
}
