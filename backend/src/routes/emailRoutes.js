const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

router.post('/ingest', emailController.ingestEmails);

module.exports = router;
