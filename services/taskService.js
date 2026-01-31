import asyncHandler from 'express-async-handler';
import taskModel from '../models/taskModel.js';
import userModel from '../models/userModel.js';
import { encodeCursor, decodeCursor } from '../helpers/cursorHelper.js';
import logger from '../config/logger.js';
import { Op } from 'sequelize';

const ALLOWED_TRANSITIONS = {
    pending: ['in_progress'],
    in_progress: ['completed', 'failed']
};

const createTask = asyncHandler(async ({ taskId, taskName, taskDetails, assignedNode, lockedAt }) => {
    if (!taskId || !taskName || !taskDetails || !assignedNode || !lockedAt) {
        let error = new Error('All fields are required')
        error.statusCode = 400
        throw error
    }
    const userDetails = await userModel.findOne({where: { id: assignedNode, active: 1 }});
    if (userDetails, length === 0) {
        let error = new Error('User not found!')
        error.statusCode = 404
        throw error
    }

    const task = await taskModel.create({ id: taskId, task_name: taskName, task_details: taskDetails, assigned_node_id: assignedNode, locked_at: lockedAt });
    logger.info('Creating new task', {
        taskId,
        taskName,
        taskDetails,
        assignedNode,
        lockedAt
    });

    return task;
})

const updateTask = asyncHandler(async ({ taskId, taskName, taskDetails, assignedNode, lockedAt }) => {
    if (!taskId || !taskName || !taskDetails || !assignedNode || !lockedAt) {
        let error = new Error('All fields are required')
        error.statusCode = 400
        throw error
    }

    const details = await taskModel.findOne({ where: { id: taskId, active: 1}})
    if (details.length === 0) {
        let error = new Error('Task not found!')
        error.statusCode = 404
        throw error
    }

    if (details.status !== 'pending') return task;

    const userDetails = await userModel.findOne({where: { id: assignedNode, active: 1 }});
    if (userDetails === 0) {
        let error = new Error('User not found!')
        error.statusCode = 404
        throw error
    }

    details.task_name = taskName;
    details.task_details = taskDetails;
    details.assigned_node_id = assignedNode;
    details.locked_at = lockedAt;
    details.updated_at = new Date();
    await details.save();

    logger.info('Updating task', {
        taskId,
        taskName,
        taskDetails,
        assignedNode,
        lockedAt
    });

    return details;
})

const getTasksForNode = asyncHandler(async (nodeId, limit = 20, cursor = null) => {
    const whereClause = {
        assigned_node_id: nodeId,
        active: 1,
        locked_at: {
            [Op.lt]: new Date()
        }
    };

    if (cursor) {
        const decoded = decodeCursor(cursor);

        whereClause[Op.or] = [
            {
                createdAt: {
                    [Op.lt]: decoded.createdAt
                }
            },
            {
                createdAt: decoded.createdAt,
                locked_at: {
                    [Op.lt]: decoded.locked_at
                }
            },
            {
                createdAt: decoded.createdAt,
                locked_at: decoded.locked_at,
                id: {
                    [Op.lt]: decoded.id
                }
            }
        ];
    }
    const tasks = await taskModel.findAll({
        where: whereClause,
        order: [
            ['createdAt', 'DESC'],
            ['locked_at', 'DESC'],
            ['id', 'DESC']
        ],
        limit: limit + 1
    });

    if (tasks.length === 0) {
        let error = new Error('No task found!');
        error.statusCode = 404;
        throw error;
    }

    let nextCursor = null;

    if (tasks.length > limit) {
        const lastTask = tasks.pop();
        const cursorContent = { createdAt: lastTask.createdAt, locked_at: lastTask.locked_at, id: lastTask.id }
        nextCursor = encodeCursor(cursorContent);
    }

    return {
        data: tasks,
        nextCursor
    };
})

