import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

const routerAPI = Router();

routerAPI.post('/login', authController.login);
routerAPI.post('/register', authController.register);
routerAPI.post('/logout', authController.logout);
routerAPI.post('/google-login', authController.googleLogin);

export default routerAPI;
