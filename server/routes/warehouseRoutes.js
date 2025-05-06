const express = require('express');
const router = express.Router();
// Import all needed controller functions
const { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse, getWarehouseQuantities } = require('../controllers/warehouseController');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');

// Apply authMiddleware to all warehouse routes, including quantities
router.get('/', authMiddleware, getWarehouses);
router.post('/', authMiddleware, roleMiddleware(['admin']), createWarehouse);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateWarehouse);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteWarehouse);



router.get('/quantities', authMiddleware, getWarehouseQuantities); // Added authMiddleware

module.exports = router;