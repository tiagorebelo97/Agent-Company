# Testing Guide for Agent-Company Features

This document provides step-by-step testing procedures for the 5 phases of features implemented.

## Prerequisites

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. Start the dashboard:
   ```bash
   cd apps/dashboard
   npm run dev
   ```

3. Create a test project with a local repository path.

---

## Phase 1: File Explorer + Editor Testing

### Test 1.1: Verify Folders Appear Before Files ✓
**Steps:**
1. Navigate to Project Workspace
2. Select a project with both folders and files
3. Click on "File Explorer" in the sidebar

**Expected Result:**
- Folders are listed before files in alphabetical order
- Each folder has a folder icon (📁)
- Each file has an appropriate icon based on extension

### Test 1.2: Open Various File Types ✓
**Steps:**
1. In File Explorer, click on different file types:
   - `.js`, `.jsx`, `.ts`, `.tsx` files
   - `.json`, `.yaml` files
   - `.md`, `.txt` files
   - Image files (`.png`, `.jpg`)

**Expected Result:**
- Monaco editor opens for text files
- Syntax highlighting is applied correctly for each language
- Images display properly (base64 encoded)

### Test 1.3: Edit and Save Files ✓
**Steps:**
1. Open a `.js` file
2. Make changes to the content
3. Click "Save" button
4. Reopen the same file

**Expected Result:**
- "Unsaved changes" indicator appears when editing
- Save button becomes enabled
- Changes persist after saving and reopening

### Test 1.4: Syntax Highlighting ✓
**Steps:**
1. Open files of different types:
   - JavaScript: Check for keywords, strings, comments
   - Python: Check for indentation, keywords
   - JSON: Check for object syntax
   - Markdown: Check for headers, links

**Expected Result:**
- Each language displays appropriate syntax highlighting
- Code is readable and properly formatted

---

## Phase 2: Git Operations Testing

### Test 2.1: Git Status Shows Correct State
**Steps:**
1. Select a project with a git repository
2. Navigate to "Git Operations" view
3. Observe the status display

**Expected Result:**
- Current branch name is displayed
- Number of modified files shown
- Number of staged files shown
- Number of commits ahead/behind displayed

### Test 2.2: Git Pull Updates Project Files
**Steps:**
1. Make changes to the remote repository (simulate external changes)
2. Click "Pull" button in Git Operations
3. Check File Explorer for updated files

**Expected Result:**
- Success message displayed
- Files are updated in the File Explorer
- Status is refreshed automatically

### Test 2.3: Git Commit and Push
**Steps:**
1. Make changes to a file in the editor
2. Save the file
3. Go to Git Operations view
4. Enter commit message
5. Click "Commit Changes"
6. Click "Push" button

**Expected Result:**
- Commit succeeds with success message
- Push operation completes
- Remote repository receives changes
- Status shows 0 commits ahead

### Test 2.4: Git Status Real-time Updates
**Steps:**
1. Keep Git Operations view open
2. Edit and save a file
3. Click refresh button

**Expected Result:**
- Modified files count increases
- Status refreshes to show changes

---

## Phase 3: Recommendation Implementation Testing

### Test 3.1: View Recommendations
**Steps:**
1. Select a project
2. Navigate to "Recommendations" view
3. Observe the list

**Expected Result:**
- Recommendations are displayed with:
  - Title and description
  - Priority badge (high/medium/low)
  - Category tag
  - Status indicator

### Test 3.2: Click "Implement" Creates Task
**Steps:**
1. Find a pending recommendation
2. Click "Implement" button
3. Navigate to "Kanban Board" view

**Expected Result:**
- Success message appears
- Task is created with title "Implement: [recommendation title]"
- Task appears in "To Do" column
- Recommendation status changes to "implemented"

### Test 3.3: Task Assigned to Correct Agents
**Steps:**
1. Implement a recommendation
2. Check the created task details
3. Verify agents assigned

**Expected Result:**
- Task has at least one agent assigned (PM by default)
- Task includes recommendation context in requirements
- Task type is "recommendation_implementation"

### Test 3.4: Recommendation Marked as Implemented
**Steps:**
1. After implementing a recommendation
2. Filter recommendations by "Implemented" status
3. Check the timestamp

**Expected Result:**
- Recommendation shows "implemented" status
- Implementation date is displayed
- "Implement" button is no longer shown

