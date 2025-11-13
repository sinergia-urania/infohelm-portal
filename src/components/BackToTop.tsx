'use client';

import React from 'react';

export default function BackToTop({ threshold = 480 }: { threshold?: number }) {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      setShow(y > threshold);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  const handleClick = () => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Back to top"
      title="Back to top"
      className={
        'fixed right-4 bottom-4 z-50 h-11 w-11 rounded-full border shadow-md ' +
        'bg-white/90 dark:bg-zinc-900/90 backdrop-blur ' +
        'hover:bg-white dark:hover:bg-zinc-900 transition ' +
        (show ? 'opacity-100' : 'opacity-0 pointer-events-none')
      }
    >
      <span className="sr-only">Back to top</span>
      <svg
        aria-hidden="true"
        className="mx-auto"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M7 14l5-5 5 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
    </svg>
    </button>
  );
}
