import express from 'express';
import { getUserData } from '../controllers/userController.js';
import userAuth from '../middleware/userAuth.js';

const userRoutes = express.Router();

userRoutes.get('/user-data', userAuth, getUserData);

export default userRoutes;
