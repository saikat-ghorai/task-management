import asyncHandler from 'express-async-handler';
import { Task } from '../models/taskModel.js';
import { User } from '../models/userModel.js';

const ALLOWED_TRANSITIONS = {
    pending: ['in_progress'],
    in_progress: ['completed', 'failed']
};

const getTasksForNode = asyncHandler(async (nodeId) => {
    logger.info('Fetching tasks', { nodeId });
    const tasks = await Task.findAll({ where: { assigned_node_id: nodeId } });

    if (!tasks) {
        let error = new Error('No task found!');
        error.statusCode = 404;
        throw error;
    }

    return tasks;
});

const updateTaskStatus = asyncHandler(async (taskId, nodeId, newStatus) => {
    const task = await Task.findByPk(taskId);

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

    task.status = newStatus;
    await task.save();

    logger.info('Updating task status', {
        taskId,
        from: task.status,
        to: newStatus
    });

    return task;
});

export { getTasksForNode, updateTaskStatus }