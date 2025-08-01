# Speaker Bingo - Admin System

A comprehensive backend administrative system for managing Speaker Bingo, a respectful engagement tool for Alcoholics Anonymous and other recovery meetings.

## Features

### Core Admin Functionality
- **Phrase Management**: Complete CRUD operations for recovery-themed phrases
- **Theme Management**: Organize phrases into thematic categories
- **Content Moderation**: Approval workflow with flagging and review system
- **Bulk Operations**: Import/export functionality for phrase management
- **User Management**: Role-based permissions for administrators

### Authentication & Security
- **JWT-based Authentication**: Secure admin sessions
- **Role-based Permissions**: Super Admin, Admin, and Moderator roles
- **Account Security**: Login attempt limiting and account locking

### Database Design
- **MongoDB with Mongoose**: Scalable document-based storage
- **Comprehensive Schemas**: Phrases, Themes, and AdminUser models
- **Data Relationships**: Proper linking between phrases and themes
- **Version History**: Track changes to phrases over time

## Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB Atlas account or local MongoDB installation
- npm or yarn package manager

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Environment Setup:**
Create `.env.local` file:
```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret_key
```

3. **Database Setup:**
Run the setup endpoint to create initial admin user and seed data:
```bash
# In development, call the setup API
curl -X POST http://localhost:3000/api/admin/auth/setup
```

4. **Start Development Server:**
```bash
npm run dev
```

### Initial Login
After setup, login at `/admin/login` with:
- **Username:** `admin`
- **Password:** `changeme123`

**⚠️ IMPORTANT:** Change the default admin password immediately after first login!

## Admin System Overview

### User Roles & Permissions

#### Super Admin
- Full system access
- User management capabilities
- All phrase and theme operations
- Complete content moderation rights

#### Admin  
- Phrase and theme management
- Content approval and moderation
- View user information
- No user creation/deletion

#### Moderator
- Basic phrase operations (create, read, update)
- Cannot approve content (submissions go to pending)
- Limited theme access

### API Endpoints

#### Authentication
- `POST /api/admin/auth/login` - Admin login
- `POST /api/admin/auth/setup` - Initial system setup

#### Phrases
- `GET /api/admin/phrases` - List phrases with filtering
- `POST /api/admin/phrases` - Create new phrase
- `GET /api/admin/phrases/[id]` - Get specific phrase
- `PUT /api/admin/phrases/[id]` - Update phrase
- `DELETE /api/admin/phrases/[id]` - Delete phrase
- `GET /api/admin/phrases/export` - Export phrases (CSV/JSON)
- `POST /api/admin/phrases/import` - Bulk import phrases

#### Themes
- `GET /api/admin/themes` - List themes
- `POST /api/admin/themes` - Create theme
- `GET /api/admin/themes/[id]` - Get specific theme
- `PUT /api/admin/themes/[id]` - Update theme
- `DELETE /api/admin/themes/[id]` - Delete theme

## Database Schemas

### AdminUser
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  fullName: String,
  role: ['super_admin', 'admin', 'moderator'],
  permissions: {
    phrases: { create, read, update, delete, approve },
    themes: { create, read, update, delete },
    users: { create, read, update, delete }
  },
  isActive: Boolean,
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date
}
```

### Theme
```javascript
{
  name: String (unique),
  description: String,
  color: String (hex color),
  icon: String,
  isActive: Boolean,
  priority: Number (0-100),
  phraseCount: Number,
  minPhrases: Number,
  createdBy: ObjectId (AdminUser),
  modifiedBy: ObjectId (AdminUser)
}
```

### Phrase
```javascript
{
  text: String (unique),
  themes: [ObjectId] (Theme references),
  category: ['general', 'steps', 'sponsorship', 'gratitude', 'service', 'newcomer', 'oldtimer'],
  status: ['pending', 'approved', 'rejected', 'flagged'],
  isActive: Boolean,
  flagReason: String,
  approvedBy: ObjectId (AdminUser),
  createdBy: ObjectId (AdminUser),
  modifiedBy: ObjectId (AdminUser),
  version: Number,
  history: [{ text, modifiedBy, modifiedAt, version }]
}
```

## Content Guidelines

All phrases should be:
- **Respectful**: Appropriate for recovery meeting settings
- **Authentic**: Commonly heard in AA/recovery meetings
- **Inclusive**: Welcoming to people at all stages of recovery
- **Non-triggering**: Avoid graphic descriptions of drinking/using

### Example Phrases by Category

**Step Work**: "Working the steps", "Made amends", "Powerless over alcohol"

**Sponsorship**: "Get a sponsor", "Call your sponsor", "Work with others"

**Gratitude**: "Grateful alcoholic", "Attitude of gratitude", "Count your blessings"

**Service**: "Service keeps you sober", "Chair a meeting", "Make coffee"

## Deployment

### Production Considerations

1. **Environment Variables:**
```env
NODE_ENV=production
MONGODB_URI=production_mongodb_uri
JWT_SECRET=strong_production_secret
```

2. **Security:**
- Use strong JWT secret (32+ characters)
- Enable MongoDB authentication
- Set up proper firewall rules
- Use HTTPS in production

3. **Database:**
- Set up MongoDB Atlas with proper backups
- Configure connection limits
- Monitor database performance

## Development

### Project Structure
```
/lib
  /auth - JWT and authentication middleware
  /models - Mongoose schemas
  /mongodb.js - Database connection
  /seedData.js - Initial data setup
/pages
  /admin - Admin UI pages
  /api/admin - Admin API routes
/components
  /admin - Reusable admin components
```

### Adding New Features

1. **API Routes**: Add to `/pages/api/admin/`
2. **UI Components**: Add to `/components/admin/`
3. **Pages**: Add to `/pages/admin/`
4. **Database Models**: Add to `/lib/models/`

### Testing

While no formal test framework is configured, test manually:
1. All CRUD operations for phrases and themes
2. Authentication flows and permissions
3. Import/export functionality
4. Content moderation workflows

## Support

For issues or questions about the admin system:
1. Check the browser console for client-side errors
2. Check server logs for API errors
3. Verify MongoDB connection and authentication
4. Ensure proper environment variables are set

## License

This project is designed for use by recovery communities. Please use responsibly and maintain the respectful, supportive nature of the content.