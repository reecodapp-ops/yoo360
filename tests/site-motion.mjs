import assert from 'node:assert/strict';
import { mountDesktopScroll, mountViewportReveals } from '../order-app/lib/site-motion.ts';

class Events {
    listeners = new Map();
    addEventListener(name, listener) { if (!this.listeners.has(name)) this.listeners.set(name, new Set()); this.listeners.get(name).add(listener); }
    removeEventListener(name, listener) { this.listeners.get(name)?.delete(listener); }
    emit(name, event = {}) { for (const listener of [...(this.listeners.get(name) || [])]) listener(event); }
    get count() { return [...this.listeners.values()].reduce((total, listeners) => total + listeners.size, 0); }
}
class Media extends Events {
    constructor(matches) { super(); this.matches = matches; }
    set(matches) { this.matches = matches; this.emit('change'); }
}
class Element {
    constructor(parent = null, reveal = true) { this.parentElement = parent; this.dataset = reveal ? { reveal: '' } : {}; }
    hasAttribute(name) { return name === 'data-reveal' && Object.hasOwn(this.dataset, 'reveal'); }
    contains(node) { while (node) { if (node === this) return true; node = node.parentElement; } return false; }
    closest() { let node = this; while (node) { if (node.hasAttribute('data-reveal')) return node; node = node.parentElement; } return null; }
    querySelectorAll() { return document.nodes.filter(node => node !== this && this.contains(node) && node.hasAttribute('data-reveal')); }
}
const tick = async () => { await Promise.resolve(); await Promise.resolve(); };
let checks = 0;
const passed = label => { ++checks; console.log('PASS ' + label); };

function environment({ desktop = true, coarse = false, reduced = false, touchPoints = 0 } = {}) {
    const media = { desktop: new Media(desktop), coarse: new Media(coarse), reduced: new Media(reduced) };
    const doc = new Events();
    doc.nodes = [];
    doc.body = new Element(null, false);
    doc.activeElement = doc.body;
    doc.querySelectorAll = selector => doc.nodes.filter(node => node.hasAttribute('data-reveal') && (!selector.includes('="') || ['pending', 'visible'].includes(node.dataset.reveal)));
    class Intersection {
        static instances = [];
        observed = new Set();
        constructor(callback, options) { this.callback = callback; this.options = options; Intersection.instances.push(this); }
        observe(node) { this.observed.add(node); }
        unobserve(node) { this.observed.delete(node); }
        disconnect() { this.disconnected = true; this.observed.clear(); }
        intersect(node) { this.callback([{ target: node, isIntersecting: true }]); }
    }
    class Mutation {
        static instances = [];
        constructor(callback) { this.callback = callback; Mutation.instances.push(this); }
        observe() {}
        disconnect() { this.disconnected = true; }
        add(node) { this.callback([{ addedNodes: [node] }]); }
    }
    Object.defineProperty(globalThis, 'navigator', { value: { maxTouchPoints: touchPoints }, configurable: true });
    Object.assign(globalThis, {
        document: doc, HTMLElement: Element, IntersectionObserver: Intersection, MutationObserver: Mutation,
        window: { scrollY: 420, IntersectionObserver: Intersection, MutationObserver: Mutation, matchMedia(query) { return query.includes('reduced-motion') ? media.reduced : query.includes('any-pointer') ? media.coarse : media.desktop; } },
    });
    const instances = [];
    class Smooth {
        constructor(options) { this.options = options; instances.push(this); }
        destroy() { this.destroyed = true; }
        scrollTo(...args) { this.scroll = args; }
    }
    return { media, doc, instances, Smooth, load: async () => ({ default: Smooth }), Intersection, Mutation, add(parent = doc.body, reveal = true) { const node = new Element(parent, reveal); doc.nodes.push(node); return node; } };
}

