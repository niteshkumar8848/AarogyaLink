const express = require('express');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { flowReport, consultationReport, queueMetricsReport, revenueReport } = require('../controllers/reportController');

const router = express.Router();

router.get('/flow', auth, roleGuard('admin'), flowReport);
router.get('/consultations', auth, roleGuard('admin'), consultationReport);
router.get('/queue-metrics', auth, roleGuard('admin'), queueMetricsReport);
router.get('/revenue', auth, roleGuard('admin'), revenueReport);

module.exports = router;
