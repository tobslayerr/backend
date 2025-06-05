import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { approveSiCreator, getUserData, rejectSiCreator, requestSiCreator, getUserTickets } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/data', userAuth, getUserData);
userRouter.post('/requestsicreator', userAuth, requestSiCreator)
userRouter.put('/approvesicreator/:userId', approveSiCreator)
userRouter.put('/rejectsicreator/:userId', rejectSiCreator)
userRouter.get('/tickets', userAuth, getUserTickets);

export default userRouter;
