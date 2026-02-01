import { Router } from "express";
import { collectFailedTasks } from "../controllers/cronController.js";

const cronRouter = Router();

cronRouter.get('/collect-failed', collectFailedTasks);

export default cronRouter;