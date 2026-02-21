const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const {
    validateDriverLicense,
    validateVehicleForTrip
} = require('./validation.service');

const { APIError } = require('../utils/errorHandler');

/**
 * Create a new trip (DISPATCH)
 */
const createTrip = async (data) => {
    const { driverId, vehicleId, cargo_weight } = data;

    // 🔒 Validations
    await validateDriverLicense(driverId);
    await validateVehicleForTrip(vehicleId, cargo_weight);

    // 📝 Create trip
    //const trip = await prisma.trip.create({
    //    data: {
    //       driverId,
    //       vehicleId,
    //     cargo_weight,
    //      status: 'Pending',
    //  },
    //});
    const trip = await prisma.trip.create({
        data: {
            cargo_weight,
            status: 'Pending',
            driver: {
                connect: { id: driverId },
            },
            vehicle: {
                connect: { id: vehicleId },
            },
        },
    });

    return trip;
};

/**
 * Start a trip
 */
const startTrip = async (tripId) => {
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new APIError('Trip not found', 404);
    if (trip.status !== 'Pending')
        throw new APIError('Trip is already started or completed', 400);

    const [updatedTrip] = await prisma.$transaction([
        prisma.trip.update({
            where: { id: tripId },
            data: { status: 'Started' },
        }),
        prisma.vehicle.update({
            where: { id: trip.vehicleId },
            data: { status: 'On Trip' },
        }),
        prisma.driver.update({
            where: { id: trip.driverId },
            data: { duty_status: 'On Duty' },
        }),
    ]);

    return updatedTrip;
};

/**
 * Complete a trip
 */
const completeTrip = async (tripId) => {
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new APIError('Trip not found', 404);
    if (trip.status !== 'Started')
        throw new APIError('Only started trips can be completed', 400);

    const [updatedTrip] = await prisma.$transaction([
        prisma.trip.update({
            where: { id: tripId },
            data: { status: 'Completed' },
        }),
        prisma.vehicle.update({
            where: { id: trip.vehicleId },
            data: { status: 'Available' },
        }),
        prisma.driver.update({
            where: { id: trip.driverId },
            data: { duty_status: 'Available' },
        }),
    ]);

    return updatedTrip;
};

/**
 * Get all trips
 */
const getTrips = async () =>
    prisma.trip.findMany({
        include: {
            vehicle: true,
            driver: true,
        },
    });

module.exports = {
    createTrip,
    startTrip,
    completeTrip,
    getTrips,
};