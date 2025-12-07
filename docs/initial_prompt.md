# Initial Prompt: Voice Agent Bonanza Project

## Context from Previous Project

This project was initiated as a continuation/evolution from "Step 9" of a previous project. The user noted:

> "stopped on step 9"
>
> "either start over with vapi vercel or evolve it to this probably better to start over - remember vapi has a CLI now"
>
> Reference conversation: https://claude.ai/chat/b801852d-f825-4aad-908e-5d64e450784a

The decision was made to **start fresh** using the new Vapi CLI rather than evolving the previous implementation.

---

## UI/UX Vision (From Screenshots)

### 1. Call Detail Page
![Call Details Screenshot](reference_images/call-detail.png)

**Key Features Identified**:
- Clean card-based layout with "Voice Agent Manager" branding
- **Call Details Section**:
  - Caller: "Maria from ETHcon"
  - Agent: "for-crazy-wisdom-potential-guests"
  - Duration: "3:42" (formatted mm:ss)
  - Timestamp: "Dec 5, 2024 at 2:15 PM"
  - Status: Green "completed" badge

- **Transcript Section**:
  - Chat-style conversation display
  - Role labels: "Assistant" and "User"
  - User avatar icons
  - **Copy** button (to clipboard)
  - **Download .txt** button
  - Example first message: "Hi! Thanks for reaching out about being on Crazy Wisdom. I'd love to learn a bit about you. What's your background?"

**Design Notes**:
- Minimal, clean interface
- Focus on readability
- Back to Call History link at top

---

### 2. Agents Dashboard
![Agents Dashboard Screenshot](reference_images/agents-dashboard.png)

**Key Features Identified**:

**Stats Cards** (Top row):
- **Total Calls**: 5 (+3 today)
- **Avg Duration**: 3:51 (across all agents)
- **Success Rate**: 80% (4 completed)
- **Active Agents**: 3 (4 total)

**Agent Cards** (Grid layout):

1. **for-crazy-wisdom-potential-guests** (Public badge)
   - Total calls: 47
   - Last call: 2 hours ago
   - Blue "Test" button + "Edit" button

2. **ba-treasure-hunt** (Public badge)
   - Total calls: 128
   - Last call: 1 day ago
   - Blue "Test" button + "Edit" button

3. **for-dad-stewart-squared** (Personal badge)
   - For: Dad (Stewart Alsop II)
   - Total calls: 12
   - Last call: 3 days ago
   - Blue "Test" button + "Edit" button

4. **ethcon-demo** (Internal badge)
   - Total calls: 3
   - Last call: 5 days ago
   - Blue "Test" button + "Edit" button

**UI Elements**:
- Top nav: Agents (active), Call History, "+ New Agent" button (blue)
- Helper text: "Click agent name to edit, 'Test' to try it"

---

### 3. Call History Table
![Call History Screenshot](reference_images/call-history.png)

**Key Features Identified**:

**Filters**:
- Agent dropdown: "All Agents"
- Time range: "Last 7 days"

**Table Columns**:
- **Caller**: Name/identifier from intake form
- **Agent**: Agent name (truncated if long)
- **Duration**: Formatted (e.g., "3:42", "1:15", "5:21")
- **When**: Relative time ("2 hours ago", "1 day ago", "3 days ago")
- **Status**: Badge with color
  - Green "completed"
  - Red "dropped"
- **Actions**: Blue "View" link

**Sample Data**:
1. Maria from ETHcon → for-crazy-wisdom-potential-guests → 3:42 → 2 hours ago → ✅ completed
2. Podcast listener - Jake → for-crazy-wisdom-potential-guests → 1:15 → 3 hours ago → ✅ completed
3. Juan - Palermo crew → ba-treasure-hunt → 5:21 → 1 day ago → ✅ completed
4. Unknown player → ba-treasure-hunt → 0:45 → 1 day ago → ❌ dropped
5. Dad (Stewart Alsop II) → for-dad-stewart-squared → 8:12 → 3 days ago → ✅ completed

**Design Notes**:
- Clean table layout
- Status badges use semantic colors (green = success, red = error)
- Relative timestamps for recent calls
- "Last refreshed 5 minutes ago" indicator at top

---

### 4. Template Selection (New Agent Flow)
![Template Selection Screenshot](reference_images/template-selection.png)

**Key Features Identified**:

**Heading**: "Choose a Starting Point"

**Template Cards** (2x2 grid):

1. **🎓 Workshop Bot**
   - "You are a friendly coding workshop assistant helping..."

2. **🗺️ Treasure Hunt Guide**
   - "You are a mysterious guide leading players through an AR..."

3. **🎙️ Podcast Guest Screener**
   - "You are a friendly assistant for Crazy Wisdom podcast. Learn..."

4. **📝 Start from Scratch**
   - (Blank template option)

**Design Notes**:
- Card-based selection
- Emojis for visual distinction
- Preview text shows system prompt snippet
- Equal-sized cards in grid

---

### 5. Agent Configuration Form
![Agent Configuration Screenshot](reference_images/agent-config-form.png)

**Key Features Identified**:

**Basic Fields** (Always visible):
- **Name**: Text input with placeholder "e.g., ethcon-demo-bot"
  - Helper text: "(becomes URL slug)"
- **Agent Type**: Radio buttons
  - ⭕ **Public** - "Shows intake form"
  - ⭕ **Personal** - "For specific person"
  - ⭕ **Internal** - "Admin only"
- **First Message**: Text input
  - Default: "Hey! Welcome to the workshop. What are you excited to build today?"
- **System Prompt**: Textarea
  - Default: "You are a friendly coding workshop assistant helping students learn to build with AI. Be encouraging, explain concepts simply, and celebrate small wins."
