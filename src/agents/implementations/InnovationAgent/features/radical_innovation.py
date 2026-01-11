
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
        # Extract key business model info
        value_props = bm.get('value_propositions', []) if isinstance(bm, dict) else []
        customer_segments = bm.get('customer_segments', []) if isinstance(bm, dict) else []
        
        prompt = f"""
You are an Innovation Strategist specializing in disruptive thinking and high-impact radical ideas.

Analyze this project and suggest 3-5 RADICAL NEW FEATURES and STRATEGIC MOONSHOTS.

Project Context: {context}
Value Propositions: {value_props}
Customer Segments: {customer_segments}

Focus on:
- Completely new core modules that don't exist yet
- Disruptive industry shifts and game-changing features
- Moonshot ideas (high risk, high reward)
- AI-first, Web3, or emerging technology integration

CRITICAL: You MUST return ONLY a valid JSON array. No markdown, no explanation, ONLY the JSON array.

Format:
[
  {{
    "title": "Specific innovation title",
    "description": "Detailed description of the innovation and its potential impact",
    "priority": "high",
    "category": "New Features to Create"
  }},
  {{
    "title": "Strategic moonshot idea",
    "description": "Description",
    "priority": "medium",
    "category": "Strategic Ideas"
  }}
]

Return ONLY the JSON array, nothing else.
"""
        try:
            self.agent.log(f"Calling LLM with prompt length: {len(prompt)}")
            self.agent.log(f"Business Model keys available: {list(bm.keys()) if isinstance(bm, dict) else 'Not a dict'}")
            
            response = self.agent.llm_manager.generate_response(
                prompt=prompt,
                system_context="You are an Innovation Strategist. Return ONLY valid JSON array, no markdown formatting."
            )
            
            self.agent.log(f"LLM Response type: {type(response)}")
            self.agent.log(f"LLM Response length: {len(str(response))}")
            self.agent.log(f"LLM Response preview: {str(response)[:500]}")
            
            import json, re
            
            # Try to extract JSON array from response
            response_str = str(response)
            
            # Remove markdown code blocks if present
            response_str = re.sub(r'```json\s*', '', response_str)
            response_str = re.sub(r'```\s*', '', response_str)
            
            # Find JSON array
            match = re.search(r'\[.*\]', response_str, re.DOTALL)
            if match:
                self.agent.log(f"Found JSON array in response")
                parsed = json.loads(match.group())
                self.agent.log(f"Successfully parsed {len(parsed)} items")
                return parsed
            else:
                self.agent.log(f"No JSON array found in LLM response")
                self.agent.log(f"Full response: {response_str}")
        except Exception as e:
            self.agent.log(f"Innovation generation failed: {str(e)}")
            import traceback
            self.agent.log(f"Traceback: {traceback.format_exc()}")
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
