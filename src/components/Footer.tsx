import React from 'react';

export default function Footer() {
  return (
    <footer
      aria-label="Site credits"
      className="bg-[var(--background)] text-[var(--foreground)] border-t-4 border-[var(--foreground)] py-3 sm:py-4"
    >
      <div className="max-w-[980px] mx-auto px-4 sm:px-6 text-sm sm:text-base text-center font-sans">
        <span className="inline-block px-2 py-1 bg-[var(--foreground)] text-[var(--background)] font-bold rounded-sm">
          Credits
        </span>
        <div className="mt-2">
          Dataset sourced from{' '}
          <a
            href="https://cricsheet.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--background)] bg-[var(--foreground)] px-1.5 py-0.5 no-underline mx-1"
          >
            CricSheet
          </a>
          . Thank you to the CricSheet contributors for providing match datasets.
        </div>
      </div>
    </footer>
  );
}
