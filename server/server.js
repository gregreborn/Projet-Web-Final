import express from 'express';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import clientsRoutes from './routes/clients.js';
import reservationsRoutes from './routes/reservations.js';
import tablesRoutes from './routes/tables.js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'http://localhost' : 'http://localhost:4200',
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());

// ✅ CSRF Middleware (with environment consideration)
app.use(
    csrf({
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Only secure in production
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
        }
    }),
    (req, res, next) => {
        res.cookie('XSRF-TOKEN', req.csrfToken(), {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
        });
        next();
    }
);

// Routes
app.use('/api/clients', clientsRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/tables', tablesRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
