const express = require('express');
const repService = require('../services/reportService');
const router = express.Router();

router.get('/report/download', (req, res) => {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');

    const doc = repService.pdfGenerator();
    doc.pipe(res);
});

router.get('/report/csvdownload', (req, res) => {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="report.csv"');
    const csvRecords = repService.csvGenerator();
    res.send(csvRecords);
});

module.exports = router;