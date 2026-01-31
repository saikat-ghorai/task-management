import { body } from "express-validator";

const loginValidator = [
    body('username')
    .trim()
    .notEmpty().withMessage('Username shouldn\'t be empty')
    .isEmail().withMessage('Please provide a valid email'),
    body('password')
    .trim()
    .notEmpty().withMessage('Password shouldn\'t be empty')
    .isLength({ min: 8 }).withMessage('Password should be atleast 8 character lenght')
];

export { loginValidator }