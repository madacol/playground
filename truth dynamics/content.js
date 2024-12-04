/**
 * Represents a piece of content in the information network
 */
class Content {
    /**
     * @param {Object} params
     * @param {number} params.verifiability - How easily fact-checkable (0-1)
     * @param {number} params.emotionalImpact - Emotional triggering level (0-2)
     * @param {number} params.truthValue - Ground truth accuracy (0-1)
     * @param {number} params.spreadRate - Rate of content spread
     * @param {number} params.factCheckDelay - Time delay for fact checking
     * @param {number} params.attentionDecayRate - Rate of attention decay
     * @param {number} params.saturationTime - Time to reach saturation
     */
    constructor({
        verifiability = Math.random(),
        emotionalImpact = 1,
        truthValue = Math.random(),
        spreadRate = 0.1,
        factCheckDelay = 1,
        attentionDecayRate = 0.05,
        saturationTime = 100
    } = {}) {
        // Content Properties
        this.verifiability = this.#clamp(verifiability, 0, 1);
        this.emotionalImpact = this.#clamp(emotionalImpact, 0, 2);
        this.truthValue = this.#clamp(truthValue, 0, 1);

        // Spread Mechanics
        this.spreadRate = spreadRate;
        this.factCheckDelay = factCheckDelay;
        this.attentionDecayRate = attentionDecayRate;
        this.saturationTime = saturationTime;

        // Tracking
        this.createdAt = Date.now();
        this.shareCount = 0;
        this.verificationCount = 0;
        this.currentAttention = 1;
    }

    /**
     * Calculate verification cost based on verifiability
     * @returns {number} The cost of verification
     */
    getVerificationCost(baseVerificationCost = 1) {
        return baseVerificationCost * (1 / this.verifiability);
    }

    /**
     * Calculate current attention level based on time elapsed
     * @returns {number} Current attention level (0-1)
     */
    getCurrentAttention() {
        const timeElapsed = (Date.now() - this.createdAt) / 1000; // Convert to seconds
        this.currentAttention = Math.exp(-this.attentionDecayRate * timeElapsed);
        return this.currentAttention;
    }

    /**
     * Calculate share probability based on content properties
     * @param {number} sharingThreshold - Node's sharing threshold
     * @param {number} beliefState - Node's belief state
     * @param {number} trustFactor - Trust in the source
     * @returns {number} Probability of sharing (0-1)
     */
    calculateShareProbability(sharingThreshold, beliefState, trustFactor) {
        return Math.min(1, sharingThreshold * this.emotionalImpact * beliefState * trustFactor);
    }

    /**
     * Record a share event
     */
    recordShare() {
        this.shareCount++;
    }

    /**
     * Record a verification attempt
     */
    recordVerification() {
        this.verificationCount++;
    }

    /**
     * Helper method to clamp values between min and max
     * @private
     */
    #clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
}

export default Content; 