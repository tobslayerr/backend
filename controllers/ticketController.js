import Ticket from "../models/ticketModel.js";
import Event from "../models/eventModel.js";

export const createTicket = async (req, res, next) => {
  try {
    const { eventId, quantity, price } = req.body;
    const userId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: "Event not found" 
    });
    }
    
    const total = quantity * price;

if (isNaN(total)) {
  return res.status(400).json({ 
    success: false, 
    message: "Invalid quantity or price" 
  });
}

    const ticket = new Ticket({
      event: event._id,
      user: userId,
      eventDate: event.date, 
      price,
      quantity,
      total
    });

    await ticket.save();

    res.status(201).json({
      success: true,
      message: "Ticket created",
      ticket
    });
  } catch (error) {
    next(error);
  }
};

export const getAllTickets = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tickets = await Ticket.find({ user: userId })
      .populate("event", "name date location")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, tickets });
  } catch (error) {
    next(error);
  }
};

export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id).populate("event", "name date location");

    if (!ticket || ticket.user.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    next (error);
  }
};

export const updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity, price } = req.body;

    const ticket = await Ticket.findById(id).populate("event");

    console.log('TICKET:', ticket);
    console.log('REQUEST USER ID:', req.user.id);

    if (!ticket || !ticket.user.equals(req.user.id)) {
     return res.status(404).json({ success: false, message: "Ticket not found" });
}
    if (ticket.status !== "pending") {
      return res.status(400).json({ success: false, message: "Cannot update a paid ticket" });
    }

    ticket.price = price;
    ticket.quantity = quantity;
    ticket.total = quantity * price;

    await ticket.save();

    res.status(200).json({ 
        success: true, 
        ticket 
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTicket = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id);
    if (!ticket || ticket.user.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    if (ticket.status !== "pending") {
      return res.status(400).json({ success: false, message: "Cannot delete a paid or cancelled ticket" });
    }

    await Ticket.findByIdAndDelete(id);

    res.status(200).json({ 
        success: true, 
        message: "Ticket deleted" 
    });
  } catch (error) {
    next(error);
  }
};