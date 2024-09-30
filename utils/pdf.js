const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const OUT_FILE = "./output/";

function createPDF(text, filename) {
    const doc = new PDFDocument();
    const pdfFileName = path.basename(filename, path.extname(filename)) + '.pdf';
    doc.pipe(fs.createWriteStream(`${OUT_FILE}/${pdfFileName}`));
    doc.font('font/Roboto-Regular.ttf')
        .fontSize(14)
        .text(text, 100, 100);
    doc.end();
    return OUT_FILE;
}

module.exports = {
    createPDF
}