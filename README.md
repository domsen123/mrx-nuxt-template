# Nuxt 4 + Better-Auth Starter Template

A modern, production-ready starter template for building authenticated web applications with Nuxt 4 and Better-Auth. This template provides a complete authentication system with TypeScript, PostgreSQL, and a beautiful UI powered by Nuxt UI Pro.

## 🚀 Features

### Authentication & Security
- 🔐 **Better-Auth Integration** - Modern authentication library with session management
- 👤 **Complete Auth Flow** - Registration, login, logout, and session persistence
- 🛡️ **Role-Based Access Control** - Admin roles and permissions
- 🔒 **Secure Sessions** - HTTP-only cookies with 7-day persistence
- 🚫 **User Management** - Ban/suspension system built-in

### Tech Stack
- ⚡ **Nuxt 4** - Latest version with full TypeScript support
- 🎨 **Nuxt UI Pro** - Premium UI components library
- 🗄️ **Drizzle ORM** - Type-safe database queries
- 🐘 **PostgreSQL** - Robust database with Docker support
- 📦 **Pinia** - State management with auth store
- 🎯 **TypeScript** - Full type safety across the stack

### Developer Experience
- 🐳 **Docker Compose** - One-command database setup
- 🔧 **Drizzle Studio** - Visual database management
- 📝 **ESLint & TypeScript** - Code quality tools pre-configured
- 🎭 **Multiple Layouts** - Separate auth and app layouts
- 🌙 **Dark Mode** - Built-in color mode support

## 📋 Prerequisites

- Node.js 18+ and pnpm
- Docker and Docker Compose (for PostgreSQL)
- PostgreSQL (if not using Docker)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd mrx-nuxt
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:
   ```env
   NUXT_SITE_NAME="Your App Name"
   NUXT_SITE_ENV="development"
   NUXT_SITE_URL="http://localhost:3000"
   NUXT_DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   NUXT_AUTH_SECRET="your-secret-key"
   NUXT_SESSION_SECRET="your-session-secret"
   ```

4. **Start the database**
   ```bash
   pnpm docker:up
   ```

5. **Push the database schema**
   ```bash
   pnpm db:push
   ```

6. **Start the development server**
   ```bash
   pnpm dev
   ```

   Visit `http://localhost:3000` to see your app running!

## 📁 Project Structure

```
mrx-nuxt/
├── app/                    # Frontend application
│   ├── assets/            # CSS and static assets
│   ├── composables/       # Vue composables
│   │   └── useAuthClient.ts  # Auth client composable
│   ├── layouts/           # App layouts
│   │   ├── auth.vue      # Auth pages layout
│   │   └── default.vue   # Main app layout
│   ├── middleware/        # Route middleware
│   │   ├── is-authenticated.global.ts
│   │   └── is-admin.ts
│   ├── pages/             # Application pages
│   │   ├── auth/         # Auth pages (login, register)
│   │   ├── admin.vue     # Admin dashboard
│   │   └── index.vue     # Home page
│   ├── plugins/          # Nuxt plugins
│   └── stores/           # Pinia stores
│       └── auth.store.ts # Auth state management
├── server/                # Backend API
│   ├── api/              # API routes
│   ├── config/           # Server configuration
│   ├── database/         # Database schema
│   │   └── schema.ts     # Drizzle schema definition
│   ├── guards/           # Auth guards
│   ├── middleware/       # Server middleware
│   └── utils/            # Server utilities
│       └── auth.ts       # Better-Auth configuration
└── shared/               # Shared types and utilities
```

## 🔐 Authentication

### Client-Side Usage

```typescript
// Use the auth client composable
const authClient = useAuthClient()

// Sign up a new user
await authClient.signUp.email({
  email: 'user@example.com',
  password: 'secure-password',
  name: 'John Doe'
})

// Sign in
await authClient.signIn.email({
  email: 'user@example.com',
  password: 'secure-password'
})

// Sign out
await authClient.signOut()

// Get current session
const session = await authClient.getSession()
```

### Protecting Routes

```typescript
// Client-side: Add middleware to pages
definePageMeta({
  middleware: 'is-admin' // Requires admin role
})

// Server-side: Use authenticated event handler
export default defineAuthenticatedEventHandler(async (event) => {
  const user = event.context.user // Authenticated user
  // Your protected API logic
})
```

### Auth Store

```typescript
const authStore = useAuthStore()

// Access user data
authStore.user
authStore.session
authStore.isAuthenticated
authStore.isAdmin

// Actions
await authStore.login(credentials)
await authStore.logout()
await authStore.fetchSession()
```

## 🗄️ Database

### Schema Overview

The database schema includes:
- **Users** - Extended with employee fields and roles
- **Sessions** - User session management
- **Accounts** - OAuth provider accounts
- **Verification Tokens** - Email verification
- **API Keys** - API key management with rate limiting

### Database Commands

```bash
# Start PostgreSQL with Docker
pnpm docker:up

# Stop PostgreSQL
pnpm docker:down

# Push schema changes
pnpm db:push

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

## 🎨 UI Components

This template uses **Nuxt UI Pro** for premium components. Key features:

- Beautiful, accessible components
- Dark mode support out of the box
- Responsive design
- Form components with validation
- Toast notifications
- Modal dialogs
- And much more!

## 🚀 Deployment

### Environment Variables

Ensure all required environment variables are set in production:

```env
NUXT_SITE_NAME="Your Production App"
NUXT_SITE_ENV="production"
NUXT_SITE_URL="https://yourdomain.com"
NUXT_DATABASE_URL="your-production-db-url"
NUXT_AUTH_SECRET="strong-random-secret"
NUXT_SESSION_SECRET="another-strong-secret"
```

### Build for Production

```bash
# Build the application
pnpm build

# Preview production build
pnpm preview
```

## 📝 Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm typecheck    # Run TypeScript type checking
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint issues
pnpm db:push      # Push database schema
pnpm db:studio    # Open Drizzle Studio
pnpm docker:up    # Start PostgreSQL container
pnpm docker:down  # Stop PostgreSQL container
```

## 🔧 Configuration

### Nuxt Config

The `nuxt.config.ts` file is pre-configured with:
- TypeScript support
- Nuxt UI Pro
- SEO module
- Authentication setup
- Database integration

### Better-Auth Config

Authentication is configured in `/server/utils/auth.ts` with:
- Email/password authentication
- Admin plugin for roles
- Drizzle adapter
- Session management
- ULID for unique IDs

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Nuxt](https://nuxt.com) - The Intuitive Vue Framework
- [Better-Auth](https://better-auth.com) - Modern Authentication for Full-Stack Apps
- [Drizzle ORM](https://orm.drizzle.team) - TypeScript ORM
- [Nuxt UI Pro](https://ui.nuxt.com/pro) - Premium Vue Components

---

Built with ❤️ using Nuxt 4 and Better-Auth