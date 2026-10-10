import type { Cart } from './catalog';

// Explicit package links start a clean selection; ordinary navigation resumes the draft.
export function cartForOrderEntry(cart: Cart, screen: string, search: string, freshCart: () => Cart): Cart {
    const mode = new URLSearchParams(search).get('mode');
    if (screen === 'logo' && (mode === 'basic' || mode === 'bundle'))
        return { ...freshCart(), service: 'logo', mode };
    return screen === 'logo' || screen === 'graphics' ? { ...cart, service: screen } : cart;
}
