
class FeatureImprovementSkill:
    def __init__(self, agent):
        self.agent = agent
        self.name = "Feature Improvement"
        
    def execute(self, params):
        self.agent.log(f"Executing skill: {self.name}")
        self.agent.log(f"Params keys: {list(params.keys())}")
        
        # Extract project_id from requirements or direct params
        project_id = params.get('projectId')
        requirements = params.get('requirements', {})
        
        if isinstance(requirements, str):
            import json
            try:
                requirements = json.loads(requirements)
                self.agent.log(f"Parsed requirements: {requirements}")
            except:
                requirements = {}
        
        if not project_id:
            project_id = requirements.get('project_id')
        
        self.agent.log(f"Project ID: {project_id}")
        
        description = params.get('description', '')
        
        # Fetch project and business model
        business_model = {}
        if project_id:
            try:
                self.agent.log(f"Fetching project data for {project_id}...")
                project_data = self.agent.call_tool('project_get', {'projectId': project_id})
                self.agent.log(f"Project data response: {type(project_data)}")
                
                if project_data and project_data.get('success'):
                    bm_str = project_data.get('project', {}).get('businessModel', '{}')
                    self.agent.log(f"Business Model string length: {len(bm_str) if bm_str else 0}")
                    
                    if isinstance(bm_str, str):
                        import json
                        try:
                            business_model = json.loads(bm_str)
                            self.agent.log(f"Parsed Business Model with {len(business_model)} keys")
                        except Exception as e:
                            self.agent.log(f"Failed to parse Business Model: {str(e)}")
                            business_model = {}
                else:
                    self.agent.log(f"Project data fetch failed or unsuccessful")
            except Exception as e:
                self.agent.log(f"Could not fetch business model: {str(e)}")

        self.agent.log(f"Generating improvements with BM keys: {list(business_model.keys())}")
        recommendations = self.generate_improvements(description, business_model)
        self.agent.log(f"Generated {len(recommendations)} recommendations")
        
        if project_id:
            saved_count = self.save_recommendations(project_id, recommendations)
            self.agent.log(f"Saved {saved_count} recommendations")
            
        return {
            "skill": self.name,
            "status": "success",
            "recommendations": recommendations,
            "saved_count": saved_count if project_id else 0,
            "message": f"Generated {len(recommendations)} feature improvements."
        }
    
    def generate_improvements(self, context, bm):
        # Extract full business model details for deep context
        bm_summary = ""
        if isinstance(bm, dict):
            for key, value in bm.items():
                if key != 'metadata' and value:
                    content = value.get('content', []) if isinstance(value, dict) else value
                    bm_summary += f"\n- {key.replace('_', ' ').title()}: {content}"
        
        prompt = f"""
You are a Product Manager specializing in Business-Driven Product Growth.

Analyze the following project and its Business Model Canvas (BMC) to suggest 3-5 FUNCTIONAL IMPROVEMENTS that directly enhance the business value and customer experience.

Project Context: {context}

Business Model Canvas Details:
{bm_summary}

Focus on:
1. FUNCTIONAL IMPROVEMENTS: New capabilities or enhancements to existing features that solve real user problems identified in 'Customer Segments'.
2. VALUE PROPOSITION ALIGNMENT: Strengthening the 'Value Propositions' defined in the BMC.
3. REVENUE GROWTH: Suggestions that could positively impact 'Revenue Streams'.
4. CUSTOMER RETENTION: Improving 'Customer Relationships' through functional features.

CRITICAL INSTRUCTIONS:
- DO NOT suggest generic technical optimizations (like "optimize performance" or "refactor code") unless they are critical for a specific BUSINESS goal.
- BE TIED TO THE PROJECT DNA: Use the specific context of the {context} and the provided BMC.
- CATEGORIZATION: Use "Functional Improvement" as the category.

You MUST return ONLY a valid JSON array. No markdown, no explanation, ONLY the JSON array.

Format:
[
  {{
    "title": "[Functional] Descriptive Title",
    "description": "Detailed explanation of how this improvement helps specific BMC segments",
    "priority": "high",
    "category": "Functional Improvement"
  }}
]

Return ONLY the JSON array, nothing else.
"""
        try:
            self.agent.log(f"Calling LLM for Functional Improvements. Prompt length: {len(prompt)}")
            
            response = self.agent.llm_manager.generate_response(
                prompt=prompt,
                system_context="You are a Product Strategy Expert. Generate highly specific, non-generic functional improvements for the given business model. Return ONLY JSON."
            )
            
            import json, re
            response_str = str(response)
            response_str = re.sub(r'```json\s*', '', response_str)
            response_str = re.sub(r'```\s*', '', response_str)
            
            match = re.search(r'\[.*\]', response_str, re.DOTALL)
            if match:
                parsed = json.loads(match.group())
                self.agent.log(f"Successfully parsed {len(parsed)} functional improvements")
                return parsed
            else:
                self.agent.log(f"No JSON array found in LLM response: {response_str[:200]}...")
        except Exception as e:
            self.agent.log(f"Functional improvement generation failed: {str(e)}")
        return []

    def save_recommendations(self, project_id, recommendations):
        saved_count = 0
        for rec in recommendations:
            try:
                # Use the project-scoped API endpoint
                import requests
                response = requests.post(
                    f'http://localhost:3001/api/projects/{project_id}/recommendations',
                    json={
                        "title": rec.get('title'),
                        "description": rec.get('description'),
                        "priority": rec.get('priority', 'medium').lower(),
                        "category": rec.get('category'),
                        "createdBy": "product-agent"
                    },
                    timeout=5
                )
                if response.status_code == 200:
                    saved_count += 1
                    self.agent.log(f"Saved recommendation: {rec.get('title')}")
            except Exception as e:
                self.agent.log(f"Failed to save recommendation: {str(e)}")
        return saved_count
