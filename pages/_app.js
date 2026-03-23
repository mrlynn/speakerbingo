import Head from 'next/head'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '../lib/ThemeContext'
import MaintenanceOverlay from '../components/MaintenanceOverlay'
import '../styles/globals.css'

const MAINTENANCE_MODE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  if (MAINTENANCE_MODE) {
    return (
      <ThemeProvider>
        <MaintenanceOverlay />
      </ThemeProvider>
    )
  }

  return (
    <SessionProvider session={session}>
      <ThemeProvider>
      <Head>
        <title> Speaker Bingo</title>
        <meta name="description" content="Play Speaker Bingo - A fun bingo game with custom phrases" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
      </ThemeProvider>
    </SessionProvider>
  )
}

export default MyApp