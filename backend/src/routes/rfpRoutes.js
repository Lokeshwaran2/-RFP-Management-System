const express = require('express');
const router = express.Router();
const rfpController = require('../controllers/rfpController');

router.post('/create', rfpController.createRFP);
router.get('/list', rfpController.getAllRFPs); // Changed to /list to avoid conflict with /:id if not careful, but /:id is usually fine if placed after. Let's use /list for safety or just /
router.get('/:id', rfpController.getRFP);
router.post('/:id/send-emails', rfpController.sendRFPEmails);
router.get('/:id/proposals', rfpController.getProposals);
router.post('/:id/compare', rfpController.compareProposals);

module.exports = router;
