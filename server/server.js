const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const pool = require('./db'); // Import DB connection

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
const clientsRoute = require('./routes/clients');
const tablesRoute = require('./routes/tables');
const reservationsRoute = require('./routes/reservations');

app.use('/api/clients', clientsRoute);
app.use('/api/tables', tablesRoute);
app.use('/api/reservations', reservationsRoute);

// Root route for testing
app.get('/', (req, res) => {
    res.send('Welcome to the Restaurant Reservation API! 🎉');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
