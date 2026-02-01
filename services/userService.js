import asyncHandler from 'express-async-handler';
import userModel from '../models/userModel.js';

const createUser = asyncHandler(async ({ userId, name, email, role, password }) => {
    if (!userId || !name || !email || !role || !password) {
        let error = new Error('All fields are required')
        error.statusCode = 400
        throw error
    }

    const userDetails = await userModel.create({ id: userId, role, name, username: email, secret: password });
    return userDetails;
})

const findUserByMail = asyncHandler(async (email) => {
    if (!email) {
        let error = new Error('All fields are required')
        error.statusCode = 400
        throw error
    }

    const userDetails = await userModel.findOne({ where: { username: email } });
    return userDetails;
})

const findUserById = asyncHandler(async (userId, selectedFields = ['id', 'name', ['username', 'email'], 'role']) => {
    if (!userId) {
        let error = new Error('All fields are required')
        error.statusCode = 400
        throw error
    }

    const userDetails = await userModel.findOne({ 
        where: { id: userId, active: 1 },
        attributes:  selectedFields
    });
    return userDetails;
})

const findActiveUsers = asyncHandler(async () => {
    const usersList = await userModel.findAll({
        where: { active: 1 },
        attributes: [['id', 'nodeId'], 'name', ['username', 'email'], 'role'],
        order: [['name', 'ASC']],
    });
    if (usersList.length === 0) {
        let error = new Error('No user found!');
        error.statusCode = 404;
        throw error;
    }

    return usersList;
})

const updateUserDetails = asyncHandler( async(updates, condition) => {
    if(!updates || !condition){
        let error = new Error('All fields are required')
        error.statusCode = 400
        throw error
    }

    const user = await userModel.update(updates, condition);

    return user;
})

export { createUser, findUserByMail, findUserById, findActiveUsers, updateUserDetails }