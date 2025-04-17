const express = require('express');
const pdfService = require('../services/reportService')
const router = express.Router();

router.get('/report/download', (req, res) => {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');

    const doc = pdfService.pdfGenerator();
    doc.pipe(res);
});

module.exports = router;