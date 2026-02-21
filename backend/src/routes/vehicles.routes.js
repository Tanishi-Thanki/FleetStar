const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res, next) => {
    try {
        const vehicles = await prisma.vehicle.findMany();
        res.json({ success: true, data: vehicles });
    } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
    try {
        const vehicle = await prisma.vehicle.create({ data: req.body });
        res.status(201).json({ success: true, data: vehicle });
    } catch (error) { next(error); }
});

module.exports = router;