- **Voice**: Dropdown
  - Selected: "Rachel (Warm, Professional)"

**Advanced Settings** (Collapsible):
- Collapsed by default with "▼ Advanced Settings" toggle
- When expanded shows:
  - **Model**: Dropdown (default: "GPT-4o")
  - **Temperature**: Number input (default: "0.7")

**Action Buttons**:
- Gray "Cancel" button (left)
- Blue "Create Assistant" button (right)

**Design Notes**:
- Progressive disclosure (advanced settings hidden)
- Clear field labels with helper text
- Sensible defaults pre-filled
- Blue "← Change template" link at top

---

### 6. Advanced Settings Detail
![Advanced Settings Screenshot](reference_images/advanced-settings.png)

**Fields Shown When Expanded**:
- **Model**: Dropdown showing "GPT-4o"
- **Temperature**: Text input showing "0.7"

**Design Notes**:
- Simple, minimal additional fields
- These settings are for power users
- Most users can use defaults

---

## Technical Requirements Summary

### Agent Types
1. **Public**
   - Shows intake form before call
   - Single field: "Your name or how you connected with Stewart"
   - Form submission stores `callerInfo` in metadata

2. **Personal**
   - No intake form
   - Created for specific person (uses `createdFor` field)
   - `createdFor` becomes caller identifier in call history

3. **Internal**
   - Admin testing only
   - Hidden from public agent list
   - Shows "Admin Test" as caller in call history

### Database Schema

**Agents Table**:
- `id` (UUID)
- `name` (unique, becomes URL slug)
- `type` (public/personal/internal)
- `created_for` (for personal agents)
- `vapi_assistant_id`
- `system_prompt`
- `first_message`
- `voice_provider`, `voice_id`
- `model`, `temperature`
- `max_duration_seconds`
- `status`, timestamps

**Calls Table**:
- `id` (UUID)
- `vapi_call_id` (unique)
- `agent_id` (FK)
- `caller` (from form, createdFor, or "Admin Test")
- `started_at`, `ended_at`, `duration_seconds`
- `status` (completed/timed_out/error/no_connection)
- `ended_reason` (raw Vapi code)
- `transcript` (JSONB array)
- `recording_url`
- `cost_total`, `cost_breakdown` (JSONB)
- `metadata` (JSONB)
- `analysis` (JSONB)

### Tech Stack
- **Frontend**: Next.js 15 App Router + React + TypeScript + Tailwind
- **Database**: Vercel Postgres (for both calls and agents)
- **Auth**: Single admin password with cookie-based sessions
- **Voice AI**: Vapi platform with CLI for scaffolding
- **Dev Tools**: Vapi CLI, `vapi listen` + ngrok for local webhook testing

### Core Features
1. **Agent Management**
   - Create agents from templates or scratch
   - Configure name, type, prompts, voice, model settings
   - Edit existing agents (updates both DB and Vapi)
   - Delete agents (removes from both systems)

2. **Call Tracking**
   - Webhook endpoint receives end-of-call-report from Vapi
   - Stores full call data including transcript, costs, analysis
   - Maps Vapi's `endedReason` codes to simplified status badges

3. **Admin Dashboard**
   - Stats overview (total calls, avg duration, success rate, active agents)
   - Agent cards with call counts and last call time
   - Call history table with filtering
   - Detailed call view with transcript, costs, metadata

4. **Public Agent Pages**
   - Dynamic routes: `/agent/[slug]`
   - Intake form for public agents
   - Direct call start for personal agents
   - Vapi SDK integration for in-browser calls

### Environment Variables
```env
# Vapi
VAPI_PRIVATE_KEY=sk_...
NEXT_PUBLIC_VAPI_PUBLIC_KEY=pub_...
VAPI_WEBHOOK_SECRET=...  # optional

# Database
POSTGRES_URL=...
POSTGRES_PRISMA_URL=...
POSTGRES_URL_NON_POOLING=...

# Auth
ADMIN_PASSWORD=...
```

---

## Implementation Phases

The full implementation plan was provided with 7 phases:
1. Project Setup & Database
2. Agent Management API
3. Admin Dashboard UI
4. Webhook System
5. Call History & Analytics
6. Public Agent Pages
7. Environment Variables

Each phase includes specific testable goals and micro-steps for incremental development.

See full implementation plan in the original prompt text above.

---

## Key Design Principles

1. **Progressive Disclosure**: Advanced settings hidden by default
2. **Semantic Colors**: Green = success, Red = error, Blue = primary action
3. **Relative Timestamps**: Human-readable time ("2 hours ago")
4. **Clean Typography**: Minimal, readable, consistent spacing
5. **Card-Based Layouts**: For agents, templates, and detail views
6. **Action-Oriented**: Clear CTAs (Test, Edit, View, Create)
7. **Status Visibility**: Always show call status with color-coded badges

---

## Visual Reference Images

Original screenshots are stored in project documentation for reference:
- `call-detail.png` - Call detail page layout
- `agents-dashboard.png` - Main agents dashboard
- `call-history.png` - Call history table
- `template-selection.png` - Template picker
- `agent-config-form.png` - Agent creation form
- `advanced-settings.png` - Advanced settings detail

---

## Project Outcome

This prompt led to the successful implementation of **Voice Agent Bonanza**, a complete Vapi management and call tracking system deployed to Vercel at:
- **Production URL**: https://voice-agent-bonanza.vercel.app
- **Admin Dashboard**: https://voice-agent-bonanza.vercel.app/admin

The project is now in sustained use and has handled multiple real calls with full transcript recording, cost tracking, and analytics.
