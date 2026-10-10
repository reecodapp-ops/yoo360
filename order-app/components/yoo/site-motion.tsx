'use client';

import { useEffect } from 'react';
import { mountDesktopScroll, mountViewportReveals } from '@/lib/site-motion';

export function SiteMotion() {
    useEffect(() => {
        const stopReveals = mountViewportReveals();
        const stopScroll = mountDesktopScroll();
        return () => { stopScroll(); stopReveals(); };
    }, []);
    return null;
}
