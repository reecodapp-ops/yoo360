import type Lenis from 'lenis';

type LenisLoader = () => Promise<{ default: typeof Lenis }>;
const findShortcut = (event: KeyboardEvent) =>
    ((event.ctrlKey || event.metaKey) && ['f', 'g'].includes(event.key.toLowerCase())) || event.key === 'F3';

/** Touch, keyboard scrolling, and reduced motion keep the browser in control. */
export function mountDesktopScroll(loadLenis: LenisLoader = () => import('lenis')) {
    const desktop = window.matchMedia('(min-width: 761px) and (hover: hover) and (pointer: fine)');
    const touch = window.matchMedia('(any-pointer: coarse)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let instance: Lenis | undefined;
    let disposed = false, generation = 0, nativeFind = false;

    async function configure() {
        const current = ++generation;
        instance?.destroy();
        instance = undefined;
        if (disposed || nativeFind || !desktop.matches || touch.matches || navigator.maxTouchPoints > 0 || reduced.matches) return;
        try {
            const { default: SmoothScroll } = await loadLenis();
            if (disposed || current !== generation) return;
            instance = new SmoothScroll({
                lerp: 0.12,
                smoothWheel: true,
                syncTouch: false,
                autoRaf: true,
                autoResize: true,
                anchors: true,
                stopInertiaOnNavigate: true,
                prevent: node => node.matches('textarea, select, [data-lenis-prevent]'),
            });
        } catch {
            // An unavailable optional animation library must never block native scrolling.
        }
    }

    function onKey(event: KeyboardEvent) {
        if (!findShortcut(event)) return;
        // Browser search can jump to any match. Leave it fully native for this page.
        nativeFind = true;
        void configure();
    }
    function onFocus() { instance?.scrollTo(window.scrollY, { immediate: true }); }
    const media = [desktop, touch, reduced];
    media.forEach(query => query.addEventListener('change', configure));
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('focusin', onFocus);
    void configure();
    return () => {
        disposed = true;
        ++generation;
        instance?.destroy();
        media.forEach(query => query.removeEventListener('change', configure));
        document.removeEventListener('keydown', onKey, true);
        document.removeEventListener('focusin', onFocus);
    };
}

/** One-shot entrances; content stays readable without JavaScript or Observer support. */
export function mountViewportReveals() {
    if (!('IntersectionObserver' in window) || !('MutationObserver' in window)) return () => {};
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const seen = new WeakSet<HTMLElement>();
    let nativeFind = false;
    const reveal = (element: HTMLElement, animate = true) => {
        element.dataset.reveal = animate && !reduced.matches && !nativeFind ? 'visible' : 'done';
        observer.unobserve(element);
    };
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) reveal(entry.target as HTMLElement);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -24px 0px' });

    function register(root: Document | HTMLElement) {
        const elements = [...root.querySelectorAll<HTMLElement>('[data-reveal]')];
        if (root instanceof HTMLElement && root.hasAttribute('data-reveal')) elements.unshift(root);
        elements.forEach(element => {
            if (seen.has(element)) return;
            seen.add(element);
            if (reduced.matches || nativeFind || element.contains(document.activeElement) || document.activeElement?.closest('[data-reveal]') === element) {
                reveal(element, false);
            } else {
                element.dataset.reveal = 'pending';
                observer.observe(element);
            }
        });
    }
    function revealAll() {
        document.querySelectorAll<HTMLElement>('[data-reveal="pending"], [data-reveal="visible"]').forEach(element => reveal(element, false));
    }
    function onPreference() { if (reduced.matches) revealAll(); }
    function onKey(event: KeyboardEvent) { if (findShortcut(event)) { nativeFind = true; revealAll(); } }
    function onFocus(event: FocusEvent) {
        let element = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-reveal]') : null;
        while (element) { reveal(element, false); element = element.parentElement?.closest<HTMLElement>('[data-reveal]') || null; }
    }
    function onAnimationEnd(event: AnimationEvent) {
        if (event.animationName === 'viewport-enter' && event.target instanceof HTMLElement) event.target.dataset.reveal = 'done';
    }
    const mutations = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
        if (node instanceof HTMLElement) register(node);
    })));
    register(document);
    mutations.observe(document.body, { childList: true, subtree: true });
    reduced.addEventListener('change', onPreference);
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('focusin', onFocus);
    document.addEventListener('animationend', onAnimationEnd);
    return () => {
        mutations.disconnect();
        observer.disconnect();
        revealAll();
        reduced.removeEventListener('change', onPreference);
        document.removeEventListener('keydown', onKey, true);
        document.removeEventListener('focusin', onFocus);
        document.removeEventListener('animationend', onAnimationEnd);
    };
}
