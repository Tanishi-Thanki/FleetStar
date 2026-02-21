const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { APIError } = require('../utils/errorHandler');

const addMaintenanceLog = async (data) => {
    const { vehicle_id, description } = data;
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicle_id } });

    if (!vehicle) throw new APIError('Vehicle not found', 404);
    if (vehicle.status === 'On Trip') throw new APIError('Cannot send vehicle to maintenance while on trip.', 400);

    const [maintenanceLog, updatedVehicle] = await prisma.$transaction([
        prisma.maintenanceLog.create({
            data: { vehicle_id, description, status: 'Pending' }
        }),
        prisma.vehicle.update({
            where: { id: vehicle_id },
            data: { status: 'In Shop' }
        })
    ]);

    return { maintenanceLog, vehicle: updatedVehicle };
};

const getLogs = async () => prisma.maintenanceLog.findMany({ include: { vehicle: true } });

module.exports = { addMaintenanceLog, getLogs };
