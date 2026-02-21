const express = require('express');
const router = express.Router();
const maintenanceService = require('../services/maintenance.service');

router.get('/', async (req, res, next) => {
    try {
        res.json({ success: true, data: await maintenanceService.getLogs() });
    } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
    try {
        res.status(201).json({ success: true, data: await maintenanceService.addMaintenanceLog(req.body) });
    } catch (error) { next(error); }
});

module.exports = router;
