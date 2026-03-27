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
router.get("/", authMiddleware, getLeads);
router.get("/dashboard/metrics", authMiddleware, getDashboardMetrics);
router.patch("/:id/status", authMiddleware, updateLeadStatus);

module.exports = router;