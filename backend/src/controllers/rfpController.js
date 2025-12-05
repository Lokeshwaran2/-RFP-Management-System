const RFP = require('../models/RFP');
const Vendor = require('../models/Vendor');
const Proposal = require('../models/Proposal');
const aiService = require('../services/aiService');
const emailService = require('../services/emailService');

exports.createRFP = async (req, res) => {
    try {
        const { content, title } = req.body;
        // 1. Generate structured data from AI
        const structuredData = await aiService.generateRFPStructure(content);

        // 2. Save to DB
        const rfp = new RFP({
            title: title || structuredData.title || 'Untitled RFP',
            content,
            structuredData,
            status: 'Draft'
        });

        await rfp.save();
        res.status(201).json(rfp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllRFPs = async (req, res) => {
    try {
        const rfps = await RFP.find().sort({ createdAt: -1 });
        res.json(rfps);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getRFP = async (req, res) => {
    try {
        const rfp = await RFP.findById(req.params.id);
        if (!rfp) return res.status(404).json({ error: 'RFP not found' });
        res.json(rfp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.sendRFPEmails = async (req, res) => {
    try {
        const { vendorIds } = req.body;
        const rfp = await RFP.findById(req.params.id);
        if (!rfp) return res.status(404).json({ error: 'RFP not found' });

        const vendors = await Vendor.find({ _id: { $in: vendorIds } });

        const results = [];
        for (const vendor of vendors) {
            // Send email
            // Send email
            const subject = `RFP Invitation: ${rfp.title} [Ref:${rfp._id}]`;

            // Structured details for the email
            const itemsList = rfp.structuredData.items.map(i => `<li><strong>${i.name}</strong>: ${i.quantity} units (${i.specs})</li>`).join('');

            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">Request for Proposal: ${rfp.title}</h2>
                    <p>Dear ${vendor.name},</p>
                    <p>We are inviting you to submit a proposal for the following requirements:</p>
                    
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Requirements</h3>
                        <ul>${itemsList}</ul>
                        <p><strong>Budget:</strong> ${rfp.structuredData.budget}</p>
                        <p><strong>Timeline:</strong> ${rfp.structuredData.timeline}</p>
                    </div>

                    <div style="border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #dc2626;">Required Reply Details</h3>
                        <p>Please reply to this email with the following details:</p>
                        <ul>
                            <li><strong>Total Price</strong> (including currency)</li>
                            <li><strong>Delivery Date</strong> (or timeline)</li>
                            <li><strong>Warranty Terms</strong></li>
                            <li><strong>Payment Terms</strong></li>
                            <li><strong>Product Specifications</strong> (if different from requested)</li>
                        </ul>
                    </div>

                    <p>Please ensure your reply subject line remains unchanged: <strong>[Ref:${rfp._id}]</strong></p>
                    <p>Best regards,<br>Procurement Team</p>
                </div>
            `;

            await emailService.sendEmail(vendor.email, subject, `Please view this email in an HTML-compatible client.\n\nRef:${rfp._id}`, html);
            results.push({ vendor: vendor.name, status: 'Sent' });
        }

        rfp.status = 'Open';
        await rfp.save();

        res.json({ message: 'Emails sent', results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProposals = async (req, res) => {
    try {
        const proposals = await Proposal.find({ rfpId: req.params.id }).populate('vendorId');
        res.json(proposals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.compareProposals = async (req, res) => {
    try {
        const rfp = await RFP.findById(req.params.id);
        const proposals = await Proposal.find({ rfpId: req.params.id }).populate('vendorId');

        if (proposals.length === 0) {
            return res.status(400).json({ error: 'No proposals to compare' });
        }

        // Check cache first
        const Comparison = require('../models/Comparison');
        const existingComparison = await Comparison.findOne({ rfpId: req.params.id });

        // Return cache ONLY if proposal count matches
        if (existingComparison && existingComparison.proposalCount === proposals.length) {
            console.log("Returning cached comparison for RFP:", req.params.id);
            return res.json({
                comparison_matrix: existingComparison.comparisonMatrix,
                recommendation: existingComparison.recommendation,
                justification: existingComparison.justification
            });
        }

        // If count mismatch, we proceed to re-run AI (and will update/replace cache)
        if (existingComparison) {
            console.log("Cache invalidated: Proposal count changed.");
            await Comparison.deleteOne({ _id: existingComparison._id });
        }

        // Prepare data for AI
        const proposalsForAI = proposals.map(p => ({
            id: p._id,
            vendor: p.vendorEmail || (p.vendorId ? p.vendorId.email : "Unknown"),
            data: p.extractedData,
            raw_text: p.emailContent // Pass raw email for better context if extraction failed
        }));

        const comparisonResult = await aiService.compareProposals(rfp.structuredData, proposalsForAI);

        // Save to cache (Upsert to prevent duplicate key errors)
        await Comparison.findOneAndUpdate(
            { rfpId: rfp._id },
            {
                comparisonMatrix: comparisonResult.comparison_matrix,
                recommendation: comparisonResult.recommendation,
                justification: comparisonResult.justification,
                proposalCount: proposals.length,
                createdAt: new Date()
            },
            { upsert: true, new: true }
        );

        res.json(comparisonResult);
    } catch (error) {
        console.error("Error in compareProposals:", error);
        res.status(500).json({ error: error.message });
    }
};
