import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import clientPromise from "../../../lib/mongoClient"
import bcrypt from "bcryptjs"

export const authOptions = {
  // Configure MongoDB adapter for session and user storage
  adapter: MongoDBAdapter(clientPromise),
  
  // Configure authentication providers
  providers: [
    EmailProvider({
      server: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: process.env.GOOGLE_EMAIL,
          pass: process.env.GOOGLE_APP_PASSWORD,
        },
      },
      from: process.env.GOOGLE_EMAIL,
      maxAge: 10 * 60, // Magic links expire after 10 minutes
      // Custom email template
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        const { host } = new URL(url)
        const nodemailer = require('nodemailer')

        const transport = nodemailer.createTransport(provider.server)

        await transport.sendMail({
          to: email,
          from: provider.from,
          subject: `Sign in to Speaker Bingo`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 64px;">🃏</div>
                <h1 style="color: #667eea; margin: 10px 0;">Speaker Bingo</h1>
              </div>

              <div style="background: #f8f9fa; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                <h2 style="color: #333; margin-top: 0;">Sign in to your account</h2>
                <p style="color: #666; line-height: 1.6;">
                  Click the button below to sign in to Speaker Bingo. This link will expire in 10 minutes.
                </p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${url}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Sign In
                  </a>
                </div>

                <p style="color: #999; font-size: 14px; margin-bottom: 0;">
                  Or copy and paste this link into your browser:
                </p>
                <p style="word-break: break-all; color: #667eea; font-size: 14px;">
                  ${url}
                </p>
              </div>

              <p style="color: #999; font-size: 12px; text-align: center;">
                If you didn't request this email, you can safely ignore it.
              </p>
            </div>
          `,
          text: `Sign in to Speaker Bingo\n\nClick this link to sign in: ${url}\n\nThis link will expire in 10 minutes.\n\nIf you didn't request this email, you can safely ignore it.`,
        })

        console.log('✅ [Magic Link] Email sent to:', email)
      },
    }),
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

          if (credentials.isSignUp === 'true' || credentials.isSignUp === true) {
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

            // Create account record for credentials (including password hash)
            await accounts.insertOne({
              userId: userId,
              type: "credentials",
              provider: "credentials",
              providerAccountId: credentials.email,
              passwordHash: hashedPassword,
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
  
  // Session strategy - use JWT for credentials compatibility
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Callbacks to customize behavior
  callbacks: {
    async jwt({ token, user, account }) {
      // Add user info to token on sign in
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.image = user.image
      }
      return token
    },
    async session({ session, token }) {
      // Add user ID and image to session from token
      if (session?.user) {
        session.user.id = token.id
        session.user.image = token.image
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Redirect to home page after signin
      return baseUrl
    },
  },
  
  // Secret for JWT encryption (required in production)
  secret: process.env.NEXTAUTH_SECRET,

  // Enable debug messages in development
  debug: process.env.NODE_ENV === 'development',
}

export default NextAuth(authOptions)

