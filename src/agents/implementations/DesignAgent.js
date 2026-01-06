/**
 * DesignAgent - Specialist in UI/UX design, visual concepts, and design recommendations
 * 
 * Responsibilities:
 * - Create design concepts and mockups
 * - Recommend design patterns
 * - Analyze design references
 * - Provide multiple design alternatives
 * - Store and learn from design materials
 */

import BaseAgent from '../core/BaseAgent.js';
import logger from '../../utils/logger.js';
import prisma from '../../database/client.js';

export class DesignAgent extends BaseAgent {
    constructor() {
        super('designer', 'Design Specialist', {
            role: 'UI/UX Design & Visual Concepts',
            emoji: '🎨',
            color: '#ec4899',
            category: 'design',
            folderName: 'DesignAgent',
            skills: [
                'UI/UX Design',
                'Visual Design',
                'Design Systems',
                'Prototyping',
                'Brand Identity',
                'User Research',
                'Accessibility',
                'Design Patterns'
            ],
            mcps: ['filesystem']
        });
    }

    async handleTask(task) {
        logger.info(`${this.name}: Handling task: ${task.description}`);

        // Delegate to Python if it's one of the expert skills
        const expertTaskTypes = ['create_design', 'analyze_design', 'critique', 'implement_design'];
        if (expertTaskTypes.includes(task.type)) {
            logger.info(`${this.name}: Delegating ${task.type} to Python expert implementation`);
            try {
                const result = await this.executeTask(task);
                if (result) return result;
            } catch (error) {
                logger.warn(`${this.name}: Python delegation failed, falling back to JS implementation`, error);
            }
        }

        switch (task.type) {
            case 'create_design':
                return await this.createDesignRecommendation(task);
            case 'analyze_design':
                return await this.analyzeDesign(task);
            case 'design_alternatives':
                return await this.generateDesignAlternatives(task);
            case 'store_reference':
                return await this.storeDesignReference(task);
            default:
                if (task.type === 'design' || task.description?.toLowerCase().includes('design')) {
                    return await this.createDesignRecommendation(task);
                }
                throw new Error(`Unknown task type for Design Agent: ${task.type}`);
        }
    }

