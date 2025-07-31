# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm run dev` - Start the Next.js development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server

### Testing
- No test framework is currently configured. The test script will exit with an error.

## Architecture

This is a Next.js application using the Pages Router pattern with Material-UI for styling. It supports both single-player and multiplayer modes.

### Key Components

- **pages/index.js**: Main Bingo game with multiplayer support
  - Uses React hooks for state management
  - Supports single-player and multiplayer modes
  - Implements polling-based real-time updates for multiplayer
  - 5x5 Bingo grid with horizontal, vertical, and diagonal win conditions

- **components/GameLobby.js**: Multiplayer lobby interface
  - Create new games with unique room codes
  - Join existing games

- **API Routes** (pages/api/games/):
  - `create.js` - Create new multiplayer game
  - `join.js` - Join existing game
  - `[roomCode]/state.js` - Get current game state
  - `[roomCode]/update.js` - Update player moves

### Technology Stack
- **Next.js 15.4.5** - React framework with Pages Router
- **React 19.1.1** - UI library
- **Material-UI 7.2.0** - Component library
- **MongoDB** - Database for multiplayer game state
- **Emotion** - CSS-in-JS styling solution used by MUI

### Environment Setup
Create a `.env.local` file with:
```
MONGODB_URI=your_mongodb_atlas_connection_string
```

### Project Structure
- `/pages` - Next.js pages and API routes
- `/components` - React components
- `/lib` - Utilities (MongoDB connection)
- `/styles` - Global styles
- `/node_modules` - Dependencies (not tracked in git)
- `package.json` - Project configuration and dependencies