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
