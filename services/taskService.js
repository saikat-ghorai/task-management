import asyncHandler from 'express-async-handler';
import taskModel from '../models/taskModel.js';
import userModel from '../models/userModel.js';
import { encodeCursor, decodeCursor } from '../helpers/cursorHelper.js';
import { createTaskHistory, createBulkTaskHistory } from './taskHistoryService.js';
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
    const userDetails = await userModel.findOne({ where: { id: assignedNode, active: 1 } });
    if (!userDetails) {
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

    await createTaskHistory({
        taskId: taskId,
        actionType: 'initial_assign',
        toValue: assignedNode,
        performedBy: 'admin'
    });

    return task;
})

const updateTask = asyncHandler(async ({ taskId, taskName, taskDetails, assignedNode, lockedAt }) => {
    if (!taskId || !taskName || !taskDetails || !assignedNode || !lockedAt) {
        let error = new Error('All fields are required')
        error.statusCode = 400
        throw error
    }

    const details = await taskModel.findOne({ where: { id: taskId, active: 1 } })
    if (!details) {
        let error = new Error('Task not found!')
        error.statusCode = 404
        throw error
    }

    if (details.status !== 'pending') return details;

    const userDetails = await userModel.findOne({ where: { id: assignedNode, active: 1 } });
    if (!userDetails) {
        let error = new Error('User not found!')
        error.statusCode = 404
        throw error
    }

    if (details.assigned_node_id != assignedNode) {
        await createTaskHistory({
            taskId: taskId,
            actionType: 'assignee_change',
            fromValue: details.assigned_node_id,
            toValue: assignedNode,
            performedBy: 'admin'
        });
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

const getTasksByStatus = asyncHandler(async (status = 'all', nodeId = null, limit = null, cursor = null, returnBlank = false) => {
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
        console.log(decoded);
        whereClause[Op.or] = [
            {
                createdAt: {
                    [Op.lte]: decoded.createdAt
                }
            },
            {
                createdAt: decoded.createdAt,
                locked_at: {
                    [Op.lte]: decoded.locked_at
                }
            }
        ];
    }

    const queryOptions = {
        where: whereClause,
        order: [
            ['createdAt', 'DESC'],
            ['locked_at', 'DESC'],
        ],
        attributes: {
            exclude: ['updatedAt']
        }
    };

    if (limit) {
        queryOptions.limit = limit + 1;
    }
    console.log(limit);
    const tasks = await taskModel.findAll(queryOptions);

    if (tasks.length === 0) {
        if (returnBlank) return [];
        let error = new Error('No task found!');
        error.statusCode = 404;
        throw error;
    }

    let nextCursor = null;

    if (limit != null && tasks.length > limit) {
        const lastTask = tasks.pop();
        const cursorContent = { createdAt: lastTask.createdAt, locked_at: lastTask.locked_at }
        nextCursor = encodeCursor(cursorContent);
    }

    return {
        data: tasks,
        nextCursor
    };
})

const getTaskDetails = asyncHandler(async (taskId = null, userId = null) => {
    if (!taskId) {
        let error = new Error('Task id needed!');
        error.statusCode = 400;
        throw error;
    }
    const taskDetails = await taskModel.findOne({ where: { id: taskId, active: 1 } });

    if (!taskDetails) {
        let error = new Error('No task found!');
        error.statusCode = 404;
        throw error;
    }

    if (userId != null && userId != taskDetails.assigned_node_id) {
        let error = new Error('You don\'t have permission!');
        error.statusCode = 403;
        throw error;
    }

    return taskDetails;
})

const updateTaskStatus = asyncHandler(async (taskId, nodeId, newStatus) => {
    const task = await taskModel.findOne({ where: { id: taskId, active: 1 } });

    if (!task) {
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

    if (!ALLOWED_TRANSITIONS[task.status]?.includes(newStatus)) {
        let error = new Error('Invalid status transition!');
        error.statusCode = 400;
        throw error;
    }

    if (task.locked_at && task.locked_at < new Date()) {
        let error = new Error('Task time expired!');
        error.statusCode = 409;
        throw error;
    }

    await createTaskHistory({
        taskId: task.id,
        actionType: 'status_change',
        fromValue: task.status,
        toValue: newStatus,
        performedBy: nodeId
    });

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
    const expiredTasks = await taskModel.findAll({
        where: {
            status: {
                [Op.in]: ['pending', 'in_progress']
            },
            locked_at: {
                [Op.lt]: now
            },
            active: 1
        }
    });

    if (expiredTasks.length === 0) return [];
    const taskIds = expiredTasks.map(task => task.id);

    const [affectedCount] = await taskModel.update(
        {
            status: 'failed',
            updated_at: now
        },
        {
            where: {
                id: {
                    [Op.in]: taskIds
                }
            }
        }
    );

    const historyRecords = expiredTasks.map(task => ({
        id: uuidv4(),
        task_id: task.id,
        action_type: 'status_change',
        from_value: task.status,
        to_value: 'failed',
        performed_by: 'system',
        createdAt: now
    }));

    await createBulkTaskHistory(historyRecords);

    logger.info('Expired tasks marked as failed', {
        affectedCount
    });

    return affectedCount;
})

const assignTask = asyncHandler(async (taskId, nodeId) => {
    const task = await taskModel.findOne({ where: { id: taskId, active: 1 } });

    if (!task) {
        let error = new Error('Task not found!');
        error.statusCode = 404;
        throw error;
    }
    const userDetails = await userModel.findOne({ where: { id: nodeId, active: 1 } });
    if (!userDetails) {
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

    await createTaskHistory({
        taskId: taskId,
        actionType: 'assignee_change',
        fromValue: oldAssignee,
        toValue: nodeId,
        performedBy: 'admin'
    });

    return task;
})

const deleteTask = asyncHandler(async (taskId, nodeId) => {
    const task = await taskModel.findOne({ where: { id: taskId, active: 1 } });

    if (!task) {
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

export { createTask, updateTask, getTasksByStatus, getTaskDetails, updateTaskStatus, markExpiredTasksAsFailed, assignTask, deleteTask }