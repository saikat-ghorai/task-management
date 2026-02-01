import express from 'express';
import dotenv from 'dotenv/config';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { connectDB } from './config/dbConnection.js';
import errorHandler from './middlewares/errorHandler.js';

import initialRouter from './routes/initialRouter.js';
import authRouter from './routes/authRouter.js';
import taskRouter from './routes/taskRouter.js';
import cronRouter from './routes/cronRouter.js';

const app = express();

// DB
connectDB();

// Security
app.disable('x-powered-by');
app.use(helmet());

// Request Parsing
app.use(express.json({ limit: '1mb' }));

// Compression
app.use(compression());

const corsOptions = {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
};
app.use(cors(corsOptions));

//Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        title: 'Too many requests',
        message: 'Please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api', apiLimiter);

// Routes
app.use("/", initialRouter);
app.use("/api", initialRouter);
app.use('/api/auth', authRouter);
app.use('/api/tasks', taskRouter);
app.use('/cron', cronRouter);

// 404 Handler
app.use((req, res, error) => {
    return res.status(404).json({ title: 'Not found!', message: 'No API found!' });
})

// Error Handler
app.use(errorHandler)

export { app }