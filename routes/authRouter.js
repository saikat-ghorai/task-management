import { Router } from "express";
import { loginValidator, signUpValidator } from "../validators/authValidator.js";
import runValidation from "../validators/index.js";
import { signin, signup, userProfile, getUserList } from "../controllers/authController.js";
import authHandler from "../middlewares/authHandler.js";

const authRouter = Router();

authRouter.post('/login', loginValidator, runValidation, signin);
authRouter.post('/signup', authHandler, signUpValidator, runValidation, signup);
authRouter.get('/profile', authHandler, userProfile);
authRouter.get('/users', authHandler, getUserList);

export default authRouter;