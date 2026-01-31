import { Router } from "express";
import { loginValidator, signUpValidator } from "../validators/authValidator.js";
import runValidation from "../validators/index.js";
import { signin, signup, userProfile } from "../controllers/authController.js";
import authHandler from "../middlewares/authHandler.js";

const authRouter = Router();

authRouter.post('/login', loginValidator, runValidation, signin);
authRouter.post('/signup', signUpValidator, runValidation, signup);
authRouter.get('/profile/', authHandler, userProfile);

export default authRouter;