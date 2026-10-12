import type { Cart } from './catalog';

// Explicit package links start a clean selection; ordinary navigation resumes the draft.
export function cartForOrderEntry(cart: Cart, screen: string, search: string, freshCart: () => Cart): Cart {
    const current = freshCart();
    const upgraded = cart.catalogVersion === current.catalogVersion ? cart : { ...cart, catalogVersion: current.catalogVersion };
    const mode = new URLSearchParams(search).get('mode');
    if (screen === 'logo' && (mode === 'basic' || mode === 'bundle'))
        return { ...current, service: 'logo', mode };
    return screen === 'logo' || screen === 'graphics' ? { ...upgraded, service: screen } : upgraded;
}
