# Unexpected Blockage #1: Vapi CLI Cannot Set Webhook URL

## Issue Discovery

During deployment, we discovered that the Vapi CLI (`vapi listen`) **cannot** be used to set the production webhook URL for your Vapi account.

## The Problem

**Initial Assumption**: We could use the Vapi CLI to configure the server URL programmatically.

**Reality**:
1. **Vapi CLI (`vapi listen`)** is only for local development - it forwards webhooks to your local machine but doesn't set the server URL in your Vapi account
2. **No API endpoint exists** for setting the account-wide server URL programmatically
3. **Must use Vapi Dashboard** - The webhook/server URL can only be configured through the web interface at https://dashboard.vapi.ai

## The Solution

### Manual One-Time Setup Required

You **must** manually configure the webhook URL through the Vapi Dashboard:

1. Log into Vapi Dashboard (web interface)
2. Go to **Settings → Server URL** (or Organization Settings)
3. Set it to: `https://voice-agent-bonanza-b6j7qibl-stewart-alsops-projects.vercel.app/api/webhooks/vapi`
4. Save

### Why This Matters

- This is a **one-time manual setup**
- After configuration, all calls automatically send data to your Vercel webhook
- Cannot be automated or scripted
- Must be done through web interface

## Impact on Deployment

- **Deployment Automation**: Cannot fully automate Vapi integration without manual dashboard step
- **Documentation Required**: Must explicitly document this manual step in deployment guide
- **New Developers**: Anyone setting up the project needs dashboard access to configure webhook
- **Environment Changes**: Changing from staging to production requires manual dashboard update

## Lessons Learned

1. **Don't assume CLI tools have full feature parity** with web dashboards
2. **Verify capabilities before designing workflows** that depend on programmatic configuration
3. **Document manual steps prominently** in deployment guides
4. **SaaS limitations** - Not all configuration can be automated, especially for security-sensitive settings like webhook URLs

## Related Files

- `DEPLOYMENT.md` - Includes webhook configuration instructions
- `src/app/api/webhooks/vapi/route.ts` - Webhook endpoint that receives Vapi data

## References

- Vapi Dashboard: https://dashboard.vapi.ai
- Vapi CLI is for local development only
- Server URL configuration is account-wide and manual
