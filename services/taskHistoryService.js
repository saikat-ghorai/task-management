import asyncHandler from 'express-async-handler';
import { v4 as uuidv4 } from 'uuid';
import taskHistoryModel from '../models/taskHistoryModel.js';

const createTaskHistory = asyncHandler(async ({ taskId, actionType, fromValue = null, toValue = null, performedBy }) => {
    await taskHistoryModel.create({
        id: uuidv4(),
        task_id: taskId,
        action_type: actionType,
        from_value: fromValue,
        to_value: toValue,
        performed_by: performedBy
    });

    return 1;
});

const createBulkTaskHistory = asyncHandler(async (historyRecords) => {
    await taskHistoryModel.bulkCreate(historyRecords);

    return 1;
});

const getTaskHistoryByTaskId = asyncHandler( async(taskId) => {
    const history = await taskHistoryModel.findAll({
        where: {
            task_id: taskId
        },
        order: [
            ['createdAt', 'DESC']
        ]
    });

    if (history.length === 0) {
        let error = new Error('No history found!');
        error.statusCode = 404;
        throw error;
    }

    return history;
});

export { createTaskHistory, createBulkTaskHistory, getTaskHistoryByTaskId };
