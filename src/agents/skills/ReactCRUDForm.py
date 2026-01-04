"""
Skill: ReactCRUDForm
Verified pattern for creating glassmorphic modals with CRUD capabilities.
"""

SKILL_DEFINITION = {
    "id": "ReactCRUDForm",
    "name": "React CRUD Form/Modal",
    "description": "Generates a complete React modal/form with validation, Prisma-compatible fields, and modern glassmorphic styling.",
    "technical_requirements": [
        "React functional component",
        "lucide-react icons",
        "Glassmorphic CSS (background-filter, border-radius)",
        "Loading/Error state management",
        "Callback onSave/onCancel"
    ],
    "file_naming_rule": "PascalCase ending in 'Modal' or 'Form' (e.g., ProjectCreateModal.jsx)"
}

def get_prompt(name, fields, api_endpoint):
    return f"""
Generate a professional React component for a {name} using the ReactCRUDForm skill.

Requirements:
1. Component Name: {name}
2. Fields to include: {fields}
3. API Endpoint to call: {api_endpoint}
4. Design: Glassmorphic, dark theme, using the project's color palette (blue/white/black).
5. Icons: Use 'lucide-react'.
6. Code Quality: Pro production ready, include prop validation and error handling.

STRICT RULE: Return ONLY the functional code. No placeholder comments like // implement logic here.
"""
