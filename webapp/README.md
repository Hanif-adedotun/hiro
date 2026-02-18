# Hiro Dashboard

A production-ready Next.js dashboard for Hiro, an AI-powered test generation platform that automatically generates unit tests for your codebase.

## Architecture Overview

Hiro Dashboard is built with:

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon)
- **Authentication**: NextAuth.js with GitHub OAuth
- **GitHub Integration**: GitHub App with webhook support
- **AI/ML**: Groq LLM (Llama 3.3 70B)
- **Job Queue**: Database-backed async job processing

## System Components

### 1. Database Schema

The application uses Prisma ORM with PostgreSQL. Key tables:

- `users` - GitHub OAuth user data
- `repositories` - Connected GitHub repositories
- `installations` - GitHub App installations
- `pull_requests` - PR metadata and analysis results
- `test_jobs` - Async job queue for test generation
- `test_results` - Generated test cases and metadata
- `coverage_snapshots` - Historical coverage data
- `actions_feed` - Autonomous actions log

### 2. Application Structure

```
webapp/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   ├── (dashboard)/              # Dashboard pages
│   └── api/                      # API routes
├── lib/                          # Core libraries
│   ├── db/                       # Database client & queries
│   ├── github/                   # GitHub API client
│   ├── llm/                      # Groq LLM integration
│   ├── analyzer/                 # Code analysis logic
│   ├── queue/                    # Job queue processor
│   └── auth/                     # Authentication
├── components/                    # React components
│   └── dashboard/                # Dashboard components
└── prisma/                       # Database schema
```

### 3. Key Features

#### GitHub App Integration
- Webhook endpoint at `/api/webhooks/github`
- HMAC signature verification
- Event handlers for `pull_request`, `push`, `installation`
- Installation token management
- PR diff analysis

#### Job Queue System
- Database table `test_jobs` with status tracking
- Background worker process via API route
- Job status polling for frontend
- Retry logic for failed jobs

#### Dashboard Views
- **Home**: Repo overview, health metrics, latest activity
- **Test Intelligence**: Coverage map, risk analysis
- **Actions Feed**: Chronological log of Hiro's actions
- **PR Analyzer**: Real-time PR analysis and suggestions
- **Vibe Score**: Code quality metrics and trends
- **Settings**: GitHub App config, automation controls

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database (Neon recommended)
- GitHub OAuth App credentials
- GitHub App credentials (for webhook support)
- Groq API key

### Installation

1. **Clone the repository and navigate to webapp**

```bash
cd webapp
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the `webapp` directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# GitHub OAuth
GITHUB_CLIENT_ID="your_github_oauth_client_id"
GITHUB_CLIENT_SECRET="your_github_oauth_client_secret"

# GitHub App (for webhooks)
GITHUB_APP_ID="your_github_app_id"
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET="your_webhook_secret"

# LLM
GROQ_API_KEY="your_groq_api_key"

# NextAuth
NEXTAUTH_SECRET="generate_a_random_secret"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Set up the database**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

5. **Run the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## GitHub App Setup

1. **Create a GitHub App**
   - Go to your GitHub organization settings
   - Create a new GitHub App
   - Set webhook URL to: `https://your-domain.com/api/webhooks/github`
   - Grant permissions: Repository contents (read), Pull requests (read/write), Issues (write)
   - Subscribe to events: `pull_request`, `push`, `installation`

2. **Install the GitHub App**
   - Install it on your repositories
   - Note the installation ID

3. **Configure Webhook Secret**
   - Generate a webhook secret in GitHub App settings
   - Add it to your `.env` file as `GITHUB_WEBHOOK_SECRET`

## API Routes

### Authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js endpoints

### Repositories
- `GET /api/repos` - List user repositories
- `POST /api/repos` - Add a repository
- `GET /api/repos/[repoId]` - Get repository details
- `PATCH /api/repos/[repoId]` - Update repository settings

### Jobs
- `GET /api/jobs` - List test jobs
- `POST /api/jobs` - Create a test job
- `GET /api/jobs/[jobId]` - Get job status
- `POST /api/jobs/process` - Process pending jobs (worker)

### Pull Requests
- `GET /api/prs/[repoId]/[prNumber]` - Get PR details
- `POST /api/prs/[repoId]/[prNumber]` - Analyze PR

### Tests
- `POST /api/tests/generate` - Generate tests for files

### Webhooks
- `POST /api/webhooks/github` - GitHub webhook handler

## Job Queue Processing

The application uses a database-backed job queue. To process jobs:

1. **Manual processing** (for testing):
   ```bash
   curl -X POST http://localhost:3000/api/jobs/process
   ```

2. **Automated processing** (production):
   - Set up a cron job or scheduled task
   - Call `/api/jobs/process` endpoint periodically
   - Or use a service like Vercel Cron or GitHub Actions

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Railway
- Render
- AWS Amplify
- DigitalOcean App Platform

Make sure to:
- Set all environment variables
- Run database migrations
- Configure GitHub App webhook URL
- Set up job queue processing (cron job or scheduled task)

## Development

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy
```

### Prisma Studio

View and edit database data:

```bash
npx prisma studio
```

## Architecture Decisions

### Why Next.js API Routes?
- Unified TypeScript stack
- Server-side rendering for dashboard
- API routes for backend logic
- Easy deployment on Vercel

### Why Database-Backed Queue?
- Simpler than Redis (no additional service)
- Persistent job state
- Easy to query and debug
- Works well for moderate load

### Why Groq LLM?
- Fast inference
- Cost-effective
- Good code generation quality
- Easy API integration

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check database is accessible
- Run `npx prisma generate` to regenerate client

### GitHub Webhook Not Working
- Verify webhook secret matches
- Check webhook URL is accessible
- Verify HMAC signature verification
- Check GitHub App permissions

### Job Processing Not Working
- Verify GROQ_API_KEY is set
- Check job status in database
- Review error messages in `test_jobs` table
- Ensure GitHub tokens are valid

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

See LICENSE file in the root directory.

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/hanif-adedotun/hiro/issues)
- Email: hiro@hanif.one

