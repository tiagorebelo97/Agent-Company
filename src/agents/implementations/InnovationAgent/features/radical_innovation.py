
class RadicalInnovationSkill:
    def __init__(self, agent):
        self.agent = agent
        self.name = "Radical Innovation"
        
    def execute(self, params):
        self.agent.log(f"Executing skill: {self.name}")
        
        # Extract project_id from requirements or direct params
        project_id = params.get('projectId')
        requirements = params.get('requirements', {})
        
        if isinstance(requirements, str):
            import json
            try:
                requirements = json.loads(requirements)
            except:
                requirements = {}
        
        if not project_id:
            project_id = requirements.get('project_id')
        
        description = params.get('description', '')
        
        # Fetch project and business model
        business_model = {}
        if project_id:
            try:
                project_data = self.agent.call_tool('project_get', {'projectId': project_id})
                if project_data and project_data.get('success'):
                    bm_str = project_data.get('project', {}).get('businessModel', '{}')
                    if isinstance(bm_str, str):
                        import json
                        try:
                            business_model = json.loads(bm_str)
                        except:
                            business_model = {}
            except Exception as e:
                self.agent.log(f"Could not fetch business model: {str(e)}")

        recommendations = self.generate_innovations(description, business_model)
        
        if project_id:
            saved_count = self.save_recommendations(project_id, recommendations)
            
        return {
            "skill": self.name,
            "status": "success",
            "recommendations": recommendations,
            "saved_count": saved_count if project_id else 0,
            "message": f"Generated {len(recommendations)} radical innovations."
        }
    
    def generate_innovations(self, context, bm):
        # Extract full business model details for deep context
        bm_summary = ""
        if isinstance(bm, dict):
            for key, value in bm.items():
                if key != 'metadata' and value:
                    content = value.get('content', []) if isinstance(value, dict) else value
                    bm_summary += f"\n- {key.replace('_', ' ').title()}: {content}"
        
        prompt = f"""
You are an Innovation Strategist specializing in Disruptive Business Transformation.

Analyze the following project and its Business Model Canvas (BMC) to suggest 3-5 RADICAL NEW FUNCTIONAL FEATURES or STRATEGIC MOONSHOTS that could redefine the industry or create entirely new revenue streams.

Project Context: {context}

Business Model Canvas Details:
{bm_summary}

Focus on:
1. DISRUPTIVE FEATURES: Completely new capabilities that solve "unmet" needs of the 'Customer Segments'.
2. STRATEGIC MOONSHOTS: Bold, high-risk, high-reward functional ideas that leverage emerging technology (AI, etc.) to radically change the 'Value Propositions'.
3. BLUE OCEAN SHIFTS: Suggestions that move the business away from competition and create new markets.
4. ECOSYSTEM EXPANSION: Functional ways to integrate with 'Key Partners' or reach new 'Channels'.

CRITICAL INSTRUCTIONS:
- NO GENERIC TECH: Do not suggest generic AI or cloud migration unless it is a core disruptive product feature.
- BE RADICAL BUT RELEVANT: Ideas must be grounded in the context of {context} and the provided BMC.
- INDIVIDUALITY: These suggestions must feel UNIQUE to this specific project.

You MUST return ONLY a valid JSON array. No markdown, no explanation, ONLY the JSON array.

Format:
[
  {{
    "title": "[Innovation] Radical feature name",
    "description": "How this disrupts the current model and creates massive new value for 'Segment Z'",
    "priority": "high",
    "category": "New Features to Create"
  }},
  {{
    "title": "[Moonshot] Strategic breakthrough idea",
    "description": "Bold vision for the future of the product",
    "priority": "medium",
    "category": "Strategic Ideas"
  }}
]

Return ONLY the JSON array, nothing else.
"""
        try:
            self.agent.log(f"Calling LLM for Radical Innovations. Prompt length: {len(prompt)}")
            
            response = self.agent.llm_manager.generate_response(
                prompt=prompt,
                system_context="You are a Disruptive Innovation Expert. Generate specific, functional moonshots for the given business model. Return ONLY JSON."
            )
            
            import json, re
            response_str = str(response)
            response_str = re.sub(r'```json\s*', '', response_str)
            response_str = re.sub(r'```\s*', '', response_str)
            
            match = re.search(r'\[.*\]', response_str, re.DOTALL)
            if match:
                parsed = json.loads(match.group())
                self.agent.log(f"Successfully parsed {len(parsed)} radical innovations")
                return parsed
            else:
                self.agent.log(f"No JSON array found in LLM response: {response_str[:200]}...")
        except Exception as e:
            self.agent.log(f"Innovation generation failed: {str(e)}")
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
                        "createdBy": "innovation-agent"
                    },
                    timeout=5
                )
                if response.status_code == 200:
                    saved_count += 1
                    self.agent.log(f"Saved recommendation: {rec.get('title')}")
            except Exception as e:
                self.agent.log(f"Failed to save recommendation: {str(e)}")
        return saved_count
