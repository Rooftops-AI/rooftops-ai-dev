# Pipedream Integration Plan

## Current State

**What Works:**
- ✅ Users can connect apps via Pipedream OAuth (Google Sheets, Docs, etc.)
- ✅ Connected apps are stored in database and shown in UI
- ✅ MCP session manager exists (`lib/pipedream/mcp-session.ts`)
- ✅ Tool format conversion exists (`lib/pipedream/tool-handler.ts`)
- ✅ Action confirmation rules exist (`lib/pipedream/action-rules.ts`)
- ✅ `/api/chat/pipedream` route is wired up and working
- ✅ Chat handler routes to Pipedream when user has enabled apps
- ✅ MCP tools are converted to OpenAI format and passed to AI
- ✅ Tool calls are executed via MCP session

**What's Left:**
- ⏳ Configuration flow - when tools need setup (e.g., "which spreadsheet?")
- ⏳ Confirmation UI for write actions (send email, create records, etc.)
- ⏳ Tool usage indicators in chat messages
- ❌ File browser requires paid Pipedream plan (proxy API) - removed

## Goal

Users connect apps → Those apps' tools become available in chat → AI can read/write data → User confirms destructive actions

---

## Phase 1: Wire Up MCP Tools to Chat (Core Integration) ✅ COMPLETED

**Objective:** When a user has connected apps, the AI can use those tools in conversation.

### Task 1.1: Auto-inject Pipedream tools into chat requests ✅

**File:** `components/chat/chat-hooks/use-chat-handler.tsx`

**What was implemented:**
1. Added `pipedreamDataSources` to context destructuring
2. Before the `selectedTools` check, added routing logic for Pipedream:
   - Filters enabled apps from `pipedreamDataSources`
   - If enabled apps exist, routes to `/api/chat/pipedream`
   - Passes `enabledApps` and `chatId` in the request
3. Added error handling for API failures with user-friendly messages

**Implementation:**
```typescript
// In handleSendMessage(), before selectedTools check:
const enabledPipedreamApps = (pipedreamDataSources || [])
  .filter(ds => ds.enabled)
  .map(ds => ds.app_slug)

if (enabledPipedreamApps.length > 0) {
  // Route to Pipedream-enabled chat
  const res = await fetch("/api/chat/pipedream", {
    body: JSON.stringify({ chatSettings, messages, enabledApps, chatId })
  })
  // ... process response
}
```

### Task 1.2: Fix the `/api/chat/pipedream` route ✅

**File:** `app/api/chat/pipedream/route.ts`

**What was implemented:**
1. Fully rewritten to use `MCPSessionManager` with OAuth (not deprecated SSE)
2. Handles streaming responses via OpenAI SDK
3. Converts MCP tools to OpenAI function format
4. Executes tool calls via MCP session
5. Handles confirmation rules for write actions
6. Proper cleanup of MCP session on completion or error

### Task 1.3: Add Pipedream context to chat state ✅

**File:** `context/context.tsx`

**Already exists:**
- `pipedreamConnected: boolean`
- `pipedreamDataSources: Array<{id, app_slug, app_name, enabled}>`
- Synced with `pipedream_data_sources` table via API calls

---

## Phase 2: Handle MCP Tool Configuration Flow

**Objective:** MCP tools often require configuration (selecting a specific spreadsheet, etc.). Handle this gracefully.

### Task 2.1: Configuration state management

**File:** `lib/pipedream/mcp-session.ts` (extend)

**Changes:**
1. Track tool configuration state per session
2. Store configured tool parameters (e.g., selected spreadsheet ID)
3. Handle `configure_props` tool calls automatically

### Task 2.2: Conversational configuration

**File:** `app/api/chat/pipedream/route.ts`

**Changes:**
1. When MCP returns configuration prompts, translate to natural language
2. AI asks user clarifying questions ("Which spreadsheet?" / "Which document?")
3. Store user's choices for the session

**Example Flow:**
```
User: "Add a row to my spreadsheet"
AI: "I found 3 spreadsheets. Which one would you like to update?"
   - Budget 2024
   - Project Tracker
   - Contacts
User: "Budget 2024"
AI: "What data should I add to Budget 2024?"
```

---

## Phase 3: Confirmation UI for Write Actions

**Objective:** Before sending emails, creating records, or modifying data, get user confirmation.

### Task 3.1: Pending action state

**File:** `context/context.tsx`

**Changes:**
```typescript
pendingPipedreamActions: Array<{
  id: string
  toolName: string
  description: string
  args: Record<string, any>
  expiresAt: Date
}>
```

### Task 3.2: Confirmation component

**File:** `components/chat/pipedream-action-confirmation.tsx` (new)

**Features:**
- Shows pending action details in a clear format
- "Approve" and "Reject" buttons
- Auto-expires after 5 minutes
- Shows what will happen (e.g., "Send email to john@example.com")

### Task 3.3: Integrate confirmation into chat flow

**File:** `app/api/chat/pipedream/route.ts`

