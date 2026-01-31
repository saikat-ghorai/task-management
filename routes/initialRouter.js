import { Router } from "express";

const initialRouter = Router();

initialRouter.all('/', (req, res) => { res.status(200).json({message: 'Welcome to Task Manager'})});

export default initialRouter;