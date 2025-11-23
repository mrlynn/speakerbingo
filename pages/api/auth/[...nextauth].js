import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import clientPromise from "../../../lib/mongoClient"
import bcrypt from "bcryptjs"

export const authOptions = {
  // Configure MongoDB adapter for session and user storage
  adapter: MongoDBAdapter(clientPromise),
  
  // Configure authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
        }
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        isSignUp: { label: "Is Sign Up", type: "checkbox" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null

        try {
          const client = await clientPromise
          const db = client.db()
          const users = db.collection("users")
          const accounts = db.collection("accounts")

          if (credentials.isSignUp) {
            // Handle sign up
            if (!credentials.name || !credentials.password) {
              throw new Error("Name and password are required for sign up")
            }

            // Check if user already exists
            const existingUser = await users.findOne({ email: credentials.email })
            if (existingUser) {
              throw new Error("User already exists with this email")
            }

            // Create new user
            const hashedPassword = await bcrypt.hash(credentials.password, 12)
            const newUser = {
              name: credentials.name,
              email: credentials.email,
              emailVerified: new Date(),
              image: null,
              createdAt: new Date(),
            }

            const result = await users.insertOne(newUser)
            const userId = result.insertedId

            // Create account record for credentials
            await accounts.insertOne({
              userId: userId,
              type: "credentials",
              provider: "credentials",
              providerAccountId: credentials.email,
              access_token: null,
              refresh_token: null,
              expires_at: null,
              token_type: null,
              scope: null,
              id_token: null,
              session_state: null,
            })

            return {
              id: userId.toString(),
              name: newUser.name,
              email: newUser.email,
              image: newUser.image,
            }
          } else {
            // Handle sign in
            if (!credentials.password) {
              throw new Error("Password is required for sign in")
            }

            // Find user by email
            const user = await users.findOne({ email: credentials.email })
            if (!user) {
              throw new Error("No user found with this email")
            }

            // Find credentials account
            const account = await accounts.findOne({ 
              userId: user._id, 
              provider: "credentials" 
            })
            if (!account) {
              throw new Error("No credentials account found")
            }

            // Verify password (in a real app, you'd store hashed passwords)
            // For now, we'll assume the password is stored in a separate field
            // This is a simplified version - in production, you'd hash passwords properly
            const isValid = await bcrypt.compare(credentials.password, account.passwordHash || "")
            
            if (!isValid) {
              throw new Error("Invalid password")
            }

            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              image: user.image,
            }
          }
        } catch (error) {
          console.error("Auth error:", error)
          throw new Error(error.message || "Authentication failed")
        }
      }
    }),
  ],
  
  // Custom pages
  pages: {
    signIn: '/auth/signin',
  },
  
  // Session strategy
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  
  // Callbacks to customize behavior
  callbacks: {
    async session({ session, user }) {
      // Add user ID and image to session
      if (session?.user) {
        session.user.id = user.id
        session.user.image = user.image
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Redirect to home page after signin
      return baseUrl
    },
  },
  
  // Enable debug messages in development
  debug: process.env.NODE_ENV === 'development',
}

export default NextAuth(authOptions)

