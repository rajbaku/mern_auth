import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongoDb.js';
import authRouter from './routes/authRoutes.js';
import userRoutes from './routes/userRouter.js';

const app = express();
const port = process.env.PORT || 4000;

// Database connection
connectDB();

const allowedOrigins = ['http://localhost:5173']

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use(cookieParser());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
