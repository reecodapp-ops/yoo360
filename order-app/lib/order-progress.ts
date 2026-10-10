import type { Cart, Customer } from './catalog';

export type OrderProgress = { id: string; fingerprint: string; briefUnlocked: boolean };

function canonical(value: unknown): unknown {
    if (typeof value === 'string') return value.trim();
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonical(item)]));
    return value;
}

export function checkoutFingerprint(cart: Cart, customer: Customer, share: number, normalizedPhone: string): string {
    return JSON.stringify(canonical({ cart, customer: { ...customer, phone: normalizedPhone }, share }));
}

export function parseOrderProgress(raw: string | null): OrderProgress | null {
    try {
        const value = JSON.parse(raw || 'null');
        if (!value || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.id) || typeof value.fingerprint !== 'string' || typeof value.briefUnlocked !== 'boolean') return null;
        return { id: value.id, fingerprint: value.fingerprint, briefUnlocked: value.briefUnlocked };
    } catch { return null; }
}

export function matchingOrderProgress(progress: OrderProgress | null, fingerprint: string): OrderProgress | null {
    return progress?.fingerprint === fingerprint ? progress : null;
}
