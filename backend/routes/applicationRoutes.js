const express = require('express');
const router = express.Router();
const applicationsController = require('../controllers/applicationsController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, applicationsController.applyForPet);
router.get('/mine', protect, applicationsController.myApplications);

// Admin routes must come before /:id so "mine" is not treated as an id.
router.get('/', protect, adminOnly, applicationsController.allApplications);
router.put('/:id/status', protect, adminOnly, applicationsController.updateStatus);

router.get('/:id', protect, applicationsController.oneApplication);

module.exports = router;
