# CCIRP Frontend — Current Progress

## Completed Features

### 1. UI/UX Architecture
- **Design system**: Tailwind CSS with HSL root variables, dark-first theme. No DaisyUI badge classes — all status indicators use inline Tailwind classes for consistency.
- **DashboardLayout**: Collapsible sidebar + header shell shared across all authenticated routes.
- **Animations**: `animate-fade-in`, `animate-fade-up`, shimmer loading states.
- **Glassmorphism**: `backdrop-blur`, translucent `bg-card/90` surfaces throughout.

### 2. Authentication
- `AuthProvider` React context wrapping the app; stores JWT in `localStorage`.
- `fetchAPI` wrapper in `libs/api.ts` auto-injects `Authorization: Bearer` header and handles 401 refresh.
- Route guards: unauthenticated users redirected to `/login` from all protected routes.
- Endpoints: `/auth/login`, `/auth/register`, `/auth/refresh`.

### 3. Template Workbench
- Visual drag-and-drop canvas editor with infinite dotted grid, Ctrl+Wheel zoom, Spacebar-drag pan.
- Layers panel, typography/color/layout property inspector.
- Template library with category pills and version badges.
- Template version history with rollback.
- `TestSendModal`: dispatches a real email with sample merge data.

### 4. Campaign Creation Wizard (`app/campaigns/new/page.tsx`)
Five-step wizard:

**Step 1 — Campaign Details**: Name, subject, channel toggles (Email / SMS / WhatsApp), dispatch time (`datetime-local`), tags.

**Step 2 — Select Template**: Grid of template cards; selecting resets merge data.

**Step 3 — Merge Fields**: Custom `{{field}}` values extracted from selected template.
- **AI Fill Assist panel**: textarea for free-text intent description + "Auto-fill Fields" button. Calls `POST /ai/fill-merge-fields`. Fills all non-auto fields (auto fields like `{{name}}` and `{{email}}` are injected at dispatch time). User can edit any value after fill. Ctrl+Enter triggers fill.
- Live template preview panel (sticky on xl+) updates as fields are typed.

**Step 4 — Audience**: Static groups, dynamic group preferences (with top-K override and live preview), individual user selection, "Select All / Deselect All". Phone-readiness warning for SMS/WhatsApp campaigns.

**Step 5 — Review**: Summary cards, merge field values, dynamic audience tags, scheduled time, spam check gate before submit.

### 5. Campaigns List (`app/campaigns/page.tsx`)
- Filterable by status, searchable by name/recipient (supports regex search).
- Paginated (20 per page).
- Per-campaign actions:
  - **Analytics** link → `/dashboard/campaigns/{id}`
  - **Retry** button (RotateCcw icon) — only rendered for `failed` or `partially_sent` campaigns. Calls `POST /campaigns/{id}/retry`, shows spinner on that row, refreshes list on completion.
  - Duplicate, More (currently visual-only placeholders).
- Status badges use proper Tailwind classes per status.

### 6. Sender Analytics Dashboard (`app/dashboard/page.tsx`)
- **KPI cards**: Total Sent, Open Rate, Click Rate, Active Campaigns.
- **30-day trend chart** (Recharts `AreaChart`): Opened (blue), Clicked (pink `#EC4899`), Unsubscribed (red dashed `#EF4444`) lines with gradient fills.
- **Top Engaged Segments**: Tag-level open/click counts with progress bars.
- **Recent Campaigns table**: Status badges, scheduled time (displayed in local timezone), action buttons always visible.
  - "View all →" link to `/campaigns`.
  - "Export All" button → `GET /analytics/overview/export` CSV download.
- Status badge helper `statusStyle()` returns inline Tailwind classes (not DaisyUI).

