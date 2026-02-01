import asyncHandler from 'express-async-handler';
import { v4 as uuidv4 } from 'uuid';
import { createTask, updateTask, getTasksByStatus, getTaskDetails, updateTaskStatus, assignTask, deleteTask } from '../services/taskService.js';

// @desc    Get all tasks with pagination
// @route   GET/api/tasks/all
// @access  Privte(Admin)
// @params  cursor, limit
const getAllTasks = asyncHandler(async (req, res) => {
    const { cursor, limit } = req.query;
    let dataCount = parseInt(limit) || 10;

    const {data, nextCursor} = await getTasksByStatus('all', null, dataCount, cursor);

    return res.status(200).json({
        success: 'Success',
        tasks: data,
        nextCursor,
    });
})

// @desc    Get tasks by node with pagination
// @route   GET/api/tasks/
// @access  Privte(Node)
// @params  cursor, limit
const getNodeTasks = asyncHandler(async (req, res) => {
    const { cursor, limit } = req.query;
    const userId = req.userId;
    const dataCount = parseInt(limit) || 10;

    const {data, nextCursor} = await getTasksByStatus('all', userId, dataCount, cursor);
    res.status(200).json({
        message: 'Success',
        tasks: data,
        nextCursor,
    })
})

// @desc    Get list of tasks by status with pagination
// @route   GET/api/tasks/filter/:taskStatus
// @access  Privte(Admin/Node)
// @params  cursor, limit
const filterTasksByStatus = asyncHandler(async (req, res) => {
    const taskStatus = req.params.taskStatus;
    const userId = req.userRole === 'admin'? null : req.userId;
    const { cursor, limit } = req.query;
    const dataCount = parseInt(limit) || 10;

    const {data, nextCursor} = await getTasksByStatus(taskStatus, userId, dataCount, cursor);
    res.status(200).json({
        message: 'Sucess',
        tasks: data,
        nextCursor
    })
})

// @desc    Get details of a task
// @route   GET/api/tasks/:taskId
// @access  Privte(Admin/Node)
const getTaskDetail = asyncHandler(async (req, res) => {
    const taskId = req.params.taskId;
    const userId = req.userRole === 'admin'? null : req.userId;
    const taskDetails = await getTaskDetails(taskId, userId);

    res.status(200).json({
        message: 'Sucess',
        details: taskDetails
    })
})

// @desc    update task status
// @route   PUT/api/tasks/shift-status
// @access  Private(Admin/Node)
// @param   taskId*, taskStatus*
const updateStatus = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { taskId, taskStatus } = req.body;

    const task = await updateTaskStatus(taskId, userId, taskStatus);
    res.status(200).json({
        message: 'Success',
        task,
    })
})

// @desc    Create a new task
// @route   POST/api/tasks/
// @access  Private(Admin)
// @param   taskName*, taskDetails*, assignedNode*, lockedAt*
const newTask = asyncHandler(async (req, res) => {
    const { taskName, taskDetails, assignedNode, lockedAt } = req.body;
    const userRole = req.userRole;
    if(userRole !== 'admin'){
        let error = new Error('You don\'t have permission!');
        error.statusCode = 403;
        throw error;
    }
    const taskId = uuidv4();

    const task = await createTask({ taskId, taskName, taskDetails, assignedNode, lockedAt });

    res.status(200).json({
        title: 'Success',
        message: 'Task created!',
        task
    })
})

// @desc    Edit a task
// @route   PUT/api/tasks/
// @access  Private(Admin)
// @param   taskId*, taskName*, taskDetails*, assignedNode*, lockedAt*
const editTask = asyncHandler(async (req, res) => {
    const { taskId, taskName, taskDetails, assignedNode, lockedAt } = req.body;
    const userRole = req.userRole;
    if(userRole !== 'admin'){
        let error = new Error('You don\'t have permission!');
        error.statusCode = 403;
        throw error;
    }

    const task = await updateTask({ taskId, taskName, taskDetails, assignedNode, lockedAt });
    res.status(200).json({
        title: 'Success',
        message: 'Task updated!',
        task
    })
})

// @desc    Assign a task to new node
// @route   PUT/api/tasks/assign
// @access  Private(Admin)
// @param   taskId*, nodeId*
const assignTaskToNode = asyncHandler(async (req, res) => {
    const { taskId, nodeId } = req.body;
    const userRole = req.userRole;
    if(userRole !== 'admin'){
        let error = new Error('You don\'t have permission!');
        error.statusCode = 403;
        throw error;
    }

    const task = await assignTask(taskId, nodeId);
    res.status(200).json({
        title: 'Success',
        message: 'Task assigned successfully!',
    })
})

// @desc    Delete a task
// @route   DELETE/api/tasks/:taskId
// @access  Private(Admin)
const binTask = asyncHandler(async (req, res) => {
    const taskId = req.params.taskId;
    const userRole = req.userRole;
    if(userRole !== 'admin'){
        let error = new Error('You don\'t have permission!');
        error.statusCode = 403;
        throw error;
    }

    const task = await deleteTask(taskId);
    res.status(200).json({
        title: 'Success',
        message: 'Task deleted successfully!',
    })
})

export { getAllTasks, getNodeTasks, filterTasksByStatus, getTaskDetail, updateStatus, newTask, editTask, assignTaskToNode, binTask }