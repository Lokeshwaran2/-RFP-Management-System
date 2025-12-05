const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
    rfpId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFP', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }, // Optional if unknown initially
    vendorEmail: String, // To track where it came from if vendorId not found
    emailUid: { type: String, unique: true }, // To prevent duplicate processing
    emailContent: String,
    extractedData: {
        totalPrice: Number,
        currency: String,
        lineItems: [{
            name: String,
            price: Number,
            quantity: Number
        }],
        deliveryTime: String,
        warranty: String,
        paymentTerms: String
    },
    aiAnalysis: {
        score: Number,
        pros: [String],
        cons: [String],
        summary: String
    },
    receivedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Proposal', proposalSchema);
