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

const signUpValidator = [
    body('name')
    .trim()
    .notEmpty().withMessage('Firstname shouldn\'t be empty'),
    body('email')
    .trim()
    .notEmpty().withMessage('Email shouldn\'t be empty')
    .isEmail().withMessage('Please provide a valid email'),
    body('password')
    .trim()
    .notEmpty().withMessage('Password shouldn\'t be empty')
    .isLength({ min: 8 }).withMessage('Password should be atleast 8 character lenght')
]

const updateProfileValidator = [
    body('name')
    .trim()
    .notEmpty().withMessage('Firstname shouldn\'t be empty'),
    body('email')
    .trim()
    .notEmpty().withMessage('Email shouldn\'t be empty')
    .isEmail().withMessage('Please provide a valid email')
]

const changePasswordValidator = [
    body('oldPassword')
    .trim()
    .notEmpty().withMessage('Password shouldn\'t be empty')
    .isLength({ min: 8 }).withMessage('Password should be atleast 8 character lenght'),
    body('newPassword')
    .trim()
    .notEmpty().withMessage('Password shouldn\'t be empty')
    .isLength({ min: 8 }).withMessage('Password should be atleast 8 character lenght')
]

export { loginValidator, signUpValidator, updateProfileValidator, changePasswordValidator }