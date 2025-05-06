// server/routes/forecastRoutes.js
const express = require('express');
const router = express.Router();
const forecastController = require('../controllers/forecastController');
// Assuming authMiddleware is needed for export as well
const { authMiddleware } = require('../middlewares/auth');

// Route to get demand forecasts
router.get('/', authMiddleware, forecastController.getDemandForecast); // Added authMiddleware for consistency
router.get('/export', authMiddleware, forecastController.exportForecasts); // Add export route

module.exports = router;