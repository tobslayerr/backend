<<<<<<< HEAD
import express from 'express';
import { createRating, getRatingsForEvent, getUserRatingForEvent, getRatingById, getAverageRatingForEvent, updateRating, deleteRating} from '../controllers/ratingController.js';
import userAuth from '../middleware/userAuth.js';

const RatingRouter = express.Router();

RatingRouter.post('/create/:eventId', userAuth, createRating); 
RatingRouter.get('/readall/:eventId', getRatingsForEvent); 
RatingRouter.get('/readaverage/:eventId', userAuth, getAverageRatingForEvent); 
RatingRouter.get('/readone/user/:userId/event/:eventId', userAuth, getUserRatingForEvent); 
RatingRouter.get('/readbyidrate/:ratingId', userAuth, getRatingById); 
RatingRouter.patch('/update/:id', userAuth, updateRating); 
RatingRouter.delete('/delete/:id', userAuth, deleteRating); 

export default RatingRouter;
=======
import express from 'express';
import { createRating, getRatingsForEvent, getUserRatingForEvent, getRatingById, updateRating, deleteRating, getAverageRatingForEvent} from '../controllers/ratingController.js';
import userAuth from '../middleware/userAuth.js';

const RatingRouter = express.Router();

RatingRouter.post('/create/:eventId', userAuth, createRating); 
RatingRouter.get('/readall/:eventId', getRatingsForEvent); 
RatingRouter.get('/readone/user/:userId/event/:eventId', userAuth, getUserRatingForEvent); 
RatingRouter.get('/readbyidrate/:ratingId', userAuth, getRatingById); 
RatingRouter.patch('/update/:id', userAuth, updateRating); 
RatingRouter.delete('/delete/:id', userAuth, deleteRating); 
RatingRouter.get('/readaverage/:eventId', getAverageRatingForEvent);

export default RatingRouter;

>>>>>>> a86b8eb9da78aed4e980998d93a6e82ea1589e1a
