import express from 'express';
import dotenv from 'dotenv/config';
import cors from 'cors';
import { connectDB } from './config/dbConnection.js';
import errorHandler from './middlewares/errorHandler.js';
import initialRouter from './routes/initialRouter.js';

const app = express();

connectDB();

const corsOptions = {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
};
app.use(cors(corsOptions));

app.use(express.json());
app.use("/", initialRouter);
app.use("/api", initialRouter);

app.use((req, res, error) => {
    return res.status(404).json({ title: 'Not found!', message: 'No API found!' });
})

app.use(errorHandler)

export { app }