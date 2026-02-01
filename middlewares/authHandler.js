import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';

const authHandler = asyncHandler(async(req, res, next) => {
    const authToken = req.headers.authorization ||  req.headers.Authorization;
    if(authToken && authToken.startsWith('Bearer')){
        const token = authToken.split(' ')[1];
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decode.userRow;
        req.userRole = decode.type;
        next();
    }else{        
        let error = new Error("Please provide a valid token");
        error.statusCode = 401;
        throw error;
    }
})

export default authHandler;