const express = require('express');
const Item = require('../models/Item');
const StockHistory = require('../models/StockHistory');
const router = express.Router();
const { getItems,
  createItem,
  updateItem,
  deleteItem,
  exportItems,
  getBarChartData,
  getPieChartData,
  getLowStockAlert,
  createLog,
  transferItem
} = require('../controllers/itemController');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');

router.get('/', authMiddleware, getItems); // Changed from /items
router.post('/', authMiddleware, roleMiddleware(['admin']), createItem); // Changed from /items
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateItem); // Changed from /items/:id
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteItem); // Changed from /items/:id
router.get('/export', authMiddleware, exportItems); // Changed from /items/export
router.get('/bar-chart', authMiddleware, getBarChartData); // Changed from /items/bar-chart
router.get('/pie-chart', authMiddleware, getPieChartData); // Changed from /items/pie-chart
router.get('/low-stock-alert', authMiddleware, getLowStockAlert); // Changed from /items/low-stock-alert
router.post('/logs', authMiddleware, createLog); // This might belong in a different router if mounted under /api/items
router.post('/transfer', authMiddleware, transferItem); // Changed from /items/transfer


router.get('/warehouse-quantities', authMiddleware, async (req, res) => {
  try {
    const quantities = await Item.aggregate([
      {
        $group: {
          _id: '$warehouse', // Group by warehouse name
          totalQuantity: { $sum: '$quantity' }, // Sum the quantities
        },
      },
      {
        $project: {
          warehouse: '$_id',
          totalQuantity: 1,
          _id: 0,
        },
      },
    ]);
    res.json(quantities);
  } catch (err) {
    console.error('Error fetching warehouse quantities:', err);
    res.status(500).json({ message: 'Failed to fetch warehouse quantities', error: err.message });
  }
});

router.get('/by-warehouse/:warehouseName', authMiddleware, async (req, res) => {
  try {
    const { warehouseName } = req.params;
    // Decode the warehouse name in case it contains spaces like %20
    const decodedWarehouseName = decodeURIComponent(warehouseName);
    const items = await Item.find({ warehouse: warehouseName });
    res.json(items);
  } catch (err) {
    console.error('Error fetching items by warehouse:', err);
    res.status(500).json({ message: 'Failed to fetch items by warehouse', error: err.message });
  }
});

// Removed duplicate/conflicting PUT /:id and POST /transfer/:id routes

module.exports = router;