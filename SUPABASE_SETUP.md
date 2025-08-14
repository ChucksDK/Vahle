# Supabase Setup Guide

This guide will help you set up Supabase as the database for your RSS Sales Intelligence application.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `rss-sales-intelligence` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be provisioned (2-3 minutes)

## Step 2: Get Your Project Credentials

Once your project is ready:

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL**: `https://[your-project-ref].supabase.co`
   - **Project Reference ID**: The part between `https://` and `.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`
   - **service_role key**: Another long string starting with `eyJ...`

3. Go to **Settings** → **Database** 
4. Copy the **Connection string** → **Nodejs** connection string

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:

   ```env
   # Replace [YOUR-PASSWORD] with your database password
   # Replace [YOUR-PROJECT-REF] with your project reference ID
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

   # Replace with your actual Supabase values
   NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

   # Add your OpenAI API key
   OPENAI_API_KEY="your-openai-api-key-here"

   # Generate a random secret for NextAuth
   NEXTAUTH_SECRET="your-nextauth-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

## Step 4: Set Up the Database Schema

1. Generate the Prisma client:
   ```bash
   npx prisma generate
   ```

2. Push the schema to Supabase:
   ```bash
   npx prisma db push
   ```

   This will create all the necessary tables in your Supabase database:
   - `Feed` - RSS feed subscriptions
   - `Article` - Fetched articles
   - `AiEvaluation` - AI analysis results

## Step 5: Verify Database Setup

1. Go to your Supabase dashboard
2. Click on **Table Editor**
3. You should see the following tables:
   - `Feed`
   - `Article` 
   - `AiEvaluation`

## Step 6: Start the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)

3. Test the database connection by adding an RSS feed through the UI

## Supabase Features Available

With this setup, you get access to additional Supabase features:

### Real-time Subscriptions (Future Enhancement)
```javascript
// Example: Listen for new articles
const subscription = supabase
  .channel('articles')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'Article' },
    (payload) => console.log('New article:', payload.new)
  )
  .subscribe()
```

### Database Functions (Future Enhancement)
You can create custom PostgreSQL functions in the Supabase dashboard:

1. Go to **Database** → **Functions**
2. Create custom functions for complex queries
3. Call them from your application

### Row Level Security (Future Enhancement)
Enable RLS for secure data access:

1. Go to **Authentication** → **Policies**
2. Create policies to control data access
3. Enable RLS on your tables

## Troubleshooting

### Connection Issues
- Double-check your DATABASE_URL format
- Ensure your database password is correct
- Verify your project reference ID

### Schema Issues
- Run `npx prisma db reset` to reset the database
- Run `npx prisma db push` to recreate tables

### Environment Variables
- Make sure `.env.local` is in your `.gitignore`
- Restart your development server after changing env vars
- Use quotes around values with special characters

### Prisma Issues
- Run `npx prisma generate` after any schema changes
- Check Prisma logs for detailed error messages

## Production Deployment

For production deployment:

1. Use the same DATABASE_URL format
2. Set all environment variables in your hosting platform
3. Run database migrations: `npx prisma migrate deploy`
4. Consider enabling connection pooling in Supabase settings

## Monitoring and Analytics

Supabase provides built-in monitoring:

1. **Database** → **Reports** - Query performance
2. **Database** → **Backups** - Automatic backups
3. **Settings** → **Usage** - Resource usage tracking

## Authentication Features

This application now includes full Supabase authentication:

### 🔐 Authentication Pages
- **Login page**: `/login` - Sign in with email/password  
- **Registration**: Toggle between login/register on the same page
- **User profile**: `/profile` - Manage account and change password

### 🛡️ Protected Routes
- Main RSS application (`/`) requires authentication
- Automatic redirect to login if not authenticated
- Loading states during authentication checks

### 👤 User Management
- User profile section in sidebar showing current email
- Password change functionality
- Secure logout with session cleanup

### 🎨 Danish Interface
All authentication components are in Danish:
- "Log ind" (Login)
- "Opret konto" (Create Account) 
- "Brugerprofil" (User Profile)
- "Skift adgangskode" (Change Password)
- "Log ud" (Logout)

### 🚀 Usage Flow
1. **First Visit**: Users are redirected to `/login`
2. **Registration**: New users can create accounts with email verification
3. **Login**: Existing users sign in with email/password
4. **Main App**: Access RSS Sales Intelligence with full functionality
5. **Profile Management**: Users can update passwords and manage accounts
6. **Logout**: Secure logout returns users to login page

### 🔒 Security Features
- ✅ Client-side route protection
- ✅ Server-side authentication context
- ✅ Secure password updates
- ✅ Session management
- ✅ Email verification support
- ✅ Loading states and error handling

### 📧 Email Configuration (Optional)
To enable email verification and password reset:

1. Go to **Authentication** → **Settings** in Supabase
2. Configure SMTP settings or use Supabase's built-in email
3. Customize email templates for your brand

Your RSS Sales Intelligence application is now powered by Supabase with full authentication! 🚀