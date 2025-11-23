# Sunrise Semester Speaker Bingo

A fun, interactive bingo game for Sunrise Semester events with social authentication, persistent player profiles, and global leaderboards.

## ✨ Features

### 🎮 Game Modes
- **Single Player**: Practice and earn achievements
- **Multiplayer**: Create or join rooms with friends
- **Topic Roulette**: AI-powered topic generation
- **Daily Challenges**: Complete special goals for bonus points

### 🔐 Authentication & Profiles
- **Required Social Login**: Sign in with Google or Facebook
- **Automatic Profile Setup**: Name and avatar pulled from your account
- **Persistent Stats**: Access your progress from any device
- **Cross-Device Sync**: Stats saved to MongoDB Atlas

### 🏆 Progression System
- **Points & Levels**: Earn XP and level up (Newcomer → Sunrise Sage)
- **Achievements**: Unlock 10+ unique achievements
- **Global Leaderboard**: Compete with players worldwide
- **Streaks**: Daily play streaks with rewards

### Database Design
- **MongoDB with Mongoose**: Scalable document-based storage
- **Comprehensive Schemas**: Phrases, Themes, and AdminUser models
- **Data Relationships**: Proper linking between phrases and themes
- **Version History**: Track changes to phrases over time

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB Atlas account
- Google Cloud Console account (for Google OAuth)
- Facebook Developers account (for Facebook OAuth)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Environment Setup:**
Create `.env.local` file with these variables:
```env
# MongoDB
MONGODB_URI=your_mongodb_atlas_connection_string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=Kvpy3XsCHyAGPmbT9TT4tTFWVEeNrUBa+ZnlluNKwFM=

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret

# OpenAI (for Topic Roulette - optional)
OPENAI_API_KEY=your_openai_api_key
```

3. **Set Up OAuth Providers:**
Follow the detailed instructions in `OAUTH_SETUP.md` to:
- Configure Google OAuth credentials
- Configure Facebook OAuth credentials
- Set up redirect URIs

4. **Start Development Server:**
```bash
npm run dev
```

5. **Play!**
- Visit http://localhost:3000
- Sign in with Google or Facebook
- Start playing!

**📖 Need help?** See `OAUTH_SETUP.md` for detailed OAuth configuration instructions.

## 📋 Documentation

- **`OAUTH_SETUP.md`** - Step-by-step guide to configure Google and Facebook OAuth
- **`AUTHENTICATION_IMPLEMENTATION.md`** - Technical details of the authentication system
- **`SESSION_PERSISTENCE_FIX.md`** - Details on game session restoration

## 🎯 How to Play

### Single Player Mode
1. Sign in with Google or Facebook
2. Choose a phrase category
3. Click squares as you hear the phrases
4. Get 5 in a row for BINGO!
5. Complete daily challenges for bonus points

### Multiplayer Mode
1. Create a new game or join with a room code
2. Share the room code with friends
3. Everyone plays with the same grid
4. First to BINGO wins!
5. View other players' boards in real-time

## 🏗️ Tech Stack

- **Frontend**: React 19, Next.js 15
- **Authentication**: NextAuth.js with Google & Facebook OAuth
- **Database**: MongoDB Atlas
- **Styling**: CSS-in-JS with styled-jsx
- **AI**: OpenAI GPT-4 (Topic Roulette)

## 🔧 API Endpoints

### Authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth core routes
- `GET /api/auth/signin` - Sign-in page

### Player Profile
- `GET /api/profile/load` - Load authenticated user's profile
- `POST /api/profile/save` - Save profile data to MongoDB

### Leaderboard
- `GET /api/leaderboard/global` - Get top 10 players
- `POST /api/leaderboard/global` - Submit player stats

### Game Management
- `POST /api/games/create` - Create multiplayer game
- `POST /api/games/join` - Join existing game
- `GET /api/games/[roomCode]/state` - Get game state
- `POST /api/games/[roomCode]/update` - Update game state
- `POST /api/games/[roomCode]/stop` - Stop game (host only)

### AI Features
- `POST /api/generate-opening` - Generate AI opening message

