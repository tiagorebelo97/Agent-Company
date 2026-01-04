"""
Skill: ApiEndpoint
Verified pattern for creating Express.js API endpoints with Prisma and logging.
"""

SKILL_DEFINITION = {
    "id": "ApiEndpoint",
    "name": "Express.js API Endpoint",
    "description": "Generates a clean Express.js route with full request validation, error handling, Prisma integration, and logging.",
    "technical_requirements": [
        "Express.js request/response",
        "Prisma client",
        "Standardized response JSON {success, data/error}",
        "Request logging (logger.info/error)",
        "Try-catch blocks"
    ],
    "file_naming_rule": "CamelCase or included in server.js"
}

def get_prompt(method, path, data_model, description):
    return f"""
Generate a professional Express.js endpoint for the {data_model} model using the ApiEndpoint skill.

Specifications:
- Method: {method}
- Path: {path}
- Model: {data_model}
- Action: {description}

Requirements:
1. Use the existing Prisma client (`prisma`).
2. Implement robust error handling.
3. Validate necessary input fields.
4. Log important steps and errors using `logger`.
5. Return a consistent JSON format: `{{ "success": true, "data": ... }}` or `{{ "success": false, "error": ... }}`.

STRICT RULE: Return ONLY the code block. No explanations.
"""
