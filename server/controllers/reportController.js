const { getFlowReport, getConsultationStats, getQueueMetrics, getRevenueReport } = require('../services/reportService');

const flowReport = async (req, res) => {
  try {
    const data = await getFlowReport(req.query);
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate patient flow report', error: error.message });
  }
};

const consultationReport = async (req, res) => {
  try {
    const data = await getConsultationStats();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate consultation report', error: error.message });
  }
};

const queueMetricsReport = async (req, res) => {
  try {
    const data = await getQueueMetrics();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate queue metrics report', error: error.message });
  }
};

const revenueReport = async (req, res) => {
  try {
    const data = await getRevenueReport();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate revenue report', error: error.message });
  }
};

module.exports = {
  flowReport,
  consultationReport,
  queueMetricsReport,
  revenueReport
};
