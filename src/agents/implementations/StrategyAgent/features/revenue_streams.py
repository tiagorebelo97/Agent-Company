"""
Revenue Streams Analysis Skill

Helps analyze and design revenue models based on Osterwalder's revenue types.
Includes pricing mechanisms and revenue optimization strategies.
"""

class RevenueStreamsSkill:
    def __init__(self, agent):
        self.agent = agent
        self.name = "Revenue Streams Analysis"
        
    def execute(self, params):
        """Execute revenue streams analysis task"""
        self.agent.log(f"Executing skill: {self.__class__.__name__}")
        
        description = params.get('description', '')
        
        analysis = self.analyze_revenue_streams(description)
        
        return {
            "skill": self.name,
            "status": "success",
            "revenue_analysis": analysis,
            "message": "Revenue streams analysis completed"
        }
    
    def analyze_revenue_streams(self, context: str) -> dict:
        """
        Comprehensive project-specific revenue streams analysis.
        Avoids generic SaaS thinking by default.
        """
        if self.agent.llm_manager:
            try:
                import json
                import re
                
                prompt = f"""
                Analyze the REVENUE DNA for this project context: {context}
                
                1. Identify the PRIMARY Economic Engine (e.g., Transactional, Efficiency-based, Tokenized, Licensing, Asset-Sale).
                2. Explain WHY this model fits the specific industry (Construction, Sports, AI, etc.).
                3. List 3-4 specific industrial revenue streams (no generic 'Subscrição' unless it's the core).
                4. Suggest a Pricing Mechanism (e.g., Take Rate, Basis Points, Tiered Usage).

                CRITICAL: Reject boilerplate SaaS thinking.
                
                Format as JSON:
                {{
                  "primary_engine": "Name",
                  "rationale": "Why",
                  "streams": [{{ "name": "N", "description": "D" }}],
                  "pricing_logic": "How it scales"
                }}
                """
                
                response = self.agent.llm_manager.generate_response(
                    prompt=prompt,
                    system_context="You are an expert business strategist. You hate generic templates. You think in project DNA."
                )
                
                json_match = re.search(r'\{.*\}', str(response), re.DOTALL)
                if json_match:
                    return json.loads(json_match.group())
            except Exception as e:
                self.agent.log(f"Dynamic revenue analysis failed: {str(e)}")
        
        # Fallback to structural response if LLM fails
        return {
            "primary_engine": "Generic (Analysis Failed)",
            "rationale": "Fallback triggered",
            "streams": [],
            "pricing_logic": "Manual review required"
        }
    
    def evaluate_pricing_strategy(self, revenue_type: str, market_context: str) -> dict:
        """Evaluate optimal pricing strategy for a given revenue type."""
        return {
            "recommended_mechanism": None,
            "rationale": "",
            "considerations": []
        }
