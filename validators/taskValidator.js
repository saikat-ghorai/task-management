import { body } from "express-validator";

const createTaskValidator = [
    body('taskName')
        .trim()
        .notEmpty().withMessage('Task name can\'t be empty!'),
    body('taskDetails')
        .trim()
        .notEmpty().withMessage('Task details can\'t be empty!'),
    body('assignedNode')
        .trim()
        .notEmpty().withMessage('Assignee can\'t be empty!'),
    body("lockedAt")
        .trim()
        .notEmpty().withMessage('Task lock time can\'t be empty')
];

const updateTaskValidator = [
    body('taskId')
        .trim()
        .notEmpty().withMessage('Task id can\'t be empty!'),
    body('taskName')
        .trim()
        .notEmpty().withMessage('Task name can\'t be empty!'),
    body('taskDetails')
        .trim()
        .notEmpty().withMessage('Task details can\'t be empty!'),
    body('assignedNode')
        .trim()
        .notEmpty().withMessage('Assignee can\'t be empty!'),
    body("lockedAt")
        .trim()
        .notEmpty().withMessage('Task lock time can\'t be empty')
];

const updateTaskStatusValidator = [
    body('taskId')
        .trim()
        .notEmpty().withMessage('Task id can\'t be empty!'),
    body('taskStatus')
        .trim()
        .notEmpty().withMessage('Task status can\'t be empty!')
];

const assignTaskValidator = [
    body('taskId')
        .trim()
        .notEmpty().withMessage('Task id can\'t be empty!'),
    body('nodeId')
        .trim()
        .notEmpty().withMessage('Task status can\'t be empty!')
];

export { createTaskValidator, updateTaskValidator, updateTaskStatusValidator, assignTaskValidator }