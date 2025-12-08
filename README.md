# Voice Agent Bonanza

A platform for creating and managing AI voice agents powered by [Vapi](https://vapi.ai). Create custom voice assistants with different personalities, voices, and behaviors - then share them via unique URLs.

## Features

- **Multiple Agent Types**
  - **Public**: Shareable agents with intake forms - anyone can access via URL
  - **Personal**: Created for specific people (e.g., family members) - no intake form
  - **Internal**: Admin testing only - hidden from public

- **Call Limits** (Public Agents)
  - Configurable per-agent call limits (default: 3 calls)
  - Countdown displayed on public page ("X calls remaining")
  - Automatic blocking when limit reached
  - Admin can reset call count anytime

- **Voice & Model Options**
  - Multiple voice providers (ElevenLabs, OpenAI)
  - Multiple LLM models (GPT-4o, Claude 3.5 Sonnet, Gemini)
  - Configurable temperature and max duration

- **Call Analytics**
  - Full call history with transcripts
  - Cost breakdown per call (STT, LLM, TTS, Vapi fees)
  - Recording URLs and analysis
  - Dashboard statistics

- **Admin Interface**
  - Template-based agent creation
  - Edit agents with live sync to Vapi
  - View call history and transcripts
  - Analytics dashboard

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Vercel Serverless Functions
- **Database**: PostgreSQL (Supabase)
- **Voice AI**: Vapi SDK
- **Auth**: JWT-based admin authentication
- **Hosting**: Vercel

## Project Structure

```
src/
├── app/
│   ├── admin/           # Admin dashboard pages
│   │   ├── agents/[id]/ # Edit agent page
│   │   ├── calls/       # Call history
│   │   ├── analytics/   # Dashboard stats
│   │   └── new/         # Create agent (template selection)
│   ├── agent/[slug]/    # Public agent pages
│   ├── api/
│   │   ├── agents/      # CRUD for agents
│   │   ├── calls/       # Call queries
│   │   ├── analytics/   # Stats endpoint
│   │   ├── webhooks/vapi/ # Vapi end-of-call webhook
│   │   └── auth/        # Login/logout
│   └── login/           # Admin login page
├── components/          # React components
├── lib/
│   ├── queries/         # Database query functions
│   ├── vapi.ts          # Vapi API client
│   ├── auth.ts          # JWT auth utilities
│   ├── db.ts            # Database connection
│   ├── constants.ts     # Voice/model options, defaults
│   ├── templates.ts     # Agent templates
│   ├── validation.ts    # Input validation
│   └── utils.ts         # Helper functions
└── types/               # TypeScript interfaces
```

## Environment Variables

Create a `.env.local` file (or set in Vercel):

```bash
# Database (Supabase PostgreSQL)
POSTGRES_URL="postgresql://postgres.[project]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"

# Vapi API
VAPI_API_KEY="your-vapi-api-key"

# Admin Auth
ADMIN_PASSWORD="your-admin-password"
JWT_SECRET="your-jwt-secret-min-32-chars"
```

**Important**: If your database password contains special characters like `@`, URL-encode them:
- `@` becomes `%40`
- `#` becomes `%23`
- etc.

## Database Setup

Run the schema in Supabase SQL Editor:

```sql
-- See production-schema.sql for full schema
-- See migrations/ folder for incremental changes
```

Key tables:
- `agents` - Voice agent configurations
- `calls` - Call history with transcripts and costs

## Getting Started

1. **Clone and install**
   ```bash
   git clone https://github.com/StewartalsopIII/voice-agent-bonanza.git
   cd voice-agent-bonanza
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

3. **Run database migrations**
   - Go to Supabase SQL Editor
   - Run `production-schema.sql`
   - Run any migrations in `migrations/` folder

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the app**
   - Admin: http://localhost:3000/admin
   - Public agents: http://localhost:3000/agent/[agent-name]

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Vapi Webhook Setup

Configure Vapi to send `end-of-call-report` webhooks to:
```
https://your-domain.vercel.app/api/webhooks/vapi
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/agents` | GET | List agents with stats |
| `/api/agents` | POST | Create new agent |
| `/api/agents/[id]` | GET | Get agent details |
| `/api/agents/[id]` | PATCH | Update agent |
| `/api/agents/[id]` | DELETE | Delete agent |
| `/api/calls` | GET | List calls (filterable) |
| `/api/calls/[id]` | GET | Get call with transcript |
| `/api/analytics` | GET | Dashboard statistics |
| `/api/webhooks/vapi` | POST | Vapi webhook endpoint |

## License

MIT
