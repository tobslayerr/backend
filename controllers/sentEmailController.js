import Ticket from "../models/ticketModel.js";
import { generateTicketPdf } from '../utils/generateTicketPdf.js';
import transporter from "../config/nodemailer.js"
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { generateLinkPdf } from "../utils/generateLinkpdf.js";

const User = mongoose.model('User');

// Untuk Event Secara offline Qr
export const sendTicketQr = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId)
      .populate('event')
      .populate({ path: 'user', model: 'User' });
    
    if (ticket.event.type == "online") {
      return res.status(400).json({ message: "Event bukan tipe offline" });
    }

    if (!ticket || ticket.status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Tiket tidak valid atau belum dibayar.',
      });
    }

    const ticketsDir = path.join(process.cwd(), 'tickets');
    const pdfPath = path.join(ticketsDir, `${ticket._id}.pdf`);

    if (!fs.existsSync(ticketsDir)) {
      fs.mkdirSync(ticketsDir, { recursive: true });
    }

    await generateTicketPdf(ticket, pdfPath);

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: ticket.user.email,
      subject: `E-Ticket Anda: ${ticket.event.name}`,
      text: `Berikut adalah e-ticket Anda untuk event "${ticket.event.name}".`,
      attachments: [
        {
          filename: `${ticket._id}.pdf`,
          path: pdfPath,
        },
      ],
    };

    await transporter.sendMail(mailOption);

    fs.unlink(pdfPath, (err) => {
      if (err) console.error('Gagal hapus file PDF:', err);
    });

    return res.status(200).json({
      success: true,
      message: 'Tiket berhasil dikirim ke email.',
    });

  } catch (error) {
    console.error('Gagal kirim tiket:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengirim tiket.',
      error: error.message,
    });
  }
};


export const sendTicketOnline = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId)
      .populate("event")
      .populate({ path: 'user', model: 'User' });

    if (!ticket || !ticket.event || !ticket.user) {
      throw new Error("Data tiket, event, atau user tidak ditemukan");
    }

    if (ticket.event.type !== "online") {
      throw new Error("Event bukan tipe online");
    }

    if (!ticket.user.email) {
      throw new Error("Email user tidak tersedia");
    }

    const eventName = ticket.event.name;
    const eventDate = new Date(ticket.event.date).toLocaleString("id-ID");
    const zoomLink = ticket.event.location;

    const pdfPath = path.resolve(`./temp/ticket_${ticket._id}.pdf`);
    await generateLinkPdf(ticket, pdfPath);

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: ticket.user.email,
      subject: `E-Ticket Anda: ${eventName}`,
      text: `Halo ${ticket.user.name},\n\nTerima kasih telah mendaftar pada event "${eventName}".\n\nDetail Event:\n- Tanggal: ${eventDate}\n- Jumlah Tiket: ${ticket.quantity}\n- Link Zoom: ${zoomLink}\n\nE-ticket Anda terlampir dalam email ini.\n\nSalam,\nTim Event App`,
      attachments: [
        {
          filename: `E-Ticket_${eventName.replace(/\s+/g, "_")}.pdf`,
          path: pdfPath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    fs.unlink(pdfPath, (err) => {
      if (err) {
        console.warn("Gagal menghapus file PDF sementara:", err.message);
      }
    });
     return res.status(200).json({
      success: true,
      message: 'Tiket berhasil dikirim ke email.',
    });

  } catch (error) {
    console.error("Gagal mengirim email e-ticket:", error.message);
    throw error;
  }
};