### 7. Campaign Analytics Detail (`app/dashboard/campaigns/[id]/page.tsx`)
- Page header shows actual `campaign_name` from analytics response (not raw ID).
- KPI cards: Total Sent, Delivered, Unique Opens, Unique Clicks.
- Delivery timeline chart (hourly, 72h).
- Recipient activity table with per-recipient status.
- **Top Clicked Links panel**: ranked URLs with progress bars, total/unique click counts. Shown only when link data is non-empty.
- **Export Campaign** button: filename uses `campaign_name` (previously used literal `'data'`).
- **Export Links** button: appears only when link data is available → `GET /analytics/campaigns/{id}/links/export`.

### 8. Recipient Profile (`app/recipients/[id]/page.tsx`)
- **4 KPI cards**: Total Opens, Total Clicks, Bounces, Delivery Failures.
- **Activity timestamps**: Last Opened, Last Clicked, Last Bounced, Unsubscribed At.
- **Campaign history list**: campaigns the recipient was part of, with per-campaign open/click/delivery status and resolved campaign names.

### 9. AI Assistant (`app/ai/page.tsx`)
- Full chat interface streaming SSE from `POST /ai/chat`.
- Tool use shown inline (tool_start / tool_result events).
- Conversation history: sidebar listing past conversations, create new / delete.
- Markdown rendering for AI responses.

### 10. API Client (`libs/api.ts`)
All backend communication centralized. Key namespaces:

**`api.campaigns`**
- `list()`, `get(id)`, `create(data)`, `getAnalytics(id)`, `checkSpam(data)`, `retry(id)`

**`api.analytics`**
- `getOverview()`, `getCampaignAnalytics(id)`, `getCampaignLinks(id)`, `getRecipientHistory(id, limit)`, `exportCampaignAnalytics(id, name)`, `exportCampaignLinkAnalytics(id, name)`, `exportOverviewAnalytics()`

**`api.ai`**
- `streamChat(conversationId, message)` — async generator yielding SSE events
- `listConversations()`, `getConversation(id)`, `deleteConversation(id)`
- `fillMergeFields({ intent, campaign_name, subject, merge_fields })` → `{ values: Record<string, string> }`

**`api.recipients`** — list, get, create, update, delete

**`api.groups`** — static groups CRUD, dynamic preferences, resolve, AI segmentation

**`api.templates`** — list, get, create, update, delete, preview, testSend

**`api.auth`**, **`api.users`**, **`api.settings`**

Key interfaces added/updated:
- `EngagementStats`: `bounce_count`, `delivery_failure_count`, `last_bounced_at`, `unsubscribed_at`
- `CampaignAnalyticsResponse`: `campaign_name`, `campaign_channels`
- `CampaignLinkStat`, `CampaignLinkAnalyticsResponse`
- `RecipientEngagementHistoryResponse`, `CampaignEngagementHistory`
- `TopTag`

---

## App Structure

```
app/
├── layout.tsx               # Root layout, AuthProvider
├── page.tsx                 # Redirects to /dashboard or /login
├── login/ register/         # Public auth pages
├── dashboard/
│   ├── page.tsx             # Sender analytics overview
│   └── campaigns/[id]/
│       └── page.tsx         # Campaign analytics detail
├── campaigns/
│   ├── page.tsx             # Campaign list with retry
│   └── new/
│       └── page.tsx         # 5-step campaign wizard with AI fill
├── templates/
│   ├── page.tsx             # Template library
│   ├── new/page.tsx         # Create template
│   └── [id]/edit/page.tsx   # Visual editor
├── recipients/
│   ├── page.tsx             # Recipient list
│   └── [id]/page.tsx        # Recipient profile with engagement KPIs
├── groups/page.tsx          # Static & dynamic group management
├── ai/page.tsx              # AI assistant chat
└── settings/page.tsx        # User settings

components/
├── layout/DashboardLayout   # Sidebar + header
└── templates/               # Drag-and-drop canvas components

libs/
├── api.ts                   # All API calls + TypeScript interfaces
├── search.ts                # Regex-aware search pattern parsing
└── useQueryParamState.ts    # URL query param state hook
```

