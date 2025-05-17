import express from "express";
import { createEvent, getAllEvents } from "../controllers/eventController.js";
import userAuth from "../middleware/userAuth.js";
import siCreatorOnly from "../middleware/siCreatorOnly.js";

const eventRoutes = express.Router();

// Route untuk membuat event (hanya untuk SiCreator)
eventRoutes.post(
  "/create",
  userAuth,
  siCreatorOnly,
  createEvent
);

// Route untuk mengambil semua event
eventRoutes.get("/showevents", getAllEvents);

export default eventRoutes;
