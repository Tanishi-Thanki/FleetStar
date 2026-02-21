const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res, next) => {
    try {
        const drivers = await prisma.driver.findMany();
        res.json({ success: true, data: drivers });
    } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
    try {
        const driver = await prisma.driver.create({ data: req.body });
        res.status(201).json({ success: true, data: driver });
    } catch (error) { next(error); }
});

module.exports = router;
