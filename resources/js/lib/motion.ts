import { RefObject, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

// Shared motion helpers for the public site.
// Every animation here is short, starts from content that is already
// laid out, and is skipped entirely when the visitor asks for reduced motion.

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export { gsap, ScrollTrigger };

export const EASE_OUT = 'power3.out';

export const prefersReducedMotion = (): boolean =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Height of the fixed navbar plus breathing room, used as the scroll offset. */
export const navOffset = (): number => {
    const nav = document.querySelector<HTMLElement>('.navbar-cont');
    return (nav?.offsetHeight ?? 72) + 12;
};

/** Smoothly scrolls the window so `el` sits just below the fixed navbar. */
export const scrollToElement = (el: Element): void => {
    const offset = navOffset();

    if (prefersReducedMotion()) {
        const y = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo(0, Math.max(0, y));
        return;
    }

    gsap.to(window, {
        duration: 0.75,
        ease: 'power2.inOut',
        overwrite: 'auto',
        scrollTo: { y: el, offsetY: offset, autoKill: true },
    });
};

/**
 * Resolves with the element once it exists in the DOM. Pages are lazy-loaded,
 * so a section may not be rendered yet right after navigation.
 */
export const waitForElement = (id: string, timeout = 4000): Promise<HTMLElement | null> =>
    new Promise((resolve) => {
        const found = document.getElementById(id);
        if (found) {
            resolve(found);
            return;
        }

        const observer = new MutationObserver(() => {
            const el = document.getElementById(id);
            if (el) {
                observer.disconnect();
                window.clearTimeout(timer);
                resolve(el);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        const timer = window.setTimeout(() => {
            observer.disconnect();
            resolve(document.getElementById(id));
        }, timeout);
    });

/** Scrolls to the section with this id, waiting for it to render if needed. */
export const scrollToSection = async (id: string): Promise<void> => {
    const el = await waitForElement(id);
    if (!el) return;
    // Let the freshly rendered page settle (layout, fonts) before measuring.
    // A timeout rather than requestAnimationFrame, which never fires in a
    // background tab and would silently skip the scroll.
    window.setTimeout(() => scrollToElement(el), 40);
};

/**
 * Reveals elements marked with `data-reveal` inside `scope` as they scroll into
 * view: a short fade with a 16px rise, once. Content stays fully visible when
 * JavaScript is off or reduced motion is requested, because the hidden state
 * is only applied here.
 */
export const useReveal = (scope: RefObject<HTMLElement | null>, deps: unknown[] = []): void => {
    useLayoutEffect(() => {
        const root = scope.current;
        if (!root || prefersReducedMotion()) return;

        const ctx = gsap.context(() => {
            const items = gsap.utils.toArray<HTMLElement>('[data-reveal]', root);
            if (!items.length) return;

            gsap.set(items, { autoAlpha: 0, y: 16 });

            ScrollTrigger.batch(items, {
                start: 'top 90%',
                once: true,
                onEnter: (batch) =>
                    gsap.to(batch, {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.5,
                        ease: EASE_OUT,
                        stagger: 0.06,
                        overwrite: true,
                        clearProps: 'transform',
                    }),
            });
        }, root);

        // Images above the fold can change section heights after first paint
        const refresh = () => ScrollTrigger.refresh();
        window.addEventListener('load', refresh);

        return () => {
            window.removeEventListener('load', refresh);
            ctx.revert();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
};