{
    const env = environment(); const stop = mountDesktopScroll(env.load); await tick();
    assert.equal(env.instances.length, 1);
    assert.equal(env.instances[0].options.syncTouch, false);
    assert.equal(env.instances[0].options.anchors, true);
    env.doc.emit('focusin'); assert.deepEqual(env.instances[0].scroll, [420, { immediate: true }]);
    env.media.reduced.set(true); assert.ok(env.instances[0].destroyed);
    env.media.reduced.set(false); await tick(); assert.equal(env.instances.length, 2);
    stop(); assert.ok(env.instances[1].destroyed); assert.equal(env.doc.count, 0);
    assert.ok(Object.values(env.media).every(query => query.count === 0));
    passed('Desktop smoothing responds to reduced-motion changes; focus and cleanup release inertia and listeners');
}
for (const settings of [{ desktop: false }, { coarse: true }, { touchPoints: 1 }, { reduced: true }]) {
    const env = environment(settings); let loads = 0;
    const stop = mountDesktopScroll(async () => { ++loads; return { default: env.Smooth }; }); await tick();
    assert.equal(loads, 0); assert.equal(env.instances.length, 0); stop();
}
passed('Mobile, coarse pointers, touch-capable laptops and reduced motion never load Lenis');
{
    const env = environment(); let resolve;
    const stop = mountDesktopScroll(() => new Promise(done => { resolve = done; }));
    env.media.coarse.set(true); resolve({ default: env.Smooth }); await tick();
    assert.equal(env.instances.length, 0); stop();
    passed('A desktop-to-touch change cancels an in-flight library load');
}
{
    const env = environment(); let resolve;
    const stop = mountDesktopScroll(() => new Promise(done => { resolve = done; }));
    stop(); resolve({ default: env.Smooth }); await tick(); assert.equal(env.instances.length, 0);
    passed('Unmounting during a library load cannot leave a scroll instance running');
}
{
    const env = environment(); const stop = mountDesktopScroll(async () => { throw new Error('offline'); }); await tick();
    assert.equal(env.instances.length, 0); stop();
    passed('A failed library load preserves native scrolling');
}
{
    const env = environment(); const stop = mountDesktopScroll(env.load); await tick();
    env.doc.emit('keydown', { ctrlKey: true, key: 'f' }); assert.ok(env.instances[0].destroyed);
    env.media.desktop.set(false); env.media.desktop.set(true); await tick();
    assert.equal(env.instances.length, 1); stop();
    passed('Find in Page remains native after subsequent viewport changes');
}
{
    const env = environment(); const first = env.add(), second = env.add(); const stop = mountViewportReveals();
    const observer = env.Intersection.instances[0]; assert.equal(first.dataset.reveal, 'pending');
    observer.intersect(first); assert.equal(first.dataset.reveal, 'visible'); assert.ok(!observer.observed.has(first));
    env.doc.emit('animationend', { animationName: 'viewport-enter', target: first }); assert.equal(first.dataset.reveal, 'done');
    const added = env.add(); env.Mutation.instances[0].add(added); assert.ok(observer.observed.has(added));
    const input = env.add(added, false); env.doc.activeElement = input; env.doc.emit('focusin', { target: input });
    assert.equal(added.dataset.reveal, 'done');
    env.media.reduced.set(true); assert.equal(second.dataset.reveal, 'done');
    const later = env.add(); env.Mutation.instances[0].add(later); assert.equal(later.dataset.reveal, 'done');
    stop(); assert.ok(observer.disconnected); assert.ok(env.Mutation.instances[0].disconnected); assert.equal(env.doc.count, 0);
    passed('Entrances run once, observe dynamically added sections, and never hide focused content or reduced-motion content');
}
{
    const env = environment(); const panel = env.add(); const stop = mountViewportReveals();
    env.doc.emit('keydown', { metaKey: true, key: 'f' }); assert.equal(panel.dataset.reveal, 'done');
    const later = env.add(); env.Mutation.instances[0].add(later); assert.equal(later.dataset.reveal, 'done'); stop();
    passed('Browser search reveals existing and future content without animation');
}
{
    const env = environment(); const panel = env.add(); delete window.IntersectionObserver;
    const stop = mountViewportReveals(); assert.equal(panel.dataset.reveal, ''); stop();
    passed('Unsupported browsers leave all content visible');
}
console.log(`All ${checks} motion lifecycle checks passed.`);