### Test 3.5: Filter Recommendations
**Steps:**
1. Use the filter dropdown
2. Select different statuses: All, Pending, Implemented, Dismissed

**Expected Result:**
- List updates to show only recommendations matching the filter
- Count updates accordingly

---

## Phase 4: Agent Assignment Testing

### Test 4.1: View Agent Assignment UI
**Steps:**
1. Select a project
2. Navigate to "Team Assignment" view in the sidebar
3. Observe the interface

**Expected Result:**
- Three sections displayed: AI Suggested Agents, Assigned Team, Available Agents
- Statistics showing assigned/available/suggested counts
- Agents displayed with emoji, name, and role

### Test 4.2: Assign Agents from Available Pool
**Steps:**
1. In the Team Assignment view
2. Click on an agent in the "Available Agents" section
3. Observe the change

**Expected Result:**
- Agent moves from "Available Agents" to "Assigned Team"
- Success message appears
- Statistics update immediately
- Changes are saved automatically

### Test 4.3: Unassign Agents
**Steps:**
1. In the "Assigned Team" section
2. Click the trash icon on an assigned agent
3. Observe the change

**Expected Result:**
- Agent moves from "Assigned Team" back to "Available Agents"
- Success message appears
- Statistics update
- Changes persist after page refresh

### Test 4.4: Assign All Suggested Agents
**Steps:**
1. If AI-suggested agents are shown (from project analysis)
2. Click "Assign All" button in the suggested section
3. Observe the change

**Expected Result:**
- All suggested agents move to "Assigned Team"
- Suggested section disappears or updates
- Single success message for batch operation

### Test 4.5: Assign Individual Suggested Agent
**Steps:**
1. Click on an individual suggested agent
2. Observe the change

**Expected Result:**
- Agent moves to "Assigned Team"
- Agent is removed from suggested list
- Success message appears

### Test 4.6: Agents Receive Project Context
**Steps:**
1. Assign agents to a project
2. Create a task in that project
3. Check if agents have project context when executing

**Expected Result:**
- Agents can access project information
- Project local path is available
- Project description/requirements are accessible

### Test 4.7: Agent Responses Use Project Knowledge
**Steps:**
1. Create a task with project-specific questions
2. Assign to an agent that's part of the project team
3. Check agent's response

**Expected Result:**
- Agent response references project-specific information
- Agent uses context from project files if applicable

### Test 4.8: Persistence After Refresh
**Steps:**
1. Assign several agents to a project
2. Navigate away to another view
3. Come back to Team Assignment
4. Refresh the page

**Expected Result:**
- All assigned agents are still shown in "Assigned Team"
- Agent assignments persist across navigation and page refreshes

---

## Phase 5: Meeting Rooms Testing

### Test 5.1: Create Meeting with Multiple Agents
**Steps:**
1. Navigate to "Meeting Rooms" view
2. Click "New Meeting" button
3. Enter meeting title and description
4. Select multiple agents (e.g., PM, Frontend, Backend)
5. Click "Create Meeting"

**Expected Result:**
- Meeting is created successfully
- Meeting room opens automatically
- All selected agents are shown as participants

### Test 5.2: Send Messages and Receive Responses
**Steps:**
1. In an active meeting
2. Type a message in the input field
3. Click "Send" or press Enter
4. Wait for agent responses

**Expected Result:**
- User message appears in the transcript
- Each participating agent responds automatically
- Responses appear with agent emoji and name
- Timestamps are displayed for each message

### Test 5.3: All Agents Have Project Context
**Steps:**
1. Create a meeting linked to a specific project
2. Send a project-specific question
3. Check agent responses

**Expected Result:**
- Agent responses reference the project
- Agents can answer questions about project details
- Project name is displayed in meeting header (if linked)

### Test 5.4: Export Meeting Transcript
**Steps:**
1. In an active or completed meeting
2. Click "Export" button
3. Choose format (JSON or Text)
4. Save the file

**Expected Result:**
- File downloads successfully
- JSON format includes:
  - Meeting metadata
  - Participant list
  - Complete transcript with timestamps
- Text format is human-readable with proper formatting

### Test 5.5: Complete Meeting
**Steps:**
1. In an active meeting with some messages
2. Click "Complete" button
3. Try to send a new message

**Expected Result:**
- Meeting status changes to "completed"
- Message input is disabled
- Transcript is preserved
- Export still works

