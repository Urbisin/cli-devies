
const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

// Endpoint /hello
router.get('/hello', apiController.hello);

module.exports = router;
