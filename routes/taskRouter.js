import { Router } from "express";
import { createTaskValidator, updateTaskValidator, updateTaskStatusValidator, assignTaskValidator } from "../validators/taskValidator.js";
import runValidation from "../validators/index.js";
import authHandler from "../middlewares/authHandler.js";
import { getAllTasks, getNodeTasks, filterTasksByStatus, getTaskDetail, updateStatus, newTask, editTask, assignTaskToNode, binTask } from '../controllers/taskController.js';

const taskRouter = Router();

taskRouter.get('/', authHandler, getNodeTasks);
taskRouter.get('/all', authHandler, getAllTasks);
taskRouter.get('/filter/:taskStatus', authHandler, filterTasksByStatus);
taskRouter.get('/:taskId', authHandler, getTaskDetail);
taskRouter.post('/', authHandler, createTaskValidator, runValidation, newTask);
taskRouter.put('/', authHandler, updateTaskValidator, runValidation, editTask);
taskRouter.put('/shift-status', authHandler, updateTaskStatusValidator, runValidation, updateStatus);
taskRouter.put('/assign', authHandler, assignTaskValidator, runValidation, assignTaskToNode);
taskRouter.delete('/:taskId', authHandler, binTask);

export default taskRouter;