# CCIRP Frontend

## Overview

The **CCIRP Frontend** is the user interface of the **Central Communication and Intelligent Reminder Platform** — a multi-channel campaign platform for email, SMS, and WhatsApp. Built on Next.js with a premium dark-mode design system.

---

## Tech Stack

| Component | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS (HSL design tokens, dark-first) |
| Charts | Recharts |
| Icons | Lucide React |
| HTTP | Native `fetch` with auth interceptor |

---

## Project Structure

```
app/
├── layout.tsx               # Root layout, AuthProvider
├── dashboard/
│   ├── page.tsx             # Sender analytics overview
│   └── campaigns/[id]/      # Campaign analytics detail
├── campaigns/
│   ├── page.tsx             # Campaign list with retry
│   └── new/page.tsx         # 5-step campaign creation wizard
├── templates/               # Template library + visual editor
├── recipients/
│   ├── page.tsx             # Recipient list
│   └── [id]/page.tsx        # Recipient engagement profile
├── groups/page.tsx          # Static & dynamic audience groups
├── ai/page.tsx              # AI assistant chat
└── settings/page.tsx        # User settings

components/
├── layout/DashboardLayout   # Sidebar + header
└── templates/               # Drag-and-drop canvas blocks

libs/
├── api.ts                   # All API calls + TypeScript interfaces
├── search.ts                # Regex-aware search parsing
└── useQueryParamState.ts    # URL query param state sync

Technical_Specifications.pdf   # Formal technical specifications document
current_progress.md            # Detailed feature progress tracker
```

---

## Installation

```bash
cd CCIRP-fe
npm install
# or if peer dep conflicts:
npm install --legacy-peer-deps
```

---

## Running

```bash
npm run dev       # http://localhost:3000
npm run build     # production build
npm start         # serve production build
npm run lint      # ESLint
```

---

## Environment Variables

Create `.env.local` in `CCIRP-fe/`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

## Features

### Sender Analytics Dashboard
- KPI cards: Total Sent, Open Rate, Click Rate, Active Campaigns.
- 30-day area chart with Opened (blue), Clicked (pink), Unsubscribed (red dashed) lines.
- Top Engaged Segments section: tag-level performance with progress bars.
- Recent Campaigns table: live status badges, scheduled time in local timezone, always-visible action buttons.
- "Export All" button downloads a CSV summary of all campaigns.

### Campaign Creation Wizard (5 steps)
1. **Campaign Details** — name, subject, channel toggles, scheduled dispatch time, tags.
2. **Select Template** — grid picker from template library.
3. **Merge Fields** — fill `{{field}}` values for the selected template.
   - **AI Fill Assist**: describe campaign intent in a textarea; "Auto-fill Fields" calls `POST /ai/fill-merge-fields` and populates all fields. All values remain editable. Ctrl+Enter submits.
   - Live preview panel updates in real time.
4. **Audience** — static groups, dynamic groups (with top-K override + live preview), individual recipients, phone-readiness warnings.
5. **Review** — summary, spam check gate, final submit.

### Campaign List
- Filter by status, search by name/recipient (regex-aware).
- Paginated (20/page).
- **Retry button** (shown only for `failed` / `partially_sent`): calls `POST /campaigns/{id}/retry`, shows per-row spinner, refreshes list.

### Campaign Analytics Detail
- Actual campaign name in page header.
- KPI cards, hourly delivery timeline, recipient activity table.
- **Top Clicked Links** panel with progress bars (hidden if no link data).
- **Export Campaign** CSV (correct filename from `campaign_name`).
- **Export Links** CSV (shown only when link data is available).

### Recipient Profile
- 4 KPI cards: Opens, Clicks, Bounces, Delivery Failures.
- Activity timestamps: Last Opened, Last Clicked, Last Bounced, Unsubscribed At.
- Campaign history list with per-campaign engagement status.

### AI Assistant
- Streaming chat interface (SSE) backed by the Gemini agent.
- Tool calls shown inline with results.
- Sidebar with conversation history; create new / delete conversations.

### Template Workbench
- Infinite canvas editor (zoom + pan), layers panel, property inspector.
- Version history with rollback.
- Test-send with real email dispatch.

---

## API Client (`libs/api.ts`)

All backend communication through typed methods:

```typescript
api.campaigns.list()
api.campaigns.create(data)
api.campaigns.retry(id)
api.campaigns.getAnalytics(id)
api.campaigns.checkSpam(data)

api.analytics.getOverview()
api.analytics.getCampaignAnalytics(id)
api.analytics.getCampaignLinks(id)
api.analytics.getRecipientHistory(id, limit)
api.analytics.exportCampaignAnalytics(id, name)
api.analytics.exportCampaignLinkAnalytics(id, name)
api.analytics.exportOverviewAnalytics()

api.ai.streamChat(conversationId, message)  // AsyncGenerator<SSEEvent>
api.ai.fillMergeFields({ intent, campaign_name, subject, merge_fields })
api.ai.listConversations()
api.ai.getConversation(id)
api.ai.deleteConversation(id)

api.recipients.list()
api.recipients.get(id)
api.groups.list()
api.groups.listDynamicPreferences()
api.groups.resolveDynamicGroups(requests)
api.templates.list()
api.templates.preview(data)
api.templates.testSend(id, data)
```

---

## Documentation

- **[Technical_Specifications.pdf](Technical_Specifications.pdf)** — Comprehensive formal technical specifications document covering the full-stack CCIRP platform: system architecture, data models, dispatch pipeline, AI agent, tracking system, API reference, frontend specifications, and non-functional requirements.
- **[current_progress.md](current_progress.md)** — Detailed feature-by-feature progress tracker.

---

## Authors

Group 6 — Software Engineering Project, IITH

- CS23BTECH11007 Arnav Maiti
- CS23BTECH11009 Bhumin Hirpara
- CS23BTECH11023 Karan Gupta
- CS23BTECH11048 Pranjal Prajapati
- CS23BTECH11052 Roshan Y Singh
- CS23BTECH11060 Sujal Meshram

*Academic and research use only.*