## 💾 Database Schemas

### users (NextAuth)
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  emailVerified: Date,
  image: String
}
```

### accounts (NextAuth)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: "oauth",
  provider: "google" | "facebook",
  providerAccountId: String
}
```

### sessions (NextAuth)
```javascript
{
  _id: ObjectId,
  sessionToken: String,
  userId: ObjectId,
  expires: Date
}
```

### profiles (Custom)
```javascript
{
  userId: String,
  userName: String,
  userEmail: String,
  userImage: String,
  stats: {
    totalGames: Number,
    totalBingos: Number,
    totalPoints: Number,
    highestScore: Number,
    fastestBingo: Number,
    currentStreak: Number
  },
  achievements: {
    unlocked: Array,
    progress: Object
  },
  lastPlayed: Date,
  updatedAt: Date
}
```

### games (Multiplayer)
```javascript
{
  roomCode: String (6 chars),
  status: "waiting" | "active" | "finished",
  grid: Array (5x5 phrases),
  players: [{
    id: String,
    name: String,
    selected: Array,
    hasBingo: Boolean,
    points: Number,
    isHost: Boolean
  }],
  category: String,
  createdAt: Date
}
```

## 🎨 Phrase Categories

The game includes multiple phrase categories:

- **Sunrise Regulars**: Common Sunrise Semester phrases
- **Steps & Traditions**: Recovery program principles  
- **AA Sayings**: Classic recovery wisdom
- **Clutter Words**: Filler words and expressions

Each category has 50+ unique phrases for variety!

## 🚀 Deployment

### Production Checklist

1. **Environment Variables:**
```env
NODE_ENV=production
MONGODB_URI=production_mongodb_uri
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_production_secret
GOOGLE_CLIENT_ID=production_google_client_id
GOOGLE_CLIENT_SECRET=production_google_secret
FACEBOOK_CLIENT_ID=production_facebook_app_id
FACEBOOK_CLIENT_SECRET=production_facebook_secret
OPENAI_API_KEY=your_openai_key
```

2. **OAuth Provider Updates:**
- Update Google OAuth redirect URIs with production URL
- Update Facebook OAuth redirect URIs with production URL
- Make Facebook app "Live" mode

3. **Security:**
- Use strong NEXTAUTH_SECRET (32+ characters)
- Enable HTTPS (required for OAuth)
- Configure MongoDB Atlas firewall rules
- Set up proper CORS policies

4. **Database:**
- MongoDB Atlas with automated backups
- Configure connection pool limits
- Set up monitoring and alerts

## 👨‍💻 Development

### Project Structure
```
/lib
  /mongodb.js - Database connection
  /mongoClient.js - MongoDB client for NextAuth
  /phrases.js - Phrase categories and data
  /playerProfile.js - Player stats and achievements
  /dailyChallenges.js - Daily challenge system
/pages
  /index.js - Main game page
  /auth/signin.js - Sign-in page
  /api
    /auth/[...nextauth].js - NextAuth configuration
    /profile - Profile API routes
    /games - Multiplayer game API
    /leaderboard - Leaderboard API
/components
  /GameHeader.js - Header with avatar/stats
  /FABMenu.js - Floating action button menu
  /GlobalLeaderboard.js - Leaderboard modal
  /GameLobby.js - Multiplayer lobby
```

### Local Development

1. Fork and clone the repository
2. Set up `.env.local` with all required variables
3. Configure OAuth providers (see OAUTH_SETUP.md)
4. Run `npm run dev`
5. Test authentication flows
6. Test game functionality

## 🆘 Support

For issues or questions:
1. Check the browser console for client-side errors
2. Check server/terminal logs for API errors
3. Verify OAuth credentials are configured correctly
4. Ensure MongoDB connection is working
5. Review `OAUTH_SETUP.md` for authentication issues

### Common Issues
- **Can't sign in**: Check OAuth credentials and redirect URIs
- **Profile not saving**: Verify MongoDB connection
- **No avatar showing**: Check OAuth provider returns image field
- **Session expires**: Normal after 30 days, sign in again

## 📄 License

MIT License - Feel free to use and modify for your events!