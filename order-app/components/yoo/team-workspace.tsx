import { useEffect, useRef, useState } from 'react';
import { orderApi } from '@/lib/routes';
import { money, orderLines, type Cart } from '@/lib/catalog';
import './team-workspace.css';

type Decision = 'New' | 'Responded' | 'Accepted' | 'Declined';
type Moment = 'accepted' | 'declined' | 'payment' | 'review' | 'delivered';
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
type Draft = { requestStatus: Decision; requestNote: string; projectStatus: string; totalCents: number; paymentInstructions: string; deliveryLink: string; clientNote: string; customer: Customer };
const stages = [
  ['Ready to start', 'Not started'], ['In progress', 'In progress'],
  ['Awaiting client feedback', 'Ready for review'], ['Completed', 'Delivered'],
] as const;
const moments: { value: Moment; label: string }[] = [
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
  requestStatus: o.requestStatus || 'New', requestNote: o.requestNote || '', projectStatus: o.projectStatus,
  totalCents: o.total, paymentInstructions: o.paymentInstructions || '', deliveryLink: o.deliveryLink || '', clientNote: o.clientNote || '',
  customer: { name: o.customer.name || '', email: o.customer.email || '', phone: o.customer.phone || '', business: o.customer.business || '' },
}; }
function labelStage(stage: string) { return stages.find(s => s[0] === stage)?.[1] || 'Not started'; }
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
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [moment, setMoment] = useState<Moment>('accepted');
  const [preview, setPreview] = useState<{ subject: string; text: string } | null>(null);
  const [sendKey, setSendKey] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentPurpose, setPaymentPurpose] = useState<'initial' | 'full' | 'balance'>('initial');
  const [deleteInput, setDeleteInput] = useState('');
  async function loadOrders() { const result = await api('orders'); setOrders(result.orders); }
  async function loadSession() {
    try { const result = await api('session'); setClientId(result.clientId || ''); setAuth(result.signedIn ? 'signed-in' : 'signed-out');
      if (result.signedIn) { await loadOrders(); const id = location.pathname.split('/')[2]; if (/^[0-9a-f-]{36}$/.test(id || '')) await openOrder(id); }
    } catch (e) { setAuth('signed-out'); setError((e as Error).message); }
  }
  useEffect(() => { void loadSession(); }, []);
  async function openOrder(id: string) {
    const order: Order = await api('orders/' + id);
    setSelected(order); setDraft(draftFor(order)); setPaymentPurpose(order.paid >= order.due ? 'balance' : 'initial');
    const acceptedEmailSent = order.activity?.some(a => a.message === 'Client emailed: accepted');
    setMoment(order.requestStatus === 'Declined' ? 'declined' : order.requestStatus === 'Accepted' && acceptedEmailSent && order.paid > 0 ? 'payment' : 'accepted');
    setPreview(null); setSendKey(''); setDeleteInput(''); setError('');
    history.replaceState(null, '', '/team-workspace/' + id);
  }
  function back() { setSelected(null); setDraft(null); setPreview(null); history.replaceState(null, '', '/team-workspace'); void loadOrders(); }
  async function run(action: () => Promise<void>) { setBusy(true); setError(''); setNotice(''); try { await action(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } }
  async function quickStage(order: Order, value: string) { await run(async () => { await api('orders/' + order.id, 'PATCH', { status: value }); await loadOrders(); setNotice('Stage saved. No email was sent.'); }); }
  async function save() { if (!selected || !draft) return; await run(async () => {
    await api('orders/' + selected.id + '/manage', 'PATCH', draft);
    await openOrder(selected.id); await loadOrders(); setNotice('Saved. No email was sent.');
  }); }
  async function recordPayment() { if (!selected) return; await run(async () => {
    await api('orders/' + selected.id + '/manual-payment', 'POST', { purpose: paymentPurpose, reference: paymentRef.trim() });
    setPaymentRef(''); await openOrder(selected.id); await loadOrders(); setNotice('Payment recorded. Review a client update when you are ready.');
  }); }
  async function previewEmail() { if (!selected) return; await run(async () => {
    const result = await api('orders/' + selected.id + '/client-update', 'POST', { moment, preview: true });
    setPreview(result); setSendKey(crypto.randomUUID());
  }); }
  async function sendEmail() { if (!selected || !sendKey || !preview) return; await run(async () => {
    await api('orders/' + selected.id + '/client-update', 'POST', { moment, preview: false, requestKey: sendKey });
    setPreview(null); setSendKey(''); await openOrder(selected.id); setNotice('One client update sent.');
  }); }
  async function archiveOrder(value: boolean) { if (!selected) return; await run(async () => {
    await api('orders/' + selected.id + '/archive', 'PATCH', { archived: value }); await openOrder(selected.id); await loadOrders(); setNotice(value ? 'Order archived.' : 'Order restored.');
  }); }
  async function deleteOrder() { if (!selected || deleteInput !== selected.reference) return; await run(async () => {
    await api('orders/' + selected.id, 'DELETE', { confirmReference: deleteInput }); back(); setNotice('Unpaid order permanently deleted.');
  }); }
  async function signOut() { await api('session', 'DELETE'); setAuth('signed-out'); setSelected(null); setOrders([]); }
  const dirty = !!selected && !!draft && JSON.stringify(draft) !== JSON.stringify(draftFor(selected));
  const shown = orders.filter(o => !!o.archivedAt === archived && `${o.reference} ${o.customer.name} ${o.customer.email} ${o.customer.business}`.toLowerCase().includes(search.toLowerCase()));
  if (auth === 'loading') return <main className="team-login"><p>Opening team workspace…</p></main>;
  if (auth === 'signed-out') return <GoogleSignIn clientId={clientId} onSuccess={() => void loadSession()}/>;
  return <div className="team-shell">
    <header className="team-header"><a href="/"><img src="/brand/yoo360-primary-white.webp" alt="Yoo360 home"/></a><button onClick={signOut} className="team-quiet">Sign out</button></header>
    <main className="team-main"><div className="team-title"><div><span className="team-kicker">YOO360 TEAM</span><h1>Order workspace</h1></div>{selected && <button onClick={back} className="team-quiet">← All orders</button>}</div>
      {error && <p className="team-error" role="alert">{error}</p>}{notice && <p className="team-notice" role="status">{notice}</p>}
      {!selected ? <>
        <div className="team-toolbar"><input aria-label="Search orders" placeholder="Search by client or project number" value={search} onChange={e => setSearch(e.target.value)}/><button className="team-quiet" onClick={() => setArchived(!archived)}>{archived ? 'Active orders' : 'Archived orders'}</button><button className="team-quiet" onClick={() => void loadOrders()}>Refresh</button></div>
        <div className="team-list" role="table" aria-label="Orders"><div className="team-row team-row-head" role="row"><span>Project</span><span>Client</span><span>Work</span><span>Payment</span><span>Action</span></div>
          {shown.map(o => <div className="team-row" role="row" key={o.id}>
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
          <div className="team-metrics"><div><small>Project total</small><strong>{money(selected.total)}</strong></div><div><small>Received</small><strong>{money(selected.paid)}</strong></div><div><small>Remaining</small><strong>{money(selected.total - selected.paid)}</strong></div></div>
          <details><summary>What the client ordered</summary>{orderLines(selected.cart).map((line, i) => <p key={i}>{line.name} · {money(line.cents)}</p>)}</details>
          <details><summary>Client brief · {selected.briefStatus}</summary>{Object.entries(selected.brief).map(([key, answers]) => <div key={key}><h3>{key === 'logo' ? 'Logo' : selected.cart.artworks.find(a => a.id === key)?.name || 'Design'}</h3>{Object.entries(answers).map(([question, answer]) => <p key={question}><b>{question.replace(/([A-Z])/g, ' $1')}:</b> {answer}</p>)}</div>)}</details>
          <details><summary>Payment history and activity</summary>{selected.payments.map(p => <p key={p.id}>{p.amount} {p.currency} · {p.status} · {new Date(p.created_at).toLocaleDateString()}</p>)}{selected.activity.map(a => <p key={a.id}>{a.message}</p>)}</details>
        </section>
        <div className="team-stack">
          <section className="team-card"><h2>Project details</h2><p>Save changes here. The client won’t be emailed until you review and send an update.</p>
            <div className="team-grid"><label>Name<input value={draft.customer.name} onChange={e => setDraft({ ...draft, customer: { ...draft.customer, name: e.target.value } })}/></label><label>Email<input type="email" value={draft.customer.email} onChange={e => setDraft({ ...draft, customer: { ...draft.customer, email: e.target.value } })}/></label><label>Phone<input value={draft.customer.phone} onChange={e => setDraft({ ...draft, customer: { ...draft.customer, phone: e.target.value } })}/></label><label>Business<input value={draft.customer.business} onChange={e => setDraft({ ...draft, customer: { ...draft.customer, business: e.target.value } })}/></label></div>
            <div className="team-grid"><label>Request decision<select value={draft.requestStatus} onChange={e => setDraft({ ...draft, requestStatus: e.target.value as Decision })}>{(['New', 'Responded', 'Accepted', 'Declined'] as Decision[]).map(s => <option key={s}>{s}</option>)}</select></label><label>Work stage<select value={draft.projectStatus} onChange={e => setDraft({ ...draft, projectStatus: e.target.value })}>{['Awaiting payment', 'Awaiting project brief', ...stages.map(s => s[0]), 'Awaiting final balance'].map(s => <option key={s}>{s}</option>)}</select></label></div>
            <label>Project price in USD<input type="number" min="1" step="0.01" value={(draft.totalCents / 100).toFixed(2)} onChange={e => setDraft({ ...draft, totalCents: Math.round(Number(e.target.value) * 100) })} disabled={selected.paid > 0 || selected.test || selected.paymentMode !== 'manual'}/></label>
            <label>Payment method and verified account details<textarea rows={3} value={draft.paymentInstructions} onChange={e => setDraft({ ...draft, paymentInstructions: e.target.value })} placeholder="For example: Send via Mobile Money to…"/></label>
            <label>Note to client or reason if declined<textarea rows={2} value={draft.requestNote} onChange={e => setDraft({ ...draft, requestNote: e.target.value })}/></label>
            <label>Final files link (optional)<input type="url" value={draft.deliveryLink} onChange={e => setDraft({ ...draft, deliveryLink: e.target.value })} placeholder="https://drive.google.com/…"/></label>
            <label>Extra note for the next email (optional)<textarea rows={2} value={draft.clientNote} onChange={e => setDraft({ ...draft, clientNote: e.target.value })}/></label>
            <button className="team-primary" disabled={busy || !dirty} onClick={() => void save()}>Save changes</button>
          </section>
          {selected.paymentMode === 'manual' && !selected.test && selected.paid < selected.total && <section className="team-card"><h2>Record a payment</h2><p>Check your account and receipt first. This action records money; it does not email the client.</p><div className="team-grid"><label>Amount<select value={paymentPurpose} onChange={e => setPaymentPurpose(e.target.value as typeof paymentPurpose)}>{selected.paid === 0 && <><option value="initial">Deposit · {money(selected.due)}</option><option value="full">Full amount · {money(selected.total)}</option></>}{selected.paid >= selected.due && <option value="balance">Remaining · {money(selected.total - selected.paid)}</option>}</select></label><label>Transaction reference<input value={paymentRef} onChange={e => setPaymentRef(e.target.value)}/></label></div><button className="team-quiet" disabled={busy || paymentRef.trim().length < 4} onClick={() => void recordPayment()}>Record verified payment</button></section>}
          <section className="team-card"><h2>Tell the client</h2><p>One clear update after you’ve saved the details that matter.</p><label>What’s the news?<select value={moment} onChange={e => { setMoment(e.target.value as Moment); setPreview(null); }}>{moments.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</select></label>
            {preview && <div className="team-preview"><strong>{preview.subject}</strong><p>{preview.text}</p></div>}
            <div className="team-actions"><button className="team-quiet" disabled={busy || dirty} onClick={() => void previewEmail()}>Review client email</button><button className="team-primary" disabled={busy || !preview || dirty} onClick={() => void sendEmail()}>Confirm and send one email</button></div>{dirty && <small>Save your changes before reviewing the email.</small>}
          </section>
          <section className="team-card team-manage"><h2>Manage order</h2><button className="team-quiet" disabled={busy} onClick={() => void archiveOrder(!selected.archivedAt)}>{selected.archivedAt ? 'Restore order' : 'Archive order'}</button>{selected.paid === 0 && <details><summary>Delete an unpaid order permanently</summary><p>Use this for a test or duplicate. This removes the order, brief and files. It cannot be undone.</p><label>Type {selected.reference} to confirm<input value={deleteInput} onChange={e => setDeleteInput(e.target.value)}/></label><button className="team-delete" disabled={busy || deleteInput !== selected.reference} onClick={() => void deleteOrder()}>Delete permanently</button></details>}</section>
        </div>
      </div>}
    </main>
  </div>;
}
