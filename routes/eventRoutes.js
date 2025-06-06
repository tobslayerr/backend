import express from "express";
import { createEvent, deleteEvent, getAllEvents, getMyEvents, updateEvent } from "../controllers/eventController.js";
import userAuth from "../middleware/userAuth.js";
import siCreatorOnly from "../middleware/siCreatorOnly.js";
import upload from "../middleware/upload.js"; 

const eventRoutes = express.Router();

eventRoutes.post( "/create", userAuth, siCreatorOnly, upload.single("banner"),  createEvent);
eventRoutes.get("/showevents", getAllEvents);
eventRoutes.patch("/updateevent/:id", userAuth, upload.single("banner"), updateEvent);
eventRoutes.delete("/deleteevent/:id", userAuth, deleteEvent);
eventRoutes.get("/myevents", userAuth, siCreatorOnly, getMyEvents);

export default eventRoutes;
