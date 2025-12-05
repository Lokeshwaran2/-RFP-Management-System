const mongoose = require('mongoose');

const comparisonSchema = new mongoose.Schema({
    rfpId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFP', required: true, unique: true },
    comparisonMatrix: [{
        vendor_id: String,
        score: Number,
        analysis: String,
        pros: [String],
        cons: [String]
    }],
    recommendation: String,
    justification: String,
    proposalCount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comparison', comparisonSchema);
