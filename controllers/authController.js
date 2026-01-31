import asyncHandler from 'express-async-handler';
import { v4 as uuidv4 } from 'uuid';
import * as argon2 from 'argon2';
import jwt from "jsonwebtoken";
import { createUser, findUserByMail, findUserById } from '../services/userService.js';

const signin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const userDetails = await findUserByMail(username);
    if (!userDetails) {
        const error = new Error('Wrong username provided!');
        error.statusCode = 401;
        throw error;
    }

    if (!await argon2.verify(userDetails.secret, password)) {
        let error = new Error('Worng password provided!');
        error.statusCode = 401;
        throw error;
    }
    
    const token = jwt.sign({ userRow: userDetails.id, type: userDetails.role }, process.env.JWT_SECRET, { expiresIn: '50000s' });
    res.status(200).json({
        message: 'Welcome to Task Manager',
        token,
        userDetails: {
            id: userDetails._id,
            firstName: userDetails.name,
            email: userDetails.email,
            role: userDetails.role,
        }
    })
})

const signup = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body
    const hashPassword = await argon2.hash(password, 10);

    const checkUser = await findUserByMail(email);
    if (checkUser && checkUser.length !== 0) {
        let error = new Error('User already exists!');
        error.statusCode = 400;
        throw error;
    }

    const userId = uuidv4();
    const role = 'node';
    const user = await createUser({ userId, name, email, role, password: hashPassword })
    const token = jwt.sign({ userRow: userId, type: role }, process.env.JWT_SECRET, { expiresIn: '50000s' });

    res.status(200).json({
        message: 'Thank you for joining Task Manager',
        token,
        userDetails: {
            id: userId,
            name: user.name,
            email: user.email,
            role: user.role,
        }
    })
})

const userProfile = asyncHandler(async (req, res) => {
    const userId = req.userId;

    const user = await findUserById(userId);
    res.status(200).json({
        message: 'Success',
        userDetails: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        }
    });
})
export { signin, signup, userProfile }