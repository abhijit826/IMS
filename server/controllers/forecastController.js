// server/controllers/forecastController.js
const mongoose = require('mongoose');
const Log = require('../models/Log');
const Item = require('../models/Item');
const createCsvWriter = require('csv-writer').createObjectCsvStringifier; // Import csv-writer

exports.getDemandForecast = async (req, res) => {
  try {
    const { itemId, days = 30 } = req.query;

    if (itemId && !mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: 'Invalid item ID' });
    }

    const query = itemId ? { _id: itemId } : {};
    const items = await Item.find(query);

    if (!items.length) {
      return res.status(404).json({ message: 'No items found' });
    }

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    const forecasts = await Promise.all(
      items.map(async (item) => {
        const logs = await Log.find({
          $or: [{ action: 'transfer' }, { action: 'update' }],
          itemId: item._id,
          timestamp: { $gte: startDate, $lte: endDate },
        });

        const totalQuantity = logs.reduce((sum, log) => {
          const quantity = log.details?.quantity || 0;
          return quantity > 0 ? sum + quantity : sum;
        }, 0);

        const dailyAverage = totalQuantity / days;
        const weeklyForecast = dailyAverage * 7;

        let daysUntilLowStock;
        if (dailyAverage === 0) {
          // If no demand, check if already below threshold
          daysUntilLowStock = item.quantity <= item.lowStockThreshold ? 0 : -1; // -1 indicates "unknown"
        } else {
          daysUntilLowStock = (item.quantity - item.lowStockThreshold) / dailyAverage;
          daysUntilLowStock = daysUntilLowStock > 0 ? Math.floor(daysUntilLowStock) : 0;
        }

        const overstockThreshold = weeklyForecast * 3;
        const isOverstocked = item.quantity > overstockThreshold && weeklyForecast > 0;

        return {
          itemId: item._id,
          itemName: item.name,
          currentQuantity: item.quantity,
          lowStockThreshold: item.lowStockThreshold,
          weeklyForecast: weeklyForecast || 0,
          daysUntilLowStock, // Will be 0 if below threshold, -1 if unknown, or a positive number
          isOverstocked,
          overstockAmount: isOverstocked ? item.quantity - overstockThreshold : 0,
          hasTransferData: logs.some(log => log.details?.quantity > 0),
        };
      })
    );

    res.json(forecasts);
  } catch (error) {
    console.error('Error in getDemandForecast:', error);
    res.status(500).json({ message: 'Failed to fetch demand forecast', error: error.message });
  }
};

// Export Forecast Data as CSV
exports.exportForecasts = async (req, res) => {
  try {
    // Reuse the logic from getDemandForecast to fetch the data
    // You might want to extract the core forecast logic into a separate helper function
    // For simplicity here, we'll duplicate some logic. Adjust days query param if needed.
    const days = 30; // Or get from req.query if needed
    const items = await Item.find({});
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    const forecasts = await Promise.all(
      items.map(async (item) => {
        const logs = await Log.find({
          $or: [{ action: 'transfer' }, { action: 'update' }],
          itemId: item._id,
          timestamp: { $gte: startDate, $lte: endDate },
        });
        const totalQuantity = logs.reduce((sum, log) => (log.details?.quantity || 0) > 0 ? sum + log.details.quantity : sum, 0);
        const dailyAverage = totalQuantity / days;
        const weeklyForecast = dailyAverage * 7;
        let daysUntilLowStock = dailyAverage === 0 ? (item.quantity <= item.lowStockThreshold ? 0 : -1) : Math.max(0, Math.floor((item.quantity - item.lowStockThreshold) / dailyAverage));
        const overstockThreshold = weeklyForecast * 3;
        const isOverstocked = item.quantity > overstockThreshold && weeklyForecast > 0;

        return {
          itemName: item.name,
          currentQuantity: item.quantity,
          lowStockThreshold: item.lowStockThreshold,
          weeklyForecast: weeklyForecast || 0,
          daysUntilLowStock,
          isOverstocked: isOverstocked ? 'Yes' : 'No', // Format for CSV
          overstockAmount: isOverstocked ? (item.quantity - overstockThreshold).toFixed(2) : 0,
        };
      })
    );

    // Define CSV structure
    const csvWriter = createCsvWriter({
      header: [
        { id: 'itemName', title: 'Item Name' },
        { id: 'currentQuantity', title: 'Current Quantity' },
        { id: 'lowStockThreshold', title: 'Low Stock Threshold' },
        { id: 'weeklyForecast', title: 'Weekly Forecast' },
        { id: 'daysUntilLowStock', title: 'Days Until Low Stock (-1=Unknown)' },
        { id: 'isOverstocked', title: 'Overstocked?' },
        { id: 'overstockAmount', title: 'Overstock Amount' },
      ],
    });

    const csvString = csvWriter.getHeaderString() + csvWriter.stringifyRecords(forecasts);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="forecasts.csv"');
    res.status(200).send(csvString);

  } catch (error) {
    console.error('Error exporting forecasts:', error);
    res.status(500).json({ message: 'Failed to export forecasts', error: error.message });
  }
};