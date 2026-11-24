import React, { useLayoutEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../../lib/motion';

/**
 * Fades a public page in when it first renders after navigation.
 * It sits inside the route's Suspense boundary, so it animates the real page
 * rather than the loading spinner. Transform and opacity are cleared when the
 * tween ends so fixed-position modals inside pages are unaffected.
 */
const PageEnter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const ref = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el || prefersReducedMotion()) return;

        const tween = gsap.fromTo(
            el,
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, duration: 0.38, ease: 'power2.out', clearProps: 'all' },
        );

        return () => {
            tween.kill();
        };
    }, []);

    return <div ref={ref}>{children}</div>;
};

export default PageEnter;
