const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { errorHandler } = require('./utils/errorHandler');

const vehiclesRoutes = require('./routes/vehicles.routes');
const driversRoutes = require('./routes/drivers.routes');
const tripsRoutes = require('./routes/trips.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/maintenance', maintenanceRoutes);

app.get('/health', (req, res) => res.json({ status: 'API is running' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Command Center Backend running on port ${PORT}`);
});
