import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

export const generateTicketPdf = async (ticket, outputPath) => {
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Cek direktori
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Tambahkan informasi tiket
  doc.fontSize(20).text('E-Ticket', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14);
  doc.text(`Nama: ${ticket.user.name}`);
  doc.text(`Email: ${ticket.user.email}`);
  doc.text(`Event: ${ticket.event.name}`);
  doc.text(`Tanggal: ${new Date(ticket.event.date).toLocaleDateString()}`);
  doc.text(`Lokasi: ${ticket.event.location}`);
  doc.moveDown();

  // Buat token QR
  const qrToken = {
    ticketId: ticket._id.toString(),
    userId: ticket.user._id.toString(),
    eventId: ticket.event._id.toString(),
  };

  const token = jwt.sign(qrToken, process.env.QR_SECRET, { expiresIn: '1d' });
  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/qr/verify-qr?token=${encodeURIComponent(token)}`;
  const qrDataUrl = await QRCode.toDataURL(qrUrl);

  // Tambahkan QR ke PDF
  doc.image(qrDataUrl, { fit: [200, 200], align: 'center' });
  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
};