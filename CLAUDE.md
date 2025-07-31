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

This is a Next.js application using the Pages Router pattern with Material-UI for styling.

### Key Components

- **pages/index.js**: Single-page Bingo game application
  - Uses React hooks (useState, useEffect) for state management
  - Material-UI components for the UI
  - Implements a 5x5 Bingo grid with phrase selection
  - Checks for horizontal and vertical winning conditions

### Technology Stack
- **Next.js 15.4.5** - React framework with Pages Router
- **React 19.1.1** - UI library
- **Material-UI 7.2.0** - Component library
- **Emotion** - CSS-in-JS styling solution used by MUI

### Project Structure
- `/pages` - Next.js pages directory
- `/node_modules` - Dependencies (not tracked in git)
- `package.json` - Project configuration and dependencies