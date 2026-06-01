'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey;
      // Skip if focus is inside an input/textarea/select (don't hijack form input)
      const target = e.target as HTMLElement;
      const inInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

      if (ctrl && e.key === 'n' && !inInput) {
        e.preventDefault();
        router.push('/billing/new');
      }
      if (ctrl && e.key === 'p' && !inInput) {
        e.preventDefault();
        window.print();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return null;
}
