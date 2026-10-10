export type PaymentOrder = {
    paymentMode: string;
    paymentStatus: string;
    paid: number;
    due: number;
    payments: { purpose: string; promptAccepted?: boolean }[];
};

type PaymentApi = (path: string, method?: string, body?: unknown, id?: string) => Promise<any>;

export function hasAcceptedPrompt(order: PaymentOrder) {
    return order.payments.filter(payment => payment.purpose === 'initial').at(-1)?.promptAccepted === true;
}

export async function checkInitialPayment(api: PaymentApi, id: string, mode: string) {
    // Only the explicitly disclosed demo may simulate completion. Real and
    // sandbox orders can only change state through authenticated verification.
    await api(`orders/${id}/${mode === 'demo' ? 'demo' : 'verify'}`, 'POST', mode === 'demo' ? { status: 'COMPLETED' } : {}, id);
    return api(`orders/${id}`, 'GET', undefined, id);
}

export async function retryInitialPayment(api: PaymentApi, id: string, approveQuote: (quote: any) => boolean | Promise<boolean>) {
    let order: PaymentOrder = await api(`orders/${id}`, 'GET', undefined, id);
    if (order.paid >= order.due) return { order, message: '' };
    if (order.paymentMode !== 'demo' && order.paymentStatus === 'PENDING') {
        await api(`orders/${id}/verify`, 'POST', {}, id);
        order = await api(`orders/${id}`, 'GET', undefined, id);
        if (order.paid >= order.due) return { order, message: '' };
        if (order.paymentStatus === 'PENDING' && hasAcceptedPrompt(order)) {
            return { order, message: 'A payment request is already active. Please approve it on your phone, or wait for it to expire before requesting another.' };
        }
    }
    let quoteId;
    if (order.paymentMode !== 'demo' && order.paymentStatus !== 'PENDING') {
        const quote = await api(`orders/${id}/payment-quote`, 'POST', {}, id);
        if (quote.completed) return { order: await api(`orders/${id}`, 'GET', undefined, id), message: '' };
        if (!await approveQuote(quote)) return { order, message: '' };
        quoteId = quote.quoteId;
    }
    // The server reuses the existing transaction ID for an uncertain request.
    await api(`orders/${id}/payment`, 'POST', { purpose: 'initial', quoteId }, id);
    return {
        order: await api(`orders/${id}`, 'GET', undefined, id),
        message: order.paymentMode === 'demo' ? 'Preview request reset. No prompt was sent and no money collected.' : '',
    };
}
