//pdf report generator
const PDFDocument = require('pdfkit');
function pdfGenerator(){
    //creating instance
    const doc = new PDFDocument();  
    doc.fontSize(12).text('meow');
    doc.end();
    return doc;
}

module.exports = { pdfGenerator };