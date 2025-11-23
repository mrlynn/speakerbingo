import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export function useAuth() {
  const { data: session, status } = useSession()
  const [guestSession, setGuestSession] = useState(null)
  const [isGuest, setIsGuest] = useState(false)
  const [guestChecked, setGuestChecked] = useState(false)

  useEffect(() => {
    // Check for guest session in localStorage
    if (typeof window !== 'undefined') {
      const storedGuestSession = localStorage.getItem('guestSession')
      if (storedGuestSession) {
        try {
          const parsed = JSON.parse(storedGuestSession)
          setGuestSession(parsed)
          setIsGuest(true)
        } catch (error) {
          console.error('Error parsing guest session:', error)
          localStorage.removeItem('guestSession')
        }
      }
      // Mark that we've completed checking localStorage for guest session
      setGuestChecked(true)
    }
  }, [])

  // Loading should remain true until both NextAuth has resolved and guest check completed
  const isLoading = (status === 'loading') || !guestChecked

  // Return authenticated session if available, otherwise guest session
  if (status === 'authenticated' && session) {
    return {
      user: session.user,
      isAuthenticated: true,
      isGuest: false,
      isLoading
    }
  }

  if (isGuest && guestSession) {
    return {
      user: guestSession.user,
      isAuthenticated: false,
      isGuest: true,
      isLoading
    }
  }

  return {
    user: null,
    isAuthenticated: false,
    isGuest: false,
    isLoading
  }
}

export function clearGuestSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('guestSession')
  }
}
