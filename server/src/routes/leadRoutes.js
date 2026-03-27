const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createLead,
  getLeads,
  updateLeadStatus,
  getDashboardMetrics,
} = require("../controllers/leadController");

const router = express.Router();

router.post("/", authMiddleware, createLead);
router.get("/metrics", authMiddleware, getDashboardMetrics);
router.get("/", authMiddleware, getLeads);
router.patch("/:id/status", authMiddleware, updateLeadStatus);

module.exports = router;