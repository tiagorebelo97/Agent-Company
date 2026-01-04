# Mission: Project CRM System Implementation

## Objective
Evolve the current "Projects" tab from a task filter into a complete CRM-style Project Management system.

## Technical Foundation
- **Database Model**: `Project` (name, description, status, repoUrl, clientName, startDate, endDate).
- **API Endpoints**:
  - `GET /api/projects`: List all projects.
  - `POST /api/projects`: Create a new project.
  - `GET /api/projects/:id`: Get project details (including linked tasks).
  - `PATCH /api/projects/:id`: Update project.
  - `DELETE /api/projects/:id`: Delete project.
- **Task Association**: Tasks now have a `projectId` field.

## Required UI Features (to be implemented in `ProjectWorkspace.jsx`)
1. **Management View**:
   - A grid or list of all projects.
   - High-level progress for each project.
   - A button to "Create New Project".
2. **Project Creation Flow**:
   - A form to input project name, client, and description.
3. **Detail View (Deep Dive)**:
   - When a project is selected, the dashboard should show the Roadmap, Kanban, and Chat focused *only* on that project's tasks.
4. **Task Lifecycle Integration**:
   - New orchestrations/tasks must be automatically linked to the currently selected project.

## Instructions for Agents

### 1. General Guardrails (Applies to ALL Agents)
- **STRICT FILE NAMING**: Never create files named after task descriptions (e.g., `ImplementFeatureX.jsx`). Use professional, concise names:
  - Components: PascalCase (e.g., `ProjectForm.jsx`)
  - Utilities: camelCase (e.g., `apiClient.js`)
- **NO PLACEHOLDERS**: Do not create empty skeletons or files containing only comments. Every file must be a functional implementation.
- **VERIFICATION**: After creating or modifying a file, you must read it back to verify the implementation is complete.

### 2. Specific Roles
- **Frontend Agent**: Update `ProjectWorkspace.jsx` to implement the views described above. Use the `/api/projects` API. Follow the design system (glassmorphism, vibrant blues).
- **Project Manager**:
  - When decomposing tasks, provide **technical requirements** (props, API details) in the task description.
  - Monitor agents to ensure they follow naming rules.
- **Backend Agent**: If additional business logic is needed, add it to `server.js`.

**Remember**: Use English, ASCII characters, and professional naming for all code changes. Be decisive and focus on writing code.
