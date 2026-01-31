import asyncHandler from 'express-async-handler';
import userModel from '../models/userModel.js';

const createUser = asyncHandler( async({firstName, middleName, lastName, email, bio, profileImgae, role, password}) => {
    if(!firstName || !lastName || !email || !password){
        let error = new Error('All fields are required')
        error.statusCode = 400
        throw error
    }

    const userDetails = await userModel.create({firstName, middleName, lastName, email, bio, profileImgae, role, password});
    return userDetails;
})

export { createUser }