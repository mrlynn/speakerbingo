import React from 'react'
import Head from 'next/head'

/**
 * Full-screen maintenance overlay. Shown when NEXT_PUBLIC_MAINTENANCE_MODE=true.
 * Blocks all access to the site when authentication/login is broken.
 */
export default function MaintenanceOverlay() {
  return (
    <>
      <Head>
        <title>Under Maintenance - Speaker Bingo</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--gradient-sunrise, linear-gradient(135deg, #FFE0B2 0%, #FF7043 50%, #FFF8E1 100%))',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            maxWidth: 420,
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 16,
            padding: 32,
            boxShadow: '0 8px 32px rgba(139, 69, 19, 0.2)',
          }}
        >
          <div
            style={{
              fontSize: 48,
              marginBottom: 16,
            }}
            aria-hidden
          >
            🔧
          </div>
          <h1
            style={{
              fontFamily: 'inherit',
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--sunrise-navy, #2C3E50)',
              marginBottom: 12,
            }}
          >
            Under Maintenance
          </h1>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.5,
              color: 'var(--sunrise-navy, #2C3E50)',
              opacity: 0.9,
              marginBottom: 8,
            }}
          >
            Speaker Bingo is temporarily unavailable while we resolve technical
            issues with login and authentication.
          </p>
          <p
            style={{
              fontSize: 14,
              color: 'var(--sunrise-rust, #8B4513)',
              opacity: 0.85,
            }}
          >
            Please check back soon. We apologize for the inconvenience.
          </p>
        </div>
      </div>
    </>
  )
}
