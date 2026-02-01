import asyncHandler from 'express-async-handler';
import { v4 as uuidv4 } from 'uuid';
import * as argon2 from 'argon2';
import jwt from "jsonwebtoken";
import { createUser, findUserByMail, findUserById, findActiveUsers } from '../services/userService.js';
import { getTasksByStatus } from '../services/taskService.js';
import logger from '../config/logger.js';

// @desc    Log in to user account
// @route   POST/api/auth/login
// @access  Private(Admin)
// @params  email*, password*
const signin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const userDetails = await findUserByMail(username);
    if (!userDetails) {
        const error = new Error('Wrong username provided!');
        error.statusCode = 401;
        throw error;
    }

    if(userDetails.active != 1){
        const error = new Error('Access denied. Please contact admin!');
        error.statusCode = 403;
        throw error;
    }

    if (!await argon2.verify(userDetails.secret, password)) {
        logger.info('Failed login attempt', {
            user: userDetails.email
        });
        let error = new Error('Worng password provided!');
        error.statusCode = 401;
        throw error;
    }

    const token = jwt.sign({ userRow: userDetails.id, type: userDetails.role }, process.env.JWT_SECRET, { expiresIn: '50000s' });
    logger.info('Login success', {
        user: userDetails.email
    });
    res.status(200).json({
        message: 'Welcome to Task Manager',
        token,
        userDetails: {
            id: userDetails.id,
            name: userDetails.name,
            email: userDetails.email,
            role: userDetails.role,
        }
    })
})

// @desc    Create a new user
// @route   POST/api/auth/signup
// @access  Private(Admin)
// @params  name*, email*, password*
const signup = asyncHandler(async (req, res) => {
    const userRole = req.userRole;
    if(userRole !== 'admin'){
        let error = new Error('You don\'t have permission!');
        error.statusCode = 403;
        throw error;
    }
    const { name, email, password } = req.body
    const hashPassword = await argon2.hash(password, 10);

    const checkUser = await findUserByMail(email);
    if (checkUser && checkUser.length !== 0) {
        let error = new Error('User already exists!');
        error.statusCode = 409;
        throw error;
    }

    const userId = uuidv4();
    const role = 'node';
    const user = await createUser({ userId, name, email, role, password: hashPassword })
    
    logger.info('New account created', {email, name});

    res.status(200).json({
        message: 'Thank you for joining Task Manager',
        userDetails: {
            id: userId,
            name: user.name,
            email: user.email,
            role: user.role,
        }
    })
})

// @desc    Fetch user profile data and assigned tasks
// @route   GET/api/auth/profile
// @access  Private(Admin/Node)
const userProfile = asyncHandler(async (req, res) => {
    const userId = req.userId;

    const user = await findUserById(userId);
    const tasks = await getTasksByStatus('all', userId, null, null, true);
    res.status(200).json({
        message: 'Success',
        userDetails: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        tasks: tasks.data
    });
})

// @desc    Fetch all the active users list
// @route   GET/api/auth/users/
// @access  Private(Admin)
const getUserList = asyncHandler(async(req, res) => {
    const userRole = req.userRole;
    if(userRole !== 'admin'){
        let error = new Error('You don\'t have permission!');
        error.statusCode = 403;
        throw error;
    }
    const users = await findActiveUsers();
    res.status(200).json({
        message: 'Success',
        usersList: users
    });
})
export { signin, signup, userProfile, getUserList }