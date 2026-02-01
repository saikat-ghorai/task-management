import { Router } from "express";
import { loginValidator, signUpValidator, updateProfileValidator, changePasswordValidator } from "../validators/authValidator.js";
import runValidation from "../validators/index.js";
import { signin, signup, userProfile, getUserList, editProfile, changePassword } from "../controllers/authController.js";
import authHandler from "../middlewares/authHandler.js";

const authRouter = Router();

authRouter.post('/login', loginValidator, runValidation, signin);
authRouter.post('/signup', authHandler, signUpValidator, runValidation, signup);
authRouter.get('/profile', authHandler, userProfile);
authRouter.get('/users', authHandler, getUserList);
authRouter.put('/edit-profile', authHandler, updateProfileValidator, runValidation, editProfile);
authRouter.put('/update-password', authHandler, changePasswordValidator, runValidation, changePassword);

export default authRouter;