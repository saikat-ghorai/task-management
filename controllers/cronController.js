import asyncHandler from 'express-async-handler';
import { markExpiredTasksAsFailed } from '../services/taskService.js';

// @desc    Collect all the overdue tasks and mark them failed
// @route   GET/api/cron/collect-failed
// @access  Public
const collectFailedTasks = asyncHandler(async (req, res) => {
    const response = await markExpiredTasksAsFailed();
    return res.status(200).json({
        success: 'Success',
        message: 'Failed tasks collection done'
    });
})

export { collectFailedTasks }