<<<<<<< HEAD
import Ticket from '../models/ticketModel.js';

export const verifyQrScan = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token QR tidak ditemukan.',
    });
  }

  try {
    // Verifikasi JWT dengan secret key
    const decoded = jwt.verify(token, JWT_SECRET);

    const { ticketId, userId, eventId } = decoded;

    // Cari tiket dengan detail lengkap yang sudah dibayar
    const ticket = await Ticket.findOne({
      _id: ticketId,
      user: userId,
      event: eventId,
      status: 'paid',
    }).populate('user').populate('event');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Tiket tidak valid, tidak ditemukan, atau belum dibayar.',
      });
    }

    // Cek apakah tiket sudah discan sebelumnya
    if (ticket.isScanned) {
      return res.status(400).json({
        success: false,
        message: 'Tiket ini sudah digunakan sebelumnya.',
        data: {
          ticketId: ticket._id,
          user: ticket.user.email || ticket.user.name,
          scannedAt: ticket.updatedAt,
        },
      });
    }

    // Tandai tiket sebagai sudah discan
    ticket.isScanned = true;
    ticket.status = 'Used'; 
    ticket.verifiedByCreator = true; 
    await ticket.save();

    return res.status(200).json({
      success: true,
      message: 'QR Code valid, tiket berhasil diverifikasi.',
      data: {
        ticketId: ticket._id,
        event: {
          title: ticket.event.title,
          location: ticket.event.location,
          startTime: ticket.event.startTime,
          eventDate: ticket.eventDate, 
        },
        user: {
          id: ticket.user._id,
          name: ticket.user.name,
          email: ticket.user.email,
        },
        quantity: ticket.quantity, 
        price: ticket.price, 
        total: ticket.total, 
        scannedAt: ticket.updatedAt,
      },
    });

  } catch (err) {
    console.error('QR Verification Error:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token QR sudah kedaluwarsa.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token QR tidak valid atau sudah kedaluwarsa.',
      error: err.message,
    });
  }
=======
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import Ticket from '../models/ticketModel.js';

const JWT_SECRET = process.env.QR_SECRET;

export const generateTicketQr = async (req, res) => {

  try {
    const { ticketId } = req.params;

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: 'Parameter ticketId tidak ditemukan.',
      });
    }

    const ticket = await Ticket.findById(ticketId)
      .populate('event')
      .populate('user');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Tiket tidak ditemukan.',
      });
    }

    if (ticket.status == 'Used') {
      return res.status(400).json({
        success: false,
        message: 'Tiket sudah digunakan.',
      });
    }

    if (ticket.status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Tiket belum dibayar.',
      });
    }

    const payload = {
      ticketId: ticket._id.toString(),
      userId: ticket.user._id.toString(),
      eventId: ticket.event._id.toString(),
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
  
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app'; 
    const url = `${baseUrl}/api/qr/verify-qr?token=${encodeURIComponent(token)}`;

    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      margin: 1,
      scale: 6,
    });

    return res.status(200).json({
      success: true,
      message: 'QR Code berhasil dibuat',
      data: {
        qrCode: qrCodeDataUrl,
        url,
        ticketId: ticket._id,
      },
    });
  } catch (error) {
    console.error('Error generating QR:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghasilkan QR Code',
      error: error.message,
    });
  }
}


export const verifyQrScan = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token QR tidak ditemukan.',
    });
  }

  try {
    // Verifikasi JWT dengan secret key
    const decoded = jwt.verify(token, JWT_SECRET);

    const { ticketId, userId, eventId } = decoded;

    // Cari tiket dengan detail lengkap yang sudah dibayar
    const ticket = await Ticket.findOne({
      _id: ticketId,
      user: userId,
      event: eventId,
      status: 'paid',
    }).populate('user').populate('event');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Tiket tidak valid, tidak ditemukan, atau belum dibayar.',
      });
    }

    // Cek apakah tiket sudah discan sebelumnya
    if (ticket.isScanned) {
      return res.status(400).json({
        success: false,
        message: 'Tiket ini sudah digunakan sebelumnya.',
        data: {
          ticketId: ticket._id,
          user: ticket.user.email || ticket.user.name,
          scannedAt: ticket.updatedAt,
        },
      });
    }

    // Tandai tiket sebagai sudah discan
    ticket.isScanned = true;
    ticket.status = 'Used'; 
    ticket.verifiedByCreator = true; 
    await ticket.save();

    return res.status(200).json({
      success: true,
      message: 'QR Code valid, tiket berhasil diverifikasi.',
      data: {
        ticketId: ticket._id,
        event: {
          title: ticket.event.title,
          location: ticket.event.location,
          startTime: ticket.event.startTime,
          eventDate: ticket.eventDate, 
        },
        user: {
          id: ticket.user._id,
          name: ticket.user.name,
          email: ticket.user.email,
        },
        quantity: ticket.quantity, 
        price: ticket.price, 
        total: ticket.total, 
        scannedAt: ticket.updatedAt,
      },
    });

  } catch (err) {
    console.error('QR Verification Error:', err.message);
    return res.status(401).json({
      success: false,
      message: 'Token QR tidak valid atau sudah kedaluwarsa.',
      error: err.message,
    });
  }
>>>>>>> a86b8eb9da78aed4e980998d93a6e82ea1589e1a
};