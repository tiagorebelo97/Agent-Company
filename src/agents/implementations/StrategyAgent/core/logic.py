"""
Strategy Agent - Business Model Canvas Specialist

This agent specializes in creating comprehensive business models using
Alexander Osterwalder's Business Model Canvas methodology from
"Business Model Generation: A Handbook for Visionaries, Game Changers, and Challengers"

The agent understands:
- The 9 Building Blocks of the Business Model Canvas
- Business Model Patterns (Freemium, Long Tail, Multi-Sided Platforms, etc.)
- Design Techniques (Customer Insights, Ideation, Prototyping, Storytelling)
- Strategy Integration (Blue Ocean, SWOT Analysis)
"""

import sys
import os
import json

# Add parent directories to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../core')))

from base_agent import PythonBaseAgent
from features.business_model_canvas import BusinessModelCanvasSkill
from features.value_proposition import ValuePropositionSkill
from features.revenue_streams import RevenueStreamsSkill
from features.competitive_analysis import CompetitiveAnalysisSkill

class StrategyAgent(PythonBaseAgent):
    """
    Strategy Agent specialized in Business Model Canvas creation.
    Based on Osterwalder's "Business Model Generation" methodology.
    """
    
    def __init__(self):
        super().__init__('strategy', 'Strategy Agent')
        self.skill_definitions = [
            "Business Model Canvas",
            "Value Proposition Design", 
            "Revenue Streams Analysis",
            "Competitive Analysis"
        ]
        self.category = 'business'
        self.skills_registry = {}
        
        # Initialize Skills
        self.skills_registry['Business Model Canvas'] = BusinessModelCanvasSkill(self)
        self.skills_registry['Value Proposition Design'] = ValuePropositionSkill(self)
        self.skills_registry['Revenue Streams Analysis'] = RevenueStreamsSkill(self)
        self.skills_registry['Competitive Analysis'] = CompetitiveAnalysisSkill(self)
        
        # Load pre-trained knowledge
        self._load_business_model_knowledge()
        
    def _load_business_model_knowledge(self):
        """Load Osterwalder's Business Model patterns and methodologies"""
        knowledge_path = os.path.join(
            os.path.dirname(__file__), 
            '../knowledge/business_model_patterns.json'
        )
        
        try:
            with open(knowledge_path, 'r', encoding='utf-8') as f:
                self.business_knowledge = json.load(f)
                self.log(f"Loaded business model knowledge: {len(self.business_knowledge.get('patterns', []))} patterns")
        except FileNotFoundError:
            self.log("Knowledge file not found, using embedded knowledge")
            self.business_knowledge = self._get_embedded_knowledge()
    
    def _get_embedded_knowledge(self):
        """Embedded knowledge from Business Model Generation book"""
        return {
            "methodology": "Business Model Canvas by Alexander Osterwalder & Yves Pigneur",
            "building_blocks": [
                "Customer Segments",
                "Value Propositions", 
                "Channels",
                "Customer Relationships",
                "Revenue Streams",
                "Key Resources",
                "Key Activities",
                "Key Partnerships",
                "Cost Structure"
            ],
            "patterns": [
                {
                    "name": "Unbundled Business Models",
                    "description": "Separating customer relationship, product innovation, and infrastructure businesses",
                    "examples": ["Private Banking", "Mobile Telecom"]
                },
                {
                    "name": "The Long Tail",
                    "description": "Selling less of more: offering a large number of niche products",
                    "examples": ["Amazon", "Netflix", "LEGO Factory"]
                },
                {
                    "name": "Multi-Sided Platforms",
                    "description": "Bringing together two or more distinct but interdependent groups of customers",
                    "examples": ["Google", "Apple", "Facebook", "Visa"]
                },
                {
                    "name": "Free as a Business Model (Freemium)",
                    "description": "At least one substantial customer segment continuously benefits from a free offer",
                    "examples": ["Spotify", "Skype", "Google", "Metro Newspaper"]
                },
                {
                    "name": "Open Business Models",
                    "description": "Creating and capturing value by systematically collaborating with outside partners",
                    "examples": ["Procter & Gamble Connect+Develop", "GlaxoSmithKline Patent Pool"]
                }
            ],
            "design_techniques": [
                "Customer Insights - Understanding customer context, jobs, pains, and gains",
                "Ideation - Generating new business model ideas",
                "Visual Thinking - Using visual tools like the Canvas",
                "Prototyping - Rough, quick business model sketches",
                "Storytelling - Communicating the model narrative",
                "Scenarios - Exploring business model concepts in different contexts"
            ],
            "strategy_tools": [
                "Business Model Environment (Market Forces, Industry Forces, Key Trends, Macroeconomic Forces)",
                "Blue Ocean Strategy (Eliminate, Reduce, Raise, Create)",
                "Managing Multiple Business Models",
                "SWOT Analysis for Business Models"
            ]
        }
    
    def _get_system_context(self) -> str:
        """Override system context for Strategy Agent"""
        return """You are the Strategy Agent, a specialist in Business Model Canvas creation and Business DNA evaluation.
Your purpose is to move beyond generic SaaS templates and identify the UNIQUE strategic engine of any project.

Your expertise includes:
1. **The 9 Building Blocks**: Mastered through professional experience, not just theory.
2. **Deep Industry Logic**: Understanding that a Football Club, a Construction site, and an AI Lab have zero structural overlap.
3. **Economic Engine Diversity**: You recognize patterns like Transactional, Industrial Efficiency, Asset-Sale, Brokerage, and Circular Economies.
4. **No-Standardization Rule**: You REJECT the idea that every digital business is a SaaS. You optimize for the REAL path to revenue.

When creating business models, you:
- Search for the "Pain Point" peculiar to the industry (e.g., fraudulent tickets, budget slippage, API latency).
- Design a revenue model that scales with that specific value (Fees, Licenses, Commissions, Usage).
- Use industry-correct terminology at all times.
- Provide actionable, non-generic recommendations.

Respond in Portuguese when the user writes in Portuguese. Be strategic, analytical, and reject boilerplate thinking."""
        
    def execute_task(self, task):
        """Execute a strategy/business model task"""
        task_type = task.get('type', '')
        description = task.get('description', '')
        
        self.log(f"Received task: {task_type} - {description}")
        self.update_status('working')
        
        # Match task to the most appropriate skill
        result = None
        description_lower = description.lower()
        
        # Priority matching for business model tasks
        if 'business model' in description_lower or 'modelo de negócio' in description_lower or 'canvas' in description_lower:
            result = self.skills_registry['Business Model Canvas'].execute(task)
        elif 'value proposition' in description_lower or 'proposta de valor' in description_lower:
            result = self.skills_registry['Value Proposition Design'].execute(task)
        elif 'revenue' in description_lower or 'receita' in description_lower or 'monetization' in description_lower:
            result = self.skills_registry['Revenue Streams Analysis'].execute(task)
        elif 'competitive' in description_lower or 'market' in description_lower or 'concorrência' in description_lower:
            result = self.skills_registry['Competitive Analysis'].execute(task)
        else:
            # Try generic skill matching
            for skill_name, skill_instance in self.skills_registry.items():
                if skill_name.lower() in description_lower:
                    result = skill_instance.execute(task)
                    break
        
        if not result:
            # Use Business Model Canvas as default for any strategic task
            result = self.skills_registry['Business Model Canvas'].execute(task)
        
        self.update_status('idle')
        return result
    
    def handle_message(self, message):
        """Handle chat messages about business strategy"""
        return {'acknowledged': True, 'agent': self.name, 'specialty': 'Business Model Canvas'}
    
    def create_business_model_canvas(self, project_info: dict) -> dict:
        """
        Create a complete Business Model Canvas for a project.
        
        Args:
            project_info: Dictionary with project details (name, description, domain, etc.)
            
        Returns:
            Complete Business Model Canvas with all 9 building blocks
        """
        return self.skills_registry['Business Model Canvas'].generate_full_canvas(project_info)
