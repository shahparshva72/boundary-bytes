import React from 'react';

export default function Footer() {
  return (
    <footer
      aria-label="Site credits"
      style={{
        background: 'var(--background)',
        color: 'var(--foreground)',
        borderTop: '4px solid var(--foreground)',
        padding: '1rem 0',
      }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: '0 auto',
          fontSize: '0.9rem',
          textAlign: 'center',
          fontFamily: 'var(--font-sans, Arial, Helvetica, sans-serif)',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            padding: '0.25rem 0.5rem',
            background: 'var(--foreground)',
            color: 'var(--background)',
            fontWeight: 700,
            borderRadius: 2,
          }}
        >
          Credits
        </span>
        <div style={{ marginTop: 8 }}>
          Dataset sourced from{' '}
          <a
            href="https://cricsheet.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--background)',
              background: 'var(--foreground)',
              padding: '0.15rem 0.35rem',
              textDecoration: 'none',
              marginLeft: 6,
              marginRight: 6,
            }}
          >
            CricSheet
          </a>
          . Thank you to the CricSheet contributors for providing match datasets.
        </div>
      </div>
    </footer>
  );
}