### Test 5.6: Meeting Persistence
**Steps:**
1. Create a meeting and send some messages
2. Close the meeting room
3. Reopen by selecting the same meeting (via API or future UI list)

**Expected Result:**
- All previous messages are loaded
- Participant list is intact
- Can continue the conversation if meeting is active

---

## Integration Testing

### Integration Test 1: Complete Workflow
**Scenario:** Project setup → Analysis → Recommendations → Implementation → Git Operations

**Steps:**
1. Create a new project with local path
2. Run AI Analysis to get recommendations
3. Implement a recommendation as a task
4. Assign agents to the task
5. Make code changes
6. Commit and push changes via Git Operations

**Expected Result:**
- Each step completes successfully
- Data flows correctly between features
- No errors or inconsistencies

### Integration Test 2: Meeting with Multiple Features
**Scenario:** Create meeting → Discuss project → Create recommendation → Implement

**Steps:**
1. Create a meeting with PM and other agents
2. Discuss project requirements
3. PM suggests a recommendation (manual API call)
4. Implement recommendation from Recommendations view
5. Verify task creation
6. Commit related changes

**Expected Result:**
- Meeting provides context for recommendation
- Recommendation leads to actionable task
- Git operations track the implementation

---

## API Testing (Manual)

### Test APIs with curl

**1. Get Project Recommendations:**
```bash
curl http://localhost:3001/api/projects/{projectId}/recommendations
```

**2. Create Recommendation:**
```bash
curl -X POST http://localhost:3001/api/projects/{projectId}/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement caching layer",
    "description": "Add Redis caching for frequently accessed data",
    "priority": "high",
    "category": "performance"
  }'
```

**3. Implement Recommendation:**
```bash
curl -X POST http://localhost:3001/api/recommendations/{recId}/implement \
  -H "Content-Type: application/json" \
  -d '{"agentIds": ["pm"]}'
```

**4. Git Status:**
```bash
curl http://localhost:3001/api/projects/{projectId}/git/status
```

**5. Git Pull:**
```bash
curl -X POST http://localhost:3001/api/projects/{projectId}/git/pull
```

**6. Create Meeting:**
```bash
curl -X POST http://localhost:3001/api/meetings \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sprint Planning",
    "description": "Discuss next sprint tasks",
    "projectId": "{projectId}",
    "agentIds": ["pm", "frontend", "backend"],
    "createdBy": "user"
  }'
```

**7. Send Meeting Message:**
```bash
curl -X POST http://localhost:3001/api/meetings/{meetingId}/messages \
  -H "Content-Type: application/json" \
  -d '{
    "fromId": "user",
    "content": "What tasks should we prioritize?"
  }'
```

**8. Export Meeting:**
```bash
curl http://localhost:3001/api/meetings/{meetingId}/export?format=json -o meeting.json
curl http://localhost:3001/api/meetings/{meetingId}/export?format=text -o meeting.txt
```

---

## Troubleshooting

### Common Issues

**1. "Project or local path not found"**
- Ensure project has a valid `localPath` set
- Check that the path exists on the file system
- Path should be relative to server root or absolute

**2. "Agent not found"**
- Verify agent is registered in the system
- Check agent ID matches exactly
- Ensure agents are loaded from config

**3. "Git operation failed"**
- Verify git repository is initialized in project path
- Check git credentials if required
- Ensure simple-git is installed

**4. "Meeting transcript not updating"**
- Check WebSocket connection
- Verify agents are responding
- Look for errors in server logs

### Checking Logs

```bash
# Server logs
tail -f logs/server.log

# Check database
npx prisma studio
```

---

## Success Criteria

All phases are considered successful when:

✅ **Phase 1:** Files can be browsed, edited, and saved with proper syntax highlighting
✅ **Phase 2:** Git operations (status, pull, push, commit) work correctly
✅ **Phase 3:** Recommendations can be implemented as tasks with proper agent assignment
✅ **Phase 4:** Agents are assigned to projects and use project context
✅ **Phase 5:** Meetings support multi-agent collaboration with transcript export

---

## Notes

- All features are accessible via the Project Workspace interface
- Git operations require a project with a local repository path
- Recommendations and meetings can be linked to specific projects
- WebSocket real-time updates enhance the user experience
- All data persists in the SQLite database

