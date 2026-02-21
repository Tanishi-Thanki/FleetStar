const { APIError } = require('../utils/errorHandler');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * RULE 1: A driver with an EXPIRED license CANNOT be assigned to a trip.
 */
const validateDriverLicense = async (driverId) => {
    if (!driverId) {
        throw new APIError('Driver ID is required.', 400);
    }

    const driver = await prisma.driver.findUnique({
        where: { id: driverId },
    });

    if (!driver) {
        throw new APIError('Driver not found.', 404);
    }

    if (driver.license_status === 'Expired') {
        throw new APIError(
            'Driver license is expired and cannot be assigned to a trip.',
            400
        );
    }

    return driver;
};

/**
 * RULE 2 & 4: Vehicle constraints
 */
const validateVehicleForTrip = async (vehicleId, cargoWeight) => {
    if (!vehicleId) {
        throw new APIError('Vehicle ID is required.', 400);
    }

    const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
    });

    if (!vehicle) {
        throw new APIError('Vehicle not found.', 404);
    }

    if (vehicle.status === 'In Shop') {
        throw new APIError(
            'Vehicle is currently In Shop and cannot be assigned to a trip.',
            400
        );
    }

    if (vehicle.status === 'On Trip') {
        throw new APIError(
            'Vehicle is already currently on a trip.',
            400
        );
    }

    if (cargoWeight > vehicle.max_load) {
        throw new APIError(
            `Cargo weight (${cargoWeight}) exceeds vehicle maximum load capacity (${vehicle.max_load}).`,
            400
        );
    }

    return vehicle;
};

module.exports = {
    validateDriverLicense,
    validateVehicleForTrip,
};