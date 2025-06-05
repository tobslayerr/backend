import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import asyncHandler from 'express-async-handler';
import Ticket from '../models/ticketModel.js';

export const getUserData = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified,
        isSiCreator: user.isSiCreator,
        siCreatorRequest: user.siCreatorRequest,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const requestSiCreator = async (req, res) => {
    try {
        const userId = req.user.id; // Pastikan middleware auth sudah dipasang
        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.isSiCreator) {
            return res.status(400).json({ message: "You are already a SiCreator" });
        }

        if (user.siCreatorRequest) {
            return res.status(400).json({ message: "Request already submitted" });
        }

        user.siCreatorRequest = true;
        await user.save();

        res.status(200).json({ message: "Request to become SiCreator submitted" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const approveSiCreator = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.siCreatorRequest) {
            return res.status(400).json({ message: "User has not requested to become SiCreator" });
        }

        user.isSiCreator = true;
        user.siCreatorRequest = false;
        await user.save();

        res.status(200).json({ message: "User approved as SiCreator" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const rejectSiCreator = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.siCreatorRequest) {
            return res.status(400).json({ message: "User has not requested to become SiCreator" });
        }

        user.siCreatorRequest = false;
        await user.save();

        res.status(200).json({ message: "SiCreator request rejected" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const getUserTickets = asyncHandler(async (req, res) => {
    const userId = req.user.id; // ID pengguna dari middleware userAuth

    const tickets = await Ticket.find({ user: userId })
        .populate('event', 'name') // Mengambil nama event dari model Event
        // .populate('payment', 'transaction_status gross_amount') // Opsional: jika butuh detail pembayaran
        .sort({ createdAt: -1 }); // Urutkan berdasarkan waktu pembelian terbaru

    // Jika Anda ingin menampilkan nama jenis tiket (misal "VIP", "Reguler")
    // Anda perlu memastikan Event model Anda memiliki nama untuk setiap eventTicketType
    // dan kemudian mengambilnya di sini.
    // Atau, seperti yang sudah kita masukkan di paymentTicketDetailSchema dan ticketModel,
    // field `ticketTypeName` bisa disimpan langsung di Ticket model saat pembelian.
    // Contoh, jika di Ticket model Anda ada `ticketTypeName`:
    // const ticketsWithTypeName = tickets.map(ticket => ({
    //     ...ticket.toObject(),
    //     ticketTypeName: ticket.eventTicketType.name // Jika eventTicketType dipopulate atau ada field name
    // }));

    res.status(200).json({
        success: true,
        tickets: tickets // Atau ticketsWithTypeName jika Anda memprosesnya
    });
});