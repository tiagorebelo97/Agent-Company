"""
Business Model Canvas Skill

The core skill for creating comprehensive Business Model Canvases
based on Alexander Osterwalder's methodology.

The 9 Building Blocks:
1. Customer Segments - Who are we creating value for?
2. Value Propositions - What value do we deliver?
3. Channels - How do we reach customers?
4. Customer Relationships - What type of relationship?
5. Revenue Streams - How does the business earn money?
6. Key Resources - What assets are required?
7. Key Activities - What must we do?
8. Key Partnerships - Who are our key partners?
9. Cost Structure - What are the most important costs?
"""

import json
import re

class BusinessModelCanvasSkill:
    def __init__(self, agent):
        self.agent = agent
        self.name = "Business Model Canvas"
        
    def execute(self, params):
        """Execute a business model canvas task"""
        self.agent.log(f"Executing skill: {self.__class__.__name__}")
        
        description = params.get('description', '')
        project_info = params.get('project_info', {})
        project_id = params.get('projectId') or project_info.get('id')
        
        # If no project info but we have ID, try to fetch it
        if not project_info and project_id:
            try:
                res = self.agent.call_mcp_tool(None, "project_get", {"projectId": project_id})
                if res and res.get('success'):
                    project_info = res.get('project')
            except Exception as e:
                self.agent.log(f"Failed to fetch project info: {str(e)}")

        # Generate the canvas
        canvas = self.generate_full_canvas(project_info if project_info else {'description': description})
        
        # Save to database if project_id is available
        if project_id:
            try:
                import json
                self.agent.call_mcp_tool(None, "project_update", {
                    "projectId": project_id,
                    "businessModel": json.dumps(canvas)
                })
                self.agent.log(f"Business Model Canvas saved to project {project_id}")
            except Exception as e:
                self.agent.log(f"Failed to save business model: {str(e)}")

        return {
            "skill": self.name,
            "status": "success",
            "canvas": canvas,
            "methodology": "Osterwalder Business Model Canvas",
            "message": f"Business Model Canvas created with {len(canvas)} building blocks"
        }
    
    def generate_full_canvas(self, project_info: dict) -> dict:
        """
        Generate a complete Business Model Canvas.
        
        This uses the LLM to generate thoughtful, contextual content for each block
        based on the project information provided.
        """
        project_name = project_info.get('name', 'Project')
        project_description = project_info.get('description', '')
        domain = project_info.get('domain', 'technology')
        
        # Generate canvas structure with guidance for each block
        canvas = {
            "metadata": {
                "project": project_name,
                "domain": domain,
                "methodology": "Business Model Canvas (Osterwalder)",
                "version": "1.0"
            },
            "customer_segments": {
                "title": "Customer Segments",
                "question": "For whom are we creating value? Who are our most important customers?",
                "guidance": [
                    "Mass Market - No distinction between customer segments",
                    "Niche Market - Specific, specialized segment",
                    "Segmented - Slightly different needs/problems",
                    "Diversified - Unrelated segments with different needs",
                    "Multi-sided Platforms - Two or more interdependent segments"
                ],
                "content": []  # To be filled by LLM
            },
            "value_propositions": {
                "title": "Value Propositions",
                "question": "What value do we deliver? Which problems are we solving?",
                "guidance": [
                    "Newness - New set of needs not perceived before",
                    "Performance - Improving product/service performance",
                    "Customization - Tailoring to specific needs",
                    "Getting the Job Done - Simply helping customers",
                    "Design - Superior design",
                    "Brand/Status - Value from using/displaying a brand",
                    "Price - Offering similar value at a lower price",
                    "Cost Reduction - Helping reduce costs",
                    "Risk Reduction - Reducing risks customers incur",
                    "Accessibility - Making products available to non-customers",
                    "Convenience/Usability - Making things more convenient"
                ],
                "content": []
            },
            "channels": {
                "title": "Channels",
                "question": "Through which channels do our customers want to be reached?",
                "phases": [
                    "1. Awareness - How do we raise awareness?",
                    "2. Evaluation - How do we help customers evaluate?",
                    "3. Purchase - How do customers purchase?",
                    "4. Delivery - How do we deliver value?",
                    "5. After Sales - How do we provide post-purchase support?"
                ],
                "types": ["Direct (Sales Force, Web)", "Indirect (Partner Stores, Wholesaler)"],
                "content": []
            },
            "customer_relationships": {
                "title": "Customer Relationships",
                "question": "What type of relationship does each segment expect?",
                "categories": [
                    "Personal Assistance - Human interaction",
                    "Dedicated Personal Assistance - Deepest relationship",
                    "Self-Service - No direct relationship",
                    "Automated Services - Mix of self-service + automation",
                    "Communities - Connecting customers together",
                    "Co-creation - Customer creates value"
                ],
                "content": []
            },
            "revenue_streams": {
                "title": "Revenue Streams",
                "question": "For what value are customers willing to pay?",
                "types": [
                    "Asset Sale - Selling ownership rights",
                    "Usage Fee - Pay per use",
                    "Subscription Fees - Continuous access",
                    "Lending/Renting/Leasing - Temporary access",
                    "Licensing - Permission to use IP",
                    "Brokerage Fees - Intermediation services",
                    "Advertising - Fees for product advertising"
                ],
                "pricing_mechanisms": ["Fixed (List Price, Features, Volume)", "Dynamic (Negotiation, Auction, Market)"],
                "content": []
            },
            "key_resources": {
                "title": "Key Resources",
                "question": "What key resources does our value proposition require?",
                "categories": [
                    "Physical - Facilities, machines, systems, networks",
                    "Intellectual - Brands, patents, copyrights, data",
                    "Human - People, skills, experience",
                    "Financial - Cash, credit lines, stock options"
                ],
                "content": []
            },
            "key_activities": {
                "title": "Key Activities",
                "question": "What key activities does our value proposition require?",
                "categories": [
                    "Production - Designing, making, delivering",
                    "Problem Solving - New solutions for individual problems",
                    "Platform/Network - Managing platforms, services"
                ],
                "content": []
            },
            "key_partnerships": {
                "title": "Key Partnerships",
                "question": "Who are our key partners and suppliers?",
                "types": [
                    "Strategic alliances between non-competitors",
                    "Coopetition - Strategic partnerships between competitors",
                    "Joint ventures to develop new businesses",
                    "Buyer-supplier relationships"
                ],
                "motivations": [
                    "Optimization and economy of scale",
                    "Reduction of risk and uncertainty",
                    "Acquisition of particular resources/activities"
                ],
                "content": []
            },
            "cost_structure": {
                "title": "Cost Structure",
                "question": "What are the most important costs inherent in our business model?",
                "characteristics": [
                    "Cost-driven - Focus on minimizing costs",
                    "Value-driven - Focus on value creation"
                ],
                "cost_types": [
                    "Fixed Costs - Same regardless of volume",
                    "Variable Costs - Vary with production volume",
                    "Economies of Scale - Cost decreases with increased output",
                    "Economies of Scope - Larger scope = cost advantages"
                ],
                "content": []
            }
        }
        
        # Use LLM to populate content if available
        if self.agent.llm_manager:
            try:
                import json
                import re
                
                blocks_info = "\n".join([f"- {k}: {v['question']}" for k, v in canvas.items() if isinstance(v, dict) and 'question' in v])
                
                prompt = f"""
                You are a senior business strategist. Generate a detailed Business Model Canvas for the project:
                Name: {project_name}
                Description: {project_description}
                Domain: {domain}

                Please provide 4-6 key points for EACH of these building blocks:
                {blocks_info}

                CRITICAL: You MUST return ONLY a JSON object with this structure:
                {{
                  "customer_segments": ["Point 1", "Point 2", ...],
                  "value_propositions": [...],
                  "channels": [...],
                  "customer_relationships": [...],
                  "revenue_streams": [...],
                  "key_resources": [...],
                  "key_activities": [...],
                  "key_partnerships": [...],
                  "cost_structure": [...]
                }}
                Do not include any other text, only the JSON.
                """
                
                response = self.agent.llm_manager.generate_response(
                    prompt=prompt,
                    system_context="You are an expert in Business Model Canvas methodology. Provide professional, strategic, and innovative insights."
                )
                
                # Extract JSON
                json_match = re.search(r'\{.*\}', str(response), re.DOTALL)
                if json_match:
                    content_data = json.loads(json_match.group())
                    for key, content in content_data.items():
                        if key in canvas and isinstance(canvas[key], dict):
                            canvas[key]['content'] = content
                
            except Exception as e:
                self.agent.log(f"LLM Canvas generation failed: {str(e)}")
                # Fill with empty content to avoid errors
                for key in canvas:
                    if isinstance(canvas[key], dict) and 'content' in canvas[key]:
                        canvas[key]['content'] = ["(Erro na geração automática)"]

        return canvas
    
    def identify_patterns(self, canvas: dict) -> list:
        """
        Identify which Osterwalder business model patterns apply.
        """
        patterns = []
        
        # Check for Long Tail pattern
        if len(canvas.get('customer_segments', {}).get('content', [])) > 3:
            patterns.append({
                "name": "Long Tail",
                "confidence": "Medium",
                "explanation": "Multiple customer segments suggest niche targeting"
            })
        
        # Check for Freemium pattern
        revenue = canvas.get('revenue_streams', {}).get('content', [])
        if any('free' in str(r).lower() for r in revenue):
            patterns.append({
                "name": "Freemium",
                "confidence": "High",
                "explanation": "Free tier with premium upgrades"
            })
        
        # Check for Multi-Sided Platform
        relationships = canvas.get('customer_relationships', {})
        if 'platform' in str(relationships).lower() or 'marketplace' in str(relationships).lower():
            patterns.append({
                "name": "Multi-Sided Platform",
                "confidence": "High",
                "explanation": "Connecting multiple customer groups"
            })
        
        return patterns
