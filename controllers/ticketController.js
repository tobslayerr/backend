import Ticket from "../models/ticketModel.js";
import Event from "../models/EventModel.js";
import User from "../models/userModel.js";

export const createTicket = async (req, res) => {
  try {
    const { eventId, quantity } = req.body;
    const userId = req.user.id;

    // Validasi input
    if (!eventId || !quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: "Input tidak valid" });
    }

    // Cari event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event tidak ditemukan" });
    }
    // Cek stok tiket
    if (event.ticketAvailable <= 0) {
    return res.status(400).json({ 
    success: false, 
    message: "Tiket sudah habis" 
    });
    }

    if (event.ticketAvailable < quantity) {
    return res.status(400).json({ 
    success: false, 
    message: "Jumlah tiket yang tersedia tidak mencukupi" 
    });
   }
   
    if (event.price <= 0) {
      return res.status(400).json({ message: "Event tidak Gratis" });
    }
    // Hitung total harga
    const totalPrice = event.price * quantity;

    // Kurangi jumlah tiket di event
    event.ticketAvailable -= quantity;
    await event.save();

    // Buat tiket baru
    const newTicket = new Ticket({
      event: event.id,
      user: userId,
      quantity,
      eventDate: event.date,
      total: totalPrice,
    });

    await newTicket.save();

    return res.status(201).json({
    success: true,
    message: "Tiket berhasil dibuat.",
    data: newTicket,
    });

    } catch (error) {
    console.error("Error saat membuat tiket:", error.message);
    return res.status(500).json({
    success: false,
    message: "Gagal membuat tiket.",
    error: error.message,
  });
}
};

export const createPaidOnlineTicket = async (req, res) => {
  try {
    const { eventId, quantity } = req.body;
    const userId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event tidak ditemukan" });

    if (event.type !== "online") {
      return res.status(400).json({ message: "Event bukan tipe online" });
    }

    if (event.ticketAvailable < quantity) {
      return res.status(400).json({ message: "Tiket tidak mencukupi" });
    }

    if (event.price <= 0) {
      return res.status(400).json({ message: "Event tidak Gratis" });
    }

    const price = event.price;
    const total = price * quantity;

    const ticket = await Ticket.create({
      event: event._id,
      user: userId,
      quantity,
      eventDate: event.date,
      price,
      total,
      status: "pending", 
    });

    event.ticketAvailable -= quantity;
    await event.save();

    return res.status(201).json({
      success : true,
      message: "Tiket berhasil dibuat. Lanjutkan ke pembayaran.",
      data : ticket,
    });
  } catch (error) {
    console.error("Gagal membuat tiket event online:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const createFreeTicket = async (req, res) => {
  try {
    const { eventId, quantity } = req.body;
    const userId = req.user.id;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Quantity tidak valid" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event tidak ditemukan" });

    if (event.price > 0) {
      return res.status(400).json({ message: "Event ini berbayar" });
    }

    if (event.ticketAvailable < quantity) {
      return res.status(400).json({ message: "Stok tiket tidak mencukupi" });
    }

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

    // Update stok tiket
    event.ticketAvailable -= quantity;
    await event.save();

    return res.status(201).json({
      message: "Tiket gratis berhasil dibuat",
      ticket,
    });
  } catch (error) {
    console.error("Gagal membuat tiket gratis:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAllTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find()
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
    const ticket = await Ticket.findById(id).populate("event", "name");

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch event", error: error.message });
  }
};

export const cancelTicket = async (req, res) => {
  try {
    const { id } = req.params;

    // Cari tiket dengan populate event
    const ticket = await Ticket.findById(id).populate("event");

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Tiket tidak ditemukan" });
    }

    // Hanya bisa di-cancel jika status pending
    if (ticket.status === "paid") {
      return res.status(400).json({ success: false, message: "Tiket sudah dibayar, tidak bisa dibatalkan" });
    }

    if (ticket.status !== "pending") {
      return res.status(400).json({ success: false, message: "Tiket tidak bisa dibatalkan" });
    }

    // Update status tiket
    ticket.status = "cancelled";
    await ticket.save();

    // Tambahkan ulang jumlah tiket ke event
    const event = ticket.event;
    event.ticketAvailable += ticket.quantity;
    await event.save();

    return res.status(200).json({
      success: true,
      message: "Tiket berhasil dibatalkan",
      data: ticket,
    });

  } catch (error) {
    console.error("Error saat membatalkan tiket:", error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal membatalkan tiket",
      error: error.message,
    });
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
    next(err0r);
  }
};