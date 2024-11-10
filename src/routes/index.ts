import { Router } from 'express';
import authRoute from './auth.route';
import friendRoute from './friend.route';
import likeRoute from './like.route';
import commentRoute from './comment.route';
import postRoute from './post.route';
import userRoute from './user.route';
import chatRoute from './chat.route';

const routerAPI: Router = Router();

routerAPI.use('/auth', authRoute);
routerAPI.use('/friend', friendRoute);
routerAPI.use('/posts', likeRoute);
routerAPI.use('/posts', commentRoute);
routerAPI.use('/', postRoute);
routerAPI.use('/', userRoute);
routerAPI.use('/chat', chatRoute);

export default routerAPI;
