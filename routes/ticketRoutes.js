import express from "express";
import { createTicket, getAllTickets, getTicketById, updateTicket, deleteTicket} from "../controllers/ticketController.js";
import userAuth from "../middleware/userAuth.js";

const TicketRouter = express.Router();

TicketRouter.post("/Create", userAuth, createTicket);
TicketRouter.get("/ReadAll", userAuth, getAllTickets);
TicketRouter.get("/Read/:id", userAuth, getTicketById);
TicketRouter.put("/Update/:id",userAuth, updateTicket);
TicketRouter.delete("/Delete/:id", userAuth, deleteTicket);

export default TicketRouter;
