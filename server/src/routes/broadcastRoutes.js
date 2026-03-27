const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  sendBroadcast,
  getBroadcastHistory,
} = require("../controllers/broadcastController");

const router = express.Router();

router.post("/send", authMiddleware, sendBroadcast);
router.get("/history", authMiddleware, getBroadcastHistory);

module.exports = router;