import { validationResult } from "express-validator";

const runValidation = (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({
            title: 'Validation Failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            })),
            stackTrace: process.env.NODE_ENV === 'development' ? new Error().stack : ''
        })
    }
    next();
}

export default runValidation;