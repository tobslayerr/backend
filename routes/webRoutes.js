// routes/webRoutes.js
import express from "express";
import { getBanners, uploadBanner } from "../controllers/webController.js";

const webRouter = express.Router();

webRouter.post("/banner/upload", uploadBanner);
webRouter.get("/banner", getBanners)

export default webRouter;
