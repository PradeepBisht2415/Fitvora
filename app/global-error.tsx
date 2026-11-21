'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#FFFDF7' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ maxWidth: '420px', width: '100%', backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #d1fae5', padding: '1.5rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#075B2B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
              !
            </div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1A2E1C', margin: '0 0 0.5rem' }}>
              Fitvora System Notice
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
              We encountered a temporary loading error. Please refresh or try again.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button
                onClick={() => reset()}
                style={{ backgroundColor: '#075B2B', color: '#ffffff', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Try Again
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                style={{ backgroundColor: 'transparent', color: '#075B2B', border: '1px solid #d1fae5', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
