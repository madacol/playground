class Node {
    constructor(id, {
        verificationProbability = Math.random(), verificationCost = 1, verificationAccuracy = 0.9, sharingThreshold = Math.random(), sourceMemoryStrength = Math.random(), memoryDecayRate = 0.1, recentSourceWeight = 0.7, trustUpdateRate = 0.3
    } = {}) {
        // Basic properties
        this.id = id;
        this.state = 'susceptible';
        this.degree = 0;

        // Verification properties
        this.verificationProbability = verificationProbability;
        this.verificationCost = verificationCost;
        this.verificationAccuracy = verificationAccuracy;

        // Sharing properties
        this.sharingThreshold = sharingThreshold;

        // Memory properties
        this.sourceMemoryStrength = sourceMemoryStrength;
        this.memoryDecayRate = memoryDecayRate;
        this.recentSourceWeight = recentSourceWeight;

        // Trust properties
        this.trustUpdateRate = trustUpdateRate;

        // State tracking
        this.beliefState = 0;
        this.sourceTrust = new Map(); // Maps sourceId -> trust value
        this.sourceHistory = []; // Array of {source, timestamp, accuracy}
        this.sharingHistory = []; // Array of {infoId, timestamp, recipients}
    }

    // Verification methods
    verifyInformation(information) {
        if (Math.random() < this.verificationProbability) {
            const verificationSuccess = Math.random() < this.verificationAccuracy;
            return verificationSuccess ? information.truthValue : !information.truthValue;
        }
        return null; // Did not attempt verification
    }

    // Sharing decision
    decidesToShare(information) {
        const shareProb = Math.min(1,
            this.sharingThreshold *
            information.emotionalImpact *
            this.beliefState *
            this.getTrustFactor(information.source)
        );
        return Math.random() < shareProb;
    }

    // Trust methods
    getTrustFactor(sourceId) {
        return this.sourceTrust.get(sourceId) || 0.5; // Default trust of 0.5
    }

    updateTrust(sourceId, accuracy) {
        const currentTrust = this.getTrustFactor(sourceId);
        const newTrust = currentTrust + this.trustUpdateRate * (accuracy - currentTrust);
        this.sourceTrust.set(sourceId, newTrust);
    }

    // Memory methods
    recordSource(sourceId, accuracy) {
        const timestamp = Date.now();
        this.sourceHistory.push({ source: sourceId, timestamp, accuracy });
        this.updateTrust(sourceId, accuracy);
        this.pruneSourceHistory();
    }

    recordSharing(infoId, recipients) {
        const timestamp = Date.now();
        this.sharingHistory.push({ infoId, timestamp, recipients });
    }

    pruneSourceHistory() {
        const now = Date.now();
        const memoryThreshold = now - (1 / this.memoryDecayRate);
        this.sourceHistory = this.sourceHistory.filter(
            record => record.timestamp > memoryThreshold
        );
    }

    // Belief update
    updateBelief(information, repetitionFactor, verificationResult) {
        const priorWeight = 0.3;
        const repetitionWeight = 0.4;
        const verificationWeight = 0.3;

        this.beliefState =
            priorWeight * this.beliefState +
            repetitionWeight * repetitionFactor +
            verificationWeight * (verificationResult ?? this.beliefState);
    }
}
