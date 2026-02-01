import { validationResult } from "express-validator";

const runValidation = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const uniqueErrors = Object.values(
            errors.array().reduce((acc, err) => {
                if (!acc[err.path]) acc[err.path] = err;
                return acc;
            }, {})
        );

        return res.status(422).json({
            title: 'Validation Failed',
            errors: uniqueErrors.map(err => ({
                field: err.path,
                message: err.msg
            })),
            stackTrace: process.env.NODE_ENV === 'development' ? new Error().stack : ''
        })
    }
    next();
}

export default runValidation;