**Changes:**
1. Check `requiresConfirmation()` from action-rules.ts
2. If yes, return action as "pending" instead of executing
3. Frontend shows confirmation UI
4. On approval, call `/api/pipedream/confirm` to execute

---

## Phase 4: User Visibility & Feedback

**Objective:** Users should understand what tools are available and see when they're being used.

### Task 4.1: Update connected apps dropdown

**File:** `components/chat/pipedream-data-sources.tsx`

**Changes:**
1. Show available tools count per app
2. Add "What can I do?" examples for each app
3. Toggle to enable/disable apps for current chat

### Task 4.2: Tool usage indicators in chat

**File:** `components/messages/message.tsx`

**Changes:**
1. When AI uses a Pipedream tool, show a subtle indicator
2. Display: "📊 Read from Google Sheets" or "✉️ Sent email via Gmail"
3. Collapsible details showing tool parameters

### Task 4.3: Error handling UI

**Changes:**
1. If MCP connection fails, show reconnect option
2. If tool execution fails, show clear error message
3. If permissions insufficient, guide user to reconnect app

---

## Phase 5: Polish & Edge Cases

### Task 5.1: Session management
- Reuse MCP connections within a chat session
- Clean up connections when chat ends
- Handle connection timeouts gracefully

### Task 5.2: Rate limiting & safety
- Limit tool calls per message
- Prevent infinite loops (tool calls tool calls tool...)
- Log all tool executions for audit

### Task 5.3: Multi-app interactions
- Support using multiple apps in one request
- e.g., "Copy data from Sheets to Docs"

---

## Implementation Order

| Priority | Phase | Task | Effort | Files |
|----------|-------|------|--------|-------|
| 1 | 1.1 | Wire MCP tools to chat | Medium | use-chat-handler.tsx |
| 2 | 1.2 | Fix Pipedream chat route | Medium | api/chat/pipedream/route.ts |
| 3 | 1.3 | Add context state | Small | context.tsx |
| 4 | 2.1 | Config state management | Medium | mcp-session.ts |
| 5 | 2.2 | Conversational config | Large | api/chat/pipedream/route.ts |
| 6 | 3.2 | Confirmation component | Medium | new component |
| 7 | 3.3 | Confirmation flow | Medium | api route + frontend |
| 8 | 4.1 | Update dropdown | Small | pipedream-data-sources.tsx |
| 9 | 4.2 | Tool usage indicators | Medium | message components |
| 10 | 5.x | Polish | Small | various |

---

## Success Criteria

1. **Business Intelligence**: User connects Salesforce → Asks "who are the newest leads from the past 30 days?" → AI queries Salesforce → Returns structured lead data
2. **Cross-system queries**: "What deals in HubSpot are from leads we got via Google Ads?"
3. **Action with confirmation**: User says "send follow-up emails to cold leads" → AI shows what will be sent → User approves → Emails sent
4. **Real-time data**: AI has access to live business data, not stale exports
5. **Clear feedback**: User always knows what systems are being queried and what actions are being taken

## Example Use Cases

| System | Query Example | Action Example |
|--------|---------------|----------------|
| Salesforce | "Show me leads added in the last 30 days" | "Update lead status to Qualified" |
| HubSpot | "What deals are closing this month?" | "Add a note to this contact" |
| Gmail | "Find emails from acme.com this week" | "Send a follow-up to John" |
| Slack | "What were the key messages in #sales today?" | "Post a summary to #team" |
| Google Sheets | "What's our Q4 forecast total?" | "Add this row to the tracker" |
| Asana/Monday | "What tasks are overdue?" | "Create a task for the team" |

---

## Files to Create/Modify

### New Files
- `components/chat/pipedream-action-confirmation.tsx` - Confirmation modal
- `app/api/pipedream/confirm/route.ts` - Execute confirmed action
- `lib/pipedream/config-manager.ts` - Tool configuration state

### Modified Files
- `components/chat/chat-hooks/use-chat-handler.tsx` - Route to Pipedream endpoint
- `app/api/chat/pipedream/route.ts` - Fix and enhance
- `context/context.tsx` - Add Pipedream state
- `lib/pipedream/mcp-session.ts` - Add config handling
- `components/chat/pipedream-data-sources.tsx` - Better UX
- `components/messages/message.tsx` - Tool usage display

---

## Estimated Timeline

- **Phase 1 (Core)**: 1-2 days - Get basic read operations working
- **Phase 2 (Config)**: 1 day - Handle tool configuration flow
- **Phase 3 (Confirmation)**: 1 day - Write action confirmation
- **Phase 4 (Visibility)**: 0.5 days - UI polish
- **Phase 5 (Polish)**: 0.5 days - Edge cases

**Total: ~4-5 days for full integration**

---

## Quick Win (Start Here)

The fastest path to value:

1. **Task 1.1 + 1.2**: Wire up existing `/api/chat/pipedream` route
2. Test with a simple read operation: "List my Google Sheets"
3. Iterate from there

This gets the core loop working, then we layer on configuration and confirmation.
