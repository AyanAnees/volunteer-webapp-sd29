//pdf report generator
const PDFDocument = require('pdfkit');
function pdfGenerator(){
    //creating instance
    const doc = new PDFDocument();
    //insert text here  
    doc.fontSize(12).text('meow');
    doc.end();
    return doc;
}

const stringify = require('csv-writer').createArrayCsvStringifier;
function csvGenerator(){
    const csvStringified = stringify({
        header: ['NAME', 'LANGUAGE']
        });
     
    const records = [
        ['Bob',  'French, English'],
        ['Mary', 'English']
    ];

    const csvRecords = csvStringified.getHeaderString() + csvStringified.stringifyRecords(records);
    return csvRecords;
}

module.exports = { pdfGenerator, csvGenerator};