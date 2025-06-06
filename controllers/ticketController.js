import Ticket from "../models/ticketModel.js";
import Event from "../models/eventModel.js";
import userModel from "../models/userModel.js";

export const createTicket = async (req, res, next) => {
  try {
    const { eventId, quantity } = req.body;
    const userId = req.user.id;

    // Cari event berdasarkan ID
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: "Event not found" 
      });
    }

    // Ambil harga dari event
    const { price } = event;

     if (event.price && event.price <= 0) {
      return res.status(400).json({ message: "Event ini tidak gratis" });
    }

    // Hitung total harga berdasarkan harga event dan jumlah tiket
    const total = quantity * price;

    // Validasi total harga
    if (isNaN(total) || total <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid quantity or price" 
      });
    }

    // Pastikan tiket tersedia cukup
    if (event.ticketAvailable < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: "Not enough tickets available" 
      });
    }

    // Kurangi jumlah tiket yang tersedia
    event.ticketAvailable -= quantity;
    await event.save();

    // Buat tiket baru
    const ticket = new Ticket({
      event: event._id,
      user: userId,
      eventDate: event.date, 
      price: event.price, 
      quantity,
      total 
    });

    await ticket.save();

    // Kirim respons sukses
    res.status(201).json({
      success: true,
      message: "Ticket created",
      ticket
    });
  } catch (error) {
    next(error);
  }
};

export const createFreeTicket = async (req, res) => {
  try {
    const { eventId, quantity } = req.body;
    const userId = req.user.id;

    // Ambil data user
    const userDoc = await userModel.findById(userId); // Gunakan userModel
    if (!userDoc) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Ambil data event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event tidak ditemukan" });
    }

    // Cek apakah event gratis
    if (event.price && event.price > 0) {
      return res.status(400).json({ message: "Event ini berbayar" });
    }

    // Buat tiket
    const ticket = await Ticket.create({
      event: eventId,
      user: userId,
      quantity,
      eventDate: event.date,
      price: 0,
      total: 0,
      status: "paid",
      paymentId: null,
    });

    // Kurangi stok tiket
    event.ticketAvailable -= quantity;
    await event.save();

    return res.status(201).json({ message: "Tiket gratis berhasil dibuat", ticket });
  } catch (error) {
    console.error("Gagal membuat tiket gratis:", error);
    return res.status(500).json({ message: "Server error" });
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

export const cancelTicket = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Cari tiket berdasarkan ID dan populate event terkait
    const ticket = await Ticket.findById(id).populate("event");

    console.log('TICKET:', ticket);
    console.log('REQUEST USER ID:', req.user.id);

    // Periksa apakah tiket ditemukan dan dimiliki oleh pengguna saat ini
    if (!ticket || !ticket.user.equals(req.user.id)) {
      return res.status(404).json({ success: false, message: "Ticket not found or unauthorized" });
    }

    // Periksa status tiket
    if (ticket.status === "paid") {
      return res.status(400).json({ success: false, message: "Cannot cancel a paid ticket" });
    }

    // Jika status tiket masih "pending", batalkan tiket
    if (ticket.status === "pending") {
      // Kembalikan jumlah tiket yang tersedia di event
      const event = ticket.event;
      if (event) {
        event.ticketAvailable += ticket.quantity;
        await event.save();
      }

      // Ubah status tiket menjadi "cancelled"
      ticket.status = "cancelled";
      await ticket.save();

      return res.status(200).json({
        success: true,
        message: "Ticket successfully cancelled",
        ticket,
      });
    }

    // Jika status tiket tidak valid
    return res.status(400).json({ success: false, message: "Invalid ticket status" });
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
