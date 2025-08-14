# RSS Sales Intelligence

A web-based RSS feed reader application with integrated AI evaluation system that analyzes articles for sales relevance at Vahle Denmark.

## Features

### 🔗 RSS Feed Management
- Add, edit, and delete RSS feed subscriptions
- Validate RSS/Atom feed URLs before adding
- Display feed list with status indicators
- Manual refresh option for immediate updates

### 📰 Article Fetching & Storage
- Automatic fetching from RSS feeds every 30 minutes
- Extract and store full article content, not just summaries
- Capture metadata: title, author, publication date, source URL, images
- Graceful error handling without interrupting other feeds

### 🖥️ Dashboard Interface
- Responsive web interface with sidebar and main content area
- Date-based filtering:
  - Today (last 24 hours)
  - This Week (current week, Monday-Sunday)
  - This Month (current calendar month)
  - Last Month (previous calendar month)
  - All Time
- Search functionality across titles and content
- Mark articles as read/unread

### 🤖 AI Sales Relevance Evaluation
AI agent analyzes each article based on Vahle Denmark's business context:

**Company Context:**
- Vahle is a leading supplier of mobile electrification systems
- Target Industries: Ports, automotive, logistics, manufacturing, mining
- Key Products: Conductor bar systems, cable festoon systems, spring-driven cable reels
- Geographic Focus: Denmark and Nordic region

**AI Evaluation Criteria (0-100 score):**
- Industry relevance (ports, cranes, material handling, automation)
- Geographic relevance (Denmark, Scandinavia, Northern Europe)
- Business opportunities (new projects, expansions, investments)
- Competitor activity and technology trends

**AI Output for Each Article:**
- Relevance score (0-100)
- Key reasons for relevance
- Suggested sales actions
- Tagged categories
- Priority level (High/Medium/Low)

### 📊 Sales Intelligence Dashboard
- Dedicated view for articles scored >60 for relevance
- Articles sorted by relevance score
- Visual indicators for priority levels
- Quick preview of AI insights

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL) with Prisma ORM
- **AI:** OpenAI GPT-4 for article evaluation
- **RSS Processing:** rss-parser, cheerio for content extraction
- **UI Components:** Radix UI primitives
- **Scheduling:** node-cron for automated fetching

## Prerequisites

- Node.js 18+ 
- Supabase account (free tier available)
- OpenAI API key

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd "RSS App"
npm install
```

### 2. Supabase Setup

#### Quick Setup:
1. Create a [Supabase](https://supabase.com) account and new project
2. Copy your project URL, anon key, and service role key
3. Get your database connection string from Settings → Database

#### Detailed Setup:
See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for complete step-by-step instructions.

### 3. Environment Setup

Copy the example environment file and configure:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase credentials:
```env
# Supabase Database (replace with your actual values)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

OPENAI_API_KEY="your-openai-api-key-here"
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Setup

Initialize the database schema:

```bash
# Generate Prisma client
npx prisma generate

# Push the schema to Supabase
npx prisma db push

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

### 5. Development Server

Start the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the application.

### 6. Add RSS Feeds

1. Click the "+" button in the sidebar
2. Add RSS feeds (examples):
   - TechCrunch: `https://techcrunch.com/feed/`
   - Reuters Technology: `https://feeds.reuters.com/reuters/technologyNews`
   - Port Technology: `https://www.porttechnology.org/feed/`

### 7. Manual Feed Fetching

To manually fetch all feeds:

```bash
npm run fetch:feeds
```

### 8. Automatic Fetching

Automatic fetching runs every 30 minutes when the application is running. To start the cron jobs, make a POST request to:

```bash
curl -X POST http://localhost:3000/api/cron/start
```

## Usage

### Adding Feeds
1. Click the "+" button in the sidebar
2. Enter feed name, RSS URL, and optional description
3. The system will validate the RSS feed before adding

### Viewing Articles
- Use the sidebar filters to view articles by time period
- Click on any article to read the full content
- Use the search bar to find specific articles
- Toggle read/unread status with the eye icon

### Sales Intelligence
- Click "Sales Intelligence" in the sidebar to view high-relevance articles
- Articles are scored by AI based on Vahle's business context
- View AI insights including relevance score, key reasons, and suggested actions
- Articles are categorized and prioritized automatically

### Manual Refresh
- Click the refresh icon next to any feed to fetch latest articles immediately
- This will also run AI evaluation on new articles

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── articles/      # Article endpoints
│   │   ├── feeds/         # Feed management endpoints
│   │   └── cron/          # Cron job endpoints
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── articles/          # Article-related components
│   ├── layout/            # Layout components
│   └── ui/                # Reusable UI components
└── lib/                   # Utility libraries
    ├── ai-evaluator.ts    # AI evaluation logic
    ├── cron.ts            # Cron job setup
    ├── prisma.ts          # Database client
    ├── rss-parser.ts      # RSS parsing logic
    └── utils.ts           # General utilities
```

## API Endpoints

### Feeds
- `GET /api/feeds` - List all feeds
- `POST /api/feeds` - Add new feed
- `GET /api/feeds/[id]` - Get specific feed
- `PATCH /api/feeds/[id]` - Update feed
- `DELETE /api/feeds/[id]` - Delete feed
- `POST /api/feeds/[id]/refresh` - Manually refresh feed

### Articles
- `GET /api/articles` - List articles with filtering
- `GET /api/articles/[id]` - Get specific article
- `PATCH /api/articles/[id]` - Update article (mark read/unread)
- `GET /api/articles/sales-intelligence` - Get high-relevance articles

### System
- `POST /api/cron/start` - Start automatic fetching

## Development

### Database Changes
After modifying the Prisma schema:

```bash
npx prisma generate
npx prisma db push
```

### Type Checking
```bash
npx tsc --noEmit
```

### Linting
```bash
npm run lint
```

### Building for Production
```bash
npm run build
```

## Troubleshooting

### Common Issues

1. **Database connection errors:** Verify PostgreSQL is running and DATABASE_URL is correct
2. **OpenAI API errors:** Check your API key and ensure you have sufficient credits
3. **RSS parsing errors:** Some feeds may have CORS issues or be temporarily unavailable
4. **Build errors:** Ensure all dependencies are installed with `npm install`

### Logs
- RSS fetching logs are displayed in the console
- API errors are logged to the server console
- AI evaluation errors are handled gracefully and logged

## License

This project is proprietary software developed for Vahle Denmark.