const express = require('express');
const router = express.Router();
const petsController = require('../controllers/petsController');
const { protect, adminOnly } = require('../middleware/auth');

// Public read routes
router.get('/', petsController.listPets);
router.get('/:id', petsController.getPet);

// Admin-only write routes
router.post('/', protect, adminOnly, petsController.createPet);
router.put('/:id', protect, adminOnly, petsController.updatePet);
router.delete('/:id', protect, adminOnly, petsController.deletePet);

module.exports = router;
