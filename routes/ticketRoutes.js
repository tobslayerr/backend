import express from "express";
import { createTicket, getAllTickets, getTicketById, cancelTicket, createFreeTicket,createPaidOnlineTicket,deleteTicket} from "../controllers/ticketController.js";
import userAuth from "../middleware/userAuth.js";

const TicketRouter = express.Router();

TicketRouter.post("/Create", userAuth, createTicket);
TicketRouter.post("/Createfree", userAuth, createFreeTicket);
TicketRouter.post("/Createonline", userAuth, createPaidOnlineTicket);
TicketRouter.get("/ReadAll", getAllTickets);
TicketRouter.get("/Read/:id", userAuth, getTicketById);
TicketRouter.put("/Update/:id",userAuth, cancelTicket);
TicketRouter.delete("/Delete/:id", userAuth, deleteTicket);

export default TicketRouter;
