# BuildMyBot – Production-Ready Workspace

BuildMyBot now ships with a live Express API, SQLite persistence, and a React + Vite front-end. There are no mocks or simulations—the API writes to a real database and can stream answers from OpenAI when a key is provided.

## Tech stack

- Front-end: Vite · React 18 · TypeScript · Tailwind · shadcn/ui
- Back-end: Express · @tanstack/react-query client · SQLite (via better-sqlite3)
- AI: OpenAI Responses API (opt-in via `OPENAI_API_KEY`)

## Prerequisites

- Node.js 18+ and npm 9+
- PowerShell 7 (recommended on Windows)

## Quick start (Windows PowerShell)

```powershell
# Clone and install
git clone <YOUR_REPO_URL>
cd <YOUR_PROJECT_NAME>
npm install

# Configure environment
Copy-Item .env.example .env

# Edit .env with your favourite editor and set:
#   PORT=4000
#   CLIENT_ORIGIN=http://localhost:5173
#   DATABASE_PATH=./data/buildmybot.db
#   OPENAI_API_KEY=<optional, enables live GPT responses>

# Launch API + web app together
npm run dev:full

# or run them separately
npm run server:dev   # PowerShell tab 1 – Express API on port 4000
npm run dev          # PowerShell tab 2 – Vite dev server on port 5173
```

The first run creates `data/buildmybot.db`. This file stores every bot, knowledge article, and conversation.

## Production build

```powershell
# Compile the API and front-end
npm run build:full

# Start the API from the build output
npm run server:start

# Preview the static web UI
npm run preview
```

## Managing real assistants via API

No bots ship by default. Use the REST API to create your own. The examples below use PowerShell’s `Invoke-RestMethod`; swap for `curl` if you prefer.

### 1. Create a bot with knowledge

```powershell
$bot = Invoke-RestMethod -Method Post -Uri http://localhost:4000/api/bots -ContentType 'application/json' -Body (@{
    name = 'Customer Success Copilot'
    summary = 'Resolves onboarding and billing questions with links to verified documentation.'
    industry = 'SaaS'
    primaryGoal = 'Accelerate onboarding resolutions'
    tone = 'Helpful and concise'
    status = 'active'
    persona = @{
        tagline = 'Your 24/7 onboarding concierge'
        voice = 'Friendly, modern, and precise'
        strengths = @('Understands pricing', 'Guides new admins', 'Escalates high-risk conversations')
    }
    knowledgeDocuments = @(
        @{
            title = 'Getting started checklist'
            content = 'Invite teammates, connect Slack, and configure the billing webhook before launch.'
            tags = @('onboarding','setup')
        },
        @{
            title = 'Billing escalation policy'
            content = 'Refunds above $1000 require finance approval. Create Jira ticket in project BILLING.'
            tags = @('billing','policy')
        }
    )
} | ConvertTo-Json -Depth 6)

"Created bot id: $($bot.bot.id)"
```

### 2. Chat with the bot

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:4000/api/bots/$($bot.bot.id)/conversation" `
    -ContentType 'application/json' `
    -Body (@{ message = 'How do I approve a large refund?' } | ConvertTo-Json)
```

### 3. Inspect analytics

```powershell
Invoke-RestMethod -Uri http://localhost:4000/api/analytics/summary
```

Bots, knowledge documents, and conversation history persist automatically in SQLite. Delete `data/buildmybot.db` if you want a fresh start.

## Live AI configuration

- Set `OPENAI_API_KEY` in `.env` to enable GPT-backed answers. The server uses `gpt-4o-mini` by default—override with `OPENAI_MODEL` if desired.
- Without a key, responses are grounded solely in your knowledge documents (no mock text is generated).

## Front-end entry points

- `src/components/LiveDemo.tsx` streams real conversations from the API.
- `src/components/AnalyticsOverview.tsx` visualises live metrics pulled from the database.

## Scripts reference

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite only (expects API already running) |
| `npm run server:dev` | Start the Express API with hot reload |
| `npm run dev:full` | Run API and Vite together (concurrently) |
| `npm run server:build` | Type-check & emit the API to `dist/server` |
| `npm run build` | Build the web app (no API) |
| `npm run build:full` | Build API + web app |
| `npm run server:start` | Launch the compiled API from `dist/server` |
| `npm run preview` | Preview the built web app |

## Notes

- The repository no longer includes seeded demo data. Everything you see in the UI reflects what exists in SQLite.
- Use migrations automatically executed on server boot—no manual SQL required.
- For backups, copy the `data/buildmybot.db` file or set `DATABASE_PATH` to a managed volume.
