import Head from 'next/head'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '../lib/ThemeContext'
import '../styles/globals.css'

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
      <Head>
        <title>Sunrise Semester Speaker Bingo</title>
        <meta name="description" content="Play Sunrise Semester SpeakerBingo - A fun bingo game with custom phrases" />
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