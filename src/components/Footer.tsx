export default function Footer() {
  return (
    <footer
      aria-label="Site credits"
      className="bg-[var(--background)] text-[var(--foreground)] border-t-2 border-[var(--foreground)] py-2 sm:py-2.5"
    >
      <div className="max-w-[980px] mx-auto px-2 sm:px-3 text-sm sm:text-base text-center font-sans">
        <span className="inline-block px-1.5 py-0.5 bg-[var(--foreground)] text-[var(--background)] font-bold rounded-sm">
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
