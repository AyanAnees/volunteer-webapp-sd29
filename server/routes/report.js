const express = require('express');
const router = express.Router();
//const pdfService = require('')
const reportService = express.Router('../services/reportService');
/*
router.get('/report/download', (req, res) => {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');

    const doc = pdfService.pdfGenerator();
    doc.pipe(res);
});

module.exports = router;

*/

router.get('/', async (req, res) => {
    try {
      const filters = req.query; // Get filters from query params
      const result = await reportService.getEventReport(filters);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get event statistics
  router.get('/stats', async (req, res) => {
    try {
      const result = await reportService.getEventStatistics();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  module.exports = router;
 