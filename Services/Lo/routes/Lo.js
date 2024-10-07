
const express = require('express');
const router = express.Router();
const LoController = require('../controllers/LoController');

// Rutas CRUD
router.post('/', LoController.create);
router.get('/', LoController.findAll);
router.get('/:id', LoController.findOne);
router.put('/:id', LoController.update);
router.delete('/:id', LoController.delete);

module.exports = router;
