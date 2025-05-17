import express from "express";
import { getSiCreatorRequests, acceptSiCreatorRequest } from "../controllers/adminController.js";

const router = express.Router();

router.get("/sicreator/requests",  getSiCreatorRequests);
router.post("/sicreator/accept/:userId",  acceptSiCreatorRequest);

export default router;