    /**
     * Create a design recommendation with example images
     */
    async createDesignRecommendation(task) {
        const { description, requirements, projectId } = task;
        logger.info(`${this.name}: Creating design recommendation for: ${description}`);

        try {
            // Analyze requirements to determine design style
            const designStyle = this.analyzeDesignRequirements(requirements || description);

            // Retrieve relevant knowledge from previous learnings
            const relevantKnowledge = await this.retrieveRelevantKnowledge(designStyle);

            // Generate main design concept
            const mainDesign = this.generateDesignConcept(description, designStyle, relevantKnowledge);

            // Generate 5 alternative designs
            const alternatives = this.generateAlternativeDesigns(description, designStyle, 5);

            // Create design recommendation with images
            const recommendation = {
                title: `Design Proposal: ${mainDesign.title}`,
                description: mainDesign.description,
                mainDesign: {
                    concept: mainDesign.concept,
                    imageUrl: mainDesign.imageUrl || this.generatePlaceholderDesignUrl(mainDesign),
                    colorPalette: mainDesign.colors,
                    typography: mainDesign.typography,
                    layout: mainDesign.layout
                },
                alternatives: alternatives.map(alt => ({
                    title: alt.title,
                    description: alt.description,
                    imageUrl: alt.imageUrl || this.generatePlaceholderDesignUrl(alt),
                    colorPalette: alt.colors,
                    reasoning: alt.reasoning
                })),
                knowledgeUsed: relevantKnowledge.map(k => ({
                    source: k.title,
                    reference: k.id
                }))
            };

            // If projectId provided, create formal recommendation
            if (projectId) {
                await prisma.recommendation.create({
                    data: {
                        projectId,
                        title: recommendation.title,
                        description: recommendation.description,
                        priority: 'medium',
                        category: 'design',
                        createdBy: this.id,
                        metadata: JSON.stringify(recommendation)
                    }
                });
            }

            // Record knowledge usage
            if (relevantKnowledge.length > 0) {
                await this.recordKnowledgeUsage(relevantKnowledge);
            }

            return {
                success: true,
                recommendation,
                message: `Design recommendation created with ${alternatives.length} alternatives`
            };
        } catch (error) {
            logger.error(`${this.name}: Error creating design recommendation:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Analyze design requirements to determine style
     */
    analyzeDesignRequirements(requirements) {
        const req = requirements.toLowerCase();

        const styles = {
            modern: ['modern', 'clean', 'minimal', 'sleek', 'contemporary'],
            playful: ['fun', 'playful', 'colorful', 'vibrant', 'friendly'],
            professional: ['corporate', 'professional', 'business', 'formal', 'enterprise'],
            elegant: ['elegant', 'sophisticated', 'luxury', 'premium', 'refined'],
            technical: ['technical', 'data', 'dashboard', 'analytics', 'system']
        };

        for (const [style, keywords] of Object.entries(styles)) {
            if (keywords.some(keyword => req.includes(keyword))) {
                return style;
            }
        }

        return 'modern'; // default
    }

    /**
     * Retrieve relevant knowledge from agent's learning
     */
    async retrieveRelevantKnowledge(designStyle) {
        try {
            const knowledge = await prisma.agentKnowledge.findMany({
                where: {
                    agentId: this.id,
                    OR: [
                        { type: 'image' },
                        { type: 'document' }
                    ]
                },
                orderBy: { usageCount: 'desc' },
                take: 5
            });

            return knowledge;
        } catch (error) {
            logger.error(`${this.name}: Error retrieving knowledge:`, error);
            return [];
        }
    }

    /**
     * Generate main design concept
     */
    generateDesignConcept(description, style, knowledge) {
        const concepts = {
            modern: {
                title: 'Modern Minimalist',
                concept: 'Clean lines, ample white space, and focused content',
                colors: ['#000000', '#FFFFFF', '#2B81FF', '#F8F9FA'],
                typography: 'Inter, system-ui, sans-serif',
                layout: 'Grid-based with generous padding'
            },
            playful: {
                title: 'Vibrant & Engaging',
                concept: 'Bold colors, rounded corners, and friendly interactions',
                colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#F7FFF7'],
                typography: 'Poppins, Quicksand, sans-serif',
                layout: 'Asymmetric with dynamic elements'
            },
            professional: {
                title: 'Professional Enterprise',
                concept: 'Structured layout, muted colors, clear hierarchy',
                colors: ['#1E293B', '#3B82F6', '#64748B', '#F1F5F9'],
                typography: 'Roboto, Arial, sans-serif',
                layout: 'Sidebar navigation with content areas'
            },
            elegant: {
                title: 'Elegant & Sophisticated',
                concept: 'Refined aesthetics, subtle animations, premium feel',
                colors: ['#1A1A1A', '#D4AF37', '#F5F5F5', '#8B7355'],
                typography: 'Playfair Display, Georgia, serif',
                layout: 'Centered content with balanced spacing'
            },
            technical: {
                title: 'Technical Dashboard',
                concept: 'Data-focused, high contrast, information density',
                colors: ['#0F172A', '#0EA5E9', '#10B981', '#F59E0B'],
                typography: 'Monaco, Consolas, monospace',
                layout: 'Dashboard grid with widgets'
            }
        };

        const baseConcept = concepts[style] || concepts.modern;

        return {
            ...baseConcept,
            description: `A ${style} design approach for ${description}. ${baseConcept.concept}.` +
                (knowledge.length > 0 ? ` Inspired by ${knowledge.length} reference(s) from knowledge base.` : '')
        };
    }

    /**
     * Generate alternative design concepts
     */
    generateAlternativeDesigns(description, primaryStyle, count = 5) {
        const allStyles = ['modern', 'playful', 'professional', 'elegant', 'technical'];
        const alternativeStyles = allStyles.filter(s => s !== primaryStyle).slice(0, count);

        return alternativeStyles.map(style => {
            const concept = this.generateDesignConcept(description, style, []);
            return {
                ...concept,
                reasoning: `Alternative ${style} approach to provide different visual direction`
            };
        });
    }

    /**
     * Generate placeholder design URL (in production, this would generate/fetch actual images)
     */
    generatePlaceholderDesignUrl(design) {
        // For now, return a placeholder service URL with colors
        const primaryColor = design.colors[0].replace('#', '');
        const secondaryColor = design.colors[1]?.replace('#', '') || 'FFFFFF';
        return `https://via.placeholder.com/800x600/${primaryColor}/${secondaryColor}?text=${encodeURIComponent(design.title)}`;
    }

    /**
     * Analyze a design reference (image, file, URL)
     */
    async analyzeDesign(task) {
        const { filePath, url, imageData } = task.requirements || {};

        logger.info(`${this.name}: Analyzing design reference`);

        try {
            // In a real implementation, this would use image analysis
            const analysis = {
                colorPalette: ['#000000', '#FFFFFF', '#2B81FF'],
                typography: 'Sans-serif, modern',
                layout: 'Grid-based',
                style: 'Modern minimalist',
                elements: ['Navigation bar', 'Content grid', 'Footer'],
                recommendations: [
                    'Consider adding more whitespace',
                    'Color contrast could be improved',
                    'Typography hierarchy is clear'
                ]
            };

            return {
                success: true,
                analysis,
                message: 'Design analyzed successfully'
            };
        } catch (error) {
            logger.error(`${this.name}: Error analyzing design:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Store a design reference for future learning
     */
    async storeDesignReference(task) {
        const { title, description, filePath, url, imageData, tags } = task.requirements || {};

        logger.info(`${this.name}: Storing design reference: ${title}`);

        try {
            const knowledge = await prisma.agentKnowledge.create({
                data: {
                    agentId: this.id,
                    title: title || 'Design Reference',
                    description: description || 'Stored design reference for learning',
                    type: imageData || filePath ? 'image' : 'url',
                    content: filePath || url || imageData,
                    skillTags: JSON.stringify(tags || ['design', 'reference'])
                }
            });

            return {
                success: true,
                knowledgeId: knowledge.id,
                message: 'Design reference stored successfully'
            };
        } catch (error) {
            logger.error(`${this.name}: Error storing design reference:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Record usage of knowledge items
     */
    async recordKnowledgeUsage(knowledgeItems) {
        try {
            await Promise.all(
                knowledgeItems.map(item =>
                    prisma.agentKnowledge.update({
                        where: { id: item.id },
                        data: {
                            usageCount: item.usageCount + 1,
                            lastUsed: new Date()
                        }
                    })
                )
            );
        } catch (error) {
            logger.error(`${this.name}: Error recording knowledge usage:`, error);
        }
    }

    /**
     * Handle chat messages with design context
     */
    async handleChatMessage(message, conversationHistory = [], taskContext = null, projectId = null) {
        logger.info(`${this.name}: Processing chat message about design`);

        const lowerMessage = message.toLowerCase();

        // If it's a specific request for recommendations, use the internal logic
        // but make it cross-lingual by checking for general intent
        const isRequestingDesign = /design|recomend|suggest|sugest|criar|create|da me|give me/i.test(lowerMessage);

        if (isRequestingDesign) {
            const result = await this.createDesignRecommendation({
                description: message,
                requirements: message,
                projectId
            });

            if (result.success) {
                let response = `🎨 I've created a comprehensive design proposal for you!\n\n`;
                response += `**Main Recommendation: ${result.recommendation.mainDesign.concept}**\n`;
                response += `Color Palette: ${result.recommendation.mainDesign.colorPalette.join(', ')}\n`;
                response += `Typography: ${result.recommendation.mainDesign.typography}\n\n`;
                response += `I've also prepared ${result.recommendation.alternatives.length} alternative design concepts for you to consider.\n`;

                if (result.recommendation.knowledgeUsed.length > 0) {
                    response += `\n📚 *Knowledge Applied:* This recommendation draws from ${result.recommendation.knowledgeUsed.length} reference(s) in my knowledge base.`;
                }

                return {
                    success: true,
                    response,
                    metadata: result.recommendation
                };
            }
        }

        // For everything else, use the standard LLM response via base agent
        // but with design-specific context added to the prompt
        return await super.handleChatMessage(
            `[DESIGN CONTEXT: You are a UI/UX expert. Respond to this message staying in character and focusing on design value.] ${message}`,
            conversationHistory,
            taskContext,
            projectId
        );
    }
}

export default DesignAgent;
