
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
        # Extract key business model info
        value_props = bm.get('value_propositions', []) if isinstance(bm, dict) else []
        customer_segments = bm.get('customer_segments', []) if isinstance(bm, dict) else []
        
        prompt = f"""
You are a Product Manager specializing in iterative improvement and feature optimization.

Analyze this project and suggest 3-5 incremental IMPROVEMENTS for existing or planned features.

Project Context: {context}
Value Propositions: {value_props}
Customer Segments: {customer_segments}

Focus on:
- UX/UI refinements that improve user experience
- Performance optimizations
- Feature deepening (adding more value to existing features)
- Better alignment with value propositions

CRITICAL: You MUST return ONLY a valid JSON array. No markdown, no explanation, ONLY the JSON array.

Format:
[
  {{
    "title": "Specific improvement title",
    "description": "Detailed description of the improvement and its impact",
    "priority": "high",
    "category": "Features to Improve"
  }},
  {{
    "title": "Another improvement",
    "description": "Description",
    "priority": "medium",
    "category": "Features to Improve"
  }}
]

Return ONLY the JSON array, nothing else.
"""
        try:
            self.agent.log(f"Calling LLM with prompt length: {len(prompt)}")
            self.agent.log(f"Business Model keys available: {list(bm.keys()) if isinstance(bm, dict) else 'Not a dict'}")
            
            response = self.agent.llm_manager.generate_response(
                prompt=prompt,
                system_context="You are a Product Manager. Return ONLY valid JSON array, no markdown formatting."
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
            self.agent.log(f"Improvement generation failed: {str(e)}")
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
