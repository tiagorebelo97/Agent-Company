"""
Value Proposition Design Skill

Based on Osterwalder's Value Proposition Canvas methodology.
Helps design compelling value propositions by understanding:
- Customer Jobs (what customers are trying to get done)
- Customer Pains (undesired outcomes, risks, obstacles)
- Customer Gains (outcomes and benefits customers want)
- Pain Relievers (how products/services alleviate pains)
- Gain Creators (how products/services create gains)
"""

class ValuePropositionSkill:
    def __init__(self, agent):
        self.agent = agent
        self.name = "Value Proposition Design"
        
    def execute(self, params):
        """Execute value proposition design task"""
        self.agent.log(f"Executing skill: {self.__class__.__name__}")
        
        description = params.get('description', '')
        customer_segment = params.get('customer_segment', 'Primary Customer')
        
        vp_canvas = self.design_value_proposition(description, customer_segment)
        
        return {
            "skill": self.name,
            "status": "success",
            "value_proposition_canvas": vp_canvas,
            "message": "Value Proposition Canvas designed"
        }
    
    def design_value_proposition(self, context: str, customer_segment: str) -> dict:
        """
        Design a complete Value Proposition Canvas.
        
        The canvas has two sides:
        1. Customer Profile (right side) - Understanding the customer
        2. Value Map (left side) - How we create value
        """
        return {
            "customer_profile": {
                "segment": customer_segment,
                "customer_jobs": {
                    "description": "Tasks customers are trying to perform, problems trying to solve, needs trying to satisfy",
                    "types": {
                        "functional": "Specific tasks (e.g., mow the lawn, eat healthy)",
                        "social": "Looking good, gaining status, power",
                        "emotional": "Seeking specific feelings (security, wellbeing)",
                        "supporting": "Buying, comparing, recommending"
                    },
                    "jobs": []  # To be filled
                },
                "pains": {
                    "description": "Negative outcomes, risks, and obstacles related to customer jobs",
                    "types": {
                        "undesired_outcomes": "Solutions not working, negative side effects",
                        "obstacles": "Things preventing job completion",
                        "risks": "Potential unwanted consequences"
                    },
                    "severity_scale": "1-10 (extreme to mild)",
                    "pains": []
                },
                "gains": {
                    "description": "Outcomes and benefits customers want",
                    "types": {
                        "required": "Minimal expectations",
                        "expected": "Basic expected features",
                        "desired": "Beyond expectations",
                        "unexpected": "Exceed all expectations"
                    },
                    "relevance_scale": "1-10 (essential to nice-to-have)",
                    "gains": []
                }
            },
            "value_map": {
                "products_and_services": {
                    "description": "List of all products/services the value proposition is built around",
                    "types": {
                        "physical": "Goods, manufactured products",
                        "intangible": "Copyrights, after-sales",
                        "digital": "Music downloads, software",
                        "financial": "Investment funds, financing"
                    },
                    "items": []
                },
                "pain_relievers": {
                    "description": "How products/services alleviate specific customer pains",
                    "questions": [
                        "Save time, money, effort?",
                        "Make customers feel better?",
                        "Fix underperforming solutions?",
                        "End difficulties and challenges?",
                        "Eliminate risks?"
                    ],
                    "relievers": []
                },
                "gain_creators": {
                    "description": "How products/services create customer gains",
                    "questions": [
                        "Create savings?",
                        "Produce outcomes exceeding expectations?",
                        "Make jobs/life easier?",
                        "Create positive social consequences?",
                        "Do something customers dream of?"
                    ],
                    "creators": []
                }
            },
            "fit": {
                "description": "Fit is achieved when products/services address important jobs, relieve severe pains, and create essential gains",
                "fit_level": None,  # Problem-Solution Fit, Product-Market Fit, or Business Model Fit
                "fit_notes": []
            }
        }
    
    def evaluate_fit(self, vp_canvas: dict) -> dict:
        """
        Evaluate the fit between Customer Profile and Value Map.
        """
        return {
            "fit_assessment": {
                "jobs_addressed": "Percentage of important jobs addressed",
                "pains_relieved": "Percentage of severe pains addressed",
                "gains_created": "Percentage of essential gains delivered",
                "overall_fit": "Low/Medium/High",
                "recommendations": []
            }
        }
