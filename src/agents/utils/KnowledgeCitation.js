/**
 * Knowledge Citation Utility
 * Tracks and formats knowledge usage in agent responses
 */

class KnowledgeCitation {
    constructor() {
        this.usedKnowledge = [];
    }

    /**
     * Track that a knowledge item was used
     * @param {Object} knowledgeItem - The knowledge item that was used
     */
    trackUsage(knowledgeItem) {
        if (!this.usedKnowledge.find(k => k.id === knowledgeItem.id)) {
            this.usedKnowledge.push({
                id: knowledgeItem.id,
                title: knowledgeItem.title,
                type: knowledgeItem.type,
                source: knowledgeItem.content
            });
        }
    }

    /**
     * Get citation text for responses
     * @returns {string} Formatted citation text
     */
    getCitationText() {
        if (this.usedKnowledge.length === 0) return '';

        const sources = this.usedKnowledge.map(k => k.title).join(', ');
        return `\n\n📚 **Knowledge Applied**: This response draws from ${this.usedKnowledge.length} knowledge source(s): ${sources}`;
    }

    /**
     * Get citation data for task reports
     * @returns {Object} Citation data
     */
    getCitationData() {
        return {
            count: this.usedKnowledge.length,
            sources: this.usedKnowledge.map(k => ({
                id: k.id,
                title: k.title,
                type: k.type
            }))
        };
    }

    /**
     * Update knowledge usage statistics in database
     * @param {Function} updateFn - Function to update database
     */
    async updateUsageStats(updateFn) {
        for (const knowledge of this.usedKnowledge) {
            try {
                await updateFn(knowledge.id);
            } catch (error) {
                console.error(`Failed to update usage stats for knowledge ${knowledge.id}:`, error);
            }
        }
    }

    /**
     * Clear tracked knowledge
     */
    clear() {
        this.usedKnowledge = [];
    }
}

module.exports = KnowledgeCitation;
