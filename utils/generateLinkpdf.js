import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateLinkPdf = async (ticket, outputPath) => {
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Pastikan direktori ada
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Header
  doc.fontSize(20).text('E-Ticket', { align: 'center' });
  doc.moveDown();

  // Detail Tiket
  doc.fontSize(14);
  doc.text(`Nama: ${ticket.user.name}`);
  doc.text(`Email: ${ticket.user.email}`);
  doc.text(`Event: ${ticket.event.name}`);
  doc.text(`Tanggal: ${new Date(ticket.event.date).toLocaleDateString('id-ID')}`);
  doc.text(`Lokasi: ${ticket.event.location}`);
  doc.text(`Jumlah Tiket: ${ticket.quantity}`);
  doc.moveDown();

  // Catatan tambahan
  doc.fontSize(14).text('Terimakasih telah Membeli Tiket.', {
    align: 'center',
  });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
};
