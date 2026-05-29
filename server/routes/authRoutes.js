import express from 'express'
import auth from '../middleware/auth.js'
import { getUser, login, register } from '../controllers/authController.js';


const authRouter = express.Router();

authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.get('/user',auth,getUser);

export default authRouter;