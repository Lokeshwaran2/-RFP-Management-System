const mongoose = require('mongoose');

const rfpSchema = new mongoose.Schema({
    title: { type: String, required: true },
    status: { type: String, enum: ['Draft', 'Open', 'Closed'], default: 'Draft' },
    content: { type: String, required: true }, // Original natural language request
    structuredData: {
        items: [{
            name: String,
            quantity: Number,
            specs: String
        }],
        budget: String,
        timeline: String,
        warranty: String,
        terms: String
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('RFP', rfpSchema);
