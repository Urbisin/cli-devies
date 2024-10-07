
const express = require('express');
const router = express.Router();
const MaController = require('../controllers/MaController');

// Rutas CRUD
router.post('/', MaController.create);
router.get('/', MaController.findAll);
router.get('/:id', MaController.findOne);
router.put('/:id', MaController.update);
router.delete('/:id', MaController.delete);

module.exports = router;