const getTasksByStatus = asyncHandler(async (status = 'all', nodeId = null, limit = 20, cursor = null) => {
    const whereClause = {}
    whereClause.active = 1;
    if (status !== 'all') {
        whereClause.status = status;
    }

    if (nodeId) {
        whereClause.assigned_node_id = nodeId;
    }

    if (cursor) {
        const decoded = decodeCursor(cursor);

        whereClause[Op.or] = [
            {
                createdAt: {
                    [Op.lt]: decoded.createdAt
                }
            },
            {
                createdAt: decoded.createdAt,
                locked_at: {
                    [Op.lt]: decoded.locked_at
                }
            },
            {
                createdAt: decoded.createdAt,
                locked_at: decoded.locked_at,
                id: {
                    [Op.lt]: decoded.id
                }
            }
        ];
    }
    const tasks = await taskModel.findAll({
        where: whereClause,
        order: [
            ['createdAt', 'DESC'],
            ['locked_at', 'DESC'],
            ['id', 'DESC']
        ],
        limit: limit + 1
    });

    if (tasks.length === 0) {
        let error = new Error('No task found!');
        error.statusCode = 404;
        throw error;
    }

    let nextCursor = null;

    if (tasks.length > limit) {
        const lastTask = tasks.pop();
        const cursorContent = { createdAt: lastTask.createdAt, locked_at: lastTask.locked_at, id: lastTask.id }
        nextCursor = encodeCursor(cursorContent);
    }

    return {
        data: tasks,
        nextCursor
    };
})

const getTaskDetails = asyncHandler(async (taskId = null) => {
    if (!taskId) {
        let error = new Error('Task id needed!');
        error.statusCode = 400;
        throw error;
    }
    const taskDetails = await taskModel.findOne({ where: { id: taskId, active: 1}});

    if (taskDetails.length === 0) {
        let error = new Error('No task found!');
        error.statusCode = 404;
        throw error;
    }

    return taskDetails;
})

const updateTaskStatus = asyncHandler(async (taskId, nodeId, newStatus) => {
    const task = await taskModel.findOne({ where: { id: taskId, active: 1}});

    if (task.length === 0) {
        let error = new Error('Task not found!');
        error.statusCode = 404;
        throw error;
    }

    if (task.assigned_node_id !== nodeId) {
        let error = new Error('You don\'t have permission to update the status!');
        error.statusCode = 403;
        throw error;
    }

    if (task.status === newStatus) return task;

    if (task.locked_at && task.locked_at < new Date()) {
        let error = new Error('Task time expired!');
        error.statusCode = 409;
        throw error;
    }

    if (!ALLOWED_TRANSITIONS[task.status]?.includes(newStatus)) {
        let error = new Error('Invalid status transition!');
        error.statusCode = 400;
        throw error;
    }

    task.status = newStatus;
    task.updated_at = new Date();
    await task.save();

    logger.info('Updating task status', {
        taskId,
        from: task.status,
        to: newStatus
    });

    return task;
})

const markExpiredTasksAsFailed = asyncHandler(async () => {
    const now = new Date();

    const [affectedCount] = await taskModel.update(
        {
            status: 'failed',
            updated_at: now
        },
        {
            where: {
                status: {
                    [Op.in]: ['pending', 'in_progress']
                },
                locked_at: {
                    [Op.lt]: now
                },
                active: 1
            }
        }
    );

    logger.info('Expired tasks marked as failed', {
        affectedCount
    });

    return affectedCount;
})

const assignTask = asyncHandler(async (taskId, nodeId) => {
    const task = await taskModel.findOne({ where: { id: taskId, active: 1}});

    if (task.length === 0) {
        let error = new Error('Task not found!');
        error.statusCode = 404;
        throw error;
    }
    const userDetails = await userModel.findOne({where: { id: nodeId, active: 1 }});
    if (userDetails, length === 0) {
        let error = new Error('User not found!')
        error.statusCode = 404
        throw error
    }
    const oldAssignee = task.assigned_node_id;

    task.status = 'pending';
    task.assigned_node_id = nodeId;
    task.updated_at = new Date();
    await task.save();

    logger.info('Assigning task to new node', {
        taskId,
        from: oldAssignee,
        to: nodeId
    });

    return task;
})

const deleteTask = asyncHandler(async (taskId, nodeId) => {
    const task = await taskModel.findOne({ where: { id: taskId, active: 1}});

    if (task.length === 0) {
        let error = new Error('Task not found!');
        error.statusCode = 404;
        throw error;
    }

    task.active = 0;
    task.updated_at = new Date();
    await task.save();

    logger.info('Deleting task', {
        taskId
    });

    return task;
})

export { createTask, updateTask, getTasksForNode, getTasksByStatus, getTaskDetails, updateTaskStatus, markExpiredTasksAsFailed, assignTask, deleteTask }