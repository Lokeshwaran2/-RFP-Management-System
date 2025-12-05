const emailService = require('../services/emailService');
const aiService = require('../services/aiService');
const Proposal = require('../models/Proposal');
const RFP = require('../models/RFP');
const Vendor = require('../models/Vendor');

exports.ingestEmails = async (req, res) => {
    try {
        const { rfpId } = req.body;

        const emails = await emailService.fetchAndParseEmails(rfpId);

        const processed = [];

        for (const email of emails) {
            // 1. Extract RFP ID from subject or body (Ref:ID)
            const rfpIdMatch = email.subject.match(/Ref:([a-f0-9]{24})/);
            if (!rfpIdMatch) {
                continue;
            }
            const rfpId = rfpIdMatch[1];

            // 2. Find Vendor
            let vendor = await Vendor.findOne({ email: email.from });

            // 3. Check for Duplicates (Idempotency)
            const existingProposal = await Proposal.findOne({ emailUid: email.uid });
            if (existingProposal) {
                processed.push({ subject: email.subject, status: 'Skipped (Duplicate)', proposalId: existingProposal._id });
                continue;
            }

            // 4. Parse Email Body with AI
            const extractedData = await aiService.parseVendorEmail(email.text);

            // 5. Create Proposal
            const proposal = new Proposal({
                rfpId,
                vendorId: vendor ? vendor._id : null,
                vendorEmail: email.from,
                emailUid: email.uid,
                emailContent: email.text,
                extractedData
            });

            await proposal.save();
            processed.push({ subject: email.subject, status: 'Processed', proposalId: proposal._id });
        }

        res.json({ message: 'Ingestion complete', processed });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
