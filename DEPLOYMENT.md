# Deployment Guide - Voice Agent Bonanza

This guide covers deploying the Voice Agent Bonanza platform to production on Vercel with Supabase PostgreSQL.

## Prerequisites

- ✅ GitHub account with code pushed to repository
- ✅ [Vercel account](https://vercel.com) (free tier works)
- ✅ [Supabase project](https://supabase.com) created
- ✅ [Vapi account](https://vapi.ai) with API keys

## Step 1: Prepare Environment Variables

Collect these values before deployment. **Do not commit them to GitHub.**

```bash
# Database (Supabase)
# Get from: Supabase Dashboard → Project Settings → Database → Connection String
# Use "Transaction Mode" connection string (pooler.supabase.com)
POSTGRES_URL="postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# Vapi API Keys
# Get from: Vapi Dashboard → Settings
VAPI_PRIVATE_KEY="sk_..."
NEXT_PUBLIC_VAPI_PUBLIC_KEY="pk_..."

# Authentication
# Choose a strong password for admin access
ADMIN_PASSWORD="your_strong_secure_password_here"

# Note: NODE_ENV is automatically set to 'production' by Vercel
```

### Getting Supabase Connection String

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **Database**
4. Under "Connection String", select **Transaction Mode**
5. Copy the connection string (it includes the password)
6. The format will be: `postgres://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres`

### Getting Vapi API Keys

1. Go to [Vapi Dashboard](https://dashboard.vapi.ai)
2. Navigate to **Settings** or **API Keys**
3. Copy both:
   - **Private Key** (starts with `sk_`) - for server-side operations
   - **Public Key** (starts with `pk_`) - for client-side voice calls

## Step 2: Set Up Production Database

Since the `/api/db-setup` endpoint is disabled in production for security, you must run the schema manually in Supabase.

### Option A: Using Supabase SQL Editor (Recommended)

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire contents of `production-schema.sql` from this repository
6. Paste into the SQL editor
7. Click **Run** or press `Ctrl+Enter`
8. Verify success: You should see "agents" and "calls" in the results

### Option B: Using psql Command Line

```bash
# Replace with your actual connection string
psql "postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres" < production-schema.sql
```

### Verify Database Setup

Run this query in Supabase SQL Editor to confirm tables exist:

```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('agents', 'calls')
ORDER BY table_name, ordinal_position;
```

## Step 3: Deploy to Vercel

### 3.1 Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. **Import Git Repository**:
   - If first time: Click **Add GitHub Account** and authorize Vercel
   - Select your repository: `your-username/voice-agent-bonanza`
4. Click **Import**

### 3.2 Configure Project

**Framework Preset**: Next.js (should auto-detect)

**Root Directory**: `./` (or leave as-is)

**Build Command**: `npm run build`

**Output Directory**: `.next` (default for Next.js)

**Install Command**: `npm install`

### 3.3 Add Environment Variables

In the Vercel project configuration:

1. Scroll to **Environment Variables** section
2. Add each variable:
   - **Name**: `POSTGRES_URL`
   - **Value**: Your Supabase connection string
   - **Environments**: Select **Production**, **Preview**, and **Development**
   - Click **Add**

3. Repeat for all variables:
   - `POSTGRES_URL`
   - `VAPI_PRIVATE_KEY`
   - `NEXT_PUBLIC_VAPI_PUBLIC_KEY`
   - `ADMIN_PASSWORD`

**Important**:
- `NEXT_PUBLIC_*` variables are exposed to the browser
- `NODE_ENV` is automatically set to `production` by Vercel

### 3.4 Deploy

1. Click **Deploy**
2. Wait for build to complete (2-3 minutes)
3. Vercel will provide a deployment URL: `https://your-project.vercel.app`

## Step 4: Configure Vapi Webhook

Once deployed, configure Vapi to send call data to your webhook endpoint.

1. Go to [Vapi Dashboard](https://dashboard.vapi.ai)
2. Navigate to **Settings** → **Server URL** (or **Webhooks**)
3. Set the **Server URL** to:
   ```
   https://your-project.vercel.app/api/webhooks/vapi
   ```
4. Save changes

**What this does**: After each call ends, Vapi will POST call data (transcript, cost, duration) to this endpoint, which stores it in your database.

## Step 5: Verify Deployment

### Test Checklist

- [ ] **Home Page Loads**: Visit `https://your-project.vercel.app`
- [ ] **Security**: Visit `https://your-project.vercel.app/api/db-setup` → Should return `403 Forbidden`
- [ ] **Login**: Go to `/login` → Enter `ADMIN_PASSWORD` → Should redirect to `/admin`
- [ ] **Create Agent**: In admin dashboard → Create new agent
- [ ] **Voice Test**: Visit agent page `/agent/[agent-name]` → Start call → Verify voice connection works
- [ ] **Call History**: After call → Check `/admin/calls` → Call should appear with transcript and cost
- [ ] **Analytics**: Visit `/admin/analytics` → Verify charts load (may be empty initially)

### Troubleshooting

#### Database Connection Errors

**Error**: `connection refused` or `authentication failed`

**Solutions**:
1. Verify `POSTGRES_URL` in Vercel environment variables
2. Ensure you're using the **Transaction Mode** pooler connection string
3. Check Supabase project is active and database is running
4. Verify password is correct in connection string

#### Vapi Connection Issues

**Error**: Calls not appearing in database

**Solutions**:
1. Verify webhook URL in Vapi dashboard is correct
2. Check Vercel deployment logs for webhook errors
3. Ensure `VAPI_PRIVATE_KEY` is set in Vercel
4. Test webhook manually:
   ```bash
   curl -X POST https://your-project.vercel.app/api/webhooks/vapi \
     -H "Content-Type: application/json" \
     -d '{"message":{"type":"end-of-call-report","call":{"id":"test"}}}'
   ```

#### Authentication Issues

**Error**: Stuck at login or 401 errors

**Solutions**:
1. Verify `ADMIN_PASSWORD` is set in Vercel
2. Clear browser cookies and try again
3. Check Vercel logs for JWT verification errors

## Step 6: Post-Deployment Tasks

### Set Custom Domain (Optional)

1. In Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your custom domain (e.g., `voiceagents.yourdomain.com`)
3. Follow Vercel's DNS configuration instructions
4. Update Vapi webhook URL to use custom domain

### Enable Analytics (Optional)

Vercel provides free analytics:
1. Go to **Analytics** tab in your project
2. Enable Web Analytics
3. View real-time traffic and performance metrics

### Monitor Logs

View deployment and runtime logs:
1. Vercel Dashboard → Your Project → **Logs** tab
2. Filter by type: Build, Runtime, or Webhook errors
3. Useful for debugging production issues

### Set Up Alerts (Optional)

1. Vercel Dashboard → Your Project → **Settings** → **Notifications**
2. Enable email/Slack notifications for:
   - Deployment failures
   - Runtime errors
   - Performance issues

## Environment-Specific Behavior

### Development (`NODE_ENV=development`)
- Test endpoints enabled: `/api/db-setup`, `/api/db-test`, `/api/vapi-test`
- Verbose error messages
- Source maps enabled

### Production (`NODE_ENV=production`)
- Test endpoints return `403 Forbidden`
- Error messages sanitized
- Code optimized and minified
- Middleware rate limiting active

## Security Features

### Implemented Protections

1. **Test Endpoint Lockdown**: All `/api/db-*` and `/api/vapi-test` endpoints blocked in production
2. **JWT Authentication**: Admin routes protected with secure JWT tokens
3. **Rate Limiting**: Webhook endpoint limited to 100 requests/minute per IP
4. **Environment Isolation**: Secrets never exposed to client-side code
5. **HTTPS Only**: Enforced by Vercel (automatic SSL certificates)

### Security Best Practices

- ✅ Never commit `.env.local` or secrets to GitHub
- ✅ Use strong, unique passwords for `ADMIN_PASSWORD`
- ✅ Rotate Vapi API keys if compromised
- ✅ Monitor Vercel logs for suspicious activity
- ✅ Keep dependencies updated: `npm audit fix`

## Updating Production

### Deploy Code Changes

1. Push changes to GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. Vercel automatically detects the push and deploys

3. Monitor deployment in Vercel Dashboard

### Update Environment Variables

1. Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Edit the variable
3. **Important**: Redeploy after changing variables:
   - Go to **Deployments** tab
   - Click "..." on latest deployment → **Redeploy**

### Database Migrations

When adding new tables/columns:

1. Create migration SQL file
2. Run in Supabase SQL Editor
3. Update TypeScript types if needed
4. Deploy code changes

## Rollback Procedure

If deployment has issues:

1. Vercel Dashboard → Your Project → **Deployments**
2. Find previous working deployment
3. Click "..." → **Promote to Production**
4. Previous version is instantly restored

## Cost Estimates

### Free Tier Limits

- **Vercel**: 100GB bandwidth/month, unlimited deployments
- **Supabase**: 500MB database, 2GB bandwidth, 50,000 monthly active users
- **Vapi**: Varies by plan, check [Vapi Pricing](https://vapi.ai/pricing)

### Estimated Costs (Low Traffic)

- Vercel: $0/month (free tier)
- Supabase: $0/month (free tier)
- Vapi: ~$0.02-0.05 per minute of voice calls

## Support

### Documentation Links

- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vapi Docs](https://docs.vapi.ai)

### Common Issues

See [Troubleshooting](#troubleshooting) section above or check:
- Vercel deployment logs
- Supabase database logs
- Vapi webhook logs

## Checklist Summary

Before going live:

- [ ] Database schema created in Supabase
- [ ] All environment variables set in Vercel
- [ ] Application deployed successfully
- [ ] Vapi webhook configured
- [ ] Test admin login works
- [ ] Test agent creation works
- [ ] Test voice call works
- [ ] Test call appears in history
- [ ] Security endpoints return 403

**Congratulations! Your voice agent platform is now live in production. 🎉**
