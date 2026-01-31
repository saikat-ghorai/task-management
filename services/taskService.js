import asyncHandler from 'express-async-handler';
import blogModel from '../models/blogModel.js';
import userModel from '../models/userModel.js';

const createBlog = asyncHandler(async({ title, description, bodyContent, blogImage, imageTag, blogTag, blogCategory, createdBy, isPublic }) => {
    // console.log(title, description, bodyContent, blogImage, imageTag, blogTag, blogCategory, createdBy, isPublic);
    if(!title || !description || !bodyContent || !blogImage || !blogTag || !blogCategory || !createdBy){
        let error = new Error('All fields are required');
        error.statusCode = 422;
        throw error;
    }

    const userDetails = await userModel.findOne({_id: createdBy});
    if(!userDetails){
        let error = new Error('Please try again!');
        error.statusCode = 402;
        throw error;
    }
    const writerName = userDetails.middleName == ''? userDetails.firstName + ' ' + userDetails.lastName : userDetails.firstName + ' ' + userDetails.middleName + ' ' + userDetails.lastName;

    const blogDetails = await blogModel.create({ title, description, bodyContent, blogImage, imageTag, blogTag, blogCategory, createdBy, writerName, isPublic });
    if(!blogDetails){
        let error = new Error('Please try again!');
        error.statusCode = 500;
        throw error;
    }
    return blogDetails;
})

const updateBlog = asyncHandler(async(condition, updateData) => {
    if(!condition || !updateData || condition.length === 0 || updateData.length === 0){
        let error = new Error('Please try again!');
        error.statusCode = 402;
        throw error;
    }

    const blogDetails = await blogModel.updateOne(condition, updateData);
    if(!blogDetails || blogDetails.length === 0){
        let error = new Error('Please try again!');
        error.statusCode = 500;
        throw error;
    }
    return true;
})

export { createBlog, updateBlog }