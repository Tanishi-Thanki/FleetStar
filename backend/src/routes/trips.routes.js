const express = require('express');
const router = express.Router();
const tripService = require('../services/trip.service');

router.get('/', async (req, res, next) => {
    try {
        res.json({ success: true, data: await tripService.getTrips() });
    } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
    try {
        res.status(201).json({ success: true, data: await tripService.createTrip(req.body) });
    } catch (error) { next(error); }
});

router.post('/:id/start', async (req, res, next) => {
    try {
        res.json({ success: true, data: await tripService.startTrip(req.params.id) });
    } catch (error) { next(error); }
});

router.post('/:id/complete', async (req, res, next) => {
    try {
        res.json({ success: true, data: await tripService.completeTrip(req.params.id) });
    } catch (error) { next(error); }
});

module.exports = router